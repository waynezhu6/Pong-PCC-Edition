# Pong PCC Edition

[Try it out here!](http://99.245.93.208:5000/)

## Controls

#### For desktop:  
W / Arrow Up - move up  
S / Arrow Down - to move down

#### For mobile:
-Tap on left half of screen to move up  
-Tap on right half of screen to move down

##### First player to 11 points wins.

## About this Project

This web app is my submission for the PCC Summer Internship. Applicants were asked to make a game of Pong. 

-HTML/CSS/Javascript frontend  
-Node.js backend  
-Real time communication driven by Socket.IO  
-Test automation with Mocha 

-Up to 5 concurrent games  
-Optimized for mobile


The server uses an authoritative architecture, where every client request must first be validated by the server to keep clients in sync and to prevent cheating. Server reconciliation and lag compensation techniques are implemented to minimize the effects of latency on gameplay.

## Compilation/Deployment Instructions
If you want to serve everything yourself, I've uploaded the entire folder (without the node modules) to Google Drive [here](https://drive.google.com/open?id=1LY6qULJ3ZC9vJGtbFzrXV4i2JII4aMon).

Configure your network to allow port forwarding. This application uses port 5000 by default.

You'll need to have Node.js installed on the host computer

npm install the following dependencies to the root directory of the project:  
1. express  
2. socket.io  
3. request  
4. mocha  
5. chai

Finally, navigate to the root directory of this project in command line and run 'node server.js' to start the server

## Test Code
Test automation was implemented with Mocha, a test framework for Node.js programs. Included is a test suite designed to verify that the server is sending the correct connection responses to the client.
