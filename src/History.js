import React, { Component } from 'react';
import './History.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMinusCircle, faCaretRight, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const userId = 1;
const today = new Date();

class History extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goals: [],
            timers: '',
            reflections: '',
            selectedDate: getTodaysDate(),
            week: getCurrentWeek(today),
            
        };

        this.onDayClicked = this.onDayClicked.bind(this);
        this.onArrowClicked = this.onArrowClicked.bind(this);
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
        console.log(this.state.selectedDate);
    }

    async onDayClicked(date) {
        console.log(date);
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

    async onArrowClicked(next) {
        if(next) {
            let d = new Date(this.state.week[6]);
            d.setDate(d.getDate() + 8);
            this.setState({week: Last7Days(d)});
            // this.setState({week: getCurrentWeek(d)});
        }
        else {
            let d = new Date(this.state.week[0]);
            d.setDate(d.getDate());
            this.setState({week: Last7Days(d)});
            // this.setState({week: getCurrentWeek(d)});
        }
        
    }

    render() {
        return(
            <div>
                    <div>
                        <h1>History for {fixDateWithYear(this.state.selectedDate)}</h1>
                        <Calendar week={this.state.week} onDayClicked={this.onDayClicked} onArrowClicked={this.onArrowClicked} />
                        <div className="history-grid-goals">
                            <Completed goals={this.state.goals} selectedDate={this.state.selectedDate} />
                            <Goals goals={this.state.goals} />
                            <Timers timers={this.state.timers} />
                            <Reflections reflections={this.state.reflections} />
                        </div>
                    </div>
            </div>
        );
    }
}

class Calendar extends Component {
      render() {
        const listDays = this.props.week.map((date) =>
        <button key={date} className="history-date" onClick={() => this.props.onDayClicked(date)}>{getDayofWeek(date)} <br></br>{fixDate(date)}</button>
        );
    
        return(
            <div className="history-grid-container">
                <FontAwesomeIcon icon={faCaretLeft} onClick={() => this.props.onArrowClicked(false)} />
                {listDays}
                <FontAwesomeIcon icon={faCaretRight} onClick={() => this.props.onArrowClicked(true)} />
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
                        <li>Writing: {secondsToHms(this.props.timers.writingtime)}</li>
                        <li>Research: {secondsToHms(this.props.timers.researchtime)}</li>
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

// Functions

function getTodaysDate() {
    var d = new Date();
    var year = d.getFullYear().toString();
    var month = (d.getMonth() + 1);
    var day = d.getDate();
    if(month < 10) {
        month = '0' + month;
    }
    if(day < 10) {
        day = '0' + day;
    }
    return(year.concat("-", month, "-", day));
}

function fixDate(d) {
    var res = d.split("-");
    return(res[1].concat("/", res[2]));
}

function fixDateWithYear(d) {
    var res = d.split("-");
    return(res[1].concat("/", res[2], "/", res[0]));
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

function Last7Days (date) {
        var result = [];
        for (var i=0; i<7; i++) {
            var d = new Date(date);
            d.setDate(d.getDate() - i);
            result.unshift( formatDate(d) )
        }
    
        return(result);
}

function getDayofWeek(date) {
    let d = new Date(date);
    var n = d.getDay();
    console.log(n.getDay);

    var mapDays = new Map([[6, "Sunday"], [0, "Monday"], [1, "Tuesday"], [2, "Wednesday"], [3, "Thursday"], [4, "Friday"], [5, "Saturday"]]);
    return(mapDays.get(n));
}

function getCurrentWeek(d) {
    let curr = new Date(d); 
    let week = []

    for (let i = 0; i <= 6; i++) {
        let first = curr.getDate() - curr.getDay() + i;
        let day = new Date(curr.setDate(first)).toISOString().slice(0, 10)
        week.push(day)
    }
    return(week);
}

function secondsToHms(d) {
    d = Number(d);

    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
}

export { History };
