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

-Up to 5 concurrent games, 10 concurrent clients actively playing  
-Optimized for mobile, touch friendly

The server uses an authoritative architecture, where every client request must first be validated by the server to keep clients in sync and to prevent cheating. Server reconciliation and lag compensation techniques are implemented to minimize the effects of latency on gameplay.

## Compilation/Deployment Instructions
If you want to serve everything yourself, you'll need to have Node.js installed on the host computer. Download the entire Pong folder, then unzip the node_modules folder.

You may have to configure your network to allow port forwarding. This application uses port 5000 by default.

Finally, navigate to the root directory of this project in command line and run 'node server.js' to start the server. Usually you can then access it at [localhost:5000](localhost:5000)

## Test Code
Test automation was implemented with Mocha, a test framework for Node.js programs. Included is a test suite designed to verify that the server is sending the correct connection responses to the client. A test command can be sent in command line with 'npm test'.
