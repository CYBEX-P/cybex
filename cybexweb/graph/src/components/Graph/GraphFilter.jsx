import React, { useState, useEffect } from 'react';

import { faFilter, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TimezoneSelect from 'react-timezone-select';
import DatePicker from 'react-datepicker';
import moment from 'moment';


const GraphFilter = (props) => {
	const [filterState, setFilterState] = useState(false);
	const [selectedTimezone, setSelectedTimezone] = useState('');

	// Get ~one year ago's date (default fromDate)
	let previousDate = new Date();
	previousDate.setDate(previousDate.getDate() - 365);

	const [toDate, setToDate] = useState(new Date());
	const [fromDate, setFromDate] = useState(previousDate);
	
	const displayDatePickerFrom = () => {
		return <div>
				<DatePicker 
					selected={fromDate} 
					onChange={date => setFromDateHelper(date)}
					isClearable
					showMonthDropdown
					showYearDropdown
					dropdownMode="select"
					placeholderText="Click to select a date"/>				
		</div>
	}
	const displayDatePickerTo = () => {
		return <div>
				<DatePicker 
					selected={toDate} 
					onChange={date => setToDateHelper(date)} 
					isClearable
					showMonthDropdown
					showYearDropdown
					dropdownMode="select"
					placeholderText="Click to select a date"/>
		</div>
	}

	const displayTimezonePicker = () => {
		return (
			<div>
				<TimezoneSelect
					value={selectedTimezone}
					onChange={setTimezoneHelper}
				/>
			</div>
		);

	}

	
	const setFromDateHelper = (date) => {
		console.log(date);
		setFromDate(date);
		props.setFromDate(moment(date).format('YYYY-MM-DD hh:mma'));
	}

	const setToDateHelper = (date) => {
		//date = moment(date).format('yyyy/MM/dd hh:mma');
		setToDate(date);
		props.setToDate(moment(date).format('YYYY-MM-DD hh:mma'));
	}

	const setTimezoneHelper = (e) => {
		// e is the timezone object (used to display the same timezone if user exits filter button)
		setSelectedTimezone(e);
		// gives the labal of the timezone back to the Graph.jsx page
		props.setTimezone(e.label);
	}

	
	const closedFilter = () => {
		return (
			<div style={{
				position:"absolute",
				right:"1%",
				top:"65px",
				zIndex: 4,
				backgroundColor: "black",
				color: "white",
				opacity: "0.95",
				borderRadius: "10px",
				padding: "13px",
				paddingTop:"10px",
				paddingBottom: "10px",
				boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"
			}}
				onClick={() => setFilterState(!filterState)}>
					<FontAwesomeIcon size="1x" icon={faFilter}/>
			</div>
		);
	}

	const openedFilter = () => {
		return (
			<div style={{
				position:"absolute",
				width:"300px",
				right:"10px",
				top:"65px",
				zIndex: 4,
				backgroundColor: "black",
				color: "white",
				borderRadius: "10px",
				padding: "20px",
				paddingBottom: "20px",
				boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"
			}}>
				<div onClick={() => setFilterState(!filterState)}>
					<FontAwesomeIcon size="2x" icon={faTimesCircle} style={{position:'absolute',right:'10px', top: '10px'}}/>
				</div>
				<h4 style={{textAlign:"center"}}>
					<b>Filters</b>
				</h4>
				<h4 />
				<h5> Time</h5>
				<div style={{color:"white",fontSize:"large"}}>
					From: 
					{displayDatePickerFrom()}
					{/*
					<input 
						style={{width:'70px',backgroundColor:"white",border:"none",borderRadius:"5px",marginRight:"10px"}}
						value={fromDate}
						onChange={setFromDateHelper}>

					</input>
					*/}
					To: 
					{displayDatePickerTo()}
					{/* <input 
						style={{width:'70px',backgroundColor:"white",border:"none",borderRadius:"5px",marginRight:"10px"}}
						value={toDate}
						onChange={setToDateHelper}>
					</input>
					*/}
				</div><br></br>
				Time Zone:
				<div style={{
					color: "black"
				}}>
					{displayTimezonePicker()}
				</div>

			</div>
		);
	}
	let condition;
	if (filterState === false) {
		condition = closedFilter();
	}
	if (filterState === true) {
		condition = openedFilter();
	}
	return (
		<div>
			{condition}
		</div>
	);

};

export default GraphFilter;

