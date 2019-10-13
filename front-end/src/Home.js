import { Layout, GoalList, Timer } from './shared';
import React from 'react';
export { Home };

function Home(props) {
    return (
        <Layout >
        <h2>Home Page</h2>
        <div>
            <Goals goals={props.goals}/>
            <Timers />
        </div>
        </Layout>
    );
}
  
function Goals(props) {
    return (
        <div style={{display: "inline-block", width: '40%', 'vertical-align': 'top', 'margin-right': 35, 'padding-right': 15, 'border-right': '2px solid #DDD'}}>
            <h3>Today's Goals</h3>
            <GoalList goals={props.goals}></GoalList>
        </div>
    );
}
  
function Timers(props) {
    return (
        <div style={{display: "inline-block", width: '40%', 'vertical-align': 'top'}}>
            <h3>Timers</h3>
            <Timer name="Study"/>
            <Timer name="Research"/>
            <Timer name="Custom"/>
        </div>
    );
}