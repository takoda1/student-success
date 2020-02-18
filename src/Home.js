import { Layout, GoalList, delimiter } from './shared';
import React from 'react';
import axios from 'axios';
import Moment from 'moment';
import "./Home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import DatePicker from "react-datepicker";
import Col from 'react-bootstrap/Col';

import "react-datepicker/dist/react-datepicker.css";

const todayDate = Moment().format('YYYY-MM-DD');

const newDate = new Date();

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            goals: [],
            reflections: {},
            newGoalText: '',
            goalsCompleted: "Loading...",
            questions: {},
            selectedDate: newDate,
            selectedMomentDate: todayDate,
            completedReflections: false,
            reflectionQuestions: ["", "", ""],
            editingReflections: false,
            newLinkText: '',
            newLinkName: '',
            editedLinkText: '',
            editedLinkName: '',
            links: []
        };

        this.checkTotalGoals = this.checkTotalGoals.bind(this);
        this.onGoalTyped = this.onGoalTyped.bind(this);
        this.onGoalSubmitted = this.onGoalSubmitted.bind(this);
        this.onGoalCheck = this.onGoalCheck.bind(this);
        this.onGoalEdited = this.onGoalEdited.bind(this);
        this.onGoalRemoved = this.onGoalRemoved.bind(this);

        this.onDateChanged = this.onDateChanged.bind(this);

        this.onReflectionSubmitted = this.onReflectionSubmitted.bind(this);
        this.onReflectionOneChanged = this.onReflectionOneChanged.bind(this);
        this.onReflectionTwoChanged = this.onReflectionTwoChanged.bind(this);
        this.onReflectionThreeChanged = this.onReflectionThreeChanged.bind(this);
        this.onEditButtonClick = this.onEditButtonClick.bind(this);

        this.onLinkTyped = this.onLinkTyped.bind(this);
        this.onLinkSubmitted = this.onLinkSubmitted.bind(this);
        this.onLinkNameTyped = this.onLinkNameTyped.bind(this);
        this.onLinkEdited = this.onLinkEdited.bind(this);
        this.onLinkRemoved = this.onLinkRemoved.bind(this);
        this.onLinkUpdated = this.onLinkUpdated.bind(this);

    }

    async componentDidMount() {
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;
        const questions = (await axios.get(`/question`)).data[0];
        const reflections = (await axios.get(`/reflection/${this.props.user.id}/${this.state.selectedMomentDate}`)).data[0];

        const allGroupLinks = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
        const links = allGroupLinks.filter((link) => link.userid === this.props.user.id);

        if (reflections) {
            this.setState({ reflections, completedReflections: true, reflectionQuestions: reflections.reflectiontext.split(delimiter), goals, questions, links });
        } else {
            this.setState({ completedReflections: false, goals, questions, links });
        }
        this.checkTotalGoals();
    }

    checkTotalGoals() {
        if(this.state.goals.length === 0) {
            const goalsCompleted = (
                <div>
                    <p style={{ display:"inline-block" }}> You haven't recorded any goals for today yet! </p> 
                </div>
            );

            this.setState(() => {
                return { goalsCompleted };
            });
        }
        else {
            const goalsCompleted = this.state.goals.reduce((memo, goal) => { return memo ? goal.completed : false }, true) ?
            (
                <div>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <p style={{ display:"inline-block" }}> You've completed all of your goals for today! :) </p> 
                </div>
             
            ) :
            (
                <div>
                    <FontAwesomeIcon icon={faMinusCircle} />
                    <p style={{ display:"inline-block" }}> You haven't completed your goals yet, keep it up! </p> 
                </div>
            
            );

            this.setState(() => {
                return { goalsCompleted };
            });
        }
        
    }

    async onGoalCheck(completed, goal) {
        const updatedGoal = { goaltext: goal.goaltext, completed };
        await axios.put(`/goal/${goal.id}`, updatedGoal);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;

        this.setState(() => {
            return { goals };
        });
        
        this.checkTotalGoals();
    }

    onGoalTyped(event) {
        this.setState({ newGoalText: event.target.value });
    }

    async onGoalSubmitted(event) {
        event.preventDefault();
        const newGoal = { userid: this.props.user.id, goaldate: this.state.selectedMomentDate, goaltext: this.state.newGoalText, completed: false };
        await axios.post('/goal', newGoal);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;
        this.setState(() => {
            return { goals, newGoalText: '' };
        });
        this.checkTotalGoals();
    }

    async onGoalEdited(event, newText, goalId, completed) {
        event.preventDefault();
        const updatedGoal = { goaltext: newText, completed: completed };
        await axios.put(`/goal/${goalId}`, updatedGoal);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;
        this.setState(() => {
            return { goals };
        });
    }

    async onLinkEdited(event, newLink, newTitle, linkId) {
        event.preventDefault();
        const updatedLink = {link: newLink, title: newTitle };
        await axios.put(`/grouplinks/${linkId}`, updatedLink);

    }

    async onGoalRemoved(goalId) {
        event.preventDefault();
        await axios.delete(`/goal/${goalId}`);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;
        this.setState(() => {
            return { goals };
        });
        this.checkTotalGoals();
    }

    async onLinkRemoved(linkId) {
        event.preventDefault();
        await axios.delete(`/grouplinks/${linkId}`);
        const allGroupLinks = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
        const links = allGroupLinks.filter((link) => link.userid === this.props.user.id);
        this.setState({links});
    }
    async onLinkUpdated(linkId, newLinkName, newLinkText) {
        event.preventDefault();
        await axios.put(`grouplinks/${linkId}`, {link: newLinkText, title: newLinkName});
        const allGroupLinks = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
        const links = allGroupLinks.filter((link) => link.userid === this.props.user.id);
        this.setState({links});
    }

    async onReflectionSubmitted(event) {
        event.preventDefault();

        if (this.state.completedReflections) {
            await axios.put(`/reflection/${this.state.reflections.id}`, { reflectiontext: this.state.reflectionQuestions.join(delimiter) });
        } else {
            await axios.post(`/reflection`, { userid: this.props.user.id, reflectiondate: this.state.selectedMomentDate, reflectiontext: this.state.reflectionQuestions.join(delimiter) });
            this.setState({ completedReflections: true });
        }

        const reflections = (await axios.get(`/reflection/${this.props.user.id}/${this.state.selectedMomentDate}`)).data[0];
        this.setState({ reflections, editingReflections: false });
    }

    onReflectionOneChanged(event) {
        event.preventDefault();
        this.setState({ reflectionQuestions: this.state.reflectionQuestions.fill(event.target.value, 0, 1) });
    }

    onReflectionTwoChanged(event) {
        event.preventDefault();
        this.setState({ reflectionQuestions: this.state.reflectionQuestions.fill(event.target.value, 1, 2) });
    }

    onReflectionThreeChanged(event) {
        event.preventDefault();
        this.setState({ reflectionQuestions: this.state.reflectionQuestions.fill(event.target.value, 2) });
    }

    onEditButtonClick(event) {
        event.preventDefault();
        const editingReflections = !this.state.editingReflections;
        this.setState({ editingReflections });
    }

    async onDateChanged(date) {
        const selectedMomentDate = Moment(date).format('YYYY-MM-DD');
        this.setState({selectedMomentDate});
        const goals = (await axios.get(`/goals/${this.props.user.id}/${selectedMomentDate}`)).data;
        const reflections = (await axios.get(`/reflection/${this.props.user.id}/${selectedMomentDate}`)).data[0];
        if (reflections) {
            this.setState({ reflections, completedReflections: true, reflectionQuestions: reflections.reflectiontext.split(delimiter), goals, selectedDate: date, selectedMomentDate });
        } else {
            this.setState({ reflections: {}, reflectionQuestions: ["", "", ""], completedReflections: false, goals, selectedDate: date, selectedMomentDate });
        }
        this.checkTotalGoals();

    }

    onLinkTyped(event) {
        this.setState({ newLinkText: event.target.value });
    }

    onLinkNameTyped(event) {
        this.setState({newLinkName: event.target.value});
    }

    async onLinkSubmitted(event) {
        event.preventDefault();
        if(this.state.newLinkText !== '' && this.state.newLinkName !== '') {
            const newLink = { groupid: this.props.user.groupid, link: this.state.newLinkText, title: this.state.newLinkName, linkdate: todayDate, userid: this.props.user.id, username: this.props.user.firstname };
            await axios.post('/grouplinks', newLink);
            const allGroupLinks = (await axios.get(`/grouplinks/${this.props.user.groupid}`)).data;
            const links = allGroupLinks.filter((link) => link.userid === this.props.user.id);
            // const groupLinksApi = (await axios.get(`grouplinks/${this.props.user.groupid}`)).data;
            this.setState({newLinkText: '', newLinkName: '', links });
        }
    }    

    
    render() {
        const loading = this.props.user === null;

        return (
        <div>
                <Layout >
                    <h2>Home Page</h2>
                    {
                        loading ? (<p>Loading...</p>) :
                        (
                            <div>
                                <p>Welcome, {this.props.user.firstname}</p>
                                <DatePicker selected={this.state.selectedDate} onChange={this.onDateChanged} />
                                <div className="home-flex-container">
                                    <Goals goals={this.state.goals} goalsCompleted={this.state.goalsCompleted} onGoalCheck={this.onGoalCheck} onGoalAdded={this.onGoalSubmitted} onGoalTyped={this.onGoalTyped} onGoalEdited={this.onGoalEdited} onGoalRemoved={this.onGoalRemoved} newGoalText={this.state.newGoalText} selectedMomentDate={this.state.selectedMomentDate} />
                                    <GroupLinks onLinkRemoved={this.onLinkRemoved} onLinkUpdated={this.onLinkUpdated} links={this.state.links} newLinkText={this.state.newLinkText} newLinkName={this.state.newLinkName} onLinkTyped={this.onLinkTyped} onLinkSubmitted={this.onLinkSubmitted} onLinkNameTyped={this.onLinkNameTyped} onLinkEdited={this.onLinkEdited} editedLinkText={this.state.editedLinkText} editedLinkName={this.state.editedLinkName} />
                                </div>
                                <Reflections completedReflections={this.state.completedReflections} reflections={this.state.reflections} user={this.props.user} questions={this.state.questions} reflectionQuestions={this.state.reflectionQuestions} selectedMomentDate={this.state.selectedMomentDate} onReflectionSubmitted={this.onReflectionSubmitted} onReflectionOneChanged={this.onReflectionOneChanged} onReflectionTwoChanged={this.onReflectionTwoChanged} onReflectionThreeChanged={this.onReflectionThreeChanged} onEditButtonClick={this.onEditButtonClick} editingReflections={this.state.editingReflections} />
                            </div>
                        )
                    }
                </Layout>
        </div>
        );
    }
}

