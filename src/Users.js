import React from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import auth0Client from './Auth';
import config from './auth_config.json';
import { getTodaysDate } from './shared';
import './Admin.css';
import Moment from 'moment';
import Chart from 'react-apexcharts';
import Papa from 'papaparse';

const todayDate = getTodaysDate();
const dateDefault = new Date();

class Users extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUsers: [],
            filteredUsers: [],
            currentGroups: [],
            currentClasses: [],
            firstField: "",
            lastField: "",
            emailField: "",
            groupField: "",
            classField: "",
            groupNameField: "",
            classNameField: "",
            goalClass: "",
            goalText: "",
            goalLink: "",
            goalStart: dateDefault,
            goalEnd: dateDefault,
            selectedGroupSort: "",
            selectedGroupId: -1,
        }

        this.addUser = this.addUser.bind(this);
        this.editUser = this.editUser.bind(this);
        this.editGroup = this.editGroup.bind(this);
        this.editClass = this.editClass.bind(this);
        this.addGroup = this.addGroup.bind(this);
        this.addClass = this.addClass.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.deleteClass = this.deleteClass.bind(this);
        this.filterUsers = this.filterUsers.bind(this);
    }

    async componentDidMount() {
        const currentUsers = (await axios.get('/users')).data.sort((a,b) => (a.lastname.toLowerCase() > b.lastname.toLowerCase()) ? 1 : -1);
        const filteredUsers = currentUsers;
        const currentGroups = (await axios.get('/groups')).data;
        const currentClasses = (await axios.get('/classes')).data;
        this.setState({ currentUsers, currentGroups, currentClasses, filteredUsers });
    }

    async addUser(event) {
        if (event) {
            event.preventDefault();
        }
        if(this.state.firstField === "" || this.state.lastField === "" || this.emailField === "") {
            alert("Error: the name and/or email field is empty. Please make sure everything is filled out correctly and try again.");
        }
        else if(this.state.classField === "" || this.state.groupField === "") {
            alert("Error: the class and/or group field is empty. Please make sure everything is filled out correctly and try again.");
        }
        else {
            const groupid = (await axios.get(`/group/${this.state.groupField}`)).data[0].id;
            const classid = (await axios.get(`/class/${this.state.classField}`)).data[0].id;
            await axios.post("/user", { firstname: this.state.firstField, lastname: this.state.lastField, email: this.state.emailField, groupid, classid}).then((response) => { }, (error) => {
                alert("There was an error trying to add the student. Please make sure you filled everything out correctly and try again. Contact your developers if the issue persists."); });
            const currentUsers = (await axios.get("/users")).data.sort((a,b) => (a.lastname.toLowerCase() > b.lastname.toLowerCase()) ? 1 : -1);
            var filteredUsers;

            if(this.state.selectedGroupId === -1) {
                filteredUsers = currentUsers;
            }
            else {
                filteredUsers = currentUsers.filter(user => user.groupid === this.state.selectedGroupId);
            }

                
            this.setState({
                currentUsers,
                filteredUsers,
                firstField: "",
                lastField: "",
                emailField: "",
                groupField: "",
                classField: "",
            });
         }
        
    }

    async editUser(user, firstname, lastname, email, groupname, classname) {
        if(groupname === "" || classname === "") {
            alert("Either the student's group or class was empty. Please make sure you fill out everything in order for changes to be saved.");
        }
        else if(firstname === "" || lastname === "" || email === "") {
            alert("Either the student's name or email field was empty. Please make sure you fill out everything in order for changes to be saved.")
        }
        else {
            const hidetimer = user.hidetimer ? user.hidetimer : false;
            const hidereflection = user.hidereflection ? user.hidereflection : false;
            const hideweeklygoals = user.hideweeklygoals ? user.hideweeklygoals : false;

            const groupid = (await axios.get(`/group/${groupname}`)).data[0].id;
            const classid = (await axios.get(`/class/${classname}`)).data[0].id;

            await axios.put(`/user/${user.id}`, { firstname, lastname, email, groupid, classid, hidetimer, hidereflection, hideweeklygoals }).then((response) => { }, (error) => { console.log(error);
                alert("There was an error trying to edit the student. Please make sure you filled everything out correctly and try again. Contact your developers if the issue persists."); });
            const currentUsers = (await axios.get("/users")).data.sort((a,b) => (a.lastname.toLowerCase() > b.lastname.toLowerCase()) ? 1 : -1);
            var filteredUsers;

            if(this.state.selectedGroupId === -1) {
                filteredUsers = currentUsers;
            }
            else {
                filteredUsers = currentUsers.filter(user => user.groupid === this.state.selectedGroupId);
            }
                
            this.setState({
                currentUsers,
                filteredUsers
            });
        }
    }

    async editClass(classname, classid) {
        if(classname === "") {
            alert("Error: you must give the class a name");
        }
        else {
            await axios.put(`/class/${classid}`, { classname }).then((response) => { }, (error) => {
                alert("There was an error trying to edit the class. Contact your developers if the issue persists"); });
            const currentClasses = (await axios.get('/classes')).data;
            const currentUsers = (await axios.get("/users")).data.sort((a,b) => (a.lastname.toLowerCase() > b.lastname.toLowerCase()) ? 1 : -1);
            var filteredUsers;
            if(this.state.selectedGroupId === -1) {
                filteredUsers = currentUsers;
            }
            else {
                filteredUsers = currentUsers.filter(user => user.groupid === this.state.selectedGroupId);
            }
            this.setState({ currentClasses, currentUsers, filteredUsers });
        }
    }

    async editGroup(groupname, groupid) {
        if(groupname === "") {
            alert("Error: you must give the group a name.");
        }
        else {
            await axios.put(`/group/${groupid}`, { groupname }).then((response) => { }, (error) => {
                alert("There was an error trying to edit the group. Contact your developers if the issue persists"); });
            const currentGroups = (await axios.get('/groups')).data;
            const currentUsers = (await axios.get("/users")).data.sort((a,b) => (a.lastname.toLowerCase() > b.lastname.toLowerCase()) ? 1 : -1);
            var filteredUsers;
            if(this.state.selectedGroupId === -1) {
                filteredUsers = currentUsers;
            }
            else {
                filteredUsers = currentUsers.filter(user => user.groupid === this.state.selectedGroupId);
            }
            this.setState({ currentGroups, currentUsers, filteredUsers });
        }
    }

    async addGroup(event) {
        event.preventDefault();
        if(this.state.groupNameField === "") {
            alert("Error: cannot add a group without a name");
        }
        else {
            await axios.post(`/group`, { groupname: this.state.groupNameField }).then((response) => { }, (error) => {
                alert("There was an error trying to add the group. Please make sure you filled everything out correctly and try again. Contact your developers if the issue persists"); });
            const currentGroups = (await axios.get("/groups")).data;
    
            this.setState({ currentGroups, groupNameField: "" });
        }
    }

    async addClass(event) {
        event.preventDefault();
        if(this.state.classNameField === "") {
            alert("Error: cannot add a class without a name.");
        }
        else {
            await axios.post(`/class`, { classname: this.state.classNameField }).then((response) => { }, (error) => {
                alert("There was an error trying to add the class. Please make sure you filled everything out correctly and try again. Contact your developers if the issue persists"); });
            const currentClasses = (await axios.get("/classes")).data;
            const classid = currentClasses.filter((c) => c.classname === this.state.classNameField)[0].id;
            
            await axios.post(`/question`, { 
                classid, 
                questionone: 'What obstacles did you encounter, if any?', 
                questiontwo: 'What are some opportunities for improvement?', 
                questionthree: 'Any wins for the day worth recording?' 
            });
            
            this.setState({ currentClasses, classNameField: "" });
        }
    }

    async deleteUser(event, firstname, lastname, userid) {
        event.preventDefault();
        if(confirm("Are you sure you want to delete the user " + firstname + " " + lastname + "? All of their data will be deleted and it cannot be undone.")) {
            await axios.delete(`/user/${userid}`).then((response) => { }, (error) => {
                alert("There was an error trying to edit the class. Please contact your developers and let them know of the issue.", error); });
            const currentUsers = (await axios.get("/users")).data.sort((a,b) => (a.lastname.toLowerCase() > b.lastname.toLowerCase()) ? 1 : -1);
            var filteredUsers;
            if(this.state.selectedGroupId === -1) {
                filteredUsers = currentUsers;
            }
            else {
                filteredUsers = currentUsers.filter(user => user.groupid === this.state.selectedGroupId);
            }


            this.setState({
                currentUsers,
                filteredUsers
            });
        }
        else {
            // do nothing
        }
    }

    async deleteGroup(event, groupid, groupname) {
        event.preventDefault();
        if(confirm("Are you sure you want to delete the group " + groupname + "? You will only be able to delete the group if it is empty, and it cannot be undone.")) {
            if((await axios.get(`/userByGroup/${groupid}`)).data.length === 0) {
                await axios.delete(`/group/${groupid}`).then((response) => { }, (error) => {
                    alert("There was an error trying to delete the group. Contact your developers if the issue persists"); });
                const currentGroups = (await axios.get("/groups")).data;

                this.setState({
                    currentGroups,
                });
            }
            else {
                alert("Sorry, you cannot delete a group that currently has users in it. Please either delete those users or move them to a different group before proceeding.");
            }
        }
        else {
            // do nothing
        }
    }

    async deleteClass(event, classid, classname) {
        event.preventDefault();
        var studentsInClass = this.state.currentUsers.filter((user) => user.classid === classid);

        if(confirm("WARNING!!! Deleting a class will also delete all the users in it. This CANNOT be undone. Are you sure you want to delete the class " + classname + "?")) {
                for(var i=0; i<studentsInClass.length; i++) {
                    await axios.delete(`/user/${studentsInClass[i].id}`);
                }
                await axios.delete(`/class/${classid}`).then((response) => { }, (error) => {
                    alert("There was an error trying to delete the class. Contact your developers if the issue persists"); });
                
                await axios.delete(`/question/${classid}`); // Quietly delete that class' questions

                const currentClasses = (await axios.get("/classes")).data;
                const currentUsers = (await axios.get("/users")).data.sort((a,b) => (a.lastname.toLowerCase() > b.lastname.toLowerCase()) ? 1 : -1);
                var filteredUsers;
                if(this.state.selectedGroupId === -1) {
                    filteredUsers = currentUsers;
                }
                else {
                    filteredUsers = currentUsers.filter(user => user.groupid === this.state.selectedGroupId);
                }

                this.setState({
                    currentClasses, currentUsers, filteredUsers
                });
        }
        else {
            // do nothing
        }
    }

    async filterUsers(groupName) {
        event.preventDefault();
        if(groupName === "All Students") {
            const currentUsers = (await axios.get('/users')).data.sort((a,b) => (a.lastname.toLowerCase() > b.lastname.toLowerCase()) ? 1 : -1);
            this.setState({selectedGroupSort: groupName, selectedGroupId: -1, filteredUsers: currentUsers});
        }
        else {
            const groupid = (await axios.get(`/group/${groupName}`)).data[0].id;
            const currentUsers = (await axios.get('/users')).data.sort((a,b) => (a.lastname.toLowerCase() > b.lastname.toLowerCase()) ? 1 : -1);
            const filteredUsers = currentUsers.filter(user => user.groupid === groupid);
            this.setState({selectedGroupSort: groupName, selectedGroupId: groupid, filteredUsers});
        }
    }

    render() {
        return (
            <div id="bootstrap-overrides">
            {
                auth0Client.getProfile()[config.roleUrl] === 'admin' ? (
                    <div className="page">
                        <Row >
                            <Col >
                                <br />
                                <Row>
                                    <Col>
                                        <h3>Class list:</h3>
                                        <div className="text-block">
                                            <ul>
                                                {this.state.currentClasses.sort((a, b) => (a.classname.toLowerCase() > b.classname.toLowerCase()) ? 1 : -1).map((aClass) => <ClassView editClass={this.editClass} deleteClass={this.deleteClass} class={aClass} key={aClass.id} members={this.state.currentUsers.filter((user) => user.classid === aClass.id)} />)}
                                            </ul>
                                        </div>
                                    </Col>
                                    <Col>
                                        <h3>New Class:</h3>
                                        <Form onSubmit={this.addClass} className="text-block" >
                                            <Form.Row>
                                                <Col>
                                                    <Form.Label>Class Name: </Form.Label>
                                                </Col>
                                                <Col>
                                                    <Form.Control value={this.state.classNameField} onChange={(event) => this.setState({ classNameField: event.target.value })} />
                                                </Col>
                                            </Form.Row>
                                            <br />
                                            <Button type="submit">Add Class</Button>
                                        </Form>
                                    </Col>
                                </Row>
                                <br />

                                <Row>
                                    <Col>
                                        <h3>Groups list:</h3>
                                        <div className="text-block groups-list">
                                            <ul>
                                                {this.state.currentGroups.sort((a, b) => (a.groupname.toLowerCase() > b.groupname.toLowerCase()) ? 1 : -1).map((group) => <GroupView editGroup={this.editGroup} deleteGroup={this.deleteGroup} group={group} key={group.id} members={this.state.currentUsers.filter((user) => user.groupid === group.id)} />)}
                                            </ul>
                                        </div>
                                    </Col>
                                    <Col>
                                        <h3>New Group:</h3>
                                        <Form onSubmit={this.addGroup} className="text-block" >
                                            <Form.Row>
                                                <Col>
                                                    <Form.Label>Group Name: </Form.Label>
                                                </Col>
                                                <Col>
                                                    <Form.Control value={this.state.groupNameField} onChange={(event) => this.setState({ groupNameField: event.target.value })} />
                                                </Col>
                                            </Form.Row>
                                            <br />
                                            <Button type="submit">Add Group</Button>
                                        </Form>
                                    </Col>
                                </Row>

                                <br />

                                <Row>
                                    <Col md={6}>
                                        <h3>Users list:</h3>
                                        <Form>
                                            <Form.Label>Show users in group: </Form.Label>
                                            <Form.Control as="select" value={this.state.selectedGroupSort} onChange={(event) => this.filterUsers(event.target.value)} >
                                                    <option key={0} >All Students</option>
                                                    {this.state.currentGroups.map((group) => <option key={group.id}>{group.groupname}</option>)}
                                            </Form.Control>
                                        </Form>
                                        <div className="text-block users-list">
                                            <ul>
                                                {this.state.filteredUsers.map((user) => <UserView key={user.id} user={user} editUser={this.editUser} deleteUser={this.deleteUser} currentClasses={this.state.currentClasses} currentGroups={this.state.currentGroups} />)}
                                            </ul>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <h3>New User:</h3>
                                        <Form onSubmit={async (event) => {
                                            event.preventDefault();
                                            console.log(this.state.userFile);
                                            Papa.parse(this.state.userFile, {
                                                header: true,
                                                complete: async (result) => {
                                                    const jsonArray = result.data;
                                                    console.log(jsonArray);
                                                    for (const row of jsonArray) {
                                                        this.setState({
                                                            firstField: row["First Name"],
                                                            lastField: row["Last Name"],
                                                            emailField: row.Email,
                                                            groupField: row.Group,
                                                            classField: row.Class
                                                        });
                                                        await this.addUser();
                                                    }
                                                }
                                            });
                                            
                                        }}>
                                            <h4>Enter Multiple Users:</h4>
                                            <Form.Row className="text-block">
                                                <Col><Form.Control
                                                    id="fileUpload"
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={(event) => this.setState({ userFile: event.target.files[0] })}
                                                    style={{ paddingTop: "10px" }}
                                                /></Col>
                                                <Col><Button type="submit">Add</Button></Col>
                                            </Form.Row>
                                        </Form>
                                        <h4>Enter User Manually:</h4>
                                        <Form onSubmit={this.addUser} className="text-block" >
                                            <Form.Row>
                                                <Col>
                                                    <Form.Label>First Name: </Form.Label>
                                                </Col>
                                                <Col>
                                                    <Form.Control value={this.state.firstField} onChange={(event) => this.setState({ firstField: event.target.value })} />
                                                </Col>
                                            </Form.Row>
                                            <Form.Row>
                                                <Col>
                                                    <Form.Label>Last Name: </Form.Label>
                                                </Col>
                                                <Col>
                                                    <Form.Control value={this.state.lastField} onChange={(event) => this.setState({ lastField: event.target.value })} />
                                                </Col>
                                            </Form.Row>
                                            <Form.Row>
                                                <Col>
                                                    <Form.Label>Email: </Form.Label>
                                                </Col>
                                                <Col>
                                                    <Form.Control value={this.state.emailField} onChange={(event) => this.setState({ emailField: event.target.value })} />
                                                </Col>
                                            </Form.Row>
                                            <Form.Row >
                                                <Col>
                                                    <Form.Label>Group: </Form.Label>
                                                </Col>
                                                <Col>
                                                    <Form.Control as="select" value={this.state.groupField} onChange={(event) => this.setState({ groupField: event.target.value })} >
                                                        <option key={0} >Select...</option>
                                                        {this.state.currentGroups.map((group) => <option key={group.id}>{group.groupname}</option>)}
                                                    </Form.Control>
                                                </Col>
                                            </Form.Row>
                                            <Form.Row >
                                                <Col>
                                                    <Form.Label>Class: </Form.Label>
                                                </Col>
                                                <Col>
                                                    <Form.Control as="select" value={this.state.classField} onChange={(event) => this.setState({ classField: event.target.value })} >
                                                        <option key={0}>Select...</option>
                                                        {this.state.currentClasses.map((c) => <option key={c.id}>{c.classname}</option>)}
                                                    </Form.Control>
                                                </Col>
                                            </Form.Row>
                                            <br />
                                            <Button type="submit">Add User</Button>
                                        </Form>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        </div>
                    ) : (<p>You are not an admin.</p>)
            }
            </div>
        );
    }
}

