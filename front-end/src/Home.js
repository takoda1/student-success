import { Layout, GoalList, Timer } from './shared';
import React from 'react';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            goals: /* API call */ [{ content: "work", complete: true }],
            timers: /* API call */ '',
        };
    }

    render() {
        return (
            <Layout >
            <h2>Home Page</h2>
            <div>
                <Goals goals={this.state.goals} />
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
            goalsCompleted: this.checkTotalGoals(this.props.goals),
        }
    }

    checkTotalGoals(goals) {
        return goals.reduce((memo, goal) => { return memo ? goal.complete : false }, true) ? "Goals completed!" : "Not yet!";
    }

    render() {
        return (
            <div style={{display: "inline-block", width: '40%', verticalAlign: 'top', marginRight: 35, paddingRight: 15, borderRight: '2px solid #DDD'}}>
                <h3>Today's Goals</h3>
                <GoalList goals={this.props.goals} goalsCompleted={this.state.goalsCompleted} ></GoalList>
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
