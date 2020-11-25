import React from 'react';
import { CardText, Container, Header, Card, CardBody, MockCloseButton, CardTextField } from './styles';

export const IOCContainer = ({ data, pinNode }) => {
  const [pinned, setPinned] = React.useState(new Object());
  const [isComment, setIsComment] = React.useState(false);
  console.log(data);

  // Pin the current node
  const handlePinClick = node => {
    // keep the card pinned (css)

    // User has first clicked pinned
    var pins = new Object();
    pins[node.id] = true;
    setPinned(pins);
    // 1. keep this position
    //
    pinNode(pinned);
  };

  // Switch the to the comment state
  const handleCommentClick = () => {
    setIsComment(!isComment);
  };

  // TODO: Truncate title
  return (
    <Container>
      {data.map(node => (
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
      ))}
    </Container>
  );
};
