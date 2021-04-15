import React, { useState, useEffect, useRef } from 'react';

import { TrendPanelStyle, AdminPageStyle } from '../__styles__/styles';

const AdminPage = (props) => {

	// Destructuring Props
	const { currentUser, initialUsers } = props;

	// Keep track of what is being added to text box
	const [currMemberAdd, setMemberAdd] = useState("");
	// Status when adding user (if succesful or user already exists in list)
	const [addUserStatus, setAddUserStatus] = useState(0);
	// Status when removing user (if succesful or user already exists in list)
	const [removeUserStatus, setRemoveUserStatus] = useState(0);

	// Prevents showing user doesn't exist before searching for a user to add.
	const [activeSearch, setActiveSearch] = useState(false);
	// Used to rerender components when adding/removing users (might delete)
	const [addRemoveStatus, setAddRemoveStatus] = useState(false);
	
	// If organization has been altered, ask to save changes. (implement more later)
	const [saveChangesStatus, setSaveChangesStatus] = useState(false);
	// Will save changes if state is set to true
	const [saveChanges, setSaveChanges] = useState(false);
	

	// Used for getting current user/s in list to be removed
	const [usersToBeRemoved, setUsersToBeRemoved] = useState([]);

	// Used to know which org we are currently editing, set to first organization
	const [currentOrg, setCurrentOrg] = useState(currentUser.organization[0].name[0]);

	// Current users we are observing (Org's ACL users, Org's users, etc).
	const [userList, setUserList] = useState([]);
	
	// Which type of list we are currently editing (user, acl, admin)
	const [listType, setListType] = useState("user");
	
	const [allOrgsUsers, setAllOrgsUsers] = useState([]);
	const allOrgsUsersRef = useRef([]);

	// TODO: 
	// KEEP IN MIND OF JSON FORMAT WHEN DOING API CALL (object contains user name, hash... etc)
	// That means removal or adding is by doing user.id to API call, and display name with user.name
	// Believe this only effects userList
	// If issues happen with useRef, delete it and just uncomment updateUsersInOrg() below (change in filter function below for populateAllLists)


	// Grab initial list from API calls through updateUsersInOrg()
	// Update our current, local, lists through populateAllUsers()
	useEffect(() => {
		updateUsersInOrg();
		allOrgsUsersRef.current = allOrgsUsers;
		populateAllLists();
	}, []);


	// Used to change current list of users depending on list type 
	// Changes when we switch orgs or different list types
	useEffect(() => {
		 // updateUsersInOrg();
		populateAllLists();

		// Used to reset add/remove status messages from API calls
		setActiveSearch(false);
	}, [currentOrg, listType]);

	// Used when a user has been removed or added to a list
	// Grabs all users for the org through API calls through updateUserInOrg()
	// Updates our current lists through populatAllUsers()
	useEffect(() => {
		updateUsersInOrg();
		allOrgsUsersRef.current = allOrgsUsers;
		populateAllLists();

		// This cleans allOrgsUsers list (so it doesn't keep adding up)
		// Might move to top of this useEffect
		setAllOrgsUsers([]);
	}, [addRemoveStatus]);


	// SAVE FUNCTION
	// ADD SAVE FLAG TO ADD USER / REMOVE USER AND DO API CALL IF saveChanges IS SET TO YES
	// ASK TO SAVE WHEN CHANGING ORG, LIST? OR JUST ORG
	// Might need to save list of users to be removed and a list of users to be added (can make an object to correspond to which list and org)
	// If saveChanges is set to yes, do API calls on those lists
	// API calls can be in a different function and called only when saveChanges is set to yes
	// When API calls are sent, set saveChanges to false
	// If not, reset those two lists to empty


	// Populate all lists for all orgs (used everytime any list is changed)
	const updateUsersInOrg = () => {
		// OrgId is the org hash for each org
		currentUser.organization.forEach(function (orgId) {
			// Used for API call
			const allUsers = [];	
			
			// Getting the orgname from the user's organizations (hash, not readable)	
			// console.log(orgId.orgname[0]);
			
			//const orgInfo = {
			//	org_hash: orgId.orgname[0],
			//	return_type: "all"
			
			//}
				
			// OLD 
			// axios.post('/api/v1/user_management/org_info', orgInfo)
			//
			// NEW (April 4)
			// axios.post('/org/info')
			//		 .then(response => {
							
							// DOUBLE CHECK RESPONSE DATA TO ENSURE WE ARE SETTING THE RIGHT INFORMATION
		//				allUsers.push(response.data);
			
		//	 			})
			//			.catch(error  => {
			//				console.log(error)
			//			});
			//	
			//
			
			// Extracts all users from each individual list from particular org
			const usersInOrg = populateUsers(allUsers, "users");
			const usersInACL = populateUsers(allUsers, "acl");
			const usersInAdmin = populateUsers(allUsers, "admin");

			const orgObj = {
				orgName: orgId.name[0],
				orgUsers: usersInOrg,
				aclUsers: usersInACL,
				adminUsers: usersInAdmin
			}
			allOrgsUsers.push(orgObj);

		});


	}

	// Update text box when user enters text
	const onMemberAddChange = (e) => {
		setMemberAdd(e.target.value);
	}

	// Handles changing org when user picks a different org
	const onChangeOrgHandler = (e) => {
		setCurrentOrg(e.target.value);
	}



	const populateUsers = (allUsers, type) => {
		const users = []
		
		// if (type === "users") {
		// 	for (let i = 0; i < allUsers.userLists.length; i++) {
		// 		users.push(allUsers.userLists[i]);
		// 	}
		// } else if (type === "acl") {
		//	for (let i = 0; i < allUsers.aclLists.length; i++) {
		//		users.push(allUsers.aclLists[i]);
		//	}
		// } else if (type === "admin") {
		//  for (let i = 0; i < allUsers.adminLists.length; i++) {
		//		users.push(allUsers.adminLists[i]);
		//  }
		// }
		//
		//return users;
		//
		
	
		// Hardcoded random names
		for (let i = 0; i < 5; i++) {
			let r = Math.random().toString(36).substring(7);
			users.push(r);
		}
		// console.log(users)
		return users;
	}


	// Get all users from user list, admin list, acl list, from org
	// Grabs imformation from updated lists
	const populateAllLists = () => {
		const allUsers = allOrgsUsersRef.current.filter(x => x.orgName === currentOrg);
			let specificUsers = [];
			if (listType === "user") {
				if (allUsers.length > 0) {
					for (let i = 0; i < allUsers[0].orgUsers.length; i++) {
						specificUsers.push(allUsers[0].orgUsers[i]);
					}
				}
			} else if (listType === 'acl'){
				if (allUsers.length > 0) {
					for (let i = 0; i < allUsers[0].aclUsers.length; i++) {
						specificUsers.push(allUsers[0].aclUsers[i]);
					}
				}
			} else if (listType === 'admin') {
				if (allUsers.length > 0) {
					for (let i = 0; i < allUsers[0].adminUsers.length; i++) {
						specificUsers.push(allUsers[0].adminUsers[i]);
					}
				}
			}
		setUserList(specificUsers);

	};

	// Handles changing list type when user selects different list type
	const onChangeType = (e) => {
		if (e.target.value === 'user') {
			setListType("user");
		} else if (e.target.value === 'acl') {
			setListType("acl");
		} else if (e.target.value === 'admin') {
			setListType("admin");
		}
	}

	// Used to display all orgs that user is admin of
	const displayUsersOrgs = () => {

		const currentOrgsList = [];




		return (
			<div>
			<select name="currentOrgs" 
									value={currentOrg}
									onChange={onChangeOrgHandler}>
						{Object.keys(currentUser.organization).map((org, index) => <option style={{width: "200px"}} value={currentUser.organization[org].name[0]}>{currentUser.organization[org].name[0]}</option>)}
			</select>
			</div>

		);
	};

	// Drop down list to change list type
	const changeListType = () => {
		return (
			<div>
				<select name="listType"
					value={listType}
					onChange={onChangeType}>
				<option value="user">User</option>
				<option value="acl">ACL</option>
				<option value="admin">Admin </option>
				</select>
			</div>
		);
	}
	
	// Check user and compare with different conditions
	// Pass in status code from axios call
	const checkExistingUser = () => {

		const addObj = {
			org: currentOrg,
			user: currentUser.hash,
			list_type: listType,
			action: "add"
		}
		
		// Set error status here from response
		const errorStatus = 0;
		// axios.post('/api/v1/user_management/org/add/user', addObj)
		// 			.then((response => {
		// 						console.log(response);
		// 			});
		// 			.catch(error => {
		//
		// 			// This can probably be changed to setAddUserStatus(error);
		// 			// But wanted to double check "error" is a number
		// 				errorStatus = error;
		// 			})

		
		// This will probably be used to get the status from the API call
		// This might be deleted just because the API can probably handle everything
		// Meaning I can probably set error status in above and just delete everything
		// below, unless it's really needed
		for (let i = 0; i < userList.length; i++) {
				// If user is already in organization
			if (errorStatus === 400) {
				setAddUserStatus(400);
				break;
			} else {
				// Can add user
				setAddUserStatus(201);
				// setSaveChangesStatus(true);
				// addUserToOrganization(currMemberAdd);
				break;
			} 
		}

		// Prevents doing checkExistingUser if we haven't added anyone yet
		setActiveSearch(true);
		// Reset text box
		setMemberAdd("")

		setAddRemoveStatus(!addRemoveStatus);
	}


	// Add user to org, change status to rerender component
	// API call used to be called here, can maybe delete whole function
	// and just do API call above
	//const addUserToOrganization = (user) => {
	//	userList.push(user);
	//	setAddRemoveStatus(!addRemoveStatus);
	//}
	
	// Remove all selected users from org
	const removeUsersFromOrganization = (user) => {

		// Add confirmation here
		// confirmUserRemoval(user);
		
				
		// const usersRemoveObj = {
		// 
		// 		org_hash: currentOrg,
		// 		user: usersToBeRemoved,
		// 		del_from: listType
		
		//  }
		//
		//  OLD
		//  axios.post('/api/v1/user_management/org_add_remove', usersRemoveObj)
		//
		//  NEW
		//  axios.post('/api/v1/user_management/org/del/user', usersRemoveObj)
		//  		 .then((response => {
		//  		 			console.log(response);
		//  		 			}, (error) => {
		//  		 			// SET ERROR STATUS HERE
		//  		 			// setRemoveUserStatus
		//  		 			console.log(error);
		//  		 	});
		//  		 
		// Plugging in 201 for now until API is put in
		setActiveSearch(true);
		setRemoveUserStatus(201);
	
		setAddRemoveStatus(!addRemoveStatus);
	}
	
	// Handles selected users
	const populateRemoveUsers = (e) => {
		let removeUsers  = e.target;
		removeUsers = Array.apply(null, removeUsers)
		const selectedUsers = removeUsers.filter(x => x.selected).map(x => x.value);
		setUsersToBeRemoved(selectedUsers)
	}

	// Confirm changes made, need to implement with backend still
	// Only here if necessary
	const confirmChanges = () => {
		if (saveChangesStatus)
			return (
				<div> 
					<div style={{marginTop: "10px"}}>
					Confirm changes?
						<button style={{margin: "30px"}} onClick={() => setSaveChanges(true)}> Yes </button>
						<button onClick={() => setSaveChanges(false)}> No </button>
					</div>
				</div>
			
			);

	}

		const returnCurrentUsersList = () => {
		// Get only users from same organization
		console.log(userList);
		if (userList === 0) {
			return <div> No other users in organization! </div>;
		} else {
			return (
				<div style={{position: "relative"}}>
					<select name="currentUsers" 
									multiple
									value={usersToBeRemoved}
									onChange={populateRemoveUsers}>                                
						{userList.map((user, index) => <option style={{width: "200px"}} value={user}>{user}</option>)}
					</select>
					<button style={{
										float: "right",
										marginLeft: "20px",
										marginTop: "27px"
									}}

									onClick={removeUsersFromOrganization}>
					Remove Users
					</button>
				</div>
			);
		}

	}
	
	// Returns output based on userStatus
	const addUserStatusResult = () => {
		switch(addUserStatus) {
				// Not sure about the other 400 status (if missing key)
			case 99999: 
				return <div>Cannot add admin to organization!</div>
				break;
			case 201:
				return <div>User added to organization!</div>
				break;
			case 500:
				return <div>Server error!</div>
				break;
			case 400:
				return <div>User is already in your organization!</div>
				break;
			default:
				return null;
		}
	}

	const removeUserStatusResult = () => {
		const currentList = currentListName();
		switch(removeUserStatus) {
			case 201:
				return <div>User(s) successfully removed from {currentList} list</div>
				break;
			case 400:
				return <div>User(s) does not exist in {currentList} list</div>
				break;
			case 500:
				return <div>Server error!</div>
				break;
			default:
				return null;
		}

	}

	// Used for styling, find optimal way later
	const currentListName = () => {
		switch(listType) {
			case "user":
				return "User";
				break;
			case "acl":
				return "ACL";
				break;
			case "admin":
				return "Admin";
				break;
			default:
				return "";
		}
	}
	
	return (
		<div> 
			<TrendPanelStyle>
				<AdminPageStyle>
					<div style={{padding: "100px", color: "black"}}> 
						<div style={{fontSize: "large", marginBottom: "70px"}}>
							Welcome {currentUser.name}, admin of {currentOrg}
						<br />
						<br />
						<label style={{fontWeight: "bold"}}> Select Org</label>
							{displayUsersOrgs()}
						<br />
						<label style={{fontWeight: "bold"}}> Change List Type </label>
							<div style={{display: "inline-block", marginLeft: "20px"}}>
								{changeListType()}
							</div>
						</div>
						<label style={{fontWeight: "bold"}}> Add User To {currentOrg} {currentListName()} List </label>
						<div style={{marginBottom: "10px"}} >
						<input
							type="text"
							value={currMemberAdd}
							onChange={onMemberAddChange}
							required
						/>
							<button style={{marginLeft: "5px"}}
								onClick={checkExistingUser}
							> 
								Add User 
							</button>
							{activeSearch && addUserStatusResult()}
						</div>
						<div style={{marginTop: "55px"}}>
							<label style={{fontWeight: "bold"}}> Remove User From {currentOrg} {currentListName()} List </label>
						</div>
						<div>
							{returnCurrentUsersList()}
						</div>
						<div style={{marginTop: "50px"}}>
							{activeSearch && removeUserStatusResult()}
							{/* {confirmChanges()} */}
						</div>
					</div>
				</AdminPageStyle>
			</TrendPanelStyle>
		</div>
	);
};

export default AdminPage;
