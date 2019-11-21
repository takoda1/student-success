import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import auth0Client from './Auth';

class Callback extends Component {
    async componentDidMount() {
        this.forceUpdate();
        await auth0Client.handleAuthentication();
    }

    render() {
        return (
            <h1>You are now logged in! Please click on the page you wish to navigate to.</h1>
        );
    }
}

export default withRouter(Callback);
