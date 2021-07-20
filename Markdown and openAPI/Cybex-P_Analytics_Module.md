# Cybex-P Analytics Module
The `Cybex-P Analytics Module`, also known as the *Analytics Cluster*,  is responsible for changing and adjusting data that is provided to users at the frontend web client. It works on data that was archived to the Archive database and has various functionality to transform, enrich, correlate, and analyze threat data. 

```{mermaid}
graph LR
A(Analytical Cluster)
B(Archive Dababase)
A --send back analysed threat data--> B
B --Pull Newly parsed TAHOE objects of threat data--> A
```

The module works by the concept of *filtering*; threat data that is freshly processed from the Archive database is procedurely ran through various filters. When passed through these filters, a new piece of data is created. A single piece of data can be ran through multiple filters with each filter outputting a new piece of data. A simple example is extracting source/destination IP and the port it passed through.


The flow chart below represents a simplified version on how *filtering* is integrated and how data passing through the same filter is a powerful notion capitlized by `Cybex-P` in how correlation of data operates:
```{mermaid}
graph LR

d0(Threat Data 01) 
d0 --> f1
d0 --> f2
d00(Threat Data 02)
d00 --> f3
f1[Filter 1]
f2[Filter 2]
f3[Filter 3]
f4[Filter 4]
f1 --> d1((New Data 1)) 
f2 --> d2((New Data 2)) --> f4
f3 --> d3((New Data 3)) --> f4

f4 --> d5((New Data of 2 and 3: Correlation))
```

## Cybex-P Analytics Repositories
- `analytics [Source Code]`
	- Main module  responsible for executing and maintaining the entirety of the Analytics Cluster.
- `Filters`:
	- Various filters that threat data is ran through
		- ***Cowrie***
		- ***OpenPhishFeed***
		- ***PhishTankFeed***
		- ***email***
		- ***sighting***

## analytics

The `analytics` file is the main source code that is reponsible for running and maintaining the analytics cluster. 

**Key Functions:**
> - ***infinite_worker(q)***
> - ***analytics()***

- 	***analytics.analytics()***
	-	
	-	The analytics function is essentially where the filters are loaded and executed before being sent to the ***infinite_worker()*** function. 
	-	When launched, a queue is created that all loaded filters will be placed in. As the filters are being placed into the queue, they are individually executed and ran as seen below:
	> -	filters = [Cowrie, Email, OpenPhishFeed, PhishTankFeed, Sighting]
	q = Queue()
	for f in filters:
	----- q.put(f().run)
	- Once stocked in the queue, a call to ***infinite_worker()*** is made with the queue.

-	***analytics.infinite_worker()***
	-	
	-	***infinite_worker()*** handles the responsibility of maintaining and handling those filters until the `Cybex-P Analytics Module` is shutdown or reset. 
	-	All filters that have been passed to the ***infinite_worker()*** have been executed previously and placed within a queue. Each filter, one at a time, is individually monitored and and re-executed by ***infinite_worker()*** as seen below:
	> -	while not q.empty():
	func = q.get()
	try:
	 *-----* r = func()
	 
	 - In the event(s) that the filters do not return anything to ***r** in the code above or  ***infinite_worker()*** catches any errors, the number of failed attempts (represented as *n_failed_attempts* in the code) will be increase. Increased failed attempts over time will result in longer exponential backoffs of the system; this is a sign that there is something potentially wrong with the filters of the worker function itself. Otherwise, successful attempts will always result in *n_failed_attempts* being set back to 0
	 > - r = func()
	 if not r:
	 ------ exponential_backoff(n_failed_attempts)
	 ------ n_failed_attempts += 1
	 else:
	 ------ n_failed_attempts = 0

## Filters
The `Cybex-P Analytics Module` has various filters; along with those filters are Event IDs in the source code that extract, label, and source each piece of threat data into specific categories of a filter. 

A an example of a filter event ID will look like - 
> - `ExampleEventID:`
	> 	- Type: Example ID
		> 		- This part of the example is where what type of information is extracted and stored is located
- ### ***common***
	--- 
	Common is base filter module that supplies the other modules below with the filter() method. The filter method essentially handles the parsing of Tahoe data and storing the data and it's hash to the backend.
