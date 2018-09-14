import React, { Component } from 'react';
import './App.css';
import openSocket from 'socket.io-client';

const socket = openSocket('http://192.168.43.185:3000');

const subscribeToTimer = (callback) => {
  socket.on('timer', timestamp => callback(null, timestamp));
  socket.emit('subscribeToTimer', 1000);
}

const subscribeToMotionSensor = (callback) => {
  socket.on('people', people => callback(null, people));
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
      people: '0',
    };
    subscribeToTimer((err, timestamp) => this.setState((prevState) => {
      const time = new Date(timestamp);
      return {
        ...prevState,
        timestamp: time.toLocaleTimeString()
      }
    }));

    subscribeToMotionSensor((err, people) => this.setState((prevState) => {
       return {
         ...prevState,
         people: people
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
    const minusDegrees = Math.floor(this.state.people / 10);
    return (
      <div className="App">
        <h3>Hello. It's {this.state.timestamp}.</h3>
        <h3>There are {this.state.people} people.</h3>
        <h3> 
          Temperature: {this.state.temperature}°C 
          {this.state.people > 10 && ` - ${minusDegrees > 5 ? 5: minusDegrees}°C.`}</h3>
        <h3> Humidity: {this.state.humidity} %.</h3>
      </div>
    );
  }
}

export default App;
