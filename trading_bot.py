from schwab.schwab_api import Schwab

    
if __name__ == '__main__':
    print("Automated Robot Connecting To API's...")
    schwab = Schwab()
    schwab.initialize()
    schwab.update_tokens_automatic()
    print("Schwab API Authenticated")
