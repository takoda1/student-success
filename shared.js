import Link from 'next/link';
export { Layout, GoalList };

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
      {props.goals.map(g => <GoalItem goal = {g} />)}
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