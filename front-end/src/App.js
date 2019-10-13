import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { Home } from './Home';
import './App.css';


class App extends Component {
  render() {
    return (
      <Router>
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
            <Route path="/">
              <Home goals={[{content: 'hello', completed: true}]}/>
            </Route>
          </Switch>
        </div>
      </Router>
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
    <Link to={props.path}>
      <a style={linkStyle} title={props.name}>{props.name}</a>
    </Link>
  );
}

export default App;
