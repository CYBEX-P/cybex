-- Create the database if doesn't already exists

CREATE DATABASE IF NOT EXISTS IP_Addresses;

-- Change the database to IP_Addresses

USE IP_Addresses;

-- Drop the Amsterdam table if it already exists as we are regenerating the table everyday.

DROP TABLE IF EXISTS Amsterdam;

-- Create the Amsterdam table with it associated attributes.

CREATE TABLE Amsterdam
(
--  This column will contain a unique IP Address and is also the primary key.
    IP_Address VARCHAR(100) NOT NULL PRIMARY KEY,
-- 	This column will contain the latitude coordinates after the IP Address to Geo Location conversion.
    Latitude VARCHAR(100) NOT NULL,
-- 	This column will contain the Longitude coordinates after the IP Address to Geo Location conversion.
    Longitude VARCHAR(100) NOT NULL,
--  This column will contain a set of dates on which this particular honeypot was attacked by the given IP Address.
    Dates TEXT NOT NULL,
--  This column will contain the number of time in total since August 1st, 2020 has this honeypot has been targeted.
    Counts INT(1)
);

-- The data for the Amsterdam table is loaded from a csv.

LOAD DATA INFILE '/Users/adamcassell/VSCodeRepos/Cybex-Honeypot-Visualizer/database_management/DatabaseAmsterdam.csv'
INTO TABLE Amsterdam
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n';

-- Drop the Bangalore table if it already exists as we are regenerating the table everyday.

DROP TABLE IF EXISTS Bangalore;

-- Create the Bangalore table with it associated attributes.

CREATE TABLE Bangalore
(
--  This column will contain a unique IP Address and is also the primary key.
	IP_Address VARCHAR(100) NOT NULL PRIMARY KEY,
-- 	This column will contain the latitude coordinates after the IP Address to Geo Location conversion.
    Latitude VARCHAR(100) NOT NULL,
-- 	This column will contain the Longitude coordinates after the IP Address to Geo Location conversion.
	Longitude VARCHAR(100) NOT NULL,
--  This column will contain a set of dates on which this particular honeypot was attacked by the given IP Address.
	Dates TEXT NOT NULL,
--  This column will contain the number of time in total since August 1st, 2020 has this honeypot has been targeted.
	Counts INT(1)
);

-- The data for the Bangalore table is loaded from a csv.

LOAD DATA INFILE '/Users/adamcassell/VSCodeRepos/Cybex-Honeypot-Visualizer/database_management/DatabaseBangalore.csv'
INTO TABLE Bangalore
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n';

-- Drop the London table if it already exists as we are regenerating the table everyday.

DROP TABLE IF EXISTS London;

-- Create the London table with it associated attributes.

CREATE TABLE London
(
--  This column will contain a unique IP Address and is also the primary key.
    IP_Address VARCHAR(100) NOT NULL PRIMARY KEY,
-- 	This column will contain the latitude coordinates after the IP Address to Geo Location conversion.
    Latitude VARCHAR(100) NOT NULL,
-- 	This column will contain the Longitude coordinates after the IP Address to Geo Location conversion.
    Longitude VARCHAR(100) NOT NULL,
--  This column will contain a set of dates on which this particular honeypot was attacked by the given IP Address.
    Dates TEXT NOT NULL,
--  This column will contain the number of time in total since August 1st, 2020 has this honeypot has been targeted.
    Counts INT(1)
);

-- The data for the London table is loaded from a csv.

LOAD DATA INFILE '/Users/adamcassell/VSCodeRepos/Cybex-Honeypot-Visualizer/database_management/DatabaseLondon.csv'
INTO TABLE London
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n';

-- Drop the New_York table if it already exists as we are regenerating the table everyday.

DROP TABLE IF EXISTS New_York;

-- Create the New_York table with it associated attributes.

CREATE TABLE New_York
(
--  This column will contain a unique IP Address and is also the primary key.
	IP_Address VARCHAR(100) NOT NULL PRIMARY KEY,
-- 	This column will contain the latitude coordinates after the IP Address to Geo Location conversion.
	Latitude VARCHAR(100) NOT NULL,
-- 	This column will contain the Longitude coordinates after the IP Address to Geo Location conversion.
	Longitude VARCHAR(100) NOT NULL,
--  This column will contain a set of dates on which this particular honeypot was attacked by the given IP Address.
	Dates TEXT NOT NULL,
--  This column will contain the number of time in total since August 1st, 2020 has this honeypot has been targeted.
	Counts INT(1)
);

-- The data for the New_York table is loaded from a csv.

LOAD DATA INFILE '/Users/adamcassell/VSCodeRepos/Cybex-Honeypot-Visualizer/database_management/DatabaseNew_York.csv'
INTO TABLE New_York
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n';

-- Drop the Singapore table if it already exists as we are regenerating the table everyday.

DROP TABLE IF EXISTS Singapore;

-- Create the Singapore table with it associated attributes.

CREATE TABLE Singapore
(
--  This column will contain a unique IP Address and is also the primary key.
	IP_Address VARCHAR(100) NOT NULL PRIMARY KEY,
-- 	This column will contain the latitude coordinates after the IP Address to Geo Location conversion.
	Latitude VARCHAR(100) NOT NULL,
-- 	This column will contain the Longitude coordinates after the IP Address to Geo Location conversion.
	Longitude VARCHAR(100) NOT NULL,
--  This column will contain a set of dates on which this particular honeypot was attacked by the given IP Address.
	Dates TEXT NOT NULL,
--  This column will contain the number of time in total since August 1st, 2020 has this honeypot has been targeted.
	Counts INT(1)
);

-- The data for the Singapore table is loaded from a csv.

LOAD DATA INFILE '/Users/adamcassell/VSCodeRepos/Cybex-Honeypot-Visualizer/database_management/DatabaseSingapore.csv'
INTO TABLE Singapore
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n';

-- Drop the Toronto table if it already exists as we are regenerating the table everyday.

DROP TABLE IF EXISTS Toronto;

-- Create the Toronto table with it associated attributes.

CREATE TABLE Toronto
(
--  This column will contain a unique IP Address and is also the primary key.
	IP_Address VARCHAR(100) NOT NULL PRIMARY KEY,
-- 	This column will contain the latitude coordinates after the IP Address to Geo Location conversion.
	Latitude VARCHAR(100) NOT NULL,
-- 	This column will contain the Longitude coordinates after the IP Address to Geo Location conversion.
	Longitude VARCHAR(100) NOT NULL,
--  This column will contain a set of dates on which this particular honeypot was attacked by the given IP Address.
	Dates TEXT NOT NULL,
--  This column will contain the number of time in total since August 1st, 2020 has this honeypot has been targeted.
	Counts INT(1)
);

-- The data for the Toronto table is loaded from a csv.

LOAD DATA INFILE '/Users/adamcassell/VSCodeRepos/Cybex-Honeypot-Visualizer/database_management/DatabaseToronto.csv'
INTO TABLE Toronto
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n';
