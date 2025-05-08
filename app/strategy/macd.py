
# MACD Strategy
def macd(data, series, fast=12, slow=26, signal=9):
    data['emaFast'] = data[series].ewm(span=fast, adjust=False).mean()
    data['emaSlow'] = data[series].ewm(span=slow, adjust=False).mean()
    data['macd'] = data['emaFast'] - data['emaSlow']
    data['signal'] = data['macd'].ewm(span=signal, adjust=False).mean()
    data['histogram'] = data['macd'] - data['signal']
    return data