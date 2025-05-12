import json

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from backend.apps.trading.services import app_service
from backend.apps.trading.strategy.indicator_manager import indicator_manager
from backend.apps.trading.strategy.trend_advisor import TrendAdvisorService

PHASES = {
    "Bullish": {
        "description": "Bullish trend begins with Higher Highs & Higher Lows (rising 200 PMA)",
        "sub_steps": [
            "Buy the dips, volume expands on breakouts, new highs",
            "Positive slope on both 50 and 200 PMA with accelerating momentum",
        ],
        "color": "green",
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
        "color": "lime",
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
        "color": "yellowgreen",
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
        "color": "gold",
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
        "color": "orange",
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
        "color": "red",
        "conditions": {
            "50_slope": "negative",
            "200_slope": "negative",
            "price_relation": "below_both",
        },
    },
}

PHASE_INFO = {
    "Bullish": "Strong Buy - Price > 50 & 200 PMA",
    "Accumulation": "Buy Dips - Price > 50 PMA",
    "Recovery": "Caution Buy - Price crossing 50 PMA",
    "Warning": "Caution Sell - Price crossing 50 PMA",
    "Distribution": "Sell Rallies - Price < 50 PMA",
    "Bearish": "Strong Sell - Price < 50 & 200 PMA",
}

SHARES_INFO = {
    "Bullish": "ATM/ITM Calls (Delta > 0.65)",
    "Accumulation": "OTM Calls 1-2 strikes above resistance",
    "Recovery": "Far OTM Calls (Low premium, high leverage)",
    "Warning": "ATM/OTM Puts (Delta 0.3-0.5)",
    "Distribution": "OTM Puts 1-2 strikes below support",
    "Bearish": "ATM/ITM Puts (Delta < -0.65)",
}

OPTION_INFO = {
    "Bullish": "30-60 DTE (Capture trend momentum)",
    "Accumulation": "45-90 DTE (Allow time for breakout)",
    "Recovery": "90+ DTE (Slow plays) / Weeklys (Gamma plays)",
    "Warning": "21-45 DTE (Shorter duration for defense)",
    "Distribution": "45-60 DTE (Balance premium/decay)",
    "Bearish": "30-60 DTE (Capture downward momentum)",
}

TIME_INDICATORS = [("Close < 50 PMA", "SELL"), ("Close > 50 PMA", "BUY")]


# API Views
@api_view(["GET"])
@permission_classes([AllowAny])
def api_portfolio(request):
    try:
        portfolio_data = app_service.get_account_data()
        account_order_data = app_service.get_account_orders()
        return Response(
            {
                "status": "success",
                "portfolio": portfolio_data,
                "positions": account_order_data,
            }
        )
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def api_performance(request):
    try:
        performance_data = app_service.get_performance_sheet()

        return Response({"status": "success", "performance": performance_data})
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def api_price_history(request):
    try:
        data = app_service.fetch_data(
            symbol=request.GET.get("symbol"),
            periodType=request.GET.get("periodType"),
            period=request.GET.get("period"),
            frequencyType=request.GET.get("frequencyType"),
            frequency=request.GET.get("frequency"),
        )

        # Parse the indicators parameter from JSON string to Python dict
        indicator_settings_str = request.GET.get("indicators")
        indicator_settings = (
            json.loads(indicator_settings_str) if indicator_settings_str else {}
        )

        analysis = indicator_manager(data, indicator_settings)

        return Response(
            {
                "status": "success",
                "price_data": analysis["price_data"],
                "indicators": analysis["indicators"],
            }
        )
    except json.JSONDecodeError:
        return Response(
            {"status": "error", "message": "Invalid indicators parameter format"},
            status=400,
        )
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([AllowAny])
def api_market_phase(request):
    try:
        data = app_service.fetch_data(
            symbol=request.GET.get("symbol"),
            periodType=request.GET.get("periodType"),
            period=request.GET.get("period"),
            frequencyType=request.GET.get("frequencyType"),
            frequency=request.GET.get("frequency"),
        )

        analysis = TrendAdvisorService.analyze_trend(data)

        return Response(
            {
                "status": "success",
                "phase": analysis["phase"],
                "price_data": analysis["price_data"],
                "indicators": analysis["indicators"],
            }
        )
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)
