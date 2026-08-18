/**
 * Build cyber-essentials-foundation and cyber-essentials-hardening packs
 * from cyber-essentials without modifying the source tree.
 *
 * Foundation = stage-first (compliance, CA report-only, ASR audit, settings,
 *   update rings, BitLocker, LAPS)
 * Hardening = stage-second (CA enforced, ASR block, firewall)
 */
import { randomUUID } from "node:crypto";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = path.join(root, "policies-versioning", "cyber-essentials");

/** @typedef {"foundation"|"hardening"} Pack */

/** Relative policy folder paths (from cyber-essentials) included in each pack. */
const PACK_INCLUDES = {
	foundation: [
		"compliance-policies",
		"conditional-access", // filtered to Report-only only
		"settings-catalog",
		"update-rings",
		"endpoint-security/asr-rules", // filtered to Audit Mode only
		"endpoint-security/account-protection",
		"endpoint-security/bitlocker",
	],
	hardening: [
		"conditional-access", // filtered to Enforced only
		"endpoint-security/asr-rules", // filtered to Block Mode only
		"endpoint-security/windows-firewall",
		"endpoint-security/firewall-rules",
	],
};

const PREFIX = { foundation: "CE-F", hardening: "CE-H" };
const LABEL = { foundation: "Foundation", hardening: "Hardening" };
const FRAMEWORK = {
	foundation: "cyber-essentials-foundation",
	hardening: "cyber-essentials-hardening",
};
const SHORT = { foundation: "ce-foundation", hardening: "ce-hardening" };

function readJson(file) {
	const buf = readFileSync(file);
	let raw;
	if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
		raw = buf.toString("utf16le").replace(/^\uFEFF/, "");
	} else if (buf.length >= 2 && buf[1] === 0x00 && buf[0] !== 0x00) {
		raw = buf.toString("utf16le").replace(/^\uFEFF/, "");
	} else {
		raw = buf.toString("utf8").replace(/^\uFEFF/, "");
	}
	return JSON.parse(raw);
}

function writeJson(file, data) {
	writeFileSync(file, `${JSON.stringify(data, null, 4)}\n`, "utf8");
}

function walkDirs(dir, out = []) {
	if (!existsSync(dir)) return out;
	for (const name of readdirSync(dir)) {
		const full = path.join(dir, name);
		if (statSync(full).isDirectory()) {
			out.push(full);
			walkDirs(full, out);
		}
	}
	return out;
}

function isPolicyFolder(dir) {
	return existsSync(path.join(dir, "policy.metadata.json"));
}

function renameDisplay(oldName, pack) {
	// CE-Comp-001 — Foo  =>  CE-F-Comp-001 — Foo [Foundation]
	// CE-UAC-CA-001 — Foo [Report-only] => CE-F-UAC-CA-001 — Foo [Report-only]
	const p = PREFIX[pack];
	const label = LABEL[pack];
	let name = oldName;
	if (name.startsWith("CE-")) name = `${p}-${name.slice(3)}`;
	else name = `${p}-${name}`;

	// Avoid double-suffixing if already tagged
	if (!/\[Foundation\]|\[Hardening\]/.test(name)) {
		if (/\[Report-only\]|\[Enforced\]/.test(name)) {
			name = name.replace(/(\[(?:Report-only|Enforced)\])/, `[${label}] $1`);
		} else {
			name = `${name} [${label}]`;
		}
	}
	return name;
}

function transformMetadata(meta, pack, typeTag) {
	const tags = new Set([FRAMEWORK[pack], SHORT[pack], "cyber-essentials", "ce", typeTag]);
	if (pack === "foundation") tags.add("foundation");
	if (pack === "hardening") tags.add("hardening");

	const old = Array.isArray(meta.tags) ? meta.tags : [];
	for (const t of old) {
		if (t === "cyber-essentials" || t === "ce") continue;
		if (t === "device-configuration-policies") continue;
		if (t.includes("report-only-ca")) {
			tags.add(`${FRAMEWORK[pack]}-report-only-ca`);
			continue;
		}
		if (t.includes("enforced-ca")) {
			tags.add(`${FRAMEWORK[pack]}-enforced-ca`);
			continue;
		}
		tags.add(t);
	}
	meta.tags = [...tags];
	if (meta.description && typeof meta.description === "string") {
		meta.description = `[${LABEL[pack]}] ${meta.description}`;
	}
	return meta;
}

