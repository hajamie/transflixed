window.onload = function () {
  if(!localStorage.enabled) localStorage.enabled = 1;

  var button = document.getElementById('onOff');
  
  if (localStorage.enabled == 1) {
    button.className = 'on';
  }

  button.onclick = function(){
    if (localStorage.enabled == 1) {
      localStorage.enabled = 0;
      button.className = 'off';
    } else {
      localStorage.enabled = 1;
      button.className = 'on';
    }
    
    chrome.runtime.sendMessage({type: "icon"});
  };
}