# Policy Impact Summary

This document explains, in plain language, what each policy in this repository does and how it affects enrolled devices and users. There is one paragraph per policy, grouped by policy family. Settings values are taken directly from the `1.0.0` version files under `policies-versioning/`.

> **Important — Conditional Access is in Report-only mode.** Every Conditional Access (CA) policy below is currently set to `enabledForReportingButNotEnforced`. That means they are evaluated and logged but do **not** block or challenge sign-ins yet. Their real-world impact only takes effect once you switch them to **On**.

---

## Compliance policies

These mark a device *compliant* or *non-compliant*. They do not change device settings themselves, but non-compliance can trigger Conditional Access (e.g., blocking access) and is reported in Intune.

### CE-Comp-001 — Anti-virus / Firewall
This Windows compliance policy requires that each device has an **active firewall**, **antivirus**, and **antispyware** protection running. Devices missing any of these are flagged non-compliant, and after a **12-hour grace period** the device is marked non-compliant (which can then cut off access via Conditional Access). It does not enforce passwords, encryption, or OS version — only the AV/firewall health signals.

### CE-Comp-002 — Password Requirements
This is the strictest compliance baseline. It requires a **password (no simple PINs)** of at least **8 characters**, locks the device after **15 minutes** of inactivity, and blocks reuse of the last **24 passwords**. It also requires **BitLocker**, **Secure Boot**, **code integrity**, **storage encryption**, and a **TPM**. Any device lacking these is marked non-compliant after a **12-hour grace period**, so this policy has the broadest impact on whether older or unencrypted hardware can stay enrolled.

### CE-Comp-003 — Windows Minimum OS Version
This policy requires a **minimum Windows build of 10.0.26200.0 (Windows 11, 25H2-era)**. Devices on older builds are marked non-compliant **immediately (0-hour grace period)**. The practical impact is that machines that have not updated to a current Windows 11 release will lose compliance right away, so it should be rolled out alongside the update rings to avoid unexpected lockouts.

---

## Conditional Access policies (Report-only)

All CA policies apply to **All cloud apps** and **All users**, and every one **excludes the Break Glass group** (`$GroupVars.BreakGlass`) so emergency admin accounts are never locked out. Remember: these are currently **Report-only**.

### CE-UAC-CA-001 — Block logins outside home countries
Blocks sign-ins that originate from **anywhere except your defined Home Countries** location list (`$LocationVars.HomeCountries`). When enforced, a user traveling to or connecting from an unlisted country would be blocked from signing in. Today (report-only) it only logs which sign-ins *would* have been blocked.

### CE-UAC-CA-002 — Require multifactor authentication for all users
Requires **MFA for every user on every app**. When enforced, all users must complete a second factor to access cloud resources. This is the single highest-impact user-facing control once enabled, so verify MFA registration coverage before turning it on.

### CE-UAC-CA-003 — Require multifactor authentication for admins
Requires **MFA specifically for 14 privileged directory roles** (Global Admin, Security Admin, Exchange Admin, SharePoint Admin, Helpdesk Admin, and other high-privilege roles). Impact is limited to admins, giving you a lower-risk way to protect privileged accounts even before broad user MFA is enforced.

### CE-UAC-CA-004 — Require Entra ID Joined and compliant device to access cloud apps for all users
Requires a **compliant device** for all users to reach cloud apps. When enforced, sign-ins from unmanaged or non-compliant devices are blocked. This policy depends directly on the compliance policies above, so its impact is only as good as your compliance coverage.

### CE-UAC-CA-005 — Block legacy authentication
Blocks **legacy/basic authentication** protocols (Exchange ActiveSync and "other" legacy clients) that cannot perform MFA. Impact is mostly invisible to modern users but will break old mail clients or scripts still using basic auth — a common and recommended hardening step.

### CE-UAC-CA-006 — Block Non Compliant Devices
Requires a **compliant device**, targeting **Windows** specifically (Android, iOS, macOS, and Linux are excluded). When enforced, non-compliant Windows devices are blocked from access, complementing CA-004 with a platform-scoped enforcement point.

### CE-UAC-CA-007 — Block Devices not joined to Entra ID
**Blocks** access outright from devices across all platforms that do not meet the join requirement. When enforced, this is a hard block, so it should be validated carefully against your device-join posture before enabling to avoid locking out legitimate users.

### CE-UAC-CA-008 — Grant Access to All Apps for Hybrid devices
Grants access when the device is **Hybrid Entra ID (domain) joined**, scoped to **Windows only** (other platforms excluded). This acts as the "allow" counterpart for organizations still using hybrid-joined Windows machines, so those devices continue to work when the block policies come online.

---

## Device configuration — account & password

### CE-UAC-001 — Password policy enforcement
This Windows configuration profile **enforces local password rules on the device itself**: a required password, **no simple passwords**, a **minimum length of 14 characters**, a **15-minute screen timeout**, and blocking reuse of the last **24 passwords**. Unlike the compliance policy, this actively pushes the settings to Windows, so users will be required to set conforming passwords and see the screen lock after inactivity.

---

## Endpoint security — Attack Surface Reduction

