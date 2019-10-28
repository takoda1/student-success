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
        const timers = (await axios.get(`/timer/${user.id}/${todayDate}`)).data;
        this.setState({ username: user.firstname, goals, timers });
        this.checkTotalGoals();
    }

    checkTotalGoals() {
        const goalsCompleted = this.state.goals.reduce((memo, goal) => { return memo ? goal.completed : false }, true) ? "Goals completed!" : "Not yet!";
        this.setState(() => {
            return { goalsCompleted };
        });
    }

    async onGoalCheck(completed, goal) {
        const user = (await axios.get(`/user/${userId}`)).data[0];
        const updatedGoal = { goaltext: goal.goaltext, completed };
        console.log(updatedGoal);
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
            <div style={{display: "inline-block", width: '40%', verticalAlign: 'top', marginRight: 35, paddingRight: 15, borderRight: '2px solid #DDD'}}>
                <h3>Today's Goals</h3>
                <GoalList goals={this.props.goals} goalsCompleted={this.props.goalsCompleted} onGoalCheck={this.props.onGoalCheck} checkTotalGoals={this.props.checkTotalGoals} onGoalAdded={this.props.onGoalAdded} onGoalTyped={this.props.onGoalTyped} onGoalEdited={this.props.onGoalEdited} onGoalRemoved={this.props.onGoalRemoved} newGoalText={this.props.newGoalText} ></GoalList>
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
            <p>
                {this.state.reflectionText}
                <button className="edit" onClick={() => this.setState({ editing: !this.state.editing }) }>Edit</button>
            </p>
        );

        const editMode = (
            <form className="editReflection" onSubmit={this.onReflectionSubmitted}>
                <input value={this.state.reflectionText} onChange={(event) => this.setState({ reflectionText: event.target.value })} />
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
