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
| `/policies-versioning/cyber-essentials/update-rings` | Intune Windows Update Rings Policies |
| `/policies-versioning/cyber-essentials/endpoint-security/windows-firewall` | Intune Windows firewall policies |
| `/policies-versioning/cyber-essentials/endpoint-security/firewall-rules` | Intune Windows Firewall Rules Policies |
| `/policies-versioning/cyber-essentials/endpoint-security/asr-rules` | Intune Attack surface reduction rules policies |
| `/policies-versioning/cyber-essentials/endpoint-security/account-protection` | Local admin password solution |
| `/policies-versioning/cyber-essentials/endpoint-security/bitlocker` | Intune BitLocker Policies |
| `/policies-versioning/cyber-essentials/settings-catalog` | Intune Configuration profile |

Set **Intune Policies Versioning** on each row, with file mask `.json`, branch `main`,
and **Include subfolders** enabled. Do not map the Cyber Essentials root or the
`endpoint-security` parent: those paths contain multiple incompatible policy types.

### Conditional Access variants

Each of the eight Conditional Access controls has two separate policy definitions in the
same folder:

- `[Report-only]` uses `enabledForReportingButNotEnforced` and the
  `cyber-essentials-report-only-ca` tag.
- `[Enforced]` uses `enabled` and the `cyber-essentials-enforced-ca` tag.

The counterparts have matching conditions but distinct titles and tags. Entra's
Conditional Access API does not accept a `description` property, so the long-form
difference text lives in `policy.metadata.json` only. Validate Report-only first, then
replace it with Enforced; never assign both variants of one control to the same target.

### Update rings

The two Windows Update rings use the `windowsUpdateForBusinessConfiguration` schema and
sync through their own row mapped as **Intune Windows Update Rings Policies**.

**CE-FW-001 vs CE-FW-002:** the JSON templates differ — CE-FW-001 is the *Windows
Firewall* config profile (**Intune Windows firewall policies**) while CE-FW-002 is a
*Windows Firewall Rules* profile (**Intune Windows Firewall Rules Policies**). They are
separate Nerdio content types, so they live in separate folders.

**CE-MP-001 Defender Antivirus baseline** uses the endpoint-security *Microsoft Defender
Antivirus* template, but Nerdio's content-type list has no general Defender Antivirus
policy (only Exclusions, Update Controls, and Security Experience). It is therefore stored
under `settings-catalog` and synced as **Intune Configuration profile**, which imports the
underlying settings-catalog payload reliably.

**CE-UAC-001 Password policy enforcement** was originally a legacy
`windows10GeneralConfiguration` device-configuration template. Windows 11 rejects that
template's DeviceLock CSPs with `0x82aa0002`, so at pack version `1.1.0` it was rebuilt as a
Settings Catalog policy and moved into `settings-catalog`. The
`device-configuration-policies` folder is now empty and its Link and Manage Repository row
has been removed — re-add it only if a genuine legacy device-configuration profile is
introduced.

**DeviceLock ownership.** `CE-UAC-001` and `CE-SC-003` both write to the Windows DeviceLock
CSP, so child nodes are split between them: `CE-UAC-001` owns password composition
(`AllowSimpleDevicePassword`, `AlphanumericDevicePasswordRequired`,
`MinDevicePasswordLength`, `DevicePasswordHistory`, `DevicePasswordExpiration`) and
`CE-SC-003` owns the locking controls (`MaxInactivityTimeDeviceLock`,
`MaxDevicePasswordFailedAttempts`). Both must keep sending the same value for the shared
`DevicePasswordEnabled` parent. Do not move a setting between these two policies — matching
values are tolerated, differing values put both profiles into a conflict error state.

## Contents by folder

| Folder | Contents |
|---|---|
| `compliance-policies` | Antivirus/firewall, password, minimum OS |
| `conditional-access` | 8 CA controls, each with Report-only and Enforced variants (16 policies) |
| `update-rings` | CE-PM-001 pilot and CE-PM-002 standard Windows Update rings |
| `endpoint-security/windows-firewall` | CE-FW-001 firewall enforcement (Windows Firewall config) |
| `endpoint-security/firewall-rules` | CE-FW-002 inbound RDP block (Windows Firewall Rules) |
| `endpoint-security/asr-rules` | CE-MP-002 ASR audit and block modes |
| `endpoint-security/account-protection` | CE-SC-004 local admin restriction (LAPS) |
| `endpoint-security/bitlocker` | CE-SC-005 BitLocker enforcement |
| `settings-catalog` | CE-MP-001 Defender AV baseline, network protection, WHfB, local hardening, AutoRun, screen lock, password policy |

Naming uses the `CE-*-###` IDs from the source pack (for example `CE-FW-001`, `CE-MP-002`).
