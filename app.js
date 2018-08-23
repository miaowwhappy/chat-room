var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use('/static', express.static('public'))

server.listen(9000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


var users = [];

io.on('connection', function (socket) {
  var user = null;

  socket.on('login',function(username){
  	for(var i = 0; i < users.length; i++){
  		if(users[i] == username){
  			socket.emit('login_fail','用户名已存在')
  			return
  		}
  	}
	user = username
	users.push(user)
	io.sockets.emit('login_success',{username: username, users: users}) 
	socket.emit('user_login_success',{username: username, users: users})   	
  })

  socket.on("disconnect", function(){
  	if(user){
  		var index = users.indexOf(user)
  		users.splice(index, 1)
  		user = null
  		io.sockets.emit('logout_success',{user: user, users: users})
		socket.emit('logout',{user: user, users: users})
  	}	
  	
  })

  socket.on("send", function(data){
  	if (data.username) {
  		data.username = user
		socket.emit("send_success", data);
		socket.broadcast.emit("boradcast",data)
  	} else {		
		var index = users.indexOf(user);
	} 	
  })
  socket.on("sendPic", function(data){
  	console.log(data.img)
  	socket.emit("sendPic_success", data.img);
  	socket.broadcast.emit("boradcastPic",{img:data.img,username:user})
  })

}); 