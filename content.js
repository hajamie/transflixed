(function(xhr) {
  var transflixedWorker = new Worker(URL.createObjectURL(new Blob(["("+transflixedWorkerFunction.toString()+")()"], {type: 'text/javascript'})));
  transflixedWorker.onmessage = function(e) {
    console.log('Message received from worker: ' + e.data);
  };
  
  function done(xhr) {
    if (xhr.responseURL.indexOf('/?o=') >= 0) {
      var oParser = new DOMParser();
      var oDOM = oParser.parseFromString(xhr.response, "text/xml");
      
      var maxToTranslate = Infinity;
      var translationCount = 0;
      var totalTranslations = oDOM.querySelectorAll('p').length;
      
      oDOM.querySelectorAll('p').forEach(function(p) {
        translationCount++;
        if (translationCount > maxToTranslate) return;
        var newElements = [];
        p.childNodes.forEach(function(child) {
          if (child.nodeName == "#text") { // If it's a text node, make it into a span instead. 
            var textValue = child.nodeValue;
            child = document.createElement('span')
            child.innerHTML = textValue;
          }
          // Get the translation. 
          var request = encodeURIComponent(child.innerHTML);
          var oReq = new XMLHttpRequest();
          oReq.open("GET", "https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=en&hl=en-GB&dt=t&dt=bd&dj=1&source=icon&tk=483706.483706&q=" + request, false);
          oReq.send();
          var translation = JSON.parse(oReq.responseText).sentences.map(function(e) {return e.trans}).join('');
          // Create the new nodes. 
          var newChild = child.cloneNode(true);
          newChild.setAttribute("tts:color", "silver");
          newChild.innerHTML = translation;
          var br = document.createElement("br");
          // Add the new nodes. 
          newElements.push(child, br, newChild);
          console.log(translation);
        });
        p.innerHTML = '';
        p.append.apply(p, newElements);
        chrome.runtime.sendMessage(transflixedId, {type: "progress", progress: translationCount/totalTranslations});
      });
      
      var oSerializer = new XMLSerializer();
      var xmlDoc = xhr.response = oSerializer.serializeToString(oDOM);
      Object.defineProperty(xhr, "response", {writable: true});
      Object.defineProperty(xhr, "responseText", {writable: true});
      xhr.response = xmlDoc;
      xhr.responseText = xmlDoc;
    }
  }
  
  // Monkey patch XMLHttpRequest. 
  var open = xhr.open;
  xhr.open = function(method, url, async) {
    var send = this.send;
    this.send = function(data) {
      var onload = this.onload;
      // Apply monkey-patch
      this.onload = function() {
        done(this);
        if (onload) {
           return onload.apply(this, arguments);
        }
      };
      return send.apply(this, arguments);
    };
    return open.apply(this, arguments);
  }
})(XMLHttpRequest.prototype);