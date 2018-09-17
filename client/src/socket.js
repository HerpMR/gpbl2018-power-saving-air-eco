import openSocket from 'socket.io-client';
const socket = openSocket('http://192.168.43.185:3000');

export const subscribeToTimer = (callback) => {
    socket.on('timer', timestamp => callback(null, timestamp));
    socket.emit('subscribeToTimer', 1000);
}

export const subscribeToMotionSensor = (callback) => {
    socket.on('people', people => callback(null, people));
}
export const subscribeToSensor = (callback) => {
    socket.on('temperature_and_humidity', data => callback(null, data));
}

export const subscribeToAirTemp = (callback) => {
    socket.on('air_current_temp', data =>  {
        callback(null, data);
    });
}

export const changeCurrentAirTemp = (changeTemp) => {
    socket.emit('change_air_current_temp', changeTemp);
}