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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

io.on('connection', function (socket) {
  socket.on('subscribeToSensor', (payload) => {
    io.emit('temperature_and_humidity', payload);
  });

  socket.on('subscribeToTimer', (interval) => {
    setInterval(() => {
      io.emit('timer', new Date().getTime());
      // io.emit('people', log.getNoOfPeopleFromFile())
    }, interval);
  });
});

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT');
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, Authorization, token");
//     next();
// });

app.post("/motion", async (req, res) => {
  console.log(req.query);
  await log.WriteSensorLog(req.query,log.motion_sensor_filename); 
  res.send("ok");
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

// app.get("/api/temperature_and_humidity", function (req, res) {
//   console.log(req);
//   io.emit('temperature_and_humidity', 'req');  
//   res.send('hello');
// });

// app.get("/count", function(req, res) {
//   let inCount = 0;
//   let outCount = 0;
//   for (let i = 0; i < signals.length / 2 && signals.length > 1; i = i + 2) {
//     if (signals[i].id === "1" && signals[i + 1].id === "2" ) {
//       inCount = inCount + 1;
//     }
//     if (signals[i].id === "2" && signals[i + 1].id === "1") {
//       outCount = outCount + 1;
//     }
//   }
//   const people = inCount - outCount;
//   res.send("hello" + people);
// });

// app.get("/info",(req, res) => {
//     console.log(temperature)
//     res.send(info)
// })

// // Change the 404 message modifing the middleware
// app.use(function(req, res, next) {
//   res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
// });


http.listen(3000, function () {
  console.log('listening on *:3000');
});