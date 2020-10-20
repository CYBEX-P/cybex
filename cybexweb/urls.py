from django.urls import include, path
from .views import GraphView, HomeView
from multifactor.urls import urlpatterns

# Use this for if you just want to some urlpatterns
# from multifactor.factors import totp

urlpatterns = [
    path('graph', GraphView.as_view(), name='graph'),
    path('home', HomeView.as_view(), name='home'),
    path('', HomeView.as_view(), name='home'),

    # path('admin/multifactor/', include('multifactor.urls')),

    # These are include if you don't want to use the whole multifactor.urls urlpatterns
    # path('totp/new/', totp.Create.as_view(), name="totp_start"),
    # path('totp/auth/', totp.Auth.as_view(), name="totp_auth"),
]