function transformPolicyJson(j, newDisplayName, pack) {
	const newId = randomUUID();
	if (j.id) j.id = newId;
	if (j.displayName) j.displayName = newDisplayName;
	if (j.name) j.name = newDisplayName;

	// Refresh odata ids that embed the old GUID when present
	const idFields = ["@odata.id", "@odata.editLink"];
	for (const f of idFields) {
		if (typeof j[f] === "string") {
			j[f] = j[f].replace(
				/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
				newId,
			);
		}
	}

	// Nested settings odata ids
	if (Array.isArray(j.settings)) {
		for (const s of j.settings) {
			for (const f of idFields) {
				if (typeof s[f] === "string") {
					s[f] = s[f].replace(
						/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
						newId,
					);
				}
			}
		}
	}

	if (typeof j.description === "string" && j.description.length) {
		j.description = `[${LABEL[pack]} pack] ${j.description}`;
	} else if (j.description === null || j.description === undefined) {
		j.description = `${LABEL[pack]} Cyber Essentials pack policy.`;
	}

	return j;
}

function typeTagFromRel(rel) {
	if (rel.startsWith("compliance-policies")) return "compliance";
	if (rel.startsWith("conditional-access")) return "conditional-access";
	if (rel.startsWith("settings-catalog")) return "settings-catalog";
	if (rel.startsWith("update-rings")) return "update-rings";
	if (rel.includes("asr-rules")) return "asr";
	if (rel.includes("account-protection")) return "laps";
	if (rel.includes("bitlocker")) return "bitlocker";
	if (rel.includes("firewall-rules")) return "firewall-rules";
	if (rel.includes("windows-firewall")) return "windows-firewall";
	return "policy";
}

function caFilter(pack, folderName) {
	if (pack === "foundation") return folderName.includes("[Report-only]");
	if (pack === "hardening") return folderName.includes("[Enforced]");
	return true;
}

function asrFilter(pack, folderName) {
	if (pack === "foundation") return /Audit Mode/i.test(folderName);
	if (pack === "hardening") return /Block Mode/i.test(folderName);
	return true;
}

function shouldIncludePolicy(pack, relHint, folderName) {
	if (relHint.includes("conditional-access") || relHint.startsWith("conditional-access")) {
		return caFilter(pack, folderName);
	}
	if (relHint.includes("asr-rules")) {
		return asrFilter(pack, folderName);
	}
	return true;
}

function copyPolicyFolder(srcDir, destParent, pack, relHint) {
	const oldName = path.basename(srcDir);
	if (!shouldIncludePolicy(pack, relHint, oldName)) {
		return null;
	}

	const newName = renameDisplay(oldName, pack);
	const destDir = path.join(destParent, newName);
	mkdirSync(destDir, { recursive: true });

	const metaPath = path.join(srcDir, "policy.metadata.json");
	const meta = transformMetadata(readJson(metaPath), pack, typeTagFromRel(relHint));
	writeJson(path.join(destDir, "policy.metadata.json"), meta);

	for (const file of readdirSync(srcDir)) {
		if (file === "policy.metadata.json") continue;
		if (!file.endsWith(".json")) continue;
		const srcFile = path.join(srcDir, file);
		const j = transformPolicyJson(readJson(srcFile), newName, pack);
		// Version prefix from original filename
		const verMatch = /^(\d+\.\d+\.\d+)_/.exec(file);
		const ver = verMatch ? verMatch[1] : "1.0.0";
		const destFile = path.join(destDir, `${ver}_${newName}.json`);
		writeJson(destFile, j);
	}
	return newName;
}

