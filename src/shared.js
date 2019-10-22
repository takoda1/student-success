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
        {props.goals.map(g => <GoalItem key={g.id} goal={g} onGoalCheck={props.onGoalCheck} />)}
        <form className="addGoal" onSubmit={props.onGoalAdded}>
          <input value={props.newGoalText} onChange={props.onGoalTyped} />
          <button>Add Goal</button>
        </form>
      </ul>
      <GoalsCompleted goalsCompleted={props.goalsCompleted}/>
    </div>
  );
}

function GoalItem(props) {
  let goalText = props.goal.goaltext;

  return (
    <div>
      <p>
        <input type="checkbox" checked={props.goal.complete} onChange={props.onGoalCheck}/>
        {goalText}
        {' '}
        <button className="edit">Edit</button>
      </p>
    </div>
  );
}

function GoalsCompleted(props) {
  return (
    <div>
      <p>{props.goalsCompleted}</p>
    </div>
  );
}

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 30
    }

    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
  }

  startTimer() {
    this.timer = setInterval(() => this.setState({
      time: this.state.time - 1
    }), 1000)
  }

  stopTimer() {
    clearInterval(this.timer)
  }  

  resetTimer() {
    this.setState({time: 30})
  }

  render() {
    return (
      <div>
        <p>
          {this.props.name}: {this.state.time}
          <button onClick={this.startTimer}>start</button>
          <button onClick={this.stopTimer}>stop</button>
          <button onClick={this.resetTimer}>reset</button>
        </p>
      </div>
    );
  }
}

export { Layout, GoalList, Timer };