# cybex
The CYBEX web application is a DJango project with a React client component

The project is split into four main directories
- cybex
  - master project
- cybexapi
  - api functionaity
- cybexweb
  - container project for the React app under ./graph
- cybexdata
  - contains all custom data models used by the Django application.

In addition to these main directories, the following files are used for configuration and documentation purposes:

- build
-   Build location for generated Sphinx documentation content (i.e. html files)
- source
  - Source files for Sphinx Python documentation
- make.bat and Makefile
  - Used to generate html pages from sphinx documentation source directory
- openapi-schema.yml
  - Openapi schema file used to generate the interactive api documentation
- README.md
  - This document
- requirements.txt
  - Requirements file used for python dependency installation

NOTE: Keys for different lookup services are required for all features to run properly. These are to be stored in a .env environment file and loaded dynamicaly in the settings. This .env file should be created in the same directory where env-dist is located. Ask a CYBEX administrator for the keys.

Steps to run

Before installation, ensure you are using an updated version of pip and npm:

- pip install --upgrade pip
- npm install -g npm@latest

1. git clone ...
2. cd cybex
3. python3 -m venv .venv
4. source .venv/bin/activate
5. pip3 install -r requirements.txt
6. cd ./cybexweb/graph
7. npm install (installs react app dependencies)
8. npm run build
9. cd ../
10. npm install (installs dependencies for honeypot visualizer)
11. cd ../
12. python3 manage.py migrate
13. python3 manage.py makemigrations cybexdata
14. python3 manage.py createsuperuser
15. rename dot-env to .env file for sensitive settings.  Request keys from admin
16. python3 manage.py runserver

- NOTE: The initial superuser created ins step 14 should only be used for initial application setup or for creating new accounts. This superuser should be considered a 'CYBEX master admin' account, which will not be used to actually use the application or access the threat-intelligence graph. Instead, this initial account can be used to access the 'admin' page from the CYBEX-P homepage. Here, use the Django admin panel to create new CYBEX-P users. These are treated as normal users; any users created using this interface can then access the threat intelligence graph. Users can also be granted admin privelages or have theier passwords changed using this same interface. Default, non-admin users will not be able to access this admin panel. 
- NOTE: When first configuring and running this application in a new deployment environment, the above process should be undertaken to create at least one CYBEX-P user. Log in as that user to properly test the threat-intelligence graph. 

Production Server Deployment:
1. Follow the guidance here (static files are pushed to '/static/'):
  - https://docs.djangoproject.com/en/3.0/howto/static-files/deployment/
2. Configure nginx by setting a configuration file at /etc/nginx/conf.d/virtual.conf.d
  
  Deployment uses standard supervisor w/guncicorn approach to run Django app.
  Is run behind nginx web server as a reverse proxy.
  
To update sphinx documentation, run 'make html' in main directory. Note that this is generated from the files in /source, as well as automatically inferred from docstrings throughout all Python modules.
