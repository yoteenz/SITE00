import { Link } from 'react-router-dom';
import { AsstsVaultSubpageShell } from '../components/AsstsVaultSubpageShell';

export default function AsstsProfilePage() {
  return (
    <AsstsVaultSubpageShell title="PROFILE." tagline="VAULT ACCESS & SITE CONTROLS.">
      <div className="assts-vault-subpage__panel assts-glass assts-glass--panel">
        <p className="assts-vault-subpage__panel-label site00-label-red">ADMIN ACCESS</p>
        <p className="assts-vault-subpage__panel-copy">Signed in with admin credentials for Asset Vault review.</p>
      </div>

      <nav className="assts-vault-subpage__links" aria-label="Profile actions">
        <Link to="/assts/loader-pipeline" className="assts-vault-subpage__link">
          Loader pipeline
        </Link>
        <Link to="/assts/composition-studio" className="assts-vault-subpage__link">
          Composition studio
        </Link>
        <Link to="/admin" className="assts-vault-subpage__link">
          Frontal Slayer admin
        </Link>
        <Link to="/origin" className="assts-vault-subpage__link assts-vault-subpage__link--secondary">
          Exit Site 00 → Origin
        </Link>
      </nav>
    </AsstsVaultSubpageShell>
  );
}
