import React, { Component } from 'react';
import {
  withRouter,
  Route,
  Link,
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
                    <div style={{ background: '#1c53c9', paddingBottom: 15 }}>
                        <NavButton name="Home" path="/index" />
                        <NavButton name="History" path="/history" />
                        <NavButton name="Group" path="/group" />
                        <NavButton name="Forum" path="/forum" />
                        <NavButton name="Admin" path="/admin" />
                    </div>
                </nav>

                {
                    auth0Client.isAuthenticated() ? (
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
                        <Route path="/admin"><Admin /></Route>
                        <Route path="/profile" component={Profile} />
                        </div>
                    ) : (<p>Please sign in to view your goals!</p> )
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
