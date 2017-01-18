// ==UserScript==
// @name amazon
// @namespace http://diveintogreasemonkey.org/download/
// @include https://www.amazon.cn/gp/goldbox/*
// @require https://code.jquery.com/jquery-1.12.4.js
// @require file:///E:/workshop/browser_scripts_git/gapi_gmail.js
// @require file:///E:/workshop/browser_scripts_git/amazon_gm_discount_funcs.js
// @grant    GM_notification
// @grant    GM_getValue
// @grant    GM_setValue
// @grant    GM_openInTab
// @grant    unsafeWindow
// @grant    GM_xmlhttpRequest
// @run-at   document-end
// ==/UserScript==

/*
if (window.Notification && Notification.permission !== "granted") {
    Notification.requestPermission(function (status) {
        if (Notification.permission !== status) {
            Notification.permission = status;
        }
    });
}
*/
var notificationDetails = {
    text:       'Test notification body.',
    title:      '发现惊喜！',
    timeout: 9999,
    onclick:    function () {
        console.log ("Notice clicked.");
        window.focus ();
    }
};
function Notify(func_name, item_title, norm_url) {
    console.log("Notify start");
    var msg = func_name + "\n" + item_title;
    notificationDetails.text = msg;
    GM_notification(notificationDetails, null);
    
    var message = 'From: Amazon_SecKill<edisonbiti@gmail.com>\n' +
        'To: LXY<759090479@qq.com>\n' +
        'Subject: '+item_title+'\n'+
        'Mime-Version: 1.0\n'+
        "Content-Type: text/plain; charset=\"UTF-8\"\n\n"+
        
        
        "norm_url:" + norm_url + " " + func_name;

    SendEmail(message);
}

// Test Notify
//Notify("test_notify_func_name", "中文", "norm_url");

var Z_CLICK_DELAY = 2000; // ms
var CHECK_NEXT_PAGE_DOWNLOAD_DELAY = 2000;
var CHECK_NEXT_PAGE_DOWNLOAD_TIMES_THRESHOLD = 50;
var CHECK_VISIT_ITEMS_DONE_DELAY = 2000;
var CHECK_VISIT_ITEMS_DONE_TIMES_THRESHOLD = 8;
var AJAX_URL_TIMEOUT = 10000;
$(window).load(Start);
//$(document).ready(function(){document.head.appendChild(script);});

function Start() {
    console.log("Start");
    setTimeout(ClickZDoingCheckbox, Z_CLICK_DELAY); 
}

function ClickZDoingCheckbox() {
    var click_obj = Xpath2Jquery("//div[@id='widgetFilters']//span[@data-gbfilter-checkbox='{\"attribute\":\"deal_state\",\"value\":\"ACTIVE\",\"rangeEnd\":\"\",\"rangeStart\":\"\",\"filterType\":\"checkboxes\"}']//label");
    console.log($(click_obj)[0]);
    try {
        $(click_obj)[0].click();
        setTimeout(ClickZLink, Z_CLICK_DELAY); 
    }
    catch (e) {
      	 console.log("catch except:" + e + "\nlocation to goldbox");
        // window.location = "https://www.amazon.cn/gp/goldbox/";
        // location.reload(true);
        location.replace(location.href);
    }
    
}

function ClickZLink() {
    var click_obj = Xpath2Jquery("//div[@id='widgetFilters']//div[@data-value='LIGHTNING_DEAL']//a[@href='#']");
    console.log($(click_obj)[0]);
    try {
        $(click_obj)[0].click();
        setTimeout(StartAfterZClick, Z_CLICK_DELAY); 
    }
    catch (e) {
      	 console.log("catch except:" + e + "\nlocation to goldbox");
        // window.location = "https://www.amazon.cn/gp/goldbox/";
        location.replace(location.href);
    }
}

function ClickSortOrder() {
    // var click_obj = Xpath2Jquery("//div[@id='a-popover-2']//a[@data-value='{\"stringVal\":\"BY_DISCOUNT_DESCENDING\"}']");
    var click_obj = Xpath2Jquery("//div[@id='FilterItemView_sortOrder_dropdown']//option[@value='BY_DISCOUNT_DESCENDING']");
    console.log($(click_obj)[0]);
    // $(click_obj).attr("selected", function(i, oldvalue) {});
    
    setTimeout(StartAfterZClick, START_AFTER_Z_CLICK_DELAY); 
}

