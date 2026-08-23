import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const portalsSource = new URL("../app/data/portals.ts", import.meta.url);

test("portals 数据源：入口数量、唯一 ID、必需字段", async () => {
  const source = await readFile(portalsSource, "utf8");

  const ids = [...source.matchAll(/id: "(\d{2})"/g)].map((match) => match[1]);
  assert.ok(ids.length >= 10, `至少 10 个入口（实际 ${ids.length}）`);
  assert.equal(new Set(ids).size, ids.length, "入口 ID 必须唯一");

  const entries = source.split(/\n  \{\n/).filter((chunk) => chunk.includes('eyebrow: "'));
  assert.equal(entries.length, ids.length, "每个入口都是一个完整对象");
  for (const entry of entries) {
    assert.match(entry, /href: "https?:\/\//, "每个入口都应有 http(s) href");
    assert.match(entry, /https: (true|false)/, "每个入口都应声明 https 支持");
    assert.match(entry, /categories: \[[^\]]*\]/, "每个入口都应有分类");
    assert.match(entry, /status: "(stable|beta|experimental)"/, "每个入口都应有成熟度状态");
    assert.match(entry, /icon: "[a-z]+"/, "每个入口都应有图标");
  }
});

test("portals 数据源：分类与状态枚举合法", async () => {
  const source = await readFile(portalsSource, "utf8");
  const categories = [...source.matchAll(/categories: \[([^\]]*)\]/g)].map((match) => match[1]);
  const categoryTokens = new Set(categories.flatMap((list) => list.split(",").map((item) => item.trim().replace(/"/g, ""))));
  for (const token of categoryTokens) {
    assert.ok(
      ["common", "infrastructure", "agents", "tools", "projects"].includes(token),
      `非法分类：${token}`,
    );
  }
});
