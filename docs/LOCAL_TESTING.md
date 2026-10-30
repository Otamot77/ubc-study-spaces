# Local two-device QA: Study Spaces Finder

**Purpose:** Verify real browser interactions over the laptop's LAN, without hosting or using paid services. Automated simulations cannot prove touch, Wi-Fi, focus, or map behavior on two physical phones.

## Automated test (runs entirely on laptop)

PowerShell:

```powershell
cd C:\Users\andre\ubc-study-spaces
git pull origin main
cd server
npm test
npm run test:devices
```

`test:devices` creates its own **in-memory SQLite database**, opens an ephemeral loopback API, simulates two separate browser reporter IDs sharing one IP address, and exercises report submission, tie behavior, correction, undo, cooldown and catalogue reads. Your actual `server/data/study-spaces.sqlite` is **never modified by this script**. CI also runs these tests after each backend change.

## Physical phone test (requires your devices)

1. Connect **both phones and your Windows laptop to the same Wi-Fi**. Disable cellular VPNs or network isolation that could prevent access to the laptop's LAN IP.
2. Open terminal A:
   ```powershell
   cd C:\Users\andre\ubc-study-spaces\server
   npm run dev
   ```
3. Open terminal B:
   ```powershell
   cd C:\Users\andre\ubc-study-spaces\web
   npm run dev -- --host 0.0.0.0
   ```
4. On **both phones**, open the **same Vite Network URL** displayed in terminal B (for example `http://192.168.x.x:5173`). Do **not** use localhost on the phones. If a phone cannot connect, check Windows Defender Firewall for the Node/Vite private-network permission.
5. In **Explore List**, search `koerner` or `Xwi7xwa` and try each status chip. Verify a filter with no matches shows **Clear filters**. Switching to Map should still show the full campus, not just the filtered list.
6. On phone A, use **Report → Koerner Library → Plenty of seats**. Watch phone B; its list should refresh within **30 seconds** and show **1 recent report** (unless an old report already exists).
7. On phone B, report **Almost full** at Koerner within 30 seconds of phone A's report. Both should be allowed through the same Vite proxy. After refresh, the mixed 1–1 vote should display **Unknown**, not a fabricated winner.
8. On phone A, tap **Almost full** to correct the first vote **within two minutes**. Phone B should show **2 reports, Almost full** after refreshing.
9. On phone B, tap its selected **Almost full** again within two minutes. Its vote should be revoked: phone A should show **1 report** after refreshing.
10. Tap **Report** again on phone A and immediately submit a second new Koerner report: it should receive a cooldown message. Corrections within the existing open sheet are exempt from the new-report cooldown.
11. Disconnect phone B from Wi-Fi. Verify offline loading/error feedback rather than a fake occupancy update. Reconnect, hit **Retry** (if shown) or refresh, and confirm the latest state is fetched.
12. Test map panning, selecting pins, centring on a manually chosen starting point, and search/filters on narrow mobile screens. Browser GPS over the laptop's HTTP LAN address usually cannot run until you provide an HTTPS local environment.

## Avoid misleading test data

Your **manual phone reports do go into the laptop's real SQLite database** (unlike `npm run test:devices`) and remain for 45 minutes in the crowd estimate. If you want a clean manual QA database without deleting real reports, stop the server and use a separate path for the manual test:

```powershell
$env:STUDY_SPACES_DB_PATH = "$PWD\data\local-qa.sqlite"
npm run dev
```

Run that while your current directory is `server`. This creates an isolated, gitignored file in `server/data/`. Restart without the environment variable to return to your normal data. Always stop the existing backend before changing the database path; only one API should listen on port 8787.

## Expected and unresolved limits

- The per-browser-session reporter identifier avoids the false collision caused by Vite's shared proxy IP. It does **not** prevent forged IDs or prove two reports come from separate people.
- The network-wide 60 reports/hour cap may still trigger during large shared-IP tests. No accounts, GPS validation, or attendance verification exist.
- Confidence is based on agreement and report count, not a verified statistical accuracy model. A 3–2–2 plurality shows **Unknown** because fewer than half agree.
- Without any recent reports, statuses are **Unknown**. The app never seeds fake seat counts.
- There is no public deployment or paid account required for this checklist.

Record the phones/OS/browser, date, steps that passed, and any screenshots or issues in a local note or GitHub issue. **Mark physical device testing as passed only once actually run.**
