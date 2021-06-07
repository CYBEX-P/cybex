import json
from tqdm import tqdm
from collections import Counter
from os.path import join
import csv


# This function is used to read all of the filenames that needs to be processed so that we don't reprocess the files that we have already processed.
def file_name_getter(file_path):
    file_list = []
    with open(file_path, "r") as input_file:
        for files in input_file:
            file_list.append(str(files).strip("\n"))
    return file_list


# This function is used to read all of the previous dates that have been processed so don't reprocess the IP Addresses attack Dates that we have already processed.
def get_previous_dates(file_path):
    dates_dictionary = {}
    with open(file_path, "r") as inputFile:
        csv_reader = csv.reader(inputFile)
        for items_dates in csv_reader:
            dates_list = items_dates[1:]
            dates_dictionary[items_dates[0]] = set()
            for i in dates_list:
                dates_dictionary[items_dates[0]].add(i)
    return dates_dictionary


# This function is used to extract all of the IP Addresses that are part of the log files and append the new date to the existing set.
def ip_address_extractor(file_list, ip_addresses_dates):
    ip_addresses = []
    for file in tqdm(file_list):
        try:
            with open(file, "r") as input_file:
                for items in input_file:
                    try:
                        data = json.loads(items)
                        ip_address = data["src_ip"]
                        ip_addresses.append(ip_address)
                        timestamp = str(data["timestamp"]).split("T", 1)
                        date_object = timestamp[0]
                        if ip_address not in ip_addresses_dates.keys():
                            ip_addresses_dates[ip_address] = set()
                            ip_addresses_dates[ip_address].add(date_object)
                        else:
                            ip_addresses_dates[ip_address].add(date_object)
                    except:
                        pass
        except:
            pass
    return ip_addresses


# Once all of the IP Addresses and Dates have been processed they are outputted to a file so that the data can be used to update the database.
def write_dates_to_file(dates_dictionary, file_path):
    with open(file_path, "w") as output_file:
        for keys, values in dates_dictionary.items():
            output_file.write(str(keys) + ",")
            i = 0
            for items in values:
                output_file.write(str(items))
                i += 1
                if i < len(values):
                    output_file.write(",")
            output_file.write("\n")


# This function is used to read all of the previously processed IP Addresses so don't reprocess the IP Addresses that we have already processed.
def get_previous_ip_addresses(file_path):
    ip_addresses = set()
    with open(file_path, "r") as input_file:
        for items_address in input_file:
            ip_addresses.add(str(items_address).strip("\n"))
    return ip_addresses


# This function is used to extract a unique set of IP Addresses from the list of IP Addresses extracted from the log files which is then used to create the final database.
def unique_ip_address_extractor(unique_list, ip_addresses):
    for items_list in ip_addresses:
        unique_list.add(items_list)


# This function is used to read all of the previously counts of IP Addresses so don't have to count the IP Addresses that we have already counted.
def get_previous_counts(file_path):
    counts = {}
    with open(file_path, "r") as inputFile:
        csv_reader = csv.reader(inputFile)
        for items_counts in csv_reader:
            counts[items_counts[0]] = items_counts[1]
    return counts


# This function is used to update the counts for the IP Addresses with counts from today's log files.
def update_counts(new_counts, old_counts):
    for keys, values in new_counts.items():
        if keys in old_counts:
            old_counts[keys] = int(old_counts[keys]) + values
        else:
            old_counts[keys] = values


# Once all of the Counts have been updated they are outputted to a file so that the data can be used to update the database.
def write_counts_to_file(dictionary_object, file_path):
    with open(file_path, "w") as output_file:
        for keys, values in dictionary_object.items():
            output_file.write(str(keys) + "," + str(values) + "\n")


# Once all of the Unique IP Addresses have been extracted they are outputted to a file so that the data can be used to update the database.
def write_unique_ip_addresses_to_file(unique_ip_addresses_set, file_path):
    with open(file_path, "w") as output:
        for items in unique_ip_addresses_set:
            output.write(str(items) + "\n")


# The following variable specifies the path of the local directory that contains the data.
mainDirectoryPath = "/home/team15/Data/"

# The following variables are used to append the directory path and the filenames.
inputFilesDirectoryPathAmsterdam = join(mainDirectoryPath, "filesToProcessAmsterdam.txt")
inputFilesDirectoryPathBangalore = join(mainDirectoryPath, "filesToProcessBangalore.txt")
inputFilesDirectoryPathLondon = join(mainDirectoryPath, "filesToProcessLondon.txt")
inputFilesDirectoryPathNew_York = join(mainDirectoryPath, "filesToProcessNew_York.txt")
inputFilesDirectoryPathSingapore = join(mainDirectoryPath, "filesToProcessSingapore.txt")
inputFilesDirectoryPathToronto = join(mainDirectoryPath, "filesToProcessToronto.txt")

