import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import MainApp from './components/App/MainApp';
import { IOCContainer, IOCCard, IOC } from './components/IOCCard';

const App = ({ config }) => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#efefef' }} className="App">
        <Route path="/graph" component={() => <MainApp config={config} />} />
        <Route path="/" component={() => <IOC />} />
      </div>
    </Router>
  );
};

export default App;
