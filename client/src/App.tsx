import React from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import './App.css';
import ProfileBadge from "./features/profile/ProfileBadge";

function App() {
  return (
    <div className="App">
      <header><ProfileBadge /></header>
    </div>
  );
}

export default App;
