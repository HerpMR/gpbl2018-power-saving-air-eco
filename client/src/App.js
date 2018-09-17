import React, { Component } from 'react';
import './App.css';
import DialogSelect from './DialogSelect';
import {
  subscribeToTimer,
  subscribeToMotionSensor,
  subscribeToSensor,
} from './socket';

const Item = (props) => {
  return (
    <div className="Item">
      <span> {props.text} </span>
    </div>)
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
        <div className="Holder">
          <div className="Sub-Holder">
            <Item text={`${this.state.timestamp}`}/>
          </div>
          <div className="Sub-Holder">
            <Item text={`${this.state.people} people`}/>
            <Item text={`${this.state.temperature}°C`}/>
            <Item text={`${this.state.humidity}%`}/>
          </div>
           <div className="Sub-Holder">
              <div className="Item">
                <DialogSelect />
              </div>
           </div>
        </div>
      </div>
    );
  }
}

export default App;
