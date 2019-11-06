import React from 'react';
import {withRouter} from 'react-router-dom';
import auth0Client from '../Auth';
import Button from 'react-bootstrap/Button';
import NavBar from 'react-bootstrap/Navbar';

function AuthNavBar(props) {
	const signOut = () => {
		auth0Client.signOut();
		props.history.replace('/');
	};

	return (
		<NavBar style={{ background: '#1c53c9', margin: 0 }}>
	{
		!auth0Client.isAuthenticated() &&
        <Button variant="primary" size="sm" onClick={auth0Client.signIn}>Sign In</Button>
	}
	{
		auth0Client.isAuthenticated() &&
        <div>
          <label className="mr-2 text-white">{auth0Client.getProfile().name}</label>
          <Button variant="primary" size="sm" onClick={() => {signOut()}}>Sign Out</Button>
        </div>
	}
	</NavBar>
  );
}

export default withRouter(AuthNavBar);
