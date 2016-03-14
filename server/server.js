var app = require('express')();
var http = require('http').createServer(app)
var io = require('socket.io').listen(http);
var userOnline =0;

//Server accepting connect on this port
http.listen(3000);

//Establishing connection to client and disconnecting
io.sockets.on('connection', function(socket){
    console.log('Connected to a new client');
    //Increment the number of user online
    userOnline++;
    socket.emit('user_online',userOnline);

    socket.on('disconnect', function(){
    //Decrement the number of user online
    userOnline--;
    socket.emit('user_online',userOnline);
    console.log('Disconnected from a client');
    });
    
    //Data exchange between client and server
    //Server receives new data from a client and broadcast it to others
    socket.on('client_character',function(msg){
        socket.broadcast.emit('server_character',msg.buffer);
    });
});





