# cybex
The CYBEX front end project is a DJango project with a React client component

The project is split into three apps
- cybex
  - master project
- cybexapi
  - api functionaity
- cybexweb
  - container project for the React app under ./graph
- cybexdata
  - container project for all custom data models.

Keys are stored in a .env environment file and loaded dynamicall in the settings. 

Steps to run

1. git clone ...
2. cd cybex
3. python3 -m venv .venv
4. source .venv/bin/activate
5. pip3 install -r requirements.txt
6. cd ./cybexweb/graph
7. npm install
8. npm run build
9. cd ../../
10. python3 manage.py migrate
11. python3 manage.py makemigrations cybexdata
12. python3 manage.py createsuperuser
13. rename dot-env to .env file for sensitive settings.  Request keys from admin
14. python3 manage.py runserver
