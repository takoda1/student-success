import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import * as serviceWorker from "./serviceWorker";
import { Auth0Provider } from "./react-auth0-spa";
import config from "./auth_config.json";
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
    
    <BrowserRouter>
        <App />
    </BrowserRouter>,
  document.getElementById('root')
);

serviceWorker.unregister();