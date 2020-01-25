import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import {DashboardContainer} from './components/DashboardContainer';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="container">
      {/* Handle routing for all the components */}
      <Switch>
        <Route exact path="/" component={LoginPage}/>
        <Route exact path="/dashboard" component={DashboardContainer}/>
      </Switch>
      <Footer/>
    </div>
  );
  
}

export default App;
