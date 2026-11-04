#!/usr/bin/env node
/** Real providers only. This command NEVER runs a mock benchmark. */
import {open} from "node:fs/promises";
import {runBenchmark,gateLive} from "./adapters.mjs";

function flag(name) {
  const i=process.argv.indexOf(name);
  return i>=0?process.argv[i+1]:undefined;
}
const query=flag("--query");
const output=flag("--out");
const scenario=flag("--scenario")||"normal";
const expectedFact=flag("--expected-fact")||null;
if(!process.argv.includes("--live")||!query||!output) {
  console.error("Usage: node hackathon/geekroom/run.mjs --live --query 'public research topic' --out /tmp/unique.json [--scenario normal] [--expected-fact known]");
  process.exitCode=2;
} else {
  let handle;
  try {
    gateLive(process.env); // hard gate before even reserving a file
    // Reserve the immutable evidence path BEFORE making paid/provider calls.
    handle=await open(output,"wx",0o600);
    const result=await runBenchmark(query,{mode:"live",scenario,expectedFact});
    await handle.writeFile(JSON.stringify(result,null,2)+"\n");
    if (!result.sponsorIntegrationVerified) {
      console.error("INCOMPLETE: real Tavily/Bifrost provider chain not fully verified; evidence saved to "+output);
      process.exitCode=1;
    } else {
      console.log("VERIFIED: both provider adapters returned through live endpoints; evidence at "+output);
    }
  } catch(err) {
    // Never print provider bodies, headers, credential-bearing URLs or tokens.
    console.error("RUN STOPPED: "+(err?.message?.includes("Live provider") ? err.message : "Validation, provider, or file operation failed. Inspect redacted evidence only."));
    process.exitCode=1;
  } finally {
    await handle?.close();
  }
}
