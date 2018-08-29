//emoji图片
var html = '';
for (var i = 1; i < 142; i++) {
	html += '<img src="/static/emoji/emoji ('+i+').png">'
	$('.emoji-box').html(html)
	$('.one2one-emoji-box').html(html)
}
$(".emoji-click").click(function(){
	$(".emoji-box").css("display","flex")
})
$(".one2one-emoji-click").click(function(){
	$(".one2one-emoji-box").css("display","flex")
})
$(".emoji-box").on("click","img",function(){
	var reg = /\((\d+)\)/
	reg.test(this.src)
	var num = RegExp.$1
	$(".send").val($(".send").val()+"["+num+"]")
	$(".emoji-box").css("display","none")
})
$(".one2one-emoji-box").on("click","img",function(){
	var reg = /\((\d+)\)/
	reg.test(this.src)
	var num = RegExp.$1
	$(".one2one-send").val($(".one2one-send").val()+"["+num+"]")
	$(".one2one-emoji-box").css("display","none") 
})

$("#color").change(function(){
 	var color = $("#color").val();
 	$(".font").css("color",color);
})
$("#one2one-color").change(function(){
 	var color = $("#one2one-color").val();
 	$(".one2one-font").css("color",color);
})


