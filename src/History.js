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
            options: {
                chart: {
                  id: 'Timer Stats'
                },
                xaxis: {
                  categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
                }
              },
            series: [{
                name: 'series-1',
                data: [30, 40, 45, 50, 49, 60, 70, 91]
              }]
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
        // var chart = this.chart;
        const allTimers = (await axios.get(`/timerByUser/${this.props.user.id}`)).data;
        var startWeek = Moment(allTimers[0].timerdate).week();
        // for(var i=0; i<allTimers.length; i++) {
        //     console.log(startWeek, Moment(allTimers[i].timderdate).week());
        //     if(Moment(allTimers[i].timderdate).week() < startWeek) {
        //         startWeek = Moment(allTimers[i].timderdate).week();
        //     }
        // }
        // console.log(startWeek);

        console.log(Moment('2019-12-02T00:00:00.000Z').week());
        var thisWeek = startWeek;
        var xAxis = []
        var writing = 0;
        var research = 0;
        var custom = 0;
        for(var i=0; i<allTimers.length; i++) {
            // console.log('timerdate for this data point is: ' + Moment(allTimers[i].timerdate).week());
            // console.log('thisWeek is: ' + thisWeek);
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
        
                thisWeek = Moment(allTimers[i].timerdate).week();
                writing = 0;
                research = 0;
                custom = 0;

                if(i === allTimers.length -1) {
                    writingDataPoints.push(allTimers[i].writingtime/3600);
                    researchDataPoints.push(allTimers[i].researchtime/3600);
                    customDataPoints.push(allTimers[i].customtime/3600);
                    xAxis.push(thisWeek-startWeek+1);
                }
            }
            
        }
        var options= {
            chart: {
              id: 'Timer Stats'
            },
            xaxis: {
              categories: xAxis,
              title: {
                  text: 'Week Number'
              },
              labels: {
                formatter: function (value) {
                  return 'Week ' + value;
                }
              }
            },
            yaxis: {
                decimalsInFloat: 2,
                title: {
                    text: 'Total Hours'
                }
            },
            title: {
                text: 'Timer Hours Per Week',
                align: 'center',
                style: {
                    fontSize: '1.75em'
                },
                offsetY: 20
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
        // chart.render();
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

        // var chart = new ApexCharts(
        //     document.querySelector("#chart"),
        //     options
        // );

        // chart.render();
        // const options = {
		// 	animationEnabled: true,
		// 	exportEnabled: true,
		// 	theme: "light2", // "light1", "dark1", "dark2"
		// 	title:{
        //         text: "Total Time Per Week"
		// 	},
		// 	axisY: {
		// 		title: "Total Weekly Hours",
		// 		includeZero: false
		// 	},
		// 	axisX: {
		// 		title: "Week of Year",
        //         prefix: "W",
        //         includeZero: false,
		// 		interval: 1
		// 	},
		// 	data: [{
        //         type: "line",
        //         name: "Writing Timers",
        //         showInLegend: true,
		// 		toolTipContent: "Week {x}: {y}hrs",
		// 		dataPoints: writingDataPoints
        //     },
        //     {
        //         type: "line",
        //         name: "Research Timers",
        //         showInLegend: true,
        //         toolTipContent: "Week {x}: {y}hrs",
        //         dataPoints: researchDataPoints
        //     },
        //     {
        //         type: "line",
        //         name: "Custom Timers",
        //         showInLegend: true,
        //         toolTipContent: "Week {x}: {y}hrs",
        //         dataPoints: customDataPoints
        //     }]
            
		// }
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
                    <Chart options={this.state.options} series={this.state.series} type="line" width={1000} />
                    {/* <CanvasJSChart options = {options} onRef={ref => this.chart = ref} /> */}
            </div>
        );
    }
}

class Calendar extends Component {
      render() {
        const listDays = this.props.week.map((date) =>
        <Button key={date} variant="outline-primary" size="lg" className="history-date" onClick={() => this.props.onDayClicked(date)}>{getDayofWeek(date)} <br></br>{fixDate(date)}</Button>
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
