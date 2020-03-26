import React, { Component } from 'react';
import './Group.css';
import axios from 'axios';
import auth0Client from './Auth';
import { CheckboxGoals, secondsToHms, delimiter, fixDateWithYear } from './shared';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import DatePicker from "react-datepicker";
import Moment from 'moment';


const today = Moment().format('YYYY-MM-DD');

const newDate = new Date();

class Group extends Component {
    constructor(props) {
        super(props);

        this.state = {
            groupGoals: [],
            groupTimers: [],
            groupReflections: [],
            groupLinks: [],
            groupLinksApi: [],
            groupWeeklyGoals: [],
            groupName: '',
            messages: [],
            newMessageText: '',
            selectedView: 'goals',
            hideTimer: this.props.user.hidetimer,
            hidereflection: this.props.user.hidereflection,
            selectedDate: newDate,
            selectedMomentDate: today

        };

        this.onMessageTyped = this.onMessageTyped.bind(this);
        this.onMessageSent = this.onMessageSent.bind(this);
        this.onInputSelected = this.onInputSelected.bind(this);
        this.onHideTimers = this.onHideTimers.bind(this);
        this.onHideReflections = this.onHideReflections.bind(this);

        this.onDateChanged = this.onDateChanged.bind(this);
    }

    async componentDidMount() {
        const groupUsers = (await axios.get(`/userByGroup/${this.props.user.groupid}`)).data;
        const groupName = (await axios.get(`/grou/${this.props.user.groupid}/`)).data[0].groupname;
        const messages = (await axios.get(`groupchat/${this.props.user.groupid}`)).data;
        const hideTimer = (await axios.get(`user/${this.props.user.id}`)).data[0].hidetimer;
        const hideReflection = (await axios.get(`user/${this.props.user.id}`)).data[0].hidereflection;
        const groupLinksApi = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
        var groupGoals = [];
        var groupTimers = [];
        var groupReflections = [];
        var groupLinks = [];
        var groupWeeklyGoals = [];

        window.gtag('event', 'Page View', {
            'event_category': 'Group',
            'event_label': `${this.props.user.lastname}, ${this.props.user.firstname}`,
        });
        
        for(var i=0; i < groupUsers.length; i++) {
            var thisGoals = (await axios.get(`/goals/${groupUsers[i].id}/${this.state.selectedMomentDate}`)).data;
            for (const goal of thisGoals) {
                const subgoals = (await axios.get(`/subgoalByParent/${goal.id}`)).data;
                console.log(subgoals);
                goal.subgoals = subgoals;
            }
            var theseGoals = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, lastName: groupUsers[i].lastname, goals: thisGoals};
            groupGoals.push(theseGoals);

            var thisWeeklyGoals = (await axios.get(`/weeklyGoals/${groupUsers[i].id}`)).data;
            const filteredWeeklyGoals = thisWeeklyGoals.filter(goal => (Moment(goal.completedate).format("YYYY-MM-DD") === "2100-01-01" || Moment(goal.completedate).format("YYYY-MM-DD") === this.state.selectedMomentDate));
            var theseWeeklyGoals = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, lastName: groupUsers[i].lastname, weeklyGoals: filteredWeeklyGoals};
            groupWeeklyGoals.push(theseWeeklyGoals);

