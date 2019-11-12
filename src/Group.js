import React, { Component } from 'react';
import './Group.css';
import axios from 'axios';
import auth0Client from './Auth';
import { getTodaysDate, CheckboxGoals } from './shared';
import { relativeTimeRounding } from 'moment';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

const today = getTodaysDate();

class Group extends Component {
    constructor(props) {
        super(props);

        this.state = {
            groupGoals: [],
            groupName: '',
            messages: [],
            newMessageText: ''
        };

        this.onMessageTyped = this.onMessageTyped.bind(this);
        this.onMessageSent = this.onMessageSent.bind(this);
    }

    async componentDidMount() {
        const groupUsers = (await axios.get(`/userByGroup/${this.props.user.groupid}`)).data;
        const groupName = (await axios.get(`/grou/${this.props.user.groupid}/`)).data[0].groupname;
        const messages = (await axios.get(`groupchat/${this.props.user.groupid}`)).data;
        var groupGoals = [];
        
        for(var i=0; i < groupUsers.length; i++) {
            var thisGoals = (await axios.get(`/goals/${groupUsers[i].id}/${today}`)).data;
            var theseGoals = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, goals: thisGoals};
            groupGoals.push(theseGoals);
        }
        this.setState({ groupGoals, groupName, messages });
    }

    onMessageTyped(event) {
        this.setState({ newMessageText: event.target.value });
    }
    async onMessageSent(event) {
        console.log(this.props.user.groupid);
        event.preventDefault();
        const newMessage = { groupid: 1, chattext: this.state.newMessageText, chatdate: today, userid: this.props.user.id, username: this.props.user.firstname };
        await axios.post('/groupchat', newMessage);
        const messages = (await axios.get(`groupchat/${this.props.user.groupid}`)).data;
        this.setState({ messages, newMessageText: '' });
    }

    render() {
        return(
            <div className="group-body">
                <div className="shared-goals">
                    <h2>Today's Shared Goals for Group {this.props.user.groupid} </h2>
                    <GroupGoals groupGoals={this.state.groupGoals}/>
                </div>
                <div className="group-chat">
                    <h2>Group Chat</h2>
                    <GroupMessages user={this.props.user} messages={this.state.messages} />
                    <Form onSubmit={this.onMessageSent}>
                    <Form.Control type="text" value={this.state.newMessageText} onChange={this.onMessageTyped} placeholder="Type your message here" />
                        <Button variant="primary" type="submit">Send!</Button>
                    </Form>
                    {/* <ChatTextBox user={this.props.user} onMessageTyped={this.onMessageTyped} /> */}
                </div>
            </div>
        );
    }
}

class GroupGoals extends Component {
    render() {
        const listUserGoals = this.props.groupGoals.map((user) =>
            <div className="group-goals-grid" key={user.userId}>
            <Goals goals={user.goals} userName={user.firstName} /> </div>);
        return(
            <div className="group-goals">
                { listUserGoals }
            </div>
        );
    }
}


class Goals extends Component {
      render() {
        return(
            <div className="group-goal-list">
                <h2>{this.props.userName}'s Goals</h2><br/>
                <CheckboxGoals goals={this.props.goals} />
            </div>
        );
      }
  }

class GroupMessages extends Component {
    constructor(props) {
        super(props);

    }
    render() {
        const listGroupMessages = this.props.messages.map((msg) =>
            <div className="group-message" key={msg.id}>{msg.username}: {msg.chattext} </div>);
        return(
            <div className="group-messages">
                { listGroupMessages }
            </div>
        );
    }
}

class ChatTextBox extends Component {
    constructor(props) {
        
        super(props);
        this.state = {
            userId: 1,
            newMessage: ''
        }

        this.onMessageSent = this.onMessageSent.bind(this);
    }

    async onMessageSent(event) {
        event.preventDefault();
        await axios.post(`/groupchat`, {groupid: this.props.user.groupid, chattext: event.target.value, chatdate: today, userid: this.props.user.id, username: this.props.user.firstName});
    }

    render() {
        return(
            <div>
                <Form>
                    <Form.Control type="text" value={this.props.newMessage} onChange={this.props.onMessageTyped} placeholder="Type your message here" />
                    <Button variant="primary" type="submit">Send!</Button>
                </Form>
            </div>
        );
    }
}


export { Group };