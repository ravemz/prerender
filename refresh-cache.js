require("dotenv").config();

const args = require("args-parser")(process.argv);
console.log(args);
const sitemap_url = args["sitemap-url"];
const api_rate_limit = args["api-rate-limit"] || 500;

var REDIS_URL =
  process.env.REDISTOGO_URL ||
  process.env.REDISCLOUD_URL ||
  process.env.REDISGREEN_URL ||
  process.env.REDIS_URL ||
  "redis://127.0.0.1:6379";

var url = require("url");
var TTL = process.env.PAGE_TTL || 86400;

// Parse out the connection vars from the env string.
var connection = url.parse(REDIS_URL);
var redis = require("redis");
var client = redis.createClient(connection.port, connection.hostname);

if (connection.auth) {
  client.auth(connection.auth.split(":")[1]);
}

connection.path = (connection.pathname || "/").slice(1);
connection.database = connection.path.length ? connection.path : "0";
client.select(connection.database);

client.on("error", function (error) {
  console.warn("Redis Cache Error: " + error);
});

const axios = require("axios");
client.on("ready", async function () {
  console.log("redis client connected");

  const Sitemapper = require("sitemapper");
  const sitemap = new Sitemapper();
  const { sites, errors } = await sitemap.fetch(sitemap_url);
  console.log(
    "refreshing cache for " +
      sites.length +
      " urls from sitemap located at " +
      sitemap_url
  );
  for (let i = 0; i < sites.length / api_rate_limit; i++) {
    sites.slice(i * api_rate_limit, (i + 1) * api_rate_limit).map((url) => {
      client.del(url);
      console.log("refreshing " + url);
      axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/W.X.Y.Z Safari/537.36",
        },
      });
    });
    // wait for 1min after api_rate_limit calls
    await new Promise((resolve) => setTimeout(resolve, 1000 * 60));
  }

  console.log("faced errors:", errors);
});

client.on("end", function () {
  redisOnline = false;
  console.warn(
    "Redis Cache Conncetion Closed. Will now bypass redis until it's back."
  );
});
