// ----------------------------------------------------------------------------------------
// CONDITION FUNCTIONS IMPLEMENTATION
var DISCOUNT = 0.2;
var g_condition = {"old_price":1,"price":2,"promote_info":"","remain_time":{},"doc":""};
function PriceDiscount(condition) {
  var old_price = condition.old_price;
  var price = condition.price;

  if (price <= old_price * DISCOUNT) {
    return [true, price];
  }
  return [false, ""];
}

// 满99减20限兴业信用卡
function ManJianPromote(condition) {
	var old_price = condition.old_price;
	var price = condition.price;
	var promote_infos = condition.promote_infos;
	
    var regex_promote = /满([,0-9]+).*减([,0-9]+).*/g;
	for (var i = 0; i < promote_infos.length; i++) {
        var promote_info = promote_infos[i];
		var promote_info_match = regex_promote.exec(promote_info);
		if (promote_info_match === null) {
			return [false, ""];
		}
		var required_price = Number(promote_info_match[1].replace(",",""));
		var delta = Number(promote_info_match[2].replace(",",""));
		if (old_price >= required_price * 0.5) {
			var real_price = price - delta;
			if (real_price <= price * DISCOUNT) {
				return [true, real_price];
			}
		}
	}
    return [false, ""];
}

// 3件售价6折
function XJianXDiscount(condition) {
	var old_price = condition.old_price;
	var price = condition.price;
	var promote_infos = condition.promote_infos;
	
    var regex_promote = /.*([0-9]+)件售价([0-9]+)折.*/g;
	for (var i = 0; i < promote_infos.length; i++) {
        var promote_info = promote_infos[i];
		var promote_info_match = regex_promote.exec(promote_info);
		if (promote_info_match === null) {
			return [false, ""];
		}
		var x_jian = Number(promote_info_match[1]);
		var x_discount = Number(promote_info_match[2]);
		var real_price = price - (old_price * (10-x_discount) / 10);
		if (real_price <= price*DISCOUNT) {
			return [true, real_price];
		}
	}
    return [false, ""];
}

// 2件售价减90元
function XJianJianXYuan(condition) {
	var old_price = condition.old_price;
	var price = condition.price;
	var promote_infos = condition.promote_infos;
	
    var regex_promote = /.*([0-9]+)件售价减([,0-9]+)元.*/g;
	for (var i = 0; i < promote_infos.length; i++) {
        var promote_info = promote_infos[i];
		var promote_info_match = regex_promote.exec(promote_info);
		if (promote_info_match === null) {
			return [false, ""];
		}
		var x_jian = Number(promote_info_match[1]);
		var x_yuan = Number(promote_info_match[2].replace(",",""));
		var real_price = price - x_yuan/x_jian;
		if (real_price <= price*DISCOUNT) {
			return [true, real_price];
		}
	}
    return [false, ""];
}

// 购买 5 件售价立减 ￥200.00

// x% 已订购
function XPercentAlreadyOrdered(condition) {
	var old_price = condition.old_price;
	var price = condition.price;
	var remain_time = condition.remain_time;
	var hour_remain = remain_time.hour_time;
	var min_remain = remain_time.min_remain;
	var doc = condition.doc;
	
    var x_percent_xpath = "//div[@id='goldboxBuyBox']//span[contains(@id,'dealStatusPercentage')]";
    var x_percents = Xpath2Str(x_percent_xpath, doc);
    var x_percent = parseFloat(x_percents[0]);
  
    if (x_percent >= 80 && x_percent !== 100 && price <= DISCOUNT*4*old_price && (hour_remain > 0 || min_remain > 5)) {
      return [true, x_percent];
    }
    return [false, ""];
}
