import React from 'react';

import Form from 'react-bootstrap/Form';

function Switch(props) {
    // const displayName = props.name.replace(/[^A-Za-z]/g, ' ');

    return (
        <Form>
            <Form.Check
                name={props.name}
                id={props.name + "-arc-switch"}
                type="switch"
                label={"Arcs"}
                checked={props.checked}
                disabled={props.disabled}
                onChange={props.onSwitchChange}
            />
        </Form>
    );
}

export default Switch;