// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const data = JSON.parse(fs.readFileSync('location-699356735067914240-undefined.json', 'utf8'));

function extractData(data) {
    return data.map((item) => {
      const latitude = item.multi_geo[0].geocode.lat;
      const longitude = item.multi_geo[0].geocode.lng;
      const timestamp = new Date(item.timestamp).getTime();
      const speed = item.sp;
      const direction = item.hd;
  
      return { timestamp, latitude, longitude, speed, direction };
    });
  }

// Stream Function
let isPaused = false 
const extractedData = extractData(data);
let interval
let index = 0

function startStreaming(socket){

  if (!isPaused && index >= extractedData.length) {
    console.log('Data streaming completed');
    return;
  }

  const currentData = extractedData[index];
  console.log(currentData)
  const speed = currentData.speed;

  let intervalTime;
  if (speed === 0) {
    intervalTime = 100; // If speed is 0, set a default interval time of 1000ms
  } else {
    intervalTime = 10000 / speed;
  }
  console.log(intervalTime)
  setTimeout(() => {
    socket.emit('data', currentData);
    index++;
  }, intervalTime);
}

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('data', extractedData[index]);

  let isStreaming = false;
  let interval;

  function startStreaming() {
    if (isStreaming) {
      if (index >= extractedData.length) {
        console.log('Data streaming completed');
        clearInterval(interval);
        return;
      }

      const currentData = extractedData[index];
      console.log(currentData);
      const speed = currentData.speed;

      if (speed === 0) {
        interval= 100; // If speed is 0, set a default interval time of 100ms
      } else {
        interval = 10000 / speed;
      }

      socket.emit('data', currentData);
      index++;
    }
  }

  socket.on('play', () => {
    isStreaming = true;
    startStreaming();
    interval = setInterval(startStreaming, interval); // Use intervalTime instead of 100
  });

  socket.on('pause', () => {
    isStreaming = false;
    clearInterval(interval); // Clear the interval to stop data streaming
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    isStreaming = false;
    clearInterval(interval); // Clear the interval when the client disconnects
  });

  socket.on('startStreaming', () => {
    if (!isStreaming) {
      isStreaming = true;
      startStreaming();
      interval = setInterval(startStreaming, interval); // Use intervalTime instead of 100
    }
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
app.get('/', function (req, res) {
    res.sendFile('views/index.html', {
        root: __dirname
    });
});
//platform agnostics