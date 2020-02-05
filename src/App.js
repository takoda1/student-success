import React, { Component } from 'react';
import axios from 'axios';
import {
  withRouter,
  Route,
  Redirect
} from "react-router-dom";
import { Home } from './Home';
import { History } from './History';
import { Admin } from './Admin';
import { Group } from './Group';
import { Forum } from './Forum';
import './App.css';
import NavBar from "./components/NavBar";
import auth0Client from './Auth';
import Button from 'react-bootstrap/Button';
import config from './auth_config.json';

import Callback from './Callback';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            checkingSession: true,
            user: null,
        }
    }

    async componentDidMount() {
        let user = this.state.user;
        if (this.props.location.pathname === '/callback') {
            this.setState({ checkingSession: false });
            return;
        }
        try {
            await auth0Client.silentAuth();
            this.forceUpdate();
            const email = encodeURIComponent(auth0Client.getProfile().name)
            user = (await axios.get(`/userByEmail/${email}`)).data[0];
        } catch (err) {
            if (err.error !== 'login_required') console.log(err.error);
        }
        
        this.setState({ checkingSession: false, user });
    }

    
    render() {
        return (
            <div>
                <NavBar />
                <nav>
                    <div style={{ background: '#1c53c9', paddingBottom: 15 }}>
                        <NavButton name="Home" path="/index" />
                        <NavButton name="Timers" path="/timers" />
                        <NavButton name="Group" path="/group" />
                        <NavButton name="Forum" path="/forum" />
                        {
                            (this.state.user && auth0Client.getProfile()[config.roleUrl] === 'admin') && 
                            <NavButton name="Admin" path="/admin" />
                        }
                    </div>
                </nav>
                <Route exact path="/">
                    <Redirect to="/index"></Redirect>
                </Route>
                {
                    this.state.user ? (
                        <div>
                        <Route path="/index">
                            <Home user={this.state.user} />
                        </Route>
                        <Route path="/timers">
                            <History user={this.state.user} />
                        </Route>
                        <Route path="/group">
                            <Group user={this.state.user} />
                        </Route>
                        <Route path="/forum">
                            <Forum user={this.state.user} />
                        </Route>
                        {
                            auth0Client.getProfile()[config.roleUrl] === 'admin' ? (
                            <div>
                                <Route path="/admin"><Admin user={this.state.user} /></Route>
                            </div>
                            ) : (<Route path="/admin"><p>You are not an admin, contact your administrator or takoda.ren@gmail.com</p></Route>)
                        }
                        </div>
                    ) : (
                            <div>
                                <Route path="/index">
                                    <LoadingText />
                                </Route>
                                <Route path="/history">
                                    <LoadingText />
                                </Route>
                                <Route path="/group">
                                    <LoadingText />
                                </Route>
                                <Route path="/forum">
                                    <LoadingText />
                                </Route>
                                <Route path="/admin">
                                    <LoadingText />
                                </Route>
                            </div>
                        )
                }
                <Route exact path='/callback' component={Callback} />
                
            </div>
        );
    }
}

function NavButton(props) {
  return (
      <Button className="nav-button" href={props.path} size="lg">{props.name}</Button>
  );
}

function LoadingText(props) {
    return (
        <p>Loading... If this takes a while, you are either not signed in or not a verified user--check your email for the verification email. Please either login or contact your administrator.</p>
    );
}
export default withRouter(App);
