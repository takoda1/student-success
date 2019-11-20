import React, { Component } from 'react';
import './Group.css';
import axios from 'axios';
import auth0Client from './Auth';
import { getTodaysDate, CheckboxGoals, secondsToHms, delimiter, fixDateWithYear } from './shared';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const today = getTodaysDate();

class Group extends Component {
    constructor(props) {
        super(props);

        this.state = {
            groupGoals: [],
            groupTimers: [],
            groupReflections: [],
            groupName: '',
            messages: [],
            newMessageText: '',
            selectedView: 'goals'
        };

        this.onMessageTyped = this.onMessageTyped.bind(this);
        this.onMessageSent = this.onMessageSent.bind(this);
        this.onInputSelected = this.onInputSelected.bind(this);
    }

    async componentDidMount() {
        const groupUsers = (await axios.get(`/userByGroup/${this.props.user.groupid}`)).data;
        const groupName = (await axios.get(`/grou/${this.props.user.groupid}/`)).data[0].groupname;
        const messages = (await axios.get(`groupchat/${this.props.user.groupid}`)).data;
        var groupGoals = [];
        var groupTimers = [];
        var groupReflections = [];
        
        for(var i=0; i < groupUsers.length; i++) {
            var thisGoals = (await axios.get(`/goals/${groupUsers[i].id}/${today}`)).data;
            var theseGoals = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, goals: thisGoals};
            groupGoals.push(theseGoals);

            var thisTimers = (await axios.get(`/timer/${groupUsers[i].id}/${today}`)).data;
            var theseTimers = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, timers: thisTimers};
            groupTimers.push(theseTimers);

            var thisReflections = (await axios.get(`/reflection/${groupUsers[i].id}/${today}`)).data;
            var theseReflections = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, reflections: thisReflections};
            groupReflections.push(theseReflections);
        }

        this.setState({ groupGoals, groupTimers, groupReflections, groupName, messages });

        setInterval(() => {
            this.checkNewMessages();
        }, 1000);
    }

    async checkNewMessages() {
        const messages = (await axios.get(`/groupchat/${this.props.user.groupid}`)).data;
        if(messages.length > this.state.messages.length) {
            this.setState({ messages });
        }
        
    }

    onMessageTyped(event) {
        this.setState({ newMessageText: event.target.value });
    }
    async onMessageSent(event) {
        event.preventDefault();
        const newMessage = { groupid: this.props.user.groupid, chattext: this.state.newMessageText, chatdate: today, userid: this.props.user.id, username: this.props.user.firstname };
        await axios.post('/groupchat', newMessage);
        const messages = (await axios.get(`groupchat/${this.props.user.groupid}`)).data;
        this.setState({ messages, newMessageText: '' });
    }

    onInputSelected(value) {
        this.setState({selectedView: value});
    }

    render() {
        return(
            <div className="group-body">
                <div className="shared-goals">
                    <Form>
                        <Form.Label>What kind of group data would you like to see?</Form.Label>
                        <Form.Control className="form-control-select" as="select" onChange={(e) => this.onInputSelected(e.target.value)}>
                            <option value={"goals"}>Goals</option>
                            <option value={"timers"}>Timers</option>
                            <option value={"reflections"}>Reflections</option>
                        </Form.Control>
                    </Form>
                    <br/>
                    <GroupData groupGoals={this.state.groupGoals} groupTimers={this.state.groupTimers} groupReflections={this.state.groupReflections} selectedView={this.state.selectedView} groupId={this.props.user.groupid} />
                </div>
                <div className="group-chat">
                    <h2>Group Chat</h2>
                    <GroupMessages user={this.props.user} messages={this.state.messages} />
                    <Form onSubmit={this.onMessageSent}>
                    <Form.Control type="text" value={this.state.newMessageText} onChange={this.onMessageTyped} placeholder="Type your message here" />
                        <Button variant="primary" type="submit">Send!</Button>
                    </Form>
                </div>
            </div>
        );
    }
}

