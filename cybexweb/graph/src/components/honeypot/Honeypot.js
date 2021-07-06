/*
Parent component for the honeypot viewer application. 
This is transplanted from a prior seperate student project.
*/

import React, { useState, useEffect, Fragment } from 'react';
import Axios from "axios";
import DateRangePicker from '@wojtekmaj/react-daterange-picker';

import './custom.scss';

// React-boostrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

// User-defined components
import Map from './components/Map';
import Checkbox from './components/Checkbox';
import Switch from './components/Switch';
import ChartWrapper from './components/ChartWrapper'

function Honeypot() {
    const HONEYPOT_PROPERTIES = {  // Assigned color (which should match that in custom.scss) and location for each honeypot
        Amsterdam: {"Coordinates": [4.8936041, 52.3727598], "Color": [224, 0, 97, 170], "HexColor": "#E00061"},
        Bangalore: {"Coordinates": [77.5912997, 12.9791198], "Color": [253, 85, 7, 170], "HexColor": "#FD5507"},
        London: {"Coordinates": [-0.1276474, 51.5073219], "Color": [245, 180, 0, 170], "HexColor": "#F5B400"},
        New_York: {"Coordinates": [-74.0060152, 40.7127281], "Color": [86, 171, 33, 170], "HexColor": "#56AB21"},
        Singapore: {"Coordinates": [103.8194992, 1.357107], "Color": [31, 117, 255, 170], "HexColor": "#1F75FF"},
        Toronto: {"Coordinates": [-79.3839347, 43.6534817], "Color": [114, 20, 245, 170], "HexColor": "#7214F5"}
    }

    const [overlayVisibility, setOverlayVisibility] = useState(true);  // Used to toggle the entire deck.gl overlay on and off
    const [mapData, setMapData] = useState(null);  // Used to store the raw data which is passed to the map
    const [dateRange, setDateRange] = useState(null); //Used to create the calender and set it to an initial state
    const [honeypotSelections, setHoneypotSelections] = useState(Object.keys(HONEYPOT_PROPERTIES).reduce(  // Used to store which honeypots are selected. Updates in real time.
        // This call to .reduce takes the HONEYPOTS array and creates an object with each element of the array as a key/proeprty and an initialized value
        // In the form {"Amsterdam": false, ...}
        (honeypots, honeypot) => ({
            ...honeypots,
            [honeypot]: false
        }),
        {}
    ))
    const [arcSelections, setArcSelections] = useState(Object.keys(HONEYPOT_PROPERTIES).reduce(  // Used to store which arcs are enabled
        (honeypots, honeypot) => ({
            ...honeypots,
            [honeypot]: false
        }),
        {}
    ))  // Note that arcSelections will always be a subset of appliedFilters.appliedHoneypots
    const [appliedFilters, setAppliedFilters] = useState({appliedHoneypots: [], selectedDateRange: []});  // Stores filters when they are applied
    const [sidebarVisibility, setSidebarVisibility] = useState(true);

    function toggleOverlayVisibility() {
        return(setOverlayVisibility(!overlayVisibility));
    }

    function toggleSidebarVisibility() {
        return(setSidebarVisibility(!sidebarVisibility));
    }

    function requestHoneypotData(honeypots, dateRange) {
        if (honeypots.length === 0) { // If no honeypots were specified, exit the function early
            setMapData(null);  // Ensure that mapData is cleared if there is old data (from previous requests)
            return;
        }
        // Future idea: should we cache request data to reduce load on the server?
        // Currently, every filter change results in a new request, even if the data we are requesting is a subset of the data we already have
        Axios.post('/api/attacks', {  // Make an HTTP POST request
            // Request body, specify paramters for the backend API
            honeypots: honeypots,
            dateRange: dateRange
        })
        // Wait for the request to resolve
        .then(function (response) {
            // Save the response data to mapData
            // TODO: Explore Axios error handling
            setMapData(response.data);
        })
    }

    function handleHoneypotSelectionChange(changeEvent) {  // Event handler for the honeypot filters
        const affectedBox = changeEvent.target.name;  // Which checkbox was affected? Relies on the InputGroup having an expected name set
        const newState = changeEvent.target.checked;  // Is the checkbox now checked or unchecked?
        const updateObject = {[affectedBox]: newState};  // ES6 allows for the use of a ComputedPropertyName (e.g., [affectedBox]) in initializing an object literal
        // setState does replacement, not merge
        setHoneypotSelections(prevState => { 
            return {...prevState, ...updateObject} // Keep the previous state, but update the affected key/value pair
        });
    }

    function handleArcSelectionChange(changeEvent) {  // Event handler for the arc toggles
        const affectedSwitch = changeEvent.target.name;
        const newState = changeEvent.target.checked;
        const updateObject = {[affectedSwitch]: newState};
        setArcSelections(prevState => {
            return {...prevState, ...updateObject}
        });
    }

    function createControlbox(name) {
        // Each call to this function creates a honeypot filter and an arc switch using the given name (e.g., "Amsterdam")
        return(
            <Row className="align-items-center">
                <Col>
                    <Checkbox
                        name={name}
                        onCheckboxChange={handleHoneypotSelectionChange}
                        checked={honeypotSelections[name]}
                    />
                </Col>
                <Col className="switchCol">
                    <Switch
                        name={name}
                        onSwitchChange={handleArcSelectionChange}
                        checked={arcSelections[name]}
                        disabled={!appliedFilters.appliedHoneypots.includes(name)} // Disable the ability to toggle the button if the corresponding honeypot is not shown on the map
                    />
                </Col>
            </Row>
        )
    }

    function createControlboxes() {
        // For each honeypot in HONEYPOTS, call createControlbox
        return(Object.keys(HONEYPOT_PROPERTIES).map(createControlbox))
    }

    // Motivation: We don't want to make API requests until the user has confirmed their filters
    function applyFilters() {  // Event handler for the "Apply Filters" button
        // Prepare new filter
        let newHoneypotFilter = [];
        // If the checkbox is selected, add the name of the honeypot to the filter
        for (const [key, value] of Object.entries(honeypotSelections)) {
            if (value) {
                newHoneypotFilter.push(key);
            }
        }
        setAppliedFilters(prevState => {
            return {...prevState, ...{appliedHoneypots: newHoneypotFilter, selectedDateRange: dateRange}}
        });
    }

    function clearFilters(){
        setHoneypotSelections(Object.fromEntries(Object.keys(honeypotSelections).map((key) => [key, false]))); 
        setDateRange(null);
        setArcSelections(Object.fromEntries(Object.keys(arcSelections).map((key) => [key, false])));
        setAppliedFilters({appliedHoneypots: [], selectedDateRange: dateRange});
    }

    function anySelected(stateObj) { // Check if any values of the given object are true
        return Object.values(stateObj).some((bool) => bool === true);
    }

    function setAllSelections(stateObj, stateSetter) { // Set all values of the given staet object to the opposite of anySelected. e.g., if any values are selected, deselect all. If none are selected, select all.
        stateSetter(Object.fromEntries(Object.keys(stateObj).map((key) => [key, !anySelected(stateObj)]))); 
    }

    // Motivation: useEffect is called each time React updates the DOM, so this is a good way to make API calls
    useEffect(() => {
        // TODO: Provide indication to user that the request is happening. https://react-bootstrap.github.io/components/buttons/#button-loading-state
        // Note that requestHoneypotData would likely need to be reworked to return a promise
        requestHoneypotData(appliedFilters.appliedHoneypots, appliedFilters.selectedDateRange);
    }, [appliedFilters]) // If the applied filters haven't changed on re-render, don't run this useEffect.

    return(
        // <>...</> is a fragment and ensures that JSX expressions have a single parent element without having to use unnecessary divs
        //date range picker is formatting the calender, we need to implement the minDate 
        <>
            <div className="h-100" id="sidebar_parent">
                <Container fluid id="sidebar" className={"h-100 pt-3" + (sidebarVisibility ? "" : " sidebar-hidden")}>
                    {createControlboxes()}
                    <Row>
                        <Col>
                            <Button variant={anySelected(honeypotSelections) ? "warning" : "light"} className="m-1" onClick={() => setAllSelections(honeypotSelections, setHoneypotSelections)}>
                                {anySelected(honeypotSelections) ? "Deselect all" : "Select all"}
                                {anySelected(honeypotSelections) ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-square" viewBox="0 0 16 16">
                                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                        <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                                    </svg>
                                }
                            </Button>
                        </Col>
                        <Col>
                            <Button variant={anySelected(arcSelections) ? "warning" : "light"} className="m-1" onClick={() => setAllSelections(arcSelections, setArcSelections)}>
                                {anySelected(arcSelections) ? "Deselect all" : "Select all"}
                                {anySelected(arcSelections) ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                    </svg> : 
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-square" viewBox="0 0 16 16">
                                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                        <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                                    </svg>
                                }
                            </Button>
                        </Col>
                    </Row>
                    <Row className="top_bottom_padding">
                        <Col>
                            <DateRangePicker 
                                minDate={new Date("August 1, 2020")}
                                maxDate={(() => {let date = new Date(); date.setDate(date.getDate() - 7); return date;})()}
                                className="p-1"
                                onChange={setDateRange}
                                value={dateRange}
                                showLeadingZeros={true}
                                rangeDivider=" to "
                                dayPlaceholder="dd"
                                monthPlaceholder="mm"
                                yearPlaceholder="yyyy"
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button variant={overlayVisibility ? "light" : "secondary"} className="m-1" onClick={toggleOverlayVisibility}>{overlayVisibility ? "Turn Overlay Off" : "Turn Overlay On"}</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col id="header_col">
                            <h4>Statistics</h4>
                            <h5>{appliedFilters.appliedHoneypots.length === 0 ? "No data to summarize on the map" : "Number of displayed attacks by honeypot"}</h5>
                        </Col>
                    </Row>
                    <Row id="chart_row">
                        <Col id="chart_column">
                            <ChartWrapper data={mapData} honeypots={HONEYPOT_PROPERTIES} />
                        </Col>
                    </Row>
                    <Row id="filter_button_row">
                        <Col>
                            <Button variant="success" className="m-1" onClick={applyFilters}>
                                Apply Filters
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2" viewBox="0 0 16 16">
                                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                                </svg>
                            </Button>
                        </Col>
                        <Col>
                            <Button variant="danger" className="m-1" onClick={clearFilters}>
                                Clear Filters
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </Button>
                        </Col>
                    </Row>
                </Container>
                <div id="sidebar_toggle" className={sidebarVisibility ? "" : "sidebar-hidden"} onClick={toggleSidebarVisibility}>
                    {
                        sidebarVisibility ? 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-chevron-bar-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M11.854 3.646a.5.5 0 0 1 0 .708L8.207 8l3.647 3.646a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708 0zM4.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-.5-.5z"/>
                        </svg> :
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-chevron-bar-right" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.146 3.646a.5.5 0 0 0 0 .708L7.793 8l-3.647 3.646a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708 0zM11.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5z"/>
                        </svg>
                    }
                </div>
            </div>
            <Map overlayVisibility={overlayVisibility} data={mapData} honeypotsWithArcs={arcSelections} honeypotProperties={HONEYPOT_PROPERTIES}/>
        </>
    )
}

export default Honeypot;