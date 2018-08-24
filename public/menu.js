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
})
$(".view").click(function(){
	if(menuIsOpen){
		menuClose()
	}
})
function menuOpen(){
	$(".menu").animate({"left": 0})
	$(".room-box").animate({"left": w + "px"},function(){
		menuIsOpen = true
		$("#img").attr("src","/static/right.png")
	})		
	
}
function menuClose(){
	$(".menu").animate({"left": -w + "px"})
	$(".room-box").animate({"left": 0},function(){
		$("#img").attr("src","/static/left.png")
		menuIsOpen = false
	})		
}


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
})	

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
	
})
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
	
})