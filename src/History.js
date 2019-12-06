import React, { Component } from 'react';
import './History.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faMinusCircle, faCaretRight, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Moment from 'moment';
import { getTodaysDate, secondsToHms, Goals, delimiter, fixDateWithYear } from './shared';
import Chart from 'react-apexcharts'

const today = new Date();
var writingDataPoints = [];
var researchDataPoints = [];
var customDataPoints = [];

class History extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goals: [],
            timers: '',
            reflections: '',
            selectedDate: getTodaysDate(),
            week: getCurrentWeek(today),
            options: {},
            series: []
        };

        this.onDayClicked = this.onDayClicked.bind(this);
        this.onArrowClicked = this.onArrowClicked.bind(this);
    }

    async componentDidMount() {
        const goals = (await axios.get(`/goals/${this.props.user.id}/${this.state.selectedDate}`)).data;
        const timers = (await axios.get(`/timer/${this.props.user.id}/${this.state.selectedDate}`)).data[0];
        const reflections = (await axios.get(`/reflection/${this.props.user.id}/${this.state.selectedDate}`)).data[0];
        this.setState({
            goals,
            timers,
            reflections,
        });
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
        console.log(maxY);

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

    async onDayClicked(date) {
        this.setState({selectedDate: date});
        const goals = (await axios.get(`/goals/${this.props.user.id}/${date}`)).data;
        const timers = (await axios.get(`/timer/${this.props.user.id}/${date}`)).data[0];
        const reflections = (await axios.get(`/reflection/${this.props.user.id}/${this.state.selectedDate}`)).data[0];
        this.setState({
            timers,
            goals,
            reflections,
        });
    }

    async onArrowClicked(next) {
        if(next) {
            let d = new Date(this.state.week[6]);
            d.setDate(d.getDate() + 8);
            this.setState({week: Last7Days(d)});
            // this.setState({week: getCurrentWeek(d)});
        }
        else {
            let d = new Date(this.state.week[0]);
            d.setDate(d.getDate());
            this.setState({week: Last7Days(d)});
            // this.setState({week: getCurrentWeek(d)});
        }
        
    }

    render() {
        return(
            <div><br/>
                    <div>
                        <h1>History for {fixDateWithYear(this.state.selectedDate)}</h1>
                        <Calendar week={this.state.week} onDayClicked={this.onDayClicked} onArrowClicked={this.onArrowClicked} />
                        <div className="history-grid-goals">
                            <Completed goals={this.state.goals} selectedDate={this.state.selectedDate} />
                            <Goals goals={this.state.goals} />
                            <Timers timers={this.state.timers} />
                            <Reflections reflections={this.state.reflections} />
                        </div>
                    </div><br/><br/>
                    <div className="history-graph">
                        <Chart options={this.state.options} series={this.state.series} type="line" width={1000} />
                    </div>
                    
            </div>
        );
    }
}

class Calendar extends Component {
      render() {
        const listDays = this.props.week.map((date) =>
        <Button key={date} variant="primary" size="lg" className="history-date" onClick={() => this.props.onDayClicked(date)}>{getDayofWeek(date)} <br></br>{fixDate(date)}</Button>
        );
    
        return(
            <ButtonToolbar>
                <FontAwesomeIcon icon={faCaretLeft} onClick={() => this.props.onArrowClicked(false)} />
                {listDays}
                <FontAwesomeIcon icon={faCaretRight} onClick={() => this.props.onArrowClicked(true)} />
            </ButtonToolbar>
        );
      }
}


class Timers extends Component {
      render() {
        if(this.props.timers) {
            return(
                <div className="history-timers">
                    <h2>Timers</h2><br/>
                    <ul className="history-timers-list">
                        <li>Writing: {secondsToHms(this.props.timers.writingtime)}</li>
                        <li>Research: {secondsToHms(this.props.timers.researchtime)}</li>
                        <li>Custom: {secondsToHms(this.props.timers.customtime)}</li>
                    </ul>
                </div>
            );
        }
        else {
            return(
                <div className="history-timers">
                    <h2>Timers</h2><br/>
                    <div className="no-timers">No timers.</div>
                </div>
            );
        }
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
                    <h2>Reflection</h2><br/>
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

function formatDate(date){
        var dd = date.getDate();
        var mm = date.getMonth()+1;
        var yyyy = date.getFullYear();
        if(dd<10) {dd='0'+dd}
        if(mm<10) {mm='0'+mm}
        date = yyyy+'-'+mm+'-'+dd;
        return date
     }

function Last7Days (date) {
        var result = [];
        for (var i=0; i<7; i++) {
            var d = new Date(date);
            d.setDate(d.getDate() - i);
            result.unshift( formatDate(d) )
        }
    
        return(result);
}

function getDayofWeek(date) {
    let d = new Date(date);
    var n = d.getDay();

    var mapDays = new Map([[6, "Sunday"], [0, "Monday"], [1, "Tuesday"], [2, "Wednesday"], [3, "Thursday"], [4, "Friday"], [5, "Saturday"]]);
    return(mapDays.get(n));
}

function getCurrentWeek(d) {
    let curr = new Date(d); 
    let week = []

    for (let i = 0; i <= 6; i++) {
        let first = curr.getDate() - curr.getDay() + i;
        let day = new Date(curr.setDate(first)).toISOString().slice(0, 10)
        week.push(day)
    }
    return(week);
}

export { History };
