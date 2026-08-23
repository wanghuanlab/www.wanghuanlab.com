import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const releaseRoot = new URL("../release/", import.meta.url);
const assetsRoot = new URL("../release/assets/", import.meta.url);

test("release/index.html 包含站点元数据与构建产物引用", async () => {
  const html = await readFile(new URL("index.html", releaseRoot), "utf8");
  assert.match(html, /欢的实验室/);
  assert.match(html, /<title>/);
  assert.match(html, /canonical/);
  assert.match(html, /https:\/\/wanghuanlab\.com\//);
  assert.match(html, /og\.jpg/);
  assert.match(html, /favicon\.svg/);
  assert.doesNotMatch(html, /Your site is taking shape/);
  assert.doesNotMatch(html, /og\.png/);
  assert.doesNotMatch(html, /www\.wanghuanlab\.com/);

  const assetRefs = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
  assert.ok(assetRefs.length >= 2, "应引用至少 2 个构建资源");
  for (const ref of assetRefs) {
    await access(new URL(`.${ref}`, releaseRoot));
  }
});

test("release 包含 favicon / manifest / robots / sitemap 等静态资源", async () => {
  const expected = [
    "favicon.png",
    "favicon.svg",
    "apple-touch-icon.png",
    "site.webmanifest",
    "robots.txt",
    "sitemap.xml",
    "og.jpg",
  ];
  for (const name of expected) {
    await access(new URL(name, releaseRoot));
  }
  const assets = await readdir(assetsRoot);
  assert.ok(assets.length > 0, "assets 目录不应为空");
});

test("JS 产物包含关键入口文案与交互元素", async () => {
  const assets = await readdir(assetsRoot);
  const jsFile = assets.find((file) => file.startsWith("index-") && file.endsWith(".js"));
  assert.ok(jsFile, "应存在主 JS 产物（index-*.js）");
  const bundle = await readFile(new URL(jsFile, assetsRoot), "utf8");
  for (const text of ["服务器管理平台", "VibeCoding", "长江电力", "⌘K", "更新记录", "关于实验室"]) {
    assert.ok(bundle.includes(text), `JS 产物应包含：${text}`);
  }
});
