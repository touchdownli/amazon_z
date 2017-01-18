
// refer:https://developers.google.com/identity/protocols/OAuth2UserAgent
var GMAIL_API_URL = 
"https://www.googleapis.com/gmail/v1/users/me/messages/send?";
var ACCESS_TOKEN_URL = "https://accounts.google.com/o/oauth2/v2/auth";

var param_4_access_token_pattern = "scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send&\
redirect_uri=https%3A%2F%2Fwww.facebook.com/connect/login_success.html&\
response_type=token&\
prompt=none&\
client_id=490889127063-6c713lt00uv202226jk4u8cms4dl0btb.apps.googleusercontent.com";
//"client_secret=doxlEdXMobgE35xDKRIrQ7QW";

var _ACCESS_TOKEN_ = GM_getValue("_ACCESS_TOKEN_", false);
var headers = {
    "Content-Type": "application/x-www-form-urlencoded"
};
//if (!_ACCESS_TOKEN_) {
	sendRequestByGM(ACCESS_TOKEN_URL, param_4_access_token_pattern, headers, _ACCESS_TOKEN_, GetReturnState);
//} else {
	console.log("_ACCESS_TOKEN_:" + _ACCESS_TOKEN_);
//}
function GetReturnState(responseText, retValue) {
	console.log("responseText:" + responseText);
	var params = ParseQueryStr(responseText);
	console.log(params);
	retValue = params['access_token'];
	console.log("retValue:" + retValue);
	GM_setValue("_ACCESS_TOKEN_", retValue);
}
function ParseQueryStr(queryStr) {
	var params = {},
		regex = /([^&=#]+)=([^&]*)/g, m;
	while (m = regex.exec(queryStr)) {
	  params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}
	return params;
}

function b64EncodeUnicode(str) {
    return unsafeWindow.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}
function b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(unsafeWindow.atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

// refer https://developers.google.com/apis-explorer/#search/gmail/gmail/v1/gmail.users.messages.send
function SendEmail(email) {
	var headers = {'Authorization':'Bearer '+_ACCESS_TOKEN_};
	
	var encodeRaw = b64EncodeUnicode(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    var data = JSON.stringify({raw: encodeRaw});
	
	sendRequestByGM(GMAIL_API_URL, data, headers, null, null);
}
function sendRequestByGM(url, postParam, headers, retValue, onload200CB) {
  console.log("postParam:")
  console.log(postParam);
  GM_xmlhttpRequest({
  method: "POST",
  url: url,
  data: postParam,
  headers: headers,
  onload: function(response) {
	console.log(response);
	if (onload200CB) {
		onload200CB(response.finalUrl, retValue);
	}
	// first time run for get the prompt AUTH by google
	//unsafeWindow.open('data:text/html,' + response.responseText);
  },
  onerror:function(response) {
    console.log(response);
  }
});
}

function sendRequest(url, postParam, retValue, onload200CB) {
  var x = new XMLHttpRequest();
  x.open('POST', url, false);
  x.onload = function() {
    if (x.status === 200) {
      // Run script in the current global context.
      try {
		onload200CB(x.responseText, retValue);
      } finally {
        console.log("sendRequest " + url + " success");
      }
    } else {
      console.log("sendRequest " + url + " with status " + x.status);
    }
  };
  x.onerror = function() {
    console.log("x fail with status " + x.status);
  };
  x.send(postParam);
}

function sendRequestByJquery(url, postParam, retValue, onload200CB) {
	$.ajax({
        dataType: "json",
        url:url,
        data: postParam,
        type:"POST",
        contentType:"application/x-www-form-urlencoded; charset=utf-8",
        crossDomain:true,
        cache : true, 
        success:function(data) {
            alert(data);
        },
        error: function(jqXHR, exception, errorstr) {
            console.log(jqXHR);
            alert(errorstr);
        }
    });
}

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '119353855749-qpjqlanp516iuo6jghenr5q72410qksl.apps.googleusercontent.com';
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];
var API_KEY = 'AIzaSyCIE1ndzxSI7T8VotkAXNCx_jgUbvXmCbg';
function handleClientLoad() {
  console.log("handleClientLoad start");
  gapi.client.setApiKey(API_KEY);
  window.setTimeout(checkAuth, 1);
}
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // load client library.
    loadGmailApi();
  } else {
    console.log("Auth GmailApi failed");
  }
}

function loadGmailApi() {
  gapi.client.load('gmail', 'v1', function(){console.log("loadGmailApi success!");});
}

//sendMessage(email_header, "msg body", function() {console.log("callback in for sendmsg.");});