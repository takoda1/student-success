import React from 'react';
import axios from 'axios';
import auth0Client from './Auth';
import config from './auth_config.json';
import './Admin.css';
import Moment from 'moment';
import { fixDateWithYear } from './shared';
import DatePicker from "react-datepicker";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

const dateDefault = new Date();

class Admin extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <div className="admin-grid">
                <LinkForm />
                <ClassGoals />
                <ReflectionQuestions />
            </div>
        );
    }
}

class LinkForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newLinkUrl: '',
            newLinkName: '',
            editedLinkUrl: '',
            editedLinkName: '',
            classField: "",
            classid: -1,
            currentClasses: [],
            classLinks: []
        };

        this.onLinkTyped = this.onLinkTyped.bind(this);
        this.onLinkNameTyped = this.onLinkNameTyped.bind(this);
        this.onLinkSubmitted = this.onLinkSubmitted.bind(this);
        this.onClassSelected = this.onClassSelected.bind(this);

        this.onLinkUpdated = this.onLinkUpdated.bind(this);
        this.onLinkRemoved = this.onLinkRemoved.bind(this);
    }

    async componentDidMount() {
        const currentClasses = (await axios.get('/classes')).data;
        this.setState({ currentClasses });
    }

    onLinkTyped(event) {
        this.setState({ newLinkUrl: event.target.value });
    }

    onLinkNameTyped(event) {
        this.setState({newLinkName: event.target.value});
    }

    async onClassSelected(event) {
        event.preventDefault();
        this.setState({ classid: event.target.value });
        if(event.target.value === "Select...") {
            const noLinks = [];
            this.setState({ classLinks: noLinks });
        }
        else {
            const classLinks = ((await axios.get(`/allClasslinks/${event.target.value}`)).data).sort((a, b) => (a.id > b.id) ? 1 : -1);
            this.setState({ classLinks });
        }
    }

    async onLinkSubmitted(event) {
        event.preventDefault();
        if(this.state.newLinkName !== '' && this.state.newLinkUrl !== '') {
            const newLink = { classid: this.state.classid, linkname: this.state.newLinkName, linkurl: this.state.newLinkUrl }
            await axios.post('/classlink', newLink);
            const classLinks = ((await axios.get(`/allClasslinks/${this.state.classid}`)).data).sort((a, b) => (a.id > b.id) ? 1 : -1);
            this.setState({ newLinkName: '', newLinkUrl: '', classLinks });
        }
    }

    async onLinkRemoved(linkId) {
        event.preventDefault();
        await axios.delete(`/classlink/${linkId}`);
        const classLinks = ((await axios.get(`/allClasslinks/${this.state.classid}`)).data).sort((a, b) => (a.id > b.id) ? 1 : -1);
        this.setState({ classLinks });
    }
    async onLinkUpdated(linkId, newLinkName, newLinkUrl) {
        event.preventDefault();
        await axios.put(`classlink/${linkId}`, {linkname: newLinkName, linkurl: newLinkUrl});
        const classLinks = ((await axios.get(`/allClasslinks/${this.state.classid}`)).data).sort((a, b) => (a.id > b.id) ? 1 : -1);
        this.setState({classLinks});
    }

    render() {
        return(
            <div className="grid-item">
                <h3>Class Links</h3>
                <div className="text-block ">
                    <p>Enter links that you would like to share with your classes</p>
                    <Form onSubmit={this.onLinkSubmitted}>
                        <Form.Row>
                            <Col>
                                <Form.Label>Select Class:</Form.Label>
                            </Col>
                            <Col>
                                <Form.Control as="select" value={this.state.classid} onChange={this.onClassSelected} >
                                <option key={0}>Select...</option>
                                    {this.state.currentClasses.map((c) => <option key={c.id} value={c.id}>{c.classname}</option>)}
                                </Form.Control>
                            </Col>
                        </Form.Row>
                        <br/>
                        <Form.Row>
                            <Col>
                                <Form.Control type="text" onChange={this.onLinkNameTyped} value={this.state.newLinkName} placeholder="Link Name" />
                            </Col>
                            <Col>
                                <Form.Control type="text" onChange={this.onLinkTyped} value={this.state.newLinkUrl} placeholder="Link URL" />
                            </Col>
                            <Button variant="primary" type="submit">Submit</Button>
                        </Form.Row>
                    </Form>
                    <h5>Links:</h5>
                        <span className="links-height">
                            {this.state.classLinks.map((link) => <LinkItem key={"link-item-" + link.id} link={link} onLinkUpdated={this.onLinkUpdated} onLinkRemoved={this.onLinkRemoved} />)}
                        </span>
                </div>
            </div>
        );
    }
}

class LinkItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newLinkName: props.link.linkname,
            newLinkUrl: props.link.linkurl,
            linkId: props.link.id,
            editing: false,
        };
    }

    render() {
        const editMode = (
            <Form onSubmit={() => {this.props.onLinkUpdated(this.state.linkId, this.state.newLinkName, this.state.newLinkUrl); this.setState({editing: !this.state.editing})}}>
                <Form.Row>
                    <Col>
                        <Form.Control type="text" value={this.state.newLinkName} onChange={(event) => {this.setState({newLinkName: event.target.value})}}></Form.Control>
                    </Col>
                    <Col>
                        <Form.Control type="text" value={this.state.newLinkUrl} onChange={(event) => {this.setState({newLinkUrl: event.target.value})}}></Form.Control>
                    </Col>
                    <Button type="submit" className="update">Update</Button>
                </Form.Row>
            </Form>
        );
        const viewMode = (
            <Form>
                <Form.Row>
                    <Col sm="8" className="edit-links">
                        <a href={this.state.newLinkUrl} target='_blank'>{this.state.newLinkName}</a>
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

class ReflectionQuestions extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentClasses: [],
            selectedClass: "",
            questions: {},
            editingQuestions: false,
        }

        this.updateQuestions = this.updateQuestions.bind(this);
    }

    async componentDidMount() {
        const currentClasses = (await axios.get('/classes')).data;
        const selectedClass = currentClasses[0].classname;
        const questions = (await axios.get(`/question/${currentClasses[0].id}`)).data[0];
        this.setState({ questions, currentClasses, selectedClass });
    }

    async updateQuestions(event) {
        event.preventDefault();
        await axios.put(`/question/${this.state.questions.id}`, this.state.questions);
        const aClass = (await axios.get(`/class/${this.state.selectedClass}`)).data[0];
        const questions = (await axios.get(`/question/${aClass.id}`)).data[0];
        this.setState({ questions, editingQuestions: false });
    }

    render() {
        let viewQuestions = (
            <div>
                <Form.Row>
                    <Col><Form.Label>Class: </Form.Label></Col>
                    <Col>
                        <Form.Control as="select" value={this.state.selectedClass} onChange={async (event) => {
                            const selectedClass = event.target.value;
                            const aClass = (await axios.get(`/class/${selectedClass}`)).data[0];
                            const questions = (await axios.get(`/question/${aClass.id}`)).data[0];
                            this.setState({ selectedClass, questions });
                        }}>
                            <option key={0}>Select...</option>
                            {this.state.currentClasses.map((c) => <option key={c.id}>{c.classname}</option>)}
                        </Form.Control>
                    </Col>
                </Form.Row>
                <p>1. {this.state.questions.questionone}</p>
                <p>2. {this.state.questions.questiontwo}</p>
                <p>3. {this.state.questions.questionthree}</p>
                {this.state.questions.additionalquestions ? this.state.questions.additionalquestions.map((question, index) => {
                    return <p key={index} >{4 + index}. {question}</p>
                }) : null}
                <Button onClick={() => this.setState({ editingQuestions: true })} >Edit Questions</Button>
            </div>
        );

        let editQuestions = (
            <Form onSubmit={this.updateQuestions} >
                <Form.Row>
                    <Col><Form.Label>Class: </Form.Label></Col>
                    <Col><h5>
                        {this.state.selectedClass}
                    </h5></Col>
                </Form.Row>
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
                {this.state.questions.additionalquestions ? this.state.questions.additionalquestions.map((question, index) => {
                    return (<Form.Row key={index}>
                        <Col sm={0} ><Form.Label>{4 + index}. </Form.Label></Col>
                        <Col><Form.Control value={question} onChange={(event) => {
                            event.preventDefault();
                            const additionalquestions = this.state.questions.additionalquestions;
                            additionalquestions[index] = event.target.value;
                            this.setState({ questions: {...this.state.questions, additionalquestions } });
                        }} /></Col>
                        <Col><Button onClick={(event) => {
                            event.preventDefault();
                            const additionalquestions = this.state.questions.additionalquestions;
                            additionalquestions.splice(index, 1);
                            this.setState({ questions: {...this.state.questions, additionalquestions } });
                        }}>Remove</Button></Col>
                    </Form.Row>)
                }) : null }
                <Button onClick={(event) => {
                    event.preventDefault();
                    const additionalquestions = this.state.questions.additionalquestions;
                    additionalquestions[additionalquestions.length] = 'Another question...';
                    this.setState({ questions: {...this.state.questions, additionalquestions } });
                }}>Add Question</Button>
                <Button type="submit">Save</Button>
            </Form>
        );

        return(
            <div className="grid-item">
                <h3>Class Reflections</h3>
                <div className="text-block">
                    { this.state.editingQuestions ? editQuestions : viewQuestions }
                </div>
            </div>
        );
    }
}

