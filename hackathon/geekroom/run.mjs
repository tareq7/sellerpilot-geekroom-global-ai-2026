#!/usr/bin/env node
/** Real providers only. This command NEVER runs a mock benchmark. */
import {open} from "node:fs/promises";
import {runBenchmark,gateLive,safeQuery,normalizeGateway} from "./adapters.mjs";

function flag(name) {
  const i=process.argv.indexOf(name);
  const next=i>=0?process.argv[i+1]:undefined;
  return typeof next==="string" && !next.startsWith("--") ? next : undefined;
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
    safeQuery(query);
    normalizeGateway(process.env.BIFROST_CHAT_URL||undefined);
    if(!["normal","model_outage","broken_tool","misleading_source"].includes(scenario))
      throw new Error("Invalid scenario");
    if(expectedFact && expectedFact.length>120) throw new Error("Expected fact is too long");
    // Reserve the immutable evidence path AFTER all local validation but BEFORE calls.
    handle=await open(output,"wx",0o600);
    const result=await runBenchmark(query,{mode:"live",scenario,expectedFact});
    await handle.writeFile(JSON.stringify(result,null,2)+"\n");
    if (!result.liveProviderCallsCompleted) {
      console.error("INCOMPLETE: real Tavily/Bifrost-routed provider calls did not both complete; evidence saved to "+output);
      process.exitCode=1;
    } else {
      console.log("LIVE CALLS COMPLETED: independently inspect Maxim Bifrost process/version and provider usage before claiming sponsor integration; evidence at "+output);
    }
  } catch(err) {
    let evidenceRepairFailed=false;
    if(handle) {
      // A prior result write may have partially advanced the stream offset.
      // Replace at absolute offset zero, then truncate, rather than appending.
      const marker=Buffer.from(JSON.stringify({
        status:"INCOMPLETE",mode:"LIVE_PROVIDER",errorType:"ValidationOrProviderError",
        note:"Check provider usage and this run's exact evidence path before retry."
      })+"\n","utf8");
      try {
        await handle.truncate(0);
        let done=0;
        while(done<marker.length){
          const {bytesWritten}=await handle.write(marker,done,marker.length-done,done);
          if(bytesWritten<=0)throw Error("Could not persist incomplete marker");
          done+=bytesWritten;
        }
        await handle.truncate(marker.length);
        await handle.sync();
      } catch { evidenceRepairFailed=true; }
    }
    // Only known local validation errors may be shown; provider errors may
    // include credentials, headers, request IDs or private data.
    const localInput=/^(Query must be|Invalid scenario|Expected fact is too long|Bifrost gateway must use|Live provider calls disabled|Live provider access needs)/.test(String(err?.message));
    const errorText=localInput?String(err.message):"Validation, provider or local file failure.";
    console.error("RUN STOPPED: "+errorText+(evidenceRepairFailed?" The evidence file may be incomplete or unreadable.":""));
    process.exitCode=1;
  } finally {
    await handle?.close();
  }
}
