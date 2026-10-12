import { Link } from 'react-router-dom';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { DfaCta, DfaIcon, DfaNote, DfaShell, type DfaGlyph } from '../../../foundation-authority/DfAuthority';
import { foundationOpsMenu } from './foundationOpsMenu';
import './foundationOperations.css';

const families: { id: string; name: string; count: number; icon: DfaGlyph; description: string }[] = [
  { id: '01', name: 'TRANSACTIONAL', count: 12, icon: 'document', description: 'Personal invitations, intake, quotes, payments, completion and records.' },
  { id: '02', name: 'OPERATIONAL', count: 3, icon: 'card', description: 'Client actions, approval requests and decision confirmations.' },
  { id: '03', name: 'MARKETING', count: 5, icon: 'user', description: 'Foundation credit, BLDR discovery and editorial journeys.' },
];

/** Founder communications command. Does not send or enable email. */
export default function CommunicationsCommandPage() {
  return (
    <DfaShell code="G01" kicker="COMMUNICATIONS" title={['COMMUNICATIONS COMMAND']}
      lede="TEMPLATES, SEND STATE, AND CLIENT MESSAGES IN ONE DESK." plate="g01" shard="g01" footCode="G01" authority="desktop"
      menu={foundationOpsMenu('communications')}>
      <div className="dfo dfo--comms">
        <div className="dfa-rows dfa-rows--cards dfo-comms-rows" aria-label="Digital Foundation email families">
          {families.map((f) => (
            <Link key={f.id} className="dfa-row dfa-row--divided" to={SITE00_ADMIN_ROUTES.emailPack} title={f.description}>
              <span className="dfa-row__icon"><DfaIcon name={f.icon} className="dfa-ico" /></span>
              <span className="dfa-row__main"><strong>{f.name}</strong></span>
              <span className="dfo-comms-state">{String(f.count).padStart(2, '0')} TEMPLATES · NOT SENDING</span>
              <span className="dfa-row__chev"><DfaIcon name="chevron" className="dfa-chev" /></span>
            </Link>
          ))}
        </div>
        <div className="dfo-cta">
          <DfaCta to={SITE00_ADMIN_ROUTES.emailPack}>OPEN TEMPLATE STUDIO</DfaCta>
        </div>
        <DfaNote>NO MESSAGE IS SENT FROM THIS DESK. DELIVERY STAYS DISABLED UNTIL SEPARATELY AUTHORIZED.</DfaNote>
      </div>
    </DfaShell>
  );
}
