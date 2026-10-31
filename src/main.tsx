import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Activity,BarChart3,ChevronRight,CloudUpload,Database,Globe,LayoutDashboard,Menu,ShieldCheck,Sparkles,Target,TriangleAlert,X,Zap} from 'lucide-react';
import {analyze,type Ad,type Stock,type Opportunity,type Market} from './domain/engine';
import {parseAds,parseStock,toCsv} from './domain/csv';
import {auditReports} from './domain/data-quality';
import {normalizeAmazonAdvertisedProducts,type AmazonVatTreatment} from './domain/native-amazon';
import {normalizeNoonGuided,type NoonMapping} from './domain/guided-noon';
import {Dashboard,Radar,Campaigns,Actions,DataLab,Copilot,DetailDrawer,type ViewProps} from './views';
import './style.css';

type Page='overview'|'radar'|'campaigns'|'actions'|'data'|'copilot';
const nav=[
 {id:'overview' as Page,en:'Command center',ar:'مركز القيادة',Icon:LayoutDashboard},
 {id:'radar' as Page,en:'Opportunity radar',ar:'رادار الفرص',Icon:Target},
 {id:'campaigns' as Page,en:'Campaign intelligence',ar:'ذكاء الحملات',Icon:BarChart3},
 {id:'actions' as Page,en:'Action studio',ar:'استوديو الإجراءات',Icon:ShieldCheck},
 {id:'data' as Page,en:'Data lab',ar:'مختبر البيانات',Icon:Database},
 {id:'copilot' as Page,en:'Muse copilot',ar:'مساعد ميوز',Icon:Sparkles}
];
export const money=(n:number)=>'SAR '+n.toLocaleString('en-US',{maximumFractionDigits:0});
export const number=(n:number|null,unit='')=>n===null?'—':n.toLocaleString('en-US',{maximumFractionDigits:2})+unit;
export const arabicKind:Record<string,string>={STOCK_PROTECT:'خطر نفاد المخزون مع استمرار الإعلان',PAUSE_REVIEW:'مراجعة الإنفاق الإعلاني غير المجدي',SCALE_REVIEW:'فرصة نمو بوجود مخزون كافٍ',REPLENISH:'المخزون يقترب من حد إعادة الطلب'};
export const Risk=({a}:{a:Opportunity})=><span className={'risk '+a.severity}><i/>{a.severity.toUpperCase()}</span>;
export function App(){
 const [ar,setAr]=useState(false),[page,setPage]=useState<Page>('overview'),[mobile,setMobile]=useState(false),[market,setMarket]=useState<'All'|Market>('All');
 const [ads,setAds]=useState<Ad[]>([]),[stocks,setStocks]=useState<Stock[]>([]),[source,setSource]=useState<'synthetic'|'imported'>('synthetic'),[error,setError]=useState('');
 const [selected,setSelected]=useState<Opportunity|null>(null),[staged,setStaged]=useState<Record<string,boolean>>({});
 const [nativeNotices,setNativeNotices]=useState<string[]>([]);
 const [noonNotices,setNoonNotices]=useState<string[]>([]);
 const [question,setQuestion]=useState(''),[answer,setAnswer]=useState(''),[asking,setAsking]=useState(false),[metaMode,setMetaMode]=useState(false),[token,setToken]=useState('');
 const adsInput=useRef<HTMLInputElement>(null),stockInput=useRef<HTMLInputElement>(null);
 const t=(en:string,arabic:string)=>ar?arabic:en;
 async function loadDemo(){
  try{
   const [a,s]=await Promise.all([
    fetch('/demo/ads.csv').then(r=>{if(!r.ok)throw Error('Missing demo ads');return r.text();}),
    fetch('/demo/inventory.csv').then(r=>{if(!r.ok)throw Error('Missing inventory sample');return r.text();})
   ]);
   setAds(parseAds(a));setStocks(parseStock(s));setSource('synthetic');setStaged({});setNativeNotices([]);setNoonNotices([]);setError('');
  }catch(e){setError(e instanceof Error?e.message:String(e));}
 }
 useEffect(()=>{void loadDemo();},[]);
 useEffect(()=>{document.documentElement.dir=ar?'rtl':'ltr';document.documentElement.lang=ar?'ar':'en';},[ar]);
 const report=useMemo(()=>analyze(market==='All'?ads:ads.filter(x=>x.marketplace===market),market==='All'?stocks:stocks.filter(x=>x.marketplace===market)),[ads,stocks,market]);
 const opportunities=report.opportunities, approved=opportunities.filter(x=>staged[x.id]);
 const quality=useMemo(()=>auditReports(ads,stocks),[ads,stocks]);
 const current=nav.find(n=>n.id===page)!;
 const navigate=(where:Page)=>{setPage(where);setMobile(false);window.scrollTo({top:0,behavior:'smooth'});};
 async function upload(f:File|undefined,kind:'ads'|'stocks'){
  if(!f)return;
  try{
   if(f.size>600000)throw Error('CSV exceeds 600 KB limit');
   const csv=await f.text();
   if(kind==='ads'){
    const parsed=parseAds(csv);
    if(source==='synthetic')setStocks([]);
    setAds(parsed);
   }else{
    const parsed=parseStock(csv);
    if(source==='synthetic')setAds([]);
    setStocks(parsed);
   }
   setSource('imported');setStaged({});setError('');
  }catch(e){setError(e instanceof Error?e.message:String(e));}
 }
 async function importNativeAmazon(reportFile:File|undefined,costFile:File|undefined,vat:AmazonVatTreatment){
  try{
   if(!reportFile||!costFile)throw Error('Both the daily Amazon Ads CSV and SKU cost CSV are required.');
   if(reportFile.size>600000||costFile.size>600000)throw Error('CSV file exceeds 600 KB limit.');
   const [raw,cost]=await Promise.all([reportFile.text(),costFile.text()]);
   const converted=normalizeAmazonAdvertisedProducts(raw,cost,vat);
   setAds(old=>source==='synthetic'?converted.ads:[...old.filter(x=>x.marketplace!=='Amazon.sa'),...converted.ads]);
   if(source==='synthetic')setStocks([]);
   setSource('imported');setStaged({});setNativeNotices(converted.notices);
   setError('');
  }catch(e){setError(e instanceof Error?e.message:String(e));}
 }
 async function importNoonGuided(reportFile:File|undefined,costFile:File|undefined,mapping:NoonMapping,vat:AmazonVatTreatment,confirmed:boolean){
  try{
   if(!reportFile||!costFile)throw Error('Noon report and SKU cost file are both required.');
   if(reportFile.size>600000||costFile.size>600000)throw Error('CSV file exceeds 600 KB.');
   const [csv,costs]=await Promise.all([reportFile.text(),costFile.text()]);
   const normalized=normalizeNoonGuided(csv,costs,mapping,vat,confirmed);
   setAds(old=>source==='synthetic'?normalized.ads:[...old.filter(x=>x.marketplace!=='Noon.sa'),...normalized.ads]);
   if(source==='synthetic')setStocks([]);
   setSource('imported');setStaged({});setNoonNotices(normalized.notices);setError('');
  }catch(e){setError(e instanceof Error?e.message:String(e));}
 }
 function exportApproved(){
  if(!approved.length)return;
  const rows=approved.map(a=>({marketplace:a.marketplace,sku:a.sku,campaign:a.campaign,kind:a.kind,severity:a.severity,proposal:a.proposedAction,approval:'SELLER_STAGED_NOT_APPLIED',evidence:a.evidence.map(e=>e.metric+'='+e.value+' '+e.unit).join(' | ')}));
  const csv=toCsv(rows,['marketplace','sku','campaign','kind','severity','proposal','approval','evidence']);
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='sellerpilot-staged-proposals.csv';anchor.click();URL.revokeObjectURL(url);
 }
 function toggle(a:Opportunity){if(quality.blockers>0){setError('Resolve blocking data-quality issues before staging proposals.');return;}setStaged(prev=>({...prev,[a.id]:!prev[a.id]}));}
 async function ask(q=question){
  if(!q.trim())return;setQuestion(q);setAsking(true);setAnswer('');
  const priority=report.opportunities[0];
  const local=priority?(ar?
   'هذا تحليل حسابي دون استدعاء نموذج: الأولوية الآن هي '+arabicKind[priority.kind]+' للمنتج '+priority.sku+'. الإنفاق قيد المراجعة '+money(report.summary.spendUnderReviewSar)+'. راجع الأدلة قبل اتخاذ القرار، ولا تتم أي تغييرات تلقائية.':
   'Deterministic analysis (not Meta AI): The highest-priority issue is '+priority.kind.replaceAll('_',' ').toLowerCase()+' for SKU '+priority.sku+' on '+priority.marketplace+'. Flagged campaign spend is '+money(report.summary.spendUnderReviewSar)+'. Review verified evidence before staging changes. No campaigns were changed.') : t('Import reports first.','استورد التقارير أولاً.');
  if(!metaMode){setAnswer(local);setAsking(false);return;}
  if(source!=='synthetic'){setAnswer(t('Contributor mode uses synthetic data only. Restore demo to avoid submitting private reports to Meta.','وضع المساهم يقتصر على البيانات التجريبية. استعد العينة لتجنب إرسال تقاريرك الخاصة إلى ميتا.'));setAsking(false);return;}
  try{
   const r=await fetch('/api/agent',{method:'POST',headers:{'Content-Type':'application/json',...(token?{'Authorization':'Bearer '+token}:{})},body:JSON.stringify({question:q,locale:ar?'ar':'en',datasetConsent:'synthetic-only'})});
   const o=await r.json() as {answer?:string;error?:string;message?:string};
   if(!r.ok)throw Error(o.message||o.error||'Model unavailable');
   setAnswer(o.answer||'No answer available');
  }catch(e){setAnswer((e instanceof Error?e.message:String(e))+' — '+local);}
  finally{setAsking(false);}
 }
 const view:ViewProps={
  ar,t,report,market,quality,navigate,open:setSelected,approved,staged,toggle,exportApproved,
  ads,stocks,source,loadDemo,upload,adsInput,stockInput,importNativeAmazon,nativeNotices,importNoonGuided,noonNotices,
  question,setQuestion,answer,asking,metaMode,setMetaMode,token,setToken,ask
 };
 return <div className="app">
  <aside className={'sidebar '+(mobile?'open':'')}>
   <div className="brand"><div className="brand-mark"><Activity size={23}/></div><div><strong>SellerPilot <em>AI</em></strong><small>INTELLIGENCE, IN CONTROL.</small></div></div>
   <div className="nav-label">{t('WORKSPACE','مساحة العمل')}</div>
   <div className="account"><div className="account-mark">SC</div><span><strong>SMART CREATIONS</strong><small>Saudi Arabia · Seller view</small></span><ChevronRight size={15}/></div>
   <div className="nav-label">{t('NAVIGATE','التنقل')}</div>
   <nav>{nav.map(p=><button key={p.id} className={page===p.id?'active':''} onClick={()=>navigate(p.id)}><p.Icon size={18}/><span>{ar?p.ar:p.en}</span>{p.id==='radar'&&opportunities.length>0&&<b>{opportunities.length}</b>}</button>)}</nav>
   <div className="side-bottom"><div className="privacy"><ShieldCheck size={19}/><div><strong>{t('Seller-first by design','القرار بيد البائع')}</strong><small>{t('No autonomous campaign writes','بدون تعديلات آلية على الحملات')}</small></div></div><p><i className="green-dot"/>{t('SYNTHETIC SANDBOX','بيانات تجريبية')}<span>v0.1</span></p></div>
  </aside>
  {mobile&&<div className="scrim" onClick={()=>setMobile(false)}/>}
  <div className="app-main">
   <header className="topbar"><div><button className="mobile-menu" aria-label="Toggle navigation" onClick={()=>setMobile(true)}><Menu size={21}/></button><span>{t('Workspace','مساحة العمل')} / </span><strong>{ar?current.ar:current.en}</strong></div><div className="top-actions"><span className="environment"><i className="green-dot"/> {t('DEMO ENVIRONMENT','بيئة تجريبية')}</span><button className="language" onClick={()=>setAr(v=>!v)}><Globe size={17}/>{ar?'English':'العربية'}</button><span className="avatar">TN</span></div></header>
   <main className="content">
    <div className="page-heading"><div><span className="eyebrow"><Zap size={13}/>{t('YOUR MARKETPLACE OPERATIONS, DECODED','ذكاء عمليات الأسواق')}</span><h1>{page==='overview'?t('Your business. In focus.','أعمالك. تحت السيطرة.'):ar?current.ar:current.en}</h1><p>{t('Advertising and inventory intelligence, connected to better decisions.','رؤية واحدة تربط ذكاء الإعلانات والمخزون بقرارات أفضل.')}</p></div><div className="heading-actions"><select aria-label="Marketplace filter" value={market} onChange={e=>setMarket(e.target.value as typeof market)}><option value="All">{t('All marketplaces','جميع الأسواق')}</option><option value="Amazon.sa">Amazon.sa</option><option value="Noon.sa">Noon.sa</option></select><button className="primary" onClick={()=>navigate('data')}><CloudUpload size={17}/>{t('Import reports','استيراد التقارير')}</button></div></div>
    {error&&<div className="error"><TriangleAlert size={17}/>{error}<button onClick={()=>setError('')} aria-label="Dismiss"><X size={17}/></button></div>}
    {page==='overview'&&<Dashboard {...view}/>}
    {page==='radar'&&<Radar {...view}/>}
    {page==='campaigns'&&<Campaigns {...view}/>}
    {page==='actions'&&<Actions {...view}/>}
    {page==='data'&&<DataLab {...view}/>}
    {page==='copilot'&&<Copilot {...view}/>}
    <footer>SellerPilot AI · Geek Room Global AI Hackathon 2026 (adaptation in progress) <a href="https://github.com/tareq7/sellerpilot-geekroom-global-ai-2026" target="_blank" rel="noreferrer">GitHub</a><span><ShieldCheck size={15}/>{t('Synthetic data · Human-controlled decisions','بيانات اصطناعية · تحكم بشري')}</span></footer>
   </main>
  </div>
  {selected&&<DetailDrawer {...view} item={selected} close={()=>setSelected(null)}/>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
