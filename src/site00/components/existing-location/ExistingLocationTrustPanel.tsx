/** Public trust surface — no legal guarantees beyond stated practices. */
export function ExistingLocationTrustPanel() {
  return (
    <aside className="site00-existing-location-trust" aria-label="How SITE 00 handles access">
      <p className="site00-existing-location-trust__title">YOUR ACCESS, YOUR CONTROL</p>
      <ul className="site00-existing-location-trust__list">
        <li>WE DO NOT ASK FOR YOUR PRIMARY ACCOUNT PASSWORD.</li>
        <li>WE REQUEST ONLY THE ACCESS REQUIRED FOR THE AGREED SCOPE.</li>
        <li>WE DIAGNOSE BEFORE WE MODIFY PRODUCTION.</li>
        <li>WE DOCUMENT CHANGES AND TEST BEFORE DEPLOYMENT WHEN POSSIBLE.</li>
        <li>YOU APPROVE SCOPE AND PRICING BEFORE WORK PROCEEDS.</li>
        <li>YOU CAN REVOKE ACCESS WHEN THE WORK IS COMPLETE.</li>
      </ul>
    </aside>
  );
}
