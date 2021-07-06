/*
Component that renders the dropdown options within the main hamburger menu
on the left side of the navbar.
*/

import React from 'react';
import axios from 'axios';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import GraphModal from '../modal/graphModal';
import Graph from '../Graph/Graph';

class NewDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false,
      // The following state variables are only for file download browser
      fileBrowserOpen: false,
      directories: null,
      files: null,
      path: null
    };
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }
  //The following functions are only for file download browser
  toggleFileBrowser() {
    this.setState(prevState => ({
      fileBrowserOpen: !prevState.fileBrowserOpen
    }));
  }
  browseFiles(path,toggle=true) {
    axios
    .get(`api/v1/getContents/${path.replace('/',":)")}`)
    .then(({ data }) => {
      this.setState({files: data.files});
      this.setState({directories: data.directories});
      this.setState({path: path});
    }); 
    if (toggle==true) {
      // toggle is true by default
      this.toggleFileBrowser()
    }
    // put filebox in middle
  }

  render() {
    return (
      <div>
        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
          <DropdownToggle caret>
              <FontAwesomeIcon size="lg" icon="bars" color="#e0e0e0" />
          </DropdownToggle>

          <DropdownMenu>
            <DropdownItem>
              <Link onClick={() => window.location.href = "/home"} className="nav-link text-dark" to="/home">
                  <FontAwesomeIcon fixedWidth size="lg" icon="home" color="#e0e0e0" />
                  <span style={{ paddingLeft: '12px' }}>Home</span>
              </Link>
            </DropdownItem>

            <DropdownItem>
              <Link onClick={() => window.location.href = "https://cybexp-priv.ignaciochg.com/manual.html"} className="nav-link text-dark" to="graph">
                  <FontAwesomeIcon fixedWidth size="lg" icon="shield-alt" color="#e0e0e0" />
                  <span style={{ paddingLeft: '12px' }}>Privacy Preservation</span>
              </Link>
            </DropdownItem>

            <DropdownItem>
              <Link onClick={() => window.location.href ="/docs"} className="nav-link text-dark" to="/docs">
                  <FontAwesomeIcon fixedWidth size="lg" icon="info-circle" color="#e0e0e0" />
                  <span style={{ paddingLeft: '12px' }}>Documentation</span>
              </Link>
            </DropdownItem>

            <DropdownItem>
              <Link onClick={() => this.browseFiles("honeypot/")} className="nav-link text-dark" to="/graph"> 
              {/* <Link onClick={() => window.location.href ="/static/honeypot/ssh-london/cowrie.json.16:40:00.gz"} className="nav-link text-dark" to="/graph"> */}
                  <FontAwesomeIcon fixedWidth size="lg" icon="server" color="#e0e0e0" />
                  <span style={{ paddingLeft: '12px' }}>Honeypot Download</span>
              </Link>
            </DropdownItem>

            <DropdownItem>
                  {/* <Link onClick={() => window.location.href = "/home"} className="nav-link text-dark" to="/home"> */}
                  <Link onClick={() => this.props.dispatchModal('User Profile')} className="nav-link text-dark" to="/graph">
                      <FontAwesomeIcon fixedWidth size="lg" icon="user" color="#e0e0e0" />
                      <span style={{ paddingLeft: '12px' }}>User Profile</span>
                  </Link>
              </DropdownItem>

            {/* {!this.props.isSignedIn && (
              <DropdownItem>
                  <Link onClick={() => window.location.href = "/home"} className="nav-link text-dark" to="/home">
                      <FontAwesomeIcon fixedWidth size="lg" icon="user" color="#e0e0e0" />
                      <span style={{ paddingLeft: '12px' }}>Login</span>
                  </Link>
              </DropdownItem>
            )} */}

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
        {/* conditionally renders file browser for honeypot download */}
        {this.state.fileBrowserOpen && (
          <div style={{position: "fixed", top: "64px", left: "10px", maxWidth: "50%", maxHeight: "500px", overflow: "auto", backgroundColor: "rgba(10, 10, 10, 0.95)", backdropFilter: "blur(20px)", color:"white", padding:"20px",borderRadius:"5px"}}>
            <div onClick={() => this.setState({fileBrowserOpen: false})}>
              <FontAwesomeIcon size="2x" icon={faTimesCircle} style={{ float: 'right' }} />
            </div>
            <h3>Honeypot Data Download</h3>
            <h5>{this.state.path}</h5>
            {this.state.path != null && this.state.path.split("/").length > 2 && (
              <div onClick={() => this.browseFiles(this.state.path.substring(0, this.state.path.lastIndexOf('/', this.state.path.lastIndexOf('/')-1)+1),false)} style={{backgroundColor:"#0277bd",padding:"2px",marginBottom:"10px",borderRadius:"3px",display:"inline-block"}}>Back...</div>
            )}
            <div style={{display: "flex", justifyContent: "flexStart"}}>
              {this.state.files != null && (
                <div>
                  <h5>Files:</h5>
                  {Object.keys(this.state.files).map(file => (
                    <div key={file} style={{ display: 'inline-block', margin: '10px', }}>
                      <a href={"../static/" + this.state.path + this.state.files[file]} download>{this.state.files[file]}</a>
                    </div>
                  ))}
                </div>
              )}
              {this.state.directories != null && (
                <div>  
                  <h5>Directories:</h5>
                  {Object.keys(this.state.directories).map(directory => (
                    <div key={directory} style={{ display: 'inline-block', margin: '10px' }}>
                      <div onClick={() => this.browseFiles(this.state.path + this.state.directories[directory] +'/',false)}>{this.state.directories[directory]}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default NewDropdown;