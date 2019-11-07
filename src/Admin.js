import React from 'react';
import axios from 'axios';

class Admin extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUsers: [],
            currentGroups: [],
            firstField: "",
            lastField: "",
            emailField: "",
        }

        this.addUser = this.addUser.bind(this);
        this.addGroup = this.addGroup.bind(this);
    }

    async componentDidMount() {
        const currentUsers = (await axios.get('/users')).data;
        this.setState({ currentUsers });
    }

    async addUser(event) {
        event.preventDefault();

        await axios.post("/user", { firstname: this.state.firstField, lastname: this.state.lastField, email: this.state.emailField });
        const currentUsers = (await axios.get("/users")).data;
        
        this.setState({
            currentUsers,
            firstField: "",
            lastField: "",
            emailField: "",
        });
    }

    async addGroup(event) {
        event.preventDefault();
    }

    render() {
        return (
            <div>
                <h1>Admin</h1>
                <div>
                    <div className="userList">
                        <h3>Users:</h3>
                        <ul>
                            { this.state.currentUsers.map((user) => <li key={ user.id }>{`${user.lastname}, ${user.firstname} - ${user.email} - Group ${user.groupid}`}</li>)}
                        </ul>
                    </div>
                    <form className="addUser" onSubmit={this.addUser}>
                        <input className="firstField" value={this.state.firstField} onChange={(event) => this.setState({ firstField: event.target.value })} />
                        <input className="lastField" value={this.state.lastField} onChange={(event) => this.setState({ lastField: event.target.value })} />
                        <input className="emailField" value={this.state.emailField} onChange={(event) => this.setState({ emailField: event.target.value })} />
                        <button>Add User</button>
                    </form>
                </div>
                <div>
                    <h3>Groups</h3>
                    <ul>
                        { this.state.currentGroups.map((group) => {
                            return (<div>
                                <li key={ group.id }>{ group.groupname }</li>
                                <button>View</button>
                            </div>);
                        })}
                    </ul>
                    <form className="addGroup" onSubmit={this.addGroup}>
                        <input></input>
                        <input></input>
                        <button>Add Group</button>
                    </form>
                </div>
                
            </div>
        );
    }
}

export { Admin };
