import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import openSocket from 'socket.io-client';

const socket = openSocket('http://192.168.43.185:3000');

const subscribeToTimer = (callback) => {
  socket.on('timer', timestamp => callback(null, timestamp));
  socket.on('people', people => { console.log(people)});
  socket.emit('subscribeToTimer', 1000);
}
const subscribeToSensor = (callback) => {
  socket.on('temperature_and_humidity', data => callback(null, data));
}

class App extends Component {
  constructor(props) {
    super(props);    
    this.state = {
      timestamp: '00:00',
      humidity: '0',
      temperature: '0',
    };
    subscribeToTimer((err, timestamp) => this.setState((prevState) => {
      const time = new Date(timestamp);
      return {
        ...prevState,
        timestamp: time.toLocaleTimeString()
      }
    }));
    subscribeToSensor((err, data) => {
      console.log(data)
      if (data.temperature) {
         this.setState((prevState) => {
           return {
             ...prevState,
             temperature: data.temperature,
             humidity: data.humidity
           }
         });
      }
    });
  }

  render() {
    return (
      <div className="App">
        <h2>Hello. It's {this.state.timestamp}.</h2>
        <h2> Temperature: {this.state.temperature} °C.</h2>
        <h2> Humidity: {this.state.humidity} %.</h2>
      </div>
    );
  }
}

export default App;
