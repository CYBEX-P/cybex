import React, { useContext } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';

import TrendsContext from '../App/TrendsContext';
import TrendBox from './TrendBox';
import { TrendPanelStyle } from '../__styles__/styles';
import TrendRow from './TrendRow';

const Trends = (props) => {
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
            <TrendPanelStyle>
                <div style ={{padding: "1%",textAlign: "center", fontSize: "2em"}}>{props.title}</div>
                <TrendRow>
                    <TrendBox title = "Waiting on MongoDB trends to go here" url = "http://cybexp1.acs.unr.edu/mongodb-charts-rxzhv/embed/charts?id=0d62d774-8aed-4ec2-a679-101f3c6fefa6&tenant=b83cdb1d-7ae9-4d7b-be7d-7932f473a41e" size = "large"></TrendBox>
                </TrendRow>
                <TrendRow>
                    <TrendBox title = "Waiting on MongoDB trends to go here" url = "http://cybexp1.acs.unr.edu/mongodb-charts-rxzhv/embed/charts?id=425b9e45-f82e-4959-b34b-9513d04f23ea&tenant=b83cdb1d-7ae9-4d7b-be7d-7932f473a41e" size = "small"></TrendBox>
                    <TrendBox title = "Waiting on MongoDB trends to go here" size = "small"></TrendBox>
                </TrendRow>
            </TrendPanelStyle>)}
        </div>
    );
};

export default Trends;