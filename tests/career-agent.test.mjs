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
    'id="agent-build-dossier"',
    'id="agent-dossier-result"',
    'id="agent-analyze-fit"',
    'id="agent-fit-result"',
    'id="agent-decision-signals"',
    'id="agent-build-decision"',
    'id="agent-decision-result"',
    "data-agent-job=",
    'src="./career-agent.js"',
  ]) {
    assert.match(html, new RegExp(marker));
  }
});

test("fit and outcome calibration remain explicit and ordered", () => {
  assert.match(script, /analyzeFitButton\.addEventListener\(["']click["']/);
  assert.match(script, /api\/analyze-fit/);
  assert.match(script, /JSON\.stringify\(\{ jobAnalysis: latestAnalysis \}\)/);
  assert.match(script, /buildDecisionButton\.addEventListener\(["']click["']/);
  assert.match(script, /api\/decision/);
  assert.match(script, /opportunitySignals/);
  assert.match(script, /responseBody\.fitScore !== latestFit\.score/);
  assert.match(script, /outcomeApplicationId/);
  assert.doesNotMatch(script, /localStorage|sessionStorage|indexedDB/);
});

test("only documented opportunities carry curated decision signals", () => {
  for (const signal of [
    "technology_leadership",
    "telecommunications",
    "ai_strategy",
    "data_ai",
    "agentic_ai",
    "hands_on",
    "principal_level",
    "production_ai",
  ]) {
    assert.match(html, new RegExp(`"${signal}"`));
  }
  assert.match(script, /Array\.isArray\(job\.decisionSignals\)/);
  assert.match(script, /decisionSignalsInput\.value = [\s\S]*: "";/);
});

test("dossier generation is explicit, authenticated and non-persistent", () => {
  assert.match(script, /buildDossierButton\.addEventListener\(["']click["']/);
  assert.match(script, /api\/build-dossier/);
  assert.match(script, /analysis: latestAnalysis/);
  assert.match(script, /authorization: `Bearer \$\{idToken\}`/);
  assert.match(script, /pendingProfileItems/);
  assert.match(script, /doNotClaim/);
  assert.doesNotMatch(script, /localStorage|sessionStorage|indexedDB/);
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
