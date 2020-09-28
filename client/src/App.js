import React from 'react';
import { Router, Redirect } from '@reach/router';
import { Provider } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import './App.css';

import colors from './config/colors';
import Start from './views/Start';
import Result from './views/Result';
import store from './redux/store';

const useStyles = makeStyles((theme) => ({
  root: {
      backgroundColor: colors.backgroundSite,
      color: colors.textNormal,
  },
}));

function App() {
  const classes = useStyles();

  return (
    <Provider store={store}>
    <div className={`App, ${classes.root}`}>
      <Router>
        <Redirect from="/" to="/input" noThrow />
        <Start path="input/" />
        <Result path="results/" />
      </Router>
    </div>
    </Provider>
  );
}

export default App;
