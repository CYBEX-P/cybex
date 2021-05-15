import React from 'react';

import InputGroup from 'react-bootstrap/InputGroup';

function Checkbox(props) {
    const classNameField = "bg-" + props.name + " text-white font-weight-bolder"; // See custom.scss for the honeypot colors we added to the Bootstrap theme colors to allow for "bg-Amsterdam" etc. 
    const displayName = props.name.replace(/[^A-Za-z]/g, ' '); // Mostly for changing "New_York" to "New York" for display purposes

    return (
        <InputGroup className="m-1" size="sm">
            <InputGroup.Prepend>
                <InputGroup.Checkbox
                    name={props.name}
                    onChange={props.onCheckboxChange} 
                    checked={props.checked}
                />
            </InputGroup.Prepend>
            <InputGroup.Text className={classNameField}>{displayName}</InputGroup.Text>
        </InputGroup>
    )
}

export default Checkbox;