String.prototype.format = function () {
    // 数据长度为空，则直接返回
    if (arguments.length == 0){
        return this;
    }
 
    // 使用正则表达式，循环替换占位符数据
    for (var result = this, i = 0; i < arguments.length; i++){
        result = result.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        return result;
    }
};


function range(start, end, step=1) {
	let arr = [];
	for(let i=start; i < end; i++){
		if(i%step==0){arr.push(i)}
	}
	return arr;
}

export default range

