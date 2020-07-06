from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import json

# Create your views here.
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