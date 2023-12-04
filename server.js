#!/usr/bin/env node
var prerender = require('./lib');

var server = prerender({
	// pageDoneCheckInterval: 5000,
	// waitAfterLastRequest: 5000,
	// parseShadowDom: true,
	// logRequests: true
});

// server.use(prerender.sendPrerenderHeader());
server.use(prerender.browserForceRestart());
// server.use(prerender.blockResources());
server.use(prerender.addMetaTags());
server.use(prerender.updateStyleTags());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());
server.use(require('prerender-redis-cache'));

server.start();
