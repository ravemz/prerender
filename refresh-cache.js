const util = require('./lib/util.js');

const axios = require("axios");
const arg_parser = require("args-parser");

// process .env file
require("dotenv").config();
const prerender_url = process.env.PRERENDER_URL;
if (!prerender_url) {
    console.error("PRERENDER_URL not set in .env file");
    process.exit(1);
}

// parse arguments
const args = arg_parser(process.argv);
const {
    ["sitemap-url"]: sitemap_url,
    ["api-rate-limit"]: api_rate_limit = 10,
    ["1"]: single_url = undefined,
    ["method"]: http_method = 'post',
    ["offset"]: offset = 0,
} = args;

if (single_url) {
    refreshCacheForUrl(single_url);
} else if (sitemap_url) {
    refreshCacheForSitemap(sitemap_url);
} else {
    console.error("No sitemap url or single url provided");
    process.exit(1);
}

async function refreshCacheForSitemap(sitemap_url) {
    const Sitemapper = require("sitemapper");
    const sitemap = new Sitemapper();

    util.log("fetching sitemap from: ", sitemap_url);
    const { sites, errors } = await sitemap.fetch(sitemap_url);
    console.error("faced errors: ", errors);

    refreshCacheFromArray(sites);
}

async function refreshCacheFromArray(sites) {
    util.log("refreshing cache for: ", sites.length, " urls and offset: ", offset);
    
    for (let i = offset; i < sites.length / api_rate_limit; i++) {
	util.log(i);
        await Promise.all(
            sites
                .slice(i * api_rate_limit, (i + 1) * api_rate_limit)
                .map(refreshCacheForUrl)
        );
        // wait for 1min after api_rate_limit calls
        // await new Promise((resolve) => setTimeout(resolve, 1000 * 60));
    }
}

async function refreshCacheForUrl(url) {
    util.log("refreshing cache for: ", url);
    try {
      if (http_method == 'post') {
        return await axios({
            url: prerender_url + "/render",
            method: "post",
            data: { url },
        });
      } else {
        return await axios({
            url: prerender_url + "/" + url,
            method: "get",
        });
      }
    } catch (err) {
      console.error("error for url: "+url, err.message);
    }
}
