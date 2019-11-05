import React, { Component } from 'react';
import {
  withRouter,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import { Home } from './Home';
import { History } from './History';
import './App.css';
import NavBar from "./components/NavBar";
//import { useAuth0 } from "./react-auth0-spa";
import auth0Client from './Auth';


import Profile from "./components/Profile";
import Callback from './Callback';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            checkingSession: true,
        }
    }

    async componentDidMount() {
        if (this.props.location.pathname === '/callback') {
            this.setState({ checkingSession: false });
            return;
        }
        try {
            await auth0Client.silentAuth();
            this.forceUpdate();
        } catch (err) {
            if (err.error !== 'login_required') console.log(err.error);
        }
        this.setState({ checkingSession: false });
    }

    
    render() {
        return (
            <div>
                <NavBar />

                <nav>
                    <div style={{ background: '#1c53c9', padding: 30 }}>
                        <Button name="Home" path="/index" />
                        <Button name="History" path="/history" />
                        <Button name="Group" path="/group" />
                        <Button name="Forum" path="/forum" />
                    </div>
                </nav>

                {
                    auth0Client.isAuthenticated() &&
                    <div>
                      <Route exact path="/">
                          <Redirect to="/index"></Redirect>
                      </Route>
                      <Route path="/index">
                          <Home />
                      </Route>
                      <Route path="/history">
                          <History />
                      </Route>
                      <Route path="/profile" component={Profile} />
                    </div>
                }
                <Route exact path='/callback' component={Callback} />
                
            </div>
        );
    }
}

const linkStyle = {
  marginRight: 15,
  paddingLeft: 20,
  paddingRight: 20,
  paddingTop: 10,
  paddingBottom: 10,
  background: '#4f7fe8'
};

function Button(props) {
  return (
    <Link to={props.path} style={linkStyle}>{props.name}</Link>
  );
}
export default withRouter(App);
