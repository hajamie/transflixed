function transflixedWorkerFunction() {
  onmessage = function(r) {
    console.log('Translation request received. ');
    var request = encodeURIComponent(r.data[0]);
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() {
      postMessage([this.responseText, r.data[1]]);
    });
    oReq.open("GET", "https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=en&hl=en-GB&dt=t&dt=bd&dj=1&source=icon&tk=483706.483706&q=" + request);
    oReq.send();
  }
}
// This is in case of normal worker start
// "window" is not defined in web worker
// so if you load this file directly using `new Worker`
// the worker code will still execute properly
if(window!=self)
  transflixedWorkerFunction();