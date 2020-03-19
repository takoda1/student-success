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

const todayDate = getTodaysDate();

class Admin extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUsers: [],
            currentGroups: [],
            currentClasses: [],
            firstField: "",
            lastField: "",
            emailField: "",
            groupField: "",
            classField: "",
            groupNameField: "",
            classNameField: "",
            questions: {},
            editingQuestions: false,
        }

        this.addUser = this.addUser.bind(this);
        this.editUser = this.editUser.bind(this);
        this.editGroup = this.editGroup.bind(this);
        this.editClass = this.editClass.bind(this);
        this.addGroup = this.addGroup.bind(this);
        this.addClass = this.addClass.bind(this);
        this.updateQuestions = this.updateQuestions.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.deleteClass = this.deleteClass.bind(this);
    }

    async componentDidMount() {
        const currentUsers = (await axios.get('/users')).data;
        const currentGroups = (await axios.get('/groups')).data;
        const currentClasses = (await axios.get('/classes')).data;
        const questions = (await axios.get(`/question`)).data[0];
        this.setState({ currentUsers, currentGroups, currentClasses, questions });
    }

    async addUser(event) {
        event.preventDefault();
        const groupid = (await axios.get(`/group/${this.state.groupField}`)).data[0].id;
        const classid = (await axios.get(`/class/${this.state.classField}`)).data[0].id;
        await axios.post("/user", { firstname: this.state.firstField, lastname: this.state.lastField, email: this.state.emailField, groupid, classid});
        const currentUsers = (await axios.get("/users")).data;
            
        this.setState({
            currentUsers,
            firstField: "",
            lastField: "",
            emailField: "",
            groupField: "",
            classField: "",
        });
        
    }

    async editUser(user, firstname, lastname, email, groupname, classname) {
        const hidetimer = user.hidetimer ? user.hidetimer : false;
        const hidereflection = user.hidereflection ? user.hidereflection : false;

        const groupid = (await axios.get(`/group/${groupname}`)).data[0].id;
        const classid = (await axios.get(`/class/${classname}`)).data[0].id;

        await axios.put(`/user/${user.id}`, { firstname, lastname, email, groupid, classid, hidetimer, hidereflection });
        const currentUsers = (await axios.get("/users")).data;
            
        this.setState({
            currentUsers,
        });
    }

    async editClass(classname, classid) {
        await axios.put(`/class/${classid}`, { classname });
        const currentClasses = (await axios.get('/classes')).data;
        const currentUsers = (await axios.get("/users")).data;
        this.setState({ currentClasses, currentUsers });
    }

    async editGroup(groupname, groupid) {
        await axios.put(`/group/${groupid}`, { groupname });
        const currentGroups = (await axios.get('/groups')).data;
        const currentUsers = (await axios.get("/users")).data;
        this.setState({ currentGroups, currentUsers });
    }

    async addGroup(event) {
        event.preventDefault();

        await axios.post(`/group`, { groupname: this.state.groupNameField });
        const currentGroups = (await axios.get("/groups")).data;

        this.setState({ currentGroups, groupNameField: "" });
    }

    async addClass(event) {
        event.preventDefault();

        await axios.post(`/class`, { classname: this.state.classNameField });
        const currentClasses = (await axios.get("/classes")).data;

        this.setState({ currentClasses, classNameField: "" });
    }

    async updateQuestions(event) {
        event.preventDefault();

        await axios.put(`/question/${this.state.questions.id}`, this.state.questions);
        const questions = (await axios.get(`/question`)).data[0];

        this.setState({ questions, editingQuestions: false });
    }

    async deleteUser(event, firstname, lastname, userid) {
        event.preventDefault();
        if(confirm("Are you sure you want to delete the user " + firstname + " " + lastname + "? All of their data will be deleted and it cannot be undone.")) {
            await axios.delete(`/user/${userid}`);
            const currentUsers = (await axios.get("/users")).data;
            
            this.setState({
                currentUsers,
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
                await axios.delete(`/group/${groupid}`);
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

        if(confirm("Are you sure you want to delete the class " + classname + "? You will only be able to delete the class if it is empty, and it cannot be undone.")) {
            if(this.state.currentUsers.filter((user) => user.classid === classid).length === 0) {
                await axios.delete(`/class/${classid}`);
                const currentClasses = (await axios.get("/classes")).data;

                this.setState({
                    currentClasses
                });
            }
            else {
                alert("Sorry, you cannot delete a class that currently has users in it. Please either delete those users or move them to a different class before proceeding.");
            }
            
        }
        else {
            // do nothing
        }
    }

    render() {
        let viewQuestions = (
            <div>
                <p>1. {this.state.questions.questionone}</p>
                <p>2. {this.state.questions.questiontwo}</p>
                <p>3. {this.state.questions.questionthree}</p>
                <Button onClick={() => this.setState({ editingQuestions: true })} >Edit Questions</Button>
            </div>
        )

        let editQuestions = (
            <Form onSubmit={this.updateQuestions} >
                <Form.Row>
                    <Col sm={0} ><Form.Label>1. </Form.Label></Col>
                    <Col><Form.Control value={this.state.questions.questionone} onChange={(event) => this.setState({ questions: {...this.state.questions, questionone: event.target.value } })} /></Col>
                </Form.Row>
                <Form.Row>
                    <Col sm={0} ><Form.Label>2. </Form.Label></Col>
                    <Col><Form.Control value={this.state.questions.questiontwo} onChange={(event) => this.setState({ questions: {...this.state.questions, questiontwo: event.target.value } })} /></Col>
                </Form.Row>
                <Form.Row>
                    <Col sm={0} ><Form.Label>3. </Form.Label></Col>
                    <Col><Form.Control value={this.state.questions.questionthree} onChange={(event) => this.setState({ questions: {...this.state.questions, questionthree: event.target.value } })} /></Col>
                </Form.Row>

                <Button type="submit">Save</Button>
            </Form>
        )

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
                                                {this.state.currentClasses.map((aClass) => <ClassView editClass={this.editClass} deleteClass={this.deleteClass} class={aClass} key={aClass.id} members={this.state.currentUsers.filter((user) => user.classid === aClass.id)} />)}
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
                                        <div className="text-block">
                                            <ul>
                                                {this.state.currentGroups.map((group) => <GroupView editGroup={this.editGroup} deleteGroup={this.deleteGroup} group={group} key={group.id} members={this.state.currentUsers.filter((user) => user.groupid === group.id)} />)}
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
                                        <div className="text-block">
                                            <ul>
                                                {this.state.currentUsers.map((user) => <UserView key={user.id} user={user} editUser={this.editUser} deleteUser={this.deleteUser} currentClasses={this.state.currentClasses} currentGroups={this.state.currentGroups} />)}
                                            </ul>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <h3>New User:</h3>
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
                                
                                <Row>
                                    <Col >
                                        <h3>Current Reflection Questions:</h3>
                                        { this.state.editingQuestions ? editQuestions : viewQuestions }
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

        var writingDataPoints = [];
        var researchDataPoints = [];
        var customDataPoints = [];

        const allTimers = (await axios.get(`/timerByUser/${this.state.userid}`)).data;

        if (allTimers.length > 0) {
            var startWeek = Moment(allTimers[0].timerdate).week();
            var thisWeek = startWeek;
            var xAxis = []
            var writing = 0;
            var research = 0;
            var custom = 0;

            for (var i = 0; i < allTimers.length; i++) {
                if (Moment(allTimers[i].timerdate).week() === thisWeek) {
                    writing += allTimers[i].writingtime;
                    research += allTimers[i].researchtime;
                    custom += allTimers[i].customtime;
                    if (i === allTimers.length - 1) {
                        writingDataPoints.push(writing / 3600);
                        researchDataPoints.push(research / 3600);
                        customDataPoints.push(custom / 3600);
                        xAxis.push(thisWeek - startWeek + 1);
                    }
                } else {
                    writingDataPoints.push(writing / 3600);
                    researchDataPoints.push(research / 3600);
                    customDataPoints.push(custom / 3600);
                    xAxis.push(thisWeek - startWeek + 1);

                    while(Moment(allTimers[i].timerdate).week() > thisWeek+1) {
                        writingDataPoints.push(0);
                        researchDataPoints.push(0);
                        customDataPoints.push(0);
                        xAxis.push(thisWeek-startWeek+2);
                        thisWeek += 1;
                    }

                    thisWeek = Moment(allTimers[i].timerdate).week();
                    writing += allTimers[i].writingtime;
                    research += allTimers[i].researchtime;
                    custom += allTimers[i].customtime;

                    if (i === allTimers.length - 1) {
                        writingDataPoints.push(allTimers[i].writingtime / 3600);
                        researchDataPoints.push(allTimers[i].researchtime / 3600);
                        customDataPoints.push(allTimers[i].customtime / 3600);
                        xAxis.push(thisWeek - startWeek + 1);
                    }
                }

            }
        }

        var maxY = Math.max(...writingDataPoints, ...researchDataPoints, ...customDataPoints);

        var options= {
            colors: ['#4B9CD3', '#13294B', '#6AC9D2'],
            chart: {
              id: 'Timer Stats'
            },
            xaxis: {
              categories: xAxis,
              title: {
                  text: 'Week Number',
                  style: {
                      fontSize: '1em'
                  }
              },
              labels: {
                formatter: function (value) {
                  return 'Week ' + value;
                },
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
                max: Math.ceil(maxY),
                tickAmount: Math.ceil(maxY)
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
          var series= [
            {
                name: 'Writing Timers',
                data: writingDataPoints
            },
            {
                name: "Research Timers",
                data: researchDataPoints
            },
            {
                name: "Custom Timers",
                data: customDataPoints
            }
        ];
        this.setState({options, series, className, groupName});
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
                                    <option key={0}>Select...</option>
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
                                    <option key={0}>Select...</option>
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

export { Admin };