class GroupData extends Component {

    render() {
        const listUserGoals = this.props.groupGoals.map((user) =>
            <div key={"goals-" + user.userId}><Goals goals={user.goals} userName={user.firstName} /> </div>);

        const listUserTimers = this.props.groupTimers.map((user) =>
            <div key={"timers-" + user.userId}><Timers timers={user.timers} userName={user.firstName} /></div>);

        const listUserRefelections = this.props.groupReflections.map((user) =>
            <div key={"reflections-" + user.userId}><Reflections reflections={user.reflections} userName={user.firstName} /></div>);
        
        const goalsView = (
            <div className="group-data">
                { listUserGoals }
            </div>
        );
        const timersView = (
            <div className="group-data">
                 { listUserTimers }
            </div>
        );

        const reflectionsView = (
            <div className="group-data">
                { listUserRefelections }
            </div>
        )

        if(this.props.selectedView === 'goals') {
            return[
                <h2>Today's Shared Goals for Group {this.props.groupId} </h2>,
                goalsView
            ]
        }
        else if(this.props.selectedView === 'timers') {
            return[
                <h2>Today's Shared Timers for Group {this.props.groupId} </h2>,
                timersView
            ]
        }
        else {
            return[
                <h2>Today's Shared Reflections for Group {this.props.groupId} </h2>,
                reflectionsView
            ]
        }
    }
}


class Goals extends Component {
      render() {
        return(
            <div className="group-data-item">
                <h2>{this.props.userName}'s Goals</h2><br/>
                <CheckboxGoals goals={this.props.goals} />
            </div>
        );
      }
  }

  class Timers extends Component {
      render() {
        if(this.props.timers.length > 0) {
            return(
                <div className="group-data-item">
                    <h2>{this.props.userName}'s Timers</h2><br/>
                    <ul className="history-timers-list">
                        <li>Writing: {secondsToHms(this.props.timers[0].writingtime)}</li>
                        <li>Research: {secondsToHms(this.props.timers[0].researchtime)}</li>
                        <li>Custom: {secondsToHms(this.props.timers[0].customtime)}</li>
                    </ul>
                </div>
            );
        }
        else {
            return(
                <div className="group-data-item">
                    <h2>{this.props.userName}'s Timers</h2><br/>
                    <div className="no-timers">No timers.</div>
                </div>
            );
        }
      }
  }

  class Reflections extends Component {
    render() {
        if(this.props.reflections.length > 0 && this.props.reflections[0].reflectiontext.length > 0 && this.props.reflections[0].reflectiontext != ")(}){("){
            const reflectionSplit = this.props.reflections[0].reflectiontext.split(delimiter);
            
            return(
                <div className="group-data-item">
                    <h2>{this.props.userName}'s Reflection</h2><br/>
                    <ol>
                        <li>{reflectionSplit[0]}</li>
                        <li>{reflectionSplit[1]}</li>
                        <li>{reflectionSplit[2]}</li>
                    </ol>
                </div>
            );
        }
        else{
            return(
                <div className="group-data-item">
                    <h2>{this.props.userName}'s Reflection</h2><br/>
                    <p>No reflection.</p>
                </div>
            );
        }
        
    }
  }

class GroupMessages extends Component {
    componentDidUpdate() {
        const messagesDiv = document.getElementById('group-messages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    render() {

        var dates = [];
        const listGroupMessages = this.props.messages.map((msg) =>
            <div>
                <span className="message-date"><b>{!dates.includes(msg.chatdate)? (dates.push(msg.chatdate), fixDateWithYear(msg.chatdate)) : false}</b></span> 
                <div className="group-message" key={msg.id}><b>{msg.username}</b>: {msg.chattext} </div>
            </div>);
        return(
            <div className="group-messages" id="group-messages">
                { listGroupMessages }
            </div>
        );
    }
}



export { Group };