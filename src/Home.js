import { Layout, GoalList, secondsToHms } from './shared';
import React from 'react';
import axios from 'axios';
import Moment from 'moment';
import "./Home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';

const todayDate = Moment().format('YYYY-MM-DD');
const userId = 1;

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            goals: [], /* API call gets made in componentDidMount */
            newGoalText: '',
            goalsCompleted: "Loading...",
        };

        this.checkTotalGoals = this.checkTotalGoals.bind(this);
        this.onGoalTyped = this.onGoalTyped.bind(this);
        this.onGoalSubmitted = this.onGoalSubmitted.bind(this);
        this.onGoalCheck = this.onGoalCheck.bind(this);
        this.onGoalEdited = this.onGoalEdited.bind(this);
        this.onGoalRemoved = this.onGoalRemoved.bind(this);
    }

    async componentDidMount() {
        const user = (await axios.get(`/user/${userId}`)).data[0];
        const goals = (await axios.get(`/goals/${user.id}/${todayDate}`)).data;
        this.setState({ username: user.firstname, goals });
        this.checkTotalGoals();
    }

    checkTotalGoals() {
        const goalsCompleted = this.state.goals.reduce((memo, goal) => { return memo ? goal.completed : false }, true) ?
            (
                <div>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <p style={{ display:"inline-block" }}> You've completed all of your goals for today! :) </p> 
                </div>
             
            ) :
            (
                <div>
                    <FontAwesomeIcon icon={faMinusCircle} />
                    <p style={{ display:"inline-block" }}> You haven't completed your goals yet, keep it up! </p> 
                </div>
            
            );

        this.setState(() => {
            return { goalsCompleted };
        });
    }

    async onGoalCheck(completed, goal) {
        const user = (await axios.get(`/user/${userId}`)).data[0];
        const updatedGoal = { goaltext: goal.goaltext, completed };
        await axios.put(`/goal/${goal.id}`, updatedGoal);
        const goals = (await axios.get(`/goals/${user.id}/${todayDate}`)).data;

        this.setState(() => {
            return { goals };
        });

        this.checkTotalGoals();
    }

    onGoalTyped(event) {
        this.setState({ newGoalText: event.target.value });
    }

    async onGoalSubmitted(event) {
        event.preventDefault();
        const user = (await axios.get(`/user/${userId}`)).data[0];
        const newGoal = { userid: user.id, goaldate: todayDate, goaltext: this.state.newGoalText, completed: false };
        await axios.post('/goal', newGoal);
        const goals = (await axios.get(`/goals/${user.id}/${todayDate}`)).data;
        this.setState(() => {
            return { goals, newGoalText: '' };
        });
        this.checkTotalGoals();
    }

    async onGoalEdited(event, newText, goalId, completed) {
        event.preventDefault();
        const user = (await axios.get(`/user/${userId}`)).data[0];
        const updatedGoal = { goaltext: newText, completed: completed };
        await axios.put(`/goal/${goalId}`, updatedGoal);
        const goals = (await axios.get(`/goals/${user.id}/${todayDate}`)).data;
        this.setState(() => {
            return { goals };
        });
    }

    async onGoalRemoved(goalId) {
        event.preventDefault();
        const user = (await axios.get(`/user/${userId}`)).data[0];
        await axios.delete(`/goal/${goalId}`);
        const goals = (await axios.get(`/goals/${user.id}/${todayDate}`)).data;
        this.setState(() => {
            return { goals };
        });
        this.checkTotalGoals();
    }

    render() {
        return (
            <Layout >
                <h2>Home Page</h2>
                <p>Welcome, {this.state.username}</p>
                <div>
                    <Goals goals={this.state.goals} goalsCompleted={this.state.goalsCompleted} onGoalCheck={this.onGoalCheck} onGoalAdded={this.onGoalSubmitted} onGoalTyped={this.onGoalTyped} onGoalEdited={this.onGoalEdited} onGoalRemoved={this.onGoalRemoved} newGoalText={this.state.newGoalText} />
                    <Timers />
                </div>
                <Reflections />
            </Layout>
        );
    }
}