            var thisTimers = (await axios.get(`/timer/${groupUsers[i].id}/${this.state.selectedMomentDate}`)).data;
            var thisCustomTimers = (await axios.get(`/customTimer/${groupUsers[i].id}/${this.state.selectedMomentDate}`)).data;
            var distinctCustomNames = (await axios.get(`/customTimerByUser/${groupUsers[i].id}`)).data;
            var hideThisTimer = (await axios.get(`/user/${groupUsers[i].id}`)).data[0].hidetimer;
            var theseTimers = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, lastName: groupUsers[i].lastname, timers: thisTimers, customTimers: thisCustomTimers, distinctCustomNames: distinctCustomNames, hide: hideThisTimer};
            groupTimers.push(theseTimers);

            var thisReflections = (await axios.get(`/reflection/${groupUsers[i].id}/${this.state.selectedMomentDate}`)).data;
            var hideThisReflection = (await axios.get(`/user/${groupUsers[i].id}`)).data[0].hidereflection;
            var theseReflections = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, lastName: groupUsers[i].lastname, reflections: thisReflections, hide: hideThisReflection};
            groupReflections.push(theseReflections);

            var thisLink = groupLinksApi.filter((link) => link.userid === groupUsers[i].id);
            var thisNewLink = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, lastName: groupUsers[i].lastname, links: thisLink}
            groupLinks.push(thisNewLink);

            // var thisCustomTimers = (await axios.get(`/customTimer/${groupUsers[i].id}/${this.state.selectedMomentDate}`)).data;
            // var theseCustomTimers = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, lastName: groupUsers[i].lastname, customTimers: thisCustomTimers, hide: hideThisTimer};
            // groupCustomTimers.push(theseCustomTimers);
        }


        this.setState({ groupGoals, groupTimers, groupReflections, groupLinksApi, groupLinks, groupWeeklyGoals, groupName, messages, hideTimer, hideReflection });

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
        if(this.state.newMessageText !== '') {
            const newMessage = { groupid: this.props.user.groupid, chattext: this.state.newMessageText, chatdate: today, userid: this.props.user.id, username: this.props.user.firstname };
            await axios.post('/groupchat', newMessage);
            const messages = (await axios.get(`groupchat/${this.props.user.groupid}`)).data;
            this.setState({ messages, newMessageText: '' });
        }
        
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
        const editUser = { firstname: this.props.user.firstname, lastname: this.props.user.lastname, email: this.props.user.email, groupid: this.props.user.groupid, hidetimer: checked, hidereflection: notNull, classid: this.props.user.classid};
        await axios.put(`/user/${this.props.user.id}`, editUser);

        var groupTimers = this.state.groupTimers.map((user) => {
            if(user.userId === this.props.user.id) {
                user.hide = checked;
            }
            return user;
        })

        this.setState({ hideTimer: checked, groupTimers });
    }

    async onHideReflections(checked) {
        const getNewHideTimer = (await axios.get(`/user/${this.props.user.id}`)).data[0].hidetimer;
        if(getNewHideTimer === null) {
            var notNull = false;
        }
        else {
            var notNull = getNewHideTimer;
        }
        const editUser = { firstname: this.props.user.firstname, lastname: this.props.user.lastname, email: this.props.user.email, groupid: this.props.user.groupid, hidetimer: notNull, hidereflection: checked, classid: this.props.user.classid};
        await axios.put(`/user/${this.props.user.id}`, editUser);

        var groupReflections = this.state.groupReflections.map((user) => {
            if(user.userId === this.props.user.id) {
                user.hide = checked;
            }
            return user;
        });
        
        this.setState({ hideReflection: checked, hideTimer: getNewHideTimer, groupReflections });

    }

    async onDateChanged(date) {
        const selectedMomentDate = Moment(date).format('YYYY-MM-DD');
        this.setState({selectedMomentDate, selectedDate: date});

        const groupUsers = (await axios.get(`/userByGroup/${this.props.user.groupid}`)).data;

        var groupGoals = [];
        var groupTimers = [];
        var groupReflections = [];
        var groupWeeklyGoals = [];
        var groupCustomTimers = [];

        for(var i=0; i < groupUsers.length; i++) {
            var thisGoals = (await axios.get(`/goals/${groupUsers[i].id}/${selectedMomentDate}`)).data;
            for (const goal of thisGoals) {
                const subgoals = (await axios.get(`/subgoalByParent/${goal.id}`)).data;
                console.log(subgoals);
                goal.subgoals = subgoals;
            } 
            var theseGoals = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, lastName: groupUsers[i].lastname, goals: thisGoals};
            groupGoals.push(theseGoals);

            var thisWeeklyGoals = (await axios.get(`/weeklyGoals/${groupUsers[i].id}`)).data;
            const filteredWeeklyGoals = thisWeeklyGoals.filter(goal => (Moment(goal.completedate).format("YYYY-MM-DD") === "2100-01-01" || Moment(goal.completedate).format("YYYY-MM-DD") === this.state.selectedMomentDate));
            var theseWeeklyGoals = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, lastName: groupUsers[i].lastname, weeklyGoals: filteredWeeklyGoals};
            groupWeeklyGoals.push(theseWeeklyGoals);

            var thisTimers = (await axios.get(`/timer/${groupUsers[i].id}/${selectedMomentDate}`)).data;
            var thisCustomTimers = (await axios.get(`/customTimer/${groupUsers[i].id}/${this.state.selectedMomentDate}`)).data;
            var distinctCustomNames = (await axios.get(`/customTimerByUser/${groupUsers[i].id}`)).data;
            var hideThisTimer = (await axios.get(`/user/${groupUsers[i].id}`)).data[0].hidetimer;
            var theseTimers = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, lastName: groupUsers[i].lastname, timers: thisTimers, customTimers: thisCustomTimers, distinctCustomNames: distinctCustomNames, hide: hideThisTimer};
            groupTimers.push(theseTimers);

            var thisReflections = (await axios.get(`/reflection/${groupUsers[i].id}/${selectedMomentDate}`)).data;
            var hideThisReflection = (await axios.get(`/user/${groupUsers[i].id}`)).data[0].hidereflection;
            var theseReflections = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, lastName: groupUsers[i].lastname, reflections: thisReflections, hide: hideThisReflection};
            groupReflections.push(theseReflections);

        }

        this.setState({groupGoals, groupWeeklyGoals, groupTimers, groupReflections});

    }

    render() {
        return(
            <div className="group-body">
                <div className="shared-goals">
                    <div className="grid-layout">
                        <GroupForm onHideTimers={this.onHideTimers} onHideReflections={this.onHideReflections} onInputSelected={this.onInputSelected} hideTimer={this.state.hideTimer} hideReflection={this.state.hideReflection} />
                        <div className="date-picker"><DatePicker selected={this.state.selectedDate} onChange={this.onDateChanged} /></div>
                    </div>
                    <br />
                    <GroupData user={this.props.user} groupGoals={this.state.groupGoals} groupWeeklyGoals={this.state.groupWeeklyGoals} groupTimers={this.state.groupTimers} groupReflections={this.state.groupReflections} groupLinks={this.state.groupLinks} selectedView={this.state.selectedView} groupId={this.props.user.groupid} />
                </div>
                <div className="group-chat">
                    <h2>Group Chat</h2>
                    <GroupMessages user={this.props.user} messages={this.state.messages} />
                    <Form onSubmit={this.onMessageSent}>
                        <InputGroup>
                            <Form.Control type="text" className="message-input" value={this.state.newMessageText} inline="true" onChange={this.onMessageTyped} placeholder="Type your message here" />
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
                    <option value={"goals"}>Daily Goals</option>
                    <option value={"weeklyGoals"}>Long Term Goals</option>
                    <option value={"timers"}>Timers</option>
                    <option value={"reflections"}>Reflections</option>
                    <option value={"links"}>Document Links</option>
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
            <div key={"div-goals-" + user.userId}><Goals key={"goals-" + user.userId} goals={user.goals} userName={user.firstName} userLastName={user.lastName}  /> </div>);

        const listUserWeeklyGoals = this.props.groupWeeklyGoals.map((user) =>
            <div key={"div-weeklyGoals-" + user.userId}><WeeklyGoals key={"weeklyGoals-" + user.userId} weeklyGoals={user.weeklyGoals} userName={user.firstName} userLastName={user.lastName} /></div>);

        const listUserTimers = this.props.groupTimers.map((user) =>
            <div key={"div-timers-" + user.userId}><Timers key={"timers-" + user.userId} hide={user.hide} timers={user.timers} customTimers={user.customTimers} distinctCustomNames={user.distinctCustomNames} userName={user.firstName} userLastName={user.lastName} /></div>);

        const listUserRefelections = this.props.groupReflections.map((user) =>
            <div key={"div-reflections-" + user.userId}><Reflections key={"reflections-" + user.userId} hide={user.hide} reflections={user.reflections} userName={user.firstName} userLastName={user.lastName} /></div>);
        
        const listUserLinks = this.props.groupLinks.map((user) =>
            <div key={"div-links-" + user.userId}><Links key={"links-" + user.userId} links={user.links} userName={user.firstName} userLastName={user.lastName} /></div>);
        
        const goalsView = (
            <div className="group-data">
                { listUserGoals }
            </div>
        );
        const weeklyGoalsView = (
            <div className="group-data">
                { listUserWeeklyGoals }
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
        );

        const linksView = (
            <div className="group-data">
                { listUserLinks }
            </div>
        );

        if(this.props.selectedView === 'goals') {
            return[
                <h2>Daily Goals</h2>,
                goalsView
            ]
        }
        else if(this.props.selectedView === 'weeklyGoals') {
            return[
                <h2>Long Term Goals</h2>,
                weeklyGoalsView
            ]
        }
        else if(this.props.selectedView === 'timers') {
            return[
                <h2>Timers </h2>,
                timersView
            ]
        }
        else if(this.props.selectedView === 'reflections') {
            return[
                <h2>Reflections</h2>,
                reflectionsView
            ]
        }
        else {
            return[
                <h2>Document Links</h2>,
                linksView
            ]
        }
    }
}


