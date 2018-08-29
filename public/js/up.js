/* 阻止整个页面的回弹 */
(function(){
	var wrap = document.querySelector('#wrap');
	wrap.addEventListener('touchmove', function(e) {
		e.preventDefault();
	});
})();

/* 文件上传 */
(function(){
	var upFile = document.querySelector('#upFile');
	var imgFile = null;
	upFile.onclick = function(){
		upFile.style.value = "";
	}
	var maxSize = 10*1024*1024;//10M
	upFile.onchange = function(){
		/*console.log(this.files[0]);*/
		imgFile = this.files[0];
		if(imgFile.size >maxSize){
			alert("文件尺寸太大");
			return;
		}
		loadImg(imgFile);		
	};
})();	
/* 渲染图片 */
function loadImg(imgFile){
	var page = document.querySelectorAll('.page')[0];
	var chatPage = document.querySelector('.chat-page')
	var con = document.querySelector('.con');
	var c = document.querySelector('#c');
	var newImage = new Image();
	var reader = new FileReader();
	var cxt = c.getContext("2d");
	var select = document.querySelector('#select');
	var conW = css(con,"width");
	var conH = css(con,"height");
	var imgL = 0;
	var imgT = 0;
	var imgW = 0;
	var imgH = 0;
	var isDrag = 0;

	var wrap = document.querySelector('#wrap');
	wrap.style.display = "block";
	chatPage.style.display = "none";
	page.className = "page";

	c.width = c.parentNode.clientWidth;
	c.height = c.parentNode.clientHeight;
	newImage.onload = function(){
		var isResize = false;
		imgW = this.width;
		imgH = this.height;
		if(imgW > c.width || imgH > c.height){ //图片在canvas中已经放不下了
			if(imgW > imgH){
				var scale = c.width / imgW;
				css(select,"width",scale*imgH);
				css(select,"height",scale*imgH);
			} else {
				var scale = c.height / imgH;
				css(select,"width",scale*imgW);
				css(select,"height",scale*imgW);
			}
			imgW *= scale;
			imgH *= scale;
		}
		imgL = (c.width - imgW)/2;
		imgT = (c.height - imgH)/2;
		css(select,"translateX",(con.clientWidth - select.offsetWidth)/2);
		css(select,"translateY",(con.clientHeight - select.offsetHeight)/2);
		cxt.drawImage(newImage, imgL, imgT, imgW,imgH);


		/* 单指操作canvas中的图片移动 */
		var startL = 0;
		var startY = 0;
		var startW = 0;
		var startH = 0;
		drag({
			el: c,
			start: function(){
				startL = imgL;
				startT = imgT;
				isDrag = true;
			},
			move: function(e){
				if(isDrag){


				var selectX = css(select,"translateX");
				var selectY = css(select,"translateY");

				imgL = e.pointDis.x + startL;
				imgT = e.pointDis.y + startT;

				if(imgL > selectX){
					imgL = selectX;
				} else if(imgL + imgW < selectX + select.offsetWidth){
					imgL = selectX + select.offsetWidth -imgW;
				}
				if(imgT > selectY){
					imgT = selectY;
				} else if(imgT + imgH < selectY + select.offsetHeight){
					imgT = selectY + select.offsetHeight - imgH;
				}
				cxt.clearRect(0, 0, c.width, c.height);
				cxt.drawImage(newImage, imgL, imgT, imgW,imgH);
				}
			}
		});

		/* 多指操作图片放大缩小 */

		gesture({
			el: c,
			start: function(){
				startW = imgW;
				startH = imgH;
				startL = imgL;
				startY = imgT;
				isDrag = false;
			},
			change: function(e){

				//e.scale start时 和 change时的缩放比例
				var w = startW * e.scale;
				var h = startH * e.scale;
				if(w < 80 || h < 80){
					return;
				}  
				var selectW = css(select,"width");
				var selectH = css(select,"height");
				var selectY = css(select,"translateY");
				var selectX = css(select,"translateX");
				imgW = w;
				imgH = h;
				imgL = startL + (startW - imgW)/2;
				imgT = startY + (startH - imgH)/2;
				if(imgL > selectX){
					selectX = imgL;
				}
				if(imgT > selectY){
					selectY = imgT;
				}
				if(selectW > imgW){
					selectW = imgW;
				}
				if(selectH > imgH) {
					selectH = imgH;
				}
				cxt.clearRect(0, 0, c.width, c.height);
				cxt.drawImage(newImage, imgL, imgT, imgW,imgH);
				css(select,"translateX",selectX);
				css(select,"translateY",selectY);
				css(select,"width",selectW);
				css(select,"height",selectH);
			}
		});


		/* 单指操作选框移动 */
		var startSelectX = 0;
		var startSelectY = 0;
		var startSelectW = 0;
		var startSelectH = 0;

		drag({
			el: select,
			start: function(){
				startSelectX = css(select,"translateX");
				startSelectY = css(select,"translateY");
			},
			move: function(e){
				if(isResize){
					return;
				}
				var x = startSelectX + e.pointDis.x;
				var y = startSelectY + e.pointDis.y;
				var w = css(select,"width");
				var h = css(select,"height");
				if(x < imgL){
					x = imgL;
				} else if(x  > imgL + imgW - w ){
					x = imgL + imgW - w ;
				}
				if(y < imgT){
					y = imgT; 
				} else if(y + h  > imgT + imgH  ){
					y = imgT + imgH - h
				}

				if(y < 0){
					y = 0;
				} else if( y > conH - h) {
					y = conH - h
				}
				if(x < 0){
					x = 0;
				} else if(x > conW - w){
					x = conW - w;
				}

				css(select,"translateX",x);
				css(select,"translateY",y);	
			}
		});

		/* 拖拽选框的四个角和四条边变大 变小 */

		var leftTop = document.querySelector('.left-top');
		var nowT = 0;
		drag({
			el:leftTop,
			start: function(){
				isResize = true;
				startSelectX = css(select,"translateX");
				startSelectY = css(select,"translateY");
				startSelectW = css(select,"width");
				startSelectH = css(select,"height");
			},
			move: function(e){
				var ava = (e.pointDis.x + e.pointDis.y)/2;
				var l = startSelectX + ava;
				var t = startSelectY + ava;
				var w = startSelectW - ava;
				var h = startSelectH - ava;
				if(w < 80){
					return
				}

				if( l < imgL || l < 0 || t < imgT || t < 0){
					if( l < imgL || l < 0 ){
						l = imgL < 0 ? 0 : imgL;
					}
					if( t < imgT || t < 0 ){
						t = imgT < 0 ? 0 : imgT;
					}
					
				
					w = startSelectW - (l - startSelectX);
					h = startSelectH - (t - startSelectY);
					var end = w > h ? h : w

					
					css(select,"translateX",l);
					css(select,"translateY",t);
					css(select,"width",end);
					css(select,"height",end);

					return

				}
				css(select,"translateX",l);
				css(select,"translateY",t);
				css(select,"width",w);
				css(select,"height",h);
			},
			end: function(){
				isResize = false;
			}
		});


		var leftBottom = document.querySelector('.left-bottom');
		drag({
			el:leftBottom,
			start: function(){
				isResize = true;
				startSelectX = css(select,"translateX");
				startSelectY = css(select,"translateY");
				startSelectW = css(select,"width");
				startSelectH = css(select,"height");
			},
			move: function(e){
				var ava = ( e.pointDis.y - e.pointDis.x)/2;
				var l = startSelectX - ava;
				var w = startSelectW + ava;
				var h = startSelectH + ava;
				if(w < 80){
					return
				}

				if( h > imgH - (startSelectY - imgT)|| h > conH - startSelectY || l < imgL || l < 0 ){
					h = imgH - (startSelectY - imgT) < conH - startSelectY ? imgH - (startSelectY - imgT) : conH - startSelectY;
					if(l < imgL || l < 0){
						l = imgL > 0 ? imgL : 0
					}
								
					w = startSelectW - (l - startSelectX);
					var end = w > h ? h : w

					
					css(select,"translateX",l);
					css(select,"width",end);
					css(select,"height",end);

					return

				}
				css(select,"translateX",l);
				css(select,"width",w);
				css(select,"height",h);
			},
			end: function(){
				isResize = false;
			}
		});




		var rightTop = document.querySelector('.right-top');
		drag({
			el:rightTop,
			start: function(){
				isResize  = true;
				startSelectW = css(select,"width");
				startSelectH = css(select,"height");
				startSelectX = css(select,"translateX");
				startSelectY = css(select,"translateY");
			},
			move: function(e){
				var total = (e.pointDis.x - e.pointDis.y)/2;
				var w = startSelectW + total;				
				var t = startSelectY - total;
				var h = startSelectH + total;

				var x = css(select,"translateX");
				var y = css(select,"translateY");

				if(w < 80){
					return
				}
				if(w > imgW - (x  - imgL)||w > conW - x||t < imgT||t < 0){
					w = imgW - (x - imgL) >  conW - x ? conW - x : imgW - (x  - imgL);
					h = imgT < 0 ? startSelectH + startSelectY : startSelectH + startSelectY - imgT;
					t = imgT < 0 ? 0 : imgT;

					var end = w > h ? h : w;
					t = startSelectH + startSelectY - end;
					css(select,"width",end);
					css(select,"height",end);
					css(select,"translateY",t);
					return
				}

				css(select,"width",w);
				css(select,"height",w);
				css(select,"translateY",t);
				
			},
			end: function(){
				isResize = false;
			}
		});



		var rightBottom = document.querySelector('.right-bottom');
		drag({
			el:rightBottom,
			start: function(){
				isResize = true;
				startSelectW = css(select,"width");
				startSelectH = css(select,"height");
			},
			move: function(e){
				var total = startSelectW + e.pointDis.x + startSelectH + e.pointDis.y;
				var w = total / 2;
				var h = total / 2;
				var x = css(select,"translateX");
				var y = css(select,"translateY");
				var end = total / 2;

				if(end < 80){
					return
				} 
				if(w > imgW - (x  - imgL)||w > conW - x||h > imgH - (y - imgT)||h > conH - y){
					w = imgW - (x - imgL) >  conW - x ? conW - x : imgW - (x  - imgL);
					h = imgH - (y - imgT) > conH - y ? conH - y : imgH - (y - imgT);

					end = w > h ? h : w;
				}	

				css(select,"width",end);
				css(select,"height",end);
				
			},
			end: function(){
				isResize = false;
			}
		});


	};
	reader.onload = function(e){
		//console.log(e.target.result);
		newImage.src = e.target.result;
	};
	reader.readAsDataURL(imgFile);
};
/* 点击保存	*/
(function(){
	var saveBtn = document.querySelector('#saveBtn');
	var c = document.querySelector('#c');
	var cxt = c.getContext("2d");
	var select = document.querySelector('#select');
	var c2 = document.querySelector('#c2');
	var cxt2 = c2.getContext("2d");
	var page3 = document.querySelectorAll('.page')[1];
	var img = document.querySelector('#img2');
	tap(saveBtn,function(){
		var x = css(select,"translateX");
		var y = css(select,"translateY");
		var w = css(select,"width");
		var h = css(select,"height");
		var imgData = cxt.getImageData(x,y,w,h);
		c2.width = w;
		c2.height = h;
		cxt2.putImageData(imgData,0,0);
		img.style.width = w + "px";
		img.style.height = h + "px";
		img.src = c2.toDataURL("image/png");
		avatarData = c2.toDataURL("image/png");
		c2.style.display = "none";
		page3.className = "page";
	});

	$("#choose").click(function(){
		$("#wrap").hide();
		$(".chat-page").show();
		$(".avatar img").attr('src',avatarData);
		$(".page").eq(0).addClass("pageHide")
		$(".page").eq(1).addClass("pageHide")
		$("#upFile").val("");
	})
	$("#back2").click(function(){
		$(".page").eq(1).addClass("pageHide")
	})
	$("#back").click(function(){
		$(".page").eq(0).addClass("pageHide")
		setTimeout(function(){
			$(".chat-page").show()
			$("#wrap").hide()
		},500)
		
	})
	
})();
/* 单指拖拽 */
/*
init:{
	el: 元素,
	start: 按下,
	move: 拖动,
	end: 抬起
}
*/
function drag(init){
	var isDrag = false;
	var el = init.el;
	var startPoint = {};
	el.addEventListener('touchstart', function(e) {
		var touch = e.touches;
		if(touch.length < 2){
			isDrag = true;
			startPoint = {
				x: touch[0].pageX,
				y: touch[0].pageY
			};
			init.start&&init.start.call(el,e);
		}
	});
	el.addEventListener('touchmove', function(e) {
		var touch = e.touches;
		if(touch.length < 2&&isDrag){
			var nowPoint = {
				x: touch[0].pageX,
				y: touch[0].pageY
			};
			e.pointDis = {
				x: nowPoint.x - startPoint.x,
				y: nowPoint.y - startPoint.y
			};//手指 move时 和 start时的一个差值
			init.move&&init.move.call(el,e);
		}
	});
	el.addEventListener('touchend', function(e) {
		if(isDrag){
			init.end&&init.end.call(el,e);
		}
	});
};


