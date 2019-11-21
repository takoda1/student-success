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
import './Admin.css'

const todayDate = getTodaysDate();

class Admin extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUsers: [],
            currentGroups: [],
            firstField: "",
            lastField: "",
            emailField: "",
            groupField: 0,
            classField: 0,
            groupNameField: "",
        }

        this.addUser = this.addUser.bind(this);
        this.editUser = this.editUser.bind(this);
        this.addGroup = this.addGroup.bind(this);
    }

    async componentDidMount() {
        const currentUsers = (await axios.get('/users')).data;
        const currentGroups = (await axios.get('/groups')).data;
        this.setState({ currentUsers, currentGroups });
    }

    async addUser(event) {
        event.preventDefault();
        await axios.post("/user", { firstname: this.state.firstField, lastname: this.state.lastField, email: this.state.emailField, groupid: this.state.groupField, classid: this.state.classField});
        const currentUsers = (await axios.get("/users")).data;
            
        this.setState({
            currentUsers,
            firstField: "",
            lastField: "",
            emailField: "",
            groupField: 0,
            classField: 0,
        });
        
    }

    async editUser(user, firstname, lastname, email, groupid, classid) {
        const hidetimer = user.hidetimer ? user.hidetimer : false;
        const hidereflection = user.hidereflection ? user.hidereflection : false;
        await axios.put(`/user/${user.id}`, { firstname, lastname, email, groupid, classid, hidetimer, hidereflection });
        const currentUsers = (await axios.get("/users")).data;
            
        this.setState({
            currentUsers,
        });
    }

    async addGroup(event) {
        event.preventDefault();

        await axios.post(`/group`, { groupname: this.state.groupNameField });
        const currentGroups = (await axios.get("/groups")).data;

        this.setState({ currentGroups });
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
                                        <h3>Groups list:</h3>
                                        <div className="text-block">
                                            <ul>
                                                {this.state.currentGroups.map((group) => <GroupView group={group} key={group.id} />)}
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
                                                {this.state.currentUsers.map((user) => <UserView key={user.id} user={user} editUser={this.editUser} />)}
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
                                                    <Form.Control type="number" value={this.state.groupField} onChange={(event) => this.setState({ groupField: event.target.value })} />
                                                </Col>
                                            </Form.Row>
                                            <Form.Row >
                                                <Col>
                                                    <Form.Label>Class: </Form.Label>
                                                </Col>
                                                <Col>
                                                    <Form.Control type="number" value={this.state.classField} onChange={(event) => this.setState({ classField: event.target.value })} />
                                                </Col>
                                            </Form.Row>
                                            <br />
                                            <Button type="submit">Add User</Button>
                                        </Form>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <h3>New Notes for You:</h3>
                                        <Notes currentUsers={this.state.currentUsers} />
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

class GroupView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            members: [],
        }
    }

    async componentDidMount() {
        const members = (await axios.get(`userByGroup/${this.props.group.id}`)).data;
        this.setState({ members });
    }

    render() {
        return (
            <li>
                Group #{ this.props.group.id }: { this.props.group.groupname } 
                <Button onClick={() => this.setState({show: true})}>View</Button> 
                <Modal show={this.state.show} onHide={() => this.setState({show: false})}>
                    <Modal.Header>
                        <Modal.Title>Group Members:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.members.map((member) => <li key={member.id}>{member.firstname} {member.lastname}</li>)}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.setState({show: false})}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </li>
        )
    }
}

class UserView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            editing: false,
            firstField: this.props.user.firstname,
            lastField: this.props.user.lastname,
            emailField: this.props.user.email,
            groupField: this.props.user.groupid,
            classField: this.props.user.classid,
        }
    }

    render() {
        const viewModal = (
            <Modal show={this.state.show} onHide={() => this.setState({show: false})}>
                <Modal.Header>
                    <Modal.Title>User Info: <Button onClick={() => this.setState({editing: true})}>Edit</Button></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Name: {this.props.user.firstname} {this.props.user.lastname}</p>
                    <p>Email: {this.props.user.email}</p>
                    <p>Group Id: {this.props.user.groupid}</p>
                    <p>Class Id: {this.props.user.classid}</p>
                </Modal.Body>
                <Modal.Body>
                    Shared With You:
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
                        this.setState({ show: false, editing: false })
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
                                <Form.Label>Group Id: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control type="number" value={this.state.groupField} onChange={(event) => this.setState({ groupField: event.target.value })} />
                            </Col>
                        </Form.Row>
                        <Form.Row>
                            <Col>
                                <Form.Label>Class Id: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control type="number" value={this.state.classField} onChange={(event) => this.setState({ classField: event.target.value })} />
                            </Col>
                        </Form.Row>
                        <Button type="submit">Save Changes</Button>
                    </Form>
                </Modal.Body>
                <Modal.Body>
                    Shared With You:
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
                {`${this.props.user.firstname} ${this.props.user.lastname} - ${this.props.user.email} - Group #${this.props.user.groupid}`}
                <Button onClick={() => this.setState({show: true})}>View</Button> 
                {this.state.editing ? editModal : viewModal}
            </li>
        )
    }
}

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
            <Row id="notes">
                { this.state.notes.map((note) => {
                    const user = (this.props.currentUsers.filter((u) => u.id === note.userid))[0];

                    return user ? (
                        <Row className="text-block" key={note.id}>
                            <Col><h5>{user.firstname} {user.lastname}:</h5></Col>
                            <Col><p>{note.notetext}</p></Col>
                        </Row>
                    ) : null;
                })}
            </Row>
        )
    }
}

export { Admin };