var span_next_page_old;
function StartAfterZClick() {
    console.log("StartAfterZClick");
    span_next_page_old = Xpath2Jquery("//div[@id='FilterItemView_page_pagination']//span[@data-action='gbfilter-pagination']");
    setInterval(CheckNextPageDownload, CHECK_NEXT_PAGE_DOWNLOAD_DELAY);
    TraverseItems();
}

var CheckNextPageDownloadTimes = 0;
function CheckNextPageDownload() {
    var span_next_page_new = Xpath2Jquery("//div[@id='FilterItemView_page_pagination']//span[@data-action='gbfilter-pagination']");
    var new_attr = $(span_next_page_new).attr("data-gbfilter-pagination");
    var old_attr = $(span_next_page_old).attr("data-gbfilter-pagination");
    
    CheckNextPageDownloadTimes += 1;
    console.log("CheckNextPageDownload:" + CheckNextPageDownloadTimes);
    if (CheckNextPageDownloadTimes % (CHECK_NEXT_PAGE_DOWNLOAD_TIMES_THRESHOLD/2) === 0) {
        ClickNextPage();
    }
    else if (CheckNextPageDownloadTimes >= CHECK_NEXT_PAGE_DOWNLOAD_TIMES_THRESHOLD) {
        // alert("CheckNextPageDownload to threshold, refresh to first page");
        CheckNextPageDownloadTimes = 0;
        window.location.href = "https://www.amazon.cn/gp/goldbox/";
    }
    else if ( new_attr != old_attr) {
        span_next_page_old = span_next_page_new;
        CheckNextPageDownloadTimes = 0;
        TraverseItems();
    }
}

function Xpath2Jquery(STR_XPATH) {
    var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
    var xnodes = [];
    var xres;
    while (xres = xresult.iterateNext()) {
        xnodes.push(xres);
    }
    return xnodes[0];
}

function TraverseItems() {
    // do one page
    VisitItemsInOnePage(page_cnt);
    //console.log($("[data-action='gbfilter-pagination']")[0]);
    
}

var cur_page_item_cnt = 0;
function VisitItemsInOnePage (page_cnt) {
    console.log("page_cnt:" + page_cnt);
    // parse to get all item links
    var item_links = 
        document.evaluate(
            "//div[@class='GB-M-COMMON GB-SUPPLE']//div[@id='widgetContent']//a[@id='dealImage']",
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null);
    cur_page_item_cnt = item_links.snapshotLength;
    console.log("Items:" + cur_page_item_cnt);
    for (var i = 0; i < cur_page_item_cnt; i++) {
        var item_link = item_links.snapshotItem(i);
        //$.get(item_link, null, VisitItem);
        AjaxUrl(item_link);
        // DoReq(item_link);
    }
    CheckVisitItemsDone();
}

function AjaxUrl(url_str) {
    $.ajax({
        url:url_str,
        type:'GET',
        timeout: AJAX_URL_TIMEOUT,
        success:function(msg){
            VisitItem(url_str, msg);
        },
        complete:function(xhr, status) {
            console.log("VisitItem status:" + status);
            cur_page_item_cnt -= 1;
        }
    });
}

var CheckVisitItemsDoneTimes = 0;
function CheckVisitItemsDone() {
    console.log("CheckVisitItemsDone");
    CheckVisitItemsDoneTimes += 1;
    if (cur_page_item_cnt === 0 || CheckVisitItemsDoneTimes === CHECK_VISIT_ITEMS_DONE_TIMES_THRESHOLD) {
        ClickNextPage();
        CheckVisitItemsDoneTimes = 0;
    }
    else {
        setTimeout(CheckVisitItemsDone, CHECK_VISIT_ITEMS_DONE_DELAY);
    }
}

var page_cnt = 1;
function ClickNextPage() {
    console.log("ClickNextPage");
    // next page
    var next_page_button = 
        Xpath2Jquery("//div[@id='FilterItemView_page_pagination']//a[@href='#next']");
    next_page_button.click();
    
    page_cnt += 1;
}

