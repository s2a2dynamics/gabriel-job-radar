import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(
  new URL("../anibal/index.html", import.meta.url),
  "utf8",
);
const script = await readFile(
  new URL("../anibal/career-agent.js", import.meta.url),
  "utf8",
);

test("Aníbal radar exposes the protected Career Agent controls", () => {
  for (const marker of [
    'id="career-agent"',
    'id="google-signin"',
    'id="agent-form"',
    'id="agent-description"',
    "data-agent-job=",
    'src="./career-agent.js"',
  ]) {
    assert.match(html, new RegExp(marker));
  }
});

test("analysis remains explicit and sends bearer auth plus requestId", () => {
  assert.match(script, /form\.addEventListener\(["']submit["']/);
  assert.match(script, /authorization: `Bearer \$\{idToken\}`/);
  assert.match(script, /["']x-request-id["']: requestId/);
  assert.doesNotMatch(script, /localStorage|sessionStorage/);
});

test("frontend contains no Google AI API key", () => {
  assert.doesNotMatch(`${html}\n${script}`, /AIza[0-9A-Za-z_-]{30,}/);
});
