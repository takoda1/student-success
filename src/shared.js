import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './Home.css';
import Col from 'react-bootstrap/Col';
import axios from 'axios';
import Moment from 'moment';
import Checkbox from './checkbox/Checkbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const delimiter = ")(}){(";

const layoutStyle = {
  padding: 20,
  border: '1px solid #DDD'
};

function Layout(props) {
  return (
    <div style={layoutStyle}>
      {props.children}
    </div>
  );
}

class GoalList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      prioritizing: false,
    }
  }

  render() {
    const sortedGoals = this.props.goals.sort((a, b) => (a.priority > b.priority) ? 1 : -1);
    const sortedGoalsList = sortedGoals.map((g) => <GoalItem key={g.id} goal={g} onGoalCheck={this.props.onGoalCheck} onGoalEdited={this.props.onGoalEdited} onGoalRemoved={this.props.onGoalRemoved} />);
    const viewMode = (
      <div>
        <Button onClick={() => this.setState({ prioritizing: true })}>Reorder List</Button>
        <ul className="goal-list">
          {sortedGoalsList}
          <Form className="addGoal" onSubmit={this.props.onGoalAdded}>
            <Form.Row>
              <Col className="goal-input">
                <Form.Control type="text" className="addGoalField" value={this.props.newGoalText} onChange={this.props.onGoalTyped} />
              </Col>
              <Col className="goal-buttons-col">
                <Button type="submit">Add Goal</Button>
              </Col>
            </Form.Row>
          </Form>
        </ul>
        <GoalsCompleted goalsCompleted={this.props.goalsCompleted}/>
      </div>
    );

    const priorityMode = (
      <div>
        <ul className="goal-list">
          <Form onSubmit={ () => this.setState({ prioritizing: false }) }>
            {sortedGoals.map((goal) => {
              return (
                <Form.Row key={goal.id}>
                  <Col>{goal.goaltext}</Col>
                  <Col>
                    <Form.Control as="select" onChange={async (event) => {
                      event.preventDefault();
                      await this.props.onGoalEdited(event, goal.goaltext, goal.id, goal.completed, event.target.value);
                    }}>
                        <option key={0} >{0}</option>
                        {this.props.goals.map((group, index) => <option key={index+1}>{index+1}</option>)}
                    </Form.Control>
                  </Col>
                </Form.Row>
              );
            })}
            <Button type="submit">Save</Button>
          </Form>
        </ul>
      </div>
    );

    return this.state.prioritizing ? priorityMode : viewMode;
  }


}

class GoalItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      showSubgoalBox: false,
      goaltext: props.goal.goaltext,
      subgoals: [],
      subgoalText: ''
    }
  }

  async componentDidMount() {
    const subgoals = (await axios.get(`/subgoalByParent/${this.props.goal.id}`)).data;
    this.setState({ subgoals });
  }

  render() {
    const editMode = (  
      <Form className="editGoal" onSubmit={(event) => {
        this.setState({ editing: !this.state.editing });
        this.props.onGoalEdited(
          event, 
          this.state.goaltext, 
          this.props.goal.id, 
          this.props.goal.completed, 
          this.props.goal.priority
        );
      }}>
        <Form.Row className="goal-row">
          <Col className="goal-input">
            <Form.Control type="text" className="goalField" value={this.state.goaltext} 
              onChange={(event) => this.setState({ goaltext: event.target.value })} />
          </Col>
          <Col>
            <Button type="submit">Update</Button>
          </Col>
        </Form.Row>
        {/* <input className="goalField" value={this.state.goaltext} onChange={(event) => this.setState({ goaltext: event.target.value })} /> */}
      </Form>
    );

    const viewMode = (
      <div className="home-goal-list">
        <Form.Row className="goals-form-row">
            <Col className="goal-check-col">
              <Checkbox completed={this.props.goal.completed} onToggle={() => {
                this.props.onGoalCheck(!this.props.goal.completed, this.props.goal);
              }} > {this.state.goaltext} </Checkbox>
            </Col>
            <Col className="goal-buttons-col">
              <Button className="edit" onClick={() => this.setState({ editing: !this.state.editing }) }>Edit</Button>
              <Button className="remove" onClick={() => this.props.onGoalRemoved(this.props.goal.id)}>Remove</Button>
              <Button size="sm" id="subgoalToggle" onClick={() => this.setState({ showSubgoalBox: !this.state.showSubgoalBox })}
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
                    await axios.put(`/subgoal/${subgoal.id}`, updated);
                    const subgoals = (await axios.get(`/subgoalByParent/${this.props.goal.id}`)).data;
                    this.setState({ subgoals });
                  }}> {subgoal.goaltext} </Checkbox>
                </Col>
                <Col className="goal-buttons-col">
                  <Button className="remove small-button" onClick={async (event) => {
                    event.preventDefault();
                    await axios.delete(`/subgoal/${subgoal.id}`);
                    const subgoals = (await axios.get(`/subgoalByParent/${this.props.goal.id}`)).data;
                    this.setState({ subgoals });
                  }}>Remove</Button>
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
              await axios.post(`/subgoal`, subgoal);
              const subgoals = (await axios.get(`/subgoalByParent/${this.props.goal.id}`)).data;
              this.setState({ subgoals, subgoalText: '' });
            }}>
              <Form.Row className="sub-goal-row">
                <Col className="goal-input">
                  <Form.Control type="text" className="goalField" value={this.state.subgoalText} onChange={(event) => this.setState({ subgoalText: event.target.value })} />
                </Col>
                <Col className="goal-buttons-col">
                  <Button className="small-button" type="submit">Add Subgoal</Button>
                </Col>
              </Form.Row>
              {/* <input className="goalField" value={this.state.goaltext} onChange={(event) => this.setState({ goaltext: event.target.value })} /> */}
            </Form>
          ) : null
        }
      </div>
    );

    return (
      <div className="goals">
        {this.state.editing? editMode : viewMode}
      </div>
    );
  }
}

function GoalsCompleted(props) {
  return (
    <div>
      {props.goalsCompleted}
    </div>
  );
}

class Goals extends React.Component {
    render() {
      return(
          <div className="history-goal-list">
              <h2>Goals</h2><br/>
              <CheckboxGoals goals={this.props.goals} />
          </div>
      );
    }
}

class CheckboxGoals extends React.Component {
  render () {
      const sortedGoals = this.props.goals.sort(function(a, b) {return a.priority - b.priority});
      if(this.props.goals.length !== 0) {
          const listGoals = sortedGoals.map((goal) => {
            return (
              <div key={goal.id}>
                <li> 
                  <Checkbox completed={goal.completed}> {goal.goaltext} </Checkbox>
                </li>
                {goal.subgoals ? goal.subgoals.map((subgoal) => {
                  return (<li className="sub-goal-row" key={subgoal.id}>
                    <Checkbox completed={subgoal.completed}> {subgoal.goaltext} </Checkbox>
                  </li>);
                }) : null }
              </div>
            );
          });
          return(<div className="history-goals">{listGoals}</div>);
      } else {
          return(<div className="history-goals">No goals.</div>);
      }
  }
}

function secondsToHms(d) {
  d = Number(d);

  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
}

function getTodaysDate() {
  var d = new Date();
  var year = d.getFullYear().toString();
  var month = (d.getMonth() + 1);
  var day = d.getDate();
  if(month < 10) {
      month = '0' + month;
  }
  if(day < 10) {
      day = '0' + day;
  }
  return(year.concat("-", month, "-", day));
}

function fixDateWithYear(d) {
  return(Moment(d).format("MM/DD/YY"))
}

export { Layout, GoalList, secondsToHms, getTodaysDate, Goals, CheckboxGoals, delimiter, fixDateWithYear };