class ClassView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            editing: false,
            editingName: this.props.class.classname,
        }
    }

    render() {
        const viewMode = (
            <div>
                { this.props.class.classname }  
                <Button onClick={() => this.setState({show: true})}>View</Button> 
                <Button onClick={() => this.setState({editing: true})}>Edit</Button> 
                <Modal show={this.state.show} onHide={() => this.setState({show: false})}>
                    <Modal.Header>
                        <Modal.Title>Class Members:</Modal.Title><Button onClick={() => this.props.deleteClass(event, this.props.class.id, this.props.class.classname)}>Delete Class</Button>
                    </Modal.Header>
                    <Modal.Body>
                        {this.props.members.map((member) => <li key={member.id}>{member.firstname} {member.lastname}</li>)}
                        <br/>
                        <h6>Contact Line:</h6>
                        <p className="contact">{this.props.members.map((member) => member.email + ', ')}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.setState({show: false})}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );

        const editMode = (
            <div>
                <Form onSubmit={async (event) => { 
                    event.preventDefault();
                    await this.props.editClass(this.state.editingName, this.props.class.id);
                    this.setState({ editing: false });
                }}>
                    <Form.Control value={this.state.editingName} onChange={(event) => this.setState({ editingName: event.target.value })} />
                    <Button type="submit">Done</Button>
                </Form>
            </div>
        );

        return this.state.editing ? editMode : viewMode;
    }
}

