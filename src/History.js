import React, { Component } from 'react';
import './History.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

class History extends Component {
     constructor(props) {
        super(props);   
             this.state = { 
               username: '',
               userId: 1,
               goals: [], /* API call gets made in componentDidMount */
               selectedDate: getTodaysDate(),
               researchTime: 0,
               writingTime: 0,
               customTime: 0,
              };
              this.onDayClicked = this.onDayClicked.bind(this);
        }


        componentDidMount() {
            axios.get(`/user/${ this.state.userId }`)
              .then(res => {
                const apiUser = res.data[0];
                this.setState({ username: apiUser.email, userId: apiUser.id });
              });

            axios.get(`/timer/${ this.state.userId }/${this.state.selectedDate}`)
              .then(res => {
                  this.setState({researchTime: secondsToHms(res.data[0].researchtime), 
                                writingTime: secondsToHms(res.data[0].writingtime), 
                                customTime: secondsToHms(res.data[0].customtime)});
              });
            axios.get(`goals/${ this.state.userId }/${this.state.selectedDate}`)
              .then(res => {
                this.setState({goals: res.data});
              });
        }

        onDayClicked(dayIndex) {
             this.setState({ selectedDate: dayIndex });
            //  alert("please work");
        }
        

    render() {
        return(
            <div>
                <h1>History</h1>
                <Calendar />
                <div className="history-grid-goals">
                    <AllCompleted date={ this.state.selectedDate } goals={ this.state.goals } />
                    <Goals userId={this.state.userId} goals={this.state.goals} date={this.state.selectedDate}/>
                    <Timers />
                </div>
            </div>
        );
    }
}

function getTodaysDate() {
    var d = new Date();
    var year = d.getFullYear().toString();
    var month = (d.getMonth() + 1).toString();
    var day = d.getDate().toString();
    return(year.concat("-", month, "-", day));
}

function fixDate(d) {
    var res = d.split("-");
    return(res[1].concat("/", res[2]));
}
function stripDate(d) {
    var res = d.split("T");
    return(res[0]);
}

// function thisDate(props) {
//   return <div className="history-date">{props.text}</div>;
// }

function formatDate(date){
        var dd = date.getDate();
        var mm = date.getMonth()+1;
        var yyyy = date.getFullYear();
        if(dd<10) {dd='0'+dd}
        if(mm<10) {mm='0'+mm}
        date = yyyy+'-'+mm+'-'+dd;
        return date
     }

function Last7Days () {
        var result = [];
        for (var i=0; i<7; i++) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            result.unshift( formatDate(d) )
        }
    
        return(result);
}


class Calendar extends History {
  render() {
    const listDays = Last7Days().map((date) =>
    <div key={date} className="history-date" onClick={this.onDayClicked}>{fixDate(date)}</div>
    );

    return(
      <div className="history-grid-container">
        {listDays}
      </div>
    );
  }
}

function AllCompleted(props) {
  var l = props.goals;
  var yes =false;
  let date = props.date;
  let fixed = fixDate(date);
  for (const [completed] of props.goals.entries()) {
    if([completed] === true) {
      yes = false;
    }
    else {
        // do nothing
    }
  }
  if(yes === true) {
    return(
      <div className="history-goals-aside">
        <FontAwesomeIcon icon={faCheckCircle} />
        <p>You've completed all of your goals for {fixed}! :)</p>
      </div> 
    );
  }
  else {
    return(
      <div className="history-goals-aside">
        <FontAwesomeIcon icon={faMinusCircle} />
        <p>You did not meet all of your goals for {fixed} :(</p>
      </div> 
    
    );
  }


}

class CheckboxGoals extends History {
    render () {
        const listGoals = this.state.goals.map((goal) =>
       <li key={goal.id}> <input type="checkbox" idname={goal.id} value={goal.id} checked={goal.completed} readOnly /> {goal.goaltext}</li> );
        return(<div className="history-goals">{listGoals}</div>);
    }
}

class Goals extends History {
  render() {
    return(
      <div className="history-goal-list">
        <h2>My Goals</h2>
                <CheckboxGoals selectedDate={this.state.selectedDate} />
      </div>
    );
  }
}

class Timers extends History {

  render() {
    return(
      <div className="history-timers">
        <h2>Timers</h2>
        <ul className="history-timers-list">
            <li>Research: {this.state.researchTime}</li>
            <li>Writing: {this.state.writingTime}</li>
            <li>Custom: {this.state.customTime}</li>
        </ul>
      </div>
    );
  }
}

function secondsToHms(d) {
    d = Number(d);

    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
}



export { History };
