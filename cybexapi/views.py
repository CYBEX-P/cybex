from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import json

import docker
from cybexweb.dockers import check_db, create_db
from django.views.generic import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

class getconfig(APIView):
    def get(self, request, format=None):
        config = json.dumps(settings.YAML_CONFIG)
        print(config)
        return Response(config)


#TODO
# Helper views to be replaced once front end is fixed
class isSignedIn(APIView):
    def get(self, request, format=None):
        return Response({"value" : True})

class isAdmin(APIView):
    def get(self, request, format=None):
        return Response({"value" : False})


# Moved from Cybexweb > views.py to here
# This was done so we require 2fa to access the graphs page but not the home page.
class GraphView(View):
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