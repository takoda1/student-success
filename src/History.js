import React, { Component, Fragment } from 'react';
import './History.css';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Moment from 'moment';
import { secondsToHms } from './shared';
import Chart from 'react-apexcharts'
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import soundfile from '../public/alarm.mp3';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const todayDate = Moment().format('YYYY-MM-DD');
const today = new Date();
var writingDataPoints = [];
var researchDataPoints = [];
var customDataPoints = [];

class History extends Component {
    constructor(props) {
        super(props);

        this.state = {
            timers: {},
            selectedDate: todayDate,
            unformattedDate: today,
            options: {},
            series: [],
            customName: "Writing",
            manualTime: 0,
            manualCategory: "Writing",
            alarm: false,

            customTimers: [],
            distinctCustomNames: [],
            allCustomTimers: [],
        };

        this.onDateChanged = this.onDateChanged.bind(this);
        this.updateTimers = this.updateTimers.bind(this);
        this.updateCustomTimer = this.updateCustomTimer.bind(this);
        this.updateCustomName = this.updateCustomName.bind(this);
        this.onChangeManualCategory = this.onChangeManualCategory.bind(this);
        this.onChangeManualTime = this.onChangeManualTime.bind(this);
        this.onSubmitManualTime = this.onSubmitManualTime.bind(this);

    }

