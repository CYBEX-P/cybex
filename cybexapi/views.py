"""Module that defines the main Django views locked behind authentication."""

from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import json
from rest_framework import status
import os

import docker
from cybexweb.dockers import check_db, create_db
from django.views.generic import View, TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
import mimetypes
from django.http import HttpResponse

class getconfig(APIView):
    def get(self, request):
        """Reads YAML configuration file."""
        config = json.dumps(settings.YAML_CONFIG)
        print(config)
        return Response(config)

# Moved from Cybexweb > views.py to here
# This was done so we require 2fa to access the graphs page but not the home page.
class GraphView(View):
    """View for the main threat-intelligence graph React application."""
    template_name = 'index.html'

    @method_decorator(login_required())
    def get(self,request,format=None):
        print("Begin checking docker")
        current_user = request.user
        client = docker.from_env()
        if not current_user.graphdb.containerid or (current_user.graphdb.containerid and not check_db(client,current_user.graphdb.containerid)):
            print("container missing or not running.  recreating")
            stats = json.loads(create_db(client))
            
            print(stats)
            current_user.graphdb.dbport = stats['bolt']
            current_user.graphdb.dbip = stats['ip']
            current_user.graphdb.dbuser = 'neo4j'
            current_user.graphdb.dbpass = stats['password']
            current_user.graphdb.containerid = stats['id']
            current_user.save()
        else:
            print("Container running")
                
        return render(request, self.template_name)

class DocsView(TemplateView):
    """View for main documentation landing page."""
    template_name = 'docs.html'

class VideoView(TemplateView):
    """Viwe for the video documentation page."""
    template_name = 'videos.html'

@login_required
def download_keys(request):
    filename = '.analytics_keys'
    fl_path = os.path.dirname(__file__)
    fl_path = os.path.join(fl_path, 'protected') + '/' + filename

    fl = open(fl_path, 'r')
    mime_type, _ = mimetypes.guess_type(fl_path)
    response = HttpResponse(fl, content_type=mime_type)
    #response['Content-Disposition'] = "attachment; filename=%s" % filename
    response['Content-Disposition'] = "attachment; filename=analytic_keys.txt"
    return response