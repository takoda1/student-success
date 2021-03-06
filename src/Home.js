import { Layout, GoalList, delimiter } from './shared';
import React from 'react';
import axios from 'axios';
import Moment from 'moment';
import "./Home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMinusCircle, faAngleDoubleLeft, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import DatePicker from "react-datepicker";
import Col from 'react-bootstrap/Col';
import Checkbox from './checkbox/Checkbox';

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
            weeklyGoals: [],
            unfilteredWeeklyGoals: [],
            newWeeklyText: '',
            weekDates: [],
            weekCompleted: [],
            weekDayNames: []
        };

        this.checkTotalGoals = this.checkTotalGoals.bind(this);
        this.onGoalTyped = this.onGoalTyped.bind(this);
        this.onGoalSubmitted = this.onGoalSubmitted.bind(this);
        this.onGoalCheck = this.onGoalCheck.bind(this);
        this.onGoalEdited = this.onGoalEdited.bind(this);
        this.onGoalRemoved = this.onGoalRemoved.bind(this);

        this.onWeeklyGoalTyped = this.onWeeklyGoalTyped.bind(this);
        this.onWeeklyGoalSubmitted = this.onWeeklyGoalSubmitted.bind(this);
        this.onWeeklyGoalEdited = this.onWeeklyGoalEdited.bind(this);
        this.onWeeklyGoalRemoved = this.onWeeklyGoalRemoved.bind(this);
        this.onWeeklyGoalCheck = this.onWeeklyGoalCheck.bind(this);
        this.makeDailyGoal = this.makeDailyGoal.bind(this);
        this.makeDailyGoalFromSub = this.makeDailyGoalFromSub.bind(this);

        this.onDateChanged = this.onDateChanged.bind(this);

        this.onReflectionSubmitted = this.onReflectionSubmitted.bind(this);
        this.onReflectionOneChanged = this.onReflectionOneChanged.bind(this);
        this.onReflectionTwoChanged = this.onReflectionTwoChanged.bind(this);
        this.onReflectionThreeChanged = this.onReflectionThreeChanged.bind(this);
        this.onExtraReflectionChanged = this.onExtraReflectionChanged.bind(this);
        this.onEditButtonClick = this.onEditButtonClick.bind(this);

    }

    async componentDidMount() {
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;
        const questions = (await axios.get(`/question/${this.props.user.classid}`)).data[0];
        const reflections = (await axios.get(`/reflection/${this.props.user.id}/${this.state.selectedMomentDate}`)).data[0];

        const weeklyGoals = (await axios.get(`/weeklyGoals/${this.props.user.id}`)).data;
        const filteredWeeklyGoals = weeklyGoals.filter(goal => (Moment(goal.completedate).format("YYYY-MM-DD") === "2100-01-01" || Moment(goal.completedate).format("YYYY-MM-DD") === this.state.selectedMomentDate));

        if (reflections) {
            this.setState({ reflections, completedReflections: true, reflectionQuestions: reflections.reflectiontext.split(delimiter), goals, questions, weeklyGoals: filteredWeeklyGoals, unfilteredWeeklyGoals: weeklyGoals });
        } else {
            this.setState({ completedReflections: false, goals, questions, weeklyGoals: filteredWeeklyGoals, unfilteredWeeklyGoals: weeklyGoals });
        }
        this.checkTotalGoals();

        window.gtag('event', 'Page View', {
            'event_category': 'Home',
            'event_label': `${this.props.user.lastname}, ${this.props.user.firstname}`,
        });


        const weekDates = [];
        const weekCompleted = [];
        const weekDayNames = [];

        for(var i=0; i<=6; i++) {
            weekDates.push(Moment(this.state.selectedDate).weekday(i).format("YYYY-MM-DD"));
            weekDayNames.push(Moment(this.state.selectedDate).weekday(i).format("dddd"));
        }

        var thisDaysGoals = [];
        for(i=0; i<weekDates.length; i++) {
            thisDaysGoals = (await axios.get(`/goals/${this.props.user.id}/${weekDates[i]}`)).data;
            if(thisDaysGoals.length === 0) {
                weekCompleted.push(null);
            }
            else {
                weekCompleted.push(thisDaysGoals.reduce((memo, goal) => { return memo ? goal.completed : false }, true));
            }
            
        }
        this.setState({weekDates, weekCompleted, weekDayNames});

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
                    <p style={{ display:"inline-block" }}> You've completed all of your goals for today! Good job!</p> 
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
        const updatedGoal = { 
            goaltext: goal.goaltext, 
            completed, 
            priority: goal.priority 
        };
        await axios.put(`/goal/${goal.id}`, updatedGoal);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;

        this.setState(() => {
            return { goals };
        });

        const weekDates = [];
        const weekCompleted = [];
        const weekDayNames = [];

        for(var i=0; i<=6; i++) {
            weekDates.push(Moment(this.state.selectedDate).weekday(i).format("YYYY-MM-DD"));
            weekDayNames.push(Moment(this.state.selectedDate).weekday(i).format("dddd"));
        }

        var thisDaysGoals = [];
        for(i=0; i<weekDates.length; i++) {
            thisDaysGoals = (await axios.get(`/goals/${this.props.user.id}/${weekDates[i]}`)).data;
            if(thisDaysGoals.length === 0) {
                weekCompleted.push(null);
            }
            else {
                weekCompleted.push(thisDaysGoals.reduce((memo, goal) => { return memo ? goal.completed : false }, true));
            }
            
        }
        this.setState({weekDates, weekCompleted, weekDayNames});
        
        this.checkTotalGoals();
    }

    onGoalTyped(event) {
        this.setState({ newGoalText: event.target.value });
    }

    async onGoalSubmitted(event) {
        event.preventDefault();
        const newGoal = { 
            userid: this.props.user.id, 
            goaldate: this.state.selectedMomentDate, 
            goaltext: this.state.newGoalText, 
            completed: false, 
            priority: (this.state.goals.length + 1) 
        };
        await axios.post('/goal', newGoal).then((response) => { }, (error) => {
            alert("There was an error trying to add the goal. Please make sure you filled everything out correctly and try again. Contact your instructor if the issue persists."); });
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;
        this.setState(() => {
            return { goals, newGoalText: '' };
        });

        const weekDates = [];
        const weekCompleted = [];
        const weekDayNames = [];

        for(var i=0; i<=6; i++) {
            weekDates.push(Moment(this.state.selectedDate).weekday(i).format("YYYY-MM-DD"));
            weekDayNames.push(Moment(this.state.selectedDate).weekday(i).format("dddd"));
        }

        var thisDaysGoals = [];
        for(i=0; i<weekDates.length; i++) {
            thisDaysGoals = (await axios.get(`/goals/${this.props.user.id}/${weekDates[i]}`)).data;
            if(thisDaysGoals.length === 0) {
                weekCompleted.push(null);
            }
            else {
                weekCompleted.push(thisDaysGoals.reduce((memo, goal) => { return memo ? goal.completed : false }, true));
            }
            
        }
        this.setState({weekDates, weekCompleted, weekDayNames});

        this.checkTotalGoals();
    }

    async onGoalEdited(event, newText, goalId, completed, priority) {
        event.preventDefault();
        const updatedGoal = { 
            goaltext: newText, 
            completed: completed, 
            priority 
        };
        await axios.put(`/goal/${goalId}`, updatedGoal);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;
        this.setState(() => {
            return { goals };
        });
    }

    onWeeklyGoalTyped(event) {
        this.setState({newWeeklyText: event.target.value});
    }

    async onWeeklyGoalSubmitted(event) {
        event.preventDefault();
        const newGoal = { 
            userid: this.props.user.id, 
            goaldate: this.state.selectedMomentDate, 
            goaltext: this.state.newWeeklyText, 
            completed: false, 
            completedate: "2100-01-01",
            priority: (this.state.unfilteredWeeklyGoals.length + 1) 
        };
        await axios.post('/weeklyGoal', newGoal).then((response) => { }, (error) => {
            alert("There was an error trying to submit the long term goal. Please make sure you filled everything out correctly and try again. Contact your instructor if the issue persists."); });
        const weeklyGoals = (await axios.get(`/weeklyGoals/${this.props.user.id}`)).data;
        const filteredWeeklyGoals = weeklyGoals.filter(goal => (Moment(goal.completedate).format("YYYY-MM-DD") === "2100-01-01" || Moment(goal.completedate).format("YYYY-MM-DD") === this.state.selectedMomentDate));
        this.setState(() => {
            return { weeklyGoals: filteredWeeklyGoals, newWeeklyText: '', unfilteredWeeklyGoals: weeklyGoals };
        });
    }

    async onWeeklyGoalEdited(event, newText, goalId, completed, completeDate, priority) {
        event.preventDefault();
        const updatedGoal = { 
            goaltext: newText, 
            completed: completed, 
            completedate: Moment(completeDate).format("YYYY-MM-DD"),
            priority
        };
        await axios.put(`/weeklyGoal/${goalId}`, updatedGoal);
        const weeklyGoals = (await axios.get(`/weeklyGoals/${this.props.user.id}`)).data;
        const filteredWeeklyGoals = weeklyGoals.filter(goal => (Moment(goal.completedate).format("YYYY-MM-DD") === "2100-01-01" || Moment(goal.completedate).format("YYYY-MM-DD") === this.state.selectedMomentDate));
        this.setState(() => {
            return { weeklyGoals: filteredWeeklyGoals, unfilteredWeeklyGoals: weeklyGoals };
        });
    }

    async onWeeklyGoalRemoved(goalId) {
        event.preventDefault();
        await axios.delete(`/weeklyGoal/${goalId}`);
        const weeklyGoals = (await axios.get(`/weeklyGoals/${this.props.user.id}`)).data;
        const filteredWeeklyGoals = weeklyGoals.filter(goal => (Moment(goal.completedate).format("YYYY-MM-DD") === "2100-01-01" || Moment(goal.completedate).format("YYYY-MM-DD") === this.state.selectedMomentDate));
        this.setState(() => {
            return { weeklyGoals: filteredWeeklyGoals, unfilteredWeeklyGoals: weeklyGoals };
        });
    }

    async onWeeklyGoalCheck(completed, goal) {
        var updatedGoal;
        if(completed === true) {
            updatedGoal = { goaltext: goal.goaltext, completed, completedate: this.state.selectedMomentDate, priority: goal.priority };
        }
        else {
            updatedGoal = { goaltext: goal.goaltext, completed, completedate: "2100-01-01", priority: goal.priority };
        }
        await axios.put(`/weeklyGoal/${goal.id}`, updatedGoal);
        const weeklyGoals = (await axios.get(`/weeklyGoals/${this.props.user.id}`)).data;
        const filteredWeeklyGoals = weeklyGoals.filter(goal => (Moment(goal.completedate).format("YYYY-MM-DD") === "2100-01-01" || Moment(goal.completedate).format("YYYY-MM-DD") === this.state.selectedMomentDate));

        this.setState(() => {
            return { weeklyGoals: filteredWeeklyGoals, unfilteredWeeklyGoals: weeklyGoals };
        });
    }

    async onGoalRemoved(goalId) {
        event.preventDefault();
        await axios.delete(`/goal/${goalId}`);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;
        this.setState(() => {
            return { goals };
        });

        const weekDates = [];
        const weekCompleted = [];
        const weekDayNames = [];

        for(var i=0; i<=6; i++) {
            weekDates.push(Moment(this.state.selectedDate).weekday(i).format("YYYY-MM-DD"));
            weekDayNames.push(Moment(this.state.selectedDate).weekday(i).format("dddd"));
        }

        var thisDaysGoals = [];
        for(i=0; i<weekDates.length; i++) {
            thisDaysGoals = (await axios.get(`/goals/${this.props.user.id}/${weekDates[i]}`)).data;
            if(thisDaysGoals.length === 0) {
                weekCompleted.push(null);
            }
            else {
                weekCompleted.push(thisDaysGoals.reduce((memo, goal) => { return memo ? goal.completed : false }, true));
            }
            
        }
        this.setState({weekDates, weekCompleted, weekDayNames});

        this.checkTotalGoals();
    }

    async onReflectionSubmitted(event) {
        event.preventDefault();

        if (this.state.completedReflections) {
            await axios.put(`/reflection/${this.state.reflections.id}`, { reflectiontext: this.state.reflectionQuestions.join(delimiter) }).then((response) => { }, (error) => {
                alert("There was an error trying to update your reflection response. Please make sure you filled everything out correctly and try again. Contact your instructor if the issue persists."); });
        } else {
            await axios.post(`/reflection`, { userid: this.props.user.id, reflectiondate: this.state.selectedMomentDate, reflectiontext: this.state.reflectionQuestions.join(delimiter) });
            this.setState({ completedReflections: true }).then((response) => { }, (error) => {
                alert("There was an error trying to submit your reflection response. Please make sure you filled everything out correctly and try again. Contact your instructor if the issue persists."); });
        }

        const reflections = (await axios.get(`/reflection/${this.props.user.id}/${this.state.selectedMomentDate}`)).data[0];
        this.setState({ reflections, editingReflections: false });
    }

    onReflectionOneChanged(event) {
        event.preventDefault();
        const reflectionQuestions = this.state.reflectionQuestions;
        reflectionQuestions[0] = event.target.value;
        this.setState({ reflectionQuestions });
    }

    onReflectionTwoChanged(event) {
        event.preventDefault();
        const reflectionQuestions = this.state.reflectionQuestions;
        reflectionQuestions[1] = event.target.value;
        this.setState({ reflectionQuestions });
    }

    onReflectionThreeChanged(event) {
        event.preventDefault();
        const reflectionQuestions = this.state.reflectionQuestions;
        reflectionQuestions[2] = event.target.value;
        this.setState({ reflectionQuestions });
    }

    onExtraReflectionChanged(event, index) {
        event.preventDefault();
        const reflectionQuestions = this.state.reflectionQuestions;
        reflectionQuestions[index] = event.target.value;
        this.setState({ reflectionQuestions });
    }

    onEditButtonClick(event) {
        event.preventDefault();
        const editingReflections = !this.state.editingReflections;
        this.setState({ editingReflections });
    }

    async makeDailyGoal(event, completed, text, subgoals) {
        event.preventDefault();

        const newGoal = { 
            userid: this.props.user.id, 
            goaldate: this.state.selectedMomentDate, 
            goaltext: text, 
            completed: completed, 
            priority: (this.state.goals.length + 1) 
        };
        await axios.post('/goal', newGoal);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;

        if(subgoals.length !== 0) {
            var newDailyGoal = goals.filter(goal => goal.goaltext === text);

            for(var i=0; i<subgoals.length; i++) {
                var newSubGoal = {
                    userid: this.props.user.id,
                    parentgoal: newDailyGoal[0].id,
                    goaldate: this.state.selectedMomentDate,
                    goaltext: subgoals[i].goaltext,
                    completed: subgoals[i].completed
                }
                await axios.post(`/subgoal`, newSubGoal);
            }
        }

        this.setState({goals});

        const weekDates = [];
        const weekCompleted = [];
        const weekDayNames = [];

        for(i=0; i<=6; i++) {
            weekDates.push(Moment(this.state.selectedDate).weekday(i).format("YYYY-MM-DD"));
            weekDayNames.push(Moment(this.state.selectedDate).weekday(i).format("dddd"));
        }

        var thisDaysGoals = [];
        for(i=0; i<weekDates.length; i++) {
            thisDaysGoals = (await axios.get(`/goals/${this.props.user.id}/${weekDates[i]}`)).data;
            if(thisDaysGoals.length === 0) {
                weekCompleted.push(null);
            }
            else {
                weekCompleted.push(thisDaysGoals.reduce((memo, goal) => { return memo ? goal.completed : false }, true));
            }
            
        }
        this.setState({weekDates, weekCompleted, weekDayNames});
        
        this.checkTotalGoals();

    }

    async makeDailyGoalFromSub(event, completed, text) {
        event.preventDefault();

        const newGoal = { 
            userid: this.props.user.id, 
            goaldate: this.state.selectedMomentDate, 
            goaltext: text, 
            completed: completed, 
            priority: (this.state.goals.length + 1) 
        };
        await axios.post('/goal', newGoal);
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedMomentDate}`)).data;

        this.setState({goals});

        const weekDates = [];
        const weekCompleted = [];
        const weekDayNames = [];

        for(var i=0; i<=6; i++) {
            weekDates.push(Moment(this.state.selectedDate).weekday(i).format("YYYY-MM-DD"));
            weekDayNames.push(Moment(this.state.selectedDate).weekday(i).format("dddd"));
        }

        var thisDaysGoals = [];
        for(i=0; i<weekDates.length; i++) {
            thisDaysGoals = (await axios.get(`/goals/${this.props.user.id}/${weekDates[i]}`)).data;
            if(thisDaysGoals.length === 0) {
                weekCompleted.push(null);
            }
            else {
                weekCompleted.push(thisDaysGoals.reduce((memo, goal) => { return memo ? goal.completed : false }, true));
            }
            
        }
        this.setState({weekDates, weekCompleted, weekDayNames});
        
        this.checkTotalGoals();

    }

    async onDateChanged(date) {
        const selectedMomentDate = Moment(date).format('YYYY-MM-DD');
        this.setState({selectedMomentDate});
        const goals = (await axios.get(`/goals/${this.props.user.id}/${selectedMomentDate}`)).data;
        const reflections = (await axios.get(`/reflection/${this.props.user.id}/${selectedMomentDate}`)).data[0];

        // const weeklyGoals = (await axios.get(`/weeklyGoals/${this.props.user.id}`)).data;
        // const filteredWeeklyGoals = weeklyGoals.filter(goal => (Moment(goal.completedate).format("YYYY-MM-DD") === "2100-01-01" || Moment(goal.completedate).format("YYYY-MM-DD") === this.state.selectedMomentDate));

        if (reflections) {
            this.setState({ reflections, completedReflections: true, reflectionQuestions: reflections.reflectiontext.split(delimiter), goals, selectedDate: date, selectedMomentDate });
        } else {
            this.setState({ reflections: {}, reflectionQuestions: [].fill("", 0, 3 + this.state.questions.additionalquestions.length), completedReflections: false, goals, selectedDate: date, selectedMomentDate });
        }

        const weekDates = [];
        const weekCompleted = [];
        const weekDayNames = [];

        for(var i=0; i<=6; i++) {
            weekDates.push(Moment(selectedMomentDate).weekday(i).format("YYYY-MM-DD"));
            weekDayNames.push(Moment(this.state.selectedDate).weekday(i).format("dddd"));
        }

        var thisDaysGoals = [];
        for(i=0; i<weekDates.length; i++) {
            thisDaysGoals = (await axios.get(`/goals/${this.props.user.id}/${weekDates[i]}`)).data;
            if(thisDaysGoals.length === 0) {
                weekCompleted.push(null);
            }
            else {
                weekCompleted.push(thisDaysGoals.reduce((memo, goal) => { return memo ? goal.completed : false }, true));
            }
            
        }
        this.setState({weekDates, weekCompleted});

        this.checkTotalGoals();

    }

    render() {
        const loading = this.props.user === null;

        return (
        <div>
                <Layout >
                    <h1>Home Page</h1>
                    {
                        loading ? (<p>Loading...</p>) :
                        (
                            <div>
                                <DatePicker selected={this.state.selectedDate} onChange={this.onDateChanged} /><br/><br/>
                                <WeekView weekDates={this.state.weekDates} weekCompleted={this.state.weekCompleted} weekDayNames={this.state.weekDayNames} />
                                <div className="home-flex-container">
                                    <Goals goals={this.state.goals} goalsCompleted={this.state.goalsCompleted} onGoalCheck={this.onGoalCheck} onGoalAdded={this.onGoalSubmitted} onGoalTyped={this.onGoalTyped} onGoalEdited={this.onGoalEdited} onGoalRemoved={this.onGoalRemoved} newGoalText={this.state.newGoalText} selectedMomentDate={this.state.selectedMomentDate} />
                                    <WeeklyGoals user={this.props.user} selectedMomentDate={this.state.selectedMomentDate} weeklyGoals={this.state.weeklyGoals} unfilteredWeeklyGoals={this.state.unfilteredWeeklyGoals} newWeeklyText={this.state.newWeeklyText} onWeeklyGoalTyped={this.onWeeklyGoalTyped} onWeeklyGoalSubmitted={this.onWeeklyGoalSubmitted} onWeeklyGoalEdited={this.onWeeklyGoalEdited} onWeeklyGoalRemoved={this.onWeeklyGoalRemoved} onWeeklyGoalCheck={this.onWeeklyGoalCheck} makeDailyGoal={this.makeDailyGoal} makeDailyGoalFromSub={this.makeDailyGoalFromSub} />
                                    <Reflections completedReflections={this.state.completedReflections} reflections={this.state.reflections} user={this.props.user} questions={this.state.questions} reflectionQuestions={this.state.reflectionQuestions} selectedMomentDate={this.state.selectedMomentDate} onReflectionSubmitted={this.onReflectionSubmitted} onReflectionOneChanged={this.onReflectionOneChanged} onReflectionTwoChanged={this.onReflectionTwoChanged} onReflectionThreeChanged={this.onReflectionThreeChanged} onExtraReflectionChanged={this.onExtraReflectionChanged} onEditButtonClick={this.onEditButtonClick} editingReflections={this.state.editingReflections} />
                                </div>
                            </div>
                        )
                    }
                </Layout>
        </div>
        );
    }
}

class WeekView extends React.Component {
    render() {
        return (
            <div className="calendar-week">
                <div className="calendar-day">
                    {this.props.weekDayNames[0]}<br/>
                    {Moment(this.props.weekDates[0]).format("MM/DD/YY")}<br/>
                    <CompletedGoal completed={this.props.weekCompleted[0]}/>
                </div>
                <div className="calendar-day">
                    {this.props.weekDayNames[1]}<br/>
                    {Moment(this.props.weekDates[1]).format("MM/DD/YY")}<br/>
                    <CompletedGoal completed={this.props.weekCompleted[1]}/>
                </div>
                <div className="calendar-day">
                    {this.props.weekDayNames[2]}<br/>
                    {Moment(this.props.weekDates[2]).format("MM/DD/YY")}<br/>
                    <CompletedGoal completed={this.props.weekCompleted[2]}/>
                </div>
                <div className="calendar-day">
                    {this.props.weekDayNames[3]}<br/>
                    {Moment(this.props.weekDates[3]).format("MM/DD/YY")}<br/>
                    <CompletedGoal completed={this.props.weekCompleted[3]}/>
                </div>
                <div className="calendar-day">
                    {this.props.weekDayNames[4]}<br/>
                    {Moment(this.props.weekDates[4]).format("MM/DD/YY")}<br/>
                    <CompletedGoal completed={this.props.weekCompleted[4]}/>
                </div>
                <div className="calendar-day">
                    {this.props.weekDayNames[5]}<br/>
                    {Moment(this.props.weekDates[5]).format("MM/DD/YY")}<br/>
                    <CompletedGoal completed={this.props.weekCompleted[5]}/>
                </div>
                <div className="calendar-day">
                    {this.props.weekDayNames[6]}<br/>
                    {Moment(this.props.weekDates[6]).format("MM/DD/YY")}<br/>
                    <CompletedGoal completed={this.props.weekCompleted[6]}/>
                </div>
            </div>
        )
    }
}

class CompletedGoal extends React.Component {
    render() {

        if(this.props.completed === false) {
            var isComplete = <FontAwesomeIcon icon={faMinusCircle} />;
        }
        else if(this.props.completed === true) {
            var isComplete = <FontAwesomeIcon icon={faCheckCircle} />
        }
        else {
            var isComplete = "-";
        }
        return(
            <span>
                {isComplete}
            </span>
        );
    }
}

class Goals extends React.Component {
    render() {
        return (
            <div style={{ display: "inline-block", verticalAlign: 'top'}}>
                <h2 style={{textAlign: 'center', textDecoration: 'underline'}}>Daily</h2>
                <h3>Goals</h3>
                <div>
                    <GoalList goals={this.props.goals} goalsCompleted={this.props.goalsCompleted} onGoalCheck={this.props.onGoalCheck} checkTotalGoals={this.props.checkTotalGoals} onGoalAdded={this.props.onGoalAdded} onGoalTyped={this.props.onGoalTyped} onGoalEdited={this.props.onGoalEdited} onGoalRemoved={this.props.onGoalRemoved} newGoalText={this.props.newGoalText} ></GoalList>
                </div>
            </div>
        );
    }
}

class WeeklyGoals extends React.Component {
    render() {
        return(
            <div className="weekly-goals-div">
                <h2 style={{textAlign: 'center', textDecoration: 'underline'}}>Long Term</h2>
                <h3>Goals</h3>
                <div>
                    <WeeklyGoalList user={this.props.user} selectedMomentDate={this.props.selectedMomentDate} weeklyGoals={this.props.weeklyGoals} unfilteredWeeklyGoals={this.props.unfilteredWeeklyGoals} newWeeklyText={this.props.newWeeklyText} onWeeklyGoalTyped={this.props.onWeeklyGoalTyped} onWeeklyGoalSubmitted={this.props.onWeeklyGoalSubmitted} onWeeklyGoalEdited={this.props.onWeeklyGoalEdited} onWeeklyGoalRemoved={this.props.onWeeklyGoalRemoved} onWeeklyGoalCheck={this.props.onWeeklyGoalCheck} makeDailyGoal={this.props.makeDailyGoal} makeDailyGoalFromSub={this.props.makeDailyGoalFromSub} />
                </div>
            </div>
        );
    }
}

class WeeklyGoalList extends React.Component {
    constructor(props) {
        super(props);
    
        this.state = {
          prioritizing: false,
        }
      }

    render() {
        const sortedWeeklyGoals = this.props.unfilteredWeeklyGoals.sort((a, b) => (a.priority > b.priority) ? 1 : -1);
        const listWeeklyGoals = sortedWeeklyGoals.map((g) => <WeeklyGoalItem key={g.id} goal={g} selectedMomentDate={this.props.selectedMomentDate} onWeeklyGoalEdited={this.props.onWeeklyGoalEdited} onWeeklyGoalRemoved={this.props.onWeeklyGoalRemoved} onWeeklyGoalCheck={this.props.onWeeklyGoalCheck} makeDailyGoal={this.props.makeDailyGoal} makeDailyGoalFromSub={this.props.makeDailyGoalFromSub} />);

        const viewMode = (
            <div>
                <Button onClick={() => this.setState({ prioritizing: true })}>Reorder List</Button>
                <ul className="goal-list">
                    {listWeeklyGoals}
                    <Form className="addGoal" onSubmit={this.props.onWeeklyGoalSubmitted}>
                        <Form.Row>
                            <Col className="goal-input">
                                <Form.Control type="text" className="addGoalField" value={this.props.newWeeklyText} onChange={this.props.onWeeklyGoalTyped} />
                            </Col>
                            <Col className="goal-buttons-col">
                                <Button type="submit">Add Goal</Button>
                            </Col>
                        </Form.Row>
                    </Form>
                </ul>
            </div>
        );

        const priorityMode = (
            <div>
              <ul className="goal-list">
                <Form onSubmit={ () => this.setState({ prioritizing: false }) }>
                  {sortedWeeklyGoals.map((goal) => {
                    return (
                      <Form.Row key={goal.id}>
                        <Col>{goal.goaltext}</Col>
                        <Col>
                          <Form.Control as="select" value={goal.priority} onChange={async (event) => {
                            event.preventDefault();
                            await this.props.onWeeklyGoalEdited(event, goal.goaltext, goal.id, goal.completed, goal.completedate, event.target.value);
                          }}>
                              <option key={0} >{0}</option>
                              {this.props.unfilteredWeeklyGoals.map((group, index) => <option key={index+1}>{index+1}</option>)}
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    );
                  })}
                  <Button type="submit">Close</Button>
                </Form>
              </ul>
            </div>
          );
          return this.state.prioritizing ? priorityMode : viewMode;
    }
}

class WeeklyGoalItem extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            editing: false,
            goaltext: this.props.goal.goaltext,
            showSubgoalBox: false,
            subgoals: [],
            subgoalText: ''
        };
    }

    async componentDidMount() {
        const subgoals = (await axios.get(`/weeklySubgoalByParent/${this.props.goal.id}`)).data;
        this.setState({ subgoals });
    }

    render() {
        const editMode = (
            <Form className="editGoal" onSubmit={(event) => {
                this.setState({editing: !this.state.editing});
                this.props.onWeeklyGoalEdited(
                    event, 
                    this.state.goaltext, 
                    this.props.goal.id, 
                    this.props.goal.completed, 
                    this.props.goal.completedate,
                    this.props.goal.priority
                );
            }}>
                <Form.Row className="goal-row">
                    <Col className="goal-input">
                        <Form.Control type="text" className="goalField" value={this.state.goaltext} 
                            onChange={(event) => this.setState({goaltext: event.target.value})} />
                    </Col>
                    <Col>
                        <Button type="submit">Update</Button>
                    </Col>
                </Form.Row>
            </Form>
        );

        const viewMode = (
            <div className="home-goal-list">
                <Form.Row className="goals-form-row">
                    <Col className="goal-check-col">
                        <Checkbox onToggle={() => {this.props.onWeeklyGoalCheck(!this.props.goal.completed, this.props.goal);}} completed={this.props.goal.completed}>{this.state.goaltext}</Checkbox>
                    </Col>
                    <Col className="goal-buttons-col">
                        <Button className="edit" onClick={() => this.setState({editing: !this.state.editing })}>Edit</Button>
                        <Button className="remove" onClick={() => this.props.onWeeklyGoalRemoved(this.props.goal.id)}>Remove</Button>
                        <OverlayTrigger overlay={<Tooltip className="make-daily-goal-tooltip">Create Daily Goal</Tooltip>}>
                            <Button onClick={(event) => this.props.makeDailyGoal(event, this.props.goal.completed, this.state.goaltext, this.state.subgoals)} size="sm" id="weeklySubgoalToggle">
                                <FontAwesomeIcon icon={faAngleDoubleLeft} />
                            </Button>
                        </OverlayTrigger>
                        <Button size="sm" id="weeklySubgoalToggle" onClick={() => this.setState({ showSubgoalBox: !this.state.showSubgoalBox })}
                            >{ this.state.showSubgoalBox ? <FontAwesomeIcon icon={faMinus} /> : <FontAwesomeIcon icon={faPlus} /> }</Button>
                    </Col>
                </Form.Row>
                {
                    this.state.subgoals.sort(function(a,b){return a.id - b.id}).map((subgoal) => {
                        return (
                            <Form.Row className="sub-goal-row" key={subgoal.id}>
                                <Col>
                                    <Checkbox completed={subgoal.completed} onToggle={async () => {
                                        const updated = { completed: !subgoal.completed, goaltext: subgoal.goaltext };
                                        await axios.put(`/weeklySubgoal/${subgoal.id}`, updated);
                                        const subgoals = (await axios.get(`/weeklySubgoalByParent/${this.props.goal.id}`)).data;
                                        this.setState({ subgoals });
                                    }}>{subgoal.goaltext}</Checkbox>
                                </Col>
                                <Col className="goal-buttons-col">
                                    <Button className="remove small-button" onClick={async (event) => {
                                        event.preventDefault();
                                        await axios.delete(`/weeklySubgoal/${subgoal.id}`);
                                        const subgoals = (await axios.get(`/weeklySubgoalByParent/${this.props.goal.id}`)).data;
                                        this.setState({ subgoals });
                                    }}>Remove</Button>
                                    <OverlayTrigger overlay={<Tooltip className="make-daily-goal-tooltip">Create Daily Goal</Tooltip>}>
                                        <Button onClick={(event) => this.props.makeDailyGoalFromSub(event, subgoal.completed, subgoal.goaltext)} size="sm" id="weeklySubgoalToggle">
                                            <FontAwesomeIcon icon={faAngleDoubleLeft} />
                                        </Button>
                                    </OverlayTrigger>
                                </Col>
                            </Form.Row>
                        );
                    })
                }
                {
                    this.state.showSubgoalBox ? (
                        <Form className="addSubGoal" onSubmit={async (event) => {
                            event.preventDefault();
                            const subgoal = { 
                                userid: this.props.goal.userid, 
                                parentgoal: this.props.goal.id, 
                                goaldate: Moment(this.props.goal.goaldate).format("YYYY-MM-DD"), 
                                goaltext: this.state.subgoalText, 
                                completed: false 
                            };
                            await axios.post(`/weeklySubgoal`, subgoal);
                            const subgoals = (await axios.get(`/weeklySubgoalByParent/${this.props.goal.id}`)).data;
                            this.setState({ subgoals, subgoalText: '' });
                        }}>
                            <Form.Row className="sub-goal-row">
                                <Col className="goal-input">
                                    <Form.Control type="text" className="goalField" value={this.state.subgoalText} onChange={(event) => this.setState({ subgoalText: event.target.value })} />
                                </Col>
                                <Col className="goal-buttons-col">
                                    <Button type="submit" className="small-button">Add Subgoal</Button>
                                </Col>
                            </Form.Row>
                        </Form>
                    ) : null
                }
            </div>
        );
        return(
            <div className="goals">
                {this.state.editing? editMode : viewMode }
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
                {this.props.questions.additionalquestions ? this.props.questions.additionalquestions.map((question, index) => {
                    return (
                        <div key={index}>
                            <p>{4 + index}. {question}</p>
                            <p>{this.props.reflectionQuestions[index + 3]}</p>
                        </div>
                    )
                }) : null}
                <Button className="editReflection" onClick={() => this.props.onEditButtonClick(event)}>Edit</Button>
            </div>
        );

        const editMode = (
            <Form className="editReflectionMode" onSubmit={this.props.onReflectionSubmitted}>
                <div className="text-block home-reflections">
                    <p>{this.props.questions.questionone || "Loading Question 1..."}</p>
                    <Form.Control className="questionOne" as="textarea" rows="5" value={this.props.reflectionQuestions[0]} onChange={() => this.props.onReflectionOneChanged(event)} />
                    <br/>
                    <p>{this.props.questions.questiontwo || "Loading Question 2..."}</p>
                    <Form.Control className="questionTwo" as="textarea" rows="5" value={this.props.reflectionQuestions[1]} onChange={() => this.props.onReflectionTwoChanged(event)} />
                    <br/>
                    <p>{this.props.questions.questionthree || "Loading Question 3..."}</p>
                    <Form.Control className="questionThree" as="textarea" rows="5" value={this.props.reflectionQuestions[2]} onChange={() => this.props.onReflectionThreeChanged(event)} />
                    {this.props.questions.additionalquestions ? this.props.questions.additionalquestions.map((question, index) => {
                        return (
                            <div key={index}>
                                <p>{4 + index}. {question}</p>
                                <Form.Control as="textarea" rows="5" value={this.props.reflectionQuestions[index + 3]} onChange={() => this.props.onExtraReflectionChanged(event, index + 3)} />
                            </div>
                        )
                    }) : null}
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

function renderTooltip() {
    return (
      <Tooltip id="button-tooltip">
        Simple tooltip
      </Tooltip>
    );
  }

/* Currently an unused feature */
// class Note extends React.Component {
//     constructor(props) {
//         super(props);

//         this.state = {
//             note: {},
//             noteText: "",
//             editing: false,
//             doneToday: true,
//         }
        
//         this.updateNote = this.updateNote.bind(this);
//     }

//     async componentDidMount() {
//         const note = (await axios.get(`/note/${this.props.user.id}/${this.props.selectedMomentDate}`)).data[0];
//         if (note) {
//             this.setState({ note, doneToday: true, noteText: note.notetext });
//         } else {
//             this.setState({ doneToday: false })
//         }
//     }

//     async updateNote(event) {
//         event.preventDefault();
        
//         if (this.state.doneToday) {
//             await axios.put(`/note/${this.state.note.id}`, { notetext: this.state.noteText });
//         } else {
//             await axios.post(`/note`, { userid: this.props.user.id, notedate: this.props.selectedMomentDate, notetext: this.state.noteText });
//             this.setState({ doneToday: true });
//         }

//         const note = (await axios.get(`/note/${this.props.user.id}/${this.props.selectedMomentDate}`)).data[0];
//         this.setState({ note, editing: false });
//     }

//     render() {
//         const viewMode = (
//             <div className="text-block">
//                 <p>{ this.state.noteText }</p>
//                 <Button onClick={() => this.setState({ editing: true })}>Edit</Button>
//             </div>
//         )

//         const editMode = (
//             <Form className="text-block" onSubmit={this.updateNote}>
//                 <Form.Control as="textarea" rows="5" value={this.state.noteText} onChange={(event) => this.setState({ noteText: event.target.value })}></Form.Control>
//                 <Button type="submit">Save Note</Button>
//             </Form>
//         )

//         return (
//             <div>
//                 <h3>Notes for Your Professor:</h3>
//                 { this.state.editing ? editMode : viewMode }
//             </div>
//         )
//     }
// }


export { Home };