    async componentDidMount() {
        const timers = (await axios.get(`/timer/${this.props.user.id}/${this.state.selectedDate}`)).data[0];
        const customTimers = (await axios.get(`/customTimer/${this.props.user.id}/${this.state.selectedDate}`)).data;
        const distinctCustomNames = (await axios.get(`/customTimerByUser/${this.props.user.id}`)).data;

        var allCustomTimers = [];
        for(var i=0; i<distinctCustomNames.length; i++) {
            var time = customTimers.filter((timer) => timer.name === distinctCustomNames[i].name);
            var pushTimer = {};
            if(time.length === 0) {
                pushTimer = {name: distinctCustomNames[i].name, time: 0};
            }
            else {
                pushTimer = {name: distinctCustomNames[i].name, time: time[0].time};
            }
            allCustomTimers.push(pushTimer);
        }

        this.setState({ timers, customTimers, distinctCustomNames, allCustomTimers });

        window.gtag('event', 'Page View', {
            'event_category': 'Timers',
            'event_label': `${this.props.user.lastname}, ${this.props.user.firstname}`,
        });

        askNotificationPermission();

        const getTimers = (await axios.get(`/timerByUser/${this.props.user.id}`)).data;
        const allTimers  = getTimers.sort((a,b) => new Moment(a.timerdate).format('YYYYMMDD') - new Moment(b.timerdate).format('YYYYMMDD'));
        var startWeek = Moment(allTimers[0].timerdate).week();
        var thisWeek = startWeek;
        var writing = 0;
        var research = 0;
        var custom = 0;

        var weeks = [];
        var startDate = Moment(allTimers[0].timerdate).weekday(0);

        var today = Moment(allTimers[allTimers.length-1].timerdate).weekday(7);
        while(startDate.isBefore(today)) {
            let startDateWeek = startDate.weekday(0).format('MM/DD');
            let endDateWeek = startDate.weekday(6).format('MM/DD');
            startDate.add(7,'days');
            weeks.push(startDateWeek.concat(" - ", endDateWeek));
        }

        for (var i = 0; i < allTimers.length; i++) {
            if (Moment(allTimers[i].timerdate).week() === thisWeek) {
                writing += allTimers[i].writingtime;
                research += allTimers[i].researchtime;
                custom += allTimers[i].customtime;
                console.log(thisWeek, Moment(allTimers[i]).week());
                if (i === allTimers.length - 1) {
                    writingDataPoints.push(writing / 3600);
                    researchDataPoints.push(research / 3600);
                    customDataPoints.push(custom / 3600);
                }
            }
            else {
                writingDataPoints.push(writing / 3600);
                researchDataPoints.push(research / 3600);
                customDataPoints.push(custom / 3600);

                writing = 0;
                research = 0;
                custom = 0;

                var numWeeks = 0;
                if(Moment(allTimers[i-1].timerdate).week() < Moment(allTimers[i].timerdate).week()) {
                    numWeeks = (Moment(allTimers[i].timerdate).week() - Moment(allTimers[i-1].timerdate).week()-1);
                }
                else {
                    numWeeks = (52 - Moment(allTimers[i-1].timerdate).week() + Moment(allTimers[i].timerdate).week()-1);
                }

                if(numWeeks >= 1) {
                    // console.log(numWeeks, Moment(allTimers[i-1].timerdate).format('MM/DD/YY'), Moment(allTimers[i].timerdate).format('MM/DD/YY'));
                    for(var j = 0; j< numWeeks; j++) {
                        writingDataPoints.push(0);
                        researchDataPoints.push(0);
                        customDataPoints.push(0);
                    }
                    writing = 0;
                    research = 0;
                    custom = 0;
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
                }
            }

        }

        var maxY = Math.max(...writingDataPoints, ...researchDataPoints, ...customDataPoints);

        var options = {
            colors: ['#4B9CD3', '#13294B', '#6AC9D2'],
            chart: {
                id: 'Timer Stats',
                background: '#fff'
            },
            xaxis: {
                categories: weeks,
                title: {
                    text: 'Weeks',
                    style: {
                        fontSize: '1em'
                    }
                },
                labels: {
                    trim: false,
                    style: {
                        fontSize: '14px'
                    }
                },
            },
            yaxis: {
                decimalsInFloat: 0,
                title: {
                    text: 'Total Hours',
                    style: {
                        fontSize: '1em'
                    }
                },
                min: 0,
                max: Math.ceil(maxY) + 2,
                tickAmount: (Math.ceil(maxY) + 2)/2,
                labels: {
                    style: {
                        fontSize: '14px'
                    }
                }
            },
            title: {
                text: 'Timer Hours Per Week',
                align: 'center',
                style: {
                    fontSize: '1.75em'
                },
                offsetY: 30
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
        var series = [
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
        this.setState({ options, series });
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
            await axios.put(`/timer/${this.state.timers.id}`, { ...timerTemplate }).then((response) => { }, (error) => {
                alert("There was an error trying to update your time. Contact your instructor if the issue persists."); });
        } else {
            await axios.post(`/timer`, { ...timerTemplate, userid: this.props.user.id, timerdate: this.state.selectedDate }).then((response) => { }, (error) => {
                alert("There was an error trying to submit the submit your time. Contact your instructor if the issue persists."); });
        }

        const timers = (await axios.get(`/timer/${this.props.user.id}/${this.state.selectedDate}`)).data[0];
        this.setState({ timers })
    }

    async updateCustomTimer(time, category) {

        window.gtag('event', 'Logged Time', {
            'event_category': 'Timers',
            'event_label': `${this.props.user.lastname}, ${this.props.user.firstname}`,
            'value': time
        });

        if (category === 'Writing' || category === 'Research') {
            const which = `${category.toLowerCase()}time`;
            const timerTemplate = this.state.timers ?
                { writingtime: this.state.timers.writingtime, researchtime: this.state.timers.researchtime, customtime: this.state.timers.customtime } :
                { writingtime: 0, researchtime: 0, customtime: 0 };
            timerTemplate[which] += time;

            if (this.state.timers) {
                await axios.put(`/timer/${this.state.timers.id}`, { ...timerTemplate }).then((response) => { }, (error) => {
                    alert("There was an error trying to update your time. Contact your instructor if the issue persists."); });
            } else {
                await axios.post(`/timer`, { ...timerTemplate, userid: this.props.user.id, timerdate: this.state.selectedDate }).then((response) => { }, (error) => {
                    alert("There was an error trying to submit your time. Contact your instructor if the issue persists."); });
            }

            const timers = (await axios.get(`/timer/${this.props.user.id}/${this.state.selectedDate}`)).data[0];
            this.setState({ timers })
            return;
        }

        const filtered = this.state.customTimers.filter((timer) => timer.name === category);
        const savedTimer = filtered.length === 0 ? null : filtered[0];
        const timerTemplate = (savedTimer == null) ?
            { name: category, time } : { name: category, time: savedTimer.time + time };

        const timerTemplate2 = this.state.timers ?
            { writingtime: this.state.timers.writingtime, researchtime: this.state.timers.researchtime, customtime: this.state.timers.customtime } :
            { writingtime: 0, researchtime: 0, customtime: 0 };
        timerTemplate2["customtime"] += time;

        if (savedTimer == null) {
            await axios.post(`/customTimer`, { ...timerTemplate, userid: this.props.user.id, timerdate: this.state.selectedDate }).then((response) => { }, (error) => {
                alert("There was an error trying to submit your time. Contact your instructor if the issue persists."); });
        } else {
            await axios.put(`/customTimer/${savedTimer.id}`, timerTemplate).then((response) => { }, (error) => {
                alert("There was an error trying to update your time. Contact your instructor if the issue persists."); });
        }

        if (this.state.timers) {
            await axios.put(`/timer/${this.state.timers.id}`, { ...timerTemplate2 }).then((response) => { }, (error) => {
                alert("There was an error trying to update your time. Contact your instructor if the issue persists."); });
        } else {
            await axios.post(`/timer`, { ...timerTemplate2, userid: this.props.user.id, timerdate: this.state.selectedDate }).then((response) => { }, (error) => {
                alert("There was an error trying to submit your time. Contact your instructor if the issue persists."); });
        }

        const customTimers = (await axios.get(`/customTimer/${this.props.user.id}/${this.state.selectedDate}`)).data;
        const distinctCustomNames = (await axios.get(`/customTimerByUser/${this.props.user.id}`)).data;
        const timers = (await axios.get(`/timer/${this.props.user.id}/${this.state.selectedDate}`)).data[0];

        var allCustomTimers = [];
        for(var i=0; i<distinctCustomNames.length; i++) {
            var time = customTimers.filter((timer) => timer.name === distinctCustomNames[i].name);
            var pushTimer = {};
            if(time.length === 0) {
                pushTimer = {name: distinctCustomNames[i].name, time: 0};
            }
            else {
                pushTimer = {name: distinctCustomNames[i].name, time: time[0].time};
            }
            allCustomTimers.push(pushTimer);
        }

        this.setState({ customTimers, distinctCustomNames, timers, allCustomTimers });
    }

    onChangeManualCategory(event) {
        this.setState({ manualCategory: event.target.value })
    }

    onChangeManualTime(event) {
        this.setState({ manualTime: event.target.value })
    }

    async onSubmitManualTime(event) {
        event.preventDefault();
        const time = Number.parseInt(this.state.manualTime) * 60;
        if (time) {
            if (this.state.manualCategory === "Writing" || this.state.manualCategory === "Research") {
                await this.updateTimers(time, this.state.manualCategory.toLowerCase());
            } else {
                await this.updateCustomTimer(time, this.state.manualCategory);
            }
        }
    }

    async onDateChanged(date) {
        const selectedDate = Moment(date).format('YYYY-MM-DD');
        this.setState({ selectedDate, unformattedDate: date });
        const timers = (await axios.get(`/timer/${this.props.user.id}/${selectedDate}`)).data[0];
        const customTimers = (await axios.get(`/customTimer/${this.props.user.id}/${this.state.selectedDate}`)).data;

        var allCustomTimers = [];
        for(var i=0; i<this.state.distinctCustomNames.length; i++) {
            var time = customTimers.filter((timer) => timer.name === this.state.distinctCustomNames[i].name);
            var pushTimer = {};
            if(time.length === 0) {
                pushTimer = {name: this.state.distinctCustomNames[i].name, time: 0};
            }
            else {
                pushTimer = {name: this.state.distinctCustomNames[i].name, time: time[0].time};
            }
            allCustomTimers.push(pushTimer);
        }

        this.setState({
            timers,
            customTimers,
            allCustomTimers
        });
    }



    render() {
        return (
            <div><br />
                <div className="history-date-picker" >
                    <h1>Timers</h1>
                    <DatePicker selected={this.state.unformattedDate} onChange={this.onDateChanged} />
                </div>
                <div>
                    <div className="history-grid-goals">
                        <Timers timers={this.state.timers} customTimers={this.state.customTimers} allCustomTimers={this.state.allCustomTimers} distinctCustomNames={this.state.distinctCustomNames} user={this.props.user} selectedDate={this.state.selectedDate} customName={this.state.customName} manualTime={this.state.manualTime} manualCategory={this.state.manualCategory} alarm={this.state.alarm} updateTimers={this.updateTimers} updateCustomTimer={this.updateCustomTimer} updateCustomName={this.updateCustomName} onChangeManualCategory={this.onChangeManualCategory} onChangeManualTime={this.onChangeManualTime} onSubmitManualTime={this.onSubmitManualTime} />
                    </div>
                </div><br /><br />
                <div className="history-graph">
                    <Chart options={this.state.options} series={this.state.series} type="line" width={1000} />
                </div>

            </div>
        );
    }
}

class Timers extends Component {
    render() {
        const ready = this.props.timers;

        return (
            <div style={{ display: "inline-block", paddingLeft: '100px', width: '100%', verticalAlign: 'top' }}>
                    <h3 style={{ display: "inline-block", width: '30%' }} >Recorded Times</h3>
                <div>
                    <div style={{ display: "inline-block", verticalAlign: 'top' }}>
                        <div className="timer-pls-work">
                        <div className="timers-table" >
                            <div className="timer-table-body">
                                <TimerEntry name="Writing" time={ready ? this.props.timers.writingtime : 0 } 
                                    updateCustomTimer={this.props.updateCustomTimer} 
                                    updateTimers={this.props.updateTimers} />
                                <TimerEntry name="Research" time={ready ? this.props.timers.researchtime : 0 } 
                                    updateCustomTimer={this.props.updateCustomTimer} 
                                    updateTimers={this.props.updateTimers} />
                                {
                                    this.props.allCustomTimers.map((timer) => {
                                        return (
                                            <TimerEntry key={timer.name} name={timer.name} time={timer.time}
                                                updateCustomTimer={this.props.updateCustomTimer} 
                                                updateTimers={this.props.updateTimers} />
                                        )
                                    })
                                }
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className="timers-list" style={{ display: "inline-block", width: '70%', verticalAlign: 'top', marginLeft: 15, paddingLeft: 25, borderLeft: '2px solid #DDD' }}>
                        <Timer customTimers={this.props.customTimers} distinctCustomNames={this.props.distinctCustomNames} name={this.props.customName} updateTimers={this.props.updateCustomTimer} updateCustomName={this.props.updateCustomName} category="custom" />
                        <br />
                    </div>

                </div>
            </div>
        );
    }
}

class TimerEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: false,
            adding: false,
            time: 0,
        }
    }

    render() {
        const viewMode = (
            <Form>
                <Form.Row key={this.props.name}>
                    <Col>{this.props.name}</Col>
                    <Col>{secondsToHms(this.props.time)}</Col>
                    <Button size="sml" onClick={() => this.setState({ editing: true, adding: true })}>Add</Button>
                    <Button onClick={() => this.setState({ editing: true, adding: false })}>Subtract</Button>
                </Form.Row>
            </Form>
        )

        const editMode = (
            <Form key={this.props.name} onSubmit={async (event) => {
                event.preventDefault();
                const modifier = this.state.adding ? 1 : -1;
                const time = Number.parseInt(this.state.time) * 60 * modifier;
                if (time) {
                    if (this.props.name === "Writing" || this.props.name === "Research") {
                        await this.props.updateTimers(time, this.props.name.toLowerCase());
                    } else {
                        await this.props.updateCustomTimer(time, this.props.name);
                    }
                }
                this.setState({ editing: false })
            }}>
                <Form.Row >
                    <Col>{this.props.name}</Col>
                    <Col>{secondsToHms(this.props.time)}</Col>
                    <Button type="submit">{this.state.adding ? "Add" : "Subtract"}</Button>
                    <Button onClick={() => this.setState({ editing: false })}>Cancel</Button>
                </Form.Row>
                <Form.Control placeholder="Enter time in minutes..." type="number" 
                    onChange={() => this.setState({ time: event.target.value })} />
            </Form>
        )

        return this.state.editing ? editMode : viewMode;
    }
}

