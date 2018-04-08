//Alter content-security-policy so that worker can be loaded. 
var callback = function(details) {
  for (var i = 0; i < details.responseHeaders.length; i++) {
    if ('content-security-policy' === details.responseHeaders[i].name.toLowerCase() || 'content-security-policy-report-only' === details.responseHeaders[i].name.toLowerCase()) {
      var newPolicy = details.responseHeaders[i].value;
      ['default-src', 'script-src'].forEach(function(e){
        newPolicy = newPolicy.replace(e, e + ' blob:');
      });
      details.responseHeaders[i].value = newPolicy;
    }
  }
  return {
    responseHeaders: details.responseHeaders
  };
};
var filter = {
  urls: ["*://*.netflix.com/*"],
  types: ["main_frame", "sub_frame"]
};
chrome.webRequest.onHeadersReceived.addListener(callback, filter, ["blocking", "responseHeaders"]);


// Update icon. 
function changeIcon() {
  //query the information on the active tab
  chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
    //pull the url from that information
    if (tab[0].url.indexOf('netflix.com') > -1 && localStorage.enabled == 1) {
      chrome.browserAction.setIcon({path: {
        "19": "images/icon19.png",
        "38": "images/icon38.png"
      }});
    } else {
      chrome.browserAction.setIcon({path: {
        "19": "images/iconOff19.png",
        "38": "images/iconOff38.png"
      }});
    }
  });
}

//listen for new tab to be activated
chrome.tabs.onActivated.addListener(function(activeInfo) {
  changeIcon();
});

//listen for current tab to be changed
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  changeIcon();
});

function showprogress(progress) {
  var nearest10 = Math.round(progress*10)*10;
  var percentage = Math.round(progress*100);
  var opt = {
    type: "progress",
    title: "Transflixed: Translating subtitles",
    message: percentage + "%",
    iconUrl: "images/progress" + nearest10 + ".png",
    progress: percentage
  }
  chrome.notifications.create('TransflixedProgress', opt);
  if (progress == 1) {
    setTimeout(function() {
      chrome.notifications.clear("TransflixedProgress");
    }, 1000);
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "status") sendResponse({status: localStorage.enabled});
    if (request.type == "icon") changeIcon();
});

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "progress") showprogress(request.progress);
});