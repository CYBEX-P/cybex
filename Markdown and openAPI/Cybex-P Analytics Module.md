**Key Functions:**
> - ***infinite_worker(q)***
> - ***analytics()***

-	***analytics.analytics()***
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

# Filters
Foo