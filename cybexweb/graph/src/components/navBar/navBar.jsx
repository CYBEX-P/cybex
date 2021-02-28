import React, { useState, useContext, useEffect } from 'react';

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

	// Hardcoded values for current existing users, and current user
	const userList = [
		{
			name: "Josh",
			organization: "UNR",
			admin: true
		},
		{
			name: "Jack",
			organization: "UNR",
			admin: false
		},
		{
			// Adding Jim to the UNR organization
			name: "Jim",
			organization: "",
			admin: false 
		},
		{
			// Adding John to the UNR organization
			name: "John",
			organization: "",
			admin: false
		}
	];
	const currentUser = userList[0];
	
	// Checking if user is an admin, only runs once
	useEffect(() => {
		if (currentUser.admin === true) {
			setUserAdminStatus(true);
		} else {
			setUserAdminStatus(false);
		}
	}, [])


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
				<AdminPage currentUser={currentUser} userList={userList}/>
			)}


      {trendState && (
        <Trends title = "Trends"/>
      )}

    </>
  );
};

export default NavBar;