class Goals extends React.Component {
    render() {
        return (
            <div style={{ display: "inline-block", width: '50%', verticalAlign: 'top'}}>
                <h3>Today's Goals</h3>
                <div style={{ marginRight: 15, paddingRight: 25, borderRight: '2px solid #DDD' }}>
                    <GoalList goals={this.props.goals} goalsCompleted={this.props.goalsCompleted} onGoalCheck={this.props.onGoalCheck} checkTotalGoals={this.props.checkTotalGoals} onGoalAdded={this.props.onGoalAdded} onGoalTyped={this.props.onGoalTyped} onGoalEdited={this.props.onGoalEdited} onGoalRemoved={this.props.onGoalRemoved} newGoalText={this.props.newGoalText} ></GoalList>
                </div>
            </div>
        );
    }
}

class Timers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            timers: {}, /* API call */
            customName: "Custom"
        }

        this.updateTimers = this.updateTimers.bind(this);
    }

    async componentDidMount() {
        const user = (await axios.get(`/user/${userId}`)).data[0];
        const timers = (await axios.get(`/timer/${user.id}/${todayDate}`)).data[0];
        this.setState({ timers });
    }

    async updateTimers(time, category) {
        const user = (await axios.get(`/user/${userId}`)).data[0];
        const which = `${category}time`;
        const timerTemplate = this.state.timers ? 
            { writingtime: this.state.timers.writingtime, researchtime: this.state.timers.researchtime, customtime: this.state.timers.customtime } :
            { writingtime: 0, researchtime: 0, customtime: 0 };
        timerTemplate[which] += time;

        if (this.state.timers) {
            await axios.put(`/timer/${this.state.timers.id}`, { ...timerTemplate });
        } else {
            await axios.post(`/timer`, {...timerTemplate, userid: user.id, timerdate: todayDate });
        }

        const timers = (await axios.get(`/timer/${user.id}/${todayDate}`)).data[0];
        this.setState({ timers })
    }

    render() {
        const ready = this.state.timers;

        return (
            <div style={{ display: "inline-block", width: '40%', verticalAlign: 'top' }}>
                <div>
                    <h3 style={{ display: "inline-block", width: '60%', marginRight: 15, paddingRight: 25 }} >Timers</h3>
                    <h3 style={{ display: "inline-block", width: '30%' }} >Today's Times</h3>
                </div>
                <div>
                    <div className="timers-list" style={{ display: "inline-block", width: '60%', verticalAlign: 'top', marginRight: 15, paddingRight: 25, borderRight: '2px solid #DDD'  }}>
                        <Timer name="Writing" updateTimers={this.updateTimers} category="writing" />
                        <Timer name="Research" updateTimers={this.updateTimers} category="research" />
                        <Timer name={this.state.customName} updateTimers={this.updateTimers} category="custom" />
                    </div>
                    <div style={{ display: "inline-block", width: '30%', verticalAlign: 'top' }}>
                        <table className="timers-table">
                            <tbody>
                                <tr>
                                    <th>Writing</th>
                                    <td>{ready ? secondsToHms(this.state.timers.writingtime) : secondsToHms(0) }</td>
                                </tr>
                                <tr>
                                    <th>Research</th>
                                    <td>{ready ? secondsToHms(this.state.timers.researchtime) : secondsToHms(0) }</td>
                                </tr>
                                <tr>
                                    <th>Custom</th>
                                    <td>{ready ? secondsToHms(this.state.timers.customtime) : secondsToHms(0) }</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: 0,
            goal: 30 * 60,
            start: 0,
            editing: false,
            active: false
        }

        this.startTimer = this.startTimer.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
        this.resetTimer = this.resetTimer.bind(this);
        this.timerFinished = this.timerFinished.bind(this);
    }

    startTimer() {
        clearInterval(this.timer);
        this.setState({
            time: this.state.time,
            start: Math.floor(Date.now()/1e3) - this.state.time,
            active: true
        });
        this.timer = setInterval(() => {
            this.setState({
                time: Math.floor(Date.now()/1e3) - this.state.start
            });
            if (this.state.time >= this.state.goal) {
                this.stopTimer();
                this.timerFinished();
            }
        }, 100);
    }

    stopTimer() {
        clearInterval(this.timer);
        this.setState({ active: false });
    }

    resetTimer() {
        this.stopTimer();
        this.props.updateTimers(this.state.time, this.props.category);
        this.setState({ time: 0 })
    }

    async timerFinished() {
        alert("Time complete!");
        this.resetTimer();
    }

    render() {
        const editMode = (
            <form onSubmit={() => this.setState({ editing: false })}>
                <p>
                    Enter Time in Minutes:
                    <input type="number" step="1" value={this.state.goal / 60 } onChange={(event) => this.setState({ goal: event.target.value * 60 })} />
                </p>
                <button>Save</button>
            </form>
        );

        const startB = this.state.active ? null : (<button onClick={this.startTimer}>start</button>);
        const stopB = this.state.active ? (<button onClick={this.stopTimer}>stop</button>) : null;
        const resetB = this.state.active ? null : (<button onClick={this.resetTimer}>reset</button>);
        const editB = this.state.active ? null : (<button onClick={() => this.setState({ editing: true })}>Enter Time</button>);

        const viewMode = (
            <div>
                <p style={{ display: 'inline-block', width: '45%' }}>
                    {this.props.name}: {secondsToHms(Math.floor((this.state.goal - this.state.time)))}
                </p>
                <div style={{ display: 'inline-block' }}>
                    {startB}
                    {stopB}
                    {resetB}
                    {" "}
                    {editB}
                </div>
            </div>
        );

        return (
            <div className="timers">
                {this.state.editing ? editMode : viewMode }
            </div>
        );
    }
}