### CE-MP-002 — Attack Surface Reduction rules (Audit Mode)
Enables the **full set of Microsoft ASR rules in Audit mode** plus **Controlled Folder Access in audit**. Nothing is blocked; instead, actions that *would* have been blocked are logged. The impact is purely observational — use it to measure what Block mode would stop before you enforce it.

### CE-MP-002 — Attack Surface Reduction rules (Block Mode)
Enables the **full set of Microsoft ASR rules in Block mode** plus **Controlled Folder Access enabled**. This actively blocks risky behaviors (malicious Office macros, credential theft, script abuse, etc.) and protects designated folders from unauthorized changes. Expect potential false positives with legitimate line-of-business apps, so deploy after validating with the Audit-mode policy.

---

## Endpoint security — Microsoft Defender Antivirus

### CE-MP-001 — Defender Antivirus baseline
Turns on Defender's core protections: **real-time monitoring**, **behavior monitoring**, **cloud-delivered protection at the "High" block level**, **PUA (potentially unwanted app) protection**, **network protection**, **archive/script/removable-drive scanning**, and **automatic sample submission**. It schedules a **daily quick scan at 12:00**, updates signatures **every 4 hours**, caps scan CPU usage at **50%**, and retains cleaned malware for **7 days**. The net impact is a fully hardened Defender configuration with minimal user interaction, though cloud protection and sample submission mean some file metadata is sent to Microsoft.

---

## Endpoint security — Disk encryption

### CE-SC-005 — BitLocker Encryption enforcement
**Requires BitLocker device encryption** on both **system and fixed drives**, sets the encryption method, enables **recovery-key escrow with automatic recovery-password rotation**, and requires encryption before a fixed drive can be used. The user impact is that drives are silently encrypted and recovery keys are backed up centrally; on devices without a TPM or that fail pre-checks, encryption may prompt the user or be delayed.

---

## Endpoint security — LAPS (local admin)

### CE-SC-004 — Local admin restriction (LAPS)
Enables **Windows LAPS** to automatically manage the built-in local administrator password: it **backs the password up to Entra ID**, rotates it automatically, enforces a **14-character complex password** (upper, lower, numbers, symbols), and after use performs a **post-authentication reset with logoff after an 8-hour delay**. The impact is that the local admin password is unique per device, unknown to end users, and retrievable only by authorized admins from Entra.

---

## Endpoint security — Windows Firewall

### CE-FW-001 — Firewall Enforcement
**Turns the Windows firewall on for all three profiles** (Domain, Private, and Public). This ensures the host firewall cannot be silently disabled on managed devices. Impact on users is minimal unless they previously relied on the firewall being off for some local service.

### CE-FW-002 — Block Inbound RDP (Public Profile)
Adds a firewall rule that **blocks inbound Remote Desktop (RDP) connections on the Public network profile**. The impact is that devices on untrusted/public networks cannot be reached via RDP, reducing exposure to remote attacks, while RDP on trusted networks (per your other rules) is unaffected.

---

## Settings catalog — network & browser protection

### CE-MP-003 — Network protection
Enables Defender **Network Protection in block mode** and turns on **SmartScreen for both Microsoft Edge and Windows shell**, including **preventing users from overriding SmartScreen warnings** for sites and downloaded files. The impact is that known-malicious sites, downloads, and IPs are actively blocked and users cannot click through the warnings.

---

## Settings catalog — account & OS hardening

### CE-SC-001 — Local account hardening
Configures the **built-in Administrator and Guest account status** in line with the Cyber Essentials requirement to disable unnecessary default accounts. The impact is on the local default accounts only; normal user and managed-admin (LAPS) access is unaffected.

### CE-SC-002 — AutoRun / AutoPlay disable
**Disables AutoRun and AutoPlay** across the device: AutoPlay is turned off for all drives, AutoRun commands are set not to execute, and AutoPlay is disallowed for non-volume devices. This blocks a classic infection vector from USB drives and removable media; the user impact is that inserting media no longer launches anything automatically.

### CE-SC-003 — Screen lock and idle timeout
**Requires a device password/PIN to unlock** the device (enforcing the device-lock credential control). Combined with the password and timeout policies, users must authenticate to access the machine, satisfying the Cyber Essentials device-locking requirement.

### CE-SC-006 — Windows Hello for Business
Enables **Windows Hello for Business** with **biometrics** (fingerprint/face) and **enhanced anti-spoofing** for facial recognition, along with tenant-scoped PIN policies. The impact is that users can sign in with biometrics/PIN backed by strong hardware-bound credentials instead of relying solely on passwords.

---

## Update rings (Windows Update for Business)

### CE-PM-001 — Windows Update Ring (Pilot users)
This is the **fast ring**: quality and feature updates are deferred **0 days** (installed as soon as released), with a **0-day deadline** and a **1-day grace period** before a forced restart (reboot postponed until after the deadline). The impact is that pilot users receive updates first and act as an early-warning group for update issues before broad rollout.

### CE-PM-002 — Windows Update Ring (standard users)
This is the **broad ring**: **quality updates are deferred 10 days** (feature updates 0 days), with a **2-day install deadline** and a **1-day grace period** before a forced restart. The 10-day delay gives the pilot ring time to surface problems, so standard users get more stable updates at the cost of a short delay.
