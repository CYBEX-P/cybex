import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ReactModal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ModalContext from '../App/ModalContext';
import MenuContext from '../App/MenuContext';
import { UnstyledButton, ModalContentStyle } from '../__styles__/styles';

const TitleStyle = styled.div`
  grid-row: 1;
  grid-column: 1;
  font-weight: bold;
  align-self: center;
  font-size: 24px;
`;

const ExitStyle = styled.div`
  grid-row: 1;
  grid-column: 2;
  align-self: center;
  justify-self: center;
`;

const ContentStyle = styled.div`
  grid-row: 2;
  grid-column: 1 / span 2;
`;

ReactModal.setAppElement('#root');

const GraphModal = ({ contentLabel, children, title, afterCloseFn }) => {
  const { isShowingModal, dispatchModal } = useContext(ModalContext);
  const { dispatchExpand } = useContext(MenuContext);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      dispatchModal('none');
    }
  });
  return (
    <ReactModal
      isOpen={isShowingModal === title}
      onAfterOpen={() => dispatchExpand('none')}
      contentLabel={contentLabel}
      style={{ overlay: { zIndex: 10 } }}
      onAfterClose={afterCloseFn}
    >
      <ModalContentStyle>
        <TitleStyle>{title}</TitleStyle>
        <ExitStyle>
          <UnstyledButton onClick={() => dispatchModal(false)}>
            <FontAwesomeIcon icon="times" size="2x" />
          </UnstyledButton>
        </ExitStyle>
        <ContentStyle>{children}</ContentStyle>
      </ModalContentStyle>
    </ReactModal>
  );
};

GraphModal.propTypes = {
  contentLabel: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.string.isRequired,
  afterCloseFn: PropTypes.func
};

GraphModal.defaultProps = {
  contentLabel: 'Graph Modal',
  children: <></>,
  afterCloseFn: () => {}
};

export default GraphModal;
