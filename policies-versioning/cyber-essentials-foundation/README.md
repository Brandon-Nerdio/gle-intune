# Cyber Essentials — Foundation

Stage-first Cyber Essentials pack: compliance, CA Report-only, ASR Audit, Settings Catalog, update rings, BitLocker, and LAPS. Assign to a pilot ring before Hardening.

This pack is derived from `cyber-essentials/` with **new display names, GUIDs, and tags**.
The original `cyber-essentials` tree is unchanged. Pair with `cyber-essentials-hardening/`.

## Tags

Every policy is tagged with:

- `cyber-essentials-foundation`
- `ce-foundation`
- `cyber-essentials` / `ce`
- plus the Intune type tag (`compliance`, `settings-catalog`, `asr`, …)

Conditional Access:

- Foundation Report-only: `cyber-essentials-foundation-report-only-ca`
- Hardening Enforced: `cyber-essentials-hardening-enforced-ca`

## Nerdio repository path mapping

| Path | Nerdio content type |
|---|---|
| `/policies-versioning/cyber-essentials-foundation/compliance-policies` | Intune Compliance policy |
| `/policies-versioning/cyber-essentials-foundation/conditional-access` | Intune Conditional Access policy |
| `/policies-versioning/cyber-essentials-foundation/update-rings` | Intune Windows Update Rings Policies |
| `/policies-versioning/cyber-essentials-foundation/settings-catalog` | Intune Configuration profile |
| `/policies-versioning/cyber-essentials-foundation/endpoint-security/asr-rules` | Intune Attack surface reduction rules policies |
| `/policies-versioning/cyber-essentials-foundation/endpoint-security/account-protection` | Local admin password solution |
| `/policies-versioning/cyber-essentials-foundation/endpoint-security/bitlocker` | Intune BitLocker Policies |

Set **Intune Policies Versioning** on each row, file mask `.json`, branch `main`,
**Include subfolders** enabled. Do not map the pack root or `endpoint-security` parent.

## Naming

Display names use the `CE-F-` ID prefix and a `[Foundation]` marker so Foundation
and Hardening never collide with each other or with the original CE pack in Nerdio.
