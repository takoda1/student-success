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
import './App.css';
import NavBar from "./components/NavBar";
//import { useAuth0 } from "./react-auth0-spa";
import auth0Client from './Auth';
import Button from 'react-bootstrap/Button';


import Profile from "./components/Profile";
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
                        <NavButton name="History" path="/history" />
                        <NavButton name="Group" path="/group" />
                        <NavButton name="Forum" path="/forum" />
                        <NavButton name="Admin" path="/admin" />
                    </div>
                </nav>

                {
                    this.state.user ? (
                        <div>
                        <Route exact path="/">
                            <Redirect to="/index"></Redirect>
                        </Route>
                        <Route path="/index">
                            <Home user={this.state.user} />
                        </Route>
                        <Route path="/history">
                            <History user={this.state.user} />
                        </Route>
                        <Route path="/admin"><Admin user={this.state.user} /></Route>
                        <Route path="/profile" component={Profile} />
                        </div>
                    ) : (<p>You are either not signed in or not a verified user. Please either login or contact your administrator.</p> )
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
export default withRouter(App);
