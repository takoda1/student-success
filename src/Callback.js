import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import auth0Client from './Auth';

class Callback extends Component {
    async componentDidMount() {
        console.log("ABCCCC");
        this.forceUpdate();
        await auth0Client.handleAuthentication();
        console.log("ABCCC");
        this.props.history.replace('/');
        console.log("ABC");
    }

    render() {
        return (
            <p>Loading profile...</p>
        );
    }
}

export default withRouter(Callback);
