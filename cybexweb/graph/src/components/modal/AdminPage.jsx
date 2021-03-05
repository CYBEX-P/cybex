import React, { useState, useEffect } from 'react';

import { TrendPanelStyle, AdminPageStyle } from '../__styles__/styles';

const AdminPage = (props) => {

	// Destructuring Props
	const { currentUser, userList } = props;

	// Keep track of what is being added to text box
	const [currMemberAdd, setMemberAdd] = useState("");
	const [userStatus, setUserStatus] = useState(0);

	// Prevents showing user doesn't exist before searching for a user to add.
	const [activeSearch, setActiveSearch] = useState(false);
	// Used to rerender components when adding/removing users
	const [addRemoveStatus, setAddRemoveStatus] = useState(false);
	
	// If organization has been altered, ask to save changes.
	const [saveChangesStatus, setSaveChangesStatus] = useState(false);
	// Will save changes if state is set to true
	const [saveChanges, setSaveChanges] = useState(false);
	

	// Used for getting current user in organization to be removed
	const [usersToBeRemoved, setUsersToBeRemoved] = useState([]);

	// Update text box when user enters text
	const onMemberAddChange = (event) => {
		setMemberAdd(event.target.value);
	}

	// Handle current select user to be removed from organization
	const checkExistingUser = () => {
		setAddRemoveStatus(!addRemoveStatus);
		for (let i = 0; i < userList.length; i++) {
			// If user is admin
			if (currMemberAdd === currentUser.name) {
				setUserStatus(0);
			}
			else if (userList[i].name === currMemberAdd) {
				// If user is already in organization
				if (userList[i]['organization'] === currentUser.organization) {
					setUserStatus(3);
					break;
				} else {
					// User isn't in organization yet
					setUserStatus(1);
					setSaveChangesStatus(true);
					addUserToOrganization(userList[i]);
					break;
				}
			} else {
					// User doesn't exist in database
					setUserStatus(2);
			}
			setActiveSearch(true);
		}
		// Reset text box
		setMemberAdd("")
	}
	
	// Add user to org, change status to rerender component
	const addUserToOrganization = (user) => {
		user.organization = currentUser.organization;
		setAddRemoveStatus(!addRemoveStatus);
	}
	
	// Remove all selected users from org
	const removeUsersFromOrganization = (user) => {

		// Add confirmation here
		// confirmUserRemoval(user);
		
		if (usersToBeRemoved.length > 0)
		for (let j = 0;j < usersToBeRemoved.length; j++) {
				for (let i = 0; i < userList.length; i++) {
					if (usersToBeRemoved[j] == userList[i].userID) {
						userList[i].organization = "";
						setSaveChangesStatus(true);
					}
					
				}
		}
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
	const confirmChanges = () => {
		if (saveChangesStatus)
			return (
				<div> 
					<div style={{marginTop: "10px"}}>
					Confirm changes?
						<button style={{margin: "30px"}} onClick={() => setSaveChanges(true)}> Yes </button>
						<button onClick={() => setSaveChanges(true)}> No </button>
					</div>
				</div>
			
			);

	}

		const returnCurrentUsersList = () => {
		// Get only users from same organization
		const organizationUsers = userList.filter(user => user.organization === currentUser.organization&& user !== currentUser);
		if (organizationUsers.length === 0) {
			return <div> No other users in organization! </div>;
		} else {
			return (
				<div>
					<select name="currentUsers" 
									multiple
									value={usersToBeRemoved}
									onChange={populateRemoveUsers}>
						{organizationUsers.map((user, index) => <option style={{width: "200px"}} value={user.userID}>{user.name}</option>)}
					</select>
					<button style={{float: "left"}}
									onClick={removeUsersFromOrganization}>
					Remove Users
					</button>
				</div>
			);
		}

	}
	
	// Returns output based on userStatus
	const userStatusResult = () => {
		switch(userStatus) {
			case 0: 
				return <div>Cannot add admin to organization!</div>
				break;
			case 1:
				return <div>User added to organization!</div>
				break;
			case 2:
				return <div>User doesn't exist in database!</div>
				break;
			case 3:
				return <div>User is already in your organization!</div>
				break;
			default:
				return null;
		}
	}
	
	return (
		<div> 
			<TrendPanelStyle>
				<AdminPageStyle>
					<div style={{padding: "100px", color: "black"}}> 
						<div style={{fontSize: "large", marginBottom: "80px"}}>
							Welcome {currentUser.name}, admin of {currentUser.organization}
						</div>
						<label style={{fontWeight: "bold"}}> Add User To {currentUser.organization} </label>
						<div style={{marginBottom: "10px"}} >
						<input
							type="text"
							value={currMemberAdd}
							onChange={onMemberAddChange}
						/>
							<button style={{marginLeft: "5px"}}
								onClick={checkExistingUser}
							> 
								Add User 
							</button>
							{activeSearch && userStatusResult()}
						</div>
						<div style={{marginTop: "55px"}}>
							<label style={{fontWeight: "bold"}}> Remove User From {currentUser.organization} </label>
						</div>
						<div>
							{returnCurrentUsersList()}
						</div>
						<div style={{marginTop: "50px"}}>
							{confirmChanges()}
						</div>
					</div>
				</AdminPageStyle>
			</TrendPanelStyle>
		</div>
	);
};

export default AdminPage;
