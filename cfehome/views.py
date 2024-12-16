from django.shortcuts import render
from cfehome.services import app_service


# Create your views here.
def home(request, *args, **kwargs):
    return render(request, 'home.html', {})


def portfolio(request, *args, **kwargs):
    portfolio_data = app_service.get_account_data()
    account_order_data = app_service.get_account_orders()
    return render(request, 'portfolio.html', {'portfolio': portfolio_data, 'positions': account_order_data})


def performance(request, *args, **kwargs):
    performance_data = app_service.get_performance_sheet()
    return render(request, 'performance.html', {'performance': performance_data})
