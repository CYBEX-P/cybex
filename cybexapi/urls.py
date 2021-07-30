"""URL Configuration for all urls that are accessed behind authentication.

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
from . import views
from cybexapi.api import exportNeoDB, insert, delete, enrichNode, enrichNodePost, enrichURL, macroCybex, macro, wipe, start, startFile, importJson, position, dataEntry, getContents, currentUserInfo, orgInfo, orgAddRemoveUser#, insertURL
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
    path('api/v1/macroCybex/<query>/<from_date>/<to_date>/<timezone>/', macroCybex.as_view()),
    path('api/v1/macro/<subroutine>/', macro.as_view()),
    path('api/v1/neo4j/wipe', wipe.as_view()),
    path('api/v1/getContents/<path>/', getContents.as_view()),
    path('api/v1/user_management/currentUserInfo/<info_to_return>/', currentUserInfo.as_view()),
    path('api/v1/user_management/org_info', orgInfo.as_view()),
    path('api/v1/user_management/org_add_remove', orgAddRemoveUser.as_view()),

    ##post
    path('api/v1/import_json', importJson.as_view()),
    path('api/v1/position', position.as_view()),
    path('api/v1/dataEntry', dataEntry.as_view()),
    #path('api/v1/neo4j/insertURL', insertURL.as_view()), # using /insert now
    path('api/v1/event/start', start.as_view()),
    path('api/v1/event/start/file', startFile.as_view()),
    path('docs', views.DocsView.as_view(), name='docs'), # for documentation homepage
    path('videos', views.VideoView.as_view(), name='videos'), # for documentation videos

    path('portalapi/', TemplateView.as_view(
        template_name='apiportal.html',
        extra_context={'schema_url':'openapi-schema'}
    ), name='swagger-ui'),

    path('backendapi/', TemplateView.as_view(
        template_name='apibackend.html',
        extra_context={'schema_url':'Cybex-P-backend-openAPI'}
    ), name='swagger-ui'),

    path('keys', views.download_keys)
]
