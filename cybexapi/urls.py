from django.urls import include, path
from . import views
from cybexapi.api import exportNeoDB, insert, delete, enrichNode, enrichNodePost, enrichURL, macroCybex, macro, wipe, start, startFile, importJson, position, dataEntry, getContents#, insertURL
from rest_framework.schemas import get_schema_view
from django.views.generic import TemplateView

urlpatterns = [
    # View
    path('graph', views.GraphView.as_view(), name='graph'),
    path('api/v1/admin/config', views.getconfig.as_view()),
    path('api/v1/neo4j/export', exportNeoDB.as_view()),
    path('api/v1/neo4j/insert/<node_type>/<value>/', insert.as_view()),
    path('api/v1/enrich/<enrich_type>/<value>/', enrichNode.as_view()),
    path('api/v1/delete/<node_id>/', delete.as_view()),
    path('api/v1/enrich/<enrich_type>/', enrichNodePost.as_view()),
    path('api/v1/enrichURL', enrichURL.as_view()),
    path('api/v1/macroCybex', macroCybex.as_view()),
    path('api/v1/macro/<subroutine>/', macro.as_view()),
    path('api/v1/neo4j/wipe', wipe.as_view()),
    path('api/v1/getContents/<path>/', getContents.as_view()),
    ##post
    path('import_json', importJson.as_view()),
    path('api/v1/position', position.as_view()),
    path('api/v1/dataEntry', dataEntry.as_view()),
    #path('api/v1/neo4j/insertURL', insertURL.as_view()), # using /insert now
    path('api/v1/event/start', start.as_view()),
    path('api/v1/event/start/file', startFile.as_view()),
    #TODO
    #Depracate these two functions
    path('isSignedIn', views.isSignedIn.as_view()),
    path('isAdmin', views.isAdmin.as_view()),

    path('openapi/', get_schema_view(
        title="CYBEX-P Portal API Doc",
        description="Documentation for the CYBEX-P Portal API. This is solely for the frontend web application and is seperate from the backend CYBEX-P API."
    ), name='openapi-schema'),
    path('portalapi/', TemplateView.as_view(
        template_name='apiportal.html',
        extra_context={'schema_url':'openapi-schema'}
    ), name='swagger-ui'),
]
