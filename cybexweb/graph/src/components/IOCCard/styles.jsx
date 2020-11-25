import styled from 'styled-components';

export const CardTextField = styled.input`
  width: 200px;
  height: 100%;
  border: none;
  border-radius: 5px;
  background-color: black;
  color: white;
  pointer-events: auto;
`;

export const Container = styled.div`
  display: flex;
  position: fixed;
  width: 600px;
  height: 260px;
  right: 10px;
  bottom: 10px;
  z-index: 2;
  pointer-events: none;
  border-radius: 10px;
  padding: 20px;
  justify-content: space-between;
`;

export const Card = styled.div`
  position: absolute;
  width: 300px;
  right: 10px;
  bottom: 10px;
  height: 230px;
  z-index: 2;
  background-color: black;
  color: white;
  opacity: 1;
  border-radius: 10px;
  padding: 5px;
  box-shadow: 0px 2px 5px 0px rgba(31, 30, 31, 1);
`;

export const CardBody = styled.div`
  width: 100%;
  height: 25%;
  background-color: #171717;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-between;
`;

export const CardText = styled.h6`
  color: white;
`;

export const IOCButton = styled.button`
  color: lightsalmon;
  background-color: papayawhip;
  border: none;
  border-radius: 10px;
`;

export const Header = styled.h6`
  color: papayawhip;
`;

// Need to delete this component once done
export const MockCloseButton = styled.button`
  height: 25px;
  width: 25px;
  color: white;
  pointer-events: auto;
`;
