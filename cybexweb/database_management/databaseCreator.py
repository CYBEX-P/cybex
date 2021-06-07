from tqdm import tqdm
from os.path import join
import csv


# This class is used to properly organize the data so that it can easily be imported into the database.
class Database:
    IP_Address = 0.0
    Latitude = 0.0
    Longitude = 0.0
    Dates = set()
    TotalAttacks = 0

    # This function is used to initialize the class objects.
    def __init__(self, ip_address, latitude, longitude):
        self.IP_Address = ip_address
        self.Latitude = latitude
        self.Longitude = longitude


# This function is used to create the initial database using the IP Addresses, and Geo Coordinates.
def create_initial_database(file_path):
    database = []
    with open(file_path, "r") as input_file:
        location_reader = csv.reader(input_file)
        for items_reader in location_reader:
            database.append(Database(items_reader[0], items_reader[1], items_reader[2]))
    return database


# This function is used to add the Dates Column to the database.
def add_dates_to_database(file_path, database):
    with open(file_path, "r") as input_file:
        dates_reader = csv.reader(input_file)
        for items_dates in tqdm(dates_reader):
            dates = items_dates[1:]
            for i in range(0, len(database)):
                if items_dates[0] == database[i].IP_Address:
                    database[i].Dates = set(dates)
                    break


# This function is used to add the Counts Column to the database.
def add_counts_to_database(file_path, database):
    with open(file_path, "r") as input_file:
        counts_reader = csv.reader(input_file)
        for items in tqdm(counts_reader):
            for i in range(0, len(database)):
                if items[0] == database[i].IP_Address:
                    database[i].TotalAttacks = items[1]


# Once the database has been created it is outputted to a file so that the file can be used to import it into a mysql database.
def write_database_to_file(file_path, database):
    with open(file_path, "w") as output_file:
        for i in range(0, len(database)):
            output_file.write(str(database[i].IP_Address) + "," + str(database[i].Latitude) + "," + str(database[i].Longitude) + ",")
            j = 0
            for items_dates in database[i].Dates:
                output_file.write(str(items_dates) + ";")
                j += 1
                if j < len(database[i].Dates):
                    output_file.write(" ")
            output_file.write("," + str(database[i].TotalAttacks) + "\n")


# The following variable specifies the path of the local directory that contains the data.
inputFileDirectory = "/home/team15/Data/"

# The following variables are used to append the input directory path and the filenames which contains geolocation data.
inputFileIPAddressLocationAmsterdam = join(inputFileDirectory, "uniqueIPAddressesLocationAmsterdam.csv")
inputFileIPAddressLocationBangalore = join(inputFileDirectory, "uniqueIPAddressesLocationBangalore.csv")
inputFileIPAddressLocationLondon = join(inputFileDirectory, "uniqueIPAddressesLocationLondon.csv")
inputFileIPAddressLocationNew_York = join(inputFileDirectory, "uniqueIPAddressesLocationNew_York.csv")
inputFileIPAddressLocationSingapore = join(inputFileDirectory, "uniqueIPAddressesLocationSingapore.csv")
inputFileIPAddressLocationToronto = join(inputFileDirectory, "uniqueIPAddressesLocationToronto.csv")

# The following variables are used to append the input directory path and the filenames which contains dates data.
inputFileIPAddressDatesAmsterdam = join(inputFileDirectory, "IPAddressesDatesAmsterdam.csv")
inputFileIPAddressDatesBangalore = join(inputFileDirectory, "IPAddressesDatesBangalore.csv")
inputFileIPAddressDatesLondon = join(inputFileDirectory, "IPAddressesDatesLondon.csv")
inputFileIPAddressDatesNew_York = join(inputFileDirectory, "IPAddressesDatesNew_York.csv")
inputFileIPAddressDatesSingapore = join(inputFileDirectory, "IPAddressesDatesSingapore.csv")
inputFileIPAddressDatesToronto = join(inputFileDirectory, "IPAddressesDatesToronto.csv")

# The following variables are used to append the input directory path and the filenames which contains counts data.
inputFileIPAddressCountsAmsterdam = join(inputFileDirectory, "IPAddressesCountsAmsterdam.csv")
inputFileIPAddressCountsBangalore = join(inputFileDirectory, "IPAddressesCountsBangalore.csv")
inputFileIPAddressCountsLondon = join(inputFileDirectory, "IPAddressesCountsLondon.csv")
inputFileIPAddressCountsNew_York = join(inputFileDirectory, "IPAddressesCountsNew_York.csv")
inputFileIPAddressCountsSingapore = join(inputFileDirectory, "IPAddressesCountsSingapore.csv")
inputFileIPAddressCountsToronto = join(inputFileDirectory, "IPAddressesCountsToronto.csv")

# The following variables are used to append the input directory path and the output filenames.
outputDatabaseAmsterdam = join(inputFileDirectory, "DatabaseAmsterdam.csv")
outputDatabaseBangalore = join(inputFileDirectory, "DatabaseBangalore.csv")
outputDatabaseLondon = join(inputFileDirectory, "DatabaseLondon.csv")
outputDatabaseNew_York = join(inputFileDirectory, "DatabaseNew_York.csv")
outputDatabaseSingapore = join(inputFileDirectory, "DatabaseSingapore.csv")
outputDatabaseToronto = join(inputFileDirectory, "DatabaseToronto.csv")

# The create_initial_database function is called below to create an initial .
databaseAmsterdam = create_initial_database(inputFileIPAddressLocationAmsterdam)
databaseBangalore = create_initial_database(inputFileIPAddressLocationBangalore)
databaseLondon = create_initial_database(inputFileIPAddressLocationLondon)
databaseNew_York = create_initial_database(inputFileIPAddressLocationNew_York)
databaseSingapore = create_initial_database(inputFileIPAddressLocationSingapore)
databaseToronto = create_initial_database(inputFileIPAddressLocationToronto)

# The add_dates_to_database function is called below to add the dates columns to the database.
add_dates_to_database(inputFileIPAddressDatesAmsterdam, databaseAmsterdam)
add_dates_to_database(inputFileIPAddressDatesBangalore, databaseBangalore)
add_dates_to_database(inputFileIPAddressDatesLondon, databaseLondon)
add_dates_to_database(inputFileIPAddressDatesNew_York, databaseNew_York)
add_dates_to_database(inputFileIPAddressDatesSingapore, databaseSingapore)
add_dates_to_database(inputFileIPAddressDatesToronto, databaseToronto)

# The add_counts_to_database function is called below to add the counts columns to the database.
add_counts_to_database(inputFileIPAddressCountsAmsterdam, databaseAmsterdam)
add_counts_to_database(inputFileIPAddressCountsBangalore, databaseBangalore)
add_counts_to_database(inputFileIPAddressCountsLondon, databaseLondon)
add_counts_to_database(inputFileIPAddressCountsNew_York, databaseNew_York)
add_counts_to_database(inputFileIPAddressCountsSingapore, databaseSingapore)
add_counts_to_database(inputFileIPAddressCountsToronto, databaseToronto)

# The write_database_to_file function is called below to write the database to a file so that it can imported into mysql.
write_database_to_file(outputDatabaseAmsterdam, databaseAmsterdam)
write_database_to_file(outputDatabaseBangalore, databaseBangalore)
write_database_to_file(outputDatabaseLondon, databaseLondon)
write_database_to_file(outputDatabaseNew_York, databaseNew_York)
write_database_to_file(outputDatabaseSingapore, databaseSingapore)
write_database_to_file(outputDatabaseToronto, databaseToronto)
