import React, { Component } from 'react';
import './History.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons'

class History extends Component {
    render() {
        return(
            <div>
                <h1>History</h1>
                <Calendar />
                <div className="history-grid-goals">
                    {allCompleted()}
                    <Goals />
                    <Timers />
                </div>
            </div>
        );
    }
}


function thisDate(props) {
  return <div className="history-date">{props.text}</div>;
}

class Calendar extends Component {
  render() {
    return(
      <div className="history-grid-container">
        {thisDate({text: "10/06"})}
        {thisDate({text: "10/07"})}
        {thisDate({text: "10/08"})}
        {thisDate({text: "10/09"})}
        {thisDate({text: "10/10"})}
        {thisDate({text: "10/11"})}
        {thisDate({text: "10/12"})}
      </div>
    );
  }
}

function allCompleted() {
  
  // const elements = [{text: "Meet with advisor", isChecked: true, value: "advisor"}, {text: "Write 30 paragraphs", isChecked: true, value: "write"}, {text: "1 hr of research", isChecked: true, value: "research"}];
  const elements = [{isChecked: false}, {isChecked: false}];
  var yes = true;
  for (const [isChecked] of elements.entries()) {
    if([isChecked] === false) {
      yes = false;
    }
  }
  if(yes === true) {
    return(
      <div className="history-goals-aside">
        <FontAwesomeIcon icon={faCheckCircle} />
        <p>You've completed all of your goals!</p>
      </div> 
    );
  }
  else {
    return(
      <div className="history-goals-aside">
        <FontAwesomeIcon icon={faMinusCircle} />
        <p>You did not meet your goals.</p>
      </div> 
    
    );
  }


}

function checkboxGoals() {
        const goals = [{id: 1, text: "Meet with advisor", isChecked: true, value: "advisor", name: "advisor"}, 
                        {id: 2, text: "Write 30 paragraphs", isChecked: true, value: "write", name: "write"}, 
                        {id: 3, text: "1 hr of research", isChecked: true, value: "research", name: "research"}];
        const listGoals = goals.map((goal) =>
        <li key={goal.id}> <input type="checkbox" idname={goal.name} value={goal.value} checked={goal.isChecked} readOnly /> {goal.text}</li> ); 
        return(
                <div className="history-goals">
                        {listGoals}
                </div>
                
        );


}

class Goals extends Component {
  render() {
    return(
      <div className="history-goal-list">
        <h2>My Goals</h2>
                {checkboxGoals()}
      </div>
    );
  }
}

class Timers extends Component {
  render() {
    return(
      <div className="history-timers">
        <h2>Timers</h2>
        {Timer()}
      </div>
    );
  }
}

function Timer() {
    const times = [{id: 1, text: "Research", time: "62:17"}, {id: 2, text: "Writing", time: "15:00"}, {id: 3, text: "Meetings", time: "45:00"}];
    const listTimes = times.map((time) =>
    <li key={time.id}>{time.text}: {time.time}</li>)
    return(
        <ul className="history-timers-list">
            {listTimes}
        </ul>
        
    );
}



export { History };