class GroupView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            editing: false,
            editingName: this.props.group.groupname,
        }
    }

    render() {
        const viewMode = (
            <div>
                { this.props.group.groupname }  
                <Button onClick={() => this.setState({show: true})}>View</Button> 
                <Button onClick={() => this.setState({editing: true})}>Edit</Button> 
                <Modal show={this.state.show} onHide={() => this.setState({show: false})}>
                    <Modal.Header>
                        <Modal.Title>Group Members:</Modal.Title><Button onClick={() => this.props.deleteGroup(event, this.props.group.id, this.props.group.groupname)}>Delete Group</Button>
                    </Modal.Header>
                    <Modal.Body>
                        {this.props.members.map((member) => <li key={member.id}>{member.firstname} {member.lastname}</li>)}
                        <br/>
                        <h6>Contact Line:</h6>
                        <p className="contact">{this.props.members.map((member) => member.email + ', ')}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.setState({show: false})}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );

        const editMode = (
            <div>
                <Form onSubmit={async (event) => { 
                    event.preventDefault();
                    await this.props.editGroup(this.state.editingName, this.props.group.id);
                    this.setState({ editing: false });
                }}>
                    <Form.Control value={this.state.editingName} onChange={(event) => this.setState({ editingName: event.target.value })} />
                    <Button type="submit">Done</Button>
                </Form>
            </div>
        );

        return this.state.editing ? editMode : viewMode;
    }
}

