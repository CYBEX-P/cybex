import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { camelCase } from 'lodash';
import { MacroCardContainer, MacroCard, MacroCardButtons, MacroDetailsCard } from './styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faPlayCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

// Macros represents the container that holds all of the possible
export const Macros = ({ setLoading, setNeo4jData, dispatchModal, setMacroDetails }) => {

  // Arrays of possible macros (including subroutines and other sub-types)
  const subroutines = ['Enrich IPs', 'Deconstruct URLs', 'Resolve Domains', 'Resolve Hosts', 'Deconstruct Emails'];
  const macros = ['Standard Lookups', 'CYBEX-P Analysis'];

  // A mapping is needed to reference the proper API calls
  // The API calls themselves are abstracted to a different file
  const macroMapping = {
    standardLookups: 'macro',
    cybexPAnalysis: 'macroCybex'
  };

  const subRoutineMapping = {
    enrichIPs: 'ips',
    deconstructURLs: 'urls',
    resolveDomains: 'domains',
    resolveHosts: 'hosts',
    deconstructEmails: 'emails'
  };

  // Mapping used to construct details content for each macro
  // This can be customized and the frontend components will
  // automatically reflect the new content
  const detailsMapping = {
      standardLookups: {
        urlDetails: {
          headerText: "URL",
          listItems: ["Deconstruct URL"]
        },
        emailDetails: {
          headerText: "Email",
          listItems: ["Deconstruct Email"]
        },
        hostDetails: {
          headerText: "Host",
          listItems: ["Resolve IP", "Resolve MX", "Resolve Nameservers"]
        },
        domainDetails: {
          headerText: "Domain",
          listItems: ["Resolve IP", "Resolve MX", "Resolve Nameservers"]
        },
        ipDetails: {
          headerText: "IP",
          listItems: ["Enrich ASN", "Enrich GIP", "Enrich WHOIS", "Enrich Hostname", "Return Ports", "Return Netblock"]
        }
      },
      cybexPAnalysis: {
        threatDetails: {
          headerText: "Performs threat analysis on all supported IOC nodes.",
          listItems: [
            "Adds related IOCs exposed by CYBEX event data",
            "Determines IOC threat level",
            "Scales IOC nodes according to relative number of sightings"
          ]
          // TODO: Change wording of last listItem to reflect new scaling rule, once implemented
        }
      }
  }

  // Retrieve data from the backend API from the MacroButton that was clicked
  const retrieveAPIData = actionParam => {
    setLoading(true);
    axios.get(`/api/v1/${actionParam}`).then(() => {
      axios
        .get('/api/v1/neo4j/export')
        .then(({ data }) => {
          setNeo4jData(data);
          setLoading(false);
        })
        .catch(() => {
          dispatchModal('Error');
          setLoading(false);
        });
    });
  };

  // handleInfoClick should pop open a modal corresponding to the aproppriate help text
  const handleInfoClick = info => {
    // convert selected macro to camelCase to match with detailsMapping key
    let selectedMacro = camelCase(info);
    // Check that the selected macro has a corresponding details entry...
    // If so, populate macroDetail. Else, set macroDetails to default text
    // telling the user that no macro details are available.
    if (selectedMacro in detailsMapping) {
      var selectedDetails = {
        macro: info,
        details: detailsMapping[selectedMacro]
      }
    }
     else {
      var selectedDetails = {
        macro: info,
        details: {
          noDetails: {
            headerText: "No details are available for this macro.",
            listItems: []
          }
        }
      }
    }
    setMacroDetails(selectedDetails);
  };

  // TODO:
  // - abstract the for loops into their own functions
  const handleMacroClick = macroAction => {
    // Parse the action into camel case
    const action = camelCase(macroAction);

    // Check if macroAction exists within the macroMapping
    for (const [key, _] of Object.entries(macroMapping)) {
      if (action === key) {
        retrieveAPIData(macroMapping[action]);
      }
    }

    // Check if the macroAction exists within the subroutineMapping
    for (const [key, _] of Object.entries(subRoutineMapping)) {
      if (action === key[0]) {
        retrieveAPIData(subRoutineMapping[action]);
      }
    }
  };

  // This can probably be render via the render props method.
  return (
    <div>
      <MacroCardContainer>
        <h5>Investigation Patterns</h5>
        {macros.map(macro => (
          <MacroCard key={macro}>
            {macro}
            <MacroCardButtons>
              <FontAwesomeIcon onClick={() => handleInfoClick(macro)} size="lg" icon={faInfoCircle} />
              <FontAwesomeIcon onClick={() => handleMacroClick(macro)} size="lg" icon={faPlayCircle} />
            </MacroCardButtons>
          </MacroCard>
        ))}
        <br></br>
        <h5>Subroutines</h5>
        {subroutines.map(subroutine => (
          <MacroCard key={subroutine}>
            {subroutine}
            <MacroCardButtons>
              <FontAwesomeIcon onClick={() => handleInfoClick(subroutine)} size="lg" icon={faInfoCircle} />
              <FontAwesomeIcon onClick={() => handleMacroClick(subroutine)} size="lg" icon={faPlayCircle} />
            </MacroCardButtons>   
          </MacroCard>
        ))}
      </MacroCardContainer>
    </div>
  );
};

Macros.propTypes = {
  setLoading: PropTypes.func.isRequired,
  setNeo4jData: PropTypes.func.isRequired,
  dispatchModal: PropTypes.func.isRequired,
  setMacroDetails: PropTypes.func.isRequired
};