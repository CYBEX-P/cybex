import React, { useState } from 'react';
import ReactMapGL, {Popup}  from 'react-map-gl';

import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';

import GeoJSON from "geojson";  // Used for converting map data to GeoJSON for the GeoJSON layers

function Map(props) {
  const [pointInfo, setPointInfo] = useState({});
  const [showPopup, setPopup] = useState(false);

  function displayTooltip(d) {
    setPointInfo(d);
    setPopup(true); // Make the popup visible
    return true; // "When an event is fired, the onHover or onClick callback of the affected layer is called first. If the callback returns a truthy value, the event is marked as handled. Otherwise, the event will bubble up to the DeckGL canvas and be visible to its onHover and onClick callbacks."
  }

  function convertToGeoJSON(data) {  // Function to convert raw map data to GeoJSON
    let individualRows = [];
    data.forEach(array => array.forEach(object => individualRows.push(object)));  // The scuffed line below destructures(?) the arrays and adds each individual object as an element to the array
    return GeoJSON.parse(individualRows, {Point: ['Latitude', 'Longitude']}); // Optionally specify which properites to include (e.g., "include: ['IP_Address', 'Honeypot', 'Counts', 'Dates']")
  }
  
  function formatData(data) {  // Currently used for cleaning and filtering the data for the arc layer
    let individualRows = [];
    data.forEach(array => array.forEach(object => {
      // If the current object is from a honeypot that has 'true' stored for that key, add it to the array
      if (props.honeypotsWithArcs[object.Honeypot]) {
        individualRows.push(object);
      }
    }));
    individualRows.forEach(object => object.Coordinates = [parseFloat(object.Longitude), parseFloat(object.Latitude)]);  // Coordinates must be of the right type else deck.gl fails silently
    return individualRows;
  }

  let dataGeoJSON = null;
  let arcData = null;

  if (props.data != null) {  // These converisons should not be applied in the initial (no-data) state
    dataGeoJSON = convertToGeoJSON(props.data);
    arcData = formatData(props.data);
  }

  // When the map & overlay load, what will the initial perspective (zoom, location, etc.) be?
  const INITIAL_VIEW_STATE = {
    longitude: -119.815,
    latitude: 39.545,
    zoom: 3,
    pitch: 0,
    bearing: 0
  };

  let honeypotPoints = [];
  for (const object in props.honeypotProperties) {  // For each honeypot object...
    let objectToPush = props.honeypotProperties[object];  // ...take that object...
    objectToPush.Honeypot = object;  // ...and give it a new 'Honeypot' property equal to the honeypot name (object is the key, not the [key, value] pair)
    honeypotPoints.push(objectToPush);
  }
  // Finally, convert the honeypot points to GeoJSON for adding to the map
  let honeypotPointsGeoJSON = GeoJSON.parse(honeypotPoints, {Point: 'Coordinates'});

  let layers = props.overlayVisibility ? [  // Ternary operator. If the overlayVisibility is true, then include all the layers. Else, layers is null.
    new GeoJsonLayer({
      id: 'attacks',
      data: dataGeoJSON,
      // Radii Properties
      getRadius: 1000, // in pointRadiusUnits (or meters, if not specified)
      pointRadiusMinPixels: 5,
      pointRadiusMaxPixels: 20,
      // Fill Properties
      filled: true,
      getFillColor: [0, 0, 0, 150],
      // Stroke Properties
      stroked: true,
      getLineColor: d => props.honeypotProperties[d.properties.Honeypot].Color.slice(0,3),
      lineWidthUnits: "pixels",
      lineWidthMinPixels: 3,
      // Interactive Properties
      pickable: true,
      onClick: d => displayTooltip(d)
    }),
    new GeoJsonLayer({
      id: 'honeypots',
      data: honeypotPointsGeoJSON,
      // Radii Properties
      getRadius: 100,
      pointRadiusMinPixels: 15,
      // Fill Properties
      filled: true,
      getFillColor: d => d.properties.Color,
      // Stroke Properties
      stroked: true,
      getLineColor: [255, 255, 255],
      lineWidthUnits: "pixels",
      lineWidthMinPixels: 3,
      lineWdithMaxPixels: 3,
    }),
    new ArcLayer({
      id: 'arcs',
      data: arcData,
      getSourcePosition: d => d.Coordinates,
      getTargetPosition: d => props.honeypotProperties[d.Honeypot].Coordinates,
      getSourceColor: d => props.honeypotProperties[d.Honeypot].Color.slice(0,3), 
      getTargetColor: d => props.honeypotProperties[d.Honeypot].Color.slice(0,3),
    })
  ] : null;

  let popupContent = pointInfo.object &&
    <>
      <h5>Attack on <b>{pointInfo.object.properties.Honeypot}</b></h5>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-broadcast-pin" viewBox="0 0 16 16">
          <path d="M3.05 3.05a7 7 0 0 0 0 9.9.5.5 0 0 1-.707.707 8 8 0 0 1 0-11.314.5.5 0 0 1 .707.707zm2.122 2.122a4 4 0 0 0 0 5.656.5.5 0 1 1-.708.708 5 5 0 0 1 0-7.072.5.5 0 0 1 .708.708zm5.656-.708a.5.5 0 0 1 .708 0 5 5 0 0 1 0 7.072.5.5 0 1 1-.708-.708 4 4 0 0 0 0-5.656.5.5 0 0 1 0-.708zm2.122-2.12a.5.5 0 0 1 .707 0 8 8 0 0 1 0 11.313.5.5 0 0 1-.707-.707 7 7 0 0 0 0-9.9.5.5 0 0 1 0-.707zM6 8a2 2 0 1 1 2.5 1.937V15.5a.5.5 0 0 1-1 0V9.937A2 2 0 0 1 6 8z"/>
        </svg>
        From: {pointInfo.object.properties.IP_Address}
      </div>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-alt-fill" viewBox="0 0 16 16">
          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
        </svg>
        Lat: {pointInfo.object.geometry.coordinates[0]} Long: {pointInfo.object.geometry.coordinates[1]}
      </div>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-shield-fill-x" viewBox="0 0 16 16">
          <path d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zM6.854 5.146 8 6.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 7l1.147 1.146a.5.5 0 0 1-.708.708L8 7.707 6.854 8.854a.5.5 0 1 1-.708-.708L7.293 7 6.146 5.854a.5.5 0 1 1 .708-.708z"/>
        </svg>
        Tot. no. of days of attacks: {pointInfo.object.properties.Counts}
      </div>
    </>

  return(
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        onClick={() => setPopup(false)}
      >
        <ReactMapGL
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_API}
          mapStyle={process.env.REACT_APP_MAPBOX_STYLE} // TODO: Move away from using environment variable and explore possibility of dynamically changing
        >
          {showPopup && <Popup
              latitude={pointInfo.object.geometry.coordinates[1]}
              longitude={pointInfo.object.geometry.coordinates[0]}
              closeButton={false}
              anchor="top"
            >
              {popupContent}
            </Popup>
          }
        </ReactMapGL>
      </DeckGL>
    </>
  );
}

export default Map;