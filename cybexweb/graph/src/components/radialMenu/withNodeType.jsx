/**
 * This is a HOC for the radial menu.
 * See:
 * https://reactjs.org/docs/higher-order-components.html
 */

import React, { useContext } from 'react';
import axios from 'axios';
import MenuContext from '../App/MenuContext';




function withNodeType(RadialMenuComponent, nodeType, setNeo4jData, config) {
  const { setLoading } = useContext(MenuContext);

  if (nodeType === null) {
    return <></>;
  }

  function EnrichIPbyType(type) {
    setLoading(true);
    if (type === "cybexCount" || type === "cybexRelated"){
      axios
        .post(`/api/v1/enrich/${type}`, {Ntype: `${nodeType.properties.type}`, value: `${nodeType.properties.data}`})
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

  // function EnrichIPAll() {
  //   config.enrichments.IP.map(enrichmentType => {
  //     axios.get(`/api/v1/enrich/${enrichmentType}/${nodeType.properties.data}`).then(({ data }) => {
  //       if (data['insert status'] !== 0) {
  //         axios.get('/api/v1/neo4j/export').then(response => {
  //           setNeo4jData(response.data);
  //         });
  //       }
  //     });
  //     return true;
  //   });
  // }

  let icons = [];
  let onClickFns = [];
  let titles = [];
  // if (nodeType.label === 'IP') {
  //   // We could probably find a way to do this by YAML instead of hardcoding it
  //   onClickFns = config.enrichments.IP.map(enrichmentType => () => {
  //     return EnrichIPbyType(enrichmentType);
  //   });
  //   // Copy arrays
  //   titles = config.enrichments.IP.map(val => val);
  //   titles.push('all');
  //   icons = titles.map(val => val);
  //   onClickFns.push(() => EnrichIPAll());
  // }
  // return props => {
  //   return <RadialMenuComponent titles={titles} icons={icons} onClickFunctions={onClickFns} {...props} />;
  // };
  
  // If the selected node is a supported enrichment type (from config.yaml), then
  // the enrichment list is derived from there. If not supported (current example is when 
  // when querying cybexRelated attributes), default to 'Other' type.
  //*MODIFIED: Changed nodeType.label to nodeType.properties.type to detach radial logic from labels */
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
    return <RadialMenuComponent titles={titles} icons={icons} onClickFunctions={onClickFns} {...props} />;
  };

}

export default withNodeType;
