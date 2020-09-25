from django.urls import path
from . import views
from cybexapi.api import exportNeoDB, insert, enrichNode, macroCybex, macro, wipe, insertURL, start, startFile, importJson

urlpatterns = [
    path('api/v1/admin/config', views.getconfig.as_view()),
    path('api/v1/neo4j/export', exportNeoDB.as_view()),
    path('api/v1/neo4j/insert/<x>/<y>/', insert.as_view() ),
    path('api/v1/enrich/<x>/<y>/', enrichNode.as_view()),
    path('api/v1/macroCybex', macroCybex.as_view()),
    path('api/v1/macro', macro.as_view()),
    path('api/v1/neo4j/wipe', wipe.as_view()),
    path('import_json', importJson.as_view()),
    #post
    path('api/v1/neo4j/insertURL', insertURL.as_view()),
    path('api/v1/event/start', start.as_view()),
    path('api/v1/event/start/file', startFile.as_view()),
    #TODO
    #Depracate these two functions
    path('isSignedIn', views.isSignedIn.as_view()),
    path('isAdmin', views.isAdmin.as_view()),
#    path('/testAPI',),

]
