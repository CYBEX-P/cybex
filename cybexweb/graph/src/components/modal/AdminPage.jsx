/* 
Component that renders the Admin Panel, used for user management.
*/

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
	const [currentOrg, setCurrentOrg] = useState(currentUser.organization[0]);

	// Current users we are observing (Org's ACL users, Org's users, etc).
	const [userList, setUserList] = useState([]);
	
	// Which type of list we are currently editing (user, acl, admin)
	const [listType, setListType] = useState("user");
	
	const [allOrgsUsers, setAllOrgsUsers] = useState([]);
	const allOrgsUsersRef = useRef([]);
	
	// Returns an error screen, mainly using this for org_info if it doesn't return anything (500 server error)
	const [breakingError, setBreakingError] = useState(false);


	// Grab initial list from API calls through updateUsersInOrg()
	// Update our current, local, lists through populateAllUsers()
	useEffect(() => {
		updateUsersInOrg();
		// allOrgsUsersRef.current = allOrgsUsers;
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
		// OrgId is each org
		currentUser.organization.forEach(function (orgId) {

			let allUsers = [];	

			const orgInfo = {
				org_hash: orgId.hash,
				return_type: "all"
			
			}

			axios.post('/api/v1/user_management/org_info', orgInfo)
					 .then(response => {
						 allUsers.push(response.data.result);


						// Extracts all users from each individual list from particular org
						const usersInOrg = populateUsers(allUsers[0], "users");
						const usersInACL = populateUsers(allUsers[0], "acl");
						const usersInAdmin = populateUsers(allUsers[0], "admin");

						const orgObj = {
							orgName: orgId.name[0],
							orgUsers: usersInOrg,
							aclUsers: usersInACL,
							adminUsers: usersInAdmin
						}
						allOrgsUsers.push(orgObj);

						// MIGHT MOVE ALL TO updateUsersInOrg IN API CALL
						allOrgsUsersRef.current = allOrgsUsers;
						populateAllLists();
			
			 			})
						.catch(error  => {
							console.log(error)

							// Error screen 
							setBreakingError(true);
						});
		});
	}

	// Update text box when user enters text
	const onMemberAddChange = (e) => {
		setMemberAdd(e.target.value);
	}

	// Handles changing org when user picks a different org
	const onChangeOrgHandler = (e) => {
		currentUser.organization.forEach(x => {
			if (x.name[0] === e.target.value) {
				setCurrentOrg(x);	
			}
		});
	}


	
	// After getting all org information from org_info, we use this to populate each individual list with users
	const populateUsers = (allUsers, type) => {
		const users = []
		if (allUsers != null) {
			if (type === "users") {
				allUsers.user.forEach(x => {
					users.push(x);
				})
			} else if (type === "acl") {
				allUsers.acl.forEach(x => {
					users.push(x);
				})
			} else if (type === "admin") {
				allUsers.admin.forEach(x => {
					users.push(x);
				})
			}
		}
		
		return users;
		
	
	}


	// Get all users from user list, admin list, acl list, from org (information came from populateUsers() function)
	// Grabs imformation from updated lists
	const populateAllLists = () => {
		const allUsers = allOrgsUsersRef.current.filter(x => x.orgName === currentOrg.name[0]);
		let specificUsers = [];
		if (allUsers != null) {
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
		return (
			<div>
			<select name="currentOrgs" 
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
	
	const addUser = () => {
		// This is where we add the user
		const addObj = {
			org_hash: currentOrg.hash,
			users: currMemberAdd,
			list_type: listType,
			action: "add"
		}


		
		axios.post('/api/v1/user_management/org_add_remove', addObj)
		 			.then(({data}) => {
						if (data.message.includes("Invalid user hash")) {
							setAddUserStatus(405);
						} else {
							setAddUserStatus(201);
						}
		 			})
		 			.catch(error => {
						console.log(error);
		
						// setAddUserStatus(400);
		 			})
					.finally(() => {
						// Prevents doing addUser if we haven't added anyone yet
						setActiveSearch(true);
						// Reset text box
						setMemberAdd("")
						setAddRemoveStatus(!addRemoveStatus);
					});
	}


	
	// Remove all selected users from org
	const removeUsersFromOrganization = () => {

		// Add confirmation here
		// confirmUserRemoval(user);
				
		const usersRemoveObj = {
		 
		 		org_hash: currentOrg.hash,
		 		users: usersToBeRemoved,
				list_type: listType,
		 		action: "remove"
		
		}


		axios.post('/api/v1/user_management/org_add_remove', usersRemoveObj)
		  .then(({data}) => {
				if (data.message.includes("500")) {
					setRemoveUserStatus(500);
				} else {
					setRemoveUserStatus(201);
				}
			})
			.catch(error => {
				console.log(error);
			})
			.finally(() => {
				setActiveSearch(true);
				setAddRemoveStatus(!addRemoveStatus);
			})


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
		if (userList === 0) {
			return <div> No other users in organization! </div>;
			// This is for user/admin lists, typeof is to make sure current userList is not the ACL list	
		} else if (listType != "acl" && typeof userList[0] !== 'string') {
			return (
				<div style={{position: "relative"}}>
					<select name="currentUsers" 
									multiple
									value={usersToBeRemoved}
									onChange={populateRemoveUsers}>                                
						{userList.map((user, index) => <option style={{width: "200px"}} value={user._hash}>{user.data.name[0]}</option>)}
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
		} else if (listType === "acl" && typeof userList[0] === 'string') {
			// For ACL (we only get hashes from API)
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
		const currentList = currentListName();
		switch(addUserStatus) {
				// Not sure about the other 400 status (if missing key)
				// Can configure all of these later
			case 99999: 
				return <div>Cannot add admin to {currentList} list!</div>
				break;
			case 201:
				return <div>User added to {currentOrg.name[0]}'s {currentList} list!</div>
				break;
			case 500:
				return <div>Server error!</div>
				break;
			case 400:
				return <div>User is already in your organization!</div>
				break;
				// Not sure if documented, but setting random number of 405
				// To handle wrong hashes
			case 405:
				return <div>Invalid user hash!</div>
				break;
			default:
				return null;
		}
	}

	const removeUserStatusResult = () => {
		const currentList = currentListName();
		switch(removeUserStatus) {
			case 201:
				return <div>User(s) successfully removed from {currentOrg.name[0]}'s {currentList} list</div>
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
	if (breakingError != true) {
		return (
			<div> 
				<TrendPanelStyle>
					<AdminPageStyle>
						<div style={{padding: "100px", color: "black"}}> 
							<div style={{fontSize: "large", marginBottom: "70px"}}>
								Welcome {currentUser.name}, admin of {currentOrg.name[0]}
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
							<label style={{fontWeight: "bold"}}> Add User (User's Hash) To {currentOrg.name[0]} {currentListName()} List </label>
							<div style={{marginBottom: "10px"}} >
							<input
								type="text"
								value={currMemberAdd}
								onChange={onMemberAddChange}
								required
							/>
								<button style={{marginLeft: "5px"}}
									onClick={addUser}
								> 
									Add User 
								</button>
								{activeSearch && addUserStatusResult()}
							</div>
							<div style={{marginTop: "55px"}}>
								<label style={{fontWeight: "bold"}}> Remove User From {currentOrg.name[0]} {currentListName()} List </label>
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
	} else {
		return (
			<div>
				<TrendPanelStyle>
					<AdminPageStyle>
						<div style={{padding: "100px", color: "black"}}>
							<div style={{fontSize: "large", marginBottom: "70px", textAlign: "center"}}>
								Error loading organization information!
							</div>
						</div>
					</AdminPageStyle>
				</TrendPanelStyle>
			</div>
		);
	}
};

export default AdminPage;
