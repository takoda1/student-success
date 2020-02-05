import { Layout, GoalList, secondsToHms, delimiter } from './shared';
import React, { Fragment } from 'react';
import { Prompt } from 'react-router-dom';
import axios from 'axios';
import Moment from 'moment';
import "./Home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import soundfile from '../public/alarm.mp3';
import DatePicker from "react-datepicker";

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
            editingReflections: false
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
    }

    async componentDidMount() {
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;
        const questions = (await axios.get(`/question`)).data[0];
        const reflections = (await axios.get(`/reflection/${this.props.user.id}/${this.state.selectedMomentDate}`)).data[0];

        if (reflections) {
            this.setState({ reflections, completedReflections: true, reflectionQuestions: reflections.reflectiontext.split(delimiter), goals, questions });
        } else {
            this.setState({ completedReflections: false, goals, questions });
        }

        // this.setState({ goals, questions});
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

    async onGoalRemoved(goalId) {
        event.preventDefault();
        await axios.delete(`/goal/${goalId}`);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;
        this.setState(() => {
            return { goals };
        });
        this.checkTotalGoals();
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
        // this.setState(() => {
        //     return { goals, selectedDate: date, selectedMomentDate, reflection }
        // });
        this.checkTotalGoals();

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
                                <div>
                                    <Goals goals={this.state.goals} goalsCompleted={this.state.goalsCompleted} onGoalCheck={this.onGoalCheck} onGoalAdded={this.onGoalSubmitted} onGoalTyped={this.onGoalTyped} onGoalEdited={this.onGoalEdited} onGoalRemoved={this.onGoalRemoved} newGoalText={this.state.newGoalText} selectedMomentDate={this.state.selectedMomentDate} />
                                    {/* <Timers user={this.props.user} selectedMomentDate={this.state.selectedMomentDate} /> */}
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
                <h3>Today's Goals</h3>
                <div style={{ marginRight: 15, paddingRight: 25, borderRight: '2px solid #DDD' }}>
                    <GoalList goals={this.props.goals} goalsCompleted={this.props.goalsCompleted} onGoalCheck={this.props.onGoalCheck} checkTotalGoals={this.props.checkTotalGoals} onGoalAdded={this.props.onGoalAdded} onGoalTyped={this.props.onGoalTyped} onGoalEdited={this.props.onGoalEdited} onGoalRemoved={this.props.onGoalRemoved} newGoalText={this.props.newGoalText} ></GoalList>
                </div>
            </div>
        );
    }
}

class Reflections extends React.Component {
    render() {
        const viewMode = (
            <div className="text-block">
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
                <h3>Today's Reflections</h3>
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
