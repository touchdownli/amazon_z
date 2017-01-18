// ----------------------------------------------------------------------------------------
// CONDITION FUNCTIONS IMPLEMENTATION
var DISCOUNT = 0.2;
function PriceDiscount(old_price, price, promote_info, doc) {
  if (price <= old_price * DISCOUNT) {
    return [true, price];
  }
  return [false, ""];
}

// 满99减20限兴业信用卡
function ManJianPromote(old_price, price, promote_info, doc) {
    var regex_promote = /满([0-9]+).*减([0-9]+).*/g;
    var promote_info_match = regex_promote.exec(promote_info);
    if (promote_info_match === null) {
        return [false, ""];
    }
    var required_price = Number(promote_info_match[1]);
    var delta = Number(promote_info_match[2]);
    if (old_price >= required_price * 0.5) {
        var real_price = price - delta;
        if (real_price <= price * DISCOUNT) {
            return [true, real_price];
        }
    }
    return [false, ""];
}

// 3件售价6折
function XJianXDiscount(old_price, price, promote_info, doc) {
    var regex_promote = /.*([0-9]+)件售价([0-9]+)折.*/g;
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
    return [false, ""];
}

// 2件售价减90元
function XJianJianXYuan(old_price, price, promote_info, doc) {
    var regex_promote = /.*([0-9]+)件售价减([0-9]+)元.*/g;
    var promote_info_match = regex_promote.exec(promote_info);
    if (promote_info_match === null) {
        return [false, ""];
    }
    var x_jian = Number(promote_info_match[1]);
    var x_yuan = Number(promote_info_match[2]);
    var real_price = price - x_yuan/x_jian;
    if (real_price <= price*DISCOUNT) {
        return [true, real_price];
    }
    return [false, ""];
}

// 购买 5 件售价立减 ￥200.00

// x% 已订购
function XPercentAlreadyOrdered(old_price, price, promote_info, doc) {
    var x_percent_xpath = "//div[@id='goldboxBuyBox']//span[contains(@id,'dealStatusPercentage')]";
    var x_percents = Xpath2Str(x_percent_xpath, doc);
    var x_percent = parseFloat(x_percents[0]);

  	 var timer_remain_xpath = "//div[@id='goldboxBuyBox']//span[contains(@id, 'deal_expiry_timer')]";
    var timer_remains = Xpath2Str(timer_remain_xpath, doc);
  	 var timer_remain = timer_remains[0];
    var regex_timer_remain = /.*([0-9]+)小时.*/g;
    var hour_remain = regex_timer_remain.exec(timer_remain);
    if (hour_remain === null) {
      return [false, ""];
    }
    hour_remain = Number(hour_remain);
  
    if (x_percent >= 80 && x_percent !== 100 && price <= DISCOUNT*4*old_price && hour_remain > 0) {
      return [true, x_percent];
    }
    return [false, ""];
}
