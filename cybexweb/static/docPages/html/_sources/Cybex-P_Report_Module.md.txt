# Cybex-P Report Module
The `Cybex-P Report Module` is the final stop of processing for threat data in the system and where reports are generated and provided to the frontend web client.

Cybex-P has a unique way in storing cyberthreat data in which the data is stored in graphs and the vertices amongst those graphs represent various attributes or events. Because of the way data is stored, Cybex-P has it's own unique way of generating insightful reports.  

In regards to complexity in terms of the information provided from a report, a report can be something as straightforward as countign the occurences of a specific IP address within a time range to the correlational analysis of the attributes of a single URL. 

***<u>Data Pipeline</u>***

```{mermaid}
sequenceDiagram
Note Left of Archive-Database: Begin data pipeline<br> here 
Archive-Database->> Report-Cluster: Encrypted query
Report-Cluster->> Report-Database: Report creation and storing of the report
Report-Database->> Cybex-P-API: Pull report on demand

```
***Part 1: Query handling and processing***
```{mermaid}
sequenceDiagram
Note Left of Cybex-P-API: API has pulled the<br>report from the<br> report database
Cybex-P-API->> Frontend-Server: Frontend server pulls the report data
Frontend-Server->> Frontend-Webclient: Frontend web client pulls the report data and presents the information 
```
***Part 2: Sending back the report and serving it to the frontend web application.***
## Cybex-P Report Module Repositories
-	`report [source code]`:
	-	setting time range of a record
	-	raw threat data parsing
	-	query decryption
	-	Report types:
		-	Attribute occurence counting
		-	Related sub_type 
		-	Threat rank processing
## report
The report repository is the source code that is entirely responsible for all aspects of the `Cybex-P Report Module`. The report source code is split up into various sections for handling report generation and queries:
-	timelime recording and administration
-	file decryption (for report querys made by the frontend client)
-  query decanonicalizing
- 	report type generation
- report transferring via sockets

***key functions***:
> - get_dtrange()
> - decrypt_file()
> - get_query()
> - process_query()
> - get_report()
> - main()

- ***get_dtrange()***
	- 
	- parameters:
	> - ***from_*** = timeline value of when the threat data was received
	> - ***to*** = timeline value of when the session of the  threat data was completed
	> - ***last*** = last valid timeline value of the threat data
	> - ***tzname*** = name of the timezone of the current user

	- This function is responsible for translating the timeline of the provided threat data and parsing it
into the local timezone of the user who made the query.

- ***decrypt_file()***
	- 
	- the ***decrypt_file()*** functions works as exactly like the decrypt_file function located in the `Cybex-P Archive Module`. In this case its purpose serves to decrypt the querys provided from the `Cybex-P API Module`. 

- ***get_query()***
	-
	- get_query() serves to be the method that will consistently pull query request made to the report module provided from the archive database. get_query() encodes those querys into a TDQL and places it into a queue for processing. 
		>  tdql = parse(i, backend=Report._backend, validate=False)
		> tdql.status = 'processing'
		> queue.put(tdql)
	
	
	-	This process is ran forever in it's own thread. 

- ***get_report()***
	- 
	get_report() is responsible for generating a report from a single TDQL object when called. 

	The TDQL is first evaluated evaluated and decrypted from by the **decrypt_file()** function.
	> - if tdql.encrypted:
			--- canonical_qdata = decrypt_file(canonical_qdata)

	
	 Proceeding the file decryption, parameters are extracted from the decrypted data such as teh category, context data, and return type.
	 > - category = qdata.pop('category', 'all')
	 context = qdata.pop('context', 'all')
	 return_type = qdata.pop('return_type', 'all')

	the timelime values are then extractd from the query and the **get_dtrange()** function is called to set the timelime according the timezone of the query.
	> - from_ = query.pop('from', None)
	> - to = query.pop('to', None)
	> - last = query.pop('last', None)
	> - tzname = query.pop('tzname', None)
	> - try:
		---	start, end = get_dtrange(from_, to, last, tzname)
	
	 At this point we can proceed to othe actual generation of the report requested by the query. Recall from this modules repository that we have three different report generation types; these three different report types are labeled, in Cybex-P terminology as:
		- `count`:
			- A report based on the on the number of occurences of a specific attribute as indicated by the sub type from the query
		- `related`: 
			- A report based around all events related to a specific attributed within the provided time range of the query
		-	`threat rank`:
			-	A report based on generating the threat rank of an event. This sort of report is more complicated compared to the other report types as this report requires running the an even through Cybex-P's own threat rank evaluation algorithm.

	In the event that none of the report types above correlate to the report type that is requested by the query. the query status is set to "failed".
	> - query.status = 'failed'
	

- **Process_Query()**
	- 
	Process query is a method that is used to process a single TDQL instance. It handles the address signing and websocket execution of where a processed TDQL report is to go outside of the API.
	
	 Once the report is done generating (or the query is marked a "failure), we can go ahead and extract the report and encode all related parts of the query into a block of bytes.
	> -	if not isinstance(nonce, bytes):
	> -	--- nonce = nonce.encode()
	
	 At the final step, we use websockets to connect to the host API and send the report back.
	> - sock.connect((host, port))
	> - sock.send(nonce)

- ***Main()***
	- 
	Main() is responsible for initializating the forever running query queue and consistently checking and executing any available TDQLs in the queue.
	>  queue = Queue()
	thread_producer = Thread(target=get_query, args=(queue, ))

	executing querys to process:
	> with ThreadPoolExecutor(64) as executor:
	--- executor.map(process_query, iter(queue.get, None))