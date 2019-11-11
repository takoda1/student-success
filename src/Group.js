import React, { Component } from 'react';
import './Group.css';
import axios from 'axios';
import auth0Client from './Auth';
import Button from 'react-bootstrap/Button';
import { getTodaysDate } from './shared';

const userId = 3;
const today = getTodaysDate();

class Group extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goals: [],
            groupId: 1,
            userIds: []
        };
    }

    async componentDidMount() {
        const goals = (await axios.get(`/goals/${userId}/${today}`)).data;
        this.setState({ goals });
    }

    render() {
        return(
            <div>
                <h1>Today's Shared Goals</h1>
                <GroupGoals />
            </div>
        );
    }
}

class GroupGoals extends Component {
    render() {
        return(
            <div className="group-goals">
                
            </div>
        );
    }
}

class Goal extends Component {

}

export { Group };