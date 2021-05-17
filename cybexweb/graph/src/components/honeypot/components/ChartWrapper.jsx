import React from 'react';
import { ResponsivePie } from '@nivo/pie'

function ChartWrapper(props) {
  // Create an empty object where each honeypot is a key and has a numeric value representing the number of points on the map for that honeypot
  let data_obj = Object.keys(props.honeypots).reduce(
    (honeypots, honeypot) => ({
        ...honeypots,
        [honeypot]: 0
    }),
    {}
  );

  if (props.data) { // Need to make sure that props.data is not null, e.g., on initial application load
    for (let array of props.data) { // Each array of mapData is the points for a particular honeypot
      let current_honeypot = array[0]["Honeypot"]; // Look inside each array, at its first element, and see what honeypot this array is
      data_obj[current_honeypot] = array.length; // Store in the data_obj the length of the array e.g., the number of points on the map for that honeypot
    }
  }

  let data = [];  // Nivo expects an array of objects
  
  for (const [key, value] of Object.entries(data_obj)) { // Convert our data object into the appropriately-formed array of objects
    data.push({
      "id": key,
      "value": value,
      "color": props.honeypots[key]["HexColor"],
    });
  }

  // Used for displaying the total number of attacks in the center of the pie chart
  const CenteredMetric = ({ dataWithArc, centerX, centerY }) => {
    let total = 0
    dataWithArc.forEach(datum => {
        total += datum.value
    })

    return (
      total > 0 ? 
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
            fontSize: '2em',
            fontWeight: '500',
            fill: 'white'
        }}
      >
          {total}
      </text> :
      null
    )
  }

  return(
    <ResponsivePie
      data={data}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      innerRadius={0.6}
      enableArcLinkLabels={false}
      arcLabelsSkipAngle={20}
      arcLabelsTextColor="#ffffff"
      colors={{ datum: 'data.color' }}
      activeOuterRadiusOffset={8}
      layers={['arcs', 'arcLabels', CenteredMetric]}
    />
  )
}

export default ChartWrapper;