class Goals extends Component {
      render() {
        return(
            <div className="group-data-item">
                <h4>{this.props.userName} {this.props.userLastName}</h4><br/>
                <CheckboxGoals goals={this.props.goals} />
            </div>
        );
      }
  }

  class WeeklyGoals extends Component {
      render() {
          return(
              <div className="group-data-item">
                  <h4>{this.props.userName} {this.props.userLastName}</h4><br/>
                  <CheckboxGoals goals={this.props.weeklyGoals} />
              </div>
          )
      }
  }

  class Timers extends Component {
      render() {
        var allCustomTimers = [];
        for(var i=0; i<this.props.distinctCustomNames.length; i++) {
            var time = this.props.customTimers.filter((timer) => timer.name === this.props.distinctCustomNames[i].name);
            var pushTimer = {};
            if(time.length === 0) {
                pushTimer = {name: this.props.distinctCustomNames[i].name, time: 0};
            }
            else {
                pushTimer = {name: this.props.distinctCustomNames[i].name, time: time[0].time};
            }
            allCustomTimers.push(pushTimer);
        }
        const listAllCustom = allCustomTimers.map((timer) =>
    <li key={"distinct-timer-" + timer.name}> <b>{timer.name}</b>: {secondsToHms(timer.time)}</li>);
    //     const allCustomNames = this.props.distinctCustomNames.map((name) =>
    // <li key={"distinct-name-" + name.name}>{name.name}:</li>);
    //     const customTimersList = this.props.customTimers.map((timer) => 
    //         <li key={"custom-" + timer.id}>{timer.name}: {secondsToHms(timer.time)}</li>);
        if(this.props.timers.length > 0 && this.props.hide !== true) {
            return(
                <div className="group-data-item" id="group-timers">
                    <h4>{this.props.userName} {this.props.userLastName}</h4><br/>
                    <ul className="history-timers-list">
                        <li><b>Writing</b>: {secondsToHms(this.props.timers[0].writingtime)}</li>
                        <li><b>Research</b>: {secondsToHms(this.props.timers[0].researchtime)}</li>
                        { listAllCustom }
                    </ul>
                </div>
            );
        }
        else if(this.props.hide === true) {
            return(
                <div className="group-data-item">
                    <h4>{this.props.userName} {this.props.userLastName}</h4><br/>
                    <div className="no-timers">Has elected to not share their timers.</div>
                </div>
            );
        }
        else {
            return(
                <div className="group-data-item">
                    <h4>{this.props.userName} {this.props.userLastName}</h4><br/>
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
                    <h4>{this.props.userName} {this.props.userLastName}</h4>
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
                    <h4>{this.props.userName} {this.props.userLastName}</h4>
                    <p>Has elected to not share their reflections with the group.</p>
                </div>
            );
        }
        else{
            return(
                <div className="group-data-item" id="group-reflections">
                    <h4>{this.props.userName} {this.props.userLastName}</h4>
                    <p>No reflection.</p>
                </div>
            );
        }
        
    }
  }

