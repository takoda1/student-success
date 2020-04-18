import React from 'react';
import axios from 'axios';
import auth0Client from './Auth';
import config from './auth_config.json';
import './Admin.css';
import './Links.css';
import { UserLinks } from './Group.js';
import Moment from 'moment';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

const todayDate = Moment().format('YYYY-MM-DD');

class Links extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            links: [],
            groupUsers: [],
            groupLinks: [],
            groupLinksApi: [],
            newLinkText: '',
            newLinkName: '',
            editedLinkText: '',
            editedLinkName: '',
            personalLinks: []
        }
        this.onLinkTyped = this.onLinkTyped.bind(this);
        this.onLinkNameTyped = this.onLinkNameTyped.bind(this);
        this.onLinkSubmitted = this.onLinkSubmitted.bind(this);
        this.onLinkRemoved = this.onLinkRemoved.bind(this);
        this.onLinkUpdated = this.onLinkUpdated.bind(this);
    }

    async componentDidMount() {
        const links = ((await axios.get(`/allClasslinks/${this.props.user.classid}`)).data).sort((a, b) => (a.id > b.id) ? 1 : -1);
        const groupUsers = ((await axios.get(`/userByGroup/${this.props.user.groupid}`)).data).sort((a, b) => a.id - b.id);
        const groupLinksApi = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
        const personalLinks = groupLinksApi.filter((link) => link.userid === this.props.user.id);
        var groupLinks = generateGroupLinksArray(groupUsers, groupLinksApi);
        this.setState({ links, groupUsers, groupLinks, groupLinksApi, personalLinks });   
    }

    onLinkTyped(event) {
        this.setState({ newLinkText: event.target.value });
    }

    onLinkNameTyped(event) {
        this.setState({newLinkName: event.target.value});
    }

    async onLinkRemoved(linkId) {
        event.preventDefault();
        await axios.delete(`/grouplinks/${linkId}`);
        const allGroupLinks = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
        const personalLinks = allGroupLinks.filter((link) => link.userid === this.props.user.id);
        const groupUsers = ((await axios.get(`/userByGroup/${this.props.user.groupid}`)).data).sort((a, b) => a.id - b.id);
        const groupLinksApi = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
        var groupLinks = generateGroupLinksArray(groupUsers, groupLinksApi);
        this.setState({newLinkText: '', newLinkName: '', groupLinks, personalLinks});
    }
    async onLinkUpdated(linkId, newLinkName, newLinkText) {
        event.preventDefault();
        await axios.put(`grouplinks/${linkId}`, {link: newLinkText, title: newLinkName});
        const allGroupLinks = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
        const personalLinks = allGroupLinks.filter((link) => link.userid === this.props.user.id);
        const groupUsers = ((await axios.get(`/userByGroup/${this.props.user.groupid}`)).data).sort((a, b) => a.id - b.id);
        const groupLinksApi = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
        var groupLinks = generateGroupLinksArray(groupUsers, groupLinksApi);
        this.setState({newLinkText: '', newLinkName: '', groupLinks, personalLinks});
    }
    async onLinkSubmitted(event) {
        event.preventDefault();
        if(this.state.newLinkText !== '' && this.state.newLinkName !== '') {
            const newLink = { groupid: this.props.user.groupid, link: this.state.newLinkText, title: this.state.newLinkName, linkdate: todayDate, userid: this.props.user.id, username: this.props.user.firstname };
            await axios.post('/grouplinks', newLink);
            const allGroupLinks = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
            const personalLinks = allGroupLinks.filter((link) => link.userid === this.props.user.id);
            const groupUsers = ((await axios.get(`/userByGroup/${this.props.user.groupid}`)).data).sort((a, b) => a.id - b.id);
            const groupLinksApi = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
            var groupLinks = generateGroupLinksArray(groupUsers, groupLinksApi);
            this.setState({newLinkText: '', newLinkName: '', groupLinks, personalLinks });
        }
    } 

    render() {
        var listClassLinks = '';
        if(this.state.links.length === 0) {
            listClassLinks = (<p>Your instructor has not given your class any links yet!</p>);
        }
        else {
            listClassLinks = (<ul> {this.state.links.map((link) => <LinkItem key={"class-link-item" + link.id} link={link} />)} </ul>);
        }

        return(
            <div className="div-padding">
                <h2>Class Links</h2>
                <div className="text-block">
                    {listClassLinks}
                </div>
                <h2>Group Links</h2>
                <GroupLinks user={this.props.user} groupLinks={this.state.groupLinks} />
                <h2>Add Group Links</h2>
                <AddLinks user={this.props.user} groupLinks={this.state.groupLinks} onLinkTyped={this.onLinkTyped} onLinkNameTyped={this.onLinkNameTyped} onLinkRemoved={this.onLinkRemoved} onLinkUpdated={this.onLinkUpdated} onLinkSubmitted={this.onLinkSubmitted} newLinkText={this.state.newLinkText} newLinkName={this.state.newLinkName} editedLinkText={this.state.editedLinkText} editedLinkName={this.state.editedLinkName} personalLinks={this.state.personalLinks} />
            </div>
        );
    }
}

