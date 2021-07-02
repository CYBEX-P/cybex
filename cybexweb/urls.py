"""URL Configuration for all urls that don't require authentication.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import include, path
# from .views import GraphView, HomeView
from .views import HomeView, AboutView, PersonnelView
from multifactor.urls import urlpatterns


# Use this for if you just want to some urlpatterns
# from multifactor.factors import totp

urlpatterns = [
    # path('graph', GraphView.as_view(), name='graph'),
    path('home', HomeView.as_view(), name='home'),
    # path('docs', DocsView.as_view(), name='docs'),
    path('about', AboutView.as_view(), name='about'),
    path('personnel', PersonnelView.as_view(), name='personnel'),
    path('', HomeView.as_view(), name='home'),
    

    # These are include if you don't want to use the whole multifactor.urls urlpatterns
    # path('totp/new/', totp.Create.as_view(), name="totp_start"),
    # path('totp/auth/', totp.Auth.as_view(), name="totp_auth"),
]
