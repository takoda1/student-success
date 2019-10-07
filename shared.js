import Link from 'next/link';
export { Layout };

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

function NavBar(props) {
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