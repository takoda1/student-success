import React, { Component, Fragment } from 'react';
import './History.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMinusCircle, faCaretRight, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Moment from 'moment';
import { getTodaysDate, secondsToHms, Goals, delimiter, fixDateWithYear } from './shared';
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
            customName: "Custom",
            manualTime: 0,
            manualCategory: "Writing",
            alarm: false,
        };

        this.onDateChanged = this.onDateChanged.bind(this);
        this.updateTimers = this.updateTimers.bind(this);
        this.updateCustomName = this.updateCustomName.bind(this);
        this.onChangeManualCategory = this.onChangeManualCategory.bind(this);
        this.onChangeManualTime = this.onChangeManualTime.bind(this);
        this.onSubmitManualTime = this.onSubmitManualTime.bind(this);
    }

    async componentDidMount() {
        const timers = (await axios.get(`/timer/${this.props.user.id}/${this.state.selectedDate}`)).data[0];
        this.setState({ timers });

        const allTimers = (await axios.get(`/timerByUser/${this.props.user.id}`)).data;
        var startWeek = Moment(allTimers[0].timerdate).week();
        var thisWeek = startWeek;
        var xAxis = []
        var writing = 0;
        var research = 0;
        var custom = 0;
        for(var i=0; i<allTimers.length; i++) {
            if(Moment(allTimers[i].timerdate).week() === thisWeek) {
                writing += allTimers[i].writingtime;
                research += allTimers[i].researchtime;
                custom += allTimers[i].customtime;
                if(i === allTimers.length -1) {
                    writingDataPoints.push(writing/3600);
                    researchDataPoints.push(research/3600);
                    customDataPoints.push(custom/3600);
                    xAxis.push(thisWeek-startWeek+1);
                }
            }
            else {
                writingDataPoints.push(writing/3600);
                researchDataPoints.push(research/3600);
                customDataPoints.push(custom/3600);
                xAxis.push(thisWeek-startWeek+1);

                while(Moment(allTimers[i].timerdate).week() > thisWeek+1) {
                    writingDataPoints.push(0);
                    researchDataPoints.push(0);
                    customDataPoints.push(0);
                    xAxis.push(thisWeek-startWeek+2);
                    thisWeek += 1;
                }
        
                thisWeek = Moment(allTimers[i].timerdate).week();
                writing += allTimers[i].writingtime;
                research += allTimers[i].researchtime;
                custom += allTimers[i].customtime;

                if(i === allTimers.length -1) {
                    writingDataPoints.push(allTimers[i].writingtime/3600);
                    researchDataPoints.push(allTimers[i].researchtime/3600);
                    customDataPoints.push(allTimers[i].customtime/3600);
                    xAxis.push(thisWeek-startWeek+1);
                }
            }
            
        }

        var maxY = Math.max(...writingDataPoints, ...researchDataPoints, ...customDataPoints);

        var options= {
            colors: ['#4B9CD3', '#13294B', '#6AC9D2'],
            chart: {
              id: 'Timer Stats',
              background:'#fff'
            },
            xaxis: {
              categories: xAxis,
              title: {
                  text: 'Week Number',
                  style: {
                      fontSize: '1em'
                  }
              },
              labels: {
                formatter: function (value) {
                  return 'Week ' + value;
                },
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
                max: Math.ceil(maxY),
                tickAmount: Math.ceil(maxY),
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
          var series= [
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
        this.setState({options, series});
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
            await axios.post(`/timer`, {...timerTemplate, userid: this.props.user.id, timerdate: this.state.selectedDate });
        }

        const timers = (await axios.get(`/timer/${this.props.user.id}/${this.state.selectedDate}`)).data[0];
        this.setState({ timers })
    }
    
    onChangeManualCategory(event) {
        this.setState({ manualCategory: event.target.value })
    }

    onChangeManualTime(event) {
        this.setState({manualTime: event.target.value})
    }

    async onSubmitManualTime(event) {
        event.preventDefault();
        const time = Number.parseInt(this.state.manualTime) * 60;
        if(time) {
            await this.updateTimers(time, this.state.manualCategory.toLowerCase());
        }
    }

    async onDateChanged(date) {
        const selectedDate = Moment(date).format('YYYY-MM-DD');
        this.setState({selectedDate, unformattedDate: date});
        const timers = (await axios.get(`/timer/${this.props.user.id}/${selectedDate}`)).data[0];
        this.setState({
            timers
        });
    }


    render() {
        return(
            <div><br/>
                    <div>
                        <h1>Timers for {fixDateWithYear(this.state.selectedDate)}</h1>
                        <DatePicker selected={this.state.unformattedDate} onChange={this.onDateChanged} className="history-date-picker" />
                        <div className="history-grid-goals">
                            <Timers timers={this.state.timers} user={this.props.user} selectedDate={this.state.selectedDate} customName={this.state.customName} manualTime={this.state.manualTime} manualCategory={this.state.manualCategory} alarm={this.state.alarm} updateTimers={this.updateTimers} updateCustomName={this.updateCustomName} onChangeManualCategory={this.onChangeManualCategory} onChangeManualTime={this.onChangeManualTime} onSubmitManualTime={this.onSubmitManualTime} />
                        </div>
                    </div><br/><br/>
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
            <div style={{ display: "inline-block", width: '50%', verticalAlign: 'top' }}>
                <div>
                    <h3 style={{ display: "inline-block", width: '60%', marginRight: 15, paddingRight: 25 }} >Timers</h3>
                    <h3 style={{ display: "inline-block", width: '30%' }} >Today's Times</h3>
                </div>
                <div>
                    <div className="timers-list" style={{ display: "inline-block", width: '60%', verticalAlign: 'top', marginRight: 15, paddingRight: 25, borderRight: '2px solid #DDD'  }}>
                        <Timer name="Writing" updateTimers={this.props.updateTimers} category="writing" />
                        <Timer name="Research" updateTimers={this.props.updateTimers} category="research" />
                        <Timer name={this.props.customName} updateTimers={this.props.updateTimers} updateCustomName={this.props.updateCustomName} category="custom" />
                    </div>
                    <div style={{ display: "inline-block", verticalAlign: 'top' }}>
                        <table className="timers-table" >
                            <tbody>
                                <tr>
                                    <th>Writing</th>
                                    <td>{ready ? secondsToHms(this.props.timers.writingtime) : secondsToHms(0) }</td>
                                </tr>
                                <tr>
                                    <th>Research</th>
                                    <td>{ready ? secondsToHms(this.props.timers.researchtime) : secondsToHms(0) }</td>
                                </tr>
                                <tr>
                                    <th>Custom</th>
                                    <td>{ready ? secondsToHms(this.props.timers.customtime) : secondsToHms(0) }</td>
                                </tr>
                            </tbody>
                        </table>
                        <br />
                        <Form className="text-block add-time" onSubmit={() => this.props.onSubmitManualTime(event)}>
                            <Form.Label>Enter Time Manually: </Form.Label>
                            <Form.Control as="select" value={this.props.manualCategory} onChange={() => this.props.onChangeManualCategory(event)}>
                                <option>Writing</option>
                                <option>Research</option>
                                <option>Custom</option>
                            </Form.Control>
                            <Form.Control placeholder="Enter time in minutes..." type="number" onChange={() => this.props.onChangeManualTime(event)} />
                            <Button type="submit">Add Time</Button>
                        </Form>
                    </div>
                </div>
            </div>
        );
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

class Reflections extends Component {
    render() {
        if(this.props.reflections && this.props.reflections.reflectiontext.length > 0 && this.props.reflections.reflectiontext !== ")(}){(" && this.props.reflections.reflectiontext !== ")(}){()(}){("){
            const reflectionSplit = this.props.reflections.reflectiontext.split(delimiter);
            return(
                <div className="history-reflections">
                    <h2>Reflections</h2><br/>
                    <p>
                        1. {reflectionSplit[0]}
                    </p>
                    <p>
                        2. {reflectionSplit[1]}
                    </p>
                    <p>
                        3. {reflectionSplit[2]}
                    </p>
                </div>
            );
        }
        else{
            return(
                <div className="history-reflections">
                    <h2>Reflections</h2><br/>
                    <p>No reflection.</p>
                </div>
            );
        }
        
    }
}

class Completed extends Component {
    render() {
        let date = fixDate(this.props.selectedDate);
        if(this.props.goals.length !== 0){
            const isCompleted = this.props.goals.reduce((memo, goal) => { return memo ? goal.completed : false }, true) ? true : false;
            if(isCompleted=== true) {
                return(
                    <div className="history-goals-aside">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <p>You've completed all of your goals for {date}! :)</p>
                    </div> 
                 );
            }
            else {
                return(
                    <div className="history-goals-aside">
                        <FontAwesomeIcon icon={faMinusCircle} />
                        <p>You did not meet all of your goals for {date} :(</p>
                    </div> 
                );
            }
        }
        else {
            return(
                <div className="history-goals-aside">
                    <div className="history-no-goals">No goals recorded on {date}.</div>
                </div>
            );
        }
        
    }


}

// Functions

function fixDate(d) {
    var res = d.split("-");
    return(res[1].concat("/", res[2]));
}

// function formatDate(date){
//         var dd = date.getDate();
//         var mm = date.getMonth()+1;
//         var yyyy = date.getFullYear();
//         if(dd<10) {dd='0'+dd}
//         if(mm<10) {mm='0'+mm}
//         date = yyyy+'-'+mm+'-'+dd;
//         return date
//      }

// function Last7Days (date) {
//         var result = [];
//         for (var i=0; i<7; i++) {
//             var d = new Date(date);
//             d.setDate(d.getDate() - i);
//             result.unshift( formatDate(d) )
//         }
    
//         return(result);
// }

// function getDayofWeek(date) {
//     let d = new Date(date);
//     var n = d.getDay();

//     var mapDays = new Map([[6, "Sunday"], [0, "Monday"], [1, "Tuesday"], [2, "Wednesday"], [3, "Thursday"], [4, "Friday"], [5, "Saturday"]]);
//     return(mapDays.get(n));
// }

// function getCurrentWeek(d) {
//     let curr = new Date(d); 
//     let week = []

//     for (let i = 0; i <= 6; i++) {
//         let first = curr.getDate() - curr.getDay() + i;
//         let day = new Date(curr.setDate(first)).toISOString().slice(0, 10)
//         week.push(day)
//     }
//     return(week);
// }

export { History };
