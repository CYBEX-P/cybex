import React, { useReducer, useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlayCircle, faInfoCircle, faTimesCircle, faInfo } from '@fortawesome/free-solid-svg-icons';
import Canvas from '../../testdata/canvas.json';

import { Container, Row, Input} from 'reactstrap';
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
import { Macros, MacroCardContainer, MacroCardSubContainer, MacroCardText, MacroDetailsCard} from '../MacroCard';

import { Formik} from 'formik';
import * as Yup from 'yup';

const App = props => {
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');
	const [timezone, setTimezone] = useState('');
	

	const [ipData, setIPData] = useState([]);
	
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

  const [userProfile, setUserProfile] = useState(null);
  
  // Timezone state for use with data entry form
  const [selectedTimezone, setSelectedTimezone] = useState({})
  const [uploadedFile, setUploadedFile] = useState(null)

  // Get data on first render
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      setNeo4jData(Canvas);
    } else {
      axios.get('/api/v1/neo4j/export').then(({ data }) => {
        setNeo4jData(data);
      });

      // retrieve current user's information on render:
      let user_info = {};
      //const params_info = {'info_to_return': 'basic_info'};
      axios.get('/api/v1/user_management/currentUserInfo/basic_info').then(({ data }) => {
        user_info.email_addr = data.result.data.email_addr;
        user_info.name = data.result.data.name;
        user_info.hash = data.result._hash;
        axios.get('/api/v1/user_management/currentUserInfo/user_of').then(({ data }) => {
          // retrieve the orgs the current user belongs to:
          let org_string = "No orgs found for this user."
          if (Array.isArray(data.result) && data.result.length) {
            // make sure data.result exists, is an array, and is nonempty
            org_string = ''
            data.result.forEach(org => org_string += org.data.orgname + ', ')
          }
          user_info.orgs = org_string;
          setUserProfile(user_info);
        });
      });
    }

  }, []);

	// Getting IP data from neo4jData
	useEffect(() => {
		if (Object.keys(neo4jData).length > 0) {
			// Getting the nodes from neo4jData
			const IPNodes = (neo4jData["Neo4j"]["0"]["0"]["nodes"])
			// Getting only the nodes with the property type of "IP"
			const IPObj = (IPNodes.filter(x => x.properties.type === "IP"))
			// Storing all IPs in a list
			const allIPs = []

			// Iterating through each node to grab the IP from "data"
			for (var key in IPObj) {
				var obj = IPObj[key];
				for (var prop in obj) {
					if (prop === "properties") {
						allIPs.push(obj[prop]["data"]);
					}
				}
			}
			setIPData(allIPs);
		}
	}, [neo4jData])


  return (
    <MenuContext.Provider value={{ isExpanded, dispatchExpand, setLoading }}>
      <ModalContext.Provider value={{ isShowingModal, dispatchModal, setError }}>
        <DataContext.Provider value={{ config: props.config, neo4jData, setNeo4jData }}>
          {/* Keep modals here */}
          {/* <GraphModal title="example" contentLabel="Example Modal">
            <div>Content will go here soon!</div>
          </GraphModal> */}
          <GraphModal title="Neo4j Data" contentLabel="Neo4j Data">
            <div>{JSON.stringify(neo4jData)}</div>
          </GraphModal>
          {/* Deprecated Modal */}
          {/* <GraphModal title="Database Management" contentLabel="Database Management">
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
          </GraphModal> */}
          <GraphModal title="Submit Event Data" contentLabel="Submit Event Data" afterCloseFn={() => setUploadedFile(null)}>
            <Formik
              initialValues={{ file: null, timezone: '', orgid: '' }}
              validationSchema={Yup.object({
                file: Yup.mixed()
                  // .max(15, 'Must be 15 characters or less')
                  .required('Required'),
                timezone: Yup.string()
                  // .max(20, 'Must be 20 characters or less')
                  .required('Required'),
                orgid: Yup.string()
                .required('Required'),
              })}
              onSubmit={(values, { setSubmitting }) => {
                setTimeout(() => {
                  let formData = new FormData();
                  formData.append('timezone', values.timezone);
                  formData.append('file', values.file);
                  formData.append('orgid', values.orgid);
                  axios.post('/api/v1/dataEntry', formData, {
                    headers: {
                      'Content-Type': 'multipart/form-data'
                    }
                  }).then(() => {
                    dispatchModal('none');
                  }).catch((error ) => {
                    alert('Error submitting data:\n' + 
                      JSON.stringify(values, null, 2) + "\n" + "Status Code " 
                      +error.response.status + "\n" + 
                      JSON.stringify(error.response.data));
                  });
                  setSubmitting(false);
                }, 400);
              }}
            >
              {formik => (
                <form style={{height:"100%"}} onSubmit={formik.handleSubmit}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      //alignItems: "center",
                      height: "calc(80vh - 120px)",
                      width: "calc(70vw - 45px)"
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
                        marginTop: "20px",
                      }}
                    >
                      <div>
                        <div>Upload JSON:</div>
                        <Input id="file" name="file" type="file" onChange={(event) => {
                          //alert(JSON.stringify(event));
                          // Read file so that it can be immediately displayed to user
                          let file = event.currentTarget.files[0];
                          let reader = new FileReader();
                          reader.readAsText(file);
                          reader.onload = function() {
                            setUploadedFile(reader.result);
                          };
                          reader.onerror = function() {
                            console.log(reader.error);
                            alert(reader.error);
                          };
                          formik.setFieldValue("file", event.currentTarget.files[0]);
                        }}/>
                        {formik.touched.file && formik.errors.file ? (
                          <div style={{color:"red"}}>{formik.errors.file}</div>
                        ) : null}
                      </div>
                      <div style={{display:"flex", justifyContent:"space-between"}}>
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
                              // id="timezone"
                              name="timezone"
                              onChange={ e => {
                                setSelectedTimezone();
                                formik.setFieldValue("timezone", e.value);
                                //formik.handleChange();
                              }}
                              onBlur={formik.handleBlur}
                              value={formik.values.timezone}
                              //value={selectedTimezone}
                              // onChange={setSelectedTimezone}
                              //{...formik.getFieldProps('timezone')}
                            />
                            {formik.touched.timezone && formik.errors.timezone ? (
                              <div style={{color:"red"}}>{formik.errors.timezone}</div>
                            ) : null}
                          </div>
                        </div>
                        {/* <div
                          style={{ width: '150px' }}
                        >
                          <div>Type:</div>
                          <Select options={
                            { value: 'placeholder', label: 'placeholder' }
                          }></Select>
                        </div> */}
                      </div>                
                    </div>
                    <div
                      style={{
                        height: "60%",
                        //width: "90%",
                        borderRadius: "10px",
                        padding: "10px",
                        backgroundColor: "rgba(33,33,33,1)",
                        marginTop: "20px",
                        overflow: "auto",
                        //width: "calc(70vw - 20px)"
                      }}
                    >
                      {/* <p>{uploadedFile}</p> */}
                      {uploadedFile && (
                        <div>{uploadedFile}</div>
                      )}
                      {!uploadedFile && (
                        <div>     
                          <h4>Instructions:</h4>
                          <p><i>Select a file to see a preview here.</i></p>
                          <p>Supported formats currently include:</p>
                          <ul>
                            <li>Cowrie Log Files</li>
                          </ul>
                          <p>Specify the timezone from which the data was captured. Next, verify that the correct organization is selected (i.e. is the one you wish to submit from). Finally, click submit. The submitted data will be validated against the supported formats listed above. If the file passes validation, it will be processed and contributed to CYBEX-P.</p>
                        </div>
                      )}
                                           
                    </div>
                    <div 
                      style={{
                        borderRadius: "10px",
                        padding: "10px",
                        backgroundColor: "rgba(33,33,33,1)",
                        marginTop: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        alignItems: "center"
                      }}
                    >
                      <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                        <div>Organization:</div>
                        <div style={{ color: 'black', width: '150px', marginLeft: '10px'}}>
                          <Select 
                            // defaultValue={{ label: 'test_org', value: 'test_org' }}
                            menuPlacement="top" 
                            options = {[
                              { value: 'test_org', label: 'test_org' },
                              { value: 'test_org2', label: 'test_org2' }
                            ]}
                            onChange={ e => {
                              formik.setFieldValue("orgid", e.value);
                            }}
                          />
                          {formik.touched.orgid && formik.errors.orgid ? (
                              <div style={{color:"red"}}>{formik.errors.orgid}</div>
                            ) : null}
                        </div>
                      </div>
                      <Button width="90px" type="submit">
                          Submit
                      </Button>
                      {/* <div style={{display:"flex", justifyContent:"space-between", alignItems: "flex-end", width:"280px"}}>
                        <div>
                          <div>Name:</div>
                          <input></input>
                        </div>
                        <Button width="90px" type="submit">
                          Submit
                        </Button>
                      </div> */}
                    </div>
                  </div>
                </form>   
               )}   
            </Formik>      
          </GraphModal>
          {/* Modal to display user profile */}
            <GraphModal afterCloseFn={() => setError(null)} title="User Profile" contentLabel="User Profile">
              <div style={{ textAlign: 'center' }}>
                <FontAwesomeIcon icon="user" size="10x" />
                <br />
                {userProfile != null && (
                  <div>
                    <div style={{ marginTop:'5px' }}><b>{userProfile.name}</b></div>
                    <div style={{display: "flex", justifyContent: "center"}}>
                      <div style={{textAlign: 'left', marginTop:'30px' }}>
                        <div>Email:&nbsp;{userProfile.email_addr}</div>
                        <div>Unique Identifier:&nbsp;{userProfile.hash}</div>
                        <div>Organizations:&nbsp;{userProfile.orgs}</div>
                      </div>
                    </div>
                  </div>
                )}
                {userProfile == null && (
                  <div>Error retrieving user profile.</div>
                )}
                <div style={{ color: '#ff4300' }}>{errorToDisplay}</div>
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
          {/* Deprecated Modal - Now using "Submit Event Data" */}
          {/* <GraphModal title="New Event Form">
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
          </GraphModal> */}

          <AppContainer>
            <ContentContainerStyle>
              <Graph isLoading={isLoading} setFromDate={setFromDate} setToDate={setToDate} setTimezone={setTimezone} />
            </ContentContainerStyle>

            <NavBar 
              dispatchModal={dispatchModal}
							userProfile={userProfile}
              ipData={ipData}
            />
                
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
                  fromDate={fromDate}
                  toDate={toDate}
                  timezone={timezone}
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
