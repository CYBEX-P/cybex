import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { camelCase } from 'lodash';
import { MacroCardContainer, MacroButton } from './styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faPlay, faPlayCircle } from '@fortawesome/free-solid-svg-icons';

// Macros represents the container that holds all of the possible
export const Macros = ({ setLoading, setNeo4jData, dispatchModal, setMacroDetails }) => {
  // No need for state here since we are not fetching data from a data source.
  const subroutines = ['Enrich IPs', 'Deconstruct URLs', 'Resolve Domains', 'Resolve Hosts', 'Deconstruct Emails'];
  const macros = ['Phishing Investigation', 'CYBEX-P Analysis'];

  // A mapping is needed to reference the proper API calls
  // The API calls themselves are abstracted to a different file
  const macroMapping = {
    phishingInvestigation: 'macro',
    cybexPAnalysis: 'macroCybex'
  };

  const subRoutineMapping = {
    enrichIPs: 'ips',
    deconstructURLs: 'urls',
    resolveDomains: 'domains',
    resolveHosts: 'hosts',
    deconstructEmails: 'emails'
  };

  // modalMapping is a mapping from the aproppriate help text located in MainApp.jsx
  const modalMapping = {
    phishingInvestigation: 'macro1',
    cybexPAnalysis: 'macro2'
  };

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
    setMacroDetails(modalMapping[camelCase(info)]);
  };

  // TODO:
  // - abstract the for loops into their own functions
  const handleMacroClick = macroAction => {
    // Parse the action into camel case
    const action = camelCase(macroAction);

    // Check if macroAction exists within the macroMapping
    for (const [key, _] of Object.entries(macroMapping)) {
      if (action === key) {
        retrieveAPIData(action);
      }
    }

    // Check if the macroAction exists within the subroutineMapping
    for (const [key, _] of Object.entries(subRoutineMapping)) {
      if (action === key) {
        retrieveAPIData(action);
      }
    }
  };

  // This can probably be render via the render props method.
  return (
    <MacroCardContainer>
      {macros.map(macro => (
        <MacroCardContainer key={macro}>
          <h5>{macro}</h5>
          <MacroButton onClick={() => handleMacroClick(macro)}>{macro}</MacroButton>
          <FontAwesomeIcon onClick={() => handleMacroClick(macro)} size="lg" icon={faPlayCircle} />
          <FontAwesomeIcon onClick={() => handleInfoClick(macro)} size="lg" icon={faInfoCircle} />
        </MacroCardContainer>
      ))}
      <hr />
      Subroutines
      {subroutines.map(subroutine => (
        <MacroCardContainer key={subroutine}>
          <h5>{subroutine}</h5>
          <MacroButton onClick={() => handleMacroClick(subroutine)}>{subroutine}</MacroButton>
          <FontAwesomeIcon onClick={() => handleMacroClick(subroutine)} size="lg" icon={faPlayCircle} />
          <FontAwesomeIcon onClick={() => handleInfoClick(subroutine)} size="lg" icon={faInfoCircle} />
        </MacroCardContainer>
      ))}
    </MacroCardContainer>
  );
};

Macros.propTypes = {
  setLoading: PropTypes.func.isRequired,
  setNeo4jData: PropTypes.func.isRequired,
  dispatchModal: PropTypes.func.isRequired,
  setMacroDetails: PropTypes.func.isRequired
};
