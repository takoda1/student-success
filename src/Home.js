import { Layout, GoalList, Timer } from './shared';
import React from 'react';
import axios from 'axios';

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            username: '',
            goals: [], /* API call gets made in componentDidMount */
            timers: /* API call */ '',
            newGoalText: '',
        };

        this.handleClick = this.handleClick.bind(this);
        this.onGoalTyped = this.onGoalTyped.bind(this);
        this.onGoalSubmitted = this.onGoalSubmitted.bind(this);
        this.onGoalCheck = this.onGoalCheck.bind(this);
    }

    async componentDidMount() {
        const user = (await axios.get(`/user/${1}`)).data[0];
        const goals = (await axios.get(`/goals/${user.id}/${"2019-09-14"}`)).data;
        this.setState({ goals });
    }

    handleClick() {
        axios.get('/users')
            .then(response => this.setState({ username: response.data[0].firstname }));
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
        const user = (await axios.get(`/user/${1}`)).data[0];
        const newGoal = { userId: user.id, goalDate: "2019-09-14", goalText: this.state.newGoalText, completed: false };
        await axios.post('/goal', newGoal);
        const goals = (await axios.get(`/goals/${user.id}/${"2019-09-14"}`)).data;
        this.setState(() => {
            return { goals, newGoalText: '' };
        });
    }

    render() {
        return (
            <Layout >
                <h2>Home Page</h2>
                <button className='button' onClick={this.handleClick}>Click Me</button>
                <p>{this.state.username}</p>
            <div>
                <Goals goals={this.state.goals} onGoalCheck={this.onGoalCheck} onGoalAdded={this.onGoalSubmitted} onGoalTyped={this.onGoalTyped} newGoalText={this.state.newGoalText} />
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
                <GoalList goals={this.props.goals} goalsCompleted={this.state.goalsCompleted} onGoalCheck={this.props.onGoalCheck} checkTotalGoals={this.checkTotalGoals} onGoalAdded={this.props.onGoalAdded} onGoalTyped={this.props.onGoalTyped} newGoalText={this.props.newGoalText} ></GoalList>
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
