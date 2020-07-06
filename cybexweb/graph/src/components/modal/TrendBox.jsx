import React, { useContext } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';

import { TrendBoxStyle } from '../__styles__/styles';

const TrendBox = (props) => {
    var width = "48%"; // Default width, is replaced by responsive sizing in following logic.
    if (props.size == "large") {
        width = "98%";
    }
    return (
            <div style={{width: width}}>
                <TrendBoxStyle>
                    <iframe width="100%" height="100%" style={{borderRadius: "5px", border: "none"}}src={props.url}></iframe>
                    {/* <div>{props.title}</div> */}
                </TrendBoxStyle>
            </div>
    );
};

export default TrendBox;