
#  Cybex-P Installation guide

## Environment setup and Tahoe Installation
To set up the the Cybex-P backend run the following list of commands.

**Note**: Operating System used: Ubuntu (Debian)

- Create the python environment
	- Depdendencys:
		- Python3.9
		- Python3.9 Headers

`$: sudo apt-get install python3.9 python3.9-dev`

## TAHOE Installation and setup
-	Downloading The Tahoe Module Code:
```
$: `git clone https://github.com/CYBEX-P/tahoe.git`
```
- Activate the Tahoe virtual environment
```
$: `python3.9 -m venv <venv-name>`
$: `source <venv-name>/bin/activate`
(example_name)$: //<------- You should be in your virtual environment now
```
- For activating on Windows ---
```
$: `python3.9 -m venv <venv-name>`
$: `<venv-name>/Scripts/activate.bat`
(example_name)$: //<------- You should be in your virtual environment now
```

- Installing Tahoe Dependencies into Tahoe's virtual environment
```
(example_name) $: `pip install -r  <project-dir>/requirements.txt`
(example_name) $: `cd tahoe`
(example_name) $: `python -m unittest` (optional)
runs unit test (optional)
```
-	Installing  Tahoe
```
(example_name) $: `python3,9 setup.py install`
```

## **Input Module Installation**
***TODO***
## **API Module Installation**
- Basic Installation:
	- (example_name) $: `cd <project-dir>/...`
	- (example_name) $: `git clone https://github.com/CYBEX-P/cybexp-api.git`
	- (example_name) $: `cd cybexp-api`
	- (example_name) $:`pip install -r requirements.txt`
- Unit testing:
	- (example_name) $:`cd ../cybexp-api`
	- (example_name) $:`python3.9 -m unittest`
- Test run the environment:
	- hupper -m api
	- curl http://localhost:5000/ping
## **Archive Module Installation**
***TODO***
## **Analytics Module Installation**
***TODO***
## **Report Module Installation**
***TODO***

## Database Setup and Installation (MongoDB)
Cybex-P uses MongoDB as its relational database in storing and comparing threat data

As for setting up the database, all that is needed is a simple installation of MongoDB. The Cybex-P configuration settings and code will handle the rest at run-time.

To install MongoDB, execute the following commands:
- Install gnupg
```
sudo apt-get install gnupg
```
- importing the MongoDB public GPG key
```
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
```
- Appending mongodb to apt sources list
```
echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
```
- Updating the apt package list
```
sudo apt-get update
```
- Installing the latest stable version of MongoDB
```
sudo apt-get install -y mongodb-org
```
At this point your mongodb installation is complete, execute the following commands to initialize the mongodb systemd daemon:
```
sudo systemctl start mongod
```
If the following prompt comes up:
***Failed to start mongod.service: Unit mongod.service not found.***

Execute the following command:
```
sudo systemctl daemon-reload
```
Then run the systemctl start command again.

For any other concerns and additional functionality and support on MongoDB, consult the following [documentation](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/).


## Systemd Services (Debian)
Each Module of the Cybex-P backend has their own systemd Service file to handle execution and monitoring.

Below you will find a basic example of setting up the systemd service files:

```
#This systemd file executes and maintains Cybex-P's Archive Module

[Unit]
Description=Cybex-P archive Module
After=network-online.target

[Service]
User=cybexp-archive
Group=cybexp-archive
WorkingDirectory=../<proj-dir>/archive
Type=simple
ExecStart=../cybexp/env/bin/python3 ../<project-dir>/archive/archive.py

Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target

````

In the template above replace the following parameters with the indicated values:
- `../<proj-dir>/` - The full directory leading to where the module is stored
- `archive` - Name of the module for the systemd service file

There should be 5 linux systemd service files that serve and maintain all of the Cybex-P Modules

 ### Creating the service files
 ---
 To make the cybex-p systemd service files, simply do the following
 ```
$: cd /etc/systemd/system
$: touch cybexp_archive.service
$: nano cybexp_archive.service
```
Replace the following to any appropriate name of the module you are constructing the systemd file for:
-	`cybex_archive.service` - the name of whichever module's systemd file is currently being created (E.G: `cybexp_api.service`)

Then write in the template above and adjust accordingly to where your python3.9 cybex-p virtual environment and module is located
### Executing Cybex Systemd Services 
---
Once all systemd service files have been provisioned to the Cybex-P modules. Run the following to command on all service files to execute the modules.
```
$: systemctl start ***
```
- Replacing `***` with the name of a module ( E.G: `cybex_archive` )