class UserView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            editing: false,
            userid: this.props.user.id,
            firstField: this.props.user.firstname,
            lastField: this.props.user.lastname,
            emailField: this.props.user.email,
            groupField: "",
            classField: "",
            groupName: "",
            className: "",
            options: {},
            series: []
        }
    }

    async componentDidMount() {
        const groupName = (await axios.get(`/grou/${this.props.user.groupid}`)).data[0].groupname;
        const className = (await axios.get(`/clas/${this.props.user.classid}`)).data[0].classname;

        const distinctCustomNames = (await axios.get(`/customTimerByUser/${this.props.user.id}`)).data.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));

        const getCustom = (await axios.get(`/allCustomTimers/${this.props.user.id}`)).data;
        const allCustom  = getCustom.sort((a,b) => new Moment(a.timerdate).format('YYYYMMDD') - new Moment(b.timerdate).format('YYYYMMDD'));
        var graphSeries = [];
        if(allCustom.length > 0) {
            var startWeek = Moment(allCustom[0].timerdate).week();
            graphSeries = distinctCustomNames.map(timer => { return { name: timer.name, data: [] }});


            var weeks = [];
            var momentWeeks = [];
            var startDate = Moment(allCustom[0].timerdate).weekday(0);

            var today = Moment(allCustom[allCustom.length-1].timerdate).weekday(7);
            while(startDate.isBefore(today)) {
                let startDateWeek = startDate.weekday(0).format('MM/DD');
                let endDateWeek = startDate.weekday(6).format('MM/DD');
                startDate.add(7,'days');
                weeks.push(startDateWeek.concat(" - ", endDateWeek));
                momentWeeks.push(startWeek);
                startWeek += 1;
            }

            var filterByName;
            var filterByWeek;

            for(var i=0; i<distinctCustomNames.length; i++) {
                filterByName = allCustom.filter((timer) => timer.name === distinctCustomNames[i].name);
                for(var j=0; j<momentWeeks.length; j++) {
                    filterByWeek = filterByName.filter((timer) => Moment(timer.timerdate).week() === momentWeeks[j]);
                    if(filterByWeek.length > 0) {
                        var totalHrs = filterByWeek.reduce((a, b) => a + b.time, 0) / 3600;
                        graphSeries[i].data.push(totalHrs);
                    }
                    else {
                        graphSeries[i].data.push(0)
                    }

                }
            }
        }
        else {
            graphSeries = [];
        }

        

        var maxArray = [];

        for(i=0; i<graphSeries.length; i++) {
            maxArray.push(Math.max(...graphSeries[i].data));
        }

        var maxY = Math.max(...maxArray);

        var options= {
            colors: ['#0b476b', '#106699', '#329c8d', '#7abe9a', '#ebefcd', '#d3b276'],
            chart: {
              id: 'Timer Stats'
            },
            xaxis: {
              categories: weeks,
              title: {
                  text: 'Weeks',
                  style: {
                      fontSize: '1em'
                  }
              },
              labels: {
                trim: false,
                style: {
                    fontSize: '14px'
                }
              }
            },
            yaxis: {
                decimalsInFloat: 0,
                title: {
                    text: 'Total Hours',
                    style: {
                        fontSize: '1em'
                    }
                },
                labels: {
                    style: {
                        fontSize: '14px'
                    }
                },
                min: 0,
                max: Math.ceil(maxY) + 1,
                tickAmount: (Math.ceil(maxY) + 1)/2
            },
            title: {
                text: 'Timer Hours Per Week',
                align: 'center',
                style: {
                    fontSize: '1.75em'
                },
                offsetY: 20
            },
            tooltip: {
                y: {
                    formatter: function (value) {
                        return value.toFixed(1) + ' hrs';
                    }
                }
            },
            legend: {
                fontSize: '16px'
            },
            markers: {
                size: 6,
                hover: {
                    sizeOffset: 2
                }
            }
          };
          var series = graphSeries;
        this.setState({options, series, className, classField: className, groupName, groupField: groupName});
    }

    render() {
        const viewModal = (
            <Modal size="lg" show={this.state.show} onHide={() => this.setState({show: false})}>
                <Modal.Header>
                    <Modal.Title>User Info: <Button onClick={() => this.setState({editing: true})}>Edit</Button><Button onClick={() => this.props.deleteUser(event, this.state.firstField, this.state.lastField, this.state.userid)}>Delete User</Button></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Name: {this.props.user.firstname} {this.props.user.lastname}</p>
                    <p>Email: {this.props.user.email}</p>
                    <p>Group: {this.state.groupName}</p>
                    <p>Class: {this.state.className}</p>
                    <br/>
                    <div className="admin-graph-div">
                        <Chart className="admin-pg-graph" options={this.state.options} series={this.state.series} type="line" width='100%' />
                    </div>
                    
                    <br/><br/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => this.setState({show: false})}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        )

        const editModal = (
            <Modal show={this.state.show} onHide={() => this.setState({show: false, editing: false})}>
                <Modal.Header>
                    <Modal.Title>Edit</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Modal.Title>User Info: <Button onClick={() => this.setState({editing: false})}>Back</Button></Modal.Title>
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        this.props.editUser(this.props.user, this.state.firstField, this.state.lastField, this.state.emailField, this.state.groupField, this.state.classField);
                        this.setState({ show: false, editing: false, groupName: this.state.groupField, className: this.state.classField });
                    }}>
                        <Form.Row>
                            <Col>
                                <Form.Label>First Name: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control value={this.state.firstField} onChange={(event) => this.setState({ firstField: event.target.value })} />
                            </Col>
                        </Form.Row>
                        <Form.Row>
                            <Col>
                                <Form.Label>Last Name: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control value={this.state.lastField} onChange={(event) => this.setState({ lastField: event.target.value })} />
                            </Col>
                        </Form.Row>
                        <Form.Row>
                            <Col>
                                <Form.Label>Email Address: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control value={this.state.emailField} onChange={(event) => this.setState({ emailField: event.target.value })} />
                            </Col>
                        </Form.Row>
                        <Form.Row>
                            <Col>
                                <Form.Label>Group: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control as="select" value={this.state.groupField} onChange={(event) => this.setState({ groupField: event.target.value })} >
                                    {this.props.currentGroups.map((group) => <option key={group.id}>{group.groupname}</option>)}
                                </Form.Control>
                            </Col>
                        </Form.Row>
                        <Form.Row>
                            <Col>
                                <Form.Label>Class Id: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control as="select" value={this.state.classField} onChange={(event) => this.setState({ classField: event.target.value })} >
                                    {this.props.currentClasses.map((c) => <option key={c.id}>{c.classname}</option>)}
                                </Form.Control>
                            </Col>
                        </Form.Row>
                        <Button type="submit">Save Changes</Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => this.setState({show: false, editing: false})}>
                        Close (without saving)
                    </Button>
                </Modal.Footer>
            </Modal>
        )

        return (
            <li>
                {`${this.props.user.firstname} ${this.props.user.lastname} - ${this.props.user.email} - ${this.state.groupName}`}
                <Button onClick={() => this.setState({show: true})}>View</Button> 
                {this.state.editing ? editModal : viewModal}
            </li>
        )
    }
}

/* Currently an unused feature */
class Notes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            notes: [],
        }
    }

    async componentDidMount() {
        const notes = (await axios.get(`/noteByDate/${todayDate}`)).data;
        this.setState({ notes });
    }

    render() {
        return (
            <div>
                { this.state.notes.length === 0 ? <p className="text-block" >No Notes Today :)</p> : this.state.notes.map((note) => {
                    const user = (this.props.currentUsers.filter((u) => u.id === note.userid))[0];

                    return user ? (
                        <Row className="text-block" key={note.id}>
                            <Col id="note-name" sm={2}><h5>{user.firstname} {user.lastname}:</h5></Col>
                            <Col><p>{note.notetext}</p></Col>
                        </Row>
                    ) : null;
                })}
            </div>
        )
    }
}

export { Users };
