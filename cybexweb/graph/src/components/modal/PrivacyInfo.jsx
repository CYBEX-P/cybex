import React, { useContext } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import {TrendPanelStyle} from '../__styles__/styles';

const PrivacyInfo = (props) => {
    return (
        <div>
            <TrendPanelStyle>
                <div onClick={() => props.setPrivacyInfoState(false)}>
                <FontAwesomeIcon size="2x" icon={faTimesCircle} style={{ float: 'right' }} />
                </div>
                <h3>
                    <span class="octicon octicon-book"></span>

                                    example.md
                                    
                </h3>
                    <h1>
                        <a id="user-content-basic-instructions" class="anchor" href="#basic-instructions" aria-hidden="true">
                            <span aria-hidden="true" class="octicon octicon-link"></span>
                        </a>
                        Basic instructions
                    </h1>
                    <ol>
                        <li>Read the description of the project</li>
                        <li>Download the project source</li>
                        <li>Install docker and docker-compose (project dependencies)</li>
                        <li>Build base image. This one takes a few minutes.</li>
                        <li>Build the collector and query modules. create environment for the collector-client submodule</li>
                        <li>Configure each module with the information below</li>
                        <li>Share some data via the project</li>
                        <li>query some data via the project</li>
                    </ol>
                    <p>Just play with sending data with different encryption policies and then try to query that data as different users(see available org names below). In the docs I mention order revealing encryption(ORE) for requesting data within certain timestamps, disregard that info.</p>
                    <h2>
                        <a id="user-content-project-information" class="anchor" href="#project-information" aria-hidden="true">
                            <span aria-hidden="true" class="octicon octicon-link"></span>
                        </a>
                        Project information
                    </h2>
                    <p>
                        Go 
                        <a href="https://cybexp-priv.ignaciochg.com/manual.html" rel="nofollow">here</a>
                        for project description, install procedure, etc...
                    </p>
                    <h2>
                        <a id="user-content-download" class="anchor" href="#download" aria-hidden="true">
                            <span aria-hidden="true" class="octicon octicon-link"></span>
                        </a>
                        Download
                    </h2>
                    {/* <p>
                        Download 
                        <a href="https://cybexp-priv.ignaciochg.com/dl/project.zip" rel="nofollow">here</a>
                        <br>

                        Sample mock data
                        <a href="https://cybexp-priv.ignaciochg.com/dl/data1.json" rel="nofollow">1</a>
                        <a href="https://cybexp-priv.ignaciochg.com/dl/data2.json" rel="nofollow">2</a>
                        <a href="https://cybexp-priv.ignaciochg.com/dl/data3.json" rel="nofollow">3</a>
                        .
                        <br>

                        Feel free to use your own data.
                        <br>

                        Note it will be able to encrypt nested json but one will not be able to correctly query it because of the order of the nested data(not deterministic)(for now).
                    </p>
                    <p>
                        **** please replace query.sh with the patched version 
                        <a href="/dl/query.sh">found here</a>
                        . please also mark as executable with "chmod a+x query.sh<" if you get permission denied"/p>
                    <h2>
                        <a id="user-content-configuring" class="anchor" href="#configuring" aria-hidden="true">
                            <span aria-hidden="true" class="octicon octicon-link"></span>
                        </a>
                        Configuring
                    </h2>
                    <p>Each module has a config file, please modify this with the information below. Config files are self documented. I will place the correct config in them but it doesnt hurt to double check the settings bellow with the config files. The collector will need a the encryption policy to be configured, refer below and the instruction manual for more info.</p>
                    <h3>
                        <a id="user-content-encryption-policy-collector" class="anchor" href="#encryption-policy-collector" aria-hidden="true">
                            <span aria-hidden="true" class="octicon octicon-link"></span>
                        </a>
                        encryption policy (collector)
                    </h3>
                    <p>Policy matching is done according to the config file for the collector. One can use exact match or regex match for the name of the field. The config file also specifies what encryption policy is used for that field. Each record must have at least one index.</p>
                    <p>Please add matching expressions to match the names of the fields. At least one index for a record must be created, else that record is skipped an not submitted. One can specify different encryption policies for different fields. If a field does not match a rule it will be encrypted with the default policy, also specified in the same file.</p>
                    <p>
                        Please use the 
                        <code>-a</code>
                        on the collector wrapper scrip to figure out available attributes(this should provide you with the same information that I have provided below).
                        <br>

                        example of policy: 
                        <code>"DEFAULT and RESEARCH"</code>
                        . you can user 
                        <code>and</code>
                        , 
                        <code>or</code>
                        , 
                        <code>parenthesis</code>
                    </p>
                    <p>
                        with that policy the person quering must have the attributes 
                        <code>"DEFAULT and RESEARCH"</code>
                        to be able to decrypt the data.
                    </p>
                    <h3>
                        <a id="user-content-server-information-both" class="anchor" href="#server-information-both" aria-hidden="true">
                            <span aria-hidden="true" class="octicon octicon-link"></span>
                        </a>
                        Server information (both)
                    </h3>
                    <p>Apply the following in the configuration</p>
                    <p>
                        kms: 
                        <code>"https://cybexp-priv.ignaciochg.com:5002"</code>
                        <br>

                        backend_server: 
                        <code>"https://cybexp-priv.ignaciochg.com:5001"</code>
                    </p>
                    <h3>
                        <a id="user-content-basic-authentication-both" class="anchor" href="#basic-authentication-both" aria-hidden="true">
                            <span aria-hidden="true" class="octicon octicon-link"></span>
                        </a>
                        Basic authentication (both)
                    </h3>
                    <p>
                        user: 
                        <code>johndoe</code>
                        <br>

                        pass: 
                        <code>AKkmyqnJvR5SsRzNn8eF</code>
                    </p>
                    <h3>
                        <a id="user-content-organizationteam-names-query" class="anchor" href="#organizationteam-names-query" aria-hidden="true">
                            <span aria-hidden="true" class="octicon octicon-link"></span>
                        </a>
                        organization/team names (query)
                    </h3>
                    <p>This grants access to their resources, please pick one when configuring the query module. Each of them have different attributes. so they will be able to query and retrieve different data. Try quering data as a few and see how you can or can not access the data you submitted.</p>
                    <pre>
                        <code>name: "UNRCSE"
                        name: "UNRRC"
                        name: "UNRCISO"
                        name: "Public"
                        </code>
                    </pre>
                    <h4>
                        <a id="user-content-attributes" class="anchor" href="#attributes" aria-hidden="true">
                            <span aria-hidden="true" class="octicon octicon-link"></span>
                        </a>
                        Attributes
                    </h4>
                    <div class="highlight highlight-source-json">
                        <pre>
                            {
                            
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                name
                                <span class="pl-pds">"</span>
                            </span>
                            : 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                UNRCSE
                                <span class="pl-pds">"</span>
                            </span>
                            ,
                            
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                attributes
                                <span class="pl-pds">"</span>
                            </span>
                            : [
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                DEFAULT
                                <span class="pl-pds">"</span>
                            </span>
                            ,  
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                UNR
                                <span class="pl-pds">"</span>
                            </span>
                            , 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                CICIAFFILIATE
                                <span class="pl-pds">"</span>
                            </span>
                            , 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                RESEARCH
                                <span class="pl-pds">"</span>
                            </span>
                            ]
                            }

                            {
                            
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                name
                                <span class="pl-pds">"</span>
                            </span>
                            : 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                UNRRC
                                <span class="pl-pds">"</span>
                            </span>
                            ,
                            
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                attributes
                                <span class="pl-pds">"</span>
                            </span>
                            : [
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                DEFAULT
                                <span class="pl-pds">"</span>
                            </span>
                            , 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                UNR
                                <span class="pl-pds">"</span>
                            </span>
                            , 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                ITOPS
                                <span class="pl-pds">"</span>
                            </span>
                            , 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                RESEARCH
                                <span class="pl-pds">"</span>
                            </span>
                            ]
                                
                            }

                            {
                            
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                name
                                <span class="pl-pds">"</span>
                            </span>
                            : 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                UNRCISO
                                <span class="pl-pds">"</span>
                            </span>
                            ,
                            
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                attributes
                                <span class="pl-pds">"</span>
                            </span>
                            : [
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                DEFAULT
                                <span class="pl-pds">"</span>
                            </span>
                            , 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                UNR
                                <span class="pl-pds">"</span>
                            </span>
                            , 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                SECENG
                                <span class="pl-pds">"</span>
                            </span>
                            , 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                ITOPS
                                <span class="pl-pds">"</span>
                            </span>
                            , 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                RESEARCH
                                <span class="pl-pds">"</span>
                            </span>
                            , 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                CICIAFFILIATE
                                <span class="pl-pds">"</span>
                            </span>
                            ]
                            }

                            {  
                            
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                name
                                <span class="pl-pds">"</span>
                            </span>
                            : 
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                Public
                                <span class="pl-pds">"</span>
                            </span>
                            ,
                            
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                attributes
                                <span class="pl-pds">"</span>
                            </span>
                            : [
                            <span class="pl-s">
                                <span class="pl-pds">"</span>
                                DEFAULT
                                <span class="pl-pds">"</span>
                            </span>
                            ]
                            }
                        </pre>
                    </div>
                    <h1>
                        <a id="user-content-test-servers-status" class="anchor" href="#test-servers-status" aria-hidden="true">
                            <span aria-hidden="true" class="octicon octicon-link"></span>
                        </a>
                        Test servers status
                    </h1>
                    <p>if you believe that the servers might be down you can test with the following commands:</p>
                    <div class="highlight highlight-source-shell">
                        <pre>curl https://johndoe:AKkmyqnJvR5SsRzNn8eF@cybexp-priv.ignaciochg.com:5002
                        curl https://johndoe:AKkmyqnJvR5SsRzNn8eF@cybexp-priv.ignaciochg.com:5001</pre>
                    </div>
                    <p>
                        You should get an 
                        <code>up</code>
                        response from each server. If you get bad gateway then its down as well.
                    </p> */}
            </TrendPanelStyle>
        </div>
    );
};

export default PrivacyInfo;