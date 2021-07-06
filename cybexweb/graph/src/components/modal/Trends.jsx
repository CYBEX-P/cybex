/*
Component that renders the trends and honeypot viewer screens over
the main application. These are accessed from the trends button in the
Navbar. Note that all trends/honeypot viewer content are thus considered
child components of the Navbar.
*/

import React, { useContext, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import { faGlobeAmericas, faChartLine } from '@fortawesome/free-solid-svg-icons';
import TrendBox from './TrendBox';
import { TrendPanelStyle } from '../__styles__/styles';
import TrendRow from './TrendRow';
import Honeypot from '../honeypot/Honeypot';

const Trends = (props) => {
	const [mapViewState, setMapViewState] = useState(true);

	console.log(props.IPs);
    return (
        <div>
			{!mapViewState && (	
				<TrendPanelStyle>
					<div style={{marginLeft:"100px",textAlign: "center", fontSize: "2em"}}>{props.title}
							{/* Button for senior project group display */}
						<div style={{display: "inline"}}>
								<button 
									style={{
										float:"right",
										// marginRight:"1%",
										borderRadius:"4px",
										borderColor:"black",
										backgroundColor:"black",
										color:"white",
										padding:"3px 12px"
									}}
									onClick={() => setMapViewState(true)}
								>
								<FontAwesomeIcon size="sm" icon={faGlobeAmericas}/>
								</button>
							</div>
						</div>

						<TrendRow>
								<TrendBox title = "Waiting on MongoDB trends to go here" url = "http://cybexp1.acs.unr.edu/mongodb-charts-rxzhv/embed/charts?id=0d62d774-8aed-4ec2-a679-101f3c6fefa6&tenant=b83cdb1d-7ae9-4d7b-be7d-7932f473a41e" size = "large"></TrendBox>
						</TrendRow>
						<TrendRow>
								<TrendBox title = "Waiting on MongoDB trends to go here" url = "http://cybexp1.acs.unr.edu/mongodb-charts-rxzhv/embed/charts?id=425b9e45-f82e-4959-b34b-9513d04f23ea&tenant=b83cdb1d-7ae9-4d7b-be7d-7932f473a41e" size = "small"></TrendBox>
								<TrendBox title = "Waiting on MongoDB trends to go here" size = "small"></TrendBox>
						</TrendRow>
				</TrendPanelStyle>
			)}
			{mapViewState && (
				<TrendPanelStyle>
					<div style={{marginLeft:"100px",textAlign: "center", fontSize: "2em", zIndex: "10000", width: "100%"}}>Honeypot Attack Visualizer
							{/* Button for trends */}
						<div style={{display: "inline"}}>
							<button 
								style={{
									position:"fixed",
									// marginRight:"1%",
									borderRadius:"4px",
									right:"1%",
									borderColor:"black",
									backgroundColor:"black",
									color:"white",
									padding:"3px 12px"
								}}
								onClick={() => setMapViewState(false)}
							>
								<FontAwesomeIcon size="sm" icon={faChartLine}/>
							</button>
						</div>
					</div>
					<Honeypot></Honeypot>
				</TrendPanelStyle>
			)}
        </div>
    );
};

export default Trends;
