require('dotenv').config()  // To utilize .env files for importing sensitive credentials
const express = require('express');  // Express.js provides the framework for defining and implementing the API
const mysql = require('mysql');  // For making queries to the MySQL database
const util = require('util');  // For 'promisify', which ensures that queries return a promise

const app = express();
app.use(express.json());

// Throw an error if the SQL password was not found (e.g., file doesn't exist, file doesn't include SQL_READONLY_PW)
if (process.env.SQL_READONLY_PW === undefined) {
    throw 'Environment variable SQL_READONLY_PW is not defined, so a database connection cannot be established.'
}

// Define aspects of the MySQL connection which do not change, used to make every connection
const connection_details = {
    host: 'localhost',
    user: 'root',
    password: process.env.SQL_READONLY_PW,
    database: 'IP_Addresses'
}

//Retrieve Dates from a inbetween two Dates
//Code retrieved from https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getDates(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(new Date (currentDate));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

// Asynchronous function which takes an array of honeypots and queries the MySQL database accordingly
async function getHoneypot(honeypots, date_list) {
    // createConnection must be called before each new connection.
    const connection = mysql.createConnection(connection_details);

    // With the above connection object, attempt to establish a connection (and exit if doing so fails)
    connection.connect(function(err) {
        if (err) {
            console.error('SQL: Error connecting: ' + err.stack);  // Logs to the server console, not to the frontend
            return;
        }
        console.log('SQL: Connected as id ' + connection.threadId);
    });
    // Method for 'promisifying' the connection as per the below issue
    // https://github.com/mysqljs/mysql/issues/1755#issuecomment-345459882
    const queryFunction = util.promisify(connection.query).bind(connection);
    const rows = [];  // Will eventually contain the entire query

    // Two cases - 1. no dates are provided or 2. one or more dates provided
    if (date_list.length === 0) {
        for (const honeypot of honeypots) { // For each honeypot in the given honeypot array. Opportunity for error handling (i.e., what if 'honeypots' isn't an array?)
            let query = 'SELECT * FROM ??';  // ?? is the placeholder for the table // TODO: Move away from hardocded limit?
            let row = await queryFunction(query, [honeypot]);  // Await the result of the query before proceeding 
            row.forEach(object => object.Honeypot = honeypot); // Ensure that each row includes a property indicating which honeypot was attacked, used in the frontend extensively
            rows.push(row); // Push the object to the array
        }
    } else {
        for (const date of date_list) {
            let queryYear = date.getFullYear();
            let queryMonth = date.getMonth();
            let queryDate = date.getDate();
            queryMonth += 1; // Dates returned by .getMonth() are 0-based, not 1-based
            // Pad both the month and day to be two digits
            queryMonth = queryMonth.toString().padStart(2, '0');
            queryDate = queryDate.toString().padStart(2, '0');
            let formatted_date = "%" + queryYear + "-" + queryMonth + "-" + queryDate + "%";
            for (const honeypot of honeypots) {
                let query = 'SELECT * FROM ?? WHERE Dates LIKE ?';
                let row = await queryFunction(query, [honeypot, formatted_date]);
                row.forEach(object => object.Honeypot = honeypot);
                rows.push(row);
            }
        }
    }

    connection.end(function(err) {  // The connection must be closed to be able to make future connections
        if (err) {
            console.error('SQL: Error terminating connection: ' + err.stack);
            // TODO: More complete error handling? Perhaps connection.destroy()?
        }
        console.log("SQL: Disconnected id " + connection.threadId);
      });
    return Promise.all(rows); // This returned promise will resolve when all of the input's promises have resolved
}

app.post('/api/attacks', async (req, res, next) => {
    try {
        let date_iterable = [];
        if(req.body.dateRange != null) {
            date_iterable = getDates( new Date(req.body.dateRange[0]), new Date(req.body.dateRange[1]) );
        } 
        const ret = await getHoneypot(req.body.honeypots, date_iterable);  // Try to get the value that we are going to respond to the request with
        res.json(ret);  // Respond with the return value in JSON format
    } catch (error) {
        // Passes errors into the error handler
        // TODO: This will likely need to change outside of the development environment
        return next(error);
    }
});

const port = process.env.PORT || 3001;  // API will operate on port 3001 unless otherwise specified in the .env file.
app.listen(port, () => console.log(`Server listening on port ${port}...`));  // When the API starts, it will lisen on the specified port