import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  MenuBarStyle,
  ExpandedMenuBar,
  MenuBarChildStyle,
  MenuBarIconStyle,
  UnstyledButton
} from '../__styles__/styles';
import MenuContext from '../App/MenuContext';

const MenuBar = props => {
  const { icon, side, children } = props;
  const { isExpanded, dispatchExpand } = useContext(MenuContext);

  const iconToUse = `chevron-circle-${(s => (s === 'left' || s === 'right' ? s : 'down'))(side)}`;

  return (
    <>
      {isExpanded === side ? (
        <ExpandedMenuBar side={side}>
          <MenuBarChildStyle side={side}>{children}</MenuBarChildStyle>
          <MenuBarIconStyle onClick={() => dispatchExpand('none')} side={side}>
            <UnstyledButton
              onClick={() => {
                dispatchExpand('none');
              }}
              type="button"
            >
              <FontAwesomeIcon icon={iconToUse} color="#e0e0e0" size="2x" />
            </UnstyledButton>
          </MenuBarIconStyle>
        </ExpandedMenuBar>
      ) : (
        side && (
          <MenuBarStyle
            side={side}
            onClick={() => {
              dispatchExpand(side);
            }}
          >
            <FontAwesomeIcon icon={icon} color="#111111" size="lg" />
          </MenuBarStyle>
        )
      )}
    </>
  );
};

MenuBar.propTypes = {
  icon: PropTypes.string,
  side: PropTypes.oneOf(['left', 'right', 'bottom']).isRequired,
  children: PropTypes.node
};

MenuBar.defaultProps = {
  icon: 'search',
  children: undefined
};

export default MenuBar;
