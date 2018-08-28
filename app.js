var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use('/static', express.static('public'))

server.listen(9000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/gesture', function (req, res) {
  res.sendFile(__dirname + '/gesture.html');
});

app.get('/up', function (req, res) {
  res.sendFile(__dirname + '/up.html');
});


var users = [];

io.on('connection', function (socket) {
  var user = null;
  /*{
  	username: '',
  	id: '',
    avaterData: ''
  }*/

  socket.on('login',function(data){
  	for(var i = 0; i < users.length; i++){
  		if(users[i].username == data.username){
  			socket.emit('login_fail','用户名已存在')
  			return
  		}
  	}

	user = data
	users.push(user)
	io.sockets.emit('login_success',{user: user, users: users}) 
	socket.emit('user_login_success',{user: user, users: users})   	
  })

  socket.on("disconnect", function(){
  	if(user){
  		var index = null;

  		for(var i = 0; i < users.length; i++){
  			if(users[i].username == user.username){
  				index = i;
  				break;
  			}
  		}
  		users.splice(index, 1) 		
  		io.sockets.emit('logout_success',{user: user, users: users})
		socket.emit('logout',{user: user, users: users})
		user = null;
  	}	
  	
  })

  socket.on("send", function(data){
  	if (user) {
  		data.username = user.username;

		socket.emit("send_success", data);
		socket.broadcast.emit("boradcast",data)
  	} else {		
		socket.emit("user_logout", data);
	} 	
  })
  socket.on("sendPic", function(data){
  	if(user){
  		data.username = user.username;
  		socket.emit("sendPic_success", data);
  		socket.broadcast.emit("boradcastPic",data)
  	}else{		
		socket.emit("user_logout", data);
	}
  	
  })


  socket.on("one2one_send", function(data){
  	if(user){
	  	//要发送的id
	  	var { id } = data;
	  	//发送者id
	  	data.userId = user.id;
	  	data.username = user.username;
      data.users = users;
	  	socket.emit("one2one_send_success", data);
		io.sockets.to(id).emit('receive_message', data);
	}else{		
		socket.emit("user_logout", data);
	}
  })
  socket.on("one2one_sendPic", function(data){
  	if(user){
	  	var { id } = data;
	  	data.userId = user.id;
	  	data.username = user.username;
      data.users = users;
		socket.emit("one2one_sendPic_success", data);
		io.sockets.to(id).emit('receive_pic', data);
  	}else{		
		socket.emit("user_logout", data);
	}
  })



}); 