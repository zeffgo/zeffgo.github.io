import React, { Component } from 'react';
import MainCanvas from './controls/mainCanvas';
import Btn from './controls/btn';
import {getRandomImage, pageReload, randomBtnText} from './utilities';
import './App.css';

class App extends Component {
  render() {
    const imgSrc = getRandomImage();
    const randomBtnCls = 'fas fa-random';
    return (
      <div className="App">
        <h3 id='welcome'>Please draw a path to create a puzzle piece</h3>
        <Btn onClick={pageReload} cls={randomBtnCls}>&nbsp;&nbsp;&nbsp;{randomBtnText}</Btn>
        <MainCanvas src={imgSrc} />
      </div>
    );
  }
}

export default App;
