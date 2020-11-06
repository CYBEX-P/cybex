import styled from 'styled-components';

export const IOCContainer = styled.div`
  display: flex;
  height: 500px;
  width: 1000px;
  border: 1px solid black;
  color: papayawhip;
`;

export const IOCCard = styled.div`
  height: 500px;
  width: 250px;
  padding: 5px;
  background-color: black
  color: white;
`;

export const CardBody = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: grey;
  margin-bottom: 20px;
  border-radius: 5px;
`;

export const CardText = styled.h5`
  color: white;
`;

export const IOCButton = styled.button`
  color: lightsalmon;
  background-color: papayawhip;
  border: none;
  border-radius: 10px;
`;

// Need to delete this component once done
export const MockCloseButton = styled.button``;