class Goals extends React.Component {
    render() {
        return (
            <div style={{ display: "inline-block", width: '35%', verticalAlign: 'top'}}>
                <h3>Goals</h3>
                <div style={{ marginRight: 15, paddingRight: 25, borderRight: '2px solid #DDD' }}>
                    <GoalList goals={this.props.goals} goalsCompleted={this.props.goalsCompleted} onGoalCheck={this.props.onGoalCheck} checkTotalGoals={this.props.checkTotalGoals} onGoalAdded={this.props.onGoalAdded} onGoalTyped={this.props.onGoalTyped} onGoalEdited={this.props.onGoalEdited} onGoalRemoved={this.props.onGoalRemoved} newGoalText={this.props.newGoalText} ></GoalList>
                </div>
            </div>
        );
    }
}

class GroupLinks extends React.Component {
    render() {
        const sortedLinks = this.props.links.sort(function(a, b){return a.id - b.id});
        const listLink = sortedLinks.map((link) => 
                <LinkItem key={"link-" + link.id} link={link} onLinkRemoved={this.props.onLinkRemoved} onLinkUpdated={this.props.onLinkUpdated} />);
        return(
            <div className="home-links">
                <h3>Group Links</h3>
                <div className="text-block">
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
                    {listLink}
                </div>
            </div>
        );
    }
}

