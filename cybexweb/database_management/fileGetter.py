from paramiko import SSHClient
from scp import SCPClient
from os import listdir
from os.path import join
from datetime import date, timedelta


# This function is used to exclude all of the file that we have already downloaded from the server so that we are not reprocessing and redownloaded the files that we have already processed.
def create_updated_date_list(date_list, directory_path, files_to_ignore):
    new_date_list = []
    for items_list in date_list:
        if items_list not in listdir(directory_path) and items_list not in files_to_ignore:
            new_date_list.append(items_list)
    return new_date_list


# Once we have excluded all of the processed files this function is used to download all of the remaining files.
def get_files_from_server(server_directory_path, local_directory_path, file_list, scp_client, honeypot_name):
    files_downloaded = []
    for items_downloaded in file_list:
        try:
            scp_client.get(server_directory_path + items_downloaded, local_directory_path + items_downloaded)
            print(honeypot_name, "getting file:", items_downloaded, "from the server.")
            files_downloaded.append(str(join(local_directory_path, items_downloaded)))
        except:
            print(honeypot_name, "file:", items_downloaded, "not found at the server.")
    return files_downloaded


# Once all of the files have been downloaded they are outputted to a file so that the filenames are processed in the IPAddressExtractor.py file.
def output_files_to_process(file_path, file_list):
    with open(file_path, "w") as output_processed:
        for items_processed in file_list:
            output_processed.write(str(items_processed) + "\n")


# The data from the honeypot was extracted starting August 1st, 2020.
startDate = date(2020, 8, 1)
# The data is extracted until today's date.
endDate = date.today()

# The date difference is calculated and used generate list of filenames.
date_difference = endDate - startDate

# This is the list that will hold the list of filenames.
dateList = []

# This loop is used to append the filenames to the list.
for i in range(date_difference.days - 6):
    day = str(startDate + timedelta(days=i))
    day = day.replace("-", "_")
    day = day.replace("_0", "_")
    fileDate = "cowrie.json." + day
    dateList.append(fileDate)

# The following variables specifies the path to the working local directory.
localDirectoryPathAmsterdam = "/home/team15/Amsterdam/"
localDirectoryPathBangalore = "/home/team15/Bangalore/"
localDirectoryPathLondon = "/home/team15/London/"
localDirectoryPathNew_York = "/home/team15/New_York/"
localDirectoryPathSingapore = "/home/team15/Singapore/"
localDirectoryPathToronto = "/home/team15/Toronto/"

# The following variable specifies the path to the local output directory.
localDirectoryPathOutput = "/home/team15/Data/"

# The following variables specify the path to the working server directory.
serverDirectoryPathAmsterdam = "~/ssh-amsterdam/"
serverDirectoryPathBangalore = "~/ssh-bangalore/"
serverDirectoryPathLondon = "~/ssh-london/"
serverDirectoryPathNew_York = "~/ssh-ny/"
serverDirectoryPathSingapore = "~/ssh-singapore/"
serverDirectoryPathToronto = "~/ssh-toronto/"

# The following variables are used to append the output directory and the filenames.
outputFilePathAmsterdam = join(localDirectoryPathOutput, "filesToProcessAmsterdam.txt")
outputFilePathBangalore = join(localDirectoryPathOutput, "filesToProcessBangalore.txt")
outputFilePathLondon = join(localDirectoryPathOutput, "filesToProcessLondon.txt")
outputFilePathNew_York = join(localDirectoryPathOutput, "filesToProcessNew_York.txt")
outputFilePathSingapore = join(localDirectoryPathOutput, "filesToProcessSingapore.txt")
outputFilePathToronto = join(localDirectoryPathOutput, "filesToProcessToronto.txt")

