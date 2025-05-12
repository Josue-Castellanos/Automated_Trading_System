def elder_ray_index(data, period=13):
    """Calculate Elder Ray Index (Bull Power and Bear Power)"""
    ray_ema = data["Close"].ewm(span=period).mean()
    data["bull_power"] = data["High"] - ray_ema
    data["bear_power"] = data["Low"] - ray_ema
    return data
