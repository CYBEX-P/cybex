// TODO:
// - Extract onClick from the MacroCards
// - use slots pattern to refactor the component
import styled from 'styled-components';

export const MacroCard = styled.div`
  margin-left: 0%;
  margin-top: 5%;
  background-color: white;
  border-radius: 5px;
  padding: 5px;
  padding-left: 5%;
  box-shadow: 0px 2px 5px 0px rgba(31, 30, 31, 1);
`;

export const MacroCardInformationalContent = styled.div`
  display: inline;
`;

export const MacroCardActionContent = styled.div`
  display: inline;
`;