var roomDia = [];

var socket = io.connect();
var userId = '';
var name = "";
var dialogObj = {};
var avatarData = '/static/user.jpg';

//登录
$(".loginBtn").click(function(){
	name = $(".name").val();
	if(!name){
		alert('请输入登录用名')
		return
	}
	userId = socket.id;

	socket.emit('login', {username: name,id: socket.id, avatarData});				
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
				emitPic(base64)
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
			emitPic(src)
		}
	}

	function emitPic(src) {
		socket.emit('sendPic',{
			img: src,
			avatarData
		})
		$("#file").val("")
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
		name = null
	}
})
//？
socket.on("logout",function(){
	//貌似不会走这步
	$(".login-box").show()
	$(".room-box").hide()
	$(".one2one-box").hide()
	$(".menu").hide()
	name = null
})
//？
socket.on("user_logout",function(){
	$(".login-box").show()
	$(".room-box").hide()
	$(".one2one-box").hide()
	$(".menu").hide()
	name = null
})



function displayUser (data) {
	var {users} = data;
	var len = users.length;
	$(".userNum").html(len);
	var html = "";
	for (var i = 0; i < len; i++) {
		if(users[i].username == name){
			html += `<li data-id="${users[i].id}">
						<img src="${users[i].avatarData}">
						<span class="name">${users[i].username}</span>
						<span class="dot"></span>
					</li>`
			continue
		}

		if(dialogObj[users[i].id]&&dialogObj[users[i].id].unread > 0){

			html += `<li data-id="${users[i].id}">
				<img src="${users[i].avatarData}">
				<span class="name">${users[i].username}</span>
				<span class="num ico">
					<i class="iconfont">&#xe631;</i>
					<span>${dialogObj[users[i].id].unread}</span>
				</span>
			</li>`
		}else{
			html += `<li data-id="${users[i].id}">
					<img src="${users[i].avatarData}">
					<span class="name">${users[i].username}</span>
				</li>`
		}
		
	}
	$(".user-list").html(html)
}