-	### ***Cowrie***
	---
	Cowrie is a piece of open source software that can be used in any environment to emulate a UNIX system or SSH/Telnet Proxy; under the hood of the the system, it is a honeypot for gathering malicious SSH connections. The *Cowrie filter* itself processes the SSH login information provided by the cowrie system. 	
	
	Event IDs are ran through the following filters, each filter is categorized into the a *Type* which is the source of the threat data:
	
	-	`ClientKex`:
		-	Type: SSH
			-	Crpytographic client key exchange. Extract the key exchange information from a piece of threat data.
	- `ClientSize`:
		- Type: SSH
			- Height and Width of the threat data
	-	`ClientVar`:
		-	Type: SSH
			-	Client environment of the SSH attempt
	- `ClienVersion`:
		-	Type: SSH
			- Information on the client version of the SSH attempt
	- `CommandInput`:
		- Type: Shell Command
			- Records of the shell input and flags that were activated with the SSH attempt
	-	`DirectTcpIpData`:
		-	Type: Network Traffic
			- Information on the hostname, source, url, port number, and destination of a piece of threat data.
	-	`DirectTcpIpRequest`:
		-	Type: Network Traffic
			-	Extra appended information on the source and port of a TCP request.
	-	`LoginFailed`:
		-	Type: SSH
			-	Record on a failed login attempt. Logs information on the username and password.
	-	`LoginSuccess`:
		-	Type: SSH
			-	Record on a successful login attempt. Logs information on the username and password.
	-	`SessionClosed`:
		-	Type: Cybex-P Session Info
			- Logging and closing of a Cybex-P cowrie session
	-	`SessionConnect`:
		-	Type: Cybex-P Session Info
			-	Logging and executation of a Cybex-P cowrie
	-	`SessionFileDownload`:
		-	Type: File Download
			-	Information on a download of Cybex-P session information

- ### ***email***
	---
	The email filter takes raw email data and parses it into a Tahoe event. In Cybex-P, email data can be split into 8 different components as an email Tahoe event. However, not every piece of email contains the exact same elements so not all email records will contain all 8 components:
	-	From attribute
		-	contains the from email address and source's name
	-	Sending IP
		-	IPv4 address of the sender
	-	Source Object
		-	Source object is container of Cybex-P object data that contains the IPv4 address, the source's name, and the email address of a piece of email data. If any one of the 3 components is missing, a source object will not be created.
	-	Reply-to
		-	reply-to is a component that contains the replay-to address. If found, it is stored into Cybex-P as both an email address attribute and reply-to object
		> -	art = Attribute('email_addr', art)
				art = Object('reply_to', art)
	-	To attribute
		-	2 attributes that hold the name and email address of the email address that the email data was sent to
	-	destination object
		-	Like the source object, it is another Cybex-P object element that contains both the name and email address attributes of the *To attributes
	-	subject attribute
		-	Cybex-P Attribute of the emails subject
	-	Body
		-	Cybex-P Attribute of the emails body

All the previous acquired data is then stored in the backend one last time, congregated together, as a piece of Cybex-P event data. 

A raw hash of the event data is then returned. 


- ### ***openphish_feed***
	---
	The openphish filter deals with phishing intelligence and the identification any phishing URLs. It is derived from the openphish platform, a fully automated self-contained platform meant for large-scale phishing URL identification. The openphish filter has a single event ID:
		
	- `OpenPhish_Community`:
		- Type: Sighting
			-  Data that is passed through the openphish filter is compared to recent or previous URLs provided from the openphish platform. Whether a correlation is found or not, the the data gets updated and stored to help the malicious scoring system to judge the source.
- ### ***phishtank_feed***
	---- 
	 phishtank is another phishing intelligence platform that helps to provide the latest information on any URLs identified as phishing links. Unlike openphish, the phishtank platform is a collaborative community-based platform in which a large majority of phishing identification is done by the open community. Just like openphish, the phishtank filter pulls the information from the platform and is correlated against raw threat data.
	
	- `filt_phishtank`:
		- Type: phishtank-url
			-  Data that shows similar findings from the phishtank database are translated into Tahoe objects an stored in the backend.


- ### ***sighting***
	--- 
	sightings is a filter that functions as method to catching cowrie honeypot data and parsing it into Tahoe events.  When honey pot data is is ran through the sightings filter, the pieces of data in the event are categorized into one of two filters:
	
	-	*malicious*
	-	*benign*
	
	All pieces of cowrie honeypot data are then parsed into a Tahoe event and that event gets assigned to a particular category. The Tahoe event's reference hash is then generated and returned.

## Miscellaneous 
- 	### Config Repository
	- JSON format configurations of other module identities and the backend databases
		- api
		- cache
		- report
		- identity
		- tahoe
		- archive
		- analytics
- ### test/filters repository
	- Various files of unfiltered data accompanied with python files to test out the filters
