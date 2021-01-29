import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

// Theme colors
const primaryLightBlue = '#58a5f0';

// Deprecated, currently unused
// export const MacroButton = styled.button`
//   color: black;
//   background-color: papayawhip;
// `;

export const MacroCardText = styled.h3`
  margin-top: 10px;
  color: white;
  text-align: center;
`;

export const MacroCardContainer = styled.div`
  color: ${primaryLightBlue};
  padding: 5px;
`;

export const MacroCard = styled.div`
  color: white;
  padding: 10px;
  box-shadow: 0px 2px 5px 0px rgba(31, 30, 31, 1);
  background-color: rgba(0,0,0,0.3);
  border-radius: 5px;
  margin-bottom: 10px;
  border: solid rgba(0,0,0,0.3);
`;

export const MacroCardButtons = styled.div`
  float: right;
  & > svg {
    margin-left: 5px;
  }
`;

export const MacroCardSubContainer = styled.div`
  display: inline;
`;

export const MacroDetailsCard = styled.div`
  position: fixed;
  height: 90%;
  width: 300px;
  top: 10%;
  left: 340px;
  padding: 10px;
  background-color: rgba(0,0,0,0.95);
  backdrop-filter: blur(30px);
  color: white;
  border-radius: 15px;
  border: solid;
  border-color: #0277bd;
  overflow: auto;
`;
