# TalentPlus video call app

To run this app, open the terminal on your local machine and clone this repo using "git clone https://github.com/Ayodeji10/talentplus.git"

The Project is made of of two parts, the server and the frontend, open the folder in your code editor and run npm install, this installs the nodejs server

Then navigate to the frontend folder and run npm install to installl the frontend

in the main folder, run "npm run dev to start the server"

In the frontend folder, run npm start to start the react app

## Notes

### Server

The server is a simple nodejs server using socket.io for real time communication with the frontend, Packages installed in the server are cors, express, nodemon and socket.io

Backend is hosted on render.com with url https://video-call-api.onrender.com/

### Frontend

The frontend is a basic react application using socket.io and WebRTC to communicate with the server, the packages installed are socket.io-client, simple-peer and react-copy-to-clipboard

frontend is hosted on firbase with url https://video-call-app-20cf1.web.app/

Please Note that both videos have been muted for the sake of echos that can occour during tests
