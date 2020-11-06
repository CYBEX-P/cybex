import React from 'react';
import { IOCContainer, IOCCard, CardBody, CardText, IOCButton, MockCloseButton } from './styles';

export const IOC = () => {
  const numIOCs = [0, 1];

  return (
    <IOCContainer>
      {numIOCs.map(idx => (
        <IOCCard key={idx}>
          <MockCloseButton>X</MockCloseButton>
          <MockCloseButton>PIN</MockCloseButton>
          <CardText>IP</CardText>
          <CardText>8.8.8.8</CardText>
          <CardBody>
            <CardText>Comments</CardText>
            <IOCButton>Add</IOCButton>
          </CardBody>
          <CardBody>
            <CardText>Sightings</CardText>
            <CardText>Benign</CardText>
            <CardText>Malicious</CardText>
          </CardBody>
        </IOCCard>
      ))}
    </IOCContainer>
  );
};
