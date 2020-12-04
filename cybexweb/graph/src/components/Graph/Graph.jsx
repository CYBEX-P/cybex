import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Network } from 'vis';
import PropTypes from 'prop-types';
import { CircleLoader } from 'react-spinners';

import NetworkContext from '../App/DataContext';
import MenuContext from '../App/MenuContext';
import RadialMenu from '../radialMenu/radialMenu';
import withNodeType from '../radialMenu/withNodeType';
import Trends from '../modal/Trends';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faArrowRight,faTimesCircle, faFilter, faMapPin, faCircleNotch, faDotCircle, faCommentDollar, faCommentDots, faArrowCircleUp } from '@fortawesome/free-solid-svg-icons';

function InitializeGraph(data) {
  if (typeof data.Neo4j === 'undefined') {
    return null;
  }
  const { nodes } = data.Neo4j[0][0];
  const { edges } = data.Neo4j[1][0];
  const dataObject = { nodes, edges };

  const options = {
    layout: { improvedLayout: true },
    height: '99vh',
    nodes: {
      shape: 'circularImage',
      image: '/static/SVG/DataAnalytics/svg_other.svg',
      borderWidth: 4,
      color: 'rgba(151,194,252,1)',
      widthConstraint: 100,
      font:{color:'white',strokeWidth:3,strokeColor:"black"}
    },
    edges: {
      length: 200,
      arrows: {
        to: {enabled: true, scaleFactor: 0.5}
      }
      //color: {'inherit':false},
      //dashes: true
    },
    interaction: {
      hover: true,
      hoverConnectedEdges: false
    }
  };
  const container = document.getElementById('mynetwork');
  const nw = new Network(container, dataObject, options);
  return nw;
}

// Helper function to truncate strings (used for tooltips)
const truncate = (input,numChar) => input.length > numChar ? `${input.substring(0, numChar)}...` : input;

