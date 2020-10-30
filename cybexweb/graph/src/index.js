/* eslint react/jsx-filename-extension: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faChartBar,
  faBars,
  faSearch,
  faEdit,
  faList,
  faChevronCircleRight,
  faChevronCircleLeft,
  faChevronCircleDown,
  faTimes,
  faUser,
  faUserPlus,
  faUserSlash,
  faPlusCircle,
  faServer,
  faMeh,
  faInfoCircle,
  faProjectDiagram,
  faGlobe,
  faPassport,
  faHome,
  faPen,
  faHSquare,
  faCalculator,
  faFileImport,
  faObjectGroup,
  faMailBulk
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import Config from './testdata/get_graph.json';

library.add(
  faChartBar,
  faBars,
  faSearch,
  faEdit,
  faList,
  faChevronCircleRight,
  faChevronCircleLeft,
  faChevronCircleDown,
  faTimes,
  faUser,
  faUserPlus,
  faUserSlash,
  faPlusCircle,
  faServer,
  faMeh,
  faInfoCircle,
  faProjectDiagram,
  faGlobe,
  faPassport,
  faHome,
  faPen,
  faHSquare,
  faCalculator,
  faFileImport,
  faObjectGroup,
  faMailBulk
);

let YAMLConfig = {};

// Detect Chrome 
let chromeAgent = window.navigator.userAgent.indexOf('Chrome') !== -1; 
if (!chromeAgent) {
  alert("Please use Google Chrome for optimal experience.")
}

if (process.env.NODE_ENV !== 'production') {
  YAMLConfig = Config;
  ReactDOM.render(<App config={YAMLConfig} />, document.getElementById('root'));
} else {
  axios
    .get(`/api/v1/admin/config`)
    .then(({ data }) => {
      YAMLConfig = JSON.parse(data);
      ReactDOM.render(<App config={YAMLConfig} />, document.getElementById('root'));
    })
    .catch(() => {
      ReactDOM.render(
        <h1 className="text-center">Oops! We were not able to get a response from the server.</h1>,
        document.getElementById('root')
      );
    });
}