function createTextLi(data,pos) {
	if(data.img){
		console.log(data)
		if(pos === 'right'){
			
			return `<div class="chat-li right-li">
						<img src="${data.avatarData}">
						<div class="message-box">
							<div class="img-box">
								<img src="${data.img}">
							</div>
						</div>
					</div>`
		}else if(pos === 'left'){
			return `<div class="chat-li left-li">
						<img src="${data.avatarData}">
						<div class="message-box">
							<p>${data.username}</p>
							<div class="message-box">
								<div class="img-box">
									<img src="${data.img}">
								</div>
							</div>
						</div>
					</div>`
		}
	}else{
		var newVal = data.val.replace(/\[(\d+)\]/g,function(match,p1){
			return '<img src="/static/emoji/emoji ('+p1+').png">'
		})
		if(pos === 'right'){
			
			
			return `<div class="chat-li right-li">
						<img src="${data.avatarData}">
						<div class="message-box">
							<div class="msg" style="color:${data.color}">
								${newVal}
							</div>
						</div>
					</div>`
		}else if(pos === 'left'){
			return `<div class="chat-li left-li">
						<img src="${data.avatarData}">
						<div class="message-box">
							<p>${data.username}</p>
							<div class="msg" style="color:${data.color}">
								${newVal}
							</div>
						</div>
					</div>`
		}
	}
}
//提示消息
function msgNum(){
	var len = 0;
	for(key in dialogObj){
		if(dialogObj[key].unread){
			len += dialogObj[key].unread
		}
	}

	if(len > 0){
		$(".msg-num").show();
		$(".msg-num span").text(len)
	}else{
		$(".msg-num").hide();
	}
};


