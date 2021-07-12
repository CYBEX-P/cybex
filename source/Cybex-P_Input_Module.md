# Cybex-P Input Module
The `Cybex-P Input Module` is reponsible for the collection of threat data provided from user input and to populate it into the `Cybex-P API Module`. The Input module is located Inside the collector server and in between the frontend client and `Cybex-P API Module`.  Users can manually post threat data through the frontend web client or let handling be done automatically via the connector server to the collector.

Examples of automatic data collection include:
> - Calling an API
> - A pre-configured websocket
> - reading from a text file
> - reading from a database
> - Using linux syslog protocol

The following flow chart is a smaller scale summarization of the flow of data to the `Cybex-P API Module` via the `Cybex-P Input Module`:

```{mermaid}
graph TD
A[Automatically Collected Data] --> E((Connector Server)) --> F((Collector Server)) --> D 
B[User webapp Inputted Data] --> G((Frontend Server))
G --> D[Cybex-P API Module]
H[Cache Data Lake]

D --> H
I[...]
H --Data Continues further--> I

```
# Cybex-P Input Repository

The `Cybex-P Input Module`handles all kinds of data incoming to CYBEX-P. Users can manually upload threat data via a web client or automatically send machine data via a connector to the collector.

The module is compromised of multiple ***plugins*** to handle inputs. Plugins are their own seperate add-ons and each plugin handles one type of source (e.g. Cowrie honeypot). 

Files:

- `input.py`
	-  This is the main file to start, stop or restart the input module. This file passes the start/stop/restart command to `run.py` and exits itself.
- `run.py`
	- This script keeps continuously running in the background. The `input.py` file starts this script as a process/fork and exits. The `run.py` creates an websocket and saves that info in the runningconfig file in the working directory. It also as functions to start/stop/restart specific plugins or inputs. 
- `runningconfig`
	- A text file created by `run.py` and deleted during normal exit. This file contains the host, port of the websocket used by `input.py`  to pass commands to `run.py`  (IPC). 

There are currently six plugins in the input module; four of the plugins are open source threat intelligence platforms while the other two plugins are entities that are fully native to the `Cybex-P Input Module`. The  ***plugins*** themselves are comprosed of the following services:
- `common`
	- Cybex Source Fetching, Exponential backoff, Cybex Sources. Common plugin module used by the other modules
- `misp_api`
	-  MISP api with python wrapper. Malware information sharing platform; Open source threat intelligence 
- `misp_file`
	-  MISP file input
- `openphish`
	- phishing intelligence platform
- `phishtank`
	- Gets phishing URLs from phishtank.com.
- `websocket`
	- Lomond websocket plugin

Below is a general diagram of how threat data is handled by the various plugins in the `Cybex-P Input Module`: 
```{mermaid}
graph
A[Threat data] --> B((Common:<br> Base Cybex <br> source fetcher)) --> H[Cybex-P API Module]
A[Threat data] --> C((misp_api:<br> MISP threat<br> intelligence API)) --> H[Cybex-P API Module]
A[Threat data] --> D((misp_file:<br> MISP file input)) --> H[Cybex-P API Module]
A[Threat data] --> E((openphish:<br> Phishing intel <br> patform)) --> H[Cybex-P API Module]
A[Threat data] --> F((phishtank:<br> Community <br> phishing intel <br> platform)) --> H[Cybex-P API Module]
A[Threat data] --> G((websocket:<br> Cybex-P General <br>websocket)) --> H[Cybex-P API Module]

```

# Plugins

- `Common`
	- As it's name states, `common` is a module that contains common utility and functions that is used by the other plugins within the `Cybex-P Input Module`.  The following are classes utilized by the other plugins to handle data:
	> - CybexSource()
	> - CybexSourceFectcher()

	- ***CybexSource()*** is `common`'s class that is responsible for validating input configuration and posting Cybex-P ***events*** to the `Cybex-P API Module`. All modules within the `Cybex-P Input Module` inherit this class due to the responsibility of posting data to the api being on this module. 
	- ***CybexSourceFetch()*** is an additional class in `common` that serves to handle the rate of input from input sources provided by ***CybexSource()***. It executes signal events in multiple threads and executes the signals in those threads based on certain conditions.

- `misp_api`
	- Malware Information Share Platform (or MISP) is an open-source platform that provides information on the threat levels and malicious capabilities of threat data provided to it. `misp_api` is a Cybex-P integration of the platform which utilizes the projects API endpoint to populate Cybex-P's backend with additional data on any provided threat attribute. The project is integrated into the `Cybex-P Input Module` by a python wrapper of the platform. The plugin works by simply taking the provided threat data and posting it to the platforms endpoint; the response data, provided it isn't an error, proceeds to get posted to the `Cybex-P API Module`.
- `misp_file`
	-  This plugin acts as a direct input of MISP data. Users who have files available that come from MISP can be inputted through this plugin and easily populated to the `Cybex-P API Module`.
- `openphish`
	- the openphish plugin is a Cybex-P input plugin that actively retrieves URL sources from the openphish platform for the Cybex-P backend. Openphish is a phishing intelligence source that consistently gets updated with URLs that have been flagged as phishing links. This data is populated to the backend of Cybex-P and used as additional attribute data that is correlated to other threat data and sources that is provided to the backend. 
- `phishtank`
	- like openphish, phishtank is another phishing intelligence platform that offers a community-based phish verification system and users get to vote if the URL should be flagged as a phish. like openphish, phishtank calls are consistently made and data is returned, compressed, in either .bz2 or .gz extension. The data then gets decompressed and comes out in the form a list of records from phishtank. All provided records get posted to the `Cybex-P API Module`.
- `websocket`
	- the websocket plugin is a general purpose plugin with no specific specification directly attached to it. This plugin is used for all other miscellaneous forms of threat data collection. This plugin establishes a connection to the `Cybex-P API Module` using lomond websocket protocol ws. Use it to connect to the log stash socket module.  The log stash provides information on threat data.
# Miscellaneous 

- PluginHandler 
	- deals with the handling of any threads spun up
- PluginManager
	- takes care and maintains the sockets of the cybex-p input module
		- Updating socket configurations
		- Spawning configurations
		- Restarting sockets
		- Killing sockets
		- Checking on the running configs
		- Initiating and updating to new configs
		- Running input plugins
		- Retrieving configurations from files
		- running the files of input plugins
		- handling changins
		- removing stale sockets 
