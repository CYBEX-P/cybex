import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import { NavBarStyle } from '../__styles__/styles';
import MenuContext from '../App/MenuContext';
import NewDropdown from './Dropdown';
import Trends from '../modal/Trends';
import AdminPage from '../modal/AdminPage';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faFileUpload, faProjectDiagram, faUsersCog } from '@fortawesome/free-solid-svg-icons';

const NavBar = (props) => {
  const { isExpanded, dispatchExpand } = useContext(MenuContext);
  
  const [trendState,setTrendState] = useState(false);
  
  const [IPs, setIPs] = useState([]);

  // States for admin page
  const [adminPageState, setAdminPageState] = useState(false);
	const [userAdminStatus, setUserAdminStatus] = useState(false);

	// The current user, an object retrieved from API that has info about the user
	const [currentUser, setCurrentUser] = useState(null);

	const [currentUsersOrgs, setCurrentUsersOrgs] = useState(null);

	
	useEffect(() => {
		const OrgsList = [];
		// API call to get user's orgs user is admin of
		axios.get('/api/v1/user_management/currentUserInfo/admin_of').then(({ data }) => {
			data.result.forEach(x => {
				// Adding hash to object
				x.data.hash = x._hash;
				OrgsList.push(x.data);
			});
			// Setting current users orgs
			setCurrentUsersOrgs(OrgsList);
			console.log(OrgsList);
			
			// If user is admin of > 0 orgs, display admin page button
			if (OrgsList.length > 0) {
				setUserAdminStatus(true);
			} else {
				setUserAdminStatus(false);
			}
		});
	}, [])
	
	// Setting the user information needed for Admin Page
	useEffect(() => {
		if (props.userProfile != null) {
			const user = {
					name: props.userProfile.name[0],
					hash: props.userProfile.hash,
					organization: currentUsersOrgs 
				};
			setCurrentUser(user);
		}
	}, [props.userProfile])
  
  // This should update IPs everytime props.ipData
	// is changed from MainApp.jsx
	useEffect(() => {
		setIPs(props.ipData);
	}, [props.ipData]);


  return (
    <>
      <NavBarStyle>
        <div style={{marginLeft: "1%"}}> 
          <NewDropdown permissions={props.permissions} dispatchExpand={dispatchExpand} dispatchModal={props.dispatchModal}/>
          <div style={{position: "absolute", left: "8%", top: "5px"}}>
            <div>Beta Version 0.9.0</div>
            <div>Build 2021-05-12</div>
          </div>
        </div>
        
        <a style={{ flexGrow: 2, textAlign: 'center', color: 'white' }} href="/">
          <h3 style ={{display: "inline-block", color: "#58a5f0"}}>CYBEX-P</h3>
          <h6 style ={{display: "inline-block"}}>&nbsp;&nbsp;Threat Intelligence</h6>
        </a>
		
        {/* Admin Panel */}
        {(!adminPageState && userAdminStatus && (props.userProfile != null)) && (
          <button
            style={{
              float:"right",
              marginRight:"1%",
              borderRadius:"4px",
              borderColor:"#6c757d",
              backgroundColor:"#6c757d",
              color:"white",
              padding:"7px 14px"
            }}
            onClick={() => setAdminPageState(true)}
          >
          <FontAwesomeIcon size="lg" icon={faUsersCog}/>
        </button>
        )}
        {(adminPageState && userAdminStatus && (props.userProfile != null)) && (
          <button
            style={{
              float:"right",
              marginRight:"1%",
              borderRadius:"4px",
              borderColor:"#6c757d",
              backgroundColor:"#6c757d",
              color:"white",
              padding:"7px 14px"
            }}
            onClick={() => setAdminPageState(false)}
          >
          <FontAwesomeIcon size="lg" icon={faUsersCog}/>
        </button>
        )}

        {/* Data Submission Panel */}
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
            onClick={() => props.dispatchModal('Submit Event Data')}
          >
          <FontAwesomeIcon size="lg" icon={faFileUpload}/>
        </button>
      
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
        <Trends title = "Trends" IPs={IPs}/>
      )}

    </>
  );
};

export default NavBar;
