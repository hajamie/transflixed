chrome.runtime.sendMessage({type: "status"}, function(response) {
  if (response.status == 1) run();
  return;
});

function run() {
  var scriptsToPrepend = [];

  var workerScript = document.createElement('script');
  workerScript.src = chrome.extension.getURL('worker.js');
  scriptsToPrepend.push(workerScript);

  var setTransflixedId = document.createElement("script");
  setTransflixedId.innerHTML = 'var transflixedId = "' + chrome.runtime.id + '";';
  scriptsToPrepend.push(setTransflixedId);

  var contentScript = document.createElement('script');
  contentScript.src = chrome.extension.getURL('content.js');
  scriptsToPrepend.push(contentScript);

  var style = document.createElement('link');
  style.href = chrome.extension.getURL('style.css');
  style.rel = 'stylesheet'
  style.type = 'text/css';
  scriptsToPrepend.push(style);

  for (var i = 0; i < scriptsToPrepend.length; i++) {
    if (scriptsToPrepend[i].tagName == "SCRIPT") {
      scriptsToPrepend[i].onload = function() {
        this.parentNode.removeChild(this);
      };
    }
  }

  document.documentElement.prepend.apply(document.documentElement, scriptsToPrepend);
}