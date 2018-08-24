//登录
$(".loginBtn").click(function(){
	var username = $(".name").val();
	if(!username){
		alert('请输入登录用名')
		return
	}
	userId = socket.id;

	socket.emit('login', {username,id: socket.id});				
})
//发送图片
$("#file").change(function(){
	var file = this.files[0];
	if(file.size/1024 > 40){ //大于40kb
		photoCompress(
			file,
			{
				quality: 0.6,
				width: 260
			},
			function(base64){
				console.log(base64.length / 1024) 
				socket.emit('sendPic',{
					img: base64
				})
				$("#file").val("")
			}
		)
	}else{
		var reader = new FileReader();
		reader.readAsDataURL(file)
		reader.onerror = function(){
			console.log('读取文件失败，请重试！')
		}
		reader.onload = function() {
			var src = reader.result;
			socket.emit('sendPic',{
				img: src
			})
			$("#file").val("")
		}
	}

	
})

$("#one2one-file").change(function(){
	var file = this.files[0];
	if(file.size/1024 > 40){ //大于40kb
		photoCompress(
			file,
			{
				quality: 0.6,
				width: 260
			},
			function(base64){
				console.log(base64.length / 1024) 
				socket.emit('sendPic',{
					img: base64
				})
				$("#one2one-file").val("")
			}
		)
	}else{
		var reader = new FileReader();
		reader.readAsDataURL(file)
		reader.onerror = function(){
			console.log('读取文件失败，请重试！')
		}
		reader.onload = function() {
			var src = reader.result;
			socket.emit('sendPic',{
				img: src
			})
			$("#one2one-file").val("")
		}
	}

	
})

//自己登录成功
socket.on('user_login_success',function(data){
	$(".login-box").hide()
	$(".room-box").css("display","flex")
	name = $(".name").val();
	displayUser(data)
})
//自己登录失败
socket.on('login_fail',function(msg){
	alert("用户已存在")
})
//登录成功提醒
socket.on('login_success',function(data){
	var html = `<div class="sys-msg">
					<span>系统消息：${data.user.username}已加入群聊</span>
				</div>`
	roomDia.push(html);

	$(".chat-bar").html(roomDia.join(''))
	$(".view").scrollTop($(".chat-bar").height())
	displayUser(data)
})

//退出成功提醒
socket.on('logout_success',function(data){
	var html = `<div class="sys-msg">
					<span>缪文文提醒：${data.user.username}已退出群聊</span>
				</div>`
	roomDia.push(html);

	$(".chat-bar").html(roomDia.join(''))
	$(".view").scrollTop($(".chat-bar").height())
	displayUser (data)
	//用户为当前用户返回登录页
	if(data.user.username == name){
		$(".login-box").show()
		$(".room-box").hide()
	}
})
//？
socket.on("logout",function(){
	//貌似不会走这步
	$(".login-box").show()
	$(".room-box").hide()
})
//？
socket.on("user_logout",function(){
	$(".login-box").show()
	$(".room-box").hide()
})



function displayUser (data) {
	var {users} = data;
	var len = users.length;
	$(".userNum").html(len);
	var html = "";
	for (var i = 0; i < len; i++) {
		if(users[i].username == name){
			html += `<li data-id="${users[i].id}">
						<img src="/static/user.jpg">
						<span>${users[i].username}</span>
						<span class="dot"></span>
					</li>`
			continue
		}
		html += `<li>
					<img src="/static/user.jpg">
					<span>${users[i].username}</span>
				</li>`
	}
	$(".user-list").html(html)
}



//发送消息
$(".sendBtn").click(function(){
	var val = $(".send").val();
	if(!val){
		return
	}
	var color = $("#color").val();		
	socket.emit('send', {val: val, color: color});
	$(".send").val(''); 

})

//接收自己发送的消息
socket.on("send_success",function(data){
	var newVal = data.val.replace(/\[(\d+)\]/g,function(match,p1){
		return '<img src="/static/emoji/emoji ('+p1+').png">'
	})
	
	var html = `<div class="chat-li right-li">
					<img src="/static/user.jpg">
					<div class="message-box">
						<div class="msg" style="color:${data.color}">
							${newVal}
						</div>
					</div>
				</div>`
	roomDia.push(html);

	$(".chat-bar").html(roomDia.join(''))
	$(".view").scrollTop($(".chat-bar").height())
})
//接收其他人发送的消息
socket.on("boradcast",function(data){
	var newVal = data.val.replace(/\[(\d+)\]/g,function(match,p1){
		return '<img src="/static/emoji/emoji ('+p1+').png">'
	})
	
	var html = `<div class="chat-li left-li">
					<img src="/static/user.jpg">
					<div class="message-box">
						<p>${data.username}</p>
						<div class="msg" style="color:${data.color}">
							${newVal}
						</div>
					</div>
				</div>`;
	roomDia.push(html);

	$(".chat-bar").html(roomDia.join(''))
	$(".view").scrollTop($(".chat-bar").height())
})
//接收自己发送的图片		
socket.on("sendPic_success",function(img){
	var html = `<div class="chat-li right-li">
				<img src="/static/user.jpg">
				<div class="message-box">
					<div class="img-box">
						<img src="${img}">
					</div>
				</div>
			</div>`
	roomDia.push(html);

	$(".chat-bar").html(roomDia.join(''))
	//图片加载完再滚动条到底部
	var image = new Image();
	image.src = img;
	image.onload = function(){
		$(".view").scrollTop($(".chat-bar").height())
	}
	
})
//接收其他人发送的图片
socket.on("boradcastPic",function(data){
	var html = `<div class="chat-li left-li">
					<img src="/static/user.jpg">
					<div class="message-box">
						<p>${data.username}</p>
						<div class="message-box">
							<div class="img-box">
								<img src="${data.img}">
							</div>
						</div>
					</div>
				</div>`;
	roomDia.push(html);

	$(".chat-bar").html(roomDia.join(''));
	var image = new Image();
	image.src = data.img;
	image.onload = function(){
		$(".view").scrollTop($(".chat-bar").height())
	}
})