import React, { useContext } from 'react';
import { CardText, Container, Header, Card, CardBody, MockCloseButton, CardTextField } from './styles';
import IOCContext from '../App/IOCContext';
import IOCMapContext from '../App/IOCMapContext';

export const IOCContainer = ({ data, pinNode, pinnedCards, handlePinClick }) => {
  const [isComment, setIsComment] = React.useState(false);
  const { pinnedCardsWithContext, setPinnedCardsWithContext } = React.useContext(IOCContext);
  const { mapNode } = React.useContext(IOCMapContext);

  // Switch the to the comment state
  const handleCommentClick = () => {
    setIsComment(!isComment);
  };

  return (
    <Container>
      {pinnedCardsWithContext.map(node =>
        // We iterate from the "outer" context to the inner array
        // Runs in O(n^2), but can be sped up with memoization
        node.map(inner => (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <MockCloseButton onClick={() => handlePinClick(inner)}>X</MockCloseButton>
              <CardText>{inner.properties.data}</CardText>
              <Header>{inner.properties.type}</Header>
              <MockCloseButton noEvent>X</MockCloseButton>
            </div>
            {isComment ? (
              <>
                <CardBody>
                  <CardText>Comments</CardText>
                  <MockCloseButton onClick={handleCommentClick}>return</MockCloseButton>
                  <CardTextField />
                </CardBody>
              </>
            ) : (
              <>
                <CardBody>
                  <CardText>Comments</CardText>
                  <MockCloseButton onClick={handleCommentClick}>X</MockCloseButton>
                </CardBody>
                <CardBody>CYBEX-P Sightings</CardBody>
              </>
            )}
          </Card>
        ))
      )}
      {mapNode.map(n => (
        <div>hello</div>
      ))}
    </Container>
  );
};

/*
  return (
    <Container>
      {pinnedCardsWithContext.length ? (
        pinnedCardsWithContext.map(node => (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <MockCloseButton onClick={() => handlePinClick(node)}>X</MockCloseButton>
              <CardText>{node.properties.type}</CardText>
              <Header>{node.properties.data}</Header>
              <MockCloseButton noEvent>X</MockCloseButton>
            </div>
            {isComment ? (
              <>
                <CardBody>
                  <CardText>Comments</CardText>
                  <MockCloseButton onClick={handleCommentClick}>return</MockCloseButton>
                  <CardTextField />
                </CardBody>
              </>
            ) : (
              <>
                <CardBody>
                  <CardText>Comments</CardText>
                  <MockCloseButton onClick={handleCommentClick}>X</MockCloseButton>
                </CardBody>
                <CardBody>CYBEX-P Sightings</CardBody>
              </>
            )}
          </Card>
        ))
      ) : (
        <>
          <div>empty</div>
        </>
      )}
    </Container>
  );
  */
