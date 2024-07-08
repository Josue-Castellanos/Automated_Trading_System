import sys
import json
import threading
from PyQt5.QtWidgets import QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel, QTextEdit, QTabWidget, QLineEdit, QGridLayout
from PyQt5.QtCore import QThread, pyqtSignal
from datetime import datetime, timedelta
from gmail.gmail_api import Gmail
from data.data_manager import DataManager
from schwab.schwab_api import Schwab
from strategy import high_open_interest
import time

class BotThread(QThread):
    log_signal = pyqtSignal(str)
    log_dict_signal = pyqtSignal(dict)
    position_update_signal = pyqtSignal(str)
    trade_update_signal = pyqtSignal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.CALL_STRIKES, self.PUT_STRIKES = high_open_interest.retrieveData()
        self.YESTERDAY = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        self.TODAY = datetime.now().strftime("%Y-%m-%d")
        self.FRIDAY = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        self.SATURDAY = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
        self.TOMORROW = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        self.schwab = Schwab(log_signal=self.log_signal)
        self.gmail = Gmail(log_signal=self.log_signal)
        self.database = DataManager()

    def run(self):
        self.log_signal.emit("Automata Robot Connecting To API's...")
        self.schwab.initialize()
        self.schwab.update_tokens_automatic()
        self.log_signal.emit("Schwab API Authenticated")
        self.gmail.initialize()
        self.log_signal.emit("Gmail API Authenticated")

        # Make a Database in sql and authenticate the account here
        self.database.create_dataframe('high_oi', self.CALL_STRIKES)
        self.database.create_dataframe('high_oi', self.PUT_STRIKES)

        self.log_signal.emit("Start Scrapping For Alerts...")
        self.gmail.check_email_automatic()
        threading.Thread(target=self.handleCallEvent, daemon=True).start()
        threading.Thread(target=self.handlePutEvent, daemon=True).start()

    def handlePutEvent(self):
        while True:
            self.gmail.get_put_event().wait()
            current_position = self.gmail.get_current_position()
            self.log_signal.emit(f"PUT signal received. Current position: {current_position}")

            if current_position == 'PUT':
                # self._check_in_position()
                best_put_contract = self._best_contract('PUT')
                if best_put_contract is not None:
                    self._get_in_position(best_put_contract, 'P')
                self.gmail.reset_position()
            else:
                self.log_signal.emit("Ignoring PUT signal due to existing PUT position")
            self.gmail.get_put_event().clear()

    def handleCallEvent(self):
        while True:
            self.gmail.get_call_event().wait()
            current_position = self.gmail.get_current_position()
            self.log_signal.emit(f"CALL signal received. Current position: {current_position}")

            if current_position == 'CALL':
                # self._check_in_position()
                best_call_contract = self._best_contract('CALL')
                if best_call_contract is not None:
                    self._get_in_position(best_call_contract, 'C')
                self.gmail.reset_position()
            else:
                self.log_signal.emit("Ignoring CALL signal due to existing CALL position")
            self.gmail.get_call_event().clear()

    def _best_contract(self, type):
        self.log_signal.emit(f"Searching for best {type} contract...")
        options = self.schwab.get_chains('SPY', type, '7', 'TRUE', '', '', '', 'OTM', self.TOMORROW, self.TOMORROW).json()
        strike_price_df = self.database.create_dataframe('options', options)

        if type == 'PUT':
            filtered_delta_result = strike_price_df.loc[strike_price_df['Delta'] <= -0.18]
        elif type == 'CALL':
            filtered_delta_result = strike_price_df.loc[strike_price_df['Delta'] >= 0.18]

        filtered_ask_result = filtered_delta_result.loc[filtered_delta_result['Ask'] <= 0.46]

        if not filtered_ask_result.empty:
            contract = filtered_ask_result.iloc[0]
            buy_order = self._create_order(contract.get('Ask'), contract.get('Symbol'), 'BUY')
            return buy_order
        else:
            self.log_signal.emit("ERROR: No contracts met conditions, ignore signal")
            return None

    def _get_in_position(self, order, type):
        self.log_signal.emit(f"Getting in Call position...")
        hash = self.schwab.account_numbers().json()[0].get('hashValue')
        try:
            post_order = self.schwab.post_orders(order, accountNumber=hash)
        except json.decoder.JSONDecodeError:
            self.log_signal.emit(f"{post_order.status_code}: Order placed")

        self.log_signal(post_order.json())
        order_id = post_order.headers.get('Location', '/').split('/')[-1]
        self.log_signal(order_id)
        self.database.create_dataframe('order', order)

        while True:
            time.sleep(30)
            inPosition = True
            # This is where I can test the differenet 
            orders = self.schwab.get_orders(1, self.TODAY, self.FRIDAY, accountNumber=hash, status='FILLED').json()
            order_ids = [order["orderId"] for order in orders]

            if not order_ids:
                break

            for order_id in order_ids:
                contract = self.schwab.get_order_id(order_id, accountNumber=hash).json()
                price = contract["price"]

                for leg in contract["orderLegCollection"]:
                    symbol = leg["instrument"]["symbol"]
                    self.log_signal.emit(f"Symbol: {symbol}, Price: {price}")

                    if type == symbol[12:13]:
                        if price >= price * 1.5 or price <= price * 0.3:
                            sell_order = self._create_order(price, symbol, 'SELL')
                            self.schwab.post_orders(sell_order, accountNumber=hash).json()
                            self.trade_update_signal.emit(f"Sold {symbol} at {price}")
                            break
                    else:
                        inPosition = False
                        break
                if not inPosition:
                    break
            if not inPosition:
                break

    def _check_in_position(self):
        self.log_signal.emit("Checking current position")
        hash = self.schwab.account_numbers().json()[0].get('hashValue')
        # resp = client.order_place(account_hash, order)
        # print("|\n|client.order_place(account_hash, order).json()", end="\n|")
        # print(f"Response code: {resp}") 
        # # get the order ID - if order is immediately filled then the id might not be returned
        # order_id = resp.headers.get('location', '/').split('/')[-1] 
        # print(f"Order id: {order_id}")

        # # get specific order details
        # print("|\n|client.order_details(account_hash, order_id).json()", end="\n|")
        # print(client.order_details(account_hash, order_id).json())

        orders = self.schwab.account_number(hash, "positions").json()
        try:
            symbol = orders["securitiesAccount"]["positions"][0]["instrument"]["symbol"]
            self.log_dict_signal.emit(symbol)
        except KeyError as e:
            self.log_signal(f"{e}")

    def _create_order(self, price, symbol, type):
        # Read the settings.txt file and apply the settings of quantity and risk % of account
        # Add a way to check balance here and check if you have used a certain % of account already.
        # Total balance, Risk Target Balance, Current Balance
        order = {
            'orderType': 'LIMIT',
            'session': 'NORMAL',
            'price': price,
            'duration': 'DAY',
            'orderStrategyType': 'SINGLE',
            'orderLegCollection': [{
                'instruction': f'{type}_TO_OPEN',
                'quantity': 1,
                'instrument': {
                    'symbol': symbol,
                    'assetType': 'OPTION'
                }
            }]
        }
        return order

class TradingBotGUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Trading Bot GUI")
        self.setGeometry(100, 100, 800, 600)

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.layout = QVBoxLayout(self.central_widget)

        self.tabs = QTabWidget()
        self.layout.addWidget(self.tabs)

        self.create_main_tab()
        self.create_logs_tab()
        self.create_settings_tab()

        self.bot_thread = None

    def create_main_tab(self):
        main_tab = QWidget()
        main_layout = QVBoxLayout(main_tab)

        # Status
        status_layout = QHBoxLayout()
        status_layout.addWidget(QLabel("Bot Status:"))
        self.status_label = QLabel("Stopped")
        status_layout.addWidget(self.status_label)
        main_layout.addLayout(status_layout)

        # Start/Stop button
        self.start_stop_button = QPushButton("Start Bot")
        self.start_stop_button.clicked.connect(self.toggle_bot)
        main_layout.addWidget(self.start_stop_button)

        # Current positions
        main_layout.addWidget(QLabel("Current Positions:"))
        self.positions_text = QTextEdit()
        self.positions_text.setReadOnly(True)
        main_layout.addWidget(self.positions_text)

        # Recent trades
        main_layout.addWidget(QLabel("Recent Trades:"))
        self.trades_text = QTextEdit()
        self.trades_text.setReadOnly(True)
        main_layout.addWidget(self.trades_text)

        self.tabs.addTab(main_tab, "Main")

    def create_logs_tab(self):
        logs_tab = QWidget()
        logs_layout = QVBoxLayout(logs_tab)

        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        logs_layout.addWidget(self.log_text)

        self.tabs.addTab(logs_tab, "Logs")

    def create_settings_tab(self):
        settings_tab = QWidget()
        settings_layout = QGridLayout(settings_tab)

        settings_layout.addWidget(QLabel("Max Position Size:"), 0, 0)
        self.max_position_size = QLineEdit()
        self.max_position_size.setText("1")  # Default value
        settings_layout.addWidget(self.max_position_size, 0, 1)

        settings_layout.addWidget(QLabel("Max Loss Percentage:"), 1, 0)
        self.max_loss_percentage = QLineEdit()
        self.max_loss_percentage.setText("30")  # Default value
        settings_layout.addWidget(self.max_loss_percentage, 1, 1)

        save_button = QPushButton("Save Settings")
        save_button.clicked.connect(self.save_settings)
        settings_layout.addWidget(save_button, 2, 0, 1, 2)

        self.tabs.addTab(settings_tab, "Settings")

    def toggle_bot(self):
        if self.status_label.text() == "Stopped":
            self.start_bot()
        else:
            self.stop_bot()

    def start_bot(self):
        self.status_label.setText("Running")
        self.start_stop_button.setText("Stop Bot")
        self.log("Bot started")
        
        self.bot_thread = BotThread(self)
        self.bot_thread.log_dict_signal.connect(self.log)
        self.bot_thread.log_signal.connect(self.log)
        self.bot_thread.position_update_signal.connect(self.update_positions)
        self.bot_thread.trade_update_signal.connect(self.update_trades)
        self.bot_thread.start()

    def stop_bot(self):
        self.status_label.setText("Stopped")
        self.start_stop_button.setText("Start Bot")
        self.log("Bot stopped")
        
        if self.bot_thread and self.bot_thread.isRunning():
            self.bot_thread.requestInterruption()
            self.bot_thread.wait()

    def log(self, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.log_text.append(f"[{timestamp}] {message}")

    def save_settings(self):
        max_position = self.max_position_size.text()
        max_loss = self.max_loss_percentage.text()
        self.log(f"Settings saved: Max Position Size = {max_position}, Max Loss Percentage = {max_loss}%")

    def update_positions(self, positions):
        self.positions_text.append(positions)

    def update_trades(self, trades):
        self.trades_text.append(trades)

def main():
    app = QApplication(sys.argv)
    gui = TradingBotGUI()
    gui.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()