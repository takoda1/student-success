import React, { Component } from 'react';
import './History.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const userId = 1;

class History extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goals: [],
            timers: '',
            reflections: '',
            selectedDate: getTodaysDate(),
            
        };

        this.onDayClicked = this.onDayClicked.bind(this);
    }

    async componentDidMount() {

        const goals = (await axios.get(`/goals/${userId}/${this.state.selectedDate}`)).data;
        const timers = (await axios.get(`/timer/${userId}/${this.state.selectedDate}`)).data[0];
        const reflections = (await axios.get(`/reflection/${userId}/${this.state.selectedDate}`)).data[0];
        this.setState({
            goals,
            timers,
            reflections,
        });
    }

    async onDayClicked(date) {
        this.setState({selectedDate: date});
        const goals = (await axios.get(`/goals/${userId}/${date}`)).data;
        const timers = (await axios.get(`/timer/${userId}/${date}`)).data[0];
        const reflections = (await axios.get(`/reflection/${userId}/${this.state.selectedDate}`)).data[0];



        this.setState({
            timers,
            goals,
            reflections,
        });
    }

    render() {
        return(
            <div>
                <h1>History for {fixDate(this.state.selectedDate)}</h1>
                <Calendar onDayClicked={this.onDayClicked} />
                <div className="history-grid-goals">
                    <Completed goals={this.state.goals} selectedDate={this.state.selectedDate}/>
                    <Goals goals={this.state.goals}/>
                    <Timers timers={this.state.timers}/>
                    <Reflections reflections={this.state.reflections}/>
                </div>
            </div>
        );
    }
}


class Calendar extends Component {
      render() {
        const listDays = Last7Days().map((date) =>
        <div key={date} className="history-date" onClick={() => this.props.onDayClicked(date)}>{fixDate(date)}</div>
        );
    
        return(
          <div className="history-grid-container">
            {listDays}
          </div>
        );
      }
}

class Goals extends Component {
      render() {
        return(
          <div className="history-goal-list">
                <h2>My Goals</h2>
                <CheckboxGoals goals={this.props.goals} />
          </div>
        );
      }
    }

class CheckboxGoals extends Component {
    render () {
        if(this.props.goals.length !== 0){
            const listGoals = this.props.goals.map((goal) =>
            <li key={goal.id}> <input type="checkbox" idname={goal.id} value={goal.id} checked={goal.completed} readOnly /> {goal.goaltext}</li> );
            return(<div className="history-goals">{listGoals}</div>);
        }
        else{
            return(<div className="history-goals">No goals.</div>);
        }
        
    }
}

class Timers extends Component {
      render() {
        if(this.props.timers) {
            return(
                <div className="history-timers">
                    <h2>Timers</h2>
                    <ul className="history-timers-list">
                        <li>Research: {secondsToHms(this.props.timers.researchtime)}</li>
                        <li>Writing: {secondsToHms(this.props.timers.writingtime)}</li>
                        <li>Custom: {secondsToHms(this.props.timers.customtime)}</li>
                    </ul>
                </div>
            );
        }
        else {
            return(
                <div className="history-timers">
                    <h2>Timers</h2>
                    <div className="no-timers">No timers.</div>
                </div>
            );
        }
      }
}

class Reflections extends Component {
    render() {
        if(this.props.reflections){
            return(
                <div className="history-reflections">
                    <h2>Reflection</h2>
                    <p>
                        {this.props.reflections.reflectiontext}
                    </p>
                </div>
            );
        }
        else{
            return(
                <div className="history-reflections">
                    <h2>Reflection</h2>
                    <p>No reflection.</p>
                </div>
            );
        }
        
    }
}

class Completed extends Component {
    render() {
        let date = fixDate(this.props.selectedDate);
        if(this.props.goals.length !== 0){
            const isCompleted = this.props.goals.reduce((memo, goal) => { return memo ? goal.completed : false }, true) ? true : false;
            if(isCompleted=== true) {
                return(
                    <div className="history-goals-aside">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <p>You've completed all of your goals for {date}! :)</p>
                    </div> 
                 );
            }
            else {
                return(
                    <div className="history-goals-aside">
                        <FontAwesomeIcon icon={faMinusCircle} />
                        <p>You did not meet all of your goals for {date} :(</p>
                    </div> 
                );
            }
        }
        else {
            return(
                <div className="history-goals-aside">
                    <div className="history-no-goals">No goals recorded on {date}.</div>
                </div>
            );
        }
        
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


function secondsToHms(d) {
    d = Number(d);

    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
}



export { History };
