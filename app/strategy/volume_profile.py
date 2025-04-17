def volume_profile(data, lookback=20):
    """Calculate basic volume profile levels"""
    # Simplified volume profile, in production I might want a more custom approach
    data['vp_poc'] = data['Close'].rolling(lookback).apply(
        lambda x: x.value_counts().idxmax()
    )
    return data