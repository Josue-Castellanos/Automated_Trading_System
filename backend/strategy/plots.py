import matplotlib.pyplot as plt
import numpy as np




def plot_classic_pivots(df, pivots):
    """
    Plot classic pivot points.

    Args:
        df (pd.DataFrame): Original OHLC dataframe for x-axis.
        pivots (pd.DataFrame): Pivot points dataframe.
    """
    plt.figure(figsize=(14, 7))
    plt.plot(df.index, pivots['PP'], label='PP (Pivot Point)', linestyle='--', color='black')
    plt.plot(df.index, pivots['R1'], label='R1 (Resistance 1)', linestyle='--', color='red')
    plt.plot(df.index, pivots['S1'], label='S1 (Support 1)', linestyle='--', color='green')
    #plt.plot(df.index, pivots['R2'], label='R2 (Resistance 2)', linestyle='--', color='darkred')
    #plt.plot(df.index, pivots['S2'], label='S2 (Support 2)', linestyle='--', color='darkgreen')
    #plt.plot(df.index, pivots['R3'], label='R3 (Resistance 3)', linestyle='--', color='firebrick')
    #plt.plot(df.index, pivots['S3'], label='S3 (Support 3)', linestyle='--', color='seagreen')

    plt.title('Classic Pivot Points')
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.show()



def plot_open_interest(todays_data, symbol):
    call_data = todays_data.calls
    put_data = todays_data.puts


    fig, ax = plt.subplots(figsize=(15, 8))

    call_data_sorted = call_data.sort_values(by="openInterest", ascending=False)
    put_data_sorted = put_data.sort_values(by="openInterest", ascending=False)
    # filtered_calls = call_data_sorted[call_data_sorted['openInterest'] < 1000]
    # filtered_puts = put_data_sorted[put_data_sorted['openInterest'] < 1000]

    colors_calls = [
        "#E0ECFF",
        "#BFDFFF",
        "#80BFFF",
        "#408FFF",
        "#0066FF",
        "#0055CC",
        "#0044AA",
        "#003388",
        "#002266",
        "#001144",
    ]
    colors_puts = [
        "#FFE0F0",
        "#FFBFD4",
        "#FF80AA",
        "#FF4080",
        "#FF0055",
        "#CC0044",
        "#AA0036",
        "#880028",
        "#66001A",
        "#44000D",
    ]

    for i in range(7):
        # Plot Calls
        call_strike = call_data_sorted.iloc[i]["strike"]
        call_oi = call_data_sorted.iloc[i]["openInterest"]
        put_strike = put_data_sorted.iloc[i]["strike"]
        put_oi = put_data_sorted.iloc[i]["openInterest"]

        ax.axhline(
            y=call_strike,
            linestyle="-",
            color=colors_calls[i],
            label=f"Call_{i+1}: {call_strike}  OI: {call_oi}",
        )
        ax.annotate(
            f"{call_oi}",
            xy=(1, call_strike),
            xytext=(10, 0),
            textcoords="offset points",
            fontsize=10,
            color=colors_calls[i],
            ha="left",
            va="center",
        )
        ax.axhline(
            y=put_strike,
            linestyle="-",
            color=colors_puts[i],
            label=f"Put_{i+1}: {put_strike}  OI: {put_oi}",
        )
        ax.annotate(
            f"{put_oi}",
            xy=(1, put_strike),
            xytext=(10, 0),
            textcoords="offset points",
            fontsize=10,
            color=colors_puts[i],
            ha="left",
            va="center",
        )

    ax.set_ylabel("Strike Price")
    ax.set_title(f"Highest Open Interest Volume Levels: {symbol}")

    # Reorder legend entries by strike (descending)
    handles, labels = ax.get_legend_handles_labels()
    handles_labels_sorted = sorted(
        zip(handles, labels),
        key=lambda hl: float(hl[1].split()[1]),  # extract strike value from label
        reverse=True
    )
    handles, labels = zip(*handles_labels_sorted)
    ax.legend(handles, labels)

    
    plt.show()



def plot_persons_pivots(df, pivots):
    """
    Plot RR, PP, SS pivot lines.
    
    Args:
        df (pd.DataFrame): original OHLC DataFrame (for x-axis)
        pivots (pd.DataFrame): DataFrame with 'RR', 'PP', 'SS' columns indexed same as df
    """
    plt.figure(figsize=(14, 7))
    plt.plot(df.index, pivots['PP'], label='PP (Pivot Point)', linestyle='--', color='black')
    plt.plot(df.index, pivots['RR'], label='RR (Resistance)', linestyle='--', color='red')
    plt.plot(df.index, pivots['SS'], label='SS (Support)', linestyle='--', color='green')

    plt.title('Persons Pivots: RR, PP, SS')
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.show()


