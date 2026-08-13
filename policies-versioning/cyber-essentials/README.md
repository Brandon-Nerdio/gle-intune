# Cyber Essentials

UK Cyber Essentials–aligned Intune / Entra policies.

## Nerdio repository path mapping

Nerdio classifies a policy by the repository path it is synced from, not by the
`templateReference` inside the JSON. Each row in **Link and Manage Repository** binds one
path to one content type, and paths must be unique — so every content type needs its own
row and its own folder.

| Path | Nerdio content type |
|---|---|
| `/policies-versioning/cyber-essentials/compliance-policies` | Intune Compliance policy |
| `/policies-versioning/cyber-essentials/conditional-access` | Intune Conditional Access policy |
| `/policies-versioning/cyber-essentials/device-configuration-policies` | Intune Device Configuration policy |
| `/policies-versioning/cyber-essentials/endpoint-security/windows-firewall` | Intune Windows firewall policies |
| `/policies-versioning/cyber-essentials/endpoint-security/defender-antivirus` | Intune Microsoft Defender antivirus policies |
| `/policies-versioning/cyber-essentials/endpoint-security/asr-rules` | Intune Attack surface reduction rules policies |
| `/policies-versioning/cyber-essentials/endpoint-security/laps` | Local admin password solution |
| `/policies-versioning/cyber-essentials/settings-catalog` | Intune Configuration profile |

Set **Intune Policies Versioning** on each row, with file mask `.json` and branch `main`.

### No matching content type

| Path | Contents | Note |
|---|---|---|
| `/policies-versioning/cyber-essentials/endpoint-security/disk-encryption` | CE-SC-005 BitLocker | The content-type list has no disk encryption / BitLocker entry. Map as Intune Configuration profile or import from Intune directly. |
| `/policies-versioning/cyber-essentials/update-policies` | Pilot and standard Windows Update rings | The content-type list has no update rings entry. |

## Contents by folder

| Folder | Contents |
|---|---|
| `compliance-policies` | Antivirus/firewall, password, minimum OS |
| `conditional-access` | MFA, legacy auth block, compliant / Entra-joined device gates |
| `device-configuration-policies` | Password policy (legacy device config) |
| `endpoint-security/windows-firewall` | CE-FW-001 firewall enforcement, CE-FW-002 inbound RDP block |
| `endpoint-security/defender-antivirus` | CE-MP-001 Defender AV baseline |
| `endpoint-security/asr-rules` | CE-MP-002 ASR audit and block modes |
| `endpoint-security/laps` | CE-SC-004 local admin restriction |
| `endpoint-security/disk-encryption` | CE-SC-005 BitLocker enforcement |
| `settings-catalog` | Network protection, WHfB, local hardening, AutoRun, screen lock |
| `update-policies` | Pilot and standard Windows Update rings |

Naming uses the `CE-*-###` IDs from the source pack (for example `CE-FW-001`, `CE-MP-002`).
