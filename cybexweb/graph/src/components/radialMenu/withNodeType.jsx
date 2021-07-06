/**
 * This is a HOC for the radial menu.
 * See:
 * https://reactjs.org/docs/higher-order-components.html
 */

import React, { useContext } from 'react';
import axios from 'axios';
import MenuContext from '../App/MenuContext';
import Button from '../Button/Button';

// Helper function to truncate strings (used for delete button text)
const truncate = (input,numChar) => input.length > numChar ? `${input.substring(0, numChar)}...` : input;

function withNodeType(RadialMenuComponent, nodeType, setNeo4jData, config, fromDate, toDate, timezone) {
  const { setLoading } = useContext(MenuContext);

  if (nodeType === null) {
    return <></>;
  }

  
  axios.defaults.xsrfCookieName = 'csrftoken'
  axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

  function EnrichIPbyType(type) {
    setLoading("Enriching " + type);
    if (timezone == ''){
      // Default to user's (clientside) local timezone string if not selected
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone.replace("/","-");
    }
    if (type === "cybexCount" || type === "cybexRelated"){
      axios
        .post(`/api/v1/enrich/${type}/`, {
          Ntype: `${nodeType.properties.type}`, 
          value: `${nodeType.properties.data}`, 
          fromDate: fromDate, 
          toDate: toDate,
          timezone: timezone})
        .then(({ data }) => {
          // Response is being passed back as serialized string. 
          // Need to see if other request handlers need this change too.
          // Change made here to ensure cybex request handling is robust.
          data = JSON.parse(data);
          if (data['insert status'] > 0) {
            axios
              .get('/api/v1/neo4j/export')
              .then(response => {
                setNeo4jData(response.data);
                setLoading(false);
              })
          }
          // Adding status code response handling for common cybex enrichment problems
          else if (data['insert status'] == 0){
            alert("CYBEX Query timed out. Graph must now reload.")
            axios
              .get('/api/v1/neo4j/export')
              .then(response => {
                setNeo4jData(response.data);
                setLoading(false);
              })
          }
          else if (data['insert status'] < 0){
            alert("An error occured with the CYBEX Query. Graph must now reload.")
            axios
              .get('/api/v1/neo4j/export')
              .then(response => {
                setNeo4jData(response.data);
                setLoading(false);
              })
          }
        }); 
    }
    else if (type !== "pdns" && type !== "enrichURL")
    {
      axios.get(`/api/v1/enrich/${type}/${nodeType.properties.data}`).then(({ data }) => {
        if (data['insert status'] !== 0) {
          axios.get('/api/v1/neo4j/export').then(response => {
            setNeo4jData(response.data);
            setLoading(false);
          });
        }
      });
    }
    // May be deprecated...
    else if (type === "pdns"){
      axios
        .post(`/api/v1/enrichPDNS`, {value: `${nodeType.properties.data}`})
        .then(({ data }) => {
          if (data['insert status'] !== 0) {
            axios
              .get('/api/v1/neo4j/export')
              .then(response => {
                setNeo4jData(response.data);
                setLoading(false);
              })
          }
        }); 
    }
    else if (type === "enrichURL"){
      axios
        .post(`/api/v1/enrichURL`, {value: `${nodeType.properties.data}`})
        .then(({ data }) => {
          if (data['insert status'] !== 0) {
            axios
              .get('/api/v1/neo4j/export')
              .then(response => {
                setNeo4jData(response.data);
                setLoading(false);
              });
          }
        });
    }
  }

  function deleteNode(id)
  {
    axios
        .get(`/api/v1/delete/${id}`)
        .then(({ data }) => {
          if (data['insert status'] !== 0) {
            axios
              .get('/api/v1/neo4j/export')
              .then(response => {
                setNeo4jData(response.data);
                setLoading(false);
              })
          }
        }); 
  }

  let icons = [];
  let onClickFns = [];
  let titles = [];
  
  // If the selected node is a supported enrichment type (from config.yaml), then
  // the enrichment list is derived from there. If not supported, default to 'Other' type.
  var nodeLabel;
  if (config.enrichments[`${nodeType.properties.type}`] == undefined)
  {
    nodeLabel = 'Other';
  }
  else
  {
    nodeLabel = nodeType.properties.type
  }
  onClickFns = config.enrichments[`${nodeLabel}`].map(enrichmentType => () => {
    return EnrichIPbyType(enrichmentType);
  });
  titles = config.enrichments[`${nodeLabel}`].map(val => val);
  icons = titles.map(val => val);
  return props => {
    return (
      <div>
        <RadialMenuComponent titles={titles} icons={icons} onClickFunctions={onClickFns} {...props} />
        <div 
          style={{
            backgroundColor: "#58a5f0",
            color: "black",
            borderRadius:'5px',
            padding:'5px',
            paddingBottom: '0px',
            paddingTop: '10px',
            boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)",
            position: "absolute",
            left: "10px",
            bottom: "10px",
            zIndex: 100000
          }} 
          onClick={() => deleteNode(nodeType.id)}
        >
          <p>Delete {nodeType.properties.type}: {truncate(nodeType.properties.data,32)}</p>
        </div>
      </div>
    );
  };

}

export default withNodeType;
