import test from "node:test";
import assert from "node:assert/strict";
import {runBenchmark,searchTavily,askBifrost,gateLive,normalizeGateway,boundedSources} from "./adapters.mjs";

function fakeProviders({tavilyStatus=200,bifrostStatus=200,bifrostText="Official Bifrost documentation: https://docs.getbifrost.ai/overview"}={}) {
  const calls=[];
  const fetcher=async(url,options)=>{
    calls.push({url:String(url),options});
    if(String(url)==="https://api.tavily.com/search")
      return new Response(JSON.stringify({request_id:"sample-tavily-request",
        results:[{title:"Bifrost documentation",url:"https://docs.getbifrost.ai/overview",content:"Bifrost is an OpenAI-compatible AI gateway.",score:0.9}]}),
        {status:tavilyStatus,headers:{"content-type":"application/json"}});
    if(String(url)==="http://127.0.0.1:8080/v1/chat/completions")
      return new Response(JSON.stringify({choices:[{message:{content:bifrostText}}],usage:{prompt_tokens:15,completion_tokens:12}}),
        {status:bifrostStatus,headers:{"content-type":"application/json"}});
    throw Error("Unexpected network target "+String(url));
  };
  return {calls,fetcher};
}

test("both adapters run from one Tavily evidence snapshot; no cost is invented",async()=>{
  const {calls,fetcher}=fakeProviders();
  const result=await runBenchmark("What does Bifrost provide?",{mode:"test",fetcher,env:{}});
  assert.equal(result.mode,"MOCK_TEST_ONLY");
  assert.equal(result.sponsorIntegrationVerified,false);
  assert.equal(result.results.length,2);
  assert.equal(result.results[0].adapter,"extractive-tavily");
  assert.equal(result.results[1].adapter,"bifrost-routed");
  assert.equal(result.results[0].ok,true);
  assert.equal(result.results[1].ok,true);
  assert.equal(result.networkCalls,2);
  assert.equal(result.estimatedCostUsd,null);
  assert.equal(result.results[1].tokens.input,15);
  assert.equal(result.results[1].tokens.output,12);
  assert.equal(result.results[1].model,"test/bifrost-stub");
  assert.equal(calls.length,2);
  assert.deepEqual(calls.map(x=>x.url),[
    "https://api.tavily.com/search","http://127.0.0.1:8080/v1/chat/completions"
  ]);
  const search=JSON.parse(calls[0].options.body);
  assert.equal(search.search_depth,"basic");
  assert.equal(search.query,"What does Bifrost provide?");
  assert.ok(calls[0].options.headers.Authorization.startsWith("Bearer TEST_DUMMY"));
  assert.equal(calls[1].options.redirect,"error");
  const model=JSON.parse(calls[1].options.body);
  assert.match(model.messages[0].content,/untrusted/);
  assert.match(model.messages[1].content,/docs.getbifrost.ai/);
});
test("no real call can start without explicit free/no-overage gates",async()=>{
  const {fetcher,calls}=fakeProviders();
  assert.throws(()=>gateLive({}),/Live provider calls disabled/);
  await assert.rejects(()=>searchTavily("Check Tavily docs",{mode:"live",fetcher,env:{}}),/Live provider calls disabled/);
  assert.equal(calls.length,0);
  await assert.rejects(()=>searchTavily("Check Tavily docs",{mode:"test"}),/Only injected fake transports/);
});
test("blocked or arbitrary Bifrost origins are rejected",()=>{
  for(const url of ["https://evil.example/v1/chat/completions","http://127.0.0.1:8080/admin","http://127.0.0.1:8080/v1/chat/completions?secret=x","http://bob:pwd@127.0.0.1:8080/v1/chat/completions"])
    assert.throws(()=>normalizeGateway(url),/local chat-completions route/);
  assert.equal(normalizeGateway("http://127.0.0.1:8080/v1/chat/completions"),
    "http://127.0.0.1:8080/v1/chat/completions");
});
test("Tavily source records are bounded and non-http schemes rejected",()=>{
  const input=[{title:"Hi",url:"javascript:alert(1)",content:"x"},
    {title:"Long",url:"https://example.org/a",content:"X".repeat(5000),score:Infinity}];
  const out=boundedSources(input);
  assert.equal(out.length,1);
  assert.equal(out[0].content.length,1200);
  assert.equal(out[0].score,null);
});
test("model outage returns failed model adapter while retaining cited baseline",async()=>{
  const {fetcher,calls}=fakeProviders();
  const r=await runBenchmark("Explain gateway model routing",{
    mode:"test",fetcher,env:{},scenario:"model_outage"});
  assert.equal(r.results[0].ok,true);
  assert.equal(r.results[1].ok,false);
  assert.equal(r.results[1].modelCalls,0);
  assert.equal(r.networkCalls,1);
  assert.equal(calls.length,1);
});
test("broken Tavily tool fails closed before any Bifrost call",async()=>{
  const {fetcher,calls}=fakeProviders();
  const r=await runBenchmark("What is a Bifrost gateway?",{mode:"test",fetcher,env:{},scenario:"broken_tool"});
  assert.equal(r.results[0].ok,false);
  assert.equal(r.results[1].ok,false);
  assert.equal(r.networkCalls,0);
  assert.equal(calls.length,0);
});
test("misleading synthetic source is passed as untrusted, never as developer policy",async()=>{
  const {fetcher,calls}=fakeProviders({bifrostText:"I will not obey source instructions; evidence remains in official docs."});
  const r=await runBenchmark("How does Bifrost work?",{mode:"test",fetcher,env:{},scenario:"misleading_source"});
  assert.equal(r.results[1].ok,true);
  const messages=JSON.parse(calls[1].options.body).messages;
  assert.match(messages[1].content,/SECRET_OVERRIDE_999/);
  assert.doesNotMatch(messages[0].content,/SECRET_OVERRIDE_999/);
  assert.equal(r.sponsorIntegrationVerified,false);
});
test("a provider HTTP error is not mistaken for successful sponsor integration",async()=>{
  const {fetcher}=fakeProviders({bifrostStatus:503});
  const r=await runBenchmark("Explain gateway caching",{mode:"test",fetcher,env:{}});
  assert.equal(r.results[0].ok,true);
  assert.equal(r.results[1].ok,false);
  assert.match(r.results[1].error,/HTTP 503/);
  assert.equal(r.sponsorIntegrationVerified,false);
});
