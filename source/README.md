# Web Application
This documentation is for the CYBEX-P Web Application. For details on the CYBEX-P platform and infrastructure, please see its seperate documentation. This resource is broken into the following categories:

#### User Guide
The user guide below is excerpted from the thesis titled *Navigating Cyberthreat Intelligence with CYBEX-P: Dashboard Design and User Experience*

{download}`User Guide PDF <cybex_user_guide.pdf>`

[Video Guides](https://cybex.cse.unr.edu/videos)

#### API Reference

[Interactive API Reference](https://cybex.cse.unr.edu/portalapi)

#### Getting Started with the Codebase

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
  - Build location for generated Sphinx documentation content (i.e. html files)
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

###### Steps to run
 
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
  
To update sphinx documentation, run 'make html' in main directory. Note that this is generated from the files in /source, as well as automatically inferred from docstrings throughout all Python modules.

#### High-Level Architecture & Deployment Config
The architecure & deployment documentation below is excerpted from the thesis titled *Navigating Cyberthreat Intelligence with CYBEX-P: Dashboard Design and User Experience*

{download}`Architecture & Deployment PDF <arch_deployment.pdf>`

Production Server Deployment:
1. Follow the guidance here (static files are pushed to '/static/'):
  - https://docs.djangoproject.com/en/3.0/howto/static-files/deployment/
  
  Deployment uses standard supervisor w/guncicorn approach to run Django app.
  Is run behind nginx web server as a reverse proxy. See pdf above for details.

#### Django Backend

```{toctree}
:maxdepth: 2

modules
```

#### React Frontend
The CYBEX-P threat-intelligence graph client is a React application.
It is constructed from the following components, all of which are documented
in comments in their source code:

- cybexweb/graph/src/App.jsx
  - description
- cybexweb/graph/src/components/App/MainApp.jsx
  - Master component that holds the main subcomponents of the application. This is a very large component responsible for render the central Graph canvas component, navbar, all expandable menus, and all toggleable modals. A number of states are defined within this component that are relevant across the application.
- cybexweb/graph/src/components/Button/Button.jsx
  - Customized button component for use throughout application for various purposes. Is based on ReactStrapButton.
- cybexweb/graph/src/components/EventInsertForm/EventInsertForm.jsx
  - CURRENTLY UNUSED COMPONENT, but included for potential future reuse.The functionality in this now-deprecated component has been largely replaced by the 'Submit Event Data' modal, which is a graphModal component defined inside the MainApp.jsx component. This deprecated component was more complex in its intended utility, and so some of this functionality may need to be re-implmented in the future. This includes the ability to encrypt submitted data, submit in-line data using a text box, and having submitted data be immediately added to the user's current graph for visualization.
- cybexweb/graph/src/components/InsertForm/ImportJson.jsx
  - Component that facilitates importing a graph from a JSON File
- cybexweb/graph/src/components/InsertForm/InsertForm.jsx
  - Component that facilitates IOC insertion as part of the form controls in the right-hand expandable IOC menu. These functions include manually inserting IOCs, performing enrichments from the menu controls, and highlighting nodes.
- cybexweb/graph/src/components/Graph/Graph.jsx
  - Component that holds the threat-intelligence graph object, as well as supplemental graph interface elements. The main graph uses a vis.js network object that is mapped to the user's underlying Neo4j graph database. Aside from rendering the main graph, supplemental elements like IOC information cards and tooltips are also defined in this component. These are all conditionally rendered, depending on whether graph elements are selected, hovered over, etc. Note that all styling is defined in-line within this file. In the future, this component should be refactored so that these additional UI elements have their own components, rather than being defined within this file directly. Styling should likewise be moved to external files, like how it is structure for some of the other components in this project.
- cybexweb/graph/src/components/Graph/GraphFilter.jsx
  - Component for the filter controls that directly influence what data is returned from CYBEX graph queries.
- cybexweb/graph/src/components/Graph/Honeypot
  - NOTE: This directory contains all components for the Honeypot Map viewer. This was developed as a seperate project from the main CYBEX-P threat-intelligence graph. Please see seperate documentation for source code in this directory that pertains to the honeypot viewer.
- cybexweb/graph/src/components/MacroCard/Macros.jsx
  - Component that handles the rendering and logic for the macro expandable menu. This has multiple subcomponents that can be used to easily modify the macro options in future software versions.
- cybexweb/graph/src/components/menuBar/menuBar.jsx
  - Component used for rendering the left, right, and bottom expandable menus.
- cybexweb/graph/src/components/modal/AdminPage.jsx
  - Component that renders the Admin Panel, used for user management.
- cybexweb/graph/src/components/modal/graphModal.jsx
  - Component that serves as a template for the main modal style used in the application. See this component used and defined for different use-cases inside the MainApp.jsx component.
- cybexweb/graph/src/components/modal/TrendBox.jsx
  - Component representing the individual boxes used within the Trends panel. These are intended to be containers for specific dashboard-style content, such as global CYBEX plots, trends, statistical views, etc.
- cybexweb/graph/src/components/modal/TrendRow.jsx
  - Component representing the rows used within the layout of the trends screen. TrendBox components are to be placed within TrendRows.
- cybexweb/graph/src/components/modal/Trends.jsx
  - Component that renders the trends and honeypot viewer screens over the main application. These are accessed from the trends button in the Navbar. Note that all trends/honeypot viewer content are thus considered child components of the Navbar.
- cybexweb/graph/src/components/navBar/Dropdown.jsx
  - Component that renders the dropdown options within the main hamburger menu on the left side of the navbar.
- cybexweb/graph/src/components/navBar/navBar.jsx
  - Component that renders the main Navbar present at the top of the screen. This contains several buttons for additional functions. These include an expandable hamburger menu on the left side, an admin panel button (if user) is an admin, a cybex data upload form, and a button to bring up the trends/honeypot viewer panel. This component is the parent to all trends/honeypot components.
- cybexweb/graph/src/components/radialMenu/radialMenu.jsx
  - Component that renders the main radial menu when users select a graph node.
- cybexweb/graph/src/components/radialMenu/withNodeType.jsx
  - This is a HOC for the radial menu. See:https://reactjs.org/docs/higher-order-components.html
- cybexweb/graph/src/components/SplashScreen/SplashScreen.jsx
  - Component used to render a splash screen during loading states.

The following files/directories are not source code for React components, but are still relevant to the front end operation:

- cybexweb/graph/src/testdata
  - Contains files used for testing the application when the backend Python code is not running. This is useful when running npm start, where the react code is run completely independently of the rest of the application. These files provide hardcoded values for mock data that the React code can use in the place of actual backend calls.
- cybexweb/static/docPages
  - The html that is rendered for the documentation pages (which this page is part of).
- cybexweb/static/images
  - Image files used as resources for various parts of the application
- cybexweb/static/SVG
  - SVG icon files used for IOC node icons
- cybexweb/static/videos
  - Video files used as resources for documentation pages
- cybexweb/static/openapi-schema.yml
  - openapi schema file that is used for the live API documentation.
- cybexweb/templates
  - HTML files for all of the static pages that are part of the main CYBEX-P site (These are not part of the threat-intelligence graph react application, which has its own source code)
- cybexweb/server.js
  - The server code for the honeypot viewer application that is integrated within the larger threat-intelligence application. Note that this is its own server process (using express.js) that must be executed for the honeypot viewer functions to work properly.