class Reflections extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            reflection: {},
            reflectionText: "",
            editing: false,
            doneToday: true,
        }

        this.onReflectionSubmitted = this.onReflectionSubmitted.bind(this);
    }

    async componentDidMount() {
        const user = (await axios.get(`/user/${userId}`)).data[0];
        const reflection = (await axios.get(`/reflection/${user.id}/${todayDate}`)).data[0];
        if (reflection) {
            this.setState({ reflection, doneToday: true, reflectionText: reflection.reflectiontext });
        } else {
            this.setState({ doneToday: false });
        }
    }

    async onReflectionSubmitted(event) {
        event.preventDefault();
        const user = (await axios.get(`/user/${userId}`)).data[0];
        if (this.state.doneToday) {
            await axios.put(`/reflection/${this.state.reflection.id}`, { reflectiontext: this.state.reflectionText });
        } else {
            await axios.post(`/reflection`, { userid: user.id, reflectiondate: todayDate, reflectiontext: this.state.reflectionText });
            this.setState({ doneToday: true });
        }

        const reflection = (await axios.get(`/reflection/${user.id}/${todayDate}`)).data[0];
        this.setState({ reflection, editing: false });
    }

    render() {
        const viewMode = (
            <div className="reflections">
                <p>
                    {this.state.reflectionText}
                </p>
                <button className="edit" onClick={() => this.setState({ editing: !this.state.editing })}>Edit</button>
            </div>
        );

        const editMode = (
            <form className="editReflection" onSubmit={this.onReflectionSubmitted}>
                <div className="reflections">
                    <input value={this.state.reflectionText} onChange={(event) => this.setState({ reflectionText: event.target.value })} />
                </div>
                <button>Submit</button>
            </form>
        );

        return (
            <div>
                <h3>Today's Reflections</h3>
                {this.state.editing ? editMode : viewMode}
            </div>
        );
    }
}

export { Home };
