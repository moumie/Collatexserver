//var app = require('express')();
var express = require("express");
var app  = express();
var http = require('http').createServer(app)
var io = require('socket.io').listen(http);
var fs = require('fs');
var request = require('request');
var userOp = require("./models/user");
var docOp = require("./models/doc");

//list of users online
var userOnlineList = new Object(); 

//list of users online
var roomList = new Object();
//room counter
var roomCounter=0;

//number of users online
var userOnline =0;
//var dir="dir/hello.tex";
var dir="dir";
var SERVER_URL='http://localhost/collatexserver/api';


//Server accepting connect on this port
http.listen(3000);

//Establishing connection to client and disconnecting
io.sockets.on('connection', function(socket){
    console.log('Connected to a new client');
    
    socket.on('error', function(err) {
        //here i change options
        console.log('Error!', err);
    });
   
    
    socket.on('subscribe', function(room) { 
        console.log('joining room ', room);
        socket.join(room); 
        roomCounter++;
        //Add user in the list
        roomList[room]=room;
        io.emit('server_roomlist',roomList);

    })

    socket.on('unsubscribe', function(room) {  
        console.log('leaving room ', room);
        socket.leave(room); 
        //roomCounter--;
        //remove from room list
        delete roomList[room];
        io.emit('server_roomlist',roomList);
    })
    
    //Increment the number of user online
    userOnline++;
    io.emit('user_online',userOnline);
    //userAuthentication(socket, userEmail, userPassword);
    

    socket.on('disconnect', function(){
    //Decrement the number of user online
    userOnline--;
    io.emit('user_online',userOnline);
    console.log('Disconnected from a client');
    });
    
    socket.on('client_logout',function(msg, room){
        
          console.log('Logout ID' +  msg);

         //Decrement the number of user online
          userOnline--;
          delete this.userOnlineList.msg;
          //this.userOnlineList[msg]=null;
          //disconnect the client
          socket.disconnect(0);
          //update
          //socket.broadcast.to(room).emit('server_useronlinelist',userOnlineList);
    });
     
    //Server receives new login credentials (userEmail, userPassword) from a client 
    socket.on('client_login',function(msg, room){
    
    //receive data and room
     console.log('User email: '+msg.userEmail + "User password: "+msg.userPassword);
     
    //Returning the id of the new user to the client
    userOp.findOne({userEmail:msg.userEmail, userPassword:msg.userPassword},function(err,data){
     if(err) {
              socket.emit('server_login',"Error occured");
              console.log('Error 0 : '+ err);
       } else {
          
        if (data) {
            console.log('Auth 0 : '+ data.userEmail);
            console.log('Auth 1 : '+ data.userPassword);
            console.log('Auth 2 : '+ data._id);
            //Add user in the list
            userOnlineList[data._id]=data.userEmail;
            //Send to client:
            socket.emit('server_login',data._id);
            //socket.broadcast.to(room).emit('server_useronlinelist',userOnlineList);
            io.emit('server_useronlinelist',userOnlineList);
            console.log('User list : '+ userOnlineList);
         }else{
             
            console.log('Empty object: no match found');
            //Send to client:
            socket.emit('server_login', 'no match found');
         } 
            //Send to client:
            //socket.emit('server_registration',data._id);
       }
    });
     
    
    });
    
    
    //Server receives new user info (userEmail, userPassword) from a client 
    socket.on('client_register',function(msg, room){
    
    //receive data and room
     console.log('User email: '+msg.userEmail + "User password: "+msg.userPassword);
     userRegister(msg.userEmail , msg.userPassword);
     
    //Returning the id of the new user to the client
    userOp.findOne({userEmail:msg.userEmail, userPassword:msg.userPassword},function(err,data){
     if(err) {
              socket.emit('server_registration',"Error occured");
              console.log('Error 0 : '+ err);
       } else {
        if (data) {
            console.log('Index 0 : '+ data.userEmail);
            console.log('Index 1 : '+ data.userPassword);
            console.log('Index 2 : '+ data._id);            
            //Send to client:
            socket.emit('server_registration',data._id);
         }else{             
            console.log('Empty object: no match found');
            socket.emit('server_registration','no match found');
         }
       }
    });
    });
    
    //Data exchange between client and server
    //Server receives new data from a client and broadcast it to others
    socket.on('client_character',function(msg, clientroom){
    
    console.log('Client room: '+clientroom);
    //receive data and room
    console.log('Data'+msg.buffer);
    
    socket.broadcast.to(clientroom).emit('server_character', msg.buffer);
    // socket.emit('server_character', msg.buffer);
    });
    //Server receives new document from a client 
    socket.on('client_doc',function(msg, room){
    
    //receive data and room
    console.log('Doc name: '+msg.name + "content: "+msg.content+ "onwer: "+msg.owner);
    checkDirectoryAndSaveFile(dir, msg.name, msg.content, msg.owner);
    
    });
    
    
    //Server receives new document from a client 
    socket.on('client_getdocs',function(userid, room){
    
    //receive data and room
    console.log('User ID: '+userid );
    
    docOp.find({creator:userid},function(err,data){
    if(err) {
           return false;
       } else {
           //console.log('Index 0 : '+ JSON.stringify(data));
           //console.log('Index 0 : '+ data.userEmail);
           console.log('USer docs : '+ data);
           //return data;       //Server return all documents of the user
           socket.emit('server_getdocs',data);
       }

     });
    
    
    });
    
    //Server receives new document from a client 
    socket.on('client_convert',function(msg, room){
    
    //receive document name to be converted and room
    console.log('Doc name: '+msg + "room: "+room);
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
    
   
    //Server sends content of the requested document to the client
    socket.on('client_getDocContent',function(path){
    
    //receive data and room
    console.log('Requested content path: '+path);
    
    socket.emit('server_getDocContent', readFileContents(path));
    });
    
});

 function checkDirectoryAndSaveFile(path,fileName, data, userpid){
    fs.stat(path, function(err, fileStat) {
    if (err) {
        if (err.code == 'ENOENT') {
            console.log('It is not found.');
        }
    } else {
        if (fileStat.isFile()) {
            console.log('A file is found.');
            createNewFile(path, fileName, data, userpid);
        } else if (fileStat.isDirectory()) {
            console.log('A directory is found.');
            createNewFile(path, fileName, data, userpid)
        }
    }
});
};

function writeToFile(path, data){
    fs.appendFile(path, data,function(err) {
    if (err) throw err;
});
};

function createNewFile(path, name, data, userpid){
    var doc_name = userpid+"_"+name;
    path= path+"/"+doc_name+".tex";
    //fs.appendFile(path, data,function(err) {
    fs.writeFile(path, data,function(err) {
    if (err) throw err;
    else{
     //Saving the document in DB.
     docSave(path, userpid)
    }
});
};

function readFileContents(path){

  return fs.readFileSync(path,'utf8');
};

//Register a new user
function userRegister(email, password){
var db = new userOp();
var response = {};
db.userEmail = email;
db.userPassword = password;
db.save(function(err){   
  if(err) {
        response = {"error" : true,"message" : "Error adding data"};
       } 
       else {
        response = {"error" : false,"message" : "User added"};
       }
  });
}

//Save document and user info in the database
function docSave(name, userid){
var db = new docOp();
var response = {};
db.name = name;
db.creator = userid;
db.save(function(err){   
  if(err) {
        response = {"error" : true,"message" : "Error adding data"};
       } 
       else {
        response = {"error" : false,"message" : "Doc and User added"};
       }
  });
}


//User authentication
function userAuthentication(socket, userEmail, userPassword){
    
   userOp.findOne({userEmail:userEmail, userPassword:userPassword},function(err,data){
   if(err) {
           return false;
       } else {
           //console.log('Index 0 : '+ JSON.stringify(data));
           console.log('Auth 0 : '+ data.userEmail);
           console.log('Auth 1 : '+ data.userPassword);
           
       }

    });
}