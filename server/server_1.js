var app = require('express')();
var http = require('http').createServer(app)
var io = require('socket.io').listen(http);
var fs = require('fs');
var request = require('request');

var userOnline =0;
//var dir="dir/hello.tex";
var dir="dir";
var SERVER_URL='http://localhost/collatexserver/api';


//Server accepting connect on this port
http.listen(3000);

//Establishing connection to client and disconnecting
io.sockets.on('connection', function(socket){
    console.log('Connected to a new client');
    
    socket.on('room', function(room) {
        socket.join(room);
        console.log('join room '+ room);
    });
    
    
    var room = "abc123";
    //Increment the number of user online
    userOnline++;
    io.emit('user_online',userOnline);

    socket.on('disconnect', function(){
    //Decrement the number of user online
    userOnline--;
    io.emit('user_online',userOnline);
    console.log('Disconnected from a client');
    });
    
    
    //Data exchange between client and server
    //Server receives new data from a client and broadcast it to others
    socket.on('client_character',function(msg, sessionid){
    
    //receive data and sessionid
    console.log('Data + sessionId'+msg.buffer + "--"+sessionid);
    
   // socket.in(room).broadcast.emit('server_character',msg.buffer);
    socket.broadcast.to(room).emit('server_character', msg.buffer);
    //socket.to(room).emit('server_character',msg.buffer);

    });
    //Server receives new document from a client 
    socket.on('client_doc',function(msg, sessionid){
    
    //receive data and sessionid
    console.log('Doc name: '+msg.name + "content: "+msg.content);
    checkDirectoryAndSaveFile(dir, msg.name, msg.content);
    
    });
    
    //Server receives new document from a client 
    socket.on('client_convert',function(msg, sessionid){
    
    //receive document name to be converted and sessionid
    console.log('Doc name: '+msg + "sessionId: "+sessionid);
    var fid =msg;
    var latexFile= dir+"/"+msg;
    //load file contents
    var fileContent= readFileContents(latexFile);
    console.log("Content is : "+ fileContent);
    //Lets configure and request
    request({
        url: SERVER_URL+'/latex2pdf.php', //URL to hit
        //qs: {from: 'blog example', time: +new Date()}, //Query string data
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        //'Custom-Header': 'Custom Value'
        },
        //Lets post the following key/values as form
        form: {          
            file_content: fileContent,
            file_id: fid
        }
    }, function(error, response, body){
        if(error) {
            console.log("Xerror: "+error);
        } else {
            console.log(response.statusCode, body);
            var pdfName = body.replace(/^"(.*)"$/, '$1');
            var link_pdf=SERVER_URL+"/pdf/"+pdfName;
            var document = {     
            name: fid,
            url: link_pdf,
            creator: "user1"
            };
            
            io.emit('server_pdf',document);

    }
    });
    //checkDirectoryAndSaveFile(dir, msg.name, msg.content);
    
    });
});

 function checkDirectoryAndSaveFile(path,fileName, data){
    fs.stat(path, function(err, fileStat) {
    if (err) {
        if (err.code == 'ENOENT') {
            console.log('It is not found.');
        }
    } else {
        if (fileStat.isFile()) {
            console.log('A file is found.');
            createNewFile(path, fileName, data);
        } else if (fileStat.isDirectory()) {
            console.log('A directory is found.');
            createNewFile(path, fileName, data)
        }
    }
});
};

function writeToFile(path, data){
    fs.appendFile(path, data,function(err) {
    if (err) throw err;
});
};

function createNewFile(path, name, data){
    path= path+"/"+name+".tex";
    fs.appendFile(path, data,function(err) {
    if (err) throw err;
});
};

function readFileContents(path){
     /*
     fs.readFile(path, 'utf8', function(err, fileContents) {
        if (err) throw err;
        //console.log("!!! "+fileContents);

        latexContents = fileContents;
        });
        */
    //console.log("!!! "+latexContents);
  return fs.readFileSync(path,'utf8');
};



