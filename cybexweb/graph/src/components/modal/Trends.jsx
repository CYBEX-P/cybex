import React, { useContext, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import { faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';

import TrendsContext from '../App/TrendsContext';
import TrendBox from './TrendBox';
import { TrendPanelStyle } from '../__styles__/styles';
import TrendRow from './TrendRow';

const Trends = (props) => {
	const [mapViewState, setMapViewState] = useState(false);

    // const trendDisplay = useContext(TrendsContext); // Only used if Trends panel toggle is context-driven
    return (
        /* Below is only used if Trends panel toggle becomes context-driven. 
           Context would be better practice than current state implementation, but this is not a current priority.
           To be removed in future release if trends panel remains state-driven within navbar component */
        // <div>
        //     {trendDisplay && (
        //     <TrendPanelStyle>
        //         <div style ={{padding: "1%",textAlign: "center", fontSize: "2em"}}>{props.title}</div>
        //         <TrendRow>
        //             <TrendBox title = "Waiting on MongoDB trends to go here" size = "large"></TrendBox>
        //         </TrendRow>
        //         <TrendRow>
        //             <TrendBox title = "Waiting on MongoDB trends to go here" size = "small"></TrendBox>
        //             <TrendBox title = "Waiting on MongoDB trends to go here" size = "small"></TrendBox>
        //         </TrendRow>
        //     </TrendPanelStyle>)}
        // </div>
        <div>
					{!mapViewState && (	
					<TrendPanelStyle>
						<div style={{marginLeft:"100px",textAlign: "center", fontSize: "2em"}}>{props.title}
								{/* Button for senior project group display */}
							<div style={{display: "inline"}}>
									<button 
										style={{
											float:"right",
											marginRight:"3%",
											borderRadius:"4px",
											borderColor:"#6c757d",
											backgroundColor:"#6c757d",
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
						<div style={{marginLeft:"100px",textAlign: "center", fontSize: "2em"}}>IP Map View
								{/* Button for trends*/}
							<div style={{display: "inline"}}>
									<button 
										style={{
											float:"right",
											marginRight:"3%",
											borderRadius:"4px",
											borderColor:"#6c757d",
											backgroundColor:"#6c757d",
											color:"white",
											padding:"3px 12px"
										}}
										onClick={() => setMapViewState(false)}
									>
									<FontAwesomeIcon size="sm" icon={faChartBar}/>
									</button>
								</div>
							</div>
							
					{/* PUT SENIOR PROJECT STUFF HERE */}
							<TrendRow>
									<TrendBox title = "Waiting on MongoDB trends to go here" url = "http://cybexp1.acs.unr.edu/mongodb-charts-rxzhv/embed/charts?id=0d62d774-8aed-4ec2-a679-101f3c6fefa6&tenant=b83cdb1d-7ae9-4d7b-be7d-7932f473a41e" size = "large"></TrendBox>
							</TrendRow>
							<TrendRow>
									<TrendBox title = "Waiting on MongoDB trends to go here" url = "http://cybexp1.acs.unr.edu/mongodb-charts-rxzhv/embed/charts?id=425b9e45-f82e-4959-b34b-9513d04f23ea&tenant=b83cdb1d-7ae9-4d7b-be7d-7932f473a41e" size = "small"></TrendBox>
									<TrendBox title = "Waiting on MongoDB trends to go here" size = "small"></TrendBox>
							</TrendRow>



					</TrendPanelStyle>
					)}
        </div>
    );
};

export default Trends;
