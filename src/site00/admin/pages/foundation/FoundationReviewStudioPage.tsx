import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import './foundationReviewStudio.css';

type Entry = { id:string; family:string; title:string; note:string; status:'LIVE DATA'|'REQUIRES PROJECT'|'REQUIRES CLIENT TOKEN'; path:(id:string,token:string)=>string|null };
const entries:Entry[] = [
  {id:'P13',family:'FOUNDER OPERATIONS',title:'PROJECT PIPELINE',note:'SEARCH, ATTENTION FILTER, AND ACTIVE PROJECT LINKS.',status:'LIVE DATA',path:()=>SITE00_ROUTES.digitalFoundationPipeline},
  {id:'P14',family:'FOUNDER OPERATIONS',title:'PROJECT COMMAND',note:'PROJECT STAGES, OWNERSHIP, VERIFICATION AND NEXT ACTIONS.',status:'REQUIRES PROJECT',path:(id)=>id?SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id',encodeURIComponent(id)):null},
  {id:'P15',family:'FOUNDER OPERATIONS',title:'EXECUTION WORKBENCH',note:'LIVE TASK QUEUES, EXECUTION MODES AND INSPECTOR.',status:'REQUIRES PROJECT',path:(id)=>id?SITE00_ROUTES.digitalFoundationWorkbench.replace(':id',encodeURIComponent(id)):null},
  {id:'G01',family:'COMMUNICATIONS',title:'COMMUNICATIONS COMMAND',note:'TWENTY EMAIL INTENTS IN THREE FAMILIES. NO SENDING.',status:'LIVE DATA',path:()=>SITE00_ROUTES.digitalFoundationCommunications},
  {id:'C01',family:'CLIENT EXPERIENCE',title:'FOUNDATION COMPLETE',note:'COMPLETION RECORD WITH VERIFIED OWNERSHIP DETAILS.',status:'REQUIRES CLIENT TOKEN',path:(_id,token)=>token?`/foundation/${encodeURIComponent(token)}`:null},
  {id:'C02',family:'CLIENT EXPERIENCE',title:'DIGITAL LOCATION',note:'NEXT-STEP CONCEPT AND EXPLORE ACTION AFTER COMPLETION.',status:'REQUIRES CLIENT TOKEN',path:(_id,token)=>token?`/foundation/${encodeURIComponent(token)}`:null},
  {id:'F01',family:'CLIENT EXPERIENCE',title:'FOUNDATION CREDIT',note:'CREDIT ONLY WHEN A VERIFIED AVAILABLE RECORD EXISTS.',status:'REQUIRES CLIENT TOKEN',path:(_id,token)=>token?`/foundation/${encodeURIComponent(token)}`:null},
  {id:'F02',family:'CLIENT EXPERIENCE',title:'BLDR INTRODUCTION',note:'THE OPTIONAL NEXT-LOCATION EXPLORATION.',status:'REQUIRES CLIENT TOKEN',path:(_id,token)=>token?`/foundation/${encodeURIComponent(token)}`:null},
];
export default function FoundationReviewStudioPage(){
  const [active,setActive]=useState('P13');
  const [device,setDevice]=useState<'MOBILE'|'TABLET'|'DESKTOP'>('DESKTOP');
  const [projectId,setProjectId]=useState('');
  const [clientToken,setClientToken]=useState('');
  const entry=entries.find(e=>e.id===active)??entries[0];
  const path=useMemo(()=>entry.path(projectId.trim(),clientToken.trim()),[entry,projectId,clientToken]);
  const width={MOBILE:390,TABLET:768,DESKTOP:1280}[device];
  return <main className="df-review">
    <header className="df-review__top"><div><strong>SITE 00</strong><span>DIGITAL FOUNDATION / VISUAL REVIEW</span></div><span>FOUNDER ONLY · REVIEW BRANCH · NOT PUBLISHED</span></header>
    <section className="df-review__header"><div><span className="df-review__kicker">ARTIFACT / IMPLEMENTATION REVIEW / V1</span><h1>FOUNDATION<br/>SCREEN INDEX<span>.</span></h1><p>ONE PLACE TO INSPECT THE IMPLEMENTED SCREENS. LIVE DATA IS SHOWN WHERE AVAILABLE; UNAVAILABLE CONTEXT IS NEVER SIMULATED AS A SUCCESSFUL CLIENT STATE.</p></div><div className="df-review__count"><strong>08</strong><span>REVIEW ENTRIES / 05 SURFACES</span></div></section>
    <div className="df-review__shell">
      <aside className="df-review__nav"><div className="df-review__aside-label">SCREEN FAMILY / SELECT TO REVIEW</div>{['FOUNDER OPERATIONS','COMMUNICATIONS','CLIENT EXPERIENCE'].map(f=><section key={f}><h2>{f}</h2>{entries.filter(e=>e.family===f).map(e=><button type="button" className={active===e.id?'is-active':''} key={e.id} onClick={()=>setActive(e.id)} aria-pressed={active===e.id}><small>{e.id}</small><span>{e.title}</span><b>↗</b></button>)}</section>)}</aside>
      <section className="df-review__main"><div className="df-review__controls"><div><strong>{entry.id} / {entry.title}</strong><p>{entry.note}</p></div><div className="df-review__devices">{(['MOBILE','TABLET','DESKTOP'] as const).map(d=><button type="button" key={d} aria-pressed={device===d} onClick={()=>setDevice(d)} className={device===d?'is-active':''}>{d}</button>)}</div></div>
        {entry.status==='REQUIRES PROJECT'&&<label className="df-review__context">PROJECT ARTIFACT ID <input value={projectId} onChange={e=>setProjectId(e.target.value)} placeholder="PASTE A VERIFIED PROJECT ID" autoComplete="off"/></label>}
        {entry.status==='REQUIRES CLIENT TOKEN'&&<div className="df-review__token"><label className="df-review__context">PERSONALIZED CLIENT TOKEN <input type="password" value={clientToken} onChange={e=>setClientToken(e.target.value)} placeholder="ENTER A SAFE REVIEW TOKEN" autoComplete="off"/></label><p>USE A DISPOSABLE REVIEW ARTIFACT. THIS PREVIEW DOES NOT GENERATE A COMPLETED CLIENT STATE AND DOES NOT STORE THE TOKEN. OPENING THE REAL CLIENT ROUTE MAY DISPLAY EARLIER STAGES IF COMPLETION IS NOT VERIFIED.</p></div>}
        <div className="df-review__viewport" data-device={device}><div className="df-review__frame" style={{width:`min(100%, ${width}px)`}}>
          {path?<iframe key={path} title={`${entry.title} ${device} preview`} src={path} />:<div className="df-review__placeholder"><span>REVIEW CONTEXT REQUIRED</span><h2>CONNECT A REAL ARTIFACT.</h2><p>ENTER THE REQUIRED IDENTIFIER ABOVE TO PREVIEW THIS SCREEN WITH ITS REAL DATA CONTRACT.</p></div>}
        </div></div>
        <div className="df-review__bottom"><span>VIEWPORT / {width}px · LIVE REACT ROUTE · NOT A STATIC SCREENSHOT</span>{path&&<a href={path} target="_blank" rel="noopener noreferrer">OPEN ACTUAL ROUTE ↗</a>}</div>
      </section>
    </div><footer className="df-review__footer"><Link to={SITE00_ROUTES.digitalFoundationAdmin}>← RETURN TO DIGITAL FOUNDATION ADMIN</Link><span>REVIEW ONLY / NO APPROVAL OR DEPLOYMENT IMPLIED</span></footer>
  </main>;
}
