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

	// Update text box when user enters text
	const onMemberAddChange = (event) => {
		setMemberAdd(event.target.value);
	}

	const checkExistingUser = () => {
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
					addUserToOrganization(userList[i]);
					break;
				}
			} else {
					// User doesn't exist in database
					setUserStatus(2);
			}
			setActiveSearch(true);
		}
	}

	const addUserToOrganization = (user) => {
		user.organization = currentUser.organization;
		setAddRemoveStatus(!addRemoveStatus);
	}

	const removeUserFromOrganization = (user) => {
		user.organization = "";
		setAddRemoveStatus(!addRemoveStatus);
	}

	const returnCurrentUsers = userList.map((user, index) => {
		// Only show users in same organization as main user (admin)
		// Fix styling on long if statement
		if (user.organization !== "" 
			&& user.organization === currentUser.organization
			&& user !== currentUser) {
			return (
				<div key={index}>
					<div style={{marginTop: "10px"}}>
							{user.name} 
							<button 
								style={{
									backgroundColor: "Transparent",
									marginLeft: "20px"
								}}
								onClick={() => removeUserFromOrganization(user)}
							> 
							X 
							</button>
					</div>
				</div>
			)
		}
	});
	
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
							{returnCurrentUsers}
						</div>
					</div>
				</AdminPageStyle>
			</TrendPanelStyle>
		</div>
	);
};

export default AdminPage;
