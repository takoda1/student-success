import React from 'react';

const layoutStyle = {
  padding: 20,
  background: '#A6C4FF', 
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
      <ul>
        {props.goals.map(g => <GoalItem key={g.id} goal={g} onGoalCheck={props.onGoalCheck} onGoalEdited={props.onGoalEdited} onGoalRemoved={props.onGoalRemoved} />)}
        <form className="addGoal" onSubmit={props.onGoalAdded}>
          <input value={props.newGoalText} onChange={props.onGoalTyped} />
          <button>Add Goal</button>
        </form>
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
      <form className="editGoal" onSubmit={(event) => {
        this.setState({ editing: !this.state.editing });
        this.props.onGoalEdited(event, this.state.goaltext, this.props.goal.id, this.props.goal.completed);
      }}>
        <input value={this.state.goaltext} onChange={(event) => this.setState({ goaltext: event.target.value })} />
        <button>Update</button>
      </form>
    );

    const viewMode = (
      <p>
        <input type="checkbox" checked={this.props.goal.completed} onChange={(event) => {
            this.props.onGoalCheck(event.target.checked, this.props.goal);
          }}/>
            {this.state.goaltext}
            {' '}
        <button className="edit" onClick={() => this.setState({ editing: !this.state.editing }) }>Edit</button>
        <button className="remove" onClick={() => this.props.onGoalRemoved(this.props.goal.id)}>Remove</button>
      </p>
    );

    return (
      <div>
        {this.state.editing? editMode : viewMode}
      </div>
    );
  }
}

function GoalsCompleted(props) {
  return (
    <div>
      <p>{props.goalsCompleted}</p>
    </div>
  );
}

function secondsToHms(d) {
  d = Number(d);

  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
}

export { Layout, GoalList, secondsToHms };