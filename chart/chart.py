# chart_generator.py
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime

def generate_candlestick_chart(csv_file_path, output_file_path):
    # Load your CSV data
    df = pd.read_csv(csv_file_path, delimiter='\t')

    # Convert 'Datetime' column to datetime type
    df['Datetime'] = pd.to_datetime(df['Datetime'])

    # Create a candlestick chart
    fig = go.Figure(data=[go.Candlestick(
        x=df['Datetime'],
        open=df['Open'],
        high=df['High'],
        low=df['Low'],
        close=df['Close']
    )])

    # Update layout to be responsive
    fig.update_layout(
        title='Interactive Candlestick Chart',
        xaxis_title='Date',
        yaxis_title='Price',
        autosize=True,
        margin=dict(l=0, r=0, t=30, b=0),
        xaxis_rangeslider_visible=False,
        template='plotly_dark'
    )

    # Save the figure as an HTML file
    fig.write_html(output_file_path)