class Links extends Component {
    render() {
        return(
            <div className="group-data-item wrap-links" id="group-links">
                <h4>{this.props.userName} {this.props.userLastName}</h4>
                <ListLinks links={this.props.links} />
            </div>
        );
    }
}

class ListLinks extends Component {
    render() {
        if(this.props.links.length !== 0) {
            const listLink = this.props.links.map((link) => 
                <li className="link-text-div"><a href={link.link} target="_blank">{link.title}</a></li>);
            return(<div> {listLink} </div>);
        }
        else {
            return(<div className="link-text-div">No links.</div>);
        }
    }
}

class GroupMessages extends Component {
    componentDidUpdate() {
        const messagesDiv = document.getElementById('group-messages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    render() {
        var thisMessage;
        var dates = [];
        const listGroupMessages = this.props.messages.map((msg) => {
            if(msg.userid === this.props.user.id) {
                thisMessage = <div className="group-message" key={msg.id} style={{backgroundColor: '#DEF2FF'}}><b>Me</b>: {msg.chattext} </div>;
            }
            else {
                thisMessage = <div className="group-message" key={msg.id} style={{}}><b>{msg.username}</b>: {msg.chattext} </div>;
            }
            return(
                <div>
                    <span className="message-date"><b>{!dates.includes(msg.chatdate)? (dates.push(msg.chatdate), fixDateWithYear(msg.chatdate)) : false}</b></span> 
                    {/* <div className="group-message" key={msg.id}><b>{msg.username}</b>: {msg.chattext} </div> */}
                    {thisMessage}
                </div>
            ); 
        });
        return(
            <div className="group-messages" id="group-messages">
                { listGroupMessages }
            </div>
        );
    }
}



export { Group };