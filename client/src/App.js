import React, { Component } from 'react';
import Slider from '@material-ui/lab/Slider';
import './App.css';
import openSocket from 'socket.io-client';

const socket = openSocket('http://192.168.0.101:3000');

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

const Item = (props) => {
  return (
    <div className="Item">
      <span> {props.text} </span>
    </div>)
}

class SimpleSlider extends React.Component {
  state = {
    value: 50,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <div className="Simple-Slider">
        <Slider value={value} aria-labelledby="label" onChange={this.handleChange} />
      </div>
    );
  }
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
    const minusDegreesText = '- ' + this.state.people > 10 ? (minusDegrees > 5 ? 5 : minusDegrees) + '°C' : '';
    return (
      <div className="App">
        <div className="Holder">
          <div className="Sub-Holder">
            <Item text={`${this.state.timestamp}`}/>
          </div>
          <div className="Sub-Holder">
            <Item text={`${this.state.people} people`}/>
            <Item text={`${this.state.temperature}°C ${ minusDegreesText}`}/>
            <Item text={`${this.state.humidity}%`}/>
          </div>
           <div className="Sub-Holder">
            {/* <SimpleSlider /> */}
           </div>
        </div>
      </div>
    );
  }
}

export default App;
