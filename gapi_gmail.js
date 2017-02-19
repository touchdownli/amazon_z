
// refer:https://developers.google.com/identity/protocols/OAuth2UserAgent
var GMAIL_API_URL =
  "https://www.googleapis.com/gmail/v1/users/me/messages/send?";
var ACCESS_TOKEN_URL = "https://accounts.google.com/o/oauth2/v2/auth";

var param_4_access_token_pattern = "scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send&redirect_uri=https%3A%2F%2Fwww.facebook.com/connect/login_success.html&response_type=token&prompt=none&client_id=490889127063-6c713lt00uv202226jk4u8cms4dl0btb.apps.googleusercontent.com";
//"client_secret=xxxx";

Persistentor.key = "_ACCESS_TOKEN_";
var _ACCESS_TOKEN_ = Persistentor.GetPersistObjAttr("value");
var END_TIMESTAMP = Persistentor.GetPersistObjAttr("end_timestamp");
var headers = {
  "Content-Type" : "application/x-www-form-urlencoded"
};
function Timestamp2DateStr(end_timestamp) {
  var date = new Date();
  date.setTime(end_timestamp * 1000);
  return date.toString();
}
if (_ACCESS_TOKEN_ == null) {
  sendRequestByGM(ACCESS_TOKEN_URL, "POST", param_4_access_token_pattern, headers, _ACCESS_TOKEN_, GetReturnState);
} else {
  console.log("_ACCESS_TOKEN_:" + _ACCESS_TOKEN_ + "\n" + "end_timestamp:" + Timestamp2DateStr(END_TIMESTAMP));
}
function GetReturnState(responseText, retValue) {
  console.log("responseText:" + responseText);
  var params = ParseQueryStr(responseText);
  console.log(params);
  retValue = params['access_token'];
  var expireTimeSpan = params["expires_in"];
  var end_timestamp = (new Date()).getTime() / 1000 + parseInt(expireTimeSpan);

  _ACCESS_TOKEN_ = retValue;

  Persistentor.key = "_ACCESS_TOKEN_";
  Persistentor.SetPersistObjAttr("value", retValue);
  Persistentor.SetPersistObjAttr("end_timestamp", end_timestamp);
  Persistentor.Persist();

  console.log("ACCESS_TOKEN Persist:" + Persistentor.key + "," + retValue + "," + Timestamp2DateStr(end_timestamp));
}
function ParseQueryStr(queryStr) {
  var params = {},
  regex = /([^&=#]+)=([^&]*)/g,
  m;
  while (m = regex.exec(queryStr)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  return params;
}

function b64EncodeUnicode(str) {
  return unsafeWindow.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
}

function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(unsafeWindow.atob(str), function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
function MIMEEncode(email) {
  return b64EncodeUnicode(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  //return Base64.encodeURI(email);
}
// refer https://developers.google.com/apis-explorer/#search/gmail/gmail/v1/gmail.users.messages.send
function SendEmail(email) {
  var headers = {
    'Authorization' : 'Bearer ' + _ACCESS_TOKEN_,
    'Content-type' : 'application/json'
  };

  var encodeRaw = MIMEEncode(email);
  var data = JSON.stringify({
      raw : encodeRaw
    });

  sendRequestByGM(GMAIL_API_URL, "POST", data, headers, null, null);
}
function sendRequestByGM(url, method, postParam, headers, retValue, onload200CB) {
  console.log("postParam:")
  console.log(postParam);
  GM_xmlhttpRequest({
    method : method,
    url : url,
    data : postParam,
    headers : headers,
    onload : function (response) {
      console.log(response);
      if (onload200CB) {
        onload200CB(response.finalUrl, retValue);
      }
      // first time run for get the prompt AUTH by google
      // unsafeWindow.open('data:text/html,' + response.responseText);
    },
    onerror : function (response) {
      console.log(response);
    }
  });
}

//----------------NOT USE-----------------because of across domain request
function sendRequest(url, postParam, retValue, onload200CB) {
  var x = new XMLHttpRequest();
  x.open('POST', url, false);
  x.onload = function () {
    if (x.status === 200) {
      // Run script in the current global context.
      try {
        onload200CB(x.responseText, retValue);
      }
      finally {
        console.log("sendRequest " + url + " success");
      }
    } else {
      console.log("sendRequest " + url + " with status " + x.status);
    }
  };
  x.onerror = function () {
    console.log("x fail with status " + x.status);
  };
  x.send(postParam);
}

function sendRequestByJquery(url, postParam, retValue, onload200CB) {
  $.ajax({
    dataType : "json",
    url : url,
    data : postParam,
    type : "GET",
    contentType : "application/x-www-form-urlencoded; charset=utf-8",
    crossDomain : true,
    cache : true,
    success : function (data) {
      onload200CB(data, retValue);
    },
    error : function (jqXHR, exception, errorstr) {
      console.log(jqXHR);
      alert(errorstr);
    }
  });
}
//--------NOT USE END-----