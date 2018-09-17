const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  log: false,
  agent: false,
  origins: '*:*',
  transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']
});

const log = require('./utils/log-file')


app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

io.on('connection', function (socket) {
  socket.on('subscribeToSensor', (payload) => {
    io.emit('temperature_and_humidity', payload);
  });

  socket.on('subscribeToTimer', (interval) => {
    setInterval(() => {
      io.emit('timer', new Date().getTime());
      io.emit('people', log.getNoOfPeopleFromFile());
    }, interval);
  });

  socket.on('change_air_current_temp', (temp) => {
    let currentAirTemp = log.getAirCurrentTemp();
    log.writeAirCurrentTemp(currentAirTemp + temp);
  });
  
  socket.on('subscribeToTimer', () => {
    io.emit('air_current_temp', log.getAirCurrentTemp());
  });

});

app.post("/api/motion", async (req, res) => {
  console.log(req.query);
  req.query && req.query.count && log.writePeopleFile(req.query.count); 
  res.send("ok");
});

app.post("/api/change-air-temperature", async (req, res) => {
  console.log(req.query);
  req.query && req.query.temp && log.writeAirCurrentTemp(req.query.temp);
  res.send("ok");
});

app.get("/api/air-temperature", (req, res) => {
   const temp = log.getAirCurrentTemp();
   console.log(temp)
   res.send(`${temp}`);
});

app.post("/api/temperature_and_humidity", function (req, res) {
    console.log(req.query);
    const data = {
      temperature: req.query.temp,
      humidity: req.query.hum,
      createAt: new Date().getTime()
    };
    io.emit('temperature_and_humidity', data);
    log.WriteSensorLog(data, log.temp_sensor_filename);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});