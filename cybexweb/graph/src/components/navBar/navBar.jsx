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

	// The current user, an object retrieved from API that has info about the user
	const [currentUser, setCurrentUser] = useState({});
	
		
	// Setting the current user, probably will be used to get the current
	// user's hash for future API calls (delete and add require user hash)
	const setCurrentUserData = () => {


	//	axios.get('/api/v1/user_management/user/info/self')
	//		.then(response => {
				// Set users info in state
	//				setCurrentUser(response.data);
	//			})
	//			.catch(error => {
	//				console.log(error);
	//			})
		
		
		
		// Get user's orgs from API call
		const usersOrgs = getOrgs();
		// Parse JSON returned from API call if needed
		
			const currentUserHardCoded = {
				name: "ADMIN",
				hash: "currentAdminHash",
				organization: usersOrgs
			};

		setCurrentUser(currentUserHardCoded);
		
	}
	
	// Uses API to get org names
	// Can just place all in setCurrentUserData if wanted to
	const getOrgs = () =>  {
		// Another way is we can delete usersOrgs below and just do setCurrentUsersOrgs(response.data) in API
		// call
		//
		const usersOrgs = {};
	
		// Rename
		// const orgsObj = {
		//	info_to_return: "orgs_admin",

		//}
	
		//
		// DOUBLE CHECK IF NEEDED /api/v1/
		// axios.get('/api/v1/user_management/orgs/admin_of')
		// 			.then(response => {
		//
		// 			// Double check keys in response.data to set correctly 
		//
		// 			//setCurrentUsersOrgs(response.data)
		// 			usersOrgs = response.data;
		// 			})
		//			.catch(error => {
		//				console.log(error);
		//			})
		
		// HARD CODED VALUES FOR NOW
		const OrgsList = ['UNR1', 'UNR2'];	
		// setCurrentUsersOrgs(OrgsList);
		//
		// Optimally return the JSON object from API call
		return OrgsList;
	
	};
	
	
	
	// Populating current users orgs 
	useEffect(() => {
		setCurrentUserData();
	}, [])

	// Show admin button if current users orgs list > 0
	useEffect(() => {
		// Get users of orgs that user is admin of
		if (Object.keys(currentUser).length > 0) {	
			if (currentUser.organization.length > 0 === true) {
				setUserAdminStatus(true);
			} else {
				setUserAdminStatus(false);
			}
		}
	}, [currentUser])

	
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
