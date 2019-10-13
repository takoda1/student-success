import React from 'react';
export { Layout, GoalList, Timer };

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
        {props.goals.map(g => <GoalItem key={g.content} goal={g} />)}
        <p><textarea /><button>Add Goal</button></p>
      </ul>
      <GoalsCompleted goals = {props.goals}/>
    </div>
  );
}

function GoalItem(props) {
  function handleCheck() {
    // Send a post request of the completed status ?
    // update the GoalsCompleted ?
  }

  let content = props.goal.content;

  function editGoal() {
    
  }

  return (
    <div>
      <p>
        <input type="checkbox" value={props.goal.complete} onChange={handleCheck}/>
        <text class="content">{content}</text>
        {' '}
        <button class="edit">Edit</button>
      </p>
    </div>
  );
}

function GoalsCompleted(props) {
  return (
    <div>
      <p>{(props.goals.reduce((memo, goal) => { memo ? goal.complete : false }, true)) ? "Goals completed!" : "Not yet!"}</p>
    </div>
  );
}

function Timer(props) {
  function startTimer() {
    console.log(`start ${props.name}`)
  }

  function stopTimer() {
    console.log(`stop ${props.name}`)
  }  

  function resetTimer() {
    console.log(`reset ${props.name}`)
  }

  return (
    <div>
      <p>
        {props.name}: {"30:00"}
        <button onClick={startTimer}>start</button>
        <button onClick={stopTimer}>stop</button>
        <button onClick={resetTimer}>reset</button>
      </p>
    </div>
  );
}