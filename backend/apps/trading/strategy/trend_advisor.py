# api/services/trend_advisor.py
import numpy as np
import pandas as pd


class TrendAdvisorService:
    PHASES = {
        "Bullish": {
            "description": "Bullish trend begins with Higher Highs & Higher Lows (rising 200 PMA)",
            "sub_steps": [
                "Buy the dips, volume expands on breakouts, new highs",
                "Positive slope on both 50 and 200 PMA with accelerating momentum",
            ],
            "color": "#4CAF50",
            "conditions": {
                "50_slope": "positive",
                "200_slope": "positive",
                "price_relation": "above_both",
            },
        },
        "Accumulation": {
            "description": "Overhead resistance penetrated, buyers becoming aggressive",
            "sub_steps": [
                "New 60-period Higher Highs appearing",
                "50 PMA sloping up, 200 PMA sideways with upward bias",
            ],
            "color": "#8BC34A",
            "conditions": {
                "50_slope": "positive",
                "200_slope": "neutral",
                "price_relation": "above_50",
            },
        },
        "Recovery": {
            "description": "Bottoms forming, price registering Higher Lows",
            "sub_steps": [
                "Rising 50 PMA first sign of recovery",
                "50 PMA flat/sloping up while 200 PMA still downward",
            ],
            "color": "#CDDC39",
            "conditions": {
                "50_slope": "neutral_positive",
                "200_slope": "negative",
                "price_relation": "crossing_50",
            },
        },
        "Warning": {
            "description": "Tops forming, price registering Lower Highs",
            "sub_steps": [
                "Declining 50 PMA often leads to trend reversal",
                "50 PMA flat/sloping down while 200 PMA still upward",
            ],
            "color": "#FFC107",
            "conditions": {
                "50_slope": "neutral_negative",
                "200_slope": "positive",
                "price_relation": "crossing_50",
            },
        },
        "Distribution": {
            "description": "Selling dominates, support violated, declines setting up",
            "sub_steps": [
                "New 60-period Lower Lows appearing",
                "50 PMA sloping down, 200 PMA sideways with downward bias",
            ],
            "color": "#FF9800",
            "conditions": {
                "50_slope": "negative",
                "200_slope": "neutral",
                "price_relation": "below_50",
            },
        },
        "Bearish": {
            "description": "Bearish trend with Lower Lows & Lower Highs (falling 200 PMA)",
            "sub_steps": [
                "Sell the rallies, volume accelerates on new lows",
                "Negative slope on both 50 and 200 PMA",
            ],
            "color": "#F44336",
            "conditions": {
                "50_slope": "negative",
                "200_slope": "negative",
                "price_relation": "below_both",
            },
        },
    }

    @staticmethod
    def analyze_trend(data):
        df = pd.DataFrame(data["candles"])

        if len(df) < 200:  # Ensure enough data points for 200 MA
            return {
                "error": "Insufficient data points for analysis",
                "min_data_points_required": 200,
                "data_points_received": len(df),
            }

        if "datetime" in df.columns:
            df["time"] = df["datetime"]

        # Calculate indicators
        ma_50_values = df["close"].rolling(window=50).mean()
        ma_200_values = df["close"].rolling(window=200).mean()

        # Calculate slopes
        for ma, ma_values in [("50", ma_50_values), ("200", ma_200_values)]:
            df[f"MA_{ma}_slope"] = ma_values.rolling(window=20).apply(
                lambda x: np.polyfit(range(20), x, 1)[0]
                if not all(pd.isna(x))
                else float("nan"),
                raw=True,
            )

        # Handle NaN values in current data
        current = {
            "close": float(df["close"].iloc[-1]),
            "ma_50": float(ma_50_values.iloc[-1])
            if not pd.isna(ma_50_values.iloc[-1])
            else None,
            "ma_200": float(ma_200_values.iloc[-1])
            if not pd.isna(ma_200_values.iloc[-1])
            else None,
            "ma_50_slope": float(df["MA_50_slope"].iloc[-1])
            if not pd.isna(df["MA_50_slope"].iloc[-1])
            else None,
            "ma_200_slope": float(df["MA_200_slope"].iloc[-1])
            if not pd.isna(df["MA_200_slope"].iloc[-1])
            else None,
        }

        # Determine phase
        phase, step = TrendAdvisorService._determine_phase(current)

        # Prepare response
        phase_info = TrendAdvisorService.PHASES[phase].copy()
        phase_info.update(
            {
                "name": phase,
                "current_step": step,
                "current_price": current["close"],
                "ma_50": current["ma_50"],
                "ma_200": current["ma_200"],
                "ma_50_slope": current["ma_50_slope"],
                "ma_200_slope": current["ma_200_slope"],
                "options": TrendAdvisorService._get_options_strategy(phase, step),
                "zdte": TrendAdvisorService._get_zdte_strategy(phase),
            }
        )

        # Format indicators with proper NaN handling
        indicators = {
            "MA_50": [
                {
                    "time": int(row["time"]),
                    "value": round(float(value), 4) if not pd.isna(value) else None,
                }
                for row, value in zip(df.to_dict("records"), ma_50_values)
            ],
            "MA_200": [
                {
                    "time": int(row["time"]),
                    "value": round(float(value), 4) if not pd.isna(value) else None,
                }
                for row, value in zip(df.to_dict("records"), ma_200_values)
            ],
        }

        # Convert DataFrame to dict with NaN handling
        price_data = []
        for record in df.to_dict("records"):
            cleaned_record = {}
            for key, value in record.items():
                if pd.api.types.is_float(value) and pd.isna(value):
                    cleaned_record[key] = None
                elif pd.api.types.is_float(value):
                    cleaned_record[key] = float(value)
                else:
                    cleaned_record[key] = value
            price_data.append(cleaned_record)

        return {"phase": phase_info, "price_data": price_data, "indicators": indicators}

    @staticmethod
    def _determine_phase(current):
        def get_slope_condition(slope_value):
            if slope_value is None:
                return "neutral"
            if slope_value > 0.005:
                return "positive"
            elif slope_value < -0.005:
                return "negative"
            elif slope_value > 0:
                return "neutral_positive"
            else:
                return "neutral_negative"

        current_50_slope = get_slope_condition(current["ma_50_slope"])
        current_200_slope = get_slope_condition(current["ma_200_slope"])

        # Safely handle None values in price comparisons
        ma_50 = current["ma_50"] if current["ma_50"] is not None else float("-inf")
        ma_200 = current["ma_200"] if current["ma_200"] is not None else float("-inf")
        price = current["close"]

        # Determine price relation with safe comparisons
        if price > ma_50 and price > ma_200:
            price_relation = "above_both"
        elif price > ma_50 and price <= ma_200:
            price_relation = "above_50"
        elif price <= ma_50 and price > ma_200:
            price_relation = "below_50_above_200"
        else:
            price_relation = "below_both"

        # Match against phase conditions
        for phase, info in TrendAdvisorService.PHASES.items():
            conditions = info["conditions"]

            # Check slope conditions
            slope_match = True
            for ma, expected in [
                ("50", conditions["50_slope"]),
                ("200", conditions["200_slope"]),
            ]:
                current_slope = current_50_slope if ma == "50" else current_200_slope

                if expected == "positive" and not current_slope.startswith("positive"):
                    slope_match = False
                elif expected == "negative" and not current_slope.startswith(
                    "negative"
                ):
                    slope_match = False
                elif expected == "neutral" and (
                    current_slope.startswith("positive")
                    or current_slope.startswith("negative")
                ):
                    slope_match = False

            # Check price relation
            price_match = False
            if (
                conditions["price_relation"] == "above_both"
                and price_relation == "above_both"
            ):
                price_match = True
            elif conditions["price_relation"] == "above_50" and price_relation in [
                "above_50",
                "above_both",
            ]:
                price_match = True
            elif conditions["price_relation"] == "below_50" and price_relation in [
                "below_50_above_200",
                "below_both",
            ]:
                price_match = True
            elif (
                conditions["price_relation"] == "below_both"
                and price_relation == "below_both"
            ):
                price_match = True
            elif conditions["price_relation"] == "crossing_50" and price_relation in [
                "above_50",
                "below_50_above_200",
            ]:
                price_match = True

            if slope_match and price_match:
                current_step = 0
                if (
                    phase == "Bullish"
                    and price_relation == "above_both"
                    and current_50_slope == "positive"
                    and current_200_slope == "positive"
                ):
                    current_step = 1
                return phase, current_step

        return "Warning", 0

    @staticmethod
    def _get_options_strategy(phase, step):
        strategies = {
            "Bullish": {
                0: "Buy ATM Calls / Sell OTM Puts (30-45 DTE)",
                1: "Call Debit Spreads (ITM/ATM) or PMCC",
            },
            "Accumulation": {
                0: "Credit Spreads (OTM Puts) / Ratio Call Spreads",
                1: "Calendar Spreads (Call) targeting resistance break",
            },
            "Recovery": {
                0: "Long Calls (Far OTM) / Put Credit Spreads",
                1: "Broken Wing Butterflies (Call skewed)",
                2: "Diagonal Spreads (Call) with long >60 DTE",
            },
            "Warning": {
                0: "Call Credit Spreads / Protective Puts",
                1: "Iron Condors (Put skewed) / Collars",
            },
            "Distribution": {
                0: "Put Debit Spreads / Call Ratio Backspreads",
                1: "Calendar Spreads (Put) targeting support breaks",
            },
            "Bearish": {
                0: "Buy ATM Puts / Sell OTM Calls (30-45 DTE)",
                1: "Put Debit Spreads (ITM/ATM) or Bear Put Spreads",
            },
        }

        return {
            "strategy": strategies.get(phase, {}).get(
                step, "No options action recommended"
            ),
            "greeks": {
                "Bullish": "↑ Delta, ↓ Theta (Prioritize long calls)",
                "Accumulation": "↑ Vega (Play for volatility expansion)",
                "Recovery": "Gamma Scalping opportunities",
                "Warning": "↓ Vega (Play for volatility contraction)",
                "Distribution": "↑ Theta (Credit strategies preferred)",
                "Bearish": "↑ Delta, ↓ Theta (Prioritize long puts)",
            }.get(phase, ""),
            "moneyness": {
                "Bullish": "ATM/ITM Calls (Delta > 0.65)",
                "Accumulation": "OTM Calls 1-2 strikes above resistance",
                "Recovery": "Far OTM Calls (Low premium, high leverage)",
                "Warning": "ATM/OTM Puts (Delta 0.3-0.5)",
                "Distribution": "OTM Puts 1-2 strikes below support",
                "Bearish": "ATM/ITM Puts (Delta < -0.65)",
            }.get(phase, "Standard strikes"),
            "expiry": {
                "Bullish": "30-60 DTE (Capture trend momentum)",
                "Accumulation": "45-90 DTE (Allow time for breakout)",
                "Recovery": "90+ DTE (Slow plays) / Weeklys (Gamma plays)",
                "Warning": "21-45 DTE (Shorter duration for defense)",
                "Distribution": "45-60 DTE (Balance premium/decay)",
                "Bearish": "30-60 DTE (Capture downward momentum)",
            }.get(phase, "Standard expiration"),
        }

    @staticmethod
    def _get_zdte_strategy(phase):
        return {
            "entries": {
                "Bullish": "Open: Buy ATM Calls + Sell 2x OTM Calls (Ladder)",
                "Accumulation": "Open: Iron Fly (ATM short) with 10-delta wings",
                "Recovery": "Open: Call Ratio Spread (1xATM buy, 2x5%OTM sell)",
                "Warning": "Open: Put Debit Spread (ATM/5%OTM)",
                "Distribution": "Open: Broken Wing Put Butterfly (1-2-3 structure)",
                "Bearish": "Open: ATM Puts + OTM Call Credit Spread",
            }.get(phase, "Flat until confirmation"),
            "adjustments": {
                "Bullish": "Mid: Roll calls up to next strike, trail stop at 21EMA",
                "Accumulation": "Mid: Adjust untested side to 5-delta, let tested side run",
                "Recovery": "Mid: Add long puts if VIX spikes >2 points",
                "Warning": "Mid: Add call credit spreads if rejection at VWAP",
                "Distribution": "Mid: Roll puts down if break -0.5% from open",
                "Bearish": "Mid: Add put backspread if VIX curve inverts",
            }.get(phase, "No mid-day adjustments"),
            "exits": {
                "Bullish": "Close: Take profits >50%, hedge with SPX puts if >1% gain",
                "Accumulation": "Close: Take 50% profits by 2PM, let rest ride",
                "Recovery": "Close: Close all by 3PM unless trend strong",
                "Warning": "Close: Take profits at 1:1 RR, hold runners",
                "Distribution": "Close: Close 70% by 2:30PM, keep 30% for power hour",
                "Bearish": "Close: Take profits at 200% IV expansion",
            }.get(phase, "Close all by 3:45PM"),
            "strikes": {
                "Bullish": "ATM calls + 1-2% OTM call sells",
                "Accumulation": "ATM straddle + 10-delta wings",
                "Recovery": "5% OTM calls (cheap gamma)",
                "Warning": "ATM puts + 5% OTM call sells",
                "Distribution": "2% OTM puts + ATM put buys",
                "Bearish": "ATM puts + 1% OTM put spreads",
            }.get(phase, "ATM only"),
            "timing": {
                "Bullish": "10:30AM entry, 2PM adjustment, 3PM exit",
                "Accumulation": "Open auction, 11AM adjust, 1PM exit",
                "Recovery": "Wait for 10AM confirmation, 12PM exit",
                "Warning": "Fade opening rally, cover by 2:30PM",
                "Distribution": "1PM breakdown play, 3:30PM exit",
                "Bearish": "9:45AM breakdown, 11AM add, 2PM exit",
            }.get(phase, "Standard power hours"),
        }
