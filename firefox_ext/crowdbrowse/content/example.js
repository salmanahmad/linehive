(function(){
jQuery.noConflict();
$ = function(selector,context){ return new jQuery.fn.init(selector,context||example.doc); };
$.fn = $.prototype = jQuery.fn;

example = new function(){};
example.log = function(){ Firebug.Console.logFormatted(arguments,null,"log"); };
example.run = function(doc,aEvent) {
  // Check for website
  if(!doc.location.href.match(/^http:\/\/(.*\.)?stackoverflow\.com(\/.*)?$/i)) return;

  // Check if already loaded
  if(doc.getElementById("plugin-example")) return;

  // Setup
  this.win = aEvent.target.defaultView.wrappedJSObject;
  this.doc = doc;

  // Hello World
  this.main = main = $('<div id="plugin-example">').appendTo(doc.body).html('Example Loaded!');
  main.css({background:'#FFF',color:'#000',position:'absolute',top:0,left:0,padding:8});
  main.html(main.html() + ' - jQuery <b>' + $.fn.jquery + '</b>');
};


// Bind Plugin
var delay = function(aEvent){ var doc = aEvent.originalTarget; setTimeout(function(){ example.run(doc,aEvent); },1); };
var load = function(){ gBrowser.addEventListener("DOMContentLoaded", delay, true); };
window.addEventListener("pageshow", load, false);

})();