# The following lists are used to exclude the files which were corrupted or does not exists on the data server.
fileToIgnoreAmsterdam = []
fileToIgnoreBangalore = []
fileToIgnoreLondon = ["cowrie.json.2021_1_6", "cowrie.json.2021_1_7", "cowrie.json.2021_1_8"]
fileToIgnoreNew_York = ["cowrie.json.2021_3_8", "cowrie.json.2021_3_9", "cowrie.json.2021_3_10", "cowrie.json.2021_3_11", "cowrie.json.2021_3_12", "cowrie.json.2021_3_13", "cowrie.json.2021_3_14", "cowrie.json.2021_3_15", "cowrie.json.2021_3_16", "cowrie.json.2021_3_17", "cowrie.json.2021_3_18", "cowrie.json.2021_3_19", "cowrie.json.2021_3_20", "cowrie.json.2021_3_21", "cowrie.json.2021_3_22", "cowrie.json.2021_3_23", "cowrie.json.2021_3_24", "cowrie.json.2021_3_25"]
fileToIgnoreSingapore = []
fileToIgnoreToronto = []

# The create_updated_date_list function is called below to get a list of files to download.
updatedDateListAmsterdam = create_updated_date_list(dateList, localDirectoryPathAmsterdam, fileToIgnoreAmsterdam)
updatedDateListBangalore = create_updated_date_list(dateList, localDirectoryPathBangalore, fileToIgnoreBangalore)
updatedDateListLondon = create_updated_date_list(dateList, localDirectoryPathLondon, fileToIgnoreLondon)
updatedDateListNew_York = create_updated_date_list(dateList, localDirectoryPathNew_York, fileToIgnoreNew_York)
updatedDateListSingapore = create_updated_date_list(dateList, localDirectoryPathSingapore, fileToIgnoreSingapore)
updatedDateListToronto = create_updated_date_list(dateList, localDirectoryPathToronto, fileToIgnoreToronto)

# An ssh connection to the server is created to download the list of that we just created above. For this code to work the host must ssh keys generated and the public key needs to be added to the ~/.ssh/authorized_keys file for the connection to succeed as hard coding the password is not a safe coding practice.
ssh = SSHClient()
ssh.load_system_host_keys()
# This is where the connection to the data occurs.
ssh.connect(hostname="134.197.113.11", port=22, username="cybex-user")

# An scp connection is now created to securely copy the files from the data server to the local machine and using connection the "with" keyword the scp connection is automatically closed.
with SCPClient(ssh.get_transport()) as scp:
    filesDownloadedAmsterdam = get_files_from_server(serverDirectoryPathAmsterdam, localDirectoryPathAmsterdam, updatedDateListAmsterdam, scp, "Amsterdam")
    filesDownloadedBangalore = get_files_from_server(serverDirectoryPathBangalore, localDirectoryPathBangalore, updatedDateListBangalore, scp, "Bangalore")
    filesDownloadedLondon = get_files_from_server(serverDirectoryPathLondon, localDirectoryPathLondon, updatedDateListLondon, scp, "London")
    filesDownloadedNew_York = get_files_from_server(serverDirectoryPathNew_York, localDirectoryPathNew_York, updatedDateListNew_York, scp, "New_York")
    filesDownloadedSingapore = get_files_from_server(serverDirectoryPathSingapore, localDirectoryPathSingapore, updatedDateListSingapore, scp, "Singapore")
    filesDownloadedToronto = get_files_from_server(serverDirectoryPathToronto, localDirectoryPathToronto, updatedDateListToronto, scp, "Toronto")

# Once the files have been downloaded the corresponding filenames are outputted to separate files for each honeypot for the IPAddressesExtractor.py to use.
output_files_to_process(outputFilePathAmsterdam, filesDownloadedAmsterdam)
output_files_to_process(outputFilePathBangalore, filesDownloadedBangalore)
output_files_to_process(outputFilePathLondon, filesDownloadedLondon)
output_files_to_process(outputFilePathNew_York, filesDownloadedNew_York)
output_files_to_process(outputFilePathSingapore, filesDownloadedSingapore)
output_files_to_process(outputFilePathToronto, filesDownloadedToronto)
