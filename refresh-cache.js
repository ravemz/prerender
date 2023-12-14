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

    console.log("fetching sitemap from: ", sitemap_url);
    const { sites, errors } = await sitemap.fetch(sitemap_url);
    console.error("faced errors: ", errors);

    refreshCacheFromArray(sites);
}

async function refreshCacheFromArray(sites) {
    console.log("refreshing cache for: ", sites.length, " urls");

    for (let i = 0; i < sites.length / api_rate_limit; i++) {
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
    console.log("refreshing cache for: ", url);
    try {
      return await axios({
          url: prerender_url + "/render",
          method: "post",
          data: { url },
      });
    } catch (err) {
      console.error("error for url: "+url, err.message);
    }
}
