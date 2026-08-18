# Cyber Essentials — Hardening

Stage-second Cyber Essentials pack: CA Enforced, ASR Block, and Windows Firewall. Assign only after Foundation is green on the pilot ring. Never dual-assign Report-only and Enforced (or ASR Audit and Block) to the same targets.

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
| `/policies-versioning/cyber-essentials-hardening/conditional-access` | Intune Conditional Access policy |
| `/policies-versioning/cyber-essentials-hardening/endpoint-security/asr-rules` | Intune Attack surface reduction rules policies |
| `/policies-versioning/cyber-essentials-hardening/endpoint-security/windows-firewall` | Intune Windows firewall policies |
| `/policies-versioning/cyber-essentials-hardening/endpoint-security/firewall-rules` | Intune Windows Firewall Rules Policies |

Set **Intune Policies Versioning** on each row, file mask `.json`, branch `main`,
**Include subfolders** enabled. Do not map the pack root or `endpoint-security` parent.

## Naming

Display names use the `CE-H-` ID prefix and a `[Hardening]` marker so Foundation
and Hardening never collide with each other or with the original CE pack in Nerdio.
