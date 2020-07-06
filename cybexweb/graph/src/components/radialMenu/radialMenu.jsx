import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MenuSVG = styled.svg`
  height: ${({ scale }) => Math.round(scale * 200)}px;
  width: ${({ scale }) => Math.round(scale * 200)}px;
  position: absolute;
  top: ${({ position, scale }) => Math.round(position.y) - Math.round(scale * 100)}px;
  left: ${({ position, scale }) => Math.round(position.x) - Math.round(scale * 100)}px;
  z-index: 2;
  fill: transparent;
`;

const Path = styled.path`
  fill: ${props => (props.isActive ? '#aaa' : '#666')};
  :hover {
    ${props => (props.isActive ? 'fill: #e0e0e0' : '')};
  }
`;

const IconDiv = styled.div`
  position: absolute;
  top: ${({ position, scale }) => Math.round(position.y) - Math.round(scale * 32)}px;
  left: ${({ position, scale }) => Math.round(position.x) - Math.round(scale * 32)}px;
  z-index: 4;
  pointer-events: none;
  width: ${({ scale }) => Math.round(scale * 64)}px;
  height: ${({ scale }) => Math.round(scale * 64)}px;
  color: #0277bd;
  display: flex;
  justify-content: center;
  align-items: center;
  :nth-child(2) {
    top: ${({ position, scale }) => Math.round(position.y) - Math.round(scale * 64)}px;
    left: ${({ position, scale }) => Math.round(position.x) - Math.round(scale * 100)}px;
  }
  :nth-child(3) {
    top: ${({ position, scale }) => Math.round(position.y) - Math.round(scale * 105)}px;
    left: ${({ position, scale }) => Math.round(position.x) - Math.round(scale * 64)}px;
  }
  :nth-child(4) {
    top: ${({ position, scale }) => Math.round(position.y) - Math.round(scale * 105)}px;
    left: ${({ position }) => Math.round(position.x)}px;
  }
  :nth-child(5) {
    top: ${({ position, scale }) => Math.round(position.y) - Math.round(scale * 62)}px;
    left: ${({ position, scale }) => Math.round(position.x) + Math.round(scale * 35)}px;
  }
  :nth-child(6) {
    top: ${({ position }) => Math.round(position.y)}px;
    left: ${({ position, scale }) => Math.round(position.x) + Math.round(scale * 35)}px;
  }
  :nth-child(7) {
    top: ${({ position, scale }) => Math.round(position.y) + Math.round(scale * 36)}px;
    left: ${({ position }) => Math.round(position.x)}px;
  }
  :nth-child(8) {
    top: ${({ position, scale }) => Math.round(position.y) + Math.round(scale * 36)}px;
    left: ${({ position, scale }) => Math.round(position.x) - Math.round(scale * 64)}px;
  }
  :nth-child(9) {
    top: ${({ position }) => Math.round(position.y)}px;
    left: ${({ position, scale }) => Math.round(position.x) - Math.round(scale * 105)}px;
  }
`;