//发送消息
$(".sendBtn").click(function(){
	var val = $(".send").val();
	if(!val){
		return
	}
	var color = $("#color").val();		
	socket.emit('send', {val: val, color: color, avatarData: avatarData});
	$(".send").val(''); 

});


//接收自己发送的消息
socket.on("send_success",function(data){
	
	roomDia.push(createTextLi(data,'right'));

	$(".chat-bar").html(roomDia.join(''))
	$(".view").scrollTop($(".chat-bar").height())
});
//接收其他人发送的消息
socket.on("boradcast",function(data){

	roomDia.push(createTextLi(data,'left'));

	$(".chat-bar").html(roomDia.join(''))
	$(".view").scrollTop($(".chat-bar").height())
});

//接收自己发送的图片		
socket.on("sendPic_success",function(data){
	var html = createTextLi(data,'right');

	roomDia.push(html);

	$(".chat-bar").html(roomDia.join(''))
	//图片加载完再滚动条到底部
	var image = new Image();
	image.src = data.img;
	image.onload = function(){
		$(".view").scrollTop($(".chat-bar").height())
	}
	
});
//接收其他人发送的图片
socket.on("boradcastPic",function(data){
	var html = createTextLi(data,'left');
	roomDia.push(html);
	
	$(".chat-bar").html(roomDia.join(''));
	var image = new Image();
	image.src = data.img;
	image.onload = function(){
		$(".view").scrollTop($(".chat-bar").height())
	}
});