class LinkItem extends React.Component {
    render() {
        return(
            <li><a href={this.props.link.linkurl} target="_blank">{this.props.link.linkname}</a> </li>
        );
    }
}

class GroupLinks extends React.Component {
    render() {

        const listUserLinks = this.props.groupLinks.map((user) =>
            <div className="border-grid-item" key={"div-links-" + user.userId}><UserLinks key={"links-" + user.userId} links={user.links} userName={user.firstName} userLastName={user.lastName} /></div>);

        return(
            <div className="text-block links-grid">
                { listUserLinks }
            </div>
        );
    }
}

class AddLinks extends React.Component {
    render() {
        const sortedLinks = this.props.personalLinks.sort(function(a, b){return a.id - b.id});
        const listLink = sortedLinks.map((link) => 
                <AddLinkItem key={"link-" + link.id} link={link} onLinkRemoved={this.props.onLinkRemoved} onLinkUpdated={this.props.onLinkUpdated} />);
        return(
            <div className="text-block addlinks-grid">
                <span>
                    <p>Enter links that you would like to share with your group</p>
                    <Form onSubmit={this.props.onLinkSubmitted}>
                        <Form.Row>
                            <Col>
                                <Form.Control type="text" onChange={this.props.onLinkNameTyped} value={this.props.newLinkName} placeholder="Link Name" />
                            </Col>
                            <Col>
                                <Form.Control type="text" onChange={this.props.onLinkTyped} value={this.props.newLinkText} placeholder="Link URL" />
                            </Col>
                            <Button variant="primary" type="submit">Submit</Button>
                        </Form.Row>
                    </Form>
                </span>
                <div>
                    <h5>Your Links</h5>
                    {listLink}
                </div>
            </div>
        );
    }
}

class AddLinkItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newLinkName: props.link.title,
            newLinkText: props.link.link,
            linkId: props.link.id,
            editing: false,
        };
    }

    render() {
        const editMode = (
            <Form onSubmit={() => {this.props.onLinkUpdated(this.state.linkId, this.state.newLinkName, this.state.newLinkText); this.setState({editing: !this.state.editing})}}>
                <Form.Row>
                    <Col>
                        <Form.Control type="text" value={this.state.newLinkName} onChange={(event) => {this.setState({newLinkName: event.target.value})}}></Form.Control>
                    </Col>
                    <Col>
                        <Form.Control type="text" value={this.state.newLinkText} onChange={(event) => {this.setState({newLinkText: event.target.value})}}></Form.Control>
                    </Col>
                    <Button type="submit" className="update">Update</Button>
                </Form.Row>
            </Form>
        );
        const viewMode = (
            <Form>
                <Form.Row>
                    <Col sm="8" className="edit-links">
                        <a href={this.state.newLinkText} target='_blank'>{this.state.newLinkName}</a>
                    </Col>
                    <Col className="links-buttons">
                        <Button className="remove" onClick={() => this.props.onLinkRemoved(this.state.linkId)}>Remove</Button>
                        <Button className="edit" onClick={() => this.setState({editing: !this.state.editing})}>Edit</Button>
                    </Col>
                </Form.Row>
            </Form>
        );
        return(
            <div>
                {this.state.editing? editMode : viewMode}
            </div>
        );
    }
}

function generateGroupLinksArray(groupUsers, groupLinksApi) {
    var groupLinks = [];
    for(var i=0; i<groupUsers.length; i++) {
        var thisLink = groupLinksApi.filter((link) => link.userid === groupUsers[i].id);
        var thisNewLink = {userId: groupUsers[i].id, firstName: groupUsers[i].firstname, lastName: groupUsers[i].lastname, links: thisLink}
        groupLinks.push(thisNewLink);
    }
    return(groupLinks);
}

export { Links };