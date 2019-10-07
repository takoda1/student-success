import Link from 'next/link';
export { NavBar, Button };

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
      <a title={props.name}>{props.name}</a>
    </Link>
  )
}