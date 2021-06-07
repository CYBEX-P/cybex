import json
import requests
import time
from tqdm import tqdm
import csv
from os.path import join


# This function is used to read all of the IP Addresses that is in the Database and stored in a list.
def get_ip_addresses(file_path):
    ip_address = []
    with open(file_path, "r") as input_file:
        for get_items in input_file:
            ip_address.append(get_items.strip("\n"))
    return ip_address


# This function is used to read all of the previously processed IP Addresses so don't reprocess the IP Addresses that we have already been converted to Geo Location.
def get_previous_ip_addresses(file_path):
    processed_ip_address = []
    with open(file_path, "r") as input_file:
        reader_processed = csv.reader(input_file)
        for items_processed in reader_processed:
            processed_ip_address.append(items_processed[0])
    return processed_ip_address


# This function is used to remove all of the previously processed IP Addresses so don't reprocess the IP Addresses that we have already been converted to Geo Location.
def remove_processed_ip_addresses(all_ip_addresses, processed_ip_addresses):
    for items_remove in tqdm(processed_ip_addresses):
        if items_remove in all_ip_addresses:
            all_ip_addresses.remove(items_remove)


# This function is used to convert all of the remaining IP Addresses and convert them to Geo Location. Once an IP Address has been converted it is outputted to the file to ensure that the data is not lost when an error occurs.
def convert_ip_addresses_to_geo_location(ip_addresses_to_convert, output_file):
    location_dictionary = {}
    url = "http://ip-api.com/json/"
    for items_convert in tqdm(ip_addresses_to_convert):
        url += str(items_convert)
        response = requests.get(url)
        data = json.loads(response.text)
        ip_address = str(data["query"])
        latitude = str(data["lat"])
        longitude = str(data["lon"])
        location_dictionary[ip_address] = [latitude, longitude]
        url = "http://ip-api.com/json/"
        time.sleep(2)
        with open(output_file, "a") as output:
            output.write(ip_address + "," + latitude + "," + longitude + "\n")
    return location_dictionary


# The following variable specifies the path of the local directory that contains the data.
filePath = "/home/team15/Data/"

# The following variables are used to append the input directory path and the filenames.
inputFilePathAmsterdam = join(filePath, "uniqueIPAddressesAmsterdam.txt")
inputFilePathBangalore = join(filePath, "uniqueIPAddressesBangalore.txt")
inputFilePathLondon = join(filePath, "uniqueIPAddressesLondon.txt")
inputFilePathNew_York = join(filePath, "uniqueIPAddressesNew_York.txt")
inputFilePathSingapore = join(filePath, "uniqueIPAddressesSingapore.txt")
inputFilePathToronto = join(filePath, "uniqueIPAddressesToronto.txt")

# The following variables are used to append the output directory path and the filenames.
outputFilePathAmsterdam = join(filePath, "uniqueIPAddressesLocationAmsterdam.csv")
outputFilePathBangalore = join(filePath, "uniqueIPAddressesLocationBangalore.csv")
outputFilePathLondon = join(filePath, "uniqueIPAddressesLocationLondon.csv")
outputFilePathNew_York = join(filePath, "uniqueIPAddressesLocationNew_York.csv")
outputFilePathSingapore = join(filePath, "uniqueIPAddressesLocationSingapore.csv")
outputFilePathToronto = join(filePath, "uniqueIPAddressesLocationToronto.csv")

# The get_ip_addresses function is called below to get a list of IP Addresses to process.
IPAddressesAmsterdam = get_ip_addresses(inputFilePathAmsterdam)
IPAddressesBangalore = get_ip_addresses(inputFilePathBangalore)
IPAddressesLondon = get_ip_addresses(inputFilePathLondon)
IPAddressesNew_York = get_ip_addresses(inputFilePathNew_York)
IPAddressesSingapore = get_ip_addresses(inputFilePathSingapore)
IPAddressesToronto = get_ip_addresses(inputFilePathToronto)

# The get_previous_ip_addresses function is called below to get a list of previously converted IP Addresses.
processedIPAddressesAmsterdam = get_previous_ip_addresses(outputFilePathAmsterdam)
processedIPAddressesBangalore = get_previous_ip_addresses(outputFilePathBangalore)
processedIPAddressesLondon = get_previous_ip_addresses(outputFilePathLondon)
processedIPAddressesNew_York = get_previous_ip_addresses(outputFilePathNew_York)
processedIPAddressesSingapore = get_previous_ip_addresses(outputFilePathSingapore)
processedIPAddressesToronto = get_previous_ip_addresses(outputFilePathToronto)

# The remove_processed_ip_addresses function is called below to remove already processed IP Addresses from the list.
remove_processed_ip_addresses(IPAddressesAmsterdam, processedIPAddressesAmsterdam)
remove_processed_ip_addresses(IPAddressesBangalore, processedIPAddressesBangalore)
remove_processed_ip_addresses(IPAddressesLondon, processedIPAddressesLondon)
remove_processed_ip_addresses(IPAddressesNew_York, processedIPAddressesNew_York)
remove_processed_ip_addresses(IPAddressesSingapore, processedIPAddressesSingapore)
remove_processed_ip_addresses(IPAddressesToronto, processedIPAddressesToronto)

# The convert_ip_addresses_to_geo_location function is called below to convert the remaining IP Addresses to Geo Location.
convert_ip_addresses_to_geo_location(IPAddressesAmsterdam, outputFilePathAmsterdam)
convert_ip_addresses_to_geo_location(IPAddressesBangalore, outputFilePathBangalore)
convert_ip_addresses_to_geo_location(IPAddressesLondon, outputFilePathLondon)
convert_ip_addresses_to_geo_location(IPAddressesNew_York, outputFilePathNew_York)
convert_ip_addresses_to_geo_location(IPAddressesSingapore, outputFilePathSingapore)
convert_ip_addresses_to_geo_location(IPAddressesToronto, outputFilePathToronto)
