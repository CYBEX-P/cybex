#!/bin/bash

# Just printing to the terminal to be informed of which script is running.
echo "Running Python Scripts"

# This command call a parent python script to start the all of the sub python scripts.
python3 /home/team15/Scripts/python_runner.py

# Just printing to the terminal to be informed of which script is running.
echo "Done Running Python Scripts"

# Just printing to the terminal to be informed of which script is running.
echo "Running Mysql Command"

# This command call a mysql script to update the database.
mysql < /home/team15/Scripts/Create_Database.sql

# Just printing to the terminal to be informed of which script is running.
echo "Done Running Mysql Command"