function processInclude(pack, includeRel) {
	const src = path.join(srcRoot, includeRel);
	const destBase = path.join(root, "policies-versioning", FRAMEWORK[pack]);

	if (!existsSync(src)) {
		console.warn(`Missing source: ${includeRel}`);
		return;
	}

	// If include is a type root with many policies
	if (isPolicyFolder(src)) {
		const parentRel = path.dirname(includeRel);
		const destParent = path.join(destBase, parentRel);
		mkdirSync(destParent, { recursive: true });
		const n = copyPolicyFolder(src, destParent, pack, includeRel);
		if (n) console.log(`[${pack}] + ${n}`);
		return;
	}

	// Walk for policy folders under this include
	const dirs = [src, ...walkDirs(src)].filter(isPolicyFolder);
	for (const dir of dirs) {
		const relFromSrcRoot = path.relative(srcRoot, dir).replace(/\\/g, "/");
		const parentRel = path.dirname(relFromSrcRoot);
		const destParent = path.join(destBase, parentRel);
		mkdirSync(destParent, { recursive: true });
		const n = copyPolicyFolder(dir, destParent, pack, relFromSrcRoot);
		if (n) console.log(`[${pack}] + ${n}`);
	}
}

function writePackReadme(pack) {
	const fw = FRAMEWORK[pack];
	const label = LABEL[pack];
	const other =
		pack === "foundation" ? "cyber-essentials-hardening" : "cyber-essentials-foundation";
	const role =
		pack === "foundation"
			? "Stage-first Cyber Essentials pack: compliance, CA Report-only, ASR Audit, Settings Catalog, update rings, BitLocker, and LAPS. Assign to a pilot ring before Hardening."
			: "Stage-second Cyber Essentials pack: CA Enforced, ASR Block, and Windows Firewall. Assign only after Foundation is green on the pilot ring. Never dual-assign Report-only and Enforced (or ASR Audit and Block) to the same targets.";

	const paths =
		pack === "foundation"
			? [
					["compliance-policies", "Intune Compliance policy"],
					["conditional-access", "Intune Conditional Access policy"],
					["update-rings", "Intune Windows Update Rings Policies"],
					["settings-catalog", "Intune Configuration profile"],
					["endpoint-security/asr-rules", "Intune Attack surface reduction rules policies"],
					["endpoint-security/account-protection", "Local admin password solution"],
					["endpoint-security/bitlocker", "Intune BitLocker Policies"],
				]
			: [
					["conditional-access", "Intune Conditional Access policy"],
					["endpoint-security/asr-rules", "Intune Attack surface reduction rules policies"],
					["endpoint-security/windows-firewall", "Intune Windows firewall policies"],
					["endpoint-security/firewall-rules", "Intune Windows Firewall Rules Policies"],
				];

	const table = paths
		.map(
			([p, t]) =>
				`| \`/policies-versioning/${fw}/${p}\` | ${t} |`,
		)
		.join("\n");

	const md = `# Cyber Essentials — ${label}

${role}

This pack is derived from \`cyber-essentials/\` with **new display names, GUIDs, and tags**.
The original \`cyber-essentials\` tree is unchanged. Pair with \`${other}/\`.

## Tags

Every policy is tagged with:

- \`${fw}\`
- \`${SHORT[pack]}\`
- \`cyber-essentials\` / \`ce\`
- plus the Intune type tag (\`compliance\`, \`settings-catalog\`, \`asr\`, …)

Conditional Access:

- Foundation Report-only: \`${FRAMEWORK.foundation}-report-only-ca\`
- Hardening Enforced: \`${FRAMEWORK.hardening}-enforced-ca\`

## Nerdio repository path mapping

| Path | Nerdio content type |
|---|---|
${table}

Set **Intune Policies Versioning** on each row, file mask \`.json\`, branch \`main\`,
**Include subfolders** enabled. Do not map the pack root or \`endpoint-security\` parent.

## Naming

Display names use the \`${PREFIX[pack]}-\` ID prefix and a \`[${label}]\` marker so Foundation
and Hardening never collide with each other or with the original CE pack in Nerdio.
`;

	writeFileSync(path.join(root, "policies-versioning", fw, "README.md"), md, "utf8");
}

for (const pack of /** @type {Pack[]} */ (["foundation", "hardening"])) {
	const dest = path.join(root, "policies-versioning", FRAMEWORK[pack]);
	if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
	mkdirSync(dest, { recursive: true });
	for (const include of PACK_INCLUDES[pack]) processInclude(pack, include);
	writePackReadme(pack);
}

console.log("Done. cyber-essentials source untouched.");
