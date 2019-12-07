import { Layout, GoalList, secondsToHms, delimiter } from './shared';
import React, { Fragment } from 'react';
import axios from 'axios';
import Moment from 'moment';
import "./Home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import soundfile from '../public/alarm.mp3';

const todayDate = Moment().format('YYYY-MM-DD');

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            goals: [], /* API call gets made in componentDidMount */
            newGoalText: '',
            goalsCompleted: "Loading...",
            questions: {},
        };

        this.checkTotalGoals = this.checkTotalGoals.bind(this);
        this.onGoalTyped = this.onGoalTyped.bind(this);
        this.onGoalSubmitted = this.onGoalSubmitted.bind(this);
        this.onGoalCheck = this.onGoalCheck.bind(this);
        this.onGoalEdited = this.onGoalEdited.bind(this);
        this.onGoalRemoved = this.onGoalRemoved.bind(this);
    }

    async componentDidMount() {
        const goals = (await axios.get(`/goals/${this.props.user.id}/${todayDate}`)).data;
        const questions = (await axios.get(`/question`)).data[0];
        this.setState({ goals, questions });
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
        const goals = (await axios.get(`/goals/${this.props.user.id}/${todayDate}`)).data;

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
        const newGoal = { userid: this.props.user.id, goaldate: todayDate, goaltext: this.state.newGoalText, completed: false };
        await axios.post('/goal', newGoal);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${todayDate}`)).data;
        this.setState(() => {
            return { goals, newGoalText: '' };
        });
        this.checkTotalGoals();
    }

    async onGoalEdited(event, newText, goalId, completed) {
        event.preventDefault();
        const updatedGoal = { goaltext: newText, completed: completed };
        await axios.put(`/goal/${goalId}`, updatedGoal);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${todayDate}`)).data;
        this.setState(() => {
            return { goals };
        });
    }

    async onGoalRemoved(goalId) {
        event.preventDefault();
        await axios.delete(`/goal/${goalId}`);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${todayDate}`)).data;
        this.setState(() => {
            return { goals };
        });
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
                                <div>
                                    <Goals goals={this.state.goals} goalsCompleted={this.state.goalsCompleted} onGoalCheck={this.onGoalCheck} onGoalAdded={this.onGoalSubmitted} onGoalTyped={this.onGoalTyped} onGoalEdited={this.onGoalEdited} onGoalRemoved={this.onGoalRemoved} newGoalText={this.state.newGoalText} />
                                    <Timers user={this.props.user} />
                                </div>
                                <Reflections user={this.props.user} questions={this.state.questions} />
                                <Note user={this.props.user} />
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

class Timers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            timers: {}, /* API call */
            customName: "Custom",
            manualTime: 0,
            manualCategory: "Writing",
            alarm: false
        }

        this.updateTimers = this.updateTimers.bind(this);
        this.updateCustomName = this.updateCustomName.bind(this);
    }

    async componentDidMount() {
        const timers = (await axios.get(`/timer/${this.props.user.id}/${todayDate}`)).data[0];
        this.setState({ timers });
    }

    updateCustomName(customName) {
        this.setState({ customName });
    }

    async updateTimers(time, category) {
        const which = `${category}time`;
        const timerTemplate = this.state.timers ? 
            { writingtime: this.state.timers.writingtime, researchtime: this.state.timers.researchtime, customtime: this.state.timers.customtime } :
            { writingtime: 0, researchtime: 0, customtime: 0 };
        timerTemplate[which] += time;

        if (this.state.timers) {
            await axios.put(`/timer/${this.state.timers.id}`, { ...timerTemplate });
        } else {
            await axios.post(`/timer`, {...timerTemplate, userid: this.props.user.id, timerdate: todayDate });
        }

        const timers = (await axios.get(`/timer/${this.props.user.id}/${todayDate}`)).data[0];
        this.setState({ timers })
    }

    render() {
        const ready = this.state.timers;

        return (
            <div style={{ display: "inline-block", width: '50%', verticalAlign: 'top' }}>
                <div>
                    <h3 style={{ display: "inline-block", width: '60%', marginRight: 15, paddingRight: 25 }} >Timers</h3>
                    <h3 style={{ display: "inline-block", width: '30%' }} >Today's Times</h3>
                </div>
                <div>
                    <div className="timers-list" style={{ display: "inline-block", width: '60%', verticalAlign: 'top', marginRight: 15, paddingRight: 25, borderRight: '2px solid #DDD'  }}>
                        <Timer name="Writing" updateTimers={this.updateTimers} category="writing" />
                        <Timer name="Research" updateTimers={this.updateTimers} category="research" />
                        <Timer name={this.state.customName} updateTimers={this.updateTimers} updateCustomName={this.updateCustomName} category="custom" />
                    </div>
                    <div style={{ display: "inline-block", verticalAlign: 'top' }}>
                        <table className="timers-table" >
                            <tbody>
                                <tr>
                                    <th>Writing</th>
                                    <td>{ready ? secondsToHms(this.state.timers.writingtime) : secondsToHms(0) }</td>
                                </tr>
                                <tr>
                                    <th>Research</th>
                                    <td>{ready ? secondsToHms(this.state.timers.researchtime) : secondsToHms(0) }</td>
                                </tr>
                                <tr>
                                    <th>Custom</th>
                                    <td>{ready ? secondsToHms(this.state.timers.customtime) : secondsToHms(0) }</td>
                                </tr>
                            </tbody>
                        </table>
                        <br />
                        <Form className="text-block add-time" onSubmit={async (event) => {
                            event.preventDefault();
                            const time = Number.parseInt(this.state.manualTime) * 60;
                            if (time) {
                                await this.updateTimers(time, this.state.manualCategory.toLowerCase());
                            }
                        }}>
                            <Form.Label>Enter Time Manually: </Form.Label>
                            <Form.Control as="select" value={this.state.manualCategory} onChange={(event) => this.setState({ manualCategory: event.target.value })}>
                                <option>Writing</option>
                                <option>Research</option>
                                <option>Custom</option>
                            </Form.Control>
                            <Form.Control placeholder="Enter time in minutes..." type="number" onChange={(event) => this.setState({manualTime: event.target.value})} />
                            <Button type="submit">Add Time</Button>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: 0,
            goal: 30 * 60,
            start: 0,
            editingTime: false,
            editingName: false,
            active: false
        }

        this.startTimer = this.startTimer.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
        this.resetTimer = this.resetTimer.bind(this);
        this.timerFinished = this.timerFinished.bind(this);
    }

    startTimer() {
        clearInterval(this.timer);
        this.setState({
            time: this.state.time,
            start: Math.floor(Date.now()/1e3) - this.state.time,
            active: true
        });
        this.timer = setInterval(() => {
            this.setState({
                time: Math.floor(Date.now()/1e3) - this.state.start
            });
            if (this.state.time >= this.state.goal) {
                this.stopTimer();
                this.timerFinished();
            }
        }, 100);
    }

    stopTimer() {
        clearInterval(this.timer);
        this.setState({ active: false });
    }

    resetTimer() {
        this.stopTimer();
        this.props.updateTimers(this.state.time, this.props.category);
        this.setState({ time: 0 })
    }


    async timerFinished() {
        const alarmAudio = document.getElementsByClassName("audio-sound")[0];
        alarmAudio.play();
        alert("Time complete!");
        alarmAudio.pause();
        this.resetTimer();
    }

    render() {
        const editTimeMode = (
            <Form onSubmit={() => this.setState({ editingTime: false })}>
                <Form.Row>
                    <Col>
                        <Form.Label>Enter Time in Minutes: </Form.Label>
                    </Col>
                    <Col>
                        <Form.Control type="number" value={this.state.goal / 60 } onChange={(event) => this.setState({ goal: event.target.value * 60 })} />
                    </Col>
                </Form.Row>
                <Button type="submit">Save</Button>
            </Form>
        );

        const editNameMode = (
            <Form onSubmit={() => this.setState({ editingName: false })}>
                <Form.Row>
                    <Col>
                        <Form.Label>What Are You Timing?</Form.Label>
                    </Col>
                    <Col>
                        <Form.Control type="text" onChange={(event) => this.props.updateCustomName(event.target.value) } />
                    </Col>
                </Form.Row>
                <Button type="submit">Save</Button>
            </Form>
        );
        
        const startB = this.state.active ? null : (<Button onClick={this.startTimer}>start</Button>);
        const stopB = this.state.active ? (<Button onClick={this.stopTimer}>pause</Button>) : null;
        const resetB = this.state.active ? null : (<Button onClick={this.resetTimer}>submit this time</Button>);
        const editTimeB = this.state.active ? null : (<Button onClick={() => this.setState({ editingTime: true })}>enter time</Button>);
        const editNameB = this.state.active ? null : (<Button onClick={() => this.setState({ editingName: true })}>change name</Button>);

        const viewMode = (
            <div>
                <p style={{ display: 'inline-block', width: '40%' }}>
                    {this.props.name}: {secondsToHms(Math.floor((this.state.goal - this.state.time)))}
                </p>
                <div style={{ display: 'inline-block' }}>
                    {startB}
                    {stopB}
                    {resetB}
                    {" "}
                    {editTimeB}
                </div>
                {this.props.category === 'custom' ? editNameB : null }
            </div>
        );

        return (
            <Fragment>
                <audio className="audio-sound">
                    <source src={soundfile}></source>
                </audio>
                <div className="timers">
                    {this.state.editingTime ? editTimeMode : this.state.editingName ? editNameMode : viewMode }
                </div>
            </Fragment>
        );
    }
}

class Reflections extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            reflection: {},
            reflectionQuestions: ["", "", ""],
            editing: false,
            doneToday: true,
        }

        this.onReflectionSubmitted = this.onReflectionSubmitted.bind(this);
    }

    async componentDidMount() {
        const reflection = (await axios.get(`/reflection/${this.props.user.id}/${todayDate}`)).data[0];
        if (reflection) {
            this.setState({ reflection, doneToday: true, reflectionQuestions: reflection.reflectiontext.split(delimiter) });
        } else {
            this.setState({ doneToday: false });
        }
    }

    async onReflectionSubmitted(event) {
        event.preventDefault();
        if (this.state.doneToday) {
            await axios.put(`/reflection/${this.state.reflection.id}`, { reflectiontext: this.state.reflectionQuestions.join(delimiter) });
        } else {
            await axios.post(`/reflection`, { userid: this.props.user.id, reflectiondate: todayDate, reflectiontext: this.state.reflectionQuestions.join(delimiter) });
            this.setState({ doneToday: true });
        }

        const reflection = (await axios.get(`/reflection/${this.props.user.id}/${todayDate}`)).data[0];
        this.setState({ reflection, editing: false });
    }

    render() {
        const viewMode = (
            <div className="text-block">
                <p>1. {this.props.questions.questionone || "Loading Question 1..."}</p>
                <p>
                    {this.state.reflectionQuestions[0]}
                </p>
                <p>2. {this.props.questions.questiontwo || "Loading Question 2..."}</p>
                <p>
                    {this.state.reflectionQuestions[1]}
                </p>
                <p>3. {this.props.questions.questionthree || "Loading Question 3..."}</p>
                <p>
                    {this.state.reflectionQuestions[2]}
                </p>
                <Button className="editReflection" onClick={() => this.setState({ editing: !this.state.editing })}>Edit</Button>
            </div>
        );

        const editMode = (
            <Form className="editReflectionMode" onSubmit={this.onReflectionSubmitted}>
                <div className="text-block">
                    <p>{this.props.questions.questionone || "Loading Question 1..."}</p>
                    <Form.Control className="questionOne" as="textarea" rows="5" value={this.state.reflectionQuestions[0]} onChange={(event) => this.setState({ reflectionQuestions: this.state.reflectionQuestions.fill(event.target.value, 0, 1) })} />
                    <br/>
                    <p>{this.props.questions.questiontwo || "Loading Question 2..."}</p>
                    <Form.Control className="questionTwo" as="textarea" rows="5" value={this.state.reflectionQuestions[1]} onChange={(event) => this.setState({ reflectionQuestions: this.state.reflectionQuestions.fill(event.target.value, 1, 2) })} />
                    <br/>
                    <p>{this.props.questions.questionthree || "Loading Question 3..."}</p>
                    <Form.Control className="questionThree" as="textarea" rows="5" value={this.state.reflectionQuestions[2]} onChange={(event) => this.setState({ reflectionQuestions: this.state.reflectionQuestions.fill(event.target.value, 2) })} />
                </div>
                <Button type="submit" className="save-reflection">Save</Button>
            </Form>
        );

        return (
            <div>
                <h3>Today's Reflections</h3>
                <p>Some guiding questions:</p>
                {this.state.editing ? editMode : viewMode}
            </div>
        );
    }
}

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
        const note = (await axios.get(`/note/${this.props.user.id}/${todayDate}`)).data[0];
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
            await axios.post(`/note`, { userid: this.props.user.id, notedate: todayDate, notetext: this.state.noteText });
            this.setState({ doneToday: true });
        }

        const note = (await axios.get(`/note/${this.props.user.id}/${todayDate}`)).data[0];
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
