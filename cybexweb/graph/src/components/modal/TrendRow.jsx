/*
Component representing the rows used within the layout of the trends screen.
TrendBox components are to be placed within TrendRows.
*/

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