const RadialMenu = ({ position, icons, onClickFunctions, scale, titles }) => {
  const [onClickFunctionsState] = useState(() => {
    const arrayToReturn = onClickFunctions;
    while (arrayToReturn.length < 8) {
      arrayToReturn.push(() => {});
    }
    return arrayToReturn;
  });
  const [titleState] = useState(() => {
    const arrayToReturn = titles;
    while (arrayToReturn.length < 8) {
      arrayToReturn.push('');
    }
    return arrayToReturn;
  });
  const [iconState] = useState(() => {
    return icons.map(icon => {
      switch (icon) {
        case 'all':
          return 'plus-circle';
        case 'asn':
          return 'server';
        case 'cybexCount':
          return 'calculator';
        case 'cybexRelated':
          return 'passport';
        case 'gip':
          return 'globe';
        case 'hostname':
          return 'project-diagram';
        case 'whois':
          return 'user';
        case 'enrichURL':
          return 'plus-circle';
        case 'resolveHost':
            return 'h-square';
        case 'nameservers':
            return 'server';
        case 'mailservers':
            return 'server';
        case 'registrar':
            return 'passport';
        case 'ports':
            return 'file-import';
        case 'netblock':
            return 'object-group';
        case 'deconstructEmail':
            return 'mail-bulk';
        
        default:
          return icon;
      }
    });
  });
  return (
    <div>
      <MenuSVG
        position={position}
        scale={scale}
        id="Layer_1"
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 198.99 198.99"
      >
        <Path
          d="M.76,99.5h49a50.13,50.13,0,0,1,14.57-35L29.71,29.92A98.62,98.62,0,0,0,.76,99.5Z"
          transform="translate(-0.76 -0.5)"
          onClick={onClickFunctionsState[0]}
          isActive={iconState.length > 0}
        >
          <title>{titleState[0]}</title>
        </Path>
        <Path
          d="M30.42,29.21,65,63.83A50.63,50.63,0,0,1,99.5,49.51V.51A100,100,0,0,0,30.42,29.21Z"
          transform="translate(-0.76 -0.5)"
          onClick={onClickFunctionsState[1]}
          isActive={iconState.length > 1}
        >
          <title>{titleState[1]}</title>
        </Path>
        <Path
          d="M135.45,63.84,170.09,29.2A99.19,99.19,0,0,0,100.5.5v49A50.29,50.29,0,0,1,135.45,63.84Z"
          transform="translate(-0.76 -0.5)"
          onClick={onClickFunctionsState[2]}
          isActive={iconState.length > 2}
        >
          <title>{titleState[2]}</title>
        </Path>
        <Path
          d="M170.8,29.91,136.17,64.54a50.37,50.37,0,0,1,14.57,35h49A99.17,99.17,0,0,0,170.8,29.91Z"
          transform="translate(-0.76 -0.5)"
          onClick={onClickFunctionsState[3]}
          isActive={iconState.length > 3}
        >
          <title>{titleState[3]}</title>
        </Path>
        <Path
          d="M150.74,100.5a50.29,50.29,0,0,1-14.33,34.7l34.64,34.64a99.19,99.19,0,0,0,28.69-69.34Z"
          transform="translate(-0.76 -0.5)"
          onClick={onClickFunctionsState[4]}
          isActive={iconState.length > 4}
        >
          <title>{titleState[4]}</title>
        </Path>
        <Path
          d="M135.71,135.92a50.32,50.32,0,0,1-35.21,14.57v49a99.17,99.17,0,0,0,69.84-28.95Z"
          transform="translate(-0.76 -0.5)"
          onClick={onClickFunctionsState[5]}
          isActive={iconState.length > 5}
        >
          <title>{titleState[5]}</title>
        </Path>
        <Path
          d="M64.79,135.92,30.16,170.55A99.16,99.16,0,0,0,99.5,199.49v-49A50.36,50.36,0,0,1,64.79,135.92Z"
          transform="translate(-0.76 -0.5)"
          onClick={onClickFunctionsState[6]}
          isActive={iconState.length > 6}
        >
          <title>{titleState[6]}</title>
        </Path>
        <Path
          d="M49.76,100.5H.76a99.19,99.19,0,0,0,28.69,69.34L64.09,135.2A50.29,50.29,0,0,1,49.76,100.5Z"
          transform="translate(-0.76 -0.5)"
          onClick={onClickFunctionsState[7]}
          isActive={iconState.length > 7}
        >
          <title>{titleState[7]}</title>
        </Path>
      </MenuSVG>
      {iconState.lengh !== 0 &&
        iconState.map(icon => {
          return (
            <IconDiv position={position} scale={scale} key={icon}>
              <FontAwesomeIcon size={`${scale < 1.2 ? 'sm' : '2x'}`} fixedWidth icon={icon} />
            </IconDiv>
          );
        })}
    </div>
  );
};

RadialMenu.propTypes = {
  position: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }).isRequired,
  icons: PropTypes.arrayOf(PropTypes.string).isRequired,
  titles: PropTypes.arrayOf(PropTypes.string),
  onClickFunctions: PropTypes.arrayOf(PropTypes.func).isRequired,
  scale: PropTypes.number.isRequired
};

RadialMenu.defaultProps = {
  titles: ['1', '2', '3', '4', '5', '6', '7', '8']
};

export default RadialMenu;