def plot_fibonacci(df_res):
    """
    Plots Fibonacci retracement levels from a pre-calculated DataFrame.
    """

    plt.figure(figsize=(14, 8))
    plt.plot(df_res.index, df_res['Close'], label='Close', color='black')

    # Dynamic 50% fib coloring
    fib50_colors = df_res['is_above_50'].map({True: 'cyan', False: 'magenta'})
    for i in range(len(df_res) - 1):
        plt.plot(df_res.index[i:i+2], df_res['fib50'].iloc[i:i+2],
                 '--', color=fib50_colors.iloc[i], linewidth=2)
        
    plt.plot(df_res.index, df_res['fib61_8'], '--', label='Fib 61.8% (Above)', color='green')
    plt.plot(df_res.index, df_res['fib38_2'], '--', label='Fib 38.2% (Below)', color='red')

    plt.title("Dynamic Fibonacci Levels")
    plt.xlabel("Time")
    plt.ylabel("Price")
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.show()


def plot_ichimoku(df, label_freq=10):
    """
    Plot Ichimoku lines with candlestick timestamps as x-axis ticks.
    
    Args:
        df (pd.DataFrame): Must have datetime index.
        label_freq (int): Show timestamp labels every N candles to reduce clutter.
    """
    plt.figure(figsize=(14, 8))

    plt.plot(df.index, df['Close'], color='black', label='Close')
    # plt.plot(df.index, df['tenkan'], color='skyblue', label='Tenkan')
    # plt.plot(df.index, df['kijun'], color='violet', label='Kijun')
    #plt.plot(df.index, df['span_a'], color='gray', label='Span A')
    plt.plot(df.index, df['span_b'], color='magenta', label='Span B')
    #plt.plot(df.index, df['chikou'], color='green', label='Chikou')

    plt.legend()
    plt.title("Ichimoku Lines")
    plt.xlabel("Timestamp (Pacific Time)")
    plt.ylabel("Price")
    plt.grid(True, linestyle="--", alpha=0.6)

    ax = plt.gca()

    # Set ticks at every candle timestamp
    ax.set_xticks(df.index)

    # Create labels: show timestamp every `label_freq` candles, else empty string
    labels = np.array([ts.strftime('%Y-%m-%d %H:%M') if i % label_freq == 0 else ''
                       for i, ts in enumerate(df.index)])
    
    ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=8)

    plt.tight_layout()
    plt.show()




def plot_ttm_squeeze_momentum(data):
    """
    Plot TTM Squeeze histogram.
    """
    plt.figure(figsize=(20, 6))
    timestamps = data.index.strftime("%H:%M")

    for i in range(len(data)):
        plt.bar(
            i,
            data["histogram"].iloc[i],
            color=data["momentum_color"].iloc[i],
            width=0.6,
            label="_nolegend_",
        )

    for i, (timestamp, row) in enumerate(data.iterrows()):
        # Plot momentum as a dot
        plt.scatter(i, row["momentum"], color=row["momentum_color"], label="_nolegend_")

        # Plot squeeze lines
        if row['squeeze_color'] == "white":
            plt.axvline(x=i, color='white', linestyle='--', linewidth=0.8, alpha=0.7)
            plt.scatter(i, 0, color=row['squeeze_color'], marker='o', s=10, label='Squeeze On')
        elif row['squeeze_color'] == "gold":
            plt.axvline(x=i, color='black', linestyle='--', linewidth=0.8, alpha=0.7)
            plt.scatter(i, 0, color=row['squeeze_color'], marker='o', s=10, label='Squeeze Mid')
        elif row['squeeze_color'] == "blue":
            plt.axvline(x=i, color='blue', linestyle='--', linewidth=0.8, alpha=0.7)
            plt.scatter(i, 0, color=row['squeeze_color'], marker='o', s=10, label='Squeeze Low')
        if row['squeeze_color'] is not None:
            plt.axvline(x=i, color='purple', linestyle='--', linewidth=0.8, alpha=0.7)
            plt.scatter(i, 0, color=row['squeeze_color'], marker='o', s=10, label='Squeeze On')

    plt.xticks(
        ticks=range(len(data)),
        labels=timestamps,
        rotation=45,
        fontsize=9
    )
    plt.axhline(0, color="gray", linestyle="--", linewidth=1)
    plt.xlabel("Timestamp (Pacific Time)")
    plt.ylabel("Momentum")
    plt.title(f"TTM Squeeze Histogram - SPY {data.index[0]}")
    plt.grid(True, linestyle="--", alpha=0.6)
    plt.show()