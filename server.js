#!/usr/bin/env node
var prerender = require('./lib');

// set env variables
process.env['ALLOWED_DOMAINS'] = "lessonpal.com,staging.lessonpal.com,dev.lessonpal.com,test.lessonpal.com,temp.lessonpal.com,localhost"

var server = prerender({
	// pageDoneCheckInterval: 5000,
	// waitAfterLastRequest: 5000,
	// parseShadowDom: true,
	// logRequests: true
});

server.use(prerender.whitelist());
// server.use(prerender.sendPrerenderHeader());
server.use(prerender.browserForceRestart());
// server.use(prerender.blockResources());
server.use(prerender.addMetaTags());
server.use(prerender.updateStyleTags());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());
server.use(prerender.prerenderRedisCache());

server.start();
