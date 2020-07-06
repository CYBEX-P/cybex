/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { Button as ReactStrapButton } from 'reactstrap';
import { StyledButtonChild } from '../__styles__/styles';

const Button = props => {
  const { onClickFunction, children, type, hasIcon, width } = props;

  return (
    <ReactStrapButton
      className="d-flex"
      style={{ width, height: '40px' }}
      color="primary"
      type={type}
      onClick={onClickFunction}
      block
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            // eslint-disable-next-line react/jsx-indent
            <StyledButtonChild key={`${child}__${index}`} hasIcon={hasIcon} index={index}>
              {child}
            </StyledButtonChild>
          ))
        : children}
    </ReactStrapButton>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  onClickFunction: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['submit', 'button']),
  hasIcon: PropTypes.bool,
  width: PropTypes.string
};

Button.defaultProps = {
  children: <></>,
  type: 'button',
  hasIcon: false,
  width: '80%'
};

export default Button;
