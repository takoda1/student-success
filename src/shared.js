import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './Home.css';
import Col from 'react-bootstrap/Col';

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

function GoalList(props) {
  return (
    <div>
      <ul className="goal-list">
        {props.goals.map(g => <GoalItem key={g.id} goal={g} onGoalCheck={props.onGoalCheck} onGoalEdited={props.onGoalEdited} onGoalRemoved={props.onGoalRemoved} />)}
        <Form className="addGoal" onSubmit={props.onGoalAdded}>
          <Form.Control type="text" className="addGoalField" value={props.newGoalText} onChange={props.onGoalTyped} />
          <Button type="submit">Add Goal</Button>
        </Form>
      </ul>
      <GoalsCompleted goalsCompleted={props.goalsCompleted}/>
    </div>
  );
}

class GoalItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      goaltext: props.goal.goaltext
    }
  }

  render() {
    const editMode = (  
      <Form className="editGoal" onSubmit={(event) => {
        this.setState({ editing: !this.state.editing });
        this.props.onGoalEdited(event, this.state.goaltext, this.props.goal.id, this.props.goal.completed);
      }}>
        <Form.Row className="goal-row">
          <Col>
            <Form.Control type="text" size="sm" className="goalField" value={this.state.goaltext} onChange={(event) => this.setState({ goaltext: event.target.value })} />
          </Col>
          <Col>
            <Button size="sm" type="submit">Update</Button>
          </Col>
        </Form.Row>
        {/* <input className="goalField" value={this.state.goaltext} onChange={(event) => this.setState({ goaltext: event.target.value })} /> */}
      </Form>
    );

    const viewMode = (
      <div className="home-goal-list">
        <Form.Row className="goals-form-row">
          {/* <Form.Group> */}
            <Col>
            <Form.Check type="checkbox" checked={this.props.goal.completed} onChange={(event) => {
                this.props.onGoalCheck(event.target.checked, this.props.goal);
              }} label={this.state.goaltext}/>
            </Col>
                {/* {this.state.goaltext} */}
            <Col>
            <Button className="edit" size="sm" onClick={() => this.setState({ editing: !this.state.editing }) }>Edit</Button>
            <Button className="remove" size="sm" onClick={() => this.props.onGoalRemoved(this.props.goal.id)}>Remove</Button>
            </Col>
          {/* </Form.Group> */}
        </Form.Row>
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
      if(this.props.goals.length !== 0){
          const listGoals = this.props.goals.map((goal) =>
          <li key={goal.id}> <input type="checkbox" idname={goal.id} value={goal.id} checked={goal.completed} readOnly /> {goal.goaltext}</li> );
          return(<div className="history-goals">{listGoals}</div>);
      }
      else{
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

export { Layout, GoalList, secondsToHms, getTodaysDate, Goals, CheckboxGoals };