//图片太多没返回会断,图片太多，做了js压缩	

$(".user-list").on("click","li",function(){
	var username = $(this).find('.name').text();
	var id = $(this).attr("data-id");

	if(username != name){
		$(".one2one-box").css({"display":"flex"}).attr("data-id",id).addClass('scale');
		setTimeout(function(){
			$(".one2one-box").removeClass("scale")
		},500)
		$(".one2one-top-title .text").text("与"+username+"聊天")

		if(dialogObj[id]){
			$(".one2one-chat-bar").html(dialogObj[id].dialog.join(""))
		}else{
			$(".one2one-chat-bar").html("")
		}
		
	}
});
//关闭个人聊天窗口
$(".one2one-top-title i").click(function(){
	$(".one2one-box").removeClass("scale").addClass("scaleBack");

	setTimeout(function(){
		$(".one2one-box").css("display","none").removeClass("scaleBack")
	},500)

	var id = $(".one2one-box").attr("data-id");
	if(dialogObj[id]){
		dialogObj[id].unread = 0
		$(".user-list li[data-id="+id+"]").find(".num").remove()
	}

	msgNum();

	
});

//发送消息
$(".one2one-sendBtn").click(function(){
	var val = $(".one2one-send").val();
	if(!val){
		return
	}
  
	var color = $("#one2one-color").val();	
	var id = $(".one2one-box").attr("data-id");	
	socket.emit('one2one_send', {val, color, id, avatarData});
	$(".one2one-send").val(''); 

});
//接收自己发送的消息
socket.on("one2one_send_success",function(data){
	
	var html = createTextLi(data,'right')
	//roomDia.push(html);

	var id = data.id;
	if(dialogObj[id]){
		dialogObj[id].dialog.push(html)
	}else{
		dialogObj[id] = {};
		dialogObj[id].unread = 0;
		dialogObj[id].dialog = [];
		dialogObj[id].dialog.push(html)
	}
	$(".one2one-chat-bar").html(dialogObj[id].dialog.join(""))
	$(".one2one-view").scrollTop($(".one2one-chat-bar").height())
});
//接收one2one发送的消息
socket.on("receive_message",function(data){
	var html = createTextLi(data,'left')
	//roomDia.push(html);
	var id = data.userId;	
	if(dialogObj[id]){
		dialogObj[id].dialog.push(html)
		dialogObj[id].unread += 1;
	}else{
		dialogObj[id] = {};
		dialogObj[id].unread = 1;
		dialogObj[id].dialog = [];
		dialogObj[id].dialog.push(html)
	}
	$(".one2one-chat-bar").html(dialogObj[id].dialog.join(""))
	$(".one2one-view").scrollTop($(".one2one-chat-bar").height())
	displayUser(data);
	msgNum();
});

