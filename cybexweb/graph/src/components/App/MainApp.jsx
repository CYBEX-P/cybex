import React, { useReducer, useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlayCircle, faInfoCircle, faTimesCircle, faInfo } from '@fortawesome/free-solid-svg-icons';
import Canvas from '../../testdata/canvas.json';

import { Container, Row } from 'reactstrap';
import Select from 'react-select'
import TimezoneSelect from 'react-timezone-select'

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

const App = props => {
  const [isLoading, setLoading] = useState(false);
  // Timezone state for use with data entry form
  const [selectedTimezone, setSelectedTimezone] = useState({})

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
          <GraphModal title="Submit Event Data" contentLabel="Example Modal">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                //alignItems: "center",
                height: "100%"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  backgroundColor: "rgba(33,33,33,1)",
                  borderRadius: "10px",
                  padding: "10px",
                  marginTop: "20px"
                }}
              >
                <div>
                  <div>Organization ID:</div>
                  <div>[placeholder]</div>
                </div>
                <div>
                  <div>Upload JSON:</div>
                  <input type="file" /> 
                </div>
                <div>
                  <div>Timezone of data:</div>
                  <div 
                    className='select-wrapper'
                    style={{
                      color: 'black',
                      width: '250px'
                    }}
                  >
                    <TimezoneSelect
                      value={selectedTimezone}
                      onChange={setSelectedTimezone}
                    />
                  </div>
                </div>
                <div
                  style={{ width: '150px' }}
                >
                  <div>Type:</div>
                  <Select options={
                    { value: 'placeholder', label: 'placeholder' }
                  }></Select>
                </div>
              </div>
              <div
                style={{
                  height: "50%",
                  borderRadius: "10px",
                  padding: "10px",
                  backgroundColor: "rgba(33,33,33,1)",
                  marginTop: "20px"
                }}
              >
                Select a file to see a preview here...
              </div>
              <div 
                style={{
                  borderRadius: "10px",
                  padding: "10px",
                  backgroundColor: "rgba(33,33,33,1)",
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  width: "350px"
                }}
              >
                <div>
                  <div>Name:</div>
                  <input></input>
                </div>
                <Button width="90px" type="button">
                  Submit
                </Button>
              </div>
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
              <h3 style={{paddingLeft: "0%", paddingRight: "25%", marginLeft: "30%", marginTop: "5%",color:"white"}}>Macros</h3>
              {/* <hr style={{marginLeft: "0%"}}/> */}
              <div style={{padding: "5%"}}>
              <hr></hr> 
              {/* <h4>Automations</h4>
              <div style={{marginLeft: "0%", marginTop: "5%", backgroundColor: "#0277bd",color: "white", borderRadius:'5px',padding:'5px',paddingLeft: '5%',boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"}}>
                Threat Search
                <div 
                  style={{display:"inline"}}
                  onClick={() => {
                    setLoading(true);
                    axios.get('/api/v1/macroEmail')
                    .then(() => {
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
                      })
                      //setLoading(false);
                    }}
                >
                  <FontAwesomeIcon 
                    size="lg" 
                    icon={faPlayCircle} 
                    color="" 
                    style={{marginLeft:"3%",float:'right'}}/>
                </div>
                <div style={{display:"inline"}} onClick={() => setMacroDetails('macro2')}>
                  <FontAwesomeIcon size="lg" icon={faInfoCircle} color={macroDetails == "macro2" && "#0277bd"} style={{marginLeft:"3%",float:'right'}}/>
                </div>
              </div>
              <hr></hr>  */}
              <h4>Investigation Patterns</h4>
                <div style={{marginLeft: "0%", marginTop: "5%", backgroundColor: "white",color: "black",borderRadius:'5px',padding:'5px',paddingLeft:'5%',boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"}}>
                  Phishing Investigation
                  <div style={{ display: 'inline' }}>
                    <div
                      style={{ display: 'inline' }}
                      onClick={() => {
                        setLoading(true);
                        axios.get('/api/v1/macro/all').then(() => {
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
                        //setLoading(false);
                      }}
                    >
                      <FontAwesomeIcon
                        size="lg"
                        icon={faPlayCircle}
                        color=""
                        style={{ marginLeft: '3%', float: 'right' }}
                      />
                    </div>
                    <div style={{ display: 'inline' }} onClick={() => setMacroDetails('macro1')}>
                      <FontAwesomeIcon
                        size="lg"
                        icon={faInfoCircle}
                        color={macroDetails == 'macro1' && '#0277bd'}
                        style={{ marginLeft: '3%', float: 'right' }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{marginLeft: "0%", marginTop: "5%", backgroundColor: "white",color: "black",borderRadius:'5px',padding:'5px',paddingLeft: '5%',boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"}}>
                  CYBEX-P Analysis
                  <div
                    style={{ display: 'inline' }}
                    onClick={() => {
                      setLoading(true);
                      // var timer = setInterval( function(){
                      //   axios
                      //     .get('/api/v1/neo4j/export')
                      //     .then(({ data }) => {
                      //       setNeo4jData(data);
                      //     });
                      // }, 3000);
                      axios.get('/api/v1/macroCybex').then(() => {
                        axios
                          .get('/api/v1/neo4j/export')
                          .then(({ data }) => {
                            setNeo4jData(data);
                            setLoading(false);
                            // clearInterval(timer);
                          })
                          .catch(() => {
                            dispatchModal('Error');
                            setLoading(false);
                            // clearInterval(timer);
                          });
                      });
                      //setLoading(false);
                    }}
                  >
                    <FontAwesomeIcon
                      size="lg"
                      icon={faPlayCircle}
                      color=""
                      style={{ marginLeft: '3%', float: 'right' }}
                    />
                  </div>
                  <div style={{ display: 'inline' }} onClick={() => setMacroDetails('macro2')}>
                    <FontAwesomeIcon
                      size="lg"
                      icon={faInfoCircle}
                      color={macroDetails == 'macro2' && '#0277bd'}
                      style={{ marginLeft: '3%', float: 'right' }}
                    />
                  </div>
                </div>
                <hr></hr> 
                <h4>Subroutines</h4>
                <div style={{marginLeft: "0%", marginTop: "5%", backgroundColor: "white",color: "black",borderRadius:'5px',padding:'5px',paddingLeft: '5%',boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"}}>
                  Enrich IPs
                  <div 
                    style={{display:"inline"}}
                    onClick={() => {
                      setLoading(true);
                      axios.get('api/v1/macro/ip')
                      .then(() => {
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
                        })
                        //setLoading(false);
                      }}
                  >
                    <FontAwesomeIcon 
                      size="lg" 
                      icon={faPlayCircle} 
                      color="" 
                      style={{marginLeft:"3%",float:'right'}}/>
                  </div>
                  {/* <div style={{display:"inline"}} onClick={() => setMacroDetails('macro2')}>
                    <FontAwesomeIcon size="lg" icon={faInfoCircle} color={macroDetails == "macro2" && "#0277bd"} style={{marginLeft:"3%",float:'right'}}/>
                  </div> */}
                </div>
                <div style={{marginLeft: "0%", marginTop: "5%", backgroundColor: "white",color: "black",borderRadius:'5px',padding:'5px',paddingLeft: '5%',boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"}}>
                  Deconstruct URLs
                  <div 
                    style={{display:"inline"}}
                    onClick={() => {
                      setLoading(true);
                      axios.get('api/v1/macro/url')
                      .then(() => {
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
                        })
                        //setLoading(false);
                      }}
                  >
                    <FontAwesomeIcon 
                      size="lg" 
                      icon={faPlayCircle} 
                      color="" 
                      style={{marginLeft:"3%",float:'right'}}/>
                  </div>
                  {/* <div style={{display:"inline"}} onClick={() => setMacroDetails('macro2')}>
                    <FontAwesomeIcon size="lg" icon={faInfoCircle} color={macroDetails == "macro2" && "#0277bd"} style={{marginLeft:"3%",float:'right'}}/>
                  </div> */}
                </div>
                <div style={{marginLeft: "0%", marginTop: "5%", backgroundColor: "white",color: "black",borderRadius:'5px',padding:'5px',paddingLeft: '5%',boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"}}>
                  Resolve Domains
                  <div 
                    style={{display:"inline"}}
                    onClick={() => {
                      setLoading(true);
                      axios.get('api/v1/macro/domain')
                      .then(() => {
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
                        })
                        //setLoading(false);
                      }}
                  >
                    <FontAwesomeIcon 
                      size="lg" 
                      icon={faPlayCircle} 
                      color="" 
                      style={{marginLeft:"3%",float:'right'}}/>
                  </div>
                  {/* <div style={{display:"inline"}} onClick={() => setMacroDetails('macro2')}>
                    <FontAwesomeIcon size="lg" icon={faInfoCircle} color={macroDetails == "macro2" && "#0277bd"} style={{marginLeft:"3%",float:'right'}}/>
                  </div> */}
                </div>
                <div style={{marginLeft: "0%", marginTop: "5%", backgroundColor: "white",color: "black",borderRadius:'5px',padding:'5px',paddingLeft: '5%',boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"}}>
                  Resolve Hosts
                  <div 
                    style={{display:"inline"}}
                    onClick={() => {
                      setLoading(true);
                      axios.get('api/v1/macro/host')
                      .then(() => {
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
                        })
                        //setLoading(false);
                      }}
                  >
                    <FontAwesomeIcon 
                      size="lg" 
                      icon={faPlayCircle} 
                      color="" 
                      style={{marginLeft:"3%",float:'right'}}/>
                  </div>
                  {/* <div style={{display:"inline"}} onClick={() => setMacroDetails('macro2')}>
                    <FontAwesomeIcon size="lg" icon={faInfoCircle} color={macroDetails == "macro2" && "#0277bd"} style={{marginLeft:"3%",float:'right'}}/>
                  </div> */}
                </div>
                <div style={{marginLeft: "0%", marginTop: "5%", backgroundColor: "white",color: "black",borderRadius:'5px',padding:'5px',paddingLeft: '5%',boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"}}>
                  Deconstruct Emails
                  <div 
                    style={{display:"inline"}}
                    onClick={() => {
                      setLoading(true);
                      axios.get('api/v1/macro/email')
                      .then(() => {
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
                        })
                        //setLoading(false);
                      }}
                  >
                    <FontAwesomeIcon 
                      size="lg" 
                      icon={faPlayCircle} 
                      color="" 
                      style={{marginLeft:"3%",float:'right'}}/>
                  </div>
                  {/* <div style={{display:"inline"}} onClick={() => setMacroDetails('macro2')}>
                    <FontAwesomeIcon size="lg" icon={faInfoCircle} color={macroDetails == "macro2" && "#0277bd"} style={{marginLeft:"3%",float:'right'}}/>
                  </div> */}
                </div>
                {/* <div style={{backgroundColor:'white',padding: "5%", marginLeft: "20%", marginTop: "45%",marginBottom: "5%",borderRadius:'5px',boxShadow: "0px -2px 5px 0px rgba(31,30,31,1)"}}>
                  <h5 style={{textAlign:'center'}}>Macro 1 Details</h5>
                  <hr></hr>
                  <div style={{height:'20vh',overflow:'auto'}}>
                    <h6>URL</h6>
                    <ul>
                      <li>Deconstruct URL</li>
                    </ul>
                  </div>
                </div> */}
                {macroDetails == 'macro1' && (
                  <div
                    style={{
                      position: 'fixed',
                      height: '90%',
                      width: '300px',
                      top: '10%',
                      left: '340px',
                      padding: '10px',
                      backgroundColor: 'rgba(0,0,0,0.95)',
                      backdropFilter: 'blur(30px)',
                      color: 'white',
                      borderRadius: '15px',
                      border: 'solid',
                      borderColor: '#0277bd',
                      overflow: 'auto'
                    }}
                    // style={{
                    //   position: "fixed",
                    //   minHeight:"25%",
                    //   width: '40%',
                    //   top:'56px',
                    //   left: "334px",
                    //   padding: '10px',
                    //   backgroundColor:"black",
                    //   color:"white",
                    //   opacity:'0.95',
                    //   borderRadius:'15px',
                    //   border:'solid',
                    //   borderColor:'#0277bd'
                    // }}
                  >
                    <div onClick={() => setMacroDetails('none')}>
                      <FontAwesomeIcon size="2x" icon={faTimesCircle} style={{ float: 'right' }} />
                    </div>
                    <FontAwesomeIcon size="2x" icon={faInfoCircle} style={{ float: 'left', color: '#0277bd' }} />
                    <h4 style={{ textAlign: 'center' }}>Phishing Macro Details</h4>
                    <hr />
                    <div style={{ display: 'inline-block', margin: '10px' }}>
                      <h6>URL</h6>
                      <ul>
                        <li>Deconstruct URL</li>
                      </ul>
                    </div>
                    <div style={{ display: 'inline-block', margin: '10px' }}>
                      <h6>Email</h6>
                      <ul>
                        <li>Deconstruct Email</li>
                      </ul>
                    </div>
                    <div style={{ display: 'inline-block', margin: '10px' }}>
                      <h6>Host</h6>
                      <ul>
                        <li>Resolve IP</li>
                        <li>Resolve MX</li>
                        <li>Resolve Nameservers</li>
                      </ul>
                    </div>
                    <div style={{ display: 'inline-block', margin: '10px' }}>
                      <h6>Domain</h6>
                      <ul>
                        <li>Resolve IP</li>
                        <li>Resolve MX</li>
                        <li>Resolve Nameservers</li>
                      </ul>
                    </div>
                    <div style={{ display: 'inline-block', margin: '10px' }}>
                      <h6>IP</h6>
                      <ul>
                        <li>Enrich ASN</li>
                        <li>Enrich GIP</li>
                        <li>Enrich WHOIS</li>
                        <li>Enrich Hostname</li>
                        <li>Return Ports</li>
                        <li>Return Netblock</li>
                      </ul>
                    </div>
                  </div>
                )}
                {macroDetails == 'macro2' && (
                  <div
                    style={{
                      position: 'fixed',
                      minHeight: '25%',
                      width: '300px',
                      top: '10%',
                      left: '340px',
                      padding: '10px',
                      backgroundColor: 'rgba(0,0,0,0.95)',
                      color: 'white',
                      borderRadius: '15px',
                      border: 'solid',
                      borderColor: '#0277bd',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div onClick={() => setMacroDetails('none')}>
                      <FontAwesomeIcon size="2x" icon={faTimesCircle} style={{ float: 'right' }} />
                    </div>
                    <FontAwesomeIcon size="2x" icon={faInfoCircle} style={{ float: 'left', color: '#0277bd' }} />
                    <h4 style={{ textAlign: 'center' }}>CYBEX-P Macro Details</h4>
                    <hr />
                    <h6>Performs threat analysis on all supported IOC nodes.</h6>
                    <ul>
                      <li>Adds related IOCs exposed by CYBEX event data</li>
                      <li>Determines IOC threat level</li>
                      <li>Scales IOC nodes according to relative number of sightings</li>
                    </ul>
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
                <Button width="100%" onClickFunction={() => dispatchModal('Submit Event Data')}>
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
                <div style={{ gridColumn: 3}}>
                  <div style={{width: "55%",float: "right"}}>
                    {/* <Button
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
                    </Button>}
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
