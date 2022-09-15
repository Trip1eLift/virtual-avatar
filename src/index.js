import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Strick Mode raises warning while using Draggable Core
ReactDOM.render(
  <React.Fragment>
    <App />
  </React.Fragment>,
  document.getElementById('root')
);