from django.shortcuts import render
from django.views.generic import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from cybexweb.dockers import check_db, create_db
import docker
import json

from multifactor.decorators import multifactor_protected
#def checkalive(dbport, dbip, dbuser, dbpass, containerid):
 #   return true

#def createnew():
#    dbport = 1
#    dbip = 1
#    dbuser = ''
#    dbpass = ''
#    return [dbport,dbip,dbuser,dbpass,containerid]

#def recreate():

# @method_decorator(multifactor_protected(factors=0, user_filter=None, max_age=0, advertise=False), name='get')
class GraphView(View):
    template_name = 'index.html'

    @method_decorator(multifactor_protected())
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

class HomeView(TemplateView):
    template_name = 'home.html'
    
