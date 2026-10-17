import { Link } from 'react-router-dom';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { SITE00_ROUTES } from '../../../config/routes';
import './foundationOperations.css';

const families = [
  { id:'01',name:'TRANSACTIONAL',count:12,description:'PERSONAL INVITATIONS, INTAKE, QUOTES, PAYMENTS, COMPLETION AND RECORDS.' },
  { id:'02',name:'OPERATIONAL',count:3,description:'CLIENT ACTIONS, APPROVAL REQUESTS AND DECISION CONFIRMATIONS.' },
  { id:'03',name:'MARKETING',count:5,description:'FOUNDATION CREDIT, BLDR DISCOVERY AND EDITORIAL JOURNEYS.' },
];
/** Founder communications command. Does not send or enable email. */
export default function CommunicationsCommandPage() {
  return <main className="df-ops">
    <div className="df-ops__breadcrumb"><Link to={SITE00_ROUTES.digitalFoundationAdmin}>FOUNDATION / ADMIN</Link><span>/</span><span>COMMUNICATIONS</span></div>
    <header className="df-ops__hero"><div>
      <span className="df-ops__eyebrow">SITE 00 / DIGITAL FOUNDATION / CORRESPONDENCE</span>
      <h1>COMMUNICATIONS<br />COMMAND<span className="df-ops__red">.</span></h1>
      <p className="df-ops__lede">TWENTY CANONICAL EMAIL INTENTS ORGANIZED FOR CREATIVE REVIEW. TRANSACTIONAL AND MARKETING DELIVERY REMAIN DISABLED UNTIL SEPARATELY AUTHORIZED.</p>
    </div><div className="df-ops__progress"><span className="df-ops__eyebrow">EMAIL FAMILIES</span><strong>03</strong><span>20 REGISTERED TEMPLATE INTENTS</span></div></header>
    <section className="df-ops__family-grid" aria-label="Digital Foundation email families">
      {families.map(f => <article key={f.id}>
        <span className="df-ops__eyebrow">FAMILY / {f.id}</span><strong>{f.count.toString().padStart(2,'0')}</strong><h2>{f.name}</h2><p>{f.description}</p>
        <Link to={SITE00_ADMIN_ROUTES.emailPack}>REVIEW TEMPLATE LIBRARY ↗</Link>
      </article>)}
    </section>
    <section className="df-ops__attention">
      <span className="df-ops__eyebrow">DELIVERY AUTHORITY</span>
      <h2>PREVIEW FIRST. SEND LATER.</h2>
      <p>THE CORRESPONDENCE STUDIO IS A CREATIVE REVIEW WORKSPACE. OPENING A TEMPLATE DOES NOT SCHEDULE, ENABLE OR DISPATCH AN EMAIL.</p>
      <p>CANONICAL EVENT RULES: shared/site00-digital-foundation/communications/eventMap.ts</p>
    </section>
  </main>;
}
