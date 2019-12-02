import React, { Component } from 'react';
import './Group.css';
import axios from 'axios';
import auth0Client from './Auth';
import { getTodaysDate, CheckboxGoals, secondsToHms, delimiter, fixDateWithYear } from './shared';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

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
            selectedView: 'goals',
            hideTimer: this.props.user.hidetimer,
            hidereflection: this.props.user.hidereflection

        };

        this.onMessageTyped = this.onMessageTyped.bind(this);
        this.onMessageSent = this.onMessageSent.bind(this);
        this.onInputSelected = this.onInputSelected.bind(this);
        this.onHideTimers = this.onHideTimers.bind(this);
        this.onHideReflections = this.onHideReflections.bind(this);
    }

    async componentDidMount() {
        const groupUsers = (await axios.get(`/userByGroup/${this.props.user.groupid}`)).data;
        const groupName = (await axios.get(`/grou/${this.props.user.groupid}/`)).data[0].groupname;
        const messages = (await axios.get(`groupchat/${this.props.user.groupid}`)).data;
        const hideTimer = (await axios.get(`user/${this.props.user.id}`)).data[0].hidetimer;
        const hideReflection = (await axios.get(`user/${this.props.user.id}`)).data[0].hidereflection;
        var groupGoals = [];
        var groupTimers = [];
        var groupReflections = [];
        
        for(var i=0; i < groupUsers.length; i++) {
            var thisGoals = (await axios.get(`/goals/${groupUsers[i].id}/${today}`)).data;
            var theseGoals = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, goals: thisGoals};
            groupGoals.push(theseGoals);

            var thisTimers = (await axios.get(`/timer/${groupUsers[i].id}/${today}`)).data;
            var hideThisTimer = (await axios.get(`/user/${groupUsers[i].id}`)).data[0].hidetimer;
            var theseTimers = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, timers: thisTimers, hide: hideThisTimer};
            groupTimers.push(theseTimers);

            var thisReflections = (await axios.get(`/reflection/${groupUsers[i].id}/${today}`)).data;
            var hideThisReflection = (await axios.get(`/user/${groupUsers[i].id}`)).data[0].hidereflection;
            var theseReflections = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, reflections: thisReflections, hide: hideThisReflection};
            groupReflections.push(theseReflections);
        }

        this.setState({ groupGoals, groupTimers, groupReflections, groupName, messages, hideTimer, hideReflection });

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

    async onHideTimers(checked) {
        const getNewHideTimer = (await axios.get(`/user/${this.props.user.id}`)).data[0].hidereflection;
        if(getNewHideTimer === null) {
            var notNull = false;
        }
        else {
            var notNull = getNewHideTimer;
        }
        const editUser = { firstname: this.props.user.firstname, lastname: this.props.user.lastname, email: this.props.user.email, groupid: this.props.user.groupid, hidetimer: checked, hidereflection: notNull, classid: this.props.user.classid}
        await axios.put(`/user/${this.props.user.id}`, editUser);
        this.setState({ hideTimer: checked });
        this.forceUpdate();
    }

    async onHideReflections(checked) {
        const getNewHideTimer = (await axios.get(`/user/${this.props.user.id}`)).data[0].hidetimer;
        if(getNewHideTimer === null) {
            var notNull = false;
        }
        else {
            var notNull = getNewHideTimer;
        }
        const editUser = { firstname: this.props.user.firstname, lastname: this.props.user.lastname, email: this.props.user.email, groupid: this.props.user.groupid, hidetimer: notNull, hidereflection: checked, classid: this.props.user.classid}
        await axios.put(`/user/${this.props.user.id}`, editUser);
        
        this.setState({ hideReflection: checked, hideTimer: getNewHideTimer });
        this.forceUpdate();

    }

    render() {
        return(
            <div className="group-body">
                <div className="shared-goals">
                    <GroupForm onHideTimers={this.onHideTimers} onHideReflections={this.onHideReflections} onInputSelected={this.onInputSelected} hideTimer={this.state.hideTimer} hideReflection={this.state.hideReflection} />
                    <GroupData user={this.props.user} groupGoals={this.state.groupGoals} groupTimers={this.state.groupTimers} groupReflections={this.state.groupReflections} selectedView={this.state.selectedView} groupId={this.props.user.groupid} />
                </div>
                <div className="group-chat">
                    <h2>Group Chat</h2>
                    <GroupMessages user={this.props.user} messages={this.state.messages} />
                    <Form onSubmit={this.onMessageSent}>
                        <InputGroup>
                            <Form.Control type="text" value={this.state.newMessageText} inline="true" onChange={this.onMessageTyped} placeholder="Type your message here" />
                            <Button id="group-chat-button" variant="primary" type="submit" inline="true">Send!</Button>
                        </InputGroup>
                        
                    </Form>
                </div>
            </div>
        );
    }
}

class GroupForm extends Component {
    render() {
        return(
            <Form>
                <Form.Label>What kind of group data would you like to see?</Form.Label>
                <Form.Control className="form-control-select" as="select" onChange={(e) => this.props.onInputSelected(e.target.value)}>
                    <option value={"goals"}>Goals</option>
                    <option value={"timers"}>Timers</option>
                    <option value={"reflections"}>Reflections</option>
                </Form.Control>
                <Form.Check type="checkbox" label="Hide your timers" checked={this.props.hideTimer} onChange={(e) => this.props.onHideTimers(e.target.checked)} />
                <Form.Check type="checkbox" label="Hide your reflections" checked={this.props.hideReflection}  onChange={(e) => this.props.onHideReflections(e.target.checked)} />
            </Form>
        );
    }
}

class GroupData extends Component {

    render() {
        const listUserGoals = this.props.groupGoals.map((user) =>
            <div key={"goals-" + user.userId}><Goals goals={user.goals} userName={user.firstName} /> </div>);

        const listUserTimers = this.props.groupTimers.map((user) =>
            <div key={"timers-" + user.userId}><Timers hide={user.hide} timers={user.timers} userName={user.firstName} /></div>);

        const listUserRefelections = this.props.groupReflections.map((user) =>
            <div key={"reflections-" + user.userId}><Reflections hide={user.hide} reflections={user.reflections} userName={user.firstName} /></div>);
        
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
        if(this.props.timers.length > 0 && this.props.hide !== true) {
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
        else if(this.props.hide === true) {
            return(
                <div className="group-data-item">
                    <h2>{this.props.userName}'s Timers</h2><br/>
                    <div className="no-timers">Has elected to not share their timers.</div>
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
        if(this.props.reflections.length > 0 && this.props.reflections[0].reflectiontext.length > 0 && this.props.reflections[0].reflectiontext !== ")(}){(" && this.props.reflections[0].reflectiontext !== ")(}){()(}){(" && this.props.hide !== true){
            const reflectionSplit = this.props.reflections[0].reflectiontext.split(delimiter);
            return(
                <div className="group-data-item" id="group-reflections">
                    <h2>{this.props.userName}'s Reflection</h2><br/>
                    <ol>
                        <li>{reflectionSplit[0]}</li>
                        <li>{reflectionSplit[1]}</li>
                        <li>{reflectionSplit[2]}</li>
                    </ol>
                </div>
            );
        }
        else if(this.props.hide === true) {
            return(
                <div className="group-data-item" id="group-reflections">
                    <h2>{this.props.userName}'s Reflection</h2><br/>
                    <p>Has elected to not share their reflections with the group.</p>
                </div>
            );
        }
        else{
            return(
                <div className="group-data-item" id="group-reflections">
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