# The following variables are used to append the directory path and the filenames.
datesDirectoryPathAmsterdam = join(mainDirectoryPath, "IPAddressesDatesAmsterdam.csv")
datesDirectoryPathBangalore = join(mainDirectoryPath, "IPAddressesDatesBangalore.csv")
datesDirectoryPathLondon = join(mainDirectoryPath, "IPAddressesDatesLondon.csv")
datesDirectoryPathNew_York = join(mainDirectoryPath, "IPAddressesDatesNew_York.csv")
datesDirectoryPathSingapore = join(mainDirectoryPath, "IPAddressesDatesSingapore.csv")
datesDirectoryPathToronto = join(mainDirectoryPath, "IPAddressesDatesToronto.csv")

# The following variables are used to append the directory path and the filenames.
countsDirectoryPathAmsterdam = join(mainDirectoryPath, "IPAddressesCountsAmsterdam.csv")
countsDirectoryPathBangalore = join(mainDirectoryPath, "IPAddressesCountsBangalore.csv")
countsDirectoryPathLondon = join(mainDirectoryPath, "IPAddressesCountsLondon.csv")
countsDirectoryPathNew_York = join(mainDirectoryPath, "IPAddressesCountsNew_York.csv")
countsDirectoryPathSingapore = join(mainDirectoryPath, "IPAddressesCountsSingapore.csv")
countsDirectoryPathToronto = join(mainDirectoryPath, "IPAddressesCountsToronto.csv")

# The following variables are used to append the directory path and the filenames.
uniqueIPAddressesPathAmsterdam = join(mainDirectoryPath, "uniqueIPAddressesAmsterdam.txt")
uniqueIPAddressesPathBangalore = join(mainDirectoryPath, "uniqueIPAddressesBangalore.txt")
uniqueIPAddressesPathLondon = join(mainDirectoryPath, "uniqueIPAddressesLondon.txt")
uniqueIPAddressesPathNew_York = join(mainDirectoryPath, "uniqueIPAddressesNew_York.txt")
uniqueIPAddressesPathSingapore = join(mainDirectoryPath, "uniqueIPAddressesSingapore.txt")
uniqueIPAddressesPathToronto = join(mainDirectoryPath, "uniqueIPAddressesToronto.txt")

# The file_name_getter function is called below to get a list of files to process.
fileNamesAmsterdam = file_name_getter(inputFilesDirectoryPathAmsterdam)
fileNamesBangalore = file_name_getter(inputFilesDirectoryPathBangalore)
fileNamesLondon = file_name_getter(inputFilesDirectoryPathLondon)
fileNamesNew_York = file_name_getter(inputFilesDirectoryPathNew_York)
fileNamesSingapore = file_name_getter(inputFilesDirectoryPathSingapore)
fileNamesToronto = file_name_getter(inputFilesDirectoryPathToronto)

# The get_previous_dates function is called below to get a create a cache of previously processed dates.
IPAddressesDatesAmsterdam = get_previous_dates(datesDirectoryPathAmsterdam)
IPAddressesDatesBangalore = get_previous_dates(datesDirectoryPathBangalore)
IPAddressesDatesLondon = get_previous_dates(datesDirectoryPathLondon)
IPAddressesDatesNew_York = get_previous_dates(datesDirectoryPathNew_York)
IPAddressesDatesSingapore = get_previous_dates(datesDirectoryPathSingapore)
IPAddressesDatesToronto = get_previous_dates(datesDirectoryPathToronto)

# The ip_address_extractor function is called below to get extract a the IP Addresses from the new set of log files.
IPAddressesAmsterdam = ip_address_extractor(fileNamesAmsterdam, IPAddressesDatesAmsterdam)
IPAddressesBangalore = ip_address_extractor(fileNamesBangalore, IPAddressesDatesBangalore)
IPAddressesLondon = ip_address_extractor(fileNamesLondon, IPAddressesDatesLondon)
IPAddressesNew_York = ip_address_extractor(fileNamesNew_York, IPAddressesDatesNew_York)
IPAddressesSingapore = ip_address_extractor(fileNamesSingapore, IPAddressesDatesSingapore)
IPAddressesToronto = ip_address_extractor(fileNamesToronto, IPAddressesDatesToronto)

# The write_dates_to_file function is called below to write the updated dates to the output file.
write_dates_to_file(IPAddressesDatesAmsterdam, datesDirectoryPathAmsterdam)
write_dates_to_file(IPAddressesDatesBangalore, datesDirectoryPathBangalore)
write_dates_to_file(IPAddressesDatesLondon, datesDirectoryPathLondon)
write_dates_to_file(IPAddressesDatesNew_York, datesDirectoryPathNew_York)
write_dates_to_file(IPAddressesDatesSingapore, datesDirectoryPathSingapore)
write_dates_to_file(IPAddressesDatesToronto, datesDirectoryPathToronto)

