import sys
import threading
from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QHBoxLayout, QWidget, QTextEdit, QLabel, QTableWidget, QTableWidgetItem, QHeaderView
from PyQt5.QtCore import QThread, pyqtSignal, QTimer
from datetime import datetime, timedelta
from data.data_manager import DataManager
from schwab.schwab_api import Schwab
from strategy import high_open_interest


class TradingBot(QThread):
    log_signal = pyqtSignal(str)
    position_signal = pyqtSignal(str)
    order_signal = pyqtSignal(dict)

    def __init__(self):
        super().__init__()
        self.is_running = False
    #     self.CALLEVENT = get_call_event()
    #     self.PUTEVENT = get_put_event()

    # def run(self):
    #     self.is_running = True
    #     self.log_signal.emit("Trading bot started")
        

    #     self.log_signal.emit("Automated Robot Connecting To API's...")
    #     schwab_api.initialize()
    #     schwab_api.updateTokensAutomatic()
    #     self.log_signal.emit("Schwab API Authenticated")
    #     gmail_initialize()
    #     self.log_signal.emit("Gmail API Authenticated")

    #     self.log_signal.emit("Initiate Trading Bot...")
    #     start_scrapping()
        
    #     # threading.Thread(target=self.callEventHandler, daemon=True).start()
    #     # threading.Thread(target=self.putEventHandler, daemon=True).start()

    #     bot = TradingBot()
    #     bot.start()

        
    #     while self.is_running:
    #         current_position = get_current_position()
    #         self.position_signal.emit(current_position if current_position else "No position")
    #         self.check_orders()
    #         self.sleep(1)

    def stop(self):
        self.is_running = False
        self.log_signal.emit("Trading bot stopped")


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Options Trading Bot")
        self.setGeometry(100, 100, 800, 600)

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        
        self.layout = QVBoxLayout(self.central_widget)
        
        self.create_control_panel()
        self.create_position_display()
        self.create_order_table()
        self.create_log_display()

        self.trading_bot = TradingBot()
        self.trading_bot.log_signal.connect(self.log_message)
        self.trading_bot.position_signal.connect(self.update_position)
        self.trading_bot.order_signal.connect(self.update_order_table)

    def create_control_panel(self):
        control_layout = QHBoxLayout()
        
        self.start_button = QPushButton("Start Bot")
        self.start_button.clicked.connect(self.start_bot)
        control_layout.addWidget(self.start_button)

        self.stop_button = QPushButton("Stop Bot")
        self.stop_button.clicked.connect(self.stop_bot)
        self.stop_button.setEnabled(False)
        control_layout.addWidget(self.stop_button)

        self.layout.addLayout(control_layout)

    def create_position_display(self):
        self.position_label = QLabel("Current Position: No position")
        self.layout.addWidget(self.position_label)

    def create_order_table(self):
        self.order_table = QTableWidget(0, 4)
        self.order_table.setHorizontalHeaderLabels(["Symbol", "Type", "Status", "Price"])
        self.order_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.layout.addWidget(self.order_table)

    def create_log_display(self):
        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        self.layout.addWidget(self.log_text)

    def start_bot(self):
        self.trading_bot.start()
        self.start_button.setEnabled(False)
        self.stop_button.setEnabled(True)

    def stop_bot(self):
        self.trading_bot.stop()
        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)

    def log_message(self, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.log_text.append(f"[{timestamp}] {message}")

    def update_position(self, position):
        self.position_label.setText(f"Current Position: {position}")

    def update_order_table(self, order):
        row_position = self.order_table.rowCount()
        self.order_table.insertRow(row_position)
        
        self.order_table.setItem(row_position, 0, QTableWidgetItem(order.get('symbol', '')))
        self.order_table.setItem(row_position, 1, QTableWidgetItem(order.get('orderType', '')))
        self.order_table.setItem(row_position, 2, QTableWidgetItem(order.get('status', '')))
        self.order_table.setItem(row_position, 3, QTableWidgetItem(str(order.get('price', ''))))

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())