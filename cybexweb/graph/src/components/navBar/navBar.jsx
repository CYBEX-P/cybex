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
	
	// Holds all orgs and acls users that current user is admin of, might need to find more elegant way for this
	const [allOrgsUsers, setAllOrgsUsers] = useState([]);

	const currentUser = {
		name: "ADMIN",
		organization: currentUsersOrgs
	};

	// Get user list of users of multiple orgs, and multiple acls from API calls
	

	// Pass in parameter (string for ex, for the current user, such as a token)
	const getOrgsACLs = () =>  {
		// Make API call
		// axios.get('/get/user/admin/orgs').then(({ orgs }) => {
		// Return list of org name hashes (org names for now)
		// Current user	(pass in name)
		
	// });
		


		// Rename
		const orgsObj = {
			info_to_return: "orgs_admin",

		}

		// axios.get('/api/v1/user_management_currentUserInfo', orgsObj)
		// 			.then(response => {
		// 				setCurrentUsersOrgs(response.data)
		// 			})
		//			.catch(error => {
		//				console.log(error);
		//			})
		
		const OrgsList = ['UNR1', 'UNR2'];	
		setCurrentUsersOrgs(OrgsList);

	
	};
	
	


	
	
	// Populating current users orgs and acls
	// Can change this so when current edited list is updated, update list to send back to adminPage
	// Can maybe set users list here v so it renders once
	useEffect(() => {
		getOrgsACLs();
	}, [])

	// Show admin button if current users orgs list > 0
	useEffect(() => {
		
		// Get users of orgs and acls that user is admin of

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
          <NewDropdown permissions={props.permissions} dispatchExpand={dispatchExpand} isSignedIn={props.isSignedIn} dispatchModal={props.dispatchModal}/>
          <div style={{position: "absolute", left: "8%", top: "5px"}}>
            <div>Beta Version 0.8.0</div>
            <div>Build 2021-03-15</div>
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
				<AdminPage currentUser={currentUser} />
			)}


      {trendState && (
        <Trends title = "Trends"/>
      )}

    </>
  );
};

export default NavBar;
