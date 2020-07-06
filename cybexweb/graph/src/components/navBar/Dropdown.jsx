import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

class NewDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  render() {
    return (
      <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle caret>
            <FontAwesomeIcon size="lg" icon="bars" color="#e0e0e0" />
        </DropdownToggle>

        <DropdownMenu>
          <DropdownItem>
            <Link onClick={() => this.props.dispatchExpand('none')} className="nav-link text-dark" to="/">
                <FontAwesomeIcon fixedWidth size="lg" icon="home" color="#e0e0e0" />
                <span style={{ paddingLeft: '12px' }}>Home</span>
            </Link>
          </DropdownItem>
          
          {!this.props.isSignedIn && (
            <DropdownItem>
                <Link onClick={() => this.props.dispatchExpand('none')} className="nav-link text-dark" to="/login">
                    <FontAwesomeIcon fixedWidth size="lg" icon="user" color="#e0e0e0" />
                    <span style={{ paddingLeft: '12px' }}>Login</span>
                </Link>
            </DropdownItem>
          )}

          {/* <DropdownItem disabled>Action (disabled)</DropdownItem> */}

        {this.props.permissions && (
            <>
            <DropdownItem divider />
            <DropdownItem header>Admin Functions</DropdownItem>

            <DropdownItem>
                <Link onClick={() => this.props.dispatchExpand('none')} className="nav-link text-dark" to="/register">
                    <FontAwesomeIcon fixedWidth size="lg" icon="user-plus" color="#e0e0e0" />
                    <span style={{ paddingLeft: '12px' }}>Register User</span>
                </Link>
            </DropdownItem>

            <DropdownItem>
                <Link onClick={() => this.props.dispatchExpand('none')} className="nav-link text-dark" to="/find">
                    <FontAwesomeIcon fixedWidth size="lg" icon="search" color="#e0e0e0" />
                    <span style={{ paddingLeft: '12px' }}>Find User</span>
                </Link>
            </DropdownItem>

            <DropdownItem>
                <Link onClick={() => this.props.dispatchExpand('none')} className="nav-link text-dark" to="/remove">
                    <FontAwesomeIcon fixedWidth size="lg" icon="user-slash" color="#e0e0e0" />
                    <span style={{ paddingLeft: '12px' }}>Remove User</span>
                </Link>
            </DropdownItem>

            <DropdownItem>
                <Link onClick={() => this.props.dispatchExpand('none')} className="nav-link text-dark" to="/update">
                    <FontAwesomeIcon fixedWidth size="lg" icon="pen" color="#e0e0e0" />
                    <span style={{ paddingLeft: '12px' }}>Update User</span>
                </Link>
            </DropdownItem>
            </>
        )}
        </DropdownMenu>
      </Dropdown>
    );
  }
}
export default NewDropdown;