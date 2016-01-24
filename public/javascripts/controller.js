/**
 * Created by yuhwan on 2015. 10. 11..
 */
angular.module('starter.controllers', [])

.controller('ozController', function($scope, socket, $window) {
    console.log('ozController Start');
    $scope.name = "";

    socket.on('connect',function(){
        console.log('connected');
    });

    socket.on('new user', function(data) {
        console.log('new user' + data);
        user_list = [];
        for(var index in data) {
            if(data[index] !== 'Master') {
                user_list.push({name: data[index], checkbox: false});
            }
        }
        $scope.user_list = user_list;
    });

    socket.on('Rhythm', function(data) {
        console.log('Rhythm ' + data);
    });

    socket.on('Init', function(data) {
        console.log('Initialize');
    });

    socket.on('Sync Changed', function(data) {
        console.log('Sync State Changed');
        console.log(data);
    });

    $scope.keyChange = function(event) {
        if(event.keyCode == 37) {
            $scope.key_name = '왼쪽 방향키';
            socket.emit('Rhythm', 'A');
            // socket 리듬 A
        } else if(event.keyCode == 39){
            $scope.key_name = '오른쪽 방향키';
            socket.emit('Rhythm', 'B');
            // socket 리듬 B
        } else {
            $scope.key_name = '등록되지 않은 키';
        }
        console.log(event.keyCode);
    };

    $scope.registerMaster = function() {
        socket.emit('I am Master', 'Master');
    };

    $scope.registerParticipant = function() {
        if($scope.name === "")
            alert('이름을 입력해주세요.');
        else
            socket.emit('Add User', $scope.name);
    };

    $scope.changeBox = function(name, value) {
        console.log('change Box : ' + name + ' / ' + value);
        socket.emit('Sync State Change', {name: name, value: value});
    };

    $scope.onExit = function() {
      socket.emit('Disconnect', $scope.name);
    };

    $window.onbeforeunload =  $scope.onExit;

    $scope.initialize = function() {
        socket.emit('Initialize', 'Master');
        $scope.user_list = [];
    };



});