function IsLoaded(url) {
  chrome.tabs.query(null, function(tabs) {for (var tab in tabs) {if (ure === tab.url) return true;} return false;});
}
var CHOOSE_CONDITION_FUNC = [PriceDiscount, ManJianPromote, XJianXDiscount, XPercentAlreadyOrdered, XJianJianXYuan];
function VisitItem(url_str, data) {
    var regex = /(.*\/)[^\/]*/g;
    var norm_url = regex.exec(url_str)[1];
    if (GM_getValue(norm_url, false)) {
    // if (IsLoaded(norm_url)) {
      console.log("Already show:" + norm_url);
      return;
    }
    GM_setValue(norm_url, true); // TODO:insert into Timer queue where to automatically delete key by time
    var doc = $(data).get(0);
    var is_self_sale = IsSelfSale(doc);
    if ( is_self_sale !== 0) {
        if (is_self_sale === -1) {
            console.log("IsSelfSale Error:" + url_str);
        }
        return;
    }
    // old_price
    var old_price = GetOldPrice(doc);
    if (old_price === null) {
        console.log("GetOldPrice Error:" + url_str);
        return;
    }
    
    // price
    var price = GetPrice(doc);
    if (price === null) {
        console.log("GetPrice Error:" + url_str);
        return;
    }
    
    // item_title
    var item_title_xpath = "//div[@id='title_feature_div']//span[@id='productTitle']";
    var item_titles = Xpath2Str(item_title_xpath, doc);
    var item_title = item_titles[0];
    
    // promotion info
    var promote_info_xpath = "//div[@id='promotion-upsell']//span[@class='pu-short-title a-text-bold']";
    var promote_infos = Xpath2Str(promote_info_xpath, doc);
    for (var i = 0; i < promote_infos.length; i++) {
        var promote_info = promote_infos[i];
        for (var j = 0; j < CHOOSE_CONDITION_FUNC.length; ++j) {
          var ret = CHOOSE_CONDITION_FUNC[j](old_price, price, promote_info, doc);
          if (ret[0]) {
              console.log(item_title + "\n" + url_str + "\n" + ret[1]);
              // window.open(url_str);
              unsafeWindow.open(url_str);
              // GM_openInTab(url_str);
              Notify(CHOOSE_CONDITION_FUNC[j].name, item_title, norm_url);
              return;
          }
        }
    }
}

function Xpath2Str(xpath, doc) {
    var ret = [];
    var nodes = 
        document.evaluate(xpath,
                          doc,
                          null,
                          XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                          null);
    var cnt = nodes.snapshotLength;
    for (var i = 0; i < cnt; ++i) {
        ret.push(nodes.snapshotItem(i).innerHTML);
    }
    return ret;
}

// check amazon sale by himself
function IsSelfSale(doc) {
    var html_strs = Xpath2Str("//div[@id='dynamicDeliveryMessage_feature_div']//span[@id='ddmMerchantMessage']", doc);
    var ret = 0;
    if (html_strs.length < 1) {
        ret = -1;
    }
    else if (html_strs[0].indexOf("亚马逊直接销售") < 0) {
        ret = -2;
    }
    return ret;
}

function GetRegexMatchStr(regex, xpath, doc) {
    var nodes = Xpath2Str(xpath, doc);
    if (nodes.length < 1) {
        console.log("GetRegexMatchStr fail, xpath:" + xpath);
        return null;
    }
    var node = nodes[0];
    var matches = regex.exec(node);
    if (matches === null) {
        console.log("GetRegexMatchStr failed,str:" + node + ",regex:" + regex);
        return null;
    }
    if (matches[1] === null) {
        console.log("GetRegexMatchStr return null:" + node);
    }
    return matches[1];
}

function GetOldPriceBy(doc) {
    var regex_price = new RegExp("[^0-9\.]*([0-9\.]+).*", "g");
    var old_price_xpath = "//div[@id='price']//span[@id='priceblock_ourprice']";
    var old_price = GetRegexMatchStr(regex_price, old_price_xpath, doc);
    return old_price;
}

function GetPriceBy(doc) {
    var regex_price = new RegExp("[^0-9\.]*([0-9\.]+).*", "g");
    var price_xpath = "//div[@id='price']//span[@id='priceblock_dealprice']";
    var price = GetRegexMatchStr(regex_price, price_xpath, doc);
    return price;
}

function GetPriceByBuybox(doc) {
    var regex_price = new RegExp("[^0-9\.]*([0-9\.]+).*", "g");
    var price_xpath = "//div[@id='buybox']//div[@id='buyDealSection']//div[@class='inlineBlock-display']";
    var price = GetRegexMatchStr(regex_price, price_xpath, doc);
    return price;
}

function GetOldPrice(doc) {
    var price = GetOldPriceBy(doc);
    if ( price !== null) {
        price = Number(price);
    }
    return price;
}

function GetPrice(doc) {
    var price = GetPriceBy(doc);
    if (price !== null) {
        return Number(price);
    }
    price = GetPriceByBuybox(doc);
    if (price !== null) {
        price = Number(price);
    }
    return price;
}

// -------------------------------------------------------------------------------------------------