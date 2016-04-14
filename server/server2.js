var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
//Server accepting connect on this port
http.listen(3001);

//Establishing connection to client and disconnecting
io.sockets.on('connection', function(socket){
    console.log('Connected to a new client');

    socket.on('error', function(err) {
        //here i change options
        console.log('Error!', err);
    });

    
        
    socket.on('disconnect', function(){
        // socket.disconnect();
        console.log('Disconnected from a client');
    });

    //Data exchange between client and server
    //Server receives new data from a client and broadcast it to others
    socket.on('client_character',function(msg){
        //receive data
        console.log('Data from client: '+msg.buffer);

        socket.broadcast.emit('server_character',msg.buffer);
        console.log('Broadcast to all: '+msg.buffer);

    });

});