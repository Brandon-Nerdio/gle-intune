# gle-intune

Intune policy definitions for **Nerdio Manager for MSP** GitHub sync, organized by **security framework** first, then by Intune policy type.

## Layout

```
policies-versioning/
  <framework>/
    <intune-type>/
      <Policy Display Name>/
        1.0.0_<Policy Display Name>.json
        policy.metadata.json
```

### Frameworks

| Folder | Purpose |
|---|---|
| `cyber-essentials/` | Cyber Essentials–aligned controls for any tenant (full pack: compliance, CA, hardening, updates). Location policies use your defined Home Countries, not a single country. |
| `cyber-essentials-foundation/` | Stage-first CE pack: compliance, report-only CA, settings catalog, update rings, ASR audit, LAPS, BitLocker (`CE-F-…`) |
| `cyber-essentials-hardening/` | Stage-second CE pack: enforced CA, ASR block, Windows Firewall (`CE-H-…`) |
| `cis-windows-11/` | CIS Microsoft Intune for Windows 11 (add Level 1 / Level 2 packs here) |
| `cis-edge/` | CIS Microsoft Edge benchmarks |
| `microsoft-defender/` | Microsoft Defender for Endpoint preferences and related profiles |
| `microsoft-security-baseline/` | Microsoft security baselines (MESB / Intune security baselines) |
| `browsers/` | Chrome / Edge enterprise hardening outside CIS packs |
| `modern-workplace/` | General Modern Workplace / Windows 11 best-practice baselines |
| `apple/` | iOS / iPadOS / macOS baselines not tied to another framework |
| `android/` | Android Enterprise / work-profile baselines |

### Intune types (under each framework)

`compliance-policies` · `conditional-access` · `device-configuration-policies` ·
`settings-catalog` · policy-specific folders under `endpoint-security`

Cyber Essentials no longer uses `device-configuration-policies`; its only occupant,
`CE-UAC-001`, was rebuilt as a Settings Catalog policy at pack `1.1.0`.

Policy folders use the **display name** as the folder name. Tags live in `policy.metadata.json`.

## Link in Nerdio Manager

1. MSP level → **System** → **Integrations** → **GitHub Repositories** → **Link Repository**
2. Account: `Brandon-Nerdio`
3. Repository: `gle-intune`
4. Enable the **Intune Policies Versioning** toggle at the bottom of the form (next to *Auto-synchronization*). This is a form-level switch, **not** an option in the *File content* dropdown.
5. Add **one mapping row per Nerdio content type**. For Cyber Essentials, use:

| Path | Branch | File extensions | File content | Include subfolders |
|---|---|---|---|---|
| `/policies-versioning/cyber-essentials/compliance-policies` | `main` | `.json` | Intune Compliance policy | on |
| `/policies-versioning/cyber-essentials/conditional-access` | `main` | `.json` | Intune Conditional Access policy | on |
| `/policies-versioning/cyber-essentials/update-rings` | `main` | `.json` | Intune Windows Update Rings Policies | on |
| `/policies-versioning/cyber-essentials/settings-catalog` | `main` | `.json` | Intune Configuration profile | on |
| `/policies-versioning/cyber-essentials/endpoint-security/windows-firewall` | `main` | `.json` | Intune Windows firewall policies | on |
| `/policies-versioning/cyber-essentials/endpoint-security/firewall-rules` | `main` | `.json` | Intune Windows Firewall Rules Policies | on |
| `/policies-versioning/cyber-essentials/endpoint-security/asr-rules` | `main` | `.json` | Intune Attack surface reduction rules policies | on |
| `/policies-versioning/cyber-essentials/endpoint-security/account-protection` | `main` | `.json` | Local admin password solution | on |
| `/policies-versioning/cyber-essentials/endpoint-security/bitlocker` | `main` | `.json` | Intune BitLocker Policies | on |

**Foundation** (stage first — leave `cyber-essentials/` mapped if you still use the full pack, or map these instead for a phased rollout):

