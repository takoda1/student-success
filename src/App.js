import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import { Home } from './Home';
import { History } from './History';
import './App.css';
import NavBar from "./components/NavBar";
import { useAuth0 } from "./react-auth0-spa";

import Profile from "./components/Profile";

function App() {

    const { loading } = useAuth0();

    if (loading) {
        return (
            <div>Loading...</div>
        );
    }
    
    return (
        <Router>
            <header>
                <NavBar />
            </header>
        <div>
          <nav>
            <div style={{background: '#1c53c9', padding: 30}}>
              <Button name="Home" path="/index"/>
              <Button name="History" path="/history"/>
              <Button name="Group" path="/group"/>
              <Button name="Forum" path="/forum"/>
            </div>
          </nav>

          <Switch>
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
          </Switch>
        </div>
      </Router>
    );
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
export default App;
