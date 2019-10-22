import { Layout, GoalList, Timer } from './shared';
import React from 'react';
import axios from 'axios';
import Moment from 'moment';

const todayDate = Moment().format('YYYY-MM-DD');
const userId = 1;

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            username: '',
            goals: [], /* API call gets made in componentDidMount */
            timers: [], /* API call */
            newGoalText: '',
        };

        this.onGoalTyped = this.onGoalTyped.bind(this);
        this.onGoalSubmitted = this.onGoalSubmitted.bind(this);
        this.onGoalCheck = this.onGoalCheck.bind(this);
        this.onGoalEdited = this.onGoalEdited.bind(this);
        this.onGoalRemoved = this.onGoalRemoved.bind(this);
    }

    async componentDidMount() {
        const user = (await axios.get(`/user/${userId}`)).data[0];
        const goals = (await axios.get(`/goals/${user.id}/${todayDate}`)).data;
        // const timers = (await axios.get(`/timer/${user.id}/${todayDate}`)).data;
        this.setState({ username: user.firstname, goals });
    }

    onGoalCheck() {
        const goals = this.state.goals;
        
        this.setState(() => {
            return { goals };
        });
    }

    onGoalTyped(event) {
        this.setState({ newGoalText: event.target.value });
    }

    async onGoalSubmitted(event) {
        event.preventDefault();
        const user = (await axios.get(`/user/${userId}`)).data[0];
        const newGoal = { userid: user.id, goaldate: todayDate, goaltext: this.state.newGoalText, completed: false };
        console.log(newGoal);
        await axios.post('/goal', newGoal);
        const goals = (await axios.get(`/goals/${user.id}/${todayDate}`)).data;
        this.setState(() => {
            return { goals, newGoalText: '' };
        });
    }

    async onGoalEdited(event, newText, goalId, completed) {
        event.preventDefault();
        const user = (await axios.get(`/user/${userId}`)).data[0];
        const updatedGoal = { goaltext: newText, completed: completed };
        console.log(updatedGoal);
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
    }

    render() {
        return (
            <Layout >
                <h2>Home Page</h2>
                <p>Welcome, {this.state.username}</p>
            <div>
                <Goals goals={this.state.goals} onGoalCheck={this.onGoalCheck} onGoalAdded={this.onGoalSubmitted} onGoalTyped={this.onGoalTyped} onGoalEdited={this.onGoalEdited} onGoalRemoved={this.onGoalRemoved} newGoalText={this.state.newGoalText} />
                <Timers />
            </div>
            </Layout>
        );
    }
}
  
class Goals extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            goalsCompleted: this.props.goals.reduce((memo, goal) => { return memo ? goal.complete : false }, true) ? "Goals completed!" : "Not yet!",
        }
    }

    checkTotalGoals() {
        const goalsCompleted = this.props.goals.reduce((memo, goal) => { return memo ? goal.complete : false }, true) ? "Goals completed!" : "Not yet!";
        console.log(goalsCompleted);
        this.setState(() => {
            return { goalsCompleted };
        });
    }

    render() {
        return (
            <div style={{display: "inline-block", width: '40%', verticalAlign: 'top', marginRight: 35, paddingRight: 15, borderRight: '2px solid #DDD'}}>
                <h3>Today's Goals</h3>
                <GoalList goals={this.props.goals} goalsCompleted={this.state.goalsCompleted} onGoalCheck={this.props.onGoalCheck} checkTotalGoals={this.checkTotalGoals} onGoalAdded={this.props.onGoalAdded} onGoalTyped={this.props.onGoalTyped} onGoalEdited={this.props.onGoalEdited} onGoalRemoved={this.props.onGoalRemoved} newGoalText={this.props.newGoalText} ></GoalList>
            </div>
        );
    }
}
  
class Timers extends React.Component {
    // constructor(props) {
    //     super(props);
    // }

    render() {
        return (
            <div style={{display: "inline-block", width: '40%', verticalAlign: 'top'}}>
                <h3>Timers</h3>
                <Timer name="Study"/>
                <Timer name="Research"/>
                <Timer name="Custom"/>
            </div>
        );
    }
}

export { Home };
