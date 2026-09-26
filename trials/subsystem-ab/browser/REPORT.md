# Browser Admission Result

**Browser stage closed as BLOCKED on 2026-09-12: unresolved platform-policy gate,
not technical FAIL.** This offline continuation reuses the public evidence read
earlier today. No new vendor permission or superseding terms were supplied. The
user's authorization to finish without further CAD guidance is not a platform
waiver; no more design guidance is needed to finalize this admission state.

## Current Evidence

The [Onshape Terms of Use](https://www.onshape.com/en/legal/terms-of-use) read on
2026-09-12, effective July 15, 2020, state in section 4(b)(9):

> Use any robot, spider, scraper or other automated means to access the Service,
> or use any data mining, data gathering or extraction method;

The [API limits documentation](https://onshape-public.github.io/docs/auth/limits/)
read on the same date excludes Onshape browser-client calls from allocation and
separately allows responsible productivity applications using the API. That
guidance is not a browser-automation exception. This is the experiment's unresolved
service gate, not proof that a login, CAD operation or browser tool failed.

Historical totals remain **two official public pages in one fetch_webpage call**,
within the three-fetch cap. This continuation made **zero additional public
fetches**. No authenticated API or Onshape MCP calls, browser tool invocations,
UI actions, login actions or document creation occurred in this arm. No quota
counter was observed. Historical public-page fetches are network activity; zero
API calls does not mean zero network traffic.

[Admission JSON](admission.json) retains the exact excerpts, source URLs, locator,
check date, effective date and hash scope. The focused test emits validation.json
with SHA-256 hashes of the stored UTF-8 excerpts and local artifacts. The tool did
not expose raw HTTP bytes or origin response timestamps; no raw-page hash or
stronger freshness claim is invented.

## Tools And Dependencies

The prior agent's missing-loader observation is retained only as historical
context, not a current tool-availability claim or platform-policy blocker. The
parent has browser tools per the user; none was invoked or runtime-tested here.
Their availability cannot clear the policy gate. The user-reported open, unshared
page establishes neither authentication nor usable session access.

The browser stage is closed, not waiting for more CAD guidance. The parent reports
a shared v3 update; this continuation did not inspect it or any sibling API
implementation/results. Packet, prepared plate, allowance and independent-route
readiness remain unverified by this arm, not claims of missing parent work. No
credentials/session were inspected, no delegate or model fallback was used, no
CAD was rebuilt and no old 31-state sweep ran.

## Resolution And Handoff

The gate requires applicable written Onshape/PTC permission or authoritative
superseding terms explicitly resolving the normal-UI automation restriction for
the actual account and synthetic trial scope. The terms publish
onshape-compliance@ptc.com for agreement questions; no contact was made. User
consent, tool availability and API allocation guidance do not override this gate.
No workaround or extra UI work was performed.

Any later admitted execution remains subject to the protocol and
[the pilot procedure](PILOT.md), including verified packet/allowance evidence,
source-parameter UI editing and native unsuppressed parts/mates after resume.
Those requirements are not silently removed, and no future result is promised.

[Paired placeholders](paired-results.json) preserve null success rate, latency,
score, phase measurements and comparison metrics, not 0 or 100 percent. There is
**no measured browser latency or success rate, no API-arm result reported here,
and no valid A/B ranking**. API entries are UNVERIFIED placeholders because the
counterpart's results are parent-owned and unread; the parent owns consolidation.
Local admission test success and test duration are not CAD success or UI latency.

## Local Check

From the repository root:

```powershell
node --test trials/subsystem-ab/browser/admission.test.mjs
```

The test has no network/browser/API sender. It checks gate precedence, null-result
semantics, documented bounds, schema structure, source integrity and local links;
it writes only its validation.json receipt in this folder. Schema structure and
focused result assertions are checked without claiming a full JSON Schema engine.