//发送图片
$("#one2one-file").change(function(){
	var id = $(".one2one-box").attr("data-id");	

	var file = this.files[0];
	if(file.size/1024 > 40){ //大于40kb
		photoCompress(
			file,
			{
				quality: 0.6,
				width: 260
			},
			function(base64){
				emitPic(base64)
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
			emitPic(src)
		}
	}

	function emitPic(src) {
		socket.emit('one2one_sendPic',{
			img: src,
			id: id,
			avatarData
		})
		$("#one2one-file").val("")
	}	
});


//接收自己发送的图片		
socket.on("one2one_sendPic_success",function(data){
	var html = createTextLi(data,'right');

	var id = data.id;
	if(dialogObj[id]){
		dialogObj[id].dialog.push(html)
	}else{
		dialogObj[id] = {};
		dialogObj[id].dialog = [];
		dialogObj[id].dialog.push(html)
	}
	$(".one2one-chat-bar").html(dialogObj[id].dialog.join(""))

	//图片加载完再滚动条到底部
	var image = new Image();
	image.src = data.img;
	image.onload = function(){
		$(".one2one-view").scrollTop($(".one2one-chat-bar").height())
	}
	
});
//接收其他人发送的图片
socket.on("receive_pic",function(data){
	var html = createTextLi(data,'left');

	var id = data.userId;	
	if(dialogObj[id]){
		dialogObj[id].dialog.push(html)
		dialogObj[id].unread += 1;
	}else{
		dialogObj[id] = {};
		dialogObj[id].unread = 1;
		dialogObj[id].dialog = [];
		dialogObj[id].dialog.push(html)
	}
	$(".one2one-chat-bar").html(dialogObj[id].dialog.join(""))	
	var image = new Image();
	image.src = data.img;
	image.onload = function(){
		$(".one2one-view").scrollTop($(".one2one-chat-bar").height())
	}
	displayUser(data);
	msgNum();
});


//emoji图片
var html = '';
for (var i = 1; i < 142; i++) {
	html += '<img src="/static/emoji/emoji ('+i+').png">'
	$('.emoji-box').html(html)
	$('.one2one-emoji-box').html(html)
};
$(".emoji-click").click(function(){
	$(".emoji-box").css("display","flex")
});
$(".one2one-emoji-click").click(function(){
	$(".one2one-emoji-box").css("display","flex")
});
$(".emoji-box").on("click","img",function(){
	var reg = /\((\d+)\)/
	reg.test(this.src)
	var num = RegExp.$1
	$(".send").val($(".send").val()+"["+num+"]")
	$(".emoji-box").css("display","none")
});
$(".one2one-emoji-box").on("click","img",function(){
	var reg = /\((\d+)\)/
	reg.test(this.src)
	var num = RegExp.$1
	$(".one2one-send").val($(".one2one-send").val()+"["+num+"]")
	$(".one2one-emoji-box").css("display","none") 
});

$("#color").change(function(){
 	var color = $("#color").val();
 	$(".font").css("color",color);
});
$("#one2one-color").change(function(){
 	var color = $("#one2one-color").val();
 	$(".one2one-font").css("color",color);
});


/*
    三个参数
    file：一个是文件(类型是图片格式)，
    obj：{
        width: '',默认图片原始宽
        height: '',默认图片原始高
        quality: 0.7 默认,canvas转的图片质量
    }
    callback：回调函数(第一个参数是base64)
*/

function photoCompress(file,obj,callback){
    var ready=new FileReader();
    ready.readAsDataURL(file);
    ready.onload=function(){
        var re=this.result;
        canvasDataURL(re,obj,callback)
    }
};

function canvasDataURL(path, obj, callback){
    var img = new Image();
    img.src = path;
    img.onload = function(){
        var that = this;
        // 默认按比例压缩
        var w = that.width,
            h = that.height,
            scale = w / h;
        w = obj.width || w;
        h = (obj.width / scale) || (w / scale);
        var quality = 0.7;  // 默认图片质量为0.7
        //生成canvas
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        // 创建属性节点
        var anw = document.createAttribute("width");
        anw.nodeValue = w;
        var anh = document.createAttribute("height");
        anh.nodeValue = h;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        ctx.drawImage(that, 0, 0, w, h);
        // 图像质量 
        if(obj.quality && obj.quality <= 1 && obj.quality > 0){
            quality = obj.quality;
        }
        // quality值越小，所绘制出的图像越模糊
        var base64 = canvas.toDataURL('image/jpeg', quality);
        //var bolb = convertBase64UrlToBlob(base64)
        // 回调函数返回base64的值
        //console.log(bolb)
        callback(base64);
    }
};
function convertBase64UrlToBlob(urlData){
    var arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
};

var w = $(".menu").width();
var flag = false;
var menuIsOpen = false;
var goBack = false;


$(".top-title").click(function(){
	if(menuIsOpen){
		menuClose()
	}else{
		menuOpen()
	}	
});
$(".view").click(function(){
	if(menuIsOpen){
		menuClose()
	}
});
function menuOpen(){
	$(".menu").animate({"left": 0})
	$(".room-box").animate({"left": w + "px"},function(){
		menuIsOpen = true
		$("#img").attr("src","/static/right.png")
	})		
	
};
function menuClose(){
	$(".menu").animate({"left": -w + "px"})
	$(".room-box").animate({"left": 0},function(){
		$("#img").attr("src","/static/left.png")
		menuIsOpen = false
	})		
};


var startX = 0;
var startY = 0;
var dir = {
	x: false,
	y: false
};
var isFirst = true;

$("body").on("touchstart",function(e){
	startX = e.targetTouches[0].clientX;
	startY = e.targetTouches[0].clientY;
	if((startX < 5 && $(".login-box").css("display") == "none") || menuIsOpen){
		flag = true;
	}	
	
	if(e.target.className == "menu" && menuIsOpen){
		goBack = true;
	}	
});

$("body").on("touchmove",function(e){
	if(!flag){
		return
	}			
	var nowX = e.targetTouches[0].clientX;
	var nowY = e.targetTouches[0].clientY;
	var dis = nowX - startX;

	if(isFirst){
		if(Math.abs(nowX-startX) > Math.abs(nowY-startY)){
			dir.x = true;
			isFirst = false;			
		}else{
			dir.y = true;
			isFirst = false;
		}
	}
	if(dir.x){
		if(goBack){
			$(".menu").css({"left": (0 + dis > 0 ? 0 : dis) + "px"})
			$(".room-box").css({"left": (w + dis > w ? w : w + dis) + "px"})
		}else{
			$(".menu").css({"left": (nowX - w < 0 ? nowX - w : 0) + "px"})
			$(".room-box").css({"left": (nowX < w ? nowX : w) + "px"})
		}
	}
	
});
$("body").on("touchend",function(e){
	isFirst = true;

	if(flag&&dir.x){
		var endX = e.changedTouches[0].clientX;
		var scale = (w - endX) / w;

		flag = false;
		goBack = false;
		dir.x = false;

		if(scale < 0.2){
			menuOpen&&menuOpen.call(this)
		}else{
			menuClose&&menuClose.call(this)
		}
	}
	
});