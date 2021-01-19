"""cybex URL Configuration

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
from django.contrib import admin
from django.urls import path, include

from decorator_include import decorator_include
from multifactor.decorators import multifactor_protected

urlpatterns = [
    path('admin/multifactor/', include('multifactor.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', include('cybexweb.urls')),

    ## The two below were used before 2fa was implemented.
    # path('admin/', admin.site.urls), 
    # path('', include('cybexapi.urls')),

    ## The two below are used with 2fa and require that these sites must have you verified your 2fa
    path('admin/', decorator_include(multifactor_protected(factors=1), admin.site.urls)),
    path('', decorator_include(multifactor_protected(factors=1),'cybexapi.urls')),

]


########################
## Code below is used to override a function with multifactor.factors.totp Create class.
## Code was copied from the multifactor totp.py.
## The redirect return changed, a comment is where the original one was.
########################

from multifactor.factors.totp import Create
from multifactor.models import UserKey, KEY_TYPE_TOPT
from multifactor.common import write_session, login
from multifactor.app_settings import mf_settings
from django.contrib import messages
from django.shortcuts import redirect
WINDOW = 60

def post(self, request, *args, **kwargs):
    if self.totp.verify(request.POST["answer"], valid_window=WINDOW):
        key = UserKey.objects.create(
            user=request.user,
            properties={"secret_key": self.secret_key},
            key_type=KEY_TYPE_TOPT
        )
        write_session(request, key)
        messages.success(request, 'TOPT Authenticator added.')
        return redirect(request.session['multifactor-next'])
        # return redirect("multifactor:home")

Create.post = post

########################
## END OF OVERRIDE
########################