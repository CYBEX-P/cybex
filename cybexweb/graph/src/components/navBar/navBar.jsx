import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import { NavBarStyle } from '../__styles__/styles';
import MenuContext from '../App/MenuContext';
import NewDropdown from './Dropdown';
import Trends from '../modal/Trends';
import AdminPage from '../modal/AdminPage';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faProjectDiagram, faUsersCog } from '@fortawesome/free-solid-svg-icons';

const NavBar = (props) => {
  const { isExpanded, dispatchExpand } = useContext(MenuContext);
  
  const [trendState,setTrendState] = useState(false);

  // States for admin page
  const [adminPageState, setAdminPageState] = useState(false);
	const [userAdminStatus, setUserAdminStatus] = useState(false);

	// Have current users orgs and acls
	// Need to think of using API calls to populate org/ACL list
	const [currentUsersOrgs, setCurrentUsersOrgs] = useState([]);
	const [currentUsersACLs, setCurrentUsersACLs] = useState([]);
	
	// Holds all orgs and acls users that current user is admin of, might need to find more elegant way for this
	const [allOrgsUsers, setAllOrgsUsers] = useState([]);
	const [allACLsUsers, setAllACLsUsers] = useState([]);

	// Hardcoded values for current existing users, and current user
	// each user has unique id, will probably change when connecting backend

	const currentUser = {
		name: "ADMIN HASH",
		organization: currentUsersOrgs,
		ACL: currentUsersACLs,
	};

	// Get user list of users of multiple orgs, and multiple acls from API calls
	// Make a list of objects, if doesn't work use React hook for it		
	
	// Lists returned from API calls

	// Pass in parameter (string for ex, for the current user, such as a token)
	const getOrgsACLs = () =>  {
		// Make API call
		// axios.get('/get/user/admin/orgs').then(({ orgs }) => {
		// Return list of org name hashes (org names for now)
		// Current user	(pass in name)
		
	// });
		
		// Populate OrgsList and ACLsList from API call (these will be hashes)
		const OrgsList = ['UNR1', 'UNR2'];	
		setCurrentUsersOrgs(OrgsList);


		const ACLsList = ['ACL1', 'ACl2'];
		setCurrentUsersACLs(ACLsList);
	};
	const getUsersInOrg = (orgId, userToken) => {
		// Take in org-id and user token
		
		// Iterate and populate list for each org and acl user is admin of	
		currentUsersOrgs.forEach(function (org) {

			// usersInOrg will be populated here based on orgId
			const usersInOrg = populateUsers(orgId);
			
			usersInOrg.forEach(function (user, index) {
				const userObj = {
					name: user,
					groupName: org,
				};
				allOrgsUsers.push(userObj);
			});
		});

	}

	// Can maybe put this function and the org function together
	const getUsersInACL = (ACLId, userToken) => {
		// This list will be populated by API call
		// Get users unique token through API?
		currentUsersACLs.forEach(function (ACL) {

			// usersInACL will be populated here
			const usersInACL = populateUsers(ACLId);
			
			usersInACL.forEach(function (user, index) {
				const userObj = {
					name: user,
					groupName: ACL,
				};
				allACLsUsers.push(userObj);	
			});
		});
	}

	// Used to populate lists of users of org or acl, based on org id or acl id
	const populateUsers = (id) => {
		// Do API call per ACL or org
		// Iterate through list of hashes
		const users = []
		// 5 users for example, will replace this part with API call
		for (let i = 0; i < 5; i++) {
			let r = Math.random().toString(36).substring(7);
			users.push(r);
		}
		return users;
	}
	
	
	
	// Populating current users orgs and acls
	useEffect(() => {
		getOrgsACLs();
	}, [])

	// Show admin button if current users orgs list > 0
	useEffect(() => {
		
		// Get users of orgs and acls that user is admin of
		getUsersInOrg();
		getUsersInACL();

		if (currentUser.organization.length > 0 === true) {
			setUserAdminStatus(true);
		} else {
			setUserAdminStatus(false);
		}
	}, [currentUsersOrgs])
	
  return (
    <>
      <NavBarStyle>
        <div style={{marginLeft: "1%"}}> 
          <NewDropdown permissions={props.permissions} dispatchExpand={dispatchExpand} isSignedIn={props.isSignedIn}/>
          <div style={{position: "absolute", left: "8%", top: "5px"}}>
            <div>Beta Version 0.7.5</div>
            <div>Build 2021-02-15</div>
          </div>
        </div>
        
        <a style={{ flexGrow: 2, textAlign: 'center', color: 'white' }} href="/">
          <h3 style ={{display: "inline-block", color: "#58a5f0"}}>CYBEX-P</h3>
          <h6 style ={{display: "inline-block"}}>&nbsp;&nbsp;Threat Intelligence</h6>
        </a>
        {/*<UnstyledButton onClick={() => {}}>
          <a style={{ flexGrow: 2, textAlign: 'center', color: '#e3e3e3' }} href="/login">
            <FontAwesomeIcon size="lg" icon="user" color="#e0e0e0" />
          </a>
      </UnstyledButton>*/}
		
			{/* Admin Page */}
			{(!adminPageState && userAdminStatus) && (
				<button
					style={{
						float:"right",
						marginRight:"1%",
						borderRadius:"4px",
						borderColor:"#6c757d",
						backgroundColor:"#6c757d",
						color:"white",
						padding:"7px 18px"
					}}
					onClick={() => setAdminPageState(true)}
				>
				<FontAwesomeIcon size="lg" icon={faUsersCog}/>
			</button>
			)}


			{(adminPageState && userAdminStatus) && (
				<button
					style={{
						float:"right",
						marginRight:"1%",
						borderRadius:"4px",
						borderColor:"#6c757d",
						backgroundColor:"#6c757d",
						color:"white",
						padding:"7px 18px"
					}}
					onClick={() => setAdminPageState(false)}
				>
				<FontAwesomeIcon size="lg" icon={faUsersCog}/>
			</button>
			)}

			
      {!trendState && (
        <button 
          style={{
            float:"right", 
            marginRight:"1%",
            borderRadius:"4px",
            borderColor:"#6c757d",
            backgroundColor:"#6c757d", 
            color:"white", 
            padding:"7px 18px"
          }}
          onClick={() => setTrendState(true)}
        >
        <FontAwesomeIcon size="lg" icon={faChartBar}/>
      </button>
      )}
      {trendState && (
        <button 
          style={{
            float:"right", 
            marginRight:"1%",
            borderRadius:"4px",
            borderColor:"#6c757d",
            backgroundColor:"#6c757d", 
            color:"white", 
            padding:"7px 15px"
          }}
          onClick={() => setTrendState(false)}
        >
        <FontAwesomeIcon size="lg" icon={faProjectDiagram}/>
      </button>
      )}
      
      </NavBarStyle>
      {isExpanded === 'top' && (
        <div
          style={{
            backgroundColor: '#0277bd',
            boxShadow: '0px 2px 4px #22222233',
            position: 'absolute',
            width: '100%',
            top: '56px',
            zIndex: 7
          }}
        >  
        
        </div>
      )}

			{adminPageState && (
				<AdminPage currentUser={currentUser} allOrgsUsers={allOrgsUsers} allACLsUsers={allACLsUsers}/>
			)}


      {trendState && (
        <Trends title = "Trends"/>
      )}

    </>
  );
};

export default NavBar;
