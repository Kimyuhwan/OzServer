/**
 * Created by yuhwan on 2015. 10. 12..
 */
angular.module('starter.services', [])

.factory('socket',function(socketFactory){
	//Create socket and connect to http://chat.socket.io


 	var myIoSocket = io.connect('http://128.199.239.83:5000');

  	mySocket = socketFactory({
    	ioSocket: myIoSocket
  	});

	return mySocket;
});