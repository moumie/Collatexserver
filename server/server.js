//Imported module variables
var express = require("express");
var app  = express();
var http = require('http').createServer(app)
var io = require('socket.io').listen(http);
var fs = require('fs');
var request = require('request');

//Mongoose models
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

//directory of saved latex files
var dir="dir";

//Url constant
var SERVER_URL='http://localhost/collatexserver/api';

//Server accepting connect on this port
http.listen(3000);

//Establishing connection to client and disconnecting
io.sockets.on('connection', function(socket){
    console.log('Connected to a new client');
    
    //Error detection and logging
    socket.on('error', function(err) {
        console.log('Error!', err);
    });
   
    //Subscription to a room/group
    socket.on('subscribe', function(room) { 
        console.log('joining room ', room);
        
        //Joining the room
        socket.join(room); 
        
        //Increase room counter
        roomCounter++;
        
        //Add room in the list
        roomList[room]=room;
        
        //Emitting room list to client
        io.emit('server_roomlist',roomList);

    })

    //Unsubscribe from a room/group
    socket.on('unsubscribe', function(room) {  
        console.log('leaving room ', room);
        
        //Leaving the room
        socket.leave(room); 
        
        //Decrease counter
        roomCounter--;
        
        //Remove from room list
        delete roomList[room];
        
        //Emitting room list to client
        io.emit('server_roomlist',roomList);
    })
    
    //Increment the number of user online
    userOnline++;
    
    //Emitting the number of online users
    io.emit('user_online',userOnline);
    
    //Disconnecting 
    socket.on('disconnect', function(){
        
    //Decrement the number of user online
    userOnline--;
    
    //Emitting the number of online users
    io.emit('user_online',userOnline);
    
    console.log('Disconnected from a client');
    });
    
    //Loging out
    socket.on('client_logout',function(msg, room){
        
          console.log('Logout ID' +  msg);

         //Decrement the number of user online
          userOnline--;
          
          //Remove user from the list of online users
          delete this.userOnlineList.msg;
          
          //disconnect the client
          socket.disconnect(0);
         
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
            
            //Emitting the list of users' online
            io.emit('server_useronlinelist',userOnlineList);
            
            console.log('User list : '+ userOnlineList);
         }else{
             
            console.log('Empty object: no match found');
            
            //Authentication fails, no match found message sent:
            socket.emit('server_login', 'no match found');
         } 
         
       }
    }); 
    });
    
    
    //Server receives new user info (userEmail, userPassword) from a client 
    socket.on('client_register',function(msg, room){
    
    //receive data and room
     console.log('User email: '+msg.userEmail + "User password: "+msg.userPassword);
     
     //Register user in the database
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
        
    //receive data and room
    console.log('Client room: '+clientroom);
    console.log('Data'+msg.buffer);
    
    //Broadcast received data to all client of the same clientroom
    socket.broadcast.to(clientroom).emit('server_character', msg.buffer);
    });
    
    //Server receives new document from a client to be saved 
    socket.on('client_doc',function(msg, room){
    
    //receive data and room
    console.log('Doc name: '+msg.name + "content: "+msg.content+ "onwer: "+msg.owner);
    
    //Checking directory and saving the file
    checkDirectoryAndSaveFile(dir, msg.name, msg.content, msg.owner);
    
    });
    
    
    //Get a list of documents of  a specific user having userid
    socket.on('client_getdocs',function(userid, room){
    
    //receive data and room
    console.log('User ID: '+userid );
    
    //Performing query in the database to find all documents with creator = userid
    docOp.find({creator:userid},function(err,data){
    if(err) {
           return false;
       } else {

           console.log('USer docs : '+ data);
          
           //Server return all documents of the user
           socket.emit('server_getdocs',data);
       }
     });
    });
    
    //Conversion of the latex document in PDF 
    socket.on('client_convert',function(msg, room){
    
    //receive document name to be converted and room
    console.log('Doc name: '+msg + "room: "+room);
    
    //File name
    var fid =msg;
    
    //Building the path
    var latexFile= dir+"/"+msg;
    
    //load file contents
    var fileContent= readFileContents(latexFile);
    
    console.log("Content is : "+ fileContent);
    
    //Request configuration
    request({
        url: SERVER_URL+'/latex2pdf.php', //URL to hit
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
            //Response logged
            console.log(response.statusCode, body);
            
            //Extraction of the converted PDF name from the result
            var pdfName = body.replace(/^"(.*)"$/, '$1');
            
            //Build a full URL of the converted PDF document
            var link_pdf=SERVER_URL+"/pdf/"+pdfName;
            
            //Preparing a Json object to be sent to clients
            var document = {     
            name: fid,
            url: link_pdf,
            creator: "user1"
            };
            
            //Emitting document meta information
            io.emit('server_pdf',document);
    }
    });
    
    });
    
   
    //Server sends content of the requested document to the client
    socket.on('client_getDocContent',function(path){
    
    //receive data and room
    console.log('Requested content path: '+path);
    
    //Reading a file and emitting it to the client
    socket.emit('server_getDocContent', readFileContents(path));
    });
    
});

 //Checking directory existing and creating/saving a new file
 function checkDirectoryAndSaveFile(path,fileName, data, userpid){
    fs.stat(path, function(err, fileStat) {
    if (err) {
        if (err.code == 'ENOENT') {
            console.log('It is not found.');
        }
    } else {
        if (fileStat.isFile()) {
            console.log('A file is found.');
            
            //Create a new file
            createNewFile(path, fileName, data, userpid);
        } else if (fileStat.isDirectory()) {
            console.log('A directory is found.');
            
            //Create a new file
            createNewFile(path, fileName, data, userpid)
        }
    }
});
};

//Writing data t a file
function writeToFile(path, data){
    fs.appendFile(path, data,function(err) {
    if (err) throw err;
});
};

//Building a path and creating a new file, then write data on it
function createNewFile(path, name, data, userpid){
    var doc_name = userpid+"_"+name;
    path= path+"/"+doc_name+".tex";
    
    //Create file
    fs.writeFile(path, data,function(err) {
    if (err) throw err;
    else{
     //Saving the document in DB.
     docSave(path, userpid)
    }
});
};

//Reading file content
function readFileContents(path){
  return fs.readFileSync(path,'utf8');
};

//Persist a newly registered user in the database
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
   
   //Peform query against the database
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