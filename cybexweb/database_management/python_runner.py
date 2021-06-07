import os

# Just printing to the terminal to be informed of which script is running.
print("FileGetter")

# This command call the first python subscript to start the download of the files from data server.
os.system("python3 /home/team15/Scripts/fileGetter.py")

# Just printing to the terminal to be informed of which script is running.
print("IPAddressesExtractor")

# This command call the second python subscript to start the extraction of data from the files downloaded.
os.system("python3 /home/team15/Scripts/IPAddressesExtractor.py")

# Just printing to the terminal to be informed of which script is running.
print("IPToGeo")

# This command call the third python subscript to start the conversion of IP Addresses to Geo Locations.
os.system("python3 /home/team15/Scripts/IPToGeo.py")

# Just printing to the terminal to be informed of which script is running.
print("DatabaseCreator")

# This command call the last python subscript to create a framework for the database.
os.system("python3 /home/team15/Scripts/databaseCreator.py")
