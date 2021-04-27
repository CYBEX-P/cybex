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

	// TODO: 
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

			const allUsers = [];	
			// Use this for API call
			// const allUsers = {};
			
			const orgInfo = {
				org_hash: orgId.hash,
				return_type: "all"
			
			}
			
			// axios.post('/api/v1/user_management/org_info', orgInfo)
			//		 .then(({response}) => {
			//			allUsers.push(response.data);
			
		//	 			})
		//				.catch(error  => {
		//					console.log(error)
			//				// Error screen 
			//				setBreakingError(true);
		//				});
			//		  .finally(() => {
			//      // Maybe put stuff here
			//		  }



			const testJSON = 
			{
				  "result": {
						    "admin": [
									      {
													        "itype": "object",
													        "data": {
																		          "name": [
																								            "TestAdmin2"
																								          ],
																		          "email_addr": [
																		            "testEmail3@gmail.com"
																		          ]
																		        },
													        "_cref": [
																		          "2e02b41b55a5a330f8edd40da4739cbe62564571ea44beb61eabaf690e94ff50",
																		          "3f6f035cdb002ae8fc758a710c5294f437510bb0c3cf52b42687a22cc479e80a"
																		        ],
													        "_ref": [
																		          "2e02b41b55a5a330f8edd40da4739cbe62564571ea44beb61eabaf690e94ff50",
																		          "3f6f035cdb002ae8fc758a710c5294f437510bb0c3cf52b42687a22cc479e80a"
																		        ],
													        "sub_type": "cybexp_user",
													        "_hash": "d230f54cb1c772c05abfa50f17e64f16b6a884c914f0122223fe9ddc98dc2941"
													      }
									    ],
						    "user": [
									      {
													        "itype": "object",
													        "data": {
																		          "name": [
																								            "TestAdmin2"
																								          ],
																		          "email_addr": [
																								            "testEmail3@gmail.com"
																								          ]
																		        },
													        "_cref": [
																		          "2e02b41b55a5a330f8edd40da4739cbe62564571ea44beb61eabaf690e94ff50",
																		          "3f6f035cdb002ae8fc758a710c5294f437510bb0c3cf52b42687a22cc479e80a"
																		        ],
													        "_ref": [
																		          "2e02b41b55a5a330f8edd40da4739cbe62564571ea44beb61eabaf690e94ff50",
																		          "3f6f035cdb002ae8fc758a710c5294f437510bb0c3cf52b42687a22cc479e80a"
																		        ],
													        "sub_type": "cybexp_user",
													        "_hash": "d230f54cb1c772c05abfa50f17e64f16b6a884c914f0122223fe9ddc98dc2941"
													      },
									      {
													        "itype": "object",
													        "data": {
																		          "email_addr": [
																								            "testEmail2@gmail.com"
																								          ],
																		          "name": [
																								            "TestUser"
																								          ]
																		        },
													        "_cref": [
																		          "261fe929d11bf0a3231099d7801db19ae13302cefdfd5980e5262c454a19d5f2",
																		          "e2a79b12544674b0f45e1dd452d9be36c811be9141360000163233d2cd632109"
																		        ],
													        "_ref": [
																		          "261fe929d11bf0a3231099d7801db19ae13302cefdfd5980e5262c454a19d5f2",
																		          "e2a79b12544674b0f45e1dd452d9be36c811be9141360000163233d2cd632109"
																		        ],
													        "sub_type": "cybexp_user",
													        "_hash": "143c48f5be9c0c24e9f2606065c34b8b366d804aa2d8ed406fe25ad5e6ab89a3"
													      },
									      {
													        "itype": "object",
													        "data": {
																		          "name": [
																								            "TestUser2"
																								          ],
																		          "email_addr": [
																								            "TestEmail1223@gmail.com"
																								          ]
																		        },
													        "_cref": [
																		          "042dd6b97333e50167fb4207dbc36de2f2b9bfdba027361e29f16a8eb02c33a2",
																		          "518a6492b778bd351fb590a3b6b5a46aa51f817b6b8a30c0638c78982d67c49b"
																		        ],
													        "_ref": [
																		          "042dd6b97333e50167fb4207dbc36de2f2b9bfdba027361e29f16a8eb02c33a2",
																		          "518a6492b778bd351fb590a3b6b5a46aa51f817b6b8a30c0638c78982d67c49b"
																		        ],
													        "sub_type": "cybexp_user",
													        "_hash": "13fbe0450636d636812a6ca01e2d351d74ca7d55708afaae800519223b7586dc"
													      }
									    ],
						    "acl": [
									      "d230f54cb1c772c05abfa50f17e64f16b6a884c914f0122223fe9ddc98dc2941",
									      "143c48f5be9c0c24e9f2606065c34b8b366d804aa2d8ed406fe25ad5e6ab89a3",
									      "13fbe0450636d636812a6ca01e2d351d74ca7d55708afaae800519223b7586dc"
									    ]
						  },
					  "message": "See result."
			}

						
			// Extracts all users from each individual list from particular org
			
			// SHOULD PROBABLY PUT THIS ALL IN API CALL? MIGHT RETURN NULL I THINK
			// Probably in the .finally()
			const usersInOrg = populateUsers(testJSON, "users");
			const usersInACL = populateUsers(testJSON, "acl");
			const usersInAdmin = populateUsers(testJSON, "admin");

			const orgObj = {
				orgName: orgId.name[0],
				orgUsers: usersInOrg,
				aclUsers: usersInACL,
				adminUsers: usersInAdmin
			}
			allOrgsUsers.push(orgObj);

		});

	// MIGHT MOVE ALL TO updateUsersInOrg IN API CALL
		allOrgsUsersRef.current = allOrgsUsers;
		populateAllLists();


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
		
		if (type === "users") {
			allUsers.result.user.forEach(x => {
				users.push(x);
			})
		} else if (type === "acl") {
		 	allUsers.result.acl.forEach(x => {
				users.push(x);
		 	})
		} else if (type === "admin") {
			allUsers.result.admin.forEach(x => {
				users.push(x);
			})
		}
		
		return users;
		
	
	}


	// Get all users from user list, admin list, acl list, from org
	// Grabs imformation from updated lists
	const populateAllLists = () => {
		const allUsers = allOrgsUsersRef.current.filter(x => x.orgName === currentOrg.name[0]);
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
		return (
			<div>
			<select name="currentOrgs" 
									value={currentOrg.name[0]}
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
	
	// THIS IS THE ADDING FUNCTION (probably changing name
	// Pass in status code from axios call
	const addUser = () => {
		// This is where we add the user
		const addObj = {
			org_hash: currentOrg.hash,
			users: currMemberAdd,
			list_type: listType,
			action: "add"
		}

		console.log(addObj);

		
		axios.post('/api/v1/user_management/org_add_remove', addObj)
		 			.then(({data}) => {
		 					console.log(data);
							setAddUserStatus(201);
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

		console.log(usersRemoveObj);

		axios.post('/api/v1/user_management/org_add_remove', usersRemoveObj)
		  .then(({data}) => {
		  	console.log(data);
			  })
			.catch(error => {
				console.log(error);
				// SET ERROR STATUS HERE
				// setRemoveUserStatus
			})
			.finally(() => {
				// PUT IN API CALL?
				setActiveSearch(true);

				// Fix this user status
				setRemoveUserStatus(201);
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
			// This is for user/admin lists, typeof is too make sure current userList is not the ACL list	
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