# The get_previous_counts function is called below to get a create a cache of previously processed counts.
dictIPAddressAmsterdam = get_previous_counts(countsDirectoryPathAmsterdam)
dictIPAddressBangalore = get_previous_counts(countsDirectoryPathBangalore)
dictIPAddressLondon = get_previous_counts(countsDirectoryPathLondon)
dictIPAddressNew_York = get_previous_counts(countsDirectoryPathNew_York)
dictIPAddressSingapore = get_previous_counts(countsDirectoryPathSingapore)
dictIPAddressToronto = get_previous_counts(countsDirectoryPathToronto)

# The following variables are used to generate the counts for the processed IP Addresses.
newDictIPAddressAmsterdam = Counter(IPAddressesAmsterdam)
newDictIPAddressBangalore = Counter(IPAddressesBangalore)
newDictIPAddressLondon = Counter(IPAddressesLondon)
newDictIPAddressNew_York = Counter(IPAddressesNew_York)
newDictIPAddressSingapore = Counter(IPAddressesSingapore)
newDictIPAddressToronto = Counter(IPAddressesToronto)

# The update_counts function is called below to counts of the IP Addresses.
update_counts(newDictIPAddressAmsterdam, dictIPAddressAmsterdam)
update_counts(newDictIPAddressBangalore, dictIPAddressBangalore)
update_counts(newDictIPAddressLondon, dictIPAddressLondon)
update_counts(newDictIPAddressNew_York, dictIPAddressNew_York)
update_counts(newDictIPAddressSingapore, dictIPAddressSingapore)
update_counts(newDictIPAddressToronto, dictIPAddressToronto)

# The write_counts_to_file function is called below to write the updated counts to the output file.
write_counts_to_file(dictIPAddressAmsterdam, countsDirectoryPathAmsterdam)
write_counts_to_file(dictIPAddressBangalore, countsDirectoryPathBangalore)
write_counts_to_file(dictIPAddressLondon, countsDirectoryPathLondon)
write_counts_to_file(dictIPAddressNew_York, countsDirectoryPathNew_York)
write_counts_to_file(dictIPAddressSingapore, countsDirectoryPathSingapore)
write_counts_to_file(dictIPAddressToronto, countsDirectoryPathToronto)

# The get_previous_ip_addresses function is called below to get a create a cache of previously processed IP Addresses.
uniqueIPAddressesAmsterdam = get_previous_ip_addresses(uniqueIPAddressesPathAmsterdam)
uniqueIPAddressesBangalore = get_previous_ip_addresses(uniqueIPAddressesPathBangalore)
uniqueIPAddressesLondon = get_previous_ip_addresses(uniqueIPAddressesPathLondon)
uniqueIPAddressesNew_York = get_previous_ip_addresses(uniqueIPAddressesPathNew_York)
uniqueIPAddressesSingapore = get_previous_ip_addresses(uniqueIPAddressesPathSingapore)
uniqueIPAddressesToronto = get_previous_ip_addresses(uniqueIPAddressesPathToronto)

# The unique_ip_address_extractor function is called below to get a unique set of IP Addresses.
unique_ip_address_extractor(uniqueIPAddressesAmsterdam, IPAddressesAmsterdam)
unique_ip_address_extractor(uniqueIPAddressesBangalore, IPAddressesBangalore)
unique_ip_address_extractor(uniqueIPAddressesLondon, IPAddressesLondon)
unique_ip_address_extractor(uniqueIPAddressesNew_York, IPAddressesNew_York)
unique_ip_address_extractor(uniqueIPAddressesSingapore, IPAddressesSingapore)
unique_ip_address_extractor(uniqueIPAddressesToronto, IPAddressesToronto)

# The write_unique_ip_addresses_to_file function is called below to write the updated unique IP Addresses to the output file.
write_unique_ip_addresses_to_file(uniqueIPAddressesAmsterdam, uniqueIPAddressesPathAmsterdam)
write_unique_ip_addresses_to_file(uniqueIPAddressesBangalore, uniqueIPAddressesPathBangalore)
write_unique_ip_addresses_to_file(uniqueIPAddressesLondon, uniqueIPAddressesPathLondon)
write_unique_ip_addresses_to_file(uniqueIPAddressesNew_York, uniqueIPAddressesPathNew_York)
write_unique_ip_addresses_to_file(uniqueIPAddressesSingapore, uniqueIPAddressesPathSingapore)
write_unique_ip_addresses_to_file(uniqueIPAddressesToronto, uniqueIPAddressesPathToronto)
