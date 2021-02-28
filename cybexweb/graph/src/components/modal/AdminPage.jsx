import React, { useState } from 'react';

import { TrendPanelStyle, AdminPageStyle } from '../__styles__/styles';

const AdminPage = (props) => {

	// Keep track of what is being added to text box
	const [currMemberAdd, setMemberAdd] = useState("");
	const [userExists, setUserExists] = useState(false);
	// Prevents showing user doesn't exist before searching for a user to add.
	const [activeSearch, setActiveSearch] = useState(false);

	const onMemberAddChange = (event) => {
		setMemberAdd(event.target.value);
	}

	const checkExistingUser = () => {
		if (currentUsersInOrg.includes(currMemberAdd)) {
			setUserExists(true);
		} else {
			setUserExists(false);
		}
		setActiveSearch(true);
	}
	
	// Hardcoded names of users existing in the organization
	const currentUsersInOrg = ["Josh", "Adam"];

	const returnCurrentUsers = currentUsersInOrg.map((name) => {
		return (
			<div style={{marginTop: "10px"}}>
				{name}
				<button> X </button>
			</div>
		);


	});



	return (
		<div> 
			<TrendPanelStyle>
				<AdminPageStyle>
					<div style={{padding: "100px", color: "black"}}> 
						<div style={{fontSize: "large", marginBottom: "80px"}}>
							Welcome ENTER ADMIN HERE, Admin of COMPANY
						</div>
						<label> Add User </label>
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

							{userExists && (
								<div>
								USER EXISTS!
								</div>
							)}

							{(!userExists && activeSearch) && (
								<div>
									User does not exist in current organization.
								</div>
							)}

						</div>

						<div>
							Remove User
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