const Graph = ({ isLoading }) => {
  const { setLoading } = useContext(MenuContext);
  const { neo4jData, setNeo4jData, config } = useContext(NetworkContext);

  const [isStabilized, setIsStabilized] = useState(true);
  const [dragStart, setDragStart] = useState(false);

  const [hoverText, setHoverText] = useState(null);
  const [hoverTextEdge, setHoverTextEdge] = useState(null);
  // selectText is like hoverText, but is to be persistently shown when node is selected
  const [selectText, setSelectText] = useState(null);
  // pinnedText is like selectText, but stays stored and displayed if user pins an IOC
  const [pinnedText, setPinnedText] = useState(null);
  const [pinnedPos, setPinnedPos] = useState(320)

  const [selection, setSelection] = useState({ nodes: [], edges: [] });
  const [selectedNodeType, setSelectedNodeType] = useState(null);
  const [pinnedNodeType, setPinnedNodeType] = useState(null);
  const [radialPosition, setRadialPosition] = useState(null);
  const [eventListenersAdded, setEventListenersAdded] = useState(false);

  const [network, setNetwork] = useState(null);

  const [filterState,setFilterState] = useState(false);

  const [commentState,setCommentState] = useState(false);
  const [commentTextState, setCommentTextState] = useState('');
  const [pinnedCommentState,setPinnedCommentState] = useState(false);
  const [pinnedCommentTextState, setPinnedCommentTextState] = useState('');

  var zoomTimer;

  function UpdatePositions() {
    if (network === null || selection === null) {
      return setRadialPosition(null);
    }
    if (typeof selection.nodes[0] === 'undefined') {
      return setRadialPosition(null);
    }
    // Returns the id of the current node selected, not the index
    const selectedNode = selection.nodes[0];
    const canvasPositions = network.getPositions(selection.nodes)[selectedNode];
    const domPositions = network.canvasToDOM(canvasPositions);
    setSelectedNodeType(neo4jData.Neo4j[0][0].nodes.filter(properties => properties.id === selection.nodes[0])[0]);
    return setRadialPosition(domPositions);
  }

  // Used for converting to a json object
  function objectToArray(obj) {
    return Object.keys(obj).map(function (key) {
      obj[key].id = key;
      return obj[key];
    });
  }

  function AddEventListenersToNetwork(nw, data) {
    if (typeof data.Neo4j === 'undefined') {
      return false;
    }
    if (nw === null) {
      return false;
    }
    
    // Used for updating the positions of the current nodes
    var nodes = objectToArray(network.getPositions());
    axios.post('/api/v1/position', nodes, {});

    // hoverNode fires whenever the mouse hovers over a node
    nw.on('hoverNode', e => {
      if (typeof data.Neo4j !== 'undefined') {
        // nodeObj is the Neo4j object that representes the currently hovered node.
        var nodeObj = data.Neo4j[0][0].nodes.filter(properties => properties.id === e.node);
        var count = JSON.stringify(nodeObj[0].properties.count);  
        var countMal = JSON.stringify(nodeObj[0].properties.countMal)
        var percent;
        // Use non-malicious vs. malicious cybex counts to determine 'percent malicious'
        if (count == 0 && countMal == 0) // Not enough data to determine
        {
          percent = "Threat Inconclusive"
        }
        else 
        {
          // percent is malicious count divided by the sum of malicious count and benign count
          percent = (Number(countMal)/(Number(countMal)+Number(count))*100).toFixed(2);
          if (isNaN(percent))
          {
            percent = "Enrich to analyze threat"
          }
          else
          {
            percent += "% Malicious";
          }
        }
        return setHoverText({
          // Set the hover text to the properties of the data
          text: JSON.stringify(nodeObj[0].properties),
          x: e.event.clientX,
          y: e.event.clientY,
          data: JSON.stringify(nodeObj[0].properties.data),
          label: JSON.stringify(nodeObj[0].label),
          color: JSON.stringify(nodeObj[0].color),
          type: JSON.stringify(nodeObj[0].properties.type),
          percentMal: percent,
        });
      }
      return setHoverText(null);
    });
    // blurNode fires when leaving a node
    nw.on('blurNode', () => setHoverText(null));

    // blurEdge fires when leaving an edge
    nw.on('blurEdge', () => setHoverTextEdge(null));

    // Change the selection state whenever a node is selected and deselected
    nw.on('deselectNode', (params) => 
    {
      setCommentState(false)
      setCommentTextState('');
      var opacityNormal = 1;
      setSelection(nw.getSelection())
      Object.keys(nw.body.nodes).forEach(function(currentId){
        if (!currentId.includes("edgeId"))
        {
          // Need to store both original node color
          var orgColorStr = nw.body.nodes[currentId].options.color.background;
          // split color string into array with indices corresponding to r,g,b, and a
          var orgColorArr = orgColorStr.split('(')[1].split(')')[0].split(',');
          var opaqueColorStr = 'rgb('+orgColorArr[0]+',' + orgColorArr[1] + ',' + orgColorArr[2]+','+opacityNormal+')'
          nw.body.nodes[currentId].options.color.background = nw.body.nodes[currentId].options.color.border = opaqueColorStr;
        }
      });
      setSelectText(false);
      setPinnedPos(10);
    });
    nw.on('selectNode', (params) => {
      setSelection(nw.getSelection());
      setHoverText(null); // No need for hovertext after selection, redundant
      var opacityBlurred = 0.1;
      var nodeId = params.nodes[0];
      // nodeObj is the Neo4j object that representes the currently selected node. Note: Slightly different here than with on('hoverNode')
      var nodeObj = data.Neo4j[0][0].nodes.filter(properties => properties.id === nodeId);
      Object.keys(nw.body.nodes).forEach(function(currentId){
        if (!currentId.includes("edgeId"))
        {
          if (currentId != nodeId)
          {
            // Need to store original node color
            var orgColorStr = nw.body.nodes[currentId].options.color.background;
            // split color string into array with indices corresponding to r,g,b, and a
            var orgColorArr = orgColorStr.split('(')[1].split(')')[0].split(',');
            var transColorStr = 'rgb('+orgColorArr[0]+',' + orgColorArr[1] + ',' + orgColorArr[2]+','+opacityBlurred+')';
            nw.body.nodes[currentId].options.color.background = nw.body.nodes[currentId].options.color.border = transColorStr
          }
        }
      });
      setSelectText({
        // Set the select text to the properties of the data
        text: JSON.stringify(nodeObj[0].properties),
        data: JSON.stringify(nodeObj[0].properties.data),
        label: JSON.stringify(nodeObj[0].label),
        color: JSON.stringify(nodeObj[0].color),
        count: JSON.stringify(nodeObj[0].properties.count),
        countMalicious: JSON.stringify(nodeObj[0].properties.countMal),
        type: JSON.stringify(nodeObj[0].properties.type),
      });
      setPinnedPos(320);
    });

    // Set state when drag starts and ends. Used to determine whether to draw radial menu or not
    nw.on('dragStart', () => {
      setDragStart(true);
    });
    nw.on('dragEnd', () => {
      setDragStart(false);
      
      // Used for updating the positions of the current nodes
      var nodes_pos = objectToArray(network.getPositions());
      axios.post('/api/v1/position', nodes_pos, {});
    });

    // Similar to dragStart and dragEnd, but changes the selection state during stabilization
    nw.on('startStabilizing', () => {
      setSelection({ nodes: [], edges: [] });
      setIsStabilized(false);
    });
    nw.on('stabilized', () => {
      setSelection(nw.getSelection());
      setIsStabilized(true);
    });

    // Wait half a second to re-display radial menu after graph zoom. Less jarring for user.
    nw.on('zoom', () => {
      clearTimeout(zoomTimer);
      setRadialPosition(null);
      zoomTimer = setTimeout(function(){ setSelection(nw.getSelection()); }, 500);
      
      // DEPRECATED - Remove in future release:
      // We just get rid of the selection and radial menu on zoom since there isn't a good way to tell
      // when zoom ends and begins
      // if (selection !== null) {
      //   nw.unselectAll();
      //   setSelection(null);
      // }
    });

    nw.on('hoverEdge', e => 
    {
      if (typeof data.Neo4j !== 'undefined') {
        var edgeObj = data.Neo4j[1][0].edges.filter(properties => properties.id === e.edge);
        setHoverTextEdge({
          // Set the select text to the properties of the data
          data: JSON.stringify(edgeObj[0].type),
          x: e.event.clientX,
          y: e.event.clientY,
          //label: JSON.stringify(nodeObj[0].label),
        });
      }
    });
  }

  // handles all comments submitted from IOC card comment boxes
  function handleComment(node)
  {
    // node object and comment text states differ depending on which
    // IOC card is being handled ('selected or pinned')
    var nodeObj;
    var currentCommentText;
    if (node == "selected") {
      nodeObj = selectedNodeType;
      currentCommentText = commentTextState;
    }
    else {
      nodeObj = pinnedNodeType;
      currentCommentText = pinnedCommentTextState;
    }
    if (currentCommentText != '')
    {
      resetCards();
      setLoading(true);
      axios
        .post(`/api/v1/enrich/comment`, {Ntype: `${nodeObj.properties.type}`, value: `${nodeObj.properties.data}`, comment: `${currentCommentText}`})
        .then(({ data }) => {
          if (data['insert status'] !== 0) {
            axios
              .get('/api/v1/neo4j/export')
              .then(response => {
                setNeo4jData(response.data);
                //setCommentTextState(''); // replaced by resetCards();
                setLoading(false);
              })
              .catch(() => {
                alert('Error');
                setLoading(false);
              });
          }
        }); 
    }
  }

  // remove Pinned IOC card
  function removePin()
  {
    setPinnedText(null);
    setPinnedCommentState(false);
    setPinnedCommentTextState('');
    setPinnedPos(10);
  }

  // resets all IOC cards to empty null state (removes them)
  function resetCards()
  {
    setSelectText(null);
    setCommentState(false);
    setCommentTextState('');

    removePin();
  }

  // handles IOC card pinning logic and associated state changes
  function pinHandler()
  {
    setPinnedText(selectText);
    setPinnedNodeType(selectedNodeType); // Store pinned node obj state

    // Because selected and pinned IOC are initially the same, only show IOC in the
    // 'pinned' slot. Otherwise is redundant. Accomplished by nulling selectText
    setSelectText(null);
    setPinnedPos(10);
  }

  useEffect(() => {
    if (!dragStart) {
      return UpdatePositions();
    }
    return setRadialPosition(null);
  }, [dragStart]);

  useEffect(() => {
    if (isStabilized) {
      return UpdatePositions();
    }
    return setRadialPosition(null);
  }, [isStabilized]);

  useEffect(() => {
    if (typeof neo4jData.Neo4j !== 'undefined') {
      setNetwork(InitializeGraph(neo4jData));
      resetCards();
      setEventListenersAdded(false);
      setRadialPosition(null);
      // console.log(neo4jData);
    }
  }, [neo4jData]);

  useEffect(() => {
    if (eventListenersAdded === false) {
      setEventListenersAdded(AddEventListenersToNetwork(network, neo4jData));
    }
  }, [network, neo4jData]);

  useEffect(() => {
    if (selection === null) {
      setSelectedNodeType(null);
      return setRadialPosition(null);
    }
    if (selection.nodes.length !== 0) {
      return UpdatePositions();
    }
    setSelectedNodeType(null);
    return setRadialPosition(null);
  }, [selection]);

  // HOC that returns the radial menu to use
  const RadialToRender = withNodeType(RadialMenu, selectedNodeType, setNeo4jData, config);

  return (
    <div style={{ display: 'grid', gridTemplateRows: '56px auto' }}>
      <div
        id="mynetwork"
        role="presentation"
        style={{
          width: '100%',
          height: '100vh',
          gridRow: '1 / span 2',
          gridColumn: 1,
          zIndex: 2,
          display: 'grid',
          backgroundColor: '#232323'
        }}
      />
      {/* TODO: Turn filter box into seperate component */}
      {!filterState && ( 
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
          paddingTop: "10px",
          paddingBottom: "10px",
          boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"
        }}
        onClick={() => setFilterState(true)}>
          <FontAwesomeIcon size="1x" icon={faFilter}/>
        </div>
      )}
      {filterState && (
      <div style={{
        position:"absolute",
        width:"300px", 
        right:"10px",
        top:"65px",
        zIndex: 4,
        // backgroundColor: '#111', // Used for classic Card styling only.
        backgroundColor: "black",
        color: "white",
        opacity: "0.95",
        borderRadius: "10px",
        padding: "20px",
        paddingBottom: "20px",
        boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"
        }}>
          <div onClick={() => setFilterState(false)}>
            <FontAwesomeIcon size="2x" icon={faTimesCircle} style={{position:'absolute',right:'10px',top:'10px'}}/>
          </div>
          <h4 style={{textAlign:"center"}}>
            <b>Filters</b>
          </h4>
          <hr/>
          <h5>Time</h5>
          <div style={{color:"white",fontSize:"large"}}>
            From: <input style={{width:'70px',backgroundColor:"#232323",border:"none",borderRadius:"5px",marginRight:"10px"}}></input>
            To: <input style={{width:'70px',backgroundColor:"#232323",border:"none",borderRadius:"5px"}}></input>
          </div><br></br>
          Time Zone:
          <select style={{color: "white",backgroundColor: "#232323",width:"200px",border:"none"}}>
            <option timeZoneId="1" gmtAdjustment="GMT-12:00" useDaylightTime="0" value="-12">(GMT-12:00) International Date Line West</option>
            <option timeZoneId="2" gmtAdjustment="GMT-11:00" useDaylightTime="0" value="-11">(GMT-11:00) Midway Island, Samoa</option>
            <option timeZoneId="3" gmtAdjustment="GMT-10:00" useDaylightTime="0" value="-10">(GMT-10:00) Hawaii</option>
            <option timeZoneId="4" gmtAdjustment="GMT-09:00" useDaylightTime="1" value="-9">(GMT-09:00) Alaska</option>
            <option timeZoneId="5" gmtAdjustment="GMT-08:00" useDaylightTime="1" value="-8">(GMT-08:00) Pacific Time (US & Canada)</option>
            <option timeZoneId="6" gmtAdjustment="GMT-08:00" useDaylightTime="1" value="-8">(GMT-08:00) Tijuana, Baja California</option>
            <option timeZoneId="7" gmtAdjustment="GMT-07:00" useDaylightTime="0" value="-7">(GMT-07:00) Arizona</option>
            <option timeZoneId="8" gmtAdjustment="GMT-07:00" useDaylightTime="1" value="-7">(GMT-07:00) Chihuahua, La Paz, Mazatlan</option>
            <option timeZoneId="9" gmtAdjustment="GMT-07:00" useDaylightTime="1" value="-7">(GMT-07:00) Mountain Time (US & Canada)</option>
            <option timeZoneId="10" gmtAdjustment="GMT-06:00" useDaylightTime="0" value="-6">(GMT-06:00) Central America</option>
            <option timeZoneId="11" gmtAdjustment="GMT-06:00" useDaylightTime="1" value="-6">(GMT-06:00) Central Time (US & Canada)</option>
            <option timeZoneId="12" gmtAdjustment="GMT-06:00" useDaylightTime="1" value="-6">(GMT-06:00) Guadalajara, Mexico City, Monterrey</option>
            <option timeZoneId="13" gmtAdjustment="GMT-06:00" useDaylightTime="0" value="-6">(GMT-06:00) Saskatchewan</option>
            <option timeZoneId="14" gmtAdjustment="GMT-05:00" useDaylightTime="0" value="-5">(GMT-05:00) Bogota, Lima, Quito, Rio Branco</option>
            <option timeZoneId="15" gmtAdjustment="GMT-05:00" useDaylightTime="1" value="-5">(GMT-05:00) Eastern Time (US & Canada)</option>
            <option timeZoneId="16" gmtAdjustment="GMT-05:00" useDaylightTime="1" value="-5">(GMT-05:00) Indiana (East)</option>
            <option timeZoneId="17" gmtAdjustment="GMT-04:00" useDaylightTime="1" value="-4">(GMT-04:00) Atlantic Time (Canada)</option>
            <option timeZoneId="18" gmtAdjustment="GMT-04:00" useDaylightTime="0" value="-4">(GMT-04:00) Caracas, La Paz</option>
            <option timeZoneId="19" gmtAdjustment="GMT-04:00" useDaylightTime="0" value="-4">(GMT-04:00) Manaus</option>
            <option timeZoneId="20" gmtAdjustment="GMT-04:00" useDaylightTime="1" value="-4">(GMT-04:00) Santiago</option>
            <option timeZoneId="21" gmtAdjustment="GMT-03:30" useDaylightTime="1" value="-3.5">(GMT-03:30) Newfoundland</option>
            <option timeZoneId="22" gmtAdjustment="GMT-03:00" useDaylightTime="1" value="-3">(GMT-03:00) Brasilia</option>
            <option timeZoneId="23" gmtAdjustment="GMT-03:00" useDaylightTime="0" value="-3">(GMT-03:00) Buenos Aires, Georgetown</option>
            <option timeZoneId="24" gmtAdjustment="GMT-03:00" useDaylightTime="1" value="-3">(GMT-03:00) Greenland</option>
            <option timeZoneId="25" gmtAdjustment="GMT-03:00" useDaylightTime="1" value="-3">(GMT-03:00) Montevideo</option>
            <option timeZoneId="26" gmtAdjustment="GMT-02:00" useDaylightTime="1" value="-2">(GMT-02:00) Mid-Atlantic</option>
            <option timeZoneId="27" gmtAdjustment="GMT-01:00" useDaylightTime="0" value="-1">(GMT-01:00) Cape Verde Is.</option>
            <option timeZoneId="28" gmtAdjustment="GMT-01:00" useDaylightTime="1" value="-1">(GMT-01:00) Azores</option>
            <option timeZoneId="29" gmtAdjustment="GMT+00:00" useDaylightTime="0" value="0">(GMT+00:00) Casablanca, Monrovia, Reykjavik</option>
            <option timeZoneId="30" gmtAdjustment="GMT+00:00" useDaylightTime="1" value="0">(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London</option>
            <option timeZoneId="31" gmtAdjustment="GMT+01:00" useDaylightTime="1" value="1">(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna</option>
            <option timeZoneId="32" gmtAdjustment="GMT+01:00" useDaylightTime="1" value="1">(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague</option>
            <option timeZoneId="33" gmtAdjustment="GMT+01:00" useDaylightTime="1" value="1">(GMT+01:00) Brussels, Copenhagen, Madrid, Paris</option>
            <option timeZoneId="34" gmtAdjustment="GMT+01:00" useDaylightTime="1" value="1">(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb</option>
            <option timeZoneId="35" gmtAdjustment="GMT+01:00" useDaylightTime="1" value="1">(GMT+01:00) West Central Africa</option>
            <option timeZoneId="36" gmtAdjustment="GMT+02:00" useDaylightTime="1" value="2">(GMT+02:00) Amman</option>
            <option timeZoneId="37" gmtAdjustment="GMT+02:00" useDaylightTime="1" value="2">(GMT+02:00) Athens, Bucharest, Istanbul</option>
            <option timeZoneId="38" gmtAdjustment="GMT+02:00" useDaylightTime="1" value="2">(GMT+02:00) Beirut</option>
            <option timeZoneId="39" gmtAdjustment="GMT+02:00" useDaylightTime="1" value="2">(GMT+02:00) Cairo</option>
            <option timeZoneId="40" gmtAdjustment="GMT+02:00" useDaylightTime="0" value="2">(GMT+02:00) Harare, Pretoria</option>
            <option timeZoneId="41" gmtAdjustment="GMT+02:00" useDaylightTime="1" value="2">(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius</option>
            <option timeZoneId="42" gmtAdjustment="GMT+02:00" useDaylightTime="1" value="2">(GMT+02:00) Jerusalem</option>
            <option timeZoneId="43" gmtAdjustment="GMT+02:00" useDaylightTime="1" value="2">(GMT+02:00) Minsk</option>
            <option timeZoneId="44" gmtAdjustment="GMT+02:00" useDaylightTime="1" value="2">(GMT+02:00) Windhoek</option>
            <option timeZoneId="45" gmtAdjustment="GMT+03:00" useDaylightTime="0" value="3">(GMT+03:00) Kuwait, Riyadh, Baghdad</option>
            <option timeZoneId="46" gmtAdjustment="GMT+03:00" useDaylightTime="1" value="3">(GMT+03:00) Moscow, St. Petersburg, Volgograd</option>
            <option timeZoneId="47" gmtAdjustment="GMT+03:00" useDaylightTime="0" value="3">(GMT+03:00) Nairobi</option>
            <option timeZoneId="48" gmtAdjustment="GMT+03:00" useDaylightTime="0" value="3">(GMT+03:00) Tbilisi</option>
            <option timeZoneId="49" gmtAdjustment="GMT+03:30" useDaylightTime="1" value="3.5">(GMT+03:30) Tehran</option>
            <option timeZoneId="50" gmtAdjustment="GMT+04:00" useDaylightTime="0" value="4">(GMT+04:00) Abu Dhabi, Muscat</option>
            <option timeZoneId="51" gmtAdjustment="GMT+04:00" useDaylightTime="1" value="4">(GMT+04:00) Baku</option>
            <option timeZoneId="52" gmtAdjustment="GMT+04:00" useDaylightTime="1" value="4">(GMT+04:00) Yerevan</option>
            <option timeZoneId="53" gmtAdjustment="GMT+04:30" useDaylightTime="0" value="4.5">(GMT+04:30) Kabul</option>
            <option timeZoneId="54" gmtAdjustment="GMT+05:00" useDaylightTime="1" value="5">(GMT+05:00) Yekaterinburg</option>
            <option timeZoneId="55" gmtAdjustment="GMT+05:00" useDaylightTime="0" value="5">(GMT+05:00) Islamabad, Karachi, Tashkent</option>
            <option timeZoneId="56" gmtAdjustment="GMT+05:30" useDaylightTime="0" value="5.5">(GMT+05:30) Sri Jayawardenapura</option>
            <option timeZoneId="57" gmtAdjustment="GMT+05:30" useDaylightTime="0" value="5.5">(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
            <option timeZoneId="58" gmtAdjustment="GMT+05:45" useDaylightTime="0" value="5.75">(GMT+05:45) Kathmandu</option>
            <option timeZoneId="59" gmtAdjustment="GMT+06:00" useDaylightTime="1" value="6">(GMT+06:00) Almaty, Novosibirsk</option>
            <option timeZoneId="60" gmtAdjustment="GMT+06:00" useDaylightTime="0" value="6">(GMT+06:00) Astana, Dhaka</option>
            <option timeZoneId="61" gmtAdjustment="GMT+06:30" useDaylightTime="0" value="6.5">(GMT+06:30) Yangon (Rangoon)</option>
            <option timeZoneId="62" gmtAdjustment="GMT+07:00" useDaylightTime="0" value="7">(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
            <option timeZoneId="63" gmtAdjustment="GMT+07:00" useDaylightTime="1" value="7">(GMT+07:00) Krasnoyarsk</option>
            <option timeZoneId="64" gmtAdjustment="GMT+08:00" useDaylightTime="0" value="8">(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi</option>
            <option timeZoneId="65" gmtAdjustment="GMT+08:00" useDaylightTime="0" value="8">(GMT+08:00) Kuala Lumpur, Singapore</option>
            <option timeZoneId="66" gmtAdjustment="GMT+08:00" useDaylightTime="0" value="8">(GMT+08:00) Irkutsk, Ulaan Bataar</option>
            <option timeZoneId="67" gmtAdjustment="GMT+08:00" useDaylightTime="0" value="8">(GMT+08:00) Perth</option>
            <option timeZoneId="68" gmtAdjustment="GMT+08:00" useDaylightTime="0" value="8">(GMT+08:00) Taipei</option>
            <option timeZoneId="69" gmtAdjustment="GMT+09:00" useDaylightTime="0" value="9">(GMT+09:00) Osaka, Sapporo, Tokyo</option>
            <option timeZoneId="70" gmtAdjustment="GMT+09:00" useDaylightTime="0" value="9">(GMT+09:00) Seoul</option>
            <option timeZoneId="71" gmtAdjustment="GMT+09:00" useDaylightTime="1" value="9">(GMT+09:00) Yakutsk</option>
            <option timeZoneId="72" gmtAdjustment="GMT+09:30" useDaylightTime="0" value="9.5">(GMT+09:30) Adelaide</option>
            <option timeZoneId="73" gmtAdjustment="GMT+09:30" useDaylightTime="0" value="9.5">(GMT+09:30) Darwin</option>
            <option timeZoneId="74" gmtAdjustment="GMT+10:00" useDaylightTime="0" value="10">(GMT+10:00) Brisbane</option>
            <option timeZoneId="75" gmtAdjustment="GMT+10:00" useDaylightTime="1" value="10">(GMT+10:00) Canberra, Melbourne, Sydney</option>
            <option timeZoneId="76" gmtAdjustment="GMT+10:00" useDaylightTime="1" value="10">(GMT+10:00) Hobart</option>
            <option timeZoneId="77" gmtAdjustment="GMT+10:00" useDaylightTime="0" value="10">(GMT+10:00) Guam, Port Moresby</option>
            <option timeZoneId="78" gmtAdjustment="GMT+10:00" useDaylightTime="1" value="10">(GMT+10:00) Vladivostok</option>
            <option timeZoneId="79" gmtAdjustment="GMT+11:00" useDaylightTime="1" value="11">(GMT+11:00) Magadan, Solomon Is., New Caledonia</option>
            <option timeZoneId="80" gmtAdjustment="GMT+12:00" useDaylightTime="1" value="12">(GMT+12:00) Auckland, Wellington</option>
            <option timeZoneId="81" gmtAdjustment="GMT+12:00" useDaylightTime="0" value="12">(GMT+12:00) Fiji, Kamchatka, Marshall Is.</option>
            <option timeZoneId="82" gmtAdjustment="GMT+13:00" useDaylightTime="0" value="13">(GMT+13:00) Nuku'alofa</option>
          </select>	
        </div>
      )}
      {isLoading && (
        <div style={{
          display:"flex",
          justifyContent:"center",
          position:"absolute",
          right: "0px",
          top:"65px",
          width: "100%"
          }}
        >
          <div
          // style={{
          //   gridRow: '2',
          //   gridColumn: 1,
          //   backgroundColor: 'black',
          //   zIndex: 10,
          //   display: 'grid',
          //   opacity: 0.9
          // }}
            style={{
              zIndex: 4,
              backgroundColor: "black",
              color: "white",
              opacity: "0.95",
              borderRadius: "10px",
              padding: "10px",
              boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center"
              }}
          >
            <div style={{fontSize: '20px', color: 'white',opacity: 1}}>Querying CYBEX</div>
            <div
              style={{
                marginLeft: '15px',
                opacity: 1
              }}
            >
              <CircleLoader color="#00cbcc" />
            </div>
          </div>

        </div>

        
      )}
      {radialPosition && <RadialToRender position={radialPosition} network={network} scale={network.getScale()} />}
      {/* TODO: Turn hoverText box into seperate component */}
      {hoverText && (
        <div
          style={{
                position: 'absolute',
                zIndex: 1000,
                top: hoverText.y,
                left: hoverText.x,
                // backgroundColor: '#111', // Used for classic Card styling only.
                pointerEvents: 'none',
                backgroundColor: "black",
                color: "white",
                opacity: "0.85",
                borderRadius: "10px",
                padding: "10px",
                boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"
              }}>
          <h4 style={{
            textAlign:"center",
            color: hoverText.color.replace(/"/g,""),
            textShadow: "-1px 0 grey, 0 1px grey, 1px 0 grey, 0 -1px grey"
          }}>
            <b>{hoverText.type.replace(/"/g,"")}</b>
          </h4>
          {/* <hr/> */}
          <h6 style={{textAlign:"center"}}>{truncate(hoverText.data.replace(/"/g,""),32)}</h6>
          {hoverText.percentMal != "" && (
            <div style={{color:"white",fontSize:"large",textAlign:"center"}}>
            <FontAwesomeIcon size="1x" icon={faExclamationCircle} style={{marginRight:"3px"}}/>
            {hoverText.percentMal}
          </div>
          )}
        </div>
      )}
      {hoverTextEdge && (
        <div
          style={{
                position: 'absolute',
                zIndex: 1000,
                top: hoverTextEdge.y,
                left: hoverTextEdge.x,
                // backgroundColor: '#111', // Used for classic Card styling only.
                pointerEvents: 'none',
                backgroundColor: "black",
                color: "white",
                opacity: "0.85",
                borderRadius: "10px",
                padding: "10px",
                boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)"
              }}>
          <h6 style={{textAlign:"center"}}>{hoverTextEdge.data.replace(/"/g,"")}</h6>
        </div>
      )}
      {/* TODO: Turn selectText box into seperate component */}
      {/* {selectText && ( */}
      {selectText && (
        <div>
          <div style={{
            position:"absolute",
            width:"300px", 
            right:"10px",
            bottom:"10px",
            zIndex: 2,
            // backgroundColor: '#111', // Used for classic Card styling only.
            pointerEvents: 'none',
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)",
            backdropFilter: "blur(20px)"
          }}>
          <div onClick={() => pinHandler()}>
            <FontAwesomeIcon size="2x" icon={faMapPin} style={{position:'absolute',left:'10px',top:'10px',pointerEvents:'auto'}}/>
          </div>
          <h4 style={{
            textAlign:"center",
            color: selectText.color.replace(/"/g,""),
            //textShadow: "-1px 0 grey, 0 1px grey, 1px 0 grey, 0 -1px grey"
          }}>
            <b>{selectText.type.replace(/"/g,"")}</b>
          </h4>
          <h6 style={{textAlign:"center"}}>{selectText.data.replace(/"/g,"")}</h6>
          <div style={{color:"white"}}>
            <div style = {{backgroundColor: "#232323",borderRadius: "10px", padding: "10px",marginBottom:"10px",backdropFilter: "blur(20px)"}}>
              <div style = {{display: "flex", justifyContent: "space-between"}}>
                <div>Comments</div>          
                <button onClick={() => setCommentState(true)} style={{pointerEvents: 'auto', backgroundColor:"#white",color:"black",border:"none",borderRadius:"5px"}}>
                <FontAwesomeIcon size="1x" icon={faCommentDots}/>
                  View/Add
                  </button>
              </div>
            </div>
          </div>
          <div style={{color:"white"}}>
            {/* <h6>CYBEX-P Sightings</h6> */}
            <div style = {{backgroundColor: "#232323",borderRadius: "10px", padding: "10px",}}>
              <h6 >CYBEX-P Sightings:</h6>
              {/* <FontAwesomeIcon size="1x" icon={faExclamationCircle} style={{marginRight:"3px"}}/> */}
              Benign = {selectText.count}, Malicious = {selectText.countMalicious}
            </div>
            {/* <hr/> */}
            {/* <h5>Highlight Related:</h5>
            <button style={{backgroundColor:"#232323",color:"white",border:"none",borderRadius:"5px",marginRight:'10px'}}>Attributes</button>
            <button style={{backgroundColor:"#232323",color:"white",border:"none",borderRadius:"5px"}}>Events</button> */}
          </div>
        </div>
        {commentState && (
          <div style={{
            position:"absolute",
            width:"300px", 
            right:"10px",
            bottom:"10px",
            height: "230px",
            zIndex: 2,
            // backgroundColor: '#111', // Used for classic Card styling only.
            backgroundColor: "black",
            color: "white",
            opacity: "1",
            borderRadius: "10px",
            padding: "5px",
            boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)",
          }}>
            <div style={{width: "100%", height: "100%", backgroundColor: "#171717", borderRadius: "5px", padding: "10px",backdropFilter: "blur(20px)"}}>
              <div onClick={() => setCommentState(false)}>
                <FontAwesomeIcon size="1x" icon={faTimesCircle} style={{position:'absolute',right:'10px',top:'10px',pointerEvents:''}}/>
              </div>
              <div style={{color: selectText.color.replace(/"/g,"")}}>{selectText.data.replace(/"/g,"")}</div>
              <h5>Comments</h5>
              {/* <div style={{height: "80px", padding:"0px 0px 0px 5px",overflow: "hide",backgroundColor: "black", marginLeft: "5px", marginRight: "5px",padding: "5px",borderRadius:"5px"}}>
                <p>4-7-2020 9:02: Test.</p>
                <p>4-7-2020 9:07: Test 123.</p>
              </div> */}
              <div style={{display: "flex", justifyContent: "space-between",padding: "5px"}}>
                <div style={{height: "130px",padding: "5px",backgroundColor: "black",borderRadius: "5px"}}>
                  <textarea 
                    // rows="5" 
                    style={{width: "200px", height: "100%", border: "none", borderRadius: "5px",backgroundColor: "black", color: "white"}}
                    onChange={event => setCommentTextState(event.target.value)}>
                      {selectedNodeType.properties.comment}
                  </textarea>
                </div>
                <div 
                  style={{
                    color:"white",
                    border:"none",
                    borderRadius:"5px", 
                    display: "flex", 
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                  onClick={() => handleComment("selected")}
                >
                  <FontAwesomeIcon size="2x" icon={faArrowCircleUp}/>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
        
        
      )}
      {/* Temporary duplication of above for pinnedText. Needs to be cleaned up and merged into a common component. */}
      {pinnedText && (
        <div>
          <div style={{
            position:"absolute",
            width:"300px", 
            right: pinnedPos + 'px',
            bottom:"10px",
            zIndex: 2,
            // backgroundColor: '#111', // Used for classic Card styling only.
            pointerEvents: 'none',
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)",
            backdropFilter: "blur(20px)",
            transition: "right 1s",
          }}>
          {/* <FontAwesomeIcon size="2x" icon={faMapPin} style={{position:'absolute',left:'10px',top:'10px',color:'#58a5f0'}}/> */}
          <div onClick={() => removePin()}>
            <FontAwesomeIcon size="2x" icon={faTimesCircle} style={{pointerEvents: 'auto', position:'absolute',left:'10px',top:'10px'}}/>
          </div>
          {/* <FontAwesomeIcon size="2x" icon={faTimesCircle} style={{position:'absolute',right:'10px',top:'10px'}}/> */}
          <h4 style={{
            textAlign:"center",
            color: pinnedText.color.replace(/"/g,""),
            //textShadow: "-1px 0 grey, 0 1px grey, 1px 0 grey, 0 -1px grey"
          }}>
            <b>{pinnedText.type.replace(/"/g,"")}</b>
          </h4>
          <h6 style={{textAlign:"center"}}>{pinnedText.data.replace(/"/g,"")}</h6>
          <div style={{color:"white"}}>
            <div style = {{backgroundColor: "#232323",borderRadius: "10px", padding: "10px",marginBottom:"10px",backdropFilter: "blur(20px)"}}>
              <div style = {{display: "flex", justifyContent: "space-between"}}>
                <div>Comments</div>          
                <button onClick={() => setPinnedCommentState(true)} style={{pointerEvents: 'auto', backgroundColor:"#white",color:"black",border:"none",borderRadius:"5px"}}>
                <FontAwesomeIcon size="1x" icon={faCommentDots}/>
                  View/Add
                  </button>
              </div>
            </div>
          </div>
          <div style={{color:"white"}}>
            {/* <h6>CYBEX-P Sightings</h6> */}
            <div style = {{backgroundColor: "#232323",borderRadius: "10px", padding: "10px",}}>
              <h6 >CYBEX-P Sightings:</h6>
              {/* <FontAwesomeIcon size="1x" icon={faExclamationCircle} style={{marginRight:"3px"}}/> */}
              Benign = {pinnedText.count}, Malicious = {pinnedText.countMalicious}
            </div>
            {/* <hr/> */}
            {/* <h5>Highlight Related:</h5>
            <button style={{backgroundColor:"#232323",color:"white",border:"none",borderRadius:"5px",marginRight:'10px'}}>Attributes</button>
            <button style={{backgroundColor:"#232323",color:"white",border:"none",borderRadius:"5px"}}>Events</button> */}
          </div>
        </div>
        {pinnedCommentState && (
          <div style={{
            position:"absolute",
            width:"300px", 
            right: pinnedPos + "px",
            bottom:"10px",
            height: "230px",
            zIndex: 2,
            // backgroundColor: '#111', // Used for classic Card styling only.
            backgroundColor: "black",
            color: "white",
            opacity: "1",
            borderRadius: "10px",
            padding: "5px",
            boxShadow: "0px 2px 5px 0px rgba(31,30,31,1)",
            transition: "right 1s"
          }}>
            <div style={{width: "100%", height: "100%", backgroundColor: "#171717", borderRadius: "5px", padding: "10px",backdropFilter: "blur(20px)"}}>
              <div onClick={() => setPinnedCommentState(false)}>
                <FontAwesomeIcon size="1x" icon={faTimesCircle} style={{position:'absolute',right:'10px',top:'10px'}}/>
              </div>
              <div style={{color: pinnedText.color.replace(/"/g,"")}}>{pinnedText.data.replace(/"/g,"")}</div>
              <h5>Comments</h5>
              {/* <div style={{height: "80px", padding:"0px 0px 0px 5px",overflow: "hide",backgroundColor: "black", marginLeft: "5px", marginRight: "5px",padding: "5px",borderRadius:"5px"}}>
                <p>4-7-2020 9:02: Test.</p>
                <p>4-7-2020 9:07: Test 123.</p>
              </div> */}
              <div style={{display: "flex", justifyContent: "space-between",padding: "5px"}}>
                <div style={{height: "130px",padding: "5px",backgroundColor: "black",borderRadius: "5px"}}>
                  <textarea 
                    // rows="5" 
                    style={{width: "200px", height: "100%", border: "none", borderRadius: "5px",backgroundColor: "black", color: "white"}}
                    onChange={event => setPinnedCommentTextState(event.target.value)}>
                      {pinnedNodeType.properties.comment}
                  </textarea>
                </div>
                <div 
                  style={{
                    color:"white",
                    border:"none",
                    borderRadius:"5px", 
                    display: "flex", 
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                  onClick={() => handleComment("pinned")}
                >
                  <FontAwesomeIcon size="2x" icon={faArrowCircleUp}/>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
        
        
      )}
    </div>
  );
};

Graph.propTypes = {
  isLoading: PropTypes.bool.isRequired
};

export default Graph;