class LinkItem extends React.Component {
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

class ListLinks extends React.Component {
    render() {
        return(
            <div className="goals">
            <Form className="editGoal" onSubmit={(event) => {
              this.props.onGoalEdited(event, this.state.goaltext, this.props.goal.id, this.props.goal.completed);
            }}>
              <Form.Row className="goal-row">
                <Col className="goal-input">
                    <Form.Control type="text" value="link name" />
                </Col>
                <Col>
                    <Form.Control type="text" value="link url" />
                </Col>
                <Col>
                  <Button type="submit">Update</Button>
                  <Button className="remove" onClick={() => this.props.onGoalRemoved(this.props.goal.id)}>Remove</Button>
                </Col>
              </Form.Row>
              {/* <input className="goalField" value={this.state.goaltext} onChange={(event) => this.setState({ goaltext: event.target.value })} /> */}
            </Form>
          </div>
        );
    }
}

class Reflections extends React.Component {
    render() {
        const viewMode = (
            <div className="text-block home-reflections">
                <p>1. {this.props.questions.questionone || "Loading Question 1..."}</p>
                <p>
                    {this.props.reflectionQuestions[0]}
                </p>
                <p>2. {this.props.questions.questiontwo || "Loading Question 2..."}</p>
                <p>
                    {this.props.reflectionQuestions[1]}
                </p>
                <p>3. {this.props.questions.questionthree || "Loading Question 3..."}</p>
                <p>
                    {this.props.reflectionQuestions[2]}
                </p>
                <Button className="editReflection" onClick={() => this.props.onEditButtonClick(event)}>Edit</Button>
            </div>
        );

        const editMode = (
            <Form className="editReflectionMode" onSubmit={this.props.onReflectionSubmitted}>
                <div className="text-block">
                    <p>{this.props.questions.questionone || "Loading Question 1..."}</p>
                    <Form.Control className="questionOne" as="textarea" rows="5" value={this.props.reflectionQuestions[0]} onChange={() => this.props.onReflectionOneChanged(event)} />
                    <br/>
                    <p>{this.props.questions.questiontwo || "Loading Question 2..."}</p>
                    <Form.Control className="questionTwo" as="textarea" rows="5" value={this.props.reflectionQuestions[1]} onChange={() => this.props.onReflectionTwoChanged(event)} />
                    <br/>
                    <p>{this.props.questions.questionthree || "Loading Question 3..."}</p>
                    <Form.Control className="questionThree" as="textarea" rows="5" value={this.props.reflectionQuestions[2]} onChange={() => this.props.onReflectionThreeChanged(event)} />
                </div>
                <Button type="submit" className="save-reflection">Save</Button>
            </Form>
        );

        return (
            <div>
                <h3>Reflections</h3>
                <p>Some guiding questions:</p>
                {this.props.editingReflections ? editMode : viewMode}
            </div>
        );
    }
}

/* Currently an unused feature */
class Note extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            note: {},
            noteText: "",
            editing: false,
            doneToday: true,
        }
        
        this.updateNote = this.updateNote.bind(this);
    }

    async componentDidMount() {
        const note = (await axios.get(`/note/${this.props.user.id}/${this.props.selectedMomentDate}`)).data[0];
        if (note) {
            this.setState({ note, doneToday: true, noteText: note.notetext });
        } else {
            this.setState({ doneToday: false })
        }
    }

    async updateNote(event) {
        event.preventDefault();
        
        if (this.state.doneToday) {
            await axios.put(`/note/${this.state.note.id}`, { notetext: this.state.noteText });
        } else {
            await axios.post(`/note`, { userid: this.props.user.id, notedate: this.props.selectedMomentDate, notetext: this.state.noteText });
            this.setState({ doneToday: true });
        }

        const note = (await axios.get(`/note/${this.props.user.id}/${this.props.selectedMomentDate}`)).data[0];
        this.setState({ note, editing: false });
    }

    render() {
        const viewMode = (
            <div className="text-block">
                <p>{ this.state.noteText }</p>
                <Button onClick={() => this.setState({ editing: true })}>Edit</Button>
            </div>
        )

        const editMode = (
            <Form className="text-block" onSubmit={this.updateNote}>
                <Form.Control as="textarea" rows="5" value={this.state.noteText} onChange={(event) => this.setState({ noteText: event.target.value })}></Form.Control>
                <Button type="submit">Save Note</Button>
            </Form>
        )

        return (
            <div>
                <h3>Notes for Your Professor:</h3>
                { this.state.editing ? editMode : viewMode }
            </div>
        )
    }
}


export { Home };