class Timer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: 0,
            goal: 30 * 60,
            start: 0,
            editingTime: false,
            editingName: false,
            newName: false,
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
            start: Math.floor(Date.now() / 1e3) - this.state.time,
            active: true
        });
        this.timer = setInterval(() => {
            this.setState({
                time: Math.floor(Date.now() / 1e3) - this.state.start
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
        const timerName = this.props.category === "custom" ? this.props.name : this.props.category;
        this.props.updateTimers(this.state.time, timerName);
        this.setState({ time: 0 })
    }


    async timerFinished() {
        if (Notification.permission === "granted") {
            var notification = new Notification("Time complete!");
        }
        const alarmAudio = document.getElementsByClassName("audio-sound")[0];
        alarmAudio.play();
        alert("Time complete!");
        alarmAudio.pause();
        this.resetTimer();
    }

    render() {
        const editTimeMode = (
            <Form style={ { 'padding': '30px' } } onSubmit={() => this.setState({ editingTime: false })}>
                <Form.Row>
                    <Col>
                        <Form.Label>Enter Time in Minutes: </Form.Label>
                    </Col>
                    <Col>
                        <Form.Control type="number" value={this.state.goal / 60} onChange={(event) => this.setState({ goal: event.target.value * 60 })} />
                    </Col>
                </Form.Row>
                <Button type="submit">Save</Button>
            </Form>
        );

        const editNameMode = (
            <Form style={ { 'padding': '30px' } } onSubmit={() => this.setState({ editingName: false })}>
                <Form.Row>
                    <Col>
                        <Form.Label>What Are You Timing?</Form.Label>
                    </Col>
                    <Col>
                        <Form.Control as="select" value={this.props.name} onChange={() => this.props.updateCustomName(event.target.value)}>
                            <option>Writing</option>
                            <option>Research</option>
                            {
                                this.props.distinctCustomNames.map((timer) => <option key={timer.name}>{timer.name}</option>)
                            }
                        </Form.Control>
                    </Col>
                </Form.Row>
                <Button type="submit">Save</Button>
            </Form>
        );

        const newNameMode = (
            <Form style={ { 'padding': '30px' } } onSubmit={async () => {
                event.preventDefault();
                await this.props.updateTimers(0, this.props.name);
                this.setState({ newName: false })
            }}>
                <Form.Row>
                    <Col><Form.Label>New Timer Name: </Form.Label></Col>
                    <Col>
                        <Form.Control type="text" onChange={(event) => this.props.updateCustomName(event.target.value)} />
                    </Col>
                </Form.Row>
                <Button type="submit">Add</Button>
            </Form>
        );

        const startB = this.state.active ? null : (<Button onClick={this.startTimer}>start</Button>);
        const stopB = this.state.active ? (<Button onClick={this.stopTimer}>pause</Button>) : null;
        const resetB = this.state.active ? null : (<Button onClick={this.resetTimer}>submit this time</Button>);
        const editTimeB = this.state.active ? null : (<Button onClick={() => this.setState({ editingTime: true })}>set time limit</Button>);
        const editNameB = this.state.active ? null : (<Button onClick={() => this.setState({ editingName: true })}>switch timer</Button>);
        const newNameB = this.state.active ? null : (<Button onClick={() => this.setState({ newName: true })}>add new timer</Button>);

        const viewMode = (
            <div>
                <div><p>
                    {secondsToHms(Math.floor((this.state.goal - this.state.time)))}
                </p></div>
                <h4>{this.props.name}</h4>
                <div style={{ display: 'inline-block' }}>
                    {startB}
                    {stopB}
                    {resetB}
                    {" "}
                    {editTimeB}
                </div>
                {this.props.category === 'custom' ? editNameB : null}
                {this.props.category === 'custom' ? newNameB : null}
            </div>
        );

        return (
            <Fragment>
                <audio className="audio-sound">
                    <source src={soundfile}></source>
                </audio>
                <div className="timers">
                    {this.state.editingTime ? editTimeMode : this.state.editingName ? editNameMode : this.state.newName ? newNameMode : viewMode}
                </div>
            </Fragment>
        );
    }
}


// Functions


function checkNotificationPromise() {
    try {
        Notification.requestPermission().then();
    } catch (e) {
        return false;
    }

    return true;
}

function askNotificationPermission() {
    // function to actually ask the permissions
    function handlePermission(permission) {
        // Whatever the user answers, we make sure Chrome stores the information
        if (!('permission' in Notification)) {
            Notification.permission = permission;
        }

        // set the button to shown or hidden, depending on what the user answers
        if (Notification.permission === 'denied' || Notification.permission === 'default') {
            Notification.requestPermission().then(function (result) {
                console.log(result);
            });
        }
    }
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
        console.log("This browser does not support notifications.");
    } else {
        if (checkNotificationPromise()) {
            Notification.requestPermission()
                .then((permission) => {
                    handlePermission(permission);
                })
        } else {
            Notification.requestPermission(function (permission) {
                handlePermission(permission);
            });
        }
    }
}
export { History };
