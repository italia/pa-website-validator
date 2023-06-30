const puppeteerCacheDir = process.argv[3];
if (puppeteerCacheDir) {
  process.env["PUPPETEER_CACHE_DIR"] = puppeteerCacheDir;
}
