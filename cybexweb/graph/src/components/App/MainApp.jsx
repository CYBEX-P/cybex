import React, { useReducer, useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlayCircle, faInfoCircle, faTimesCircle, faInfo } from '@fortawesome/free-solid-svg-icons';
import Canvas from '../../testdata/canvas.json';

import { Container, Row } from 'reactstrap';

import NavBar from '../navBar/navBar';
import MenuBar from '../menuBar/menuBar';
import { AppContainer, ContentContainerStyle } from '../__styles__/styles';
import MenuContext from './MenuContext';
import ModalContext from './ModalContext';
import DataContext from './DataContext';
import GraphModal from '../modal/graphModal';
import Graph from '../Graph/Graph';
import Button from '../Button/Button';
import InsertForm from '../forms/InsertForm/InsertForm';
import EventInsertForm from '../EventInsertForm/EventInsertForm';
import ImportJson from '../forms/InsertForm/ImportJson';
import Trends from '../modal/Trends';
import TrendsContext from './TrendsContext';
import { Macros, MacroCardContainer, MacroCardSubContainer, MacroCardText, MacroDetailsCard} from '../MacroCard';
// import { Macros, } from '../MacroCard';

const App = props => {
  const [isLoading, setLoading] = useState(false);

  const [isExpanded, dispatchExpand] = useReducer((_, action) => {
    if (action === 'left' || action === 'right' || action === 'bottom' || action === 'top') {
      return action;
    }
    return 'none';
  }, 'none');

  const [isShowingModal, dispatchModal] = useReducer((state, action) => {
    if (state === action) {
      return state;
    }
    return action;
  }, false);

  const [neo4jData, setNeo4jData] = useState({});

  const [errorToDisplay, setError] = useState(null);

  const [macroDetails, setMacroDetails] = useState('none');

  // Get data on first render
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      setNeo4jData(Canvas);
    } else {
      axios.get('/api/v1/neo4j/export').then(({ data }) => {
        setNeo4jData(data);
      });
    }
  }, []);

  return (
    <MenuContext.Provider value={{ isExpanded, dispatchExpand, setLoading }}>
      <ModalContext.Provider value={{ isShowingModal, dispatchModal, setError }}>
        <DataContext.Provider value={{ config: props.config, neo4jData, setNeo4jData }}>
          {/* Keep modals here */}
          <GraphModal title="example" contentLabel="Example Modal">
            <div>Content will go here soon!</div>
          </GraphModal>
          <GraphModal title="Neo4j Data" contentLabel="Neo4j Data">
            <div>{JSON.stringify(neo4jData)}</div>
          </GraphModal>
          <GraphModal title="Database Management" contentLabel="Database Management">
            <div>
              <Button
                width="128px"
                onClickFunction={() => {
                  axios.get('/api/v1/neo4j/wipe').then(() => {
                    axios.get('/api/v1/neo4j/export').then(({ data }) => {
                      setNeo4jData(data);
                      dispatchModal('none');
                    });
                  });
                }}
              >
                Wipe DB
              </Button>
            </div>
          </GraphModal>
          <GraphModal afterCloseFn={() => setError(null)} title="Error" contentLabel="Error">
            <div style={{ textAlign: 'center' }}>
              <FontAwesomeIcon icon="meh" size="10x" />
              <br />
              Oops! An error occured!
              <div style={{ color: '#ff4300' }}>{errorToDisplay}</div>
            </div>
          </GraphModal>

          <GraphModal title="New Event Form">
            <Container>
              <ModalContext.Consumer>
                {dispatchModal => (
                  <DataContext.Consumer>
                    {setNeo4jData => (
                      <EventInsertForm
                        config={props.config}
                        setNeo4jData={setNeo4jData}
                        dispatchModal={dispatchModal}
                      />
                    )}
                  </DataContext.Consumer>
                )}
              </ModalContext.Consumer>
            </Container>
          </GraphModal>

          <AppContainer>
            <ContentContainerStyle>
              <Graph isLoading={isLoading} />
            </ContentContainerStyle>
            <NavBar />
            {/* Below TrendsContext component should be used if we move from state to context for trends panel.
             At the moment, the trends component gets placed into the navbar, and is rendered dependent on a state within the navbar component.
            To more properly treat Trends as an independent component, context can be used in future reworking of the Trend panel logic */}
            {/* <TrendsContext.Provider value={false}>
              <Trends title = "Trends"/>
            </TrendsContext.Provider> */}
            <MenuBar side="left" icon="search">
              <MacroCardText>Macros</MacroCardText>
              <hr />
              <div style={{ padding: '5%' }}>
                {/* <MacroCardText>Investigation Patterns</MacroCardText> */}
                <Macros
                  setLoading={setLoading}
                  setNeo4jData={setNeo4jData}
                  dispatchModal={dispatchModal}
                  setMacroDetails={setMacroDetails}
                />
                { macroDetails != 'none' && (
                  <div>
                    <MacroDetailsCard>
                      <div onClick={() => setMacroDetails('none')}>
                        <FontAwesomeIcon size="2x" icon={faTimesCircle} style={{ float: 'right' }} />
                      </div>
                      <FontAwesomeIcon size="2x" icon={faInfoCircle} style={{ float: 'left', color: '#0277bd' }} />
                      <h4 style={{ textAlign: 'center' }}>{macroDetails.macro}</h4>
                      <hr />
                      {/* Dynamically renders list of details based on selected macroDetails */}
                      {Object.keys(macroDetails.details).map(action => (
                        <div key={action} style={{ display: 'inline-block', margin: '10px' }}>
                          <h6>{macroDetails.details[action].headerText}</h6>
                          <ul>
                          {macroDetails.details[action].listItems.map(listItem => (  
                            <li key={listItem}>{listItem}</li>
                          ))}
                          </ul>
                        </div>
                      ))}
                    </MacroDetailsCard>
                  </div>
                )}
              </div>
            </MenuBar>
            <MenuBar side="right" icon="edit">
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  color: 'white',
                  display: 'grid',
                  // gridTemplateRows: '150px 110px 70px auto',
                  gridTemplateRows: 'auto',
                  justifyContent: 'center',
                  gridTemplateColumns: '80%',
                  paddingTop: '20px'
                }}
              >
                <InsertForm config={props.config} />
                <Row />
                <Row />
                <Button width="100%" onClickFunction={() => dispatchModal('New Event Form')}>
                  <div>New Event</div>
                </Button>
              </div>
            </MenuBar>
            <MenuBar side="bottom" icon="list">
              <div
                style={{
                  display: 'grid',
                  flexWrap: 'wrap',
                  height: '100%',
                  width: '100%',
                  color: 'white',
                  gridTemplateRows: '70px 70px auto',
                  gridTemplateColumns: '33.33% 33.33% 33.33%',
                  justifyContent: 'center',
                  padding: '10px'
                }}
              >
                <div style={{ gridColumn: '1 / span 3', margin: '0 auto' }}>
                  <h3>Database Management</h3>
                </div>
                <div style={{ gridColumn: 1 }}>
                  <Button width="55%" type="button" onClickFunction={() => dispatchModal('Neo4j Data')}>
                    Export JSON
                  </Button>
                  {/* <Button
                    type="button"
                    onClickFunction={() => {
                      axios.get('/api/v1/neo4j/wipe').then(() => {
                        axios.get('/api/v1/neo4j/export').then(({ data }) => {
                          setNeo4jData(data);
                        });
                      });
                    }}
                    width="55%"
                  >
                    Wipe DB
                  </Button> */}
                </div>
                <div style={{ gridColumn: 2 }}>
                  <ImportJson />
                </div>
                <div style={{ gridColumn: 3 }}>
                  <div style={{ width: '55%', float: 'right' }}>
                    {
                      /* <Button
                        width="100%"
                        hasIcon
                        onClickFunction={() => {
                          dispatchModal('Database Management');
                        }}
                      >
                        <FontAwesomeIcon size="lg" icon="server" />
                        More...
                    </Button> */
                      <Button
                        type="button"
                        onClickFunction={() => {
                          axios.get('/api/v1/neo4j/wipe').then(() => {
                            axios.get('/api/v1/neo4j/export').then(({ data }) => {
                              setNeo4jData(data);
                            });
                          });
                        }}
                        width="100%"
                      >
                        Wipe DB
                      </Button>
                    }
                  </div>
                </div>
              </div>
            </MenuBar>
          </AppContainer>
        </DataContext.Provider>
      </ModalContext.Provider>
    </MenuContext.Provider>
  );
};

export default App;
