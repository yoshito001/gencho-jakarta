"use strict";
var CACHE = "gencho-jkt-v5";
var FILES = ["./", "index.html", "jszip.min.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function(cache){
    return cache.match(req, {ignoreSearch:true}).then(function(hit){
      var net = fetch(req).then(function(res){
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      });
      if (hit) { net.then(null, function(){}); return hit; }
      return net.then(null, function(){ return cache.match("index.html"); });
    });
  }));
});
