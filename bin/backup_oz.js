/**
 * Created by yuhwan on 2016. 1. 10..
 */
//// 현재 접속 되어있는 사용자들
//var connectedUsers = {};
//// 각 사용자별, current state and state별 timestamp
//var statesUsers = {};
//// User Index
//var userIndex = {"0": false, "1": false, "2": false};
//// No sync timers
//var noSyncTimers = {"1": {"Left": null, "Right": null}, "2": {"Left": null, "Right": null}};
//// Sync threshold
//var syncThreshold = 800; // 400 ms
//// Sync states
//var syncStates = {"1": {"Left": false, "Right": false}, "2": {"Left": false, "Right": false}};
//// Sync num
//var syncNum = 0;
//// 목표 Sync num
//var goalSyncNum = 3;
//
//function newTimerFunction(key, index, state, socket) {
//
//     return setTimeout(function(){
//            syncStates = {"1": {"Left": false, "Right": false}, "2": {"Left": false, "Right": false}};
//            console.log('No Synchronized ' + key);
//            for(var name in connectedUsers) {
//                console.log('Send No Sync to ' + name);
//                connectedUsers[name].emit('Nosynchronized', {index: index, state: state});
//            }
//            noSyncTimers[index][state] = null;
//
//     }, syncThreshold + 100);
//
//}
//
//function myStopFunction(timer) {
//    console.log('cancel timer');
//    clearTimeout(timer);
//}
//
//io.on('connection', function (socket) {
//    console.log('connected');
//
//    socket.on('Login', function(data) {
//        console.log('Login : ' + data);
//
//        var index;
//        if(data === 'Origin') {
//            index = 0;
//            userIndex["0"] = true;
//        } else {
//            if(data in statesUsers)
//                index = statesUsers[data]["index"];
//            else {
//                if(userIndex["1"] == false) {
//                    index = 1;
//                    userIndex["1"] = true;
//                } else if(userIndex["2"] == false){
//                    index = 2;
//                    userIndex["2"] = true;
//                } else {
//                    console.log('Number of connected users are already 2');
//                }
//            }
//        }
//
//        console.log('index : ' + index);
//
//        // Socket 통신을 위해서 각 사용자의 Socket 정보를 저장
//        connectedUsers[data] = socket;
//        statesUsers[data] = {"index":index};
//
//        console.log(JSON.stringify(statesUsers));
//
//        // 현재까지 접속한 사람들의 정보를 보냄
//        socket.emit('Connected', statesUsers);
//        socket.broadcast.emit('Connected', statesUsers);
//
//        if(userIndex["0"] == true && userIndex["1"] == true && userIndex["2"] == true) {
//            console.log('start Collection');
//            syncStates = {"1": {"Left": false, "Right": false}, "2": {"Left": false, "Right": false}};
//            syncNum = 0;
//            socket.emit('Started', statesUsers);
//            socket.broadcast.emit('Started', statesUsers);
//        }
//    });
//
//    socket.on('Rhythm', function (data) {
//        var current_time =new Date().getTime();
//        console.log('Rythm From ' + data.name);
//
//        if(data.name === 'Origin') {
//            // Origin 일 때만, Broadcast Rhythm (이건 Cue 생성이 목적)
//            socket.emit('Rhythm', data.state);
//            socket.broadcast.emit('Rhythm', data.state);
//            statesUsers['Origin']["current"] = data.state; // set current state
//            statesUsers['Origin'][data.state] = current_time; // set time to each state
//
//            // compared with other users
//            for(var key in statesUsers) {
//                if(key !== 'Origin' && data.state in statesUsers[key]) {
//                    var diff = Math.abs(statesUsers[key][data.state] - statesUsers['Origin'][data.state]);
//                    console.log('Diff with Origin : ' + diff);
//                    console.log('Origin time : ' + statesUsers['Origin'][data.state]);
//                    console.log(key + ' time : ' + statesUsers[key][data.state]);
//
//                    if(diff < syncThreshold) {
//                        console.log('Synchronized with ' + data.state);
//                        socket.emit('Synchronized', {name: key, index: statesUsers[key]["index"], state: data.state});
//                        socket.broadcast.emit('Synchronized', {name: key, index: statesUsers[key]["index"], state: data.state});
//                        if(noSyncTimers[statesUsers[key]["index"]][data.state] !== null) {
//                            myStopFunction(noSyncTimers[statesUsers[key]["index"]][data.state]);
//                            noSyncTimers[statesUsers[key]["index"]][data.state] = null;
//                        }
//
//                        // Sync 판명
//                        console.log('before : ' + JSON.stringify(syncStates));
//                        syncStates[statesUsers[key]["index"]][data.state] = true;
//                        console.log('after : ' + JSON.stringify(syncStates));
//                        // Sync num을 올려야하는지 판단
//                        var synResult = syncStates["1"]["Left"] && syncStates["1"]["Right"] && syncStates["2"]["Left"] && syncStates["2"]["Right"]
//                        console.log('result : ' + synResult);
//                        if(synResult == true) {
//                            syncNum++;
//                            console.log('SyncNum!! : ' + syncNum);
//                            syncStates = {"1": {"Left": false, "Right": false}, "2": {"Left": false, "Right": false}};
//                            if(syncNum === 1) {
//                                setTimeout(function(){
//                                    socket.emit('Success', '1');
//                                    socket.broadcast.emit('Success', '1');
//                                }, 500);
//                            } else if(syncNum === 2) {
//                                setTimeout(function(){
//                                    socket.emit('Success', '2');
//                                    socket.broadcast.emit('Success', '2');
//                                }, 500);
//
//                            } else if(syncNum === goalSyncNum) {
//                                setTimeout(function(){
//                                    socket.emit('Success', '3');
//                                    socket.broadcast.emit('Success', '3');
//                                }, 500);
//
//                                setTimeout(function(){
//                                    console.log('Completed');
//                                    socket.emit('Completed', ''); // add names
//                                    socket.broadcast.emit('Completed', ''); // add names
//                                }, 800);
//
//                            }
//                        }
//
//                    } else {
//                        // no synched
//                        //check sync timers
//                        if(noSyncTimers[statesUsers[key]["index"]][data.state] == null) {
//                            noSyncTimers[statesUsers[key]["index"]][data.state] = newTimerFunction(key, statesUsers[key]["index"], data.state, socket);
//                        }
//
//                    }
//                }
//            }
//
//        } else {
//
//            // update my state
//            statesUsers[data.name]["current"] = data.state; // set current state
//            statesUsers[data.name][data.state] = current_time; // set time to each state
//
//            // compared with origin for synchronization
//            if('Origin' in statesUsers && data.state in statesUsers['Origin']) {
//                // Origin is ready
//                var diff = Math.abs(statesUsers[data.name][data.state] - statesUsers['Origin'][data.state]);
//                console.log('Diff with Origin : ' + diff);
//                console.log('Origin time : ' + statesUsers['Origin'][data.state]);
//                console.log('My time : ' + statesUsers[data.name][data.state]);
//
//                // add synchronization logic here
//                if(diff < syncThreshold) {
//                    console.log('Synchronized with ' + data.state);
//                    // 나 뿐만 아니라 모든 사람들에게 Synchronized 되었다고 전달
//                    socket.emit('Synchronized', {name: data.name,index: statesUsers[data.name]["index"], state: data.state});
//                    socket.broadcast.emit('Synchronized', {name: data.name,index: statesUsers[data.name]["index"], state: data.state});
//                    if(noSyncTimers[statesUsers[data.name]["index"]][data.state] !== null) {
//                        myStopFunction(noSyncTimers[statesUsers[data.name]["index"]][data.state]);
//                        noSyncTimers[statesUsers[data.name]["index"]][data.state] = null;
//                    }
//
//                    // Sync 판명
//                    console.log('before : ' + JSON.stringify(syncStates));
//                    syncStates[statesUsers[data.name]["index"]][data.state] = true;
//                    console.log('after : ' + JSON.stringify(syncStates));
//                    // Sync num을 올려야하는지 판단
//                    var synsResult = syncStates["1"]["Left"] && syncStates["1"]["Right"] && syncStates["2"]["Left"] && syncStates["2"]["Right"];
//                    console.log('result : ' + synsResult);
//                    if(synsResult == true) {
//                        syncNum++;
//                        console.log('SyncNum!! : ' + syncNum);
//                        syncStates = {"1": {"Left": false, "Right": false}, "2": {"Left": false, "Right": false}};
//                        if(syncNum === 1) {
//                            setTimeout(function(){
//                                socket.emit('Success', '1');
//                                socket.broadcast.emit('Success', '1');
//                            }, 500);
//                        } else if(syncNum === 2) {
//                            setTimeout(function(){
//                                socket.emit('Success', '2');
//                                socket.broadcast.emit('Success', '2');
//                            }, 500);
//                        } else if(syncNum === goalSyncNum) {
//                            setTimeout(function(){
//                                socket.emit('Success', '3');
//                                socket.broadcast.emit('Success', '3');
//                            }, 500);
//
//                            setTimeout(function(){
//                                console.log('Completed');
//                                socket.emit('Completed', ''); // add names
//                                socket.broadcast.emit('Completed', ''); // add names
//                            }, 800);
//
//                        }
//                    }
//
//                } else {
//
//                    if(noSyncTimers[statesUsers[data.name]["index"]][data.state] == null) {
//                            noSyncTimers[statesUsers[data.name]["index"]][data.state] = newTimerFunction(data.name, statesUsers[data.name]["index"], data.state, socket);
//                    }
//
//                }
//            }
//
//        }
//    });
//
//    socket.on('Disconnect', function (data) {
//        console.log('Disconnected : ' + data);
//
//        if(userIndex["0"] == true && userIndex["1"] == true && userIndex["2"] == true) {
//            console.log('stop Collection');
//            socket.emit('Stopped', statesUsers);
//            socket.broadcast.emit('Stopped', statesUsers);
//        }
//
//        var index = statesUsers[data]["index"];
//        userIndex[index] = false;
//
//        console.log(JSON.stringify(userIndex));
//
//        if(data in connectedUsers)
//            delete connectedUsers[data];
//        if(data in statesUsers)
//            delete statesUsers[data];
//
//        socket.broadcast.emit('Disconnected', index);
//        syncNum = 0;
//        noSyncTimers = {"1": {"Left": null, "Right": null}, "2": {"Left": null, "Right": null}};
//        syncStates = {"1": {"Left": false, "Right": false}, "2": {"Left": false, "Right": false}};
//    });
//
//});