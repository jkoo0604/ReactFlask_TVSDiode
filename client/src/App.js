import React from 'react';
import { Router, Redirect } from '@reach/router';
import './App.css';
import Input from './views/Input';
import Results from './views/Results';
import Categories from './views/Categories';

function App() {

  return (
    <div className="App">
      <Router>
        <Redirect from="/" to="/load" noThrow />
        <Input path="load/" />
        <Categories path="cat/" />
        <Results path="results/" />
      </Router>
    </div>
  );
}

export default App;
