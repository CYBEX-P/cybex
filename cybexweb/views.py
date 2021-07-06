"""Module that defines the Django views that don't require authentication."""

from django.shortcuts import render
from django.views.generic import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from cybexweb.dockers import check_db, create_db
import docker
import json

#def checkalive(dbport, dbip, dbuser, dbpass, containerid):
 #   return true

#def createnew():
#    dbport = 1
#    dbip = 1
#    dbuser = ''
#    dbpass = ''
#    return [dbport,dbip,dbuser,dbpass,containerid]

#def recreate():
class HomeView(TemplateView):
    template_name = 'home.html'

class AboutView(TemplateView):
    template_name = 'about.html'
class PersonnelView(TemplateView):
    template_name = 'personnel.html'
    
