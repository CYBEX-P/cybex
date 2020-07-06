import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SplashScreenBody } from '../__styles__/styles';

const SplashScreen = () => (
  <SplashScreenBody>
    <div style={{ fontSize: '56px' }}>
      Loading...
      <br />
      Please Wait
    </div>
    <div>
      <FontAwesomeIcon size="10x" icon="chart-bar" />
    </div>
  </SplashScreenBody>
);

export default SplashScreen;
