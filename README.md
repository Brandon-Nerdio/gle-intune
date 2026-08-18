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
| `cyber-essentials-foundation/` | Full CE baseline (all 25 controls) tuned for the Foundation stage: CA Report-only, ASR Audit (`CE-F-…`) |
| `cyber-essentials-hardening/` | Full CE baseline (all 25 controls) tuned for the Hardening stage: CA Enforced, ASR Block (`CE-H-…`) |
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

**Foundation** and **Hardening** are each a *complete* CE baseline (all 25 controls). They differ only in enforcement: Foundation ships Conditional Access as **Report-only** and ASR in **Audit** mode; Hardening ships CA **Enforced** and ASR in **Block** mode. Map one pack at a time to the same scope — pilot Foundation first, then promote to Hardening. Both packs use identical path shapes:

| Path (replace `<pack>` with `cyber-essentials-foundation` or `cyber-essentials-hardening`) | Branch | File extensions | File content | Include subfolders |
|---|---|---|---|---|
| `/policies-versioning/<pack>/compliance-policies` | `main` | `.json` | Intune Compliance policy | on |
| `/policies-versioning/<pack>/conditional-access` | `main` | `.json` | Intune Conditional Access policy | on |
| `/policies-versioning/<pack>/update-rings` | `main` | `.json` | Intune Windows Update Rings Policies | on |
| `/policies-versioning/<pack>/settings-catalog` | `main` | `.json` | Intune Configuration profile | on |
| `/policies-versioning/<pack>/endpoint-security/asr-rules` | `main` | `.json` | Intune Attack surface reduction rules policies | on |
| `/policies-versioning/<pack>/endpoint-security/account-protection` | `main` | `.json` | Local admin password solution | on |
| `/policies-versioning/<pack>/endpoint-security/bitlocker` | `main` | `.json` | Intune BitLocker Policies | on |
| `/policies-versioning/<pack>/endpoint-security/windows-firewall` | `main` | `.json` | Intune Windows firewall policies | on |
| `/policies-versioning/<pack>/endpoint-security/firewall-rules` | `main` | `.json` | Intune Windows Firewall Rules Policies | on |

Foundation and Hardening use distinct paths and display names (`CE-F-…` / `CE-H-…`) so they never collide with each other or with `cyber-essentials/`. Never assign both packs to the same targets simultaneously.

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
- **`cyber-essentials-foundation/`** and **`cyber-essentials-hardening/`** are derived packs (new GUIDs, `CE-F-` / `CE-H-` names, and pack-specific tags). Each is a *complete* CE baseline (all 25 controls); the two differ only where enforcement changes — Foundation uses CA Report-only + ASR Audit, Hardening uses CA Enforced + ASR Block. Everything else (compliance, settings catalog, update rings, LAPS, BitLocker, firewall) is identical in both. Rebuild with `node scripts/build-ce-foundation-hardening.mjs` if the source CE pack changes. Do not assign both packs to the same targets at once.
- **CIS** folders are scaffolded on purpose. Bulk CIS Graph exports (e.g. from community Intune baseline packs) are large and license-sensitive—add curated Level 1 / Level 2 policies here when ready rather than dumping an entire benchmark set.
- Always pilot framework packs in a test group before production assignment.
