import React, { Component, Fragment } from 'react';
import './Timers.css';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const todayDate = Moment().format('YYYY-MM-DD');
const today = new Date();

class TimerPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            timers: {},
            selectedDate: todayDate,
            unformattedDate: today,
            options: {},
            series: [],
            customName: "",
            manualTime: 0,
            manualCategory: "",
            alarm: false,

            customTimers: [],
            distinctCustomNames: [],
            allCustomTimers: [],
        };

        this.onDateChanged = this.onDateChanged.bind(this);
        this.updateTimers = this.updateTimers.bind(this);
        this.updateCustomName = this.updateCustomName.bind(this);
        this.onChangeManualCategory = this.onChangeManualCategory.bind(this);
        this.onChangeManualTime = this.onChangeManualTime.bind(this);
        this.onSubmitManualTime = this.onSubmitManualTime.bind(this);
        this.deleteCustomTimer = this.deleteCustomTimer.bind(this);

    }

    async componentDidMount() {
        const timers = (await axios.get(`/timer/${this.props.user.id}/${this.state.selectedDate}`)).data[0];
        const customTimers = (await axios.get(`/customTimer/${this.props.user.id}/${this.state.selectedDate}`)).data;
        const distinctCustomNames = (await axios.get(`/customTimerByUser/${this.props.user.id}`)).data.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));

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

        this.setState({ timers, customTimers, distinctCustomNames, allCustomTimers, customName: distinctCustomNames[0].name, manualCategory: distinctCustomNames[0].name });

        window.gtag('event', 'Page View', {
            'event_category': 'Timers',
            'event_label': `${this.props.user.lastname}, ${this.props.user.firstname}`,
        });

        askNotificationPermission();

        const getCustom = (await axios.get(`/allCustomTimers/${this.props.user.id}`)).data;
        const allCustom  = getCustom.sort((a,b) => new Moment(a.timerdate).format('YYYYMMDD') - new Moment(b.timerdate).format('YYYYMMDD'));
        var graphSeries = [];
        if(allCustom.length > 0) {
            var startWeek = Moment(allCustom[0].timerdate).week();

            graphSeries = distinctCustomNames.map(timer => { return { name: timer.name, data: [] }});

            var weeks = [];
            var momentWeeks = [];
            var startDate = Moment(allCustom[0].timerdate).weekday(0);

            var today = Moment(allCustom[allCustom.length-1].timerdate).weekday(7);
            while(startDate.isBefore(today)) {
                let startDateWeek = startDate.weekday(0).format('MM/DD');
                let endDateWeek = startDate.weekday(6).format('MM/DD');
                startDate.add(7,'days');
                weeks.push(startDateWeek.concat(" - ", endDateWeek));
                momentWeeks.push({week: startWeek, year: Moment(startDate.weekday(0)).year()});
                if(startWeek === 52) {
                    startWeek = 0;
                }
                startWeek += 1;
            }

            console.log(Moment("12/25/2019").week());

            var filterByName;
            var filterByWeek;

            // this depends on distinctCustomNames being sorted. Currently sorted alphabetically, can be changed
            // as long as it is consistenly sorted the same way throughout the page

            for(var i=0; i<distinctCustomNames.length; i++) {
                filterByName = allCustom.filter((timer) => timer.name === distinctCustomNames[i].name);
                for(var j=0; j<momentWeeks.length; j++) {
                    filterByWeek = filterByName.filter((timer) => Moment(timer.timerdate).week() === momentWeeks[j].week && Moment(timer.timerdate).year() === momentWeeks[j].year);
                    if(filterByWeek.length > 0) {
                        var totalHrs = filterByWeek.reduce((a, b) => a + b.time, 0) / 3600;
                        graphSeries[i].data.push(totalHrs);
                    }
                    else {
                        graphSeries[i].data.push(0)
                    }

                }
            }
        }
        else {
            graphSeries = [];
        }


        var maxArray = [];

        for(i=0; i<graphSeries.length; i++) {
            maxArray.push(Math.max(...graphSeries[i].data));
        }

        var maxY = Math.max(...maxArray);

        var options = {
            colors: ['#0b476b', '#106699', '#329c8d', '#7abe9a', '#ebefcd', '#d3b276'],
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
                max: Math.ceil(maxY) + 1,
                tickAmount: (Math.ceil(maxY) + 1)/2,
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
        var series = graphSeries;
        this.setState({ options, series });
    }

    updateCustomName(customName) {
        this.setState({ customName });
    }

    async updateTimers (time, category) {

        window.gtag('event', 'Logged Time', {
            'event_category': 'Timers',
            'event_label': `${this.props.user.lastname}, ${this.props.user.firstname}`,
            'value': time
        });

        const filtered = this.state.customTimers.filter((timer) => timer.name === category);
        const savedTimer = filtered.length === 0 ? null : filtered[0];
        const timerTemplate = (savedTimer == null) ?
            { name: category, time } : { name: category, time: savedTimer.time + time };

        const timerTemplate2 = this.state.timers ?
            { writingtime: this.state.timers.writingtime, researchtime: this.state.timers.researchtime, customtime: this.state.timers.customtime } :
            { writingtime: 0, researchtime: 0, customtime: 0 };
        timerTemplate2["customtime"] += time;

        if (savedTimer === null) {
            await axios.post(`/customTimer`, { ...timerTemplate, userid: this.props.user.id, timerdate: this.state.selectedDate }).then((response) => { }, (error) => {
                alert("There was an error trying to submit your time. Contact your instructor if the issue persists."); });
        } else {
            await axios.put(`/customTimer/${savedTimer.id}`, timerTemplate).then((response) => { }, (error) => {
                alert("There was an error trying to update your time. Contact your instructor if the issue persists."); });
        }

        const customTimers = (await axios.get(`/customTimer/${this.props.user.id}/${this.state.selectedDate}`)).data;
        const distinctCustomNames = (await axios.get(`/customTimerByUser/${this.props.user.id}`)).data.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
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
            await this.updateTimers(time, this.state.manualCategory);
        }
    }

    async deleteCustomTimer(name) {
        event.preventDefault();

        if(confirm("WARNING: Deleting your timer '" + name + "' will also delete any previous times submitted for this timer. It will also no longer be shown in the graph below. This CANNOT be undone. Are you sure you want to delete '" + name + "'?" )) {
            await axios.delete(`/customTimerName/${name}`);
            const customTimers = (await axios.get(`/customTimer/${this.props.user.id}/${this.state.selectedDate}`)).data;
            const distinctCustomNames = (await axios.get(`/customTimerByUser/${this.props.user.id}`)).data.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));

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
            this.setState({distinctCustomNames, allCustomTimers});
        }
        else {
            // do nothing
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
                        <Timers timers={this.state.timers} customTimers={this.state.customTimers} allCustomTimers={this.state.allCustomTimers} distinctCustomNames={this.state.distinctCustomNames} user={this.props.user} selectedDate={this.state.selectedDate} customName={this.state.customName} manualTime={this.state.manualTime} manualCategory={this.state.manualCategory} alarm={this.state.alarm} updateTimers={this.updateTimers} updateCustomName={this.updateCustomName} onChangeManualCategory={this.onChangeManualCategory} onChangeManualTime={this.onChangeManualTime} onSubmitManualTime={this.onSubmitManualTime} deleteCustomTimer={this.deleteCustomTimer} />
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
        const returnAllTimers = this.props.allCustomTimers.length > 0 ? this.props.allCustomTimers.map((timer) => {
            return (
                <TimerEntry key={timer.name} name={timer.name} time={timer.time}
                    updateTimers={this.props.updateTimers} deleteCustomTimer={this.props.deleteCustomTimer} />
            )
        }) : <div className="no-timers-div">You currently have no timers. You can add a new timer by clicking the "Add New Timer" button on the right. Please note that you are allowed a maximum of 6 timers.</div>;

        return (
            <div style={{ display: "inline-block", width: '100%', verticalAlign: 'top' }}>
                    <h3 style={{ display: "inline-block", width: '30%', marginLeft: '3vw' }} >Recorded Times</h3>
                <div>
                    <div style={{ display: "inline-block", verticalAlign: 'top', marginLeft: '3vw' }}>
                        <div className="timer-pls-work">
                        <div className="timers-table" >
                            <div className="timer-table-body">
                                    {returnAllTimers}
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className="timers-list" style={{ display: "inline-block", width: '65%', marginLeft: '2vw', verticalAlign: 'top' }}>
                        <Timer customTimers={this.props.customTimers} distinctCustomNames={this.props.distinctCustomNames} name={this.props.customName} updateTimers={this.props.updateTimers} updateCustomName={this.props.updateCustomName} category="custom" />
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
                    <Button size="sml" onClick={() => this.setState({ editing: true, adding: true })}> <FontAwesomeIcon icon={faPlus} /> </Button>
                    <Button onClick={() => this.setState({ editing: true, adding: false })}> <FontAwesomeIcon icon={faMinus} /> </Button>
                    <Button size="sml" onClick={() => this.props.deleteCustomTimer(this.props.name)}>Delete</Button>
                </Form.Row>
            </Form>
        )

        const editMode = (
            <Form key={this.props.name} onSubmit={async (event) => {
                event.preventDefault();
                const modifier = this.state.adding ? 1 : -1;
                const time = Number.parseInt(this.state.time) * 60 * modifier;
                if (time) {
                    await this.props.updateTimers(time, this.props.name);
                }
                this.setState({ editing: false })
            }}>
                <Form.Row >
                    <Col>{this.props.name}</Col>
                    <Col>{secondsToHms(this.props.time)}</Col>
                    <Button type="submit">{this.state.adding ? <FontAwesomeIcon icon={faPlus} /> : <FontAwesomeIcon icon={faMinus} />}</Button>
                    <Button onClick={() => this.setState({ editing: false })}>Cancel</Button>
                </Form.Row>
                <Form.Control placeholder={this.state.adding ?  "Enter time in minutes to add..." : "Enter time in minutes to subtract..."} type="number" 
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
            active: false,
        }

        this.startTimer = this.startTimer.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
        this.resetTimer = this.resetTimer.bind(this);
        this.timerFinished = this.timerFinished.bind(this);
        this.checkCustomNames = this.checkCustomNames.bind(this);
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

    async checkCustomNames(time, category) {
        const newName = this.props.distinctCustomNames.filter((timer) => timer.name === category);

        if(newName.length === 0 && this.props.distinctCustomNames.length >= 6) {
            alert("Error: you are only allowed a maximum of 6 timers. Please delete one of your current timers before adding a new one. Warning, deleting a timer will delete all the time data associated with it.");
        }
        else {
            this.props.updateTimers(time, category);
            this.setState({ newName: false })
        }
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
                await this.checkCustomNames(0, this.props.name);
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
export { TimerPage };
