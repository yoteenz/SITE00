# Founder next actions — staging live E2E

Plain English. Only steps that need you or Railway dashboard access.

## 1. Redeploy staging to the E2E branch (about 10 minutes)

In Railway project **SITE00**:

1. Open service **reliable-creation** (API). Set deploy branch to **`cursor/idnty-phase3b-automated-e2e-email-b71a`** and deploy commit **`e907a6331`** (PR **#1684**). Trigger **Deploy**.
2. Open service **carefree-luck** (SPA). Same branch and commit. Deploy.
3. When finished, open in a browser:  
   `https://reliable-creation-staging.up.railway.app/api/health`  
   Confirm `"gitCommit"` starts with **`e907a63`**.

Optional check from a machine with the repo:  
`node scripts/staging/df-staging-deployment-audit.mjs`  
Should exit **0** (deployment match + email journey route in SPA bundle).

## 2. Lock email safety (before any send)

On **API only** (`reliable-creation`):

- Set **`SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST`** to exactly:  
  `kateenaarmstrong@gmail.com`
- Keep **`SITE00_DF_TRANSACTIONAL_EMAIL_SEND`** at **`0`** until step 3.

Do not add Anthony or any client email to the allowlist for this test.

## 3. Run one automated journey

1. Set **`SITE00_DF_TRANSACTIONAL_EMAIL_SEND`** to **`1`** on the API.
2. Sign in to staging as founder admin:  
   https://carefree-luck-staging.up.railway.app
3. Go to:  
   **Admin → `/admin/site00/foundation-email-journey`**
4. Check the authorization box once → **Start automated journey**.
5. Watch run status and the email gallery. Check Gmail at **kateenaarmstrong@gmail.com** for **five** lifecycle messages in order.
6. Open the synthetic client portal from the run (Foundation link). Spot-check intake, quote, payment, completion, credit.

## 4. Turn sending off immediately after

Set **`SITE00_DF_TRANSACTIONAL_EMAIL_SEND`** back to **`0`**.  
Reload `/api/health` and confirm **`transactionalSendFlag`** is **false**.

## 5. Release judgment (Gates W and X)

Review email copy and visuals in the gallery and inbox. Decide whether Anthony’s invitation is allowed. The agent does **not** approve Gate W or X for you.

## What you do not need to do

- Merge PRs to **`main`** for this test (still prohibited until you approve release).
- Deploy to GoDaddy / production **`site00.com`**.
- Send Anthony an invitation until you approve after Gate W/X.

## If something fails

- Note the **run id**, failed **stage**, and error text from the journey desk.
- Disable send flag first.
- Share health JSON (`gitCommit`, `transactionalSendFlag`) with the next agent run.
