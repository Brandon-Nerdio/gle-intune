# Cyber Essentials — Hardening

Complete Cyber Essentials baseline tuned for the **Hardening** (enforcing) stage: every control is present, with Conditional Access Enforced and ASR in Block mode. Assign only after the Foundation pack is validated. Never assign Foundation and Hardening to the same targets at the same time.

This pack is derived from `cyber-essentials/` with **new display names, GUIDs, and tags**.
The original `cyber-essentials` tree is unchanged. Pair with `cyber-essentials-foundation/`.

## Tags

Every policy is tagged with:

- `cyber-essentials-hardening`
- `ce-hardening`
- `cyber-essentials` / `ce`
- plus the Intune type tag (`compliance`, `settings-catalog`, `asr`, …)

Conditional Access:

- Foundation Report-only: `cyber-essentials-foundation-report-only-ca`
- Hardening Enforced: `cyber-essentials-hardening-enforced-ca`

## Nerdio repository path mapping

| Path | Nerdio content type |
|---|---|
| `/policies-versioning/cyber-essentials-hardening/compliance-policies` | Intune Compliance policy |
| `/policies-versioning/cyber-essentials-hardening/conditional-access` | Intune Conditional Access policy |
| `/policies-versioning/cyber-essentials-hardening/update-rings` | Intune Windows Update Rings Policies |
| `/policies-versioning/cyber-essentials-hardening/settings-catalog` | Intune Configuration profile |
| `/policies-versioning/cyber-essentials-hardening/endpoint-security/asr-rules` | Intune Attack surface reduction rules policies |
| `/policies-versioning/cyber-essentials-hardening/endpoint-security/account-protection` | Local admin password solution |
| `/policies-versioning/cyber-essentials-hardening/endpoint-security/bitlocker` | Intune BitLocker Policies |
| `/policies-versioning/cyber-essentials-hardening/endpoint-security/windows-firewall` | Intune Windows firewall policies |
| `/policies-versioning/cyber-essentials-hardening/endpoint-security/firewall-rules` | Intune Windows Firewall Rules Policies |

Set **Intune Policies Versioning** on each row, file mask `.json`, branch `main`,
**Include subfolders** enabled. Do not map the pack root or `endpoint-security` parent.

## Naming

Display names use the `CE-H-` ID prefix and a `[Hardening]` marker so Foundation
and Hardening never collide with each other or with the original CE pack in Nerdio.
