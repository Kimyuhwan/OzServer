#!/usr/bin/env node

/**
 * Module dependencies.
 **/

var app = require('../app');
var debug = require('debug')('OzServer:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);
var io = require('socket.io')(server);
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);








/*
    Global Variables...
    (Socket and Prompt 에서 공유하는 Variables)
 */

// Static information
var participationCodeList = [];
var participationIDList = [];
var participationStateList = [];
var participationCommentList = [];
var participantSockets = [];

// set static variables...
var fs = require('fs');
fs.readFile('data.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var lines = data.split("\n");
  console.log('We set the static information, the length of it is ' + lines.length);

  for(var index in lines) {
    var d = lines[index].split(",");
    participationCodeList.push(d[0]);
    participationIDList.push(d[1]);
    participationStateList.push(false);
    participationCommentList.push("");
  }

});

// For setting
var participationCode = new Set();
participationCode.add("NC182"); // initial code
participationCode.add("NC354");

// For game
var gestures = function (callback) {
    var one_timestamp = 0;
    var two_timestamp = 0;
    return {
        setOneTimestamp : function(timestamp) {
            one_timestamp = timestamp;
            callback(one_timestamp, two_timestamp);
        },
        setTwoTimestamp : function(timestamp) {
            two_timestamp = timestamp;
            callback(one_timestamp, two_timestamp);
        }
    };
};

var gesture_manager = gestures(function(one_timestamp, two_timestamp) {
    var gap = Math.abs(one_timestamp - two_timestamp);
    if(gap < 1500) {
        console.log('Synchronization');
        user_socket[0].emit('Vibration');
        user_socket[1].emit('Vibration');
    }
});

var user_name = [];
var user_socket = [];
var user_comments_id = new Set();
var user_comments = [];

/*
    Socket Connection Functions
    (Socket 을 통해 Client 에 연결하는 함수들)
*/
io.on('connection', function (socket) {
    console.log('connected');
    participantSockets.push(socket);

    // 참여 코드를 확인
    socket.on('CheckCode', function(data) {
        console.log('CheckCode : ' + data);

        // 데이터 베이스에서 확인하는 작업을 진행해야함.
        if(participationCode.has(data)) {
             // 사용자의 고유 아이디와 이름 정보를 보냄
             socket.emit('ValidCode', {id: participationIDList[participationCodeList.indexOf(data)], index: participationCodeList.indexOf(data)});
             // 여기 Index!
             console.log('ValidCode! ID: ' + participationIDList[participationCodeList.indexOf(data)]);
        } else {
            socket.emit('InvalidCode');
            console.log('It is invalid code');
        }

    });

    // 게임에 Login
    socket.on('Login', function(data) {
        console.log('Login : ' + data + ' Length : ' + user_name.length);

        if(user_name.length === 0) {
            // add name
            user_name.push(data);
            user_socket.push(socket);

        } else if(user_name.length === 1) {
            // add name
            user_name.push(data);
            user_socket.push(socket);
            console.log('Current Users : ' + user_name.toString());

            // broadcast
            var start_timestamp = new Date().getTime() + 5000; // after 5 sec.
            user_socket[0].emit('Start', start_timestamp);
            user_socket[1].emit('Start', start_timestamp);
        } else {
            // error
            console.log('Err: the number of users is already 2.');
        }

    });

    // 게임중 Gesture
    socket.on('Gesture', function(data) {
        console.log('Gesture : ' + JSON.stringify(data));
        if(user_name.indexOf(data['name']) === 0)
            gesture_manager.setOneTimestamp(data['timestamp']);
        else if(user_name.indexOf(data['name']) === 1)
            gesture_manager.setTwoTimestamp(data['timestamp']);
        else
            console.log('something is wrong!');
    });

    // Comments 업데이트
    socket.on('Comments', function(data) {
        console.log('Comments : ' + JSON.stringify(data));
        // update participation information
        participationStateList[data['index']] = true;
        participationCommentList[data['index']] = data['comment'];

        var user_id = participationIDList[data['index']];
        console.log('user_id : ' + user_id);

        if(!user_comments_id.has(user_id)) {
            //add user id
            user_comments_id.add(user_id);

            // add comment
            var comment = {};
            comment[user_id] = data['comment'];
            user_comments.push(comment);
            console.log('add comment : ' + JSON.stringify(comment));
        }

        // give the information to partner
        user_socket[0].emit('PushComments', user_comments);
        user_socket[1].emit('PushComments', user_comments);
    });

    // Comment 요청
    socket.on('GetComments', function() {
        console.log('GetComments');
        socket.emit('PushComments', user_comments);
    });

    // ProgressUpdate 요청
    socket.on('UpdateOverall', function() {
        console.log('UpdateOverall');
        socket.emit('UpdateProgress', {'ID' : participationIDList, 'Comments' : participationCommentList});
    });

});


