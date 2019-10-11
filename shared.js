import Link from 'next/link';
export { Layout, GoalList, Timer };

const layoutStyle = {
  margin: 20,
  padding: 20,
  border: '1px solid #DDD'
};

const Layout = props => (
  <div style={layoutStyle}>
    <NavBar />
    {props.children}
  </div>
);

const linkStyle = {
    marginRight: 15
};

function NavBar() {
    return (
      <div>
        <Button name="Home" path="/index"/>
        <Button name="History" path="/history"/>
        <Button name="Group" path="/group"/>
        <Button name="Forum" path="/forum"/>
      </div>
    );
}

function Button(props) {
  return (
    <Link href={props.path}>
      <a style={linkStyle} title={props.name}>{props.name}</a>
    </Link>
  )
}

function GoalList(props) {
  return (
    <ul>
      {props.goals.map(g => <GoalItem key={g.content} goal={g} />)}
    </ul>
  )
}

function GoalItem(props) {
  return (
    <div>
      <p>
        <input type="checkbox" value={props.goal.complete} />
        {props.goal.content}
      </p>
      
    </div>
  )
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
  )
}