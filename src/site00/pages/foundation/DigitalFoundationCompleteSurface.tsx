/** Digital Foundation completion and next-location experience. Client-owned verified records only. */
import { useState } from 'react';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import '../../styles/site00-digital-foundation.css';
import './digitalFoundationCompletion.css';

const money = (minor:number,currency:string) => new Intl.NumberFormat('en-US',{style:'currency',currency}).format(minor/100);
async function captureBuildInterest(token:string,interest:'INTERESTED'|'SAVED_FOR_LATER'){
  const res=await fetch('/api/site00/digital-foundation-artifact?action=build-interest',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,interest})
  });
  if(!res.ok)throw new Error('Request failed');
}
export default function DigitalFoundationCompleteSurface({token,payload,reload}:{token:string;payload:ClientDigitalFoundationPayload;reload:()=>Promise<unknown>}) {
  const [busy,setBusy]=useState<'INTERESTED'|'SAVED_FOR_LATER'|null>(null);
  const [error,setError]=useState<string|null>(null);
  const complete=payload.artifact.completion_state==='COMPLETE';
  const ownership=payload.ownership_record;
  const credit=payload.credit?.status==='AVAILABLE'?payload.credit:null;
  const interest=async (choice:'INTERESTED'|'SAVED_FOR_LATER')=>{
    setBusy(choice);setError(null);
    try{await captureBuildInterest(token,choice);await reload();}
    catch{setError('WE COULD NOT SAVE YOUR SELECTION. PLEASE TRY AGAIN.');}
    finally{setBusy(null);}
  };
  return <main className="df-finish">
    <div className="df-finish__masthead"><span>SITE 00 / IDNTY</span><span>YOUR DIGITAL FOUNDATION</span></div>
    {!complete ? <section className="df-finish__unavailable"><span className="df-finish__kicker">FOUNDATION / STATUS</span><h1>YOUR FOUNDATION IS IN PROGRESS.</h1><p>THE COMPLETION RECORD WILL APPEAR HERE AFTER SITE 00 HAS VERIFIED YOUR SETUP.</p></section> : <>
      <section className="df-finish__cover" aria-labelledby="df-finish-title">
        <span className="df-finish__kicker">01 / COMPLETION RECORD</span>
        <span className="df-finish__seal" aria-hidden="true">00</span>
        <h1 id="df-finish-title">THE GROUNDWORK<br/><em>IS DONE.</em></h1>
        <p>YOUR DIGITAL FOUNDATION HAS REACHED ITS VERIFIED COMPLETION STAGE. HERE'S WHAT'S ON RECORD — AND WHAT YOU CAN EXPLORE NEXT.</p>
        <div className="df-finish__architecture" aria-hidden="true"><span className="df-finish__architecture-line"/><span className="df-finish__architecture-slab"/></div>
      </section>
      <section className="df-finish__records" aria-label="Verified ownership record">
        <div className="df-finish__sectionhead"><span>02 / THE RECORD</span><h2>ESTABLISHED.<br/>DOCUMENTED.</h2></div>
        {ownership ? <div className="df-finish__recordgrid">
          {ownership.domain && <article><span>01</span><strong>YOUR DOMAIN</strong><p>DOMAIN DETAILS ARE INCLUDED IN YOUR OWNERSHIP RECORD.</p></article>}
          {ownership.primary_mailbox && <article><span>02</span><strong>PROFESSIONAL EMAIL</strong><p>YOUR PRIMARY MAILBOX IS RECORDED.</p></article>}
          {ownership.dns_status && <article><span>03</span><strong>DNS CONFIGURATION</strong><p>{String(ownership.dns_status).replace(/_/g,' ').toUpperCase()}</p></article>}
          {ownership.security_status && <article><span>04</span><strong>EMAIL SECURITY</strong><p>{String(ownership.security_status).replace(/_/g,' ').toUpperCase()}</p></article>}
        </div>:<p className="df-finish__subtle">YOUR VERIFIED OWNERSHIP DETAILS WILL APPEAR WHEN THE RECORD IS AVAILABLE.</p>}
      </section>
      {credit && <section className="df-finish__credit" aria-label="Foundation credit">
        <span className="df-finish__kicker">03 / AN OPPORTUNITY</span><div><h2>A HEAD START<br/>ON WHAT'S NEXT.</h2><strong>{money(credit.amount_minor,credit.currency)}</strong></div>
        <p>YOUR FOUNDATION CREDIT IS AVAILABLE FOR A QUALIFYING SITE 00 BUILD UNTIL {new Date(credit.expires_at).toLocaleDateString('en-US').toUpperCase()}. YOUR PROJECT RECORD PROVIDES THE TERMS.</p>
      </section>}
      <section className="df-finish__location" aria-labelledby="df-finish-location">
        <span className="df-finish__kicker">{credit?'04':'03'} / THE NEXT CHAPTER</span>
        <h2 id="df-finish-location">YOU HAVE THE ADDRESS.<br/><em>NOW IMAGINE THE PLACE.</em></h2>
        <p>THE FOUNDATION CREATES A STARTING POINT. THE NEXT OPTIONAL STEP IS DECIDING WHAT PEOPLE WILL EXPERIENCE WHEN THEY ARRIVE AT YOUR DOMAIN.</p>
        {payload.build_readiness?.site_needed && <p className="df-finish__recommendation">YOUR CURRENT BUILD RECOMMENDATION: {payload.artifact.build_recommendation.replace(/_/g,' ').toUpperCase()}</p>}
        <div className="df-finish__location-diagram" aria-label="Concept illustration of a digital location, not a proposed final design">
          <span>CONCEPT STUDY / NOT A CLIENT DESIGN PROPOSAL</span><div className="df-finish__location-form" aria-hidden="true"><i/><i/><i/></div><small>DISCOVER / DESIGN / BUILD</small>
        </div>
        {error && <p role="alert" className="df-finish__error">{error}</p>}
        <div className="df-finish__actions">
          <button type="button" disabled={busy!==null} onClick={()=>interest('INTERESTED')}>{busy==='INTERESTED'?'SAVING…':'EXPLORE MY DIGITAL LOCATION ↗'}</button>
          <button type="button" disabled={busy!==null} onClick={()=>interest('SAVED_FOR_LATER')}>{busy==='SAVED_FOR_LATER'?'SAVING…':'SAVE FOR LATER'}</button>
        </div>
        <p className="df-finish__subtle">EXPLORING A DIGITAL LOCATION DOES NOT PLACE AN ORDER OR MAKE A BOOKING.</p>
      </section>
    </>}
    <footer className="df-finish__footer">SITE 00 / IDNTY · BRANDS BUILT FOR WHAT'S NEXT.</footer>
  </main>;
}
