import React, { useContext } from 'react';


import { TrendRowStyle } from '../__styles__/styles';

const TrendRow = (props) => {
    return (
        <TrendRowStyle>
            {props.children}
        </TrendRowStyle>
    );
};

export default TrendRow;