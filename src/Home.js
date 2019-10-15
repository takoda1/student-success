import { Layout, GoalList, Timer } from './shared';
import React from 'react';
import axios from 'axios';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            username: '',
            goals: /* API call */ [{ userId: 0, goalDate: "2019-01-11", goalText: "Custom Goal #1", completed: false }, { userId: 0, goalDate: "2019-01-11", goalText: "Write/Research for 30 minutes", completed: false }],
            timers: /* API call */ '',
        };

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        axios.get('/users')
            .then(response => this.setState({ username: response.data[0].firstname }))
    }

    onGoalChange() {
        const goals = this.state.goals;
        for (const g of goals) {
            if (g.goalText === g.goalText) {
                g.complete = !g.complete;
                break;
            }
        }
        this.setState(() => {
            return { goals };
        });
    }

    render() {
        return (
            <Layout >
                <h2>Home Page</h2>
                <button className='button' onClick={this.handleClick}>Click Me</button>
                <p>{this.state.username}</p>
            <div>
                <Goals goals={this.state.goals} onGoalChange={this.onGoalChange} />
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

    checkTotalGoals(goals) {
        const goalsCompleted = goals.reduce((memo, goal) => { return memo ? goal.complete : false }, true) ? "Goals completed!" : "Not yet!";
        console.log(goalsCompleted);
        this.setState(() => {
            return { goalsCompleted };
        });
    }

    render() {
        return (
            <div style={{display: "inline-block", width: '40%', verticalAlign: 'top', marginRight: 35, paddingRight: 15, borderRight: '2px solid #DDD'}}>
                <h3>Today's Goals</h3>
                <GoalList goals={this.props.goals} goalsCompleted={this.state.goalsCompleted} onGoalChange={this.props.handleGoalCheck} checkTotalGoals={this.checkTotalGoals} ></GoalList>
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