class ClassGoals extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentClasses: [],
            currentUsers: [],
            goalClass: "",
            goalText: "",
            goalDescription: "",
            goalDate: dateDefault,
        }
    }

    async componentDidMount() {
        const currentClasses = (await axios.get('/classes')).data;
        const currentUsers = (await axios.get('/users')).data;
        this.setState({ currentClasses, currentUsers });
    }

    render() {
        return(
            <div className="grid-item">
                <h3>Class Goals</h3>
                    <Form className="text-block" onSubmit={async (event) => {
                        event.preventDefault();
                        const aClass = (await axios.get(`/class/${this.state.goalClass}`)).data[0];
                        const classUsers = this.state.currentUsers.filter((u) => u.classid === aClass.id);
                        const dueDate = fixDateWithYear(this.state.goalDate);
                        const formattedDate = Moment(this.state.goalDate).format("YYYY-MM-DD");
                        for (const u of classUsers) {
                            await axios.post(`/weeklyGoal`, {
                                userid: u.id, 
                                goaldate: formattedDate, 
                                goaltext: this.state.goalText, 
                                completed: false, 
                                completedate: "2100-01-01"
                            });

                            const goal = (await axios.get(`/weeklyGoals/${u.id}`)).data.reduce((memo, g) => {
                                return (memo.id > g.id) ? memo : g;
                            });

                            if (this.state.goalDescription.length > 0) {
                                const subgoal = {
                                    userid: u.id, 
                                    parentgoal: goal.id, 
                                    goaldate: formattedDate, 
                                    goaltext: this.state.goalDescription, 
                                    completed: false
                                }
                                await axios.post(`/weeklySubgoal`, subgoal);
                            }

                            const dueDate_subgoal = {
                                userid: u.id, 
                                parentgoal: goal.id, 
                                goaldate: formattedDate, 
                                goaltext: `DUE: ${dueDate}`, 
                                completed: false
                            }
                            await axios.post(`/weeklySubgoal`, dueDate_subgoal);

                        }

                        this.setState({
                            goalDescription: "",
                            goalText: "",
                            goalDate: dateDefault,
                        })
                    }}>
                        <Form.Row>
                            <Col><Form.Label>Class: </Form.Label></Col>
                            <Col>
                                <Form.Control as="select" value={this.state.goalClass} onChange={(event) => this.setState({ goalClass: event.target.value })} >
                                    <option key={0}>Select...</option>
                                    {this.state.currentClasses.map((c) => <option key={c.id}>{c.classname}</option>)}
                                </Form.Control>
                            </Col>
                        </Form.Row>
                        <Form.Row>
                            <Col><Form.Label>Goal: </Form.Label></Col>
                            <Col className="goal-input">
                                <Form.Control type="text" className="addGoalField" value={this.state.goalText} onChange={(event) => this.setState({ goalText: event.target.value })} />
                            </Col>
                        </Form.Row>
                        <Form.Row>
                            <Col><Form.Label>(optional) Description: </Form.Label></Col>
                            <Col>
                                <Form.Control type="text" className="addGoalField" value={this.state.goalDescription} onChange={(event) => this.setState({ goalDescription: event.target.value })} />
                            </Col>
                        </Form.Row>
                        <Form.Row>
                            <Col><Form.Label>Due Date: </Form.Label></Col>
                            <Col>
                                <DatePicker selected={this.state.goalDate} onChange={(date) => this.setState({ goalDate: date })} />
                            </Col>
                        </Form.Row>
                        <Form.Row>
                            <Button type="submit">Add Goal</Button>
                        </Form.Row>
                    </Form>
            </div>
        );
    }
}

export { Admin };