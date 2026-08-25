import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../family/index.html", import.meta.url), "utf8");
const script = await readFile(new URL("../family/family.js", import.meta.url), "utf8");

test("family portal resolves the server-side member without a profile selector", () => {
  assert.match(html, /Beta familiar/);
  assert.match(html, /id="google-signin"/);
  assert.match(script, /api\/me/);
  assert.match(script, /body\.profileStatus === ["']ready["']/);
  assert.doesNotMatch(`${html}\n${script}`, /workspaceId\s*[:=]/);
});

test("family portal keeps credentials and career data out of browser storage", () => {
  assert.match(script, /let idToken = null/);
  assert.doesNotMatch(script, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(`${html}\n${script}`, /AIza[0-9A-Za-z_-]{30,}/);
});
