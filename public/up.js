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
}
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
}