| Path | Branch | File extensions | File content | Include subfolders |
|---|---|---|---|---|
| `/policies-versioning/cyber-essentials-foundation/compliance-policies` | `main` | `.json` | Intune Compliance policy | on |
| `/policies-versioning/cyber-essentials-foundation/conditional-access` | `main` | `.json` | Intune Conditional Access policy | on |
| `/policies-versioning/cyber-essentials-foundation/update-rings` | `main` | `.json` | Intune Windows Update Rings Policies | on |
| `/policies-versioning/cyber-essentials-foundation/settings-catalog` | `main` | `.json` | Intune Configuration profile | on |
| `/policies-versioning/cyber-essentials-foundation/endpoint-security/asr-rules` | `main` | `.json` | Intune Attack surface reduction rules policies | on |
| `/policies-versioning/cyber-essentials-foundation/endpoint-security/account-protection` | `main` | `.json` | Local admin password solution | on |
| `/policies-versioning/cyber-essentials-foundation/endpoint-security/bitlocker` | `main` | `.json` | Intune BitLocker Policies | on |

**Hardening** (stage second — after Foundation is validated):

| Path | Branch | File extensions | File content | Include subfolders |
|---|---|---|---|---|
| `/policies-versioning/cyber-essentials-hardening/conditional-access` | `main` | `.json` | Intune Conditional Access policy | on |
| `/policies-versioning/cyber-essentials-hardening/endpoint-security/asr-rules` | `main` | `.json` | Intune Attack surface reduction rules policies | on |
| `/policies-versioning/cyber-essentials-hardening/endpoint-security/windows-firewall` | `main` | `.json` | Intune Windows firewall policies | on |
| `/policies-versioning/cyber-essentials-hardening/endpoint-security/firewall-rules` | `main` | `.json` | Intune Windows Firewall Rules Policies | on |

The update rings sync through their own row mapped as Intune Windows Update Rings
Policies. Foundation and Hardening use distinct paths and display names (`CE-F-…` / `CE-H-…`) so they do not collide with each other or with `cyber-essentials/`.

6. Auto-synchronization: on (or refresh manually after pushes)

### Why each Path points at a policy-type leaf

Nerdio binds each configured Path to one *File content* parser. The policy folders must
therefore sit directly beneath a path containing only that policy type:

```
<Path>/<policy-name>/<version>_<policy-name>.json
```

Do not map `/policies-versioning`, `/policies-versioning/cyber-essentials`, or the
`endpoint-security` parent. Those paths contain multiple schemas; assigning one content
type to them can produce blank names, failed imports, or policies parsed as the wrong type.

Every row must use a unique path. Do **not** add a second row over the same path with a
different *File content* type — that ingests policy JSON twice and produces duplicate or
junk entries.

## Adding a policy

1. Pick the framework folder (or create one following the same pattern).
2. Pick the Intune type folder.
3. Create `<Display Name>/1.0.0_<Display Name>.json` plus `policy.metadata.json` with tags, for example:

```json
{
  "tags": ["cyber-essentials", "ce", "settings-catalog", "firewall"]
}
```

Prefer display-name prefixes that match the framework: `[CE]`, `[CIS][L1]`, `[ALL][MDE]`, etc.

## Notes

- **Cyber Essentials** policies in this repo were imported from the local `Cyber Essentials` JSON pack and wrapped into Nerdio’s versioning folder shape. The original `cyber-essentials/` tree is unchanged.
- **`cyber-essentials-foundation/`** and **`cyber-essentials-hardening/`** are derived packs (new GUIDs, `CE-F-` / `CE-H-` names, and pack-specific tags). Rebuild with `node scripts/build-ce-foundation-hardening.mjs` if the source CE pack changes. Do not dual-assign Report-only + Enforced (or ASR Audit + Block) to the same targets.
- **CIS** folders are scaffolded on purpose. Bulk CIS Graph exports (e.g. from community Intune baseline packs) are large and license-sensitive—add curated Level 1 / Level 2 policies here when ready rather than dumping an entire benchmark set.
- Always pilot framework packs in a test group before production assignment.