/*
    Prompt Functions
    (전체 관리를 위해서 서버에서 내리는 명령들)
*/
var stdin = process.openStdin();
stdin.addListener("data", function(d) {

    var data = d.toString().trim().split(" ");
    if(data.length !== 2) {
        console.log('You typed wrong command! The length of data should be two but yours is ' + data.length);
    } else {
        var command = data[0];
        var args = data[1];
        console.log('=== Command : ' + command + ', Args : ' + args + '===\n');

        // Functions
        switch(command) {
            case 'setCode': setCurrentCode(args); break;
            case 'setParticipation': setParticipation(args); break;
            case 'setComments': setComments(args); break;
            case 'showCode': showCurrentCode(); break;
            case 'showStatic': showStaticVariables(); break;
            case 'showOverall': showOverallStates(); break;
            case 'initGame' : initGameVariables(); break;
            default: console.log('no such function');
        }
    }

    console.log('\n\n');
});

function setCurrentCode(data) {
    console.log('setCurrentCode Start with : ' + data);

    var codes = data.split(",");
    if(codes.length !== 2)
        console.log('The code lenght is not 2 (e.g., ABC, EFT)');
    else {

        if(participationCodeList.indexOf(codes[0]) !== -1 && participationCodeList.indexOf(codes[1]) !== -1) {

            participationCode = new Set();
            for(var index in codes) {
                var code = codes[index];
                console.log('The code is valid and the order is ' + participationCodeList.indexOf(code));
                participationCode.add(code);
            }
            console.log("Don't forget to send a message to participants with this code!");
            initGameVariables();

        } else {
            console.log('The code is invalid! Please check it again!');
        }
    }
}

function setParticipation(data) {
    var args = data.split(",");
    if(args.length === 2) {
        if(args[1] === "True")
            participationStateList[args[0]] = true;
        else
            participationStateList[args[0]] = false;
        console.log('Change participation state successfully! Index' + args[0] + ' to ' + args[1]);
    } else
        console.log('The length of Args should be 2! (e.g., 0,true)');
}

function setComments(data) {
    var args = data.split(",");
    if(args.length === 2) {
        participationCommentList[args[0]] = args[1];
        console.log('Change participation state successfully! Index' + args[0] + ' to ' + args[1]);
    } else
        console.log('The length of Args should be 2! (e.g., 0,true)');
}

function showCurrentCode() {
    console.log('Current Codes are ');
    participationCode.forEach(function(value) {
        console.log(value + ',');
    });
}

function showStaticVariables() {
    console.log('Participation Code : ' + participationCodeList);
    console.log('Participation ID : ' + participationIDList);
}

function showOverallStates() {
    var length = participationCodeList.length;
    console.log('\tIndex\tID\tParticipation\tComments');
    for(var i = 0; i < length; i++)
        console.log("\t" + i + "\t" + participationIDList[i] + "\t" + participationStateList[i] + "\t" + participationCommentList[i]);
}

function initGameVariables() {
    console.log('Initialize Game Variables');
    user_name = [];
    user_socket = [];
    user_comments = [];
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


