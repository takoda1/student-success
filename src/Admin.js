import React from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';

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
            groupNameField: "",
        }

        this.addUser = this.addUser.bind(this);
        this.addGroup = this.addGroup.bind(this);
    }

    async componentDidMount() {
        const currentUsers = (await axios.get('/users')).data;
        const currentGroups = (await axios.get('/groups')).data;
        this.setState({ currentUsers, currentGroups });
    }

    async addUser(event) {
        event.preventDefault();
        await axios.post("/user", { firstname: this.state.firstField, lastname: this.state.lastField, email: this.state.emailField, groupid: this.state.groupField});
        const currentUsers = (await axios.get("/users")).data;
            
        this.setState({
            currentUsers,
            firstField: "",
            lastField: "",
            emailField: "",
            groupField: 0,
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
            <div>
                <h1>Admin</h1>
                <div>
                    <div className="userList">
                        <h3>Users:</h3>
                        <ul>
                            { this.state.currentUsers.map((user) => <UserView key={user.id} user={user} editUser={this.editUser} />)}
                        </ul>
                    </div>

                    <Form onSubmit={this.addUser}>
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
                        <Form.Row>
                            <Col>
                                <Form.Label>Group: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control type="number" value={this.state.groupField} onChange={(event) => this.setState({ groupField: event.target.value })} />
                            </Col>
                        </Form.Row>
                        <Button type="submit">Add User</Button>
                    </Form>
                </div>
                <div>
                    <h3>Groups</h3>
                    <ul>
                        { this.state.currentGroups.map((group) => <GroupView group={group} key={ group.id } />)}
                    </ul>
                    <Form onSubmit={this.addGroup}>
                        <Form.Row>
                            <Col>
                                <Form.Label>Group Name: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control value={this.state.groupNameField} onChange={(event) => this.setState({ groupNameField: event.target.value })} />
                            </Col>
                        </Form.Row>
                        <Button type="submit">Add Group</Button>
                    </Form>
                </div>
                
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
        }
    }

    render() {
        const viewModal = (
            <Modal show={this.state.show} onHide={() => this.setState({show: false})}>
                <Modal.Header>
                    <Modal.Title>{this.props.user.firstname} {this.props.user.lastname}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Modal.Title>User Info: <Button onClick={() => this.setState({editing: true})}>Edit</Button></Modal.Title>
                    <p>Email: {this.props.user.email}</p>
                    Group Id: {this.props.user.groupid}
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
            <Modal show={this.state.show} onHide={() => this.setState({show: false})}>
                <Modal.Header>
                    <Modal.Title>Edit</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Modal.Title>User Info: <Button onClick={() => this.setState({editing: false})}>Back</Button></Modal.Title>
                    <Form onSubmit={() => this.props.editUser(this.props.user.id, this.state.firstField, this.state.lastField, this.state.emailField, this.state.groupField)}>
                        <Form.Row>
                            <Col>
                                <Form.Label>First Name: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control value={this.state.firstField} onChange={(event) => this.setState({ firstField: event.target.value })} />
                            </Col>
                            <Col>
                                <Form.Label>Last Name: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control value={this.state.lastField} onChange={(event) => this.setState({ lastField: event.target.value })} />
                            </Col>
                            <Col>
                                <Form.Label>Email Address: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control value={this.state.emailField} onChange={(event) => this.setState({ emailField: event.target.value })} />
                            </Col>
                            <Col>
                                <Form.Label>Group Id: </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control value={this.state.groupField} onChange={(event) => this.setState({ groupField: event.target.value })} />
                            </Col>
                        </Form.Row>
                        <Button type="submit">Save Changes</Button>
                    </Form>
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

        return (
            <li>
                {`${this.props.user.firstname} ${this.props.user.lastname} - ${this.props.user.email} - Group #${this.props.user.groupid}`}
                <Button onClick={() => this.setState({show: true})}>View</Button> 
                <Modal show={this.state.show} onHide={() => this.setState({show: false})}>
                    <Modal.Header>
                        <Modal.Title>{this.props.user.firstname} {this.props.user.lastname}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Modal.Title>User Info: <Button onClick={() => this.setState({editing: true})}>Edit</Button></Modal.Title>
                        <p>Email: {this.props.user.email}</p>
                        Group Id: {this.props.user.groupid}
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
            </li>
        )
    }
}

export { Admin };
