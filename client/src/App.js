import React, { useState } from 'react';
import { Router, Redirect, navigate } from '@reach/router';
import { Tab, Tabs } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import './App.css';

import colors from './config/colors';
import Results from './views/Results';
import Evaluator from './views/Evaluator';
import Selector from './views/Selector';

const useStyles = makeStyles((theme) => ({
  root: {
      flexGrow: 1,
  },
  indicator: {
    backgroundColor: colors.neutral60,
    height: '7px',
    top: '53px'
  },
  wrapper: {
    height: '60px',
    background: colors.background,
    borderBottomColor: colors.neutral100,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1
  }
}));

function App() {
  const classes = useStyles();
    const [value, setValue] = useState(0);
    const paths = ['/eval', '/select'];

    const handleChange = newVal => {
        setValue(newVal);
        navigate(paths[newVal]);
    };

  return (
    <div className={`App, ${classes.root}`}>
      <Tabs value={value} onChange={handleChange} className={classes.wrapper} TabIndicatorProps={{className: classes.indicator}} centered>
          <Tab label='Evaluator' />
          <Tab label='Selector' />
      </Tabs>
      <Router>
        <Redirect from="/" to="/eval" noThrow />
        <Evaluator path="eval/" />
        <Selector path="select/" />
        <Results path="results/" />
      </Router>
    </div>
  );
}

export default App;
