# Local Onshape access

The original PoCs use API requests. Only the scoped browser-checkpoint trial below
uses browser automation. Never paste API keys, passwords, cookies, or tokens into
chat. Do not send credentials to a third-party hosted MCP server. This repository's
`.env.local` is ignored by Git, but is plaintext on disk.

1. In your Onshape account settings, open **Developer** and create a temporary API
   key with the read/write permissions needed for documents and modeling. Avoid
   delete/share permissions where your account offers that choice.
2. Enter the access key and secret directly in the existing `.env.local` file in
   your editor. Set `ONSHAPE_BASE_URL` to the stack on which you created the key.
   The default is `https://cad.onshape.com`.
3. Tell the assistant only **credentials ready**. It must check presence without
   displaying the file, headers, environment values, or secret-bearing errors.
4. Live trials are authorized only in newly created, clearly named PoC documents.
   They must never mutate your existing robot documents, publish documents, change
   sharing, or delete anything. The key itself may have wider permissions than
   these application-level restrictions: use a dedicated test account if needed.
5. Revoke the temporary key after the experiment. Review document visibility:
   Onshape Free/education/paid plan capabilities and policies differ. If the API
   refuses a private document, stop and ask before creating a public one.

## Current Trial Authorization

Both initial private creation attempts returned HTTP 409 for Free account
entitlement. On 2026-09-11 the user explicitly authorized **new public documents
containing only the synthetic intake**. Subsequent runners must require explicit
public confirmation and verify visibility; this is not an automatic fallback.
Existing robot CAD must not be read, modified, or uploaded. The earlier private
failures remain part of the evidence.

## Key Revocation Required

The final security scan found the configured credentials in `.env.example` as
well as the intended ignored `.env.local`. The example was restored to blank
placeholders. A repeat in-memory scan of 199 candidate repository files reported
zero matches, with `.env.local` excluded; no commit or push was made.

During cleanup the editor patch tool echoed the previous template values in its
response. Treat that temporary key as exposed and **revoke it now in Onshape's
Developer settings**. Do not paste a replacement into chat or the example file.
The completed CAD artifacts need no further API access. The official hosted MCP
uses separate client-managed OAuth; do not send this API key to its endpoint.

## Explicit Current-Key Authorization (2026-09-11)

After the exposure warning, the user explicitly instructed: "use the api key in
the .env.local all good. continue!" This authorizes the current local key for the
unfinished bounded API trials despite the prior rotation gate. It does not prove
revocation or replacement. Do not label the key rotated or pass a false rotation
attestation. Record explicit current-key authorization separately in the runner.
Rotation remains recommended; no credential values may be displayed or saved.

The existing public synthetic-document scope, trial-owned provenance, no deletion
or sharing, exact HTTPS origin, preflight, concurrency and persistent request caps
remain unchanged. Load the key only in memory after these gates pass. The official
MCP continues using its separate OAuth connection, never this API key.

Signatures and exports can require stack-specific handling. A browser login alone
does not authenticate these API runners. API access availability depends on your
account/organization settings. If Developer settings are missing, consult your
administrator rather than providing your password.

## Browser Checkpoint Access

The [local-first browser exception](../benchmark/PROTOCOL.md#local-first-browser-exception-2026-09-11)
permits only bounded normal-UI submission/verification in the new trial. It does
not open a browser fallback for the other API trials or start a live run itself.
Use a confirmed Onshape browser session; the API-key steps above are unnecessary
for this route. The user performs any login/MFA directly. Never inspect credentials,
cookies, or browser storage, persist login state in artifacts, or replay private
HTTP endpoints using session authentication. The same new-synthetic-document and
explicit-visibility restrictions apply. Stop on access or automation restrictions.

Sources checked 2026-09-11:
- https://onshape-public.github.io/docs/auth/apikeys/
- https://cad.onshape.com/help/Content/Plans/developer-myaccount.htm
