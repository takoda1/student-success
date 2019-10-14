import React, { Component } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

class App extends Component {
  render() {
    return (
      <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/history">History</Link>
            </li>
            <li>
              <Link to="/forum">Forum</Link>
            </li>
            <li>
              <Link to="/group-chat">Group Chat</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/history">
            <History />
          </Route>
          <Route path="/forum">
            <Forum />
          </Route>
          <Route path="/group-chat">
            <Group />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
    );
  }
}

function thisDate(props) {
  return <div className="history-date">{props.text}</div>;
}

class Calendar extends React.Component {
  render() {
    return(
      <div className="history-grid-container">
        {thisDate({text: "10/06"})}
        {thisDate({text: "10/07"})}
        {thisDate({text: "10/08"})}
        {thisDate({text: "10/09"})}
        {thisDate({text: "10/10"})}
        {thisDate({text: "10/11"})}
        {thisDate({text: "10/12"})}
      </div>
    );
  }
}

function checkboxGoal(props) {

  return [
    <input type="checkbox" name={props.name} value={props.value} checked={props.isChecked} readOnly />,
    props.text,
    <br/>
  ]
}

function allCompleted() {
  
  // const elements = [{text: "Meet with advisor", isChecked: true, value: "advisor"}, {text: "Write 30 paragraphs", isChecked: true, value: "write"}, {text: "1 hr of research", isChecked: true, value: "research"}];
  const elements = [{isChecked: false}, {isChecked: false}];
  var yes = true;
  for (const [isChecked] of elements.entries()) {
    if([isChecked] === false) {
      yes = false;
    }
  }
  if(yes === true) {
    return(
      <div className="history-goals-aside">
        <i className="fas fa-check-circle"></i><br/><br/>
        You've met all of your goals!
      </div> 
    );
  }
  else {
    return(
      <div className="history-goals-aside">
        <i className="fas fa-minus-circle"></i><br/><br/>
        You did not meet your goals.
      </div> 
    
    );
  }


}

class Goals extends React.Component {
  render() {
    return(
      <div className="history-goal-list">
        <h2>My Goals</h2>
        {checkboxGoal({text: "Meet with advisor", isChecked: true, value: "advisor", name: "advisor"})}
        {checkboxGoal({text: "Write 30 paragraphs", isChecked: true, value: "write", name: "write"})}
        {checkboxGoal({text: "1 hr of research", isChecked: true, value: "research", name: "research"})}
      </div>
    );
  }
}

class Timers extends React.Component {
  render() {
    return(
      <div className="history-timers">
        <h2>Timers</h2>
        {Timer()}
      </div>
    );
  }
}

function Timer() {
    const times = [{id: 1, text: "Research", time: "62:17"}, {id: 2, text: "Writing", time: "15:00"}, {id: 3, text: "Meetings", time: "45:00"}];
    const listTimes = times.map((time) =>
    <li key={time.id}>{time.text}: {time.time}</li>)
    return(
      <ul>
        {listTimes}
      </ul>
    );
}

function Home() {
  return <h2>Home</h2>;
}

function History() {
  return(
    <div>
      <h1>History</h1>
      <Calendar />
      <div className="history-grid-goals">
        {allCompleted()}
        <Goals />
        <Timers />
      </div>
    </div>
    
  );
}

function Forum() {
  return <h2>Forum</h2>;
}

function Group() {
  return <h2>Group Chat</h2>;
}

export default App;
