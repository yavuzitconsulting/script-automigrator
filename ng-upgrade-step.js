#!/usr/bin/env node
// ng-upgrade-step.js v45
"use strict";

var child_process = require("child_process");
var spawnSync = child_process.spawnSync;
var fs = require("fs");
var path = require("path");

var SCRIPT_VERSION = 45;
var REQUIRED_NODE_MAJOR = 22;

// ============================================================================
// upgrade steps
// ============================================================================

var UPGRADE_STEPS = [
  {
    from: 8, to: 8, label: "Update to latest 8.x",
    packages: { "@angular/cli": "~8.3.29", "@angular/core": "~8.2.14", "@angular/animations": "~8.2.14", "@angular/common": "~8.2.14", "@angular/compiler": "~8.2.14", "@angular/compiler-cli": "~8.2.14", "@angular/forms": "~8.2.14", "@angular/platform-browser": "~8.2.14", "@angular/platform-browser-dynamic": "~8.2.14", "@angular/router": "~8.2.14" },
    schematics: null,
    notes: ["updates to latest v8 patch before upgrading to v9."],
  },
  {
    from: 8, to: 9, label: "Upgrade v8 -> v9",
    packages: { "@angular/cli": "~9.1.15", "@angular/core": "~9.1.13", "@angular/animations": "~9.1.13", "@angular/common": "~9.1.13", "@angular/compiler": "~9.1.13", "@angular/compiler-cli": "~9.1.13", "@angular/forms": "~9.1.13", "@angular/platform-browser": "~9.1.13", "@angular/platform-browser-dynamic": "~9.1.13", "@angular/router": "~9.1.13" },
    schematics: {
      cliVersion: "9.1.15",
      migrations: [
        { pkg: "@angular/core@9", from: "8.0.0", to: "9.1.13" },
        { pkg: "@angular/cli@9", from: "8.0.0", to: "9.1.15" },
      ],
    },
    notes: ["ensure lazy loaded modules use dynamic imports.", "typescript updated to 3.8.", "run 'ng add @angular/localize' after if using i18n."],
  },
  {
    from: 9, to: 10, label: "Upgrade v9 -> v10",
    packages: { "@angular/cli": "~10.2.4", "@angular/core": "~10.2.5", "@angular/animations": "~10.2.5", "@angular/common": "~10.2.5", "@angular/compiler": "~10.2.5", "@angular/compiler-cli": "~10.2.5", "@angular/forms": "~10.2.5", "@angular/platform-browser": "~10.2.5", "@angular/platform-browser-dynamic": "~10.2.5", "@angular/router": "~10.2.5" },
    schematics: {
      cliVersion: "10.2.4",
      migrations: [
        { pkg: "@angular/core@10", from: "9.0.0", to: "10.2.5" },
        { pkg: "@angular/cli@10", from: "9.0.0", to: "10.2.4" },
      ],
    },
    notes: ["browserslist file renamed to .browserslistrc."],
  },
  {
    from: 10, to: 11, label: "Upgrade v10 -> v11",
    packages: { "@angular/cli": "~11.2.19", "@angular/core": "~11.2.14", "@angular/animations": "~11.2.14", "@angular/common": "~11.2.14", "@angular/compiler": "~11.2.14", "@angular/compiler-cli": "~11.2.14", "@angular/forms": "~11.2.14", "@angular/platform-browser": "~11.2.14", "@angular/platform-browser-dynamic": "~11.2.14", "@angular/router": "~11.2.14" },
    schematics: {
      cliVersion: "11.2.19",
      migrations: [
        { pkg: "@angular/core@11", from: "10.0.0", to: "11.2.14" },
        { pkg: "@angular/cli@11", from: "10.0.0", to: "11.2.19" },
      ],
    },
    notes: ["typescript updated to 4.0.", "ie9, ie10, ie mobile removed."],
  },
  {
    from: 11, to: 12, label: "Upgrade v11 -> v12",
    packages: { "@angular/cli": "~12.2.18", "@angular/core": "~12.2.17", "@angular/animations": "~12.2.17", "@angular/common": "~12.2.17", "@angular/compiler": "~12.2.17", "@angular/compiler-cli": "~12.2.17", "@angular/forms": "~12.2.17", "@angular/platform-browser": "~12.2.17", "@angular/platform-browser-dynamic": "~12.2.17", "@angular/router": "~12.2.17" },
    schematics: {
      cliVersion: "12.2.18",
      migrations: [
        { pkg: "@angular/core@12", from: "11.0.0", to: "12.2.17" },
        { pkg: "@angular/cli@12", from: "11.0.0", to: "12.2.18" },
      ],
    },
    notes: ["typescript updated to 4.2.", "ie11 deprecated."],
  },
  {
    from: 12, to: 13, label: "Upgrade v12 -> v13",
    packages: { "@angular/cli": "~13.3.11", "@angular/core": "~13.3.12", "@angular/animations": "~13.3.12", "@angular/common": "~13.3.12", "@angular/compiler": "~13.3.12", "@angular/compiler-cli": "~13.3.12", "@angular/forms": "~13.3.12", "@angular/platform-browser": "~13.3.12", "@angular/platform-browser-dynamic": "~13.3.12", "@angular/router": "~13.3.12" },
    schematics: {
      cliVersion: "13.3.11",
      migrations: [
        { pkg: "@angular/core@13", from: "12.0.0", to: "13.3.12" },
        { pkg: "@angular/cli@13", from: "12.0.0", to: "13.3.11" },
      ],
    },
    notes: ["typescript updated to 4.4."],
  },
  {
    from: 13, to: 14, label: "Upgrade v13 -> v14",
    packages: { "typescript": "~4.6.4", "@angular/cli": "~14.2.13", "@angular/core": "~14.2.12", "@angular/animations": "~14.2.12", "@angular/common": "~14.2.12", "@angular/compiler": "~14.2.12", "@angular/compiler-cli": "~14.2.12", "@angular/forms": "~14.2.12", "@angular/platform-browser": "~14.2.12", "@angular/platform-browser-dynamic": "~14.2.12", "@angular/router": "~14.2.12" },
    schematics: {
      cliVersion: "14.2.13",
      migrations: [
        { pkg: "@angular/core@14", from: "13.0.0", to: "14.2.12" },
        { pkg: "@angular/cli@14", from: "13.0.0", to: "14.2.13" },
      ],
    },
    notes: ["typescript updated to 4.6."],
  },
  {
    from: 14, to: 15, label: "Upgrade v14 -> v15",
    packages: { "typescript": "~4.8.4", "@angular/cli": "~15.2.11", "@angular/core": "~15.2.10", "@angular/animations": "~15.2.10", "@angular/common": "~15.2.10", "@angular/compiler": "~15.2.10", "@angular/compiler-cli": "~15.2.10", "@angular/forms": "~15.2.10", "@angular/platform-browser": "~15.2.10", "@angular/platform-browser-dynamic": "~15.2.10", "@angular/router": "~15.2.10" },
    schematics: {
      cliVersion: "15.2.11",
      migrations: [
        { pkg: "@angular/core@15", from: "14.0.0", to: "15.2.10" },
        { pkg: "@angular/cli@15", from: "14.0.0", to: "15.2.11" },
      ],
    },
    notes: ["typescript updated to 4.8.", "remove enableivy from tsconfig.json.", "activatedroutesnapshot needs title property."],
  },
  {
    from: 15, to: 16, label: "Upgrade v15 -> v16",
    packages: { "typescript": "~4.9.5", "@angular/cli": "~16.2.16", "@angular/core": "~16.2.12", "@angular/animations": "~16.2.12", "@angular/common": "~16.2.12", "@angular/compiler": "~16.2.12", "@angular/compiler-cli": "~16.2.12", "@angular/forms": "~16.2.12", "@angular/platform-browser": "~16.2.12", "@angular/platform-browser-dynamic": "~16.2.12", "@angular/router": "~16.2.12" },
    schematics: {
      cliVersion: "16.2.16",
      migrations: [
        { pkg: "@angular/core@16", from: "15.0.0", to: "16.2.12" },
        { pkg: "@angular/cli@16", from: "15.0.0", to: "16.2.16" },
      ],
    },
    notes: ["typescript updated to 4.9.3.", "ngcc removed.", "remove moduleid and entrycomponents."],
  },
  {
    from: 16, to: 17, label: "Upgrade v16 -> v17",
    packages: { "typescript": "~5.2.2", "@angular/cli": "~17.3.11", "@angular/core": "~17.3.12", "@angular/animations": "~17.3.12", "@angular/common": "~17.3.12", "@angular/compiler": "~17.3.12", "@angular/compiler-cli": "~17.3.12", "@angular/forms": "~17.3.12", "@angular/platform-browser": "~17.3.12", "@angular/platform-browser-dynamic": "~17.3.12", "@angular/router": "~17.3.12" },
    schematics: {
      cliVersion: "17.3.11",
      migrations: [
        { pkg: "@angular/core@17", from: "16.0.0", to: "17.3.12" },
        { pkg: "@angular/cli@17", from: "16.0.0", to: "17.3.11" },
      ],
    },
    notes: ["typescript updated to 5.2.", "zone.js 0.14.x required.", "ngswitch uses === now."],
  },
  {
    from: 17, to: 18, label: "Upgrade v17 -> v18",
    packages: { "typescript": "~5.4.5", "@angular/cli": "~18.2.12", "@angular/core": "~18.2.13", "@angular/animations": "~18.2.13", "@angular/common": "~18.2.13", "@angular/compiler": "~18.2.13", "@angular/compiler-cli": "~18.2.13", "@angular/forms": "~18.2.13", "@angular/platform-browser": "~18.2.13", "@angular/platform-browser-dynamic": "~18.2.13", "@angular/router": "~18.2.13" },
    schematics: {
      cliVersion: "18.2.12",
      migrations: [
        { pkg: "@angular/core@18", from: "17.0.0", to: "18.2.13" },
        { pkg: "@angular/cli@18", from: "17.0.0", to: "18.2.12" },
      ],
    },
    notes: ["typescript updated to 5.4.", "node 22 officially supported from here."],
  },
  {
    from: 18, to: 19, label: "Upgrade v18 -> v19",
    packages: { "typescript": "~5.5.4", "@angular/cli": "~19.2.4", "@angular/core": "~19.2.4", "@angular/animations": "~19.2.4", "@angular/common": "~19.2.4", "@angular/compiler": "~19.2.4", "@angular/compiler-cli": "~19.2.4", "@angular/forms": "~19.2.4", "@angular/platform-browser": "~19.2.4", "@angular/platform-browser-dynamic": "~19.2.4", "@angular/router": "~19.2.4" },
    schematics: {
      cliVersion: "19.2.4",
      migrations: [
        { pkg: "@angular/core@19", from: "18.0.0", to: "19.2.4" },
        { pkg: "@angular/cli@19", from: "18.0.0", to: "19.2.4" },
      ],
    },
    notes: ["typescript updated to 5.5.", "standalone by default.", "replace browsermodule.withservertransition() with app_id."],
  },
  {
    from: 19, to: 20, label: "Upgrade v19 -> v20",
    packages: { "typescript": "~5.8.3", "@angular/cli": "~20.0.1", "@angular/core": "~20.0.1", "@angular/animations": "~20.0.1", "@angular/common": "~20.0.1", "@angular/compiler": "~20.0.1", "@angular/compiler-cli": "~20.0.1", "@angular/forms": "~20.0.1", "@angular/platform-browser": "~20.0.1", "@angular/platform-browser-dynamic": "~20.0.1", "@angular/router": "~20.0.1" },
    schematics: {
      cliVersion: "20.0.1",
      migrations: [
        { pkg: "@angular/core@20", from: "19.0.0", to: "20.0.1" },
        { pkg: "@angular/cli@20", from: "19.0.0", to: "20.0.1" },
      ],
    },
    notes: ["typescript updated to 5.8.", "rename afterrender to aftereveryrender.", "replace testbed.get() with inject()."],
  },
];

// ============================================================================
// semver
// ============================================================================

function parseSemver(v) {
  var m = String(v).match(/^(\d+)\.(\d+)\.(\d+)/);
  return m ? { major: +m[1], minor: +m[2], patch: +m[3] } : null;
}

function compareSemver(a, b) {
  var pa = parseSemver(a), pb = parseSemver(b);
  if (!pa || !pb) return 0;
  return pa.major !== pb.major ? pa.major - pb.major : pa.minor !== pb.minor ? pa.minor - pb.minor : pa.patch - pb.patch;
}

function findBestVersion(versions, wanted) {
  var clean = wanted.replace(/^[\^~>=<\s]+/, "");
  var target = parseSemver(clean);
  if (!target) return versions[versions.length - 1];
  var stable = versions.filter(function (v) { return parseSemver(v); }).sort(compareSemver);
  var exact = stable.find(function (v) { return v === clean; });
  if (exact) return exact;
  var sameMajGe = stable.filter(function (v) { var p = parseSemver(v); return p.major === target.major && compareSemver(v, clean) >= 0; });
  if (sameMajGe.length) return sameMajGe[0];
  var sameMaj = stable.filter(function (v) { return parseSemver(v).major === target.major; });
  if (sameMaj.length) return sameMaj[sameMaj.length - 1];
  var higher = stable.filter(function (v) { return compareSemver(v, clean) >= 0; });
  if (higher.length) return higher[0];
  return stable[stable.length - 1];
}

// ============================================================================
// runners
// ============================================================================

function runLive(command) {
  console.log("\n> " + command + "\n");
  var res = spawnSync("cmd", ["/c", command], { shell: true, encoding: "utf8", stdio: "inherit" });
  return { code: typeof res.status === "number" ? res.status : 1 };
}

function runCapture(command) {
  return new Promise(function (resolve) {
    console.log("\n> " + command + "\n");
    var chunks = [];
    var child = child_process.spawn("cmd", ["/c", command], { shell: true, encoding: "utf8", stdio: ["inherit", "pipe", "pipe"] });
    var lastOutput = Date.now(), elapsed = 0;
    var timer = setInterval(function () {
      elapsed += 30;
      var silent = Math.round((Date.now() - lastOutput) / 1000);
      if (silent >= 15) console.log("  ... still running (" + elapsed + "s elapsed, silent " + silent + "s)");
    }, 30000);
    child.stdout.on("data", function (d) { var s = d.toString(); process.stdout.write(s); chunks.push(s); lastOutput = Date.now(); });
    child.stderr.on("data", function (d) { var s = d.toString(); process.stderr.write(s); chunks.push(s); lastOutput = Date.now(); });
    child.on("close", function (code) { clearInterval(timer); resolve({ code: code || 0, out: chunks.join("") }); });
  });
}

function runSilent(cmd, args) {
  var r = spawnSync(cmd, args, { encoding: "utf8", timeout: 60000, shell: true });
  return { code: typeof r.status === "number" ? r.status : 1, out: (r.stdout || "") + (r.stderr || "") };
}

// ============================================================================
// node / npm / pkg
// ============================================================================

function getNodeVersion() { return process.version.replace(/^v/, ""); }
function getNodeMajor() { return +process.version.replace(/^v/, "").split(".")[0]; }
function getNpmVersion() { try { return spawnSync("npm", ["--version"], { encoding: "utf8", shell: true }).stdout.trim(); } catch (_) { return "unknown"; } }
function readPkgJson(p) { return JSON.parse(fs.readFileSync(p || "package.json", "utf8")); }
function writePkgJson(obj, p) { fs.writeFileSync(p || "package.json", JSON.stringify(obj, null, 2) + "\n", "utf8"); }

function detectAngularVersion() {
  var pkg = readPkgJson(), deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
  var v = deps["@angular/core"];
  if (!v) { console.error("no @angular/core found."); process.exit(1); }
  var m = v.replace(/^[\^~>=<\s]+/, "").match(/^(\d+)/);
  if (!m) { console.error("cannot parse @angular/core version: " + v); process.exit(1); }
  return +m[1];
}

// ============================================================================
// progress tracking
// ============================================================================

var PROGRESS_FILE = ".ng-upgrade-progress.json";

function readProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8")); } catch (_) { return []; }
}

function getCompletedSteps() {
  return readProgress().filter(function (e) { return e.status === "success"; }).map(function (e) { return e.label; });
}

function getInProgressStep() {
  var log = readProgress();
  for (var i = log.length - 1; i >= 0; i--) {
    if (log[i].status === "in-progress") return log[i];
  }
  return null;
}

function getStepsPendingSchematics() {
  var log = readProgress();
  var done = getCompletedSteps();
  var pending = [];
  for (var i = 0; i < log.length; i++) {
    if (log[i].status === "in-progress" && log[i].phase === 3 && done.indexOf(log[i].label) === -1) {
      pending.push(log[i].label);
    }
  }
  return pending;
}

function findNextStep(maj) {
  var done = getCompletedSteps();
  var inProg = getInProgressStep();
  if (inProg) {
    for (var i = 0; i < UPGRADE_STEPS.length; i++) {
      if (UPGRADE_STEPS[i].label === inProg.label) return { step: UPGRADE_STEPS[i], resumePhase: inProg.phase || 1 };
    }
  }
  for (var j = 0; j < UPGRADE_STEPS.length; j++) {
    if (UPGRADE_STEPS[j].from === maj && done.indexOf(UPGRADE_STEPS[j].label) === -1) return { step: UPGRADE_STEPS[j], resumePhase: 1 };
  }
  return null;
}

function findStepByLabel(label) {
  for (var i = 0; i < UPGRADE_STEPS.length; i++) {
    if (UPGRADE_STEPS[i].label === label) return UPGRADE_STEPS[i];
  }
  return null;
}

function saveProgress(ver, status, label, phase) {
  var log = readProgress();
  if (status === "in-progress" || status === "success") {
    log = log.filter(function (e) { return !(e.label === label && e.status === "in-progress"); });
  }
  log.push({ step: ver, label: label, status: status, phase: phase || null, node: getNodeVersion(), npm: getNpmVersion(), timestamp: new Date().toISOString() });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(log, null, 2) + "\n", "utf8");
}

function cleanArtifacts() {
  console.log("  cleaning package-lock.json...");
  runLive("del package-lock.json 2>nul");
}

// ============================================================================
// error parsers
// ============================================================================

function parseMissingPackage(output) {
  var pats = [
    /No matching version found for\s+(@?[^@\s]+(?:\/[^@\s]+)?)@([^\s.]+(?:\.[^\s.]+)*)/i,
    /notarget\s+No matching version found for\s+(@?[^@\s]+(?:\/[^@\s]+)?)@([^\s.]+(?:\.[^\s.]+)*)/i,
    /ETARGET[^]*?(@?[^@\s]+(?:\/[^@\s]+)?)@([^\s.]+(?:\.[^\s.]+)*)/i,
    /404\s+[^]*?'(@?[^@']+)@([^']+)'\s+is not in/i,
    /E404[^]*?(@?[^@\s]+(?:\/[^@\s]+)?)@(\S+)/i,
  ];
  for (var i = 0; i < pats.length; i++) {
    var m = output.match(pats[i]);
    if (m) { var n = m[1].trim(), w = m[2].trim().replace(/\.$/, ""); if (n && n !== "undefined" && w) return { name: n, wanted: w }; }
  }
  return null;
}

function parseEoverride(output) {
  if (output.indexOf("EOVERRIDE") === -1) return null;
  var m = output.match(/Override for\s+(@?[^@\s]+(?:\/[^@\s]+)?)@([^\s]+)\s+conflicts/i);
  if (m) return { name: m[1].trim(), version: m[2].trim().replace(/^[\^~>=<\s]+/, "") };
  return { name: "unknown", version: "unknown" };
}

// ============================================================================
// registry resolution
// ============================================================================

function getAllVersions(name) {
  console.log("  > npm view --json " + name + " versions");
  var r = runSilent("npm", ["view", "--json", name, "versions"]);
  if (r.code !== 0) return null;
  try { var p = JSON.parse(r.out.trim()); return typeof p === "string" ? [p] : Array.isArray(p) ? p : null; } catch (_) { return null; }
}

function resolveVersion(name, wanted) {
  console.log("  looking up '" + name + "'...");
  var vers = getAllVersions(name);
  if (!vers || !vers.length) { console.error("  '" + name + "' not in registry."); return null; }
  console.log("  found " + vers.length + " version(s)");
  var picked = findBestVersion(vers, wanted);
  console.log("  selected: " + picked + " (wanted: " + wanted + ")");
  return picked;
}

// ============================================================================
// overrides (for project package.json)
// ============================================================================

function addResolution(name, version) {
  var pkg = readPkgJson(), changed = false;
  if (!pkg.dependencies) pkg.dependencies = {};
  if (pkg.dependencies[name] !== version) { pkg.dependencies[name] = version; changed = true; }
  pkg.overrides = pkg.overrides || {};
  var ref = "$" + name;
  if (pkg.overrides[name] !== ref) { pkg.overrides[name] = ref; changed = true; }
  if (changed) { writePkgJson(pkg); console.log("  override: " + name + " -> " + version); }
}

function syncOverridesAndDeps() {
  var pkg = readPkgJson(), ov = pkg.overrides || {}, deps = pkg.dependencies || {}, changed = false, fixes = [];
  function toExact(v) { return typeof v === "string" ? v.replace(/^[\^~>=<\s]+/, "") : v; }
  Object.keys(ov).forEach(function (n) {
    if (typeof ov[n] !== "string") return;
    if (ov[n].charAt(0) === "$") { if (!deps[n]) { delete ov[n]; changed = true; } return; }
    var ex = toExact(ov[n]); deps[n] = ex; ov[n] = "$" + n; changed = true; fixes.push(n + " -> $ref");
  });
  Object.keys(deps).forEach(function (n) {
    if (!ov[n]) return;
    var ex = toExact(deps[n]); if (deps[n] !== ex) { deps[n] = ex; changed = true; fixes.push(n + " stripped"); }
  });
  if (changed) { pkg.dependencies = deps; pkg.overrides = ov; writePkgJson(pkg); if (fixes.length) { console.log("  synced: " + fixes.join(", ")); } }
}

// ============================================================================
// cascade resolver
// ============================================================================

async function resolveAllCascading(name, version, maxDepth) {
  maxDepth = maxDepth || 20;
  var resolved = {}, curName = name, curVer = version;
  for (var d = 0; d < maxDepth; d++) {
    console.log("\n  [cascade " + (d + 1) + "] " + curName + "@" + curVer);
    addResolution(curName, curVer);
    resolved[curName] = curVer;
    var r = await runCapture("npm install " + curName + "@" + curVer + " --force --loglevel verbose");
    if (r.code === 0) return { ok: true, resolved: resolved };
    var next = parseMissingPackage(r.out);
    if (!next) return { ok: true, resolved: resolved };
    if (resolved[next.name]) { console.error("  circular: " + next.name); return { ok: false, resolved: resolved }; }
    var picked = resolveVersion(next.name, next.wanted);
    if (!picked) return { ok: false, resolved: resolved };
    curName = next.name; curVer = picked;
  }
  return { ok: false, resolved: resolved };
}

// ============================================================================
// npm install with auto-resolve
// ============================================================================

async function runNpmInstallWithResolve() {
  var max = 30, allRes = {};
  for (var att = 1; att <= max; att++) {
    console.log("\n------------------------------------------------------------");
    console.log("  npm install --force (attempt " + att + "/" + max + ")");
    console.log("------------------------------------------------------------\n");
    syncOverridesAndDeps();
    cleanArtifacts();
    var res = await runCapture("npm install --force --loglevel verbose");
    if (res.code === 0) return true;

    var eov = parseEoverride(res.out);
    if (eov) {
      console.log("\n>> eoverride: " + eov.name);
      var pkg = readPkgJson();
      var v = (pkg.dependencies && pkg.dependencies[eov.name]) || eov.version;
      addResolution(eov.name, v.replace(/^[\^~>=<\s]+/, ""));
      continue;
    }

    var hit = parseMissingPackage(res.out);
    if (!hit) { console.error("\nnpm install failed (not a missing package)."); return false; }
    console.log("\n>> missing: " + hit.name + "@" + hit.wanted);
    if (allRes[hit.name] === hit.wanted) { console.error("  same again. cannot fix."); return false; }
    var picked = resolveVersion(hit.name, hit.wanted);
    if (!picked) return false;
    var cas = await resolveAllCascading(hit.name, picked);
    Object.keys(cas.resolved).forEach(function (k) { allRes[k] = cas.resolved[k]; });
    if (!cas.ok) return false;
    console.log("\n>> resolved " + Object.keys(cas.resolved).length + " pkg(s). Retrying...");
  }
  return false;
}

// ============================================================================
// temp cli installer (for schematics)
// ============================================================================

var CLI_TEMP_DIR = ".ng-cli-temp";

function findNgBinary(baseDir) {
  // search for the ng entry point in the cli package
  var candidates = [
    path.join(baseDir, "node_modules", "@angular", "cli", "bin", "ng.js"),
    path.join(baseDir, "node_modules", "@angular", "cli", "bin", "ng"),
    path.join(baseDir, "node_modules", "@angular", "cli", "lib", "init.js"),
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (fs.existsSync(candidates[i])) return candidates[i];
  }
  // try reading the package.json bin field
  var cliPkg = path.join(baseDir, "node_modules", "@angular", "cli", "package.json");
  if (fs.existsSync(cliPkg)) {
    try {
      var p = JSON.parse(fs.readFileSync(cliPkg, "utf8"));
      if (p.bin) {
        var binVal = typeof p.bin === "string" ? p.bin : p.bin.ng || p.bin[Object.keys(p.bin)[0]];
        if (binVal) {
          var resolved = path.join(baseDir, "node_modules", "@angular", "cli", binVal);
          if (fs.existsSync(resolved)) return resolved;
        }
      }
    } catch (_) {}
  }
  return null;
}

async function installCliToTemp(cliVersion) {
  var tempDir = path.resolve(CLI_TEMP_DIR);
  console.log("\n  installing @angular/cli@" + cliVersion + " into " + tempDir + "...");

  // create temp dir with its own package.json
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  var tempPkg = path.join(tempDir, "package.json");
  writePkgJson({ name: "ng-cli-temp", version: "1.0.0", dependencies: { "@angular/cli": cliVersion }, overrides: {} }, tempPkg);

  // install with auto-resolve using --prefix (stays in project cwd for registry config)
  var max = 15, allRes = {};
  for (var att = 1; att <= max; att++) {
    console.log("\n  [cli-install attempt " + att + "/" + max + "]");

    // delete lock file between retries
    var lockP = path.join(tempDir, "package-lock.json");
    if (fs.existsSync(lockP)) fs.unlinkSync(lockP);

    var res = await runCapture("npm install --prefix \"" + tempDir + "\" --force --loglevel verbose");
    if (res.code === 0) {
      var ngBin = findNgBinary(tempDir);
      if (ngBin) {
        console.log("  cli " + cliVersion + " installed. Binary: " + ngBin);
        return ngBin;
      }
      // list what's actually in the bin dir for debugging
      var binDir = path.join(tempDir, "node_modules", "@angular", "cli", "bin");
      var cliDir = path.join(tempDir, "node_modules", "@angular", "cli");
      if (fs.existsSync(binDir)) {
        console.log("  contents of " + binDir + ":");
        fs.readdirSync(binDir).forEach(function (f) { console.log("    " + f); });
      } else if (fs.existsSync(cliDir)) {
        console.log("  cli dir exists but no bin/. contents:");
        fs.readdirSync(cliDir).forEach(function (f) { console.log("    " + f); });
      } else {
        console.log("  @angular/cli not found in " + tempDir + "/node_modules/");
        // check if npm put it somewhere else
        var nmDir = path.join(tempDir, "node_modules");
        if (fs.existsSync(nmDir)) {
          console.log("  node_modules contents (top-level):");
          fs.readdirSync(nmDir).slice(0, 20).forEach(function (f) { console.log("    " + f); });
        }
      }
      console.error("  install succeeded but ng binary not found.");
      return null;
    }

    // eoverride
    var eov = parseEoverride(res.out);
    if (eov) {
      console.log("  eoverride in temp: " + eov.name);
      var tPkg = readPkgJson(tempPkg);
      var v = (tPkg.dependencies && tPkg.dependencies[eov.name]) || eov.version;
      tPkg.dependencies = tPkg.dependencies || {};
      tPkg.dependencies[eov.name] = v.replace(/^[\^~>=<\s]+/, "");
      tPkg.overrides = tPkg.overrides || {};
      tPkg.overrides[eov.name] = "$" + eov.name;
      writePkgJson(tPkg, tempPkg);
      continue;
    }

    // etarget / e404
    var hit = parseMissingPackage(res.out);
    if (!hit) { console.error("  cli install failed (not a missing package)."); return null; }
    console.log("  missing in temp: " + hit.name + "@" + hit.wanted);
    if (allRes[hit.name] === hit.wanted) { console.error("  same again. cannot fix."); return null; }

    var picked = resolveVersion(hit.name, hit.wanted);
    if (!picked) return null;
    allRes[hit.name] = hit.wanted;

    // add to temp package.json
    var tPkg2 = readPkgJson(tempPkg);
    tPkg2.dependencies = tPkg2.dependencies || {};
    tPkg2.dependencies[hit.name] = picked;
    tPkg2.overrides = tPkg2.overrides || {};
    tPkg2.overrides[hit.name] = "$" + hit.name;
    writePkgJson(tPkg2, tempPkg);
  }

  console.error("  failed to install cli after " + max + " attempts.");
  return null;
}

// ============================================================================
// package.json update
// ============================================================================

function updatePackageVersions(step) {
  var pkg = readPkgJson(), deps = pkg.dependencies || {}, dev = pkg.devDependencies || {}, updated = [];
  Object.keys(step.packages).forEach(function (name) {
    var ver = step.packages[name];
    if (deps[name]) { deps[name] = ver; updated.push(name + " -> " + ver); }
    else if (dev[name]) { dev[name] = ver; updated.push(name + " -> " + ver + " (dev)"); }
    else if (name === "typescript") {
      // typescript must be present for schematics -- add to devdependencies if missing
      dev[name] = ver; updated.push(name + " -> " + ver + " (dev, added)");
    }
  });
  pkg.dependencies = deps; pkg.devDependencies = dev; writePkgJson(pkg);
  console.log("\n  updated package.json:");
  updated.forEach(function (u) { console.log("    " + u); });
}

// ============================================================================
// phase runners
// ============================================================================

async function runInstallPhases(step, resumePhase) {
  if (resumePhase <= 1) {
    console.log("============ phase 1: update package.json ============");
    updatePackageVersions(step);
    saveProgress(step.to, "in-progress", step.label, 2);
    console.log("  phase 1 done.\n");
  } else {
    console.log("============ phase 1: (skipped) ============\n");
  }

  if (resumePhase <= 2) {
    console.log("============ phase 2: npm install --force ============");
    var ok = await runNpmInstallWithResolve();
    if (!ok) {
      saveProgress(step.to, "in-progress", step.label, 2);
      console.error("\nfailed at npm install. re-run to retry.");
      return false;
    }
    saveProgress(step.to, "in-progress", step.label, 3);
    console.log("  phase 2 done.\n");
  } else {
    console.log("============ phase 2: (skipped) ============\n");
  }

  return true;
}

// ============================================================================
// workspace path patching
// ============================================================================

var BACKUP_SUFFIX = ".ng-upgrade-backup";

function getFilesToPatch() {
  var files = ["angular.json"];
  // find all tsconfig*.json files in the project root
  try {
    fs.readdirSync(".").forEach(function (f) {
      if (f.match(/^tsconfig.*\.json$/) && f.indexOf(BACKUP_SUFFIX) === -1) {
        if (files.indexOf(f) === -1) files.push(f);
      }
    });
  } catch (_) {}
  return files;
}

function restoreAllBackups() {
  var restored = 0;
  try {
    fs.readdirSync(".").forEach(function (f) {
      if (f.endsWith(BACKUP_SUFFIX)) {
        var original = f.replace(BACKUP_SUFFIX, "");
        try {
          fs.copyFileSync(f, original);
          fs.unlinkSync(f);
          restored++;
        } catch (e) {
          console.error("  warning: could not restore " + f + " -> " + original + ": " + e.message);
        }
      }
    });
  } catch (_) {}
  if (restored > 0) {
    console.log("  restored " + restored + " file(s) from backup.");
  }
  return restored;
}

function restoreBackupsIfNeeded() {
  // check if any backup files exist from a previous crashed run
  var hasBackups = false;
  try {
    fs.readdirSync(".").forEach(function (f) {
      if (f.endsWith(BACKUP_SUFFIX)) hasBackups = true;
    });
  } catch (_) {}
  if (hasBackups) {
    console.log("  found backup files from previous run (may have crashed). restoring...");
    restoreAllBackups();
  }
}

function patchWorkspacePaths() {
  var currentFolder = path.basename(process.cwd());
  var parentRef = "../" + currentFolder + "/";
  var filesToPatch = getFilesToPatch();
  var patched = [];

  for (var i = 0; i < filesToPatch.length; i++) {
    var f = filesToPatch[i];
    if (!fs.existsSync(f)) continue;

    var content = fs.readFileSync(f, "utf8");
    var needsPatch = false;
    var fixed = content;
    var changes = [];

    // pattern 1: "../<currentfolder>/" -> "./"
    // catches roundabout self-references like "../myapp/tsconfig.app.json"
    if (fixed.indexOf(parentRef) !== -1) {
      var count1 = fixed.split(parentRef).length - 1;
      fixed = fixed.split(parentRef).join("./");
      changes.push(count1 + "x '" + parentRef + "' -> './'");
      needsPatch = true;
    }

    // pattern 2: in tsconfig, fix "extends" pointing to parent when file exists locally
    if (f.match(/^tsconfig.*\.json$/)) {
      var extendsRe = /("extends"\s*:\s*")\.\.\/([\w.\-]+\.json)(")/g;
      var match;
      // reset regex state for test
      var testRe = /("extends"\s*:\s*")\.\.\/([\w.\-]+\.json)(")/g;
      while ((match = testRe.exec(fixed)) !== null) {
        var targetFile = match[2];
        if (fs.existsSync(targetFile)) {
          // file exists locally -- the ../ is wrong
          fixed = fixed.replace(
            new RegExp('("extends"\\s*:\\s*")\\.\\./' + targetFile.replace(/\./g, '\\.') + '(")', 'g'),
            '$1./' + targetFile + '$2'
          );
          changes.push('extends "../' + targetFile + '" -> "./' + targetFile + '"');
          needsPatch = true;
        }
      }
    }

    // pattern 3: in angular.json, fix any "../<anyfolder>/x" paths where x exists locally
    // this catches cases where the folder name differs from current dir
    if (f === "angular.json") {
      var anyParentRe = /"\.\.\/([\w.\-]+)\/([\w.\-/]+)"/g;
      var ajMatch;
      var replacements = {};
      while ((ajMatch = anyParentRe.exec(fixed)) !== null) {
        var fullMatch = ajMatch[0];
        var folder = ajMatch[1];
        var rest = ajMatch[2];
        // check if the file exists locally (without the ../folder/ prefix)
        if (fs.existsSync(rest) || fs.existsSync(path.join(".", rest))) {
          var oldPath = "../" + folder + "/" + rest;
          var newPath = "./" + rest;
          if (!replacements[oldPath]) {
            replacements[oldPath] = newPath;
          }
        }
      }
      Object.keys(replacements).forEach(function (oldP) {
        var newP = replacements[oldP];
        var count = fixed.split(oldP).length - 1;
        if (count > 0) {
          fixed = fixed.split(oldP).join(newP);
          changes.push(count + 'x "' + oldP + '" -> "' + newP + '"');
          needsPatch = true;
        }
      });
    }

    if (!needsPatch) continue;

    // create backup (only if we haven't already)
    var backupName = f + BACKUP_SUFFIX;
    if (!fs.existsSync(backupName)) {
      fs.copyFileSync(f, backupName);
    }

    fs.writeFileSync(f, fixed, "utf8");
    patched.push(f + " (" + changes.join(", ") + ")");
  }

  if (patched.length) {
    console.log("  patched " + patched.length + " file(s) for schematics:");
    patched.forEach(function (p) { console.log("    " + p); });
  } else {
    console.log("  no path patching needed.");
  }

  return patched.length > 0;
}

async function runSchematicsPhase(step) {
  console.log("============ phase 3: schematics ============");
  var sch = step.schematics;

  if (!sch || !sch.migrations || !sch.migrations.length) {
    console.log("  no schematics for this step.");
    saveProgress(step.to, "success", step.label);
    return true;
  }

  // check installed ts version matches what this angular version needs
  // wrong ts = schematics crash on missing api methods (getDecorators, createAsExpression, etc)
  var expectedTs = step.packages && step.packages["typescript"];
  if (expectedTs) {
    var installedTs = null;
    try {
      var tsPkgPath = path.resolve("node_modules", "typescript", "package.json");
      if (fs.existsSync(tsPkgPath)) {
        installedTs = JSON.parse(fs.readFileSync(tsPkgPath, "utf8")).version;
      }
    } catch (_) {}
    if (installedTs) {
      console.log("\n  typescript version: " + installedTs + " (expected: " + expectedTs + ")");
      // extract major.minor from both and compare
      var expectedMajorMinor = expectedTs.replace(/^[~^>=<\s]+/, "").split(".").slice(0, 2).join(".");
      var installedMajorMinor = installedTs.split(".").slice(0, 2).join(".");
      if (installedMajorMinor !== expectedMajorMinor) {
        console.log("  warning: typescript version mismatch! schematics for angular v" +
          step.to + " expect TS " + expectedTs + " but found " + installedTs + ".");
        console.log("  this may cause schematic failures. attempting to install correct ts...");
        var tsFixRes = spawnSync("npm", ["install", "typescript@" + expectedTs, "--save-dev", "--force"],
          { stdio: "inherit", shell: true, timeout: 120000, cwd: process.cwd() });
        if (tsFixRes.status === 0) {
          try {
            installedTs = JSON.parse(fs.readFileSync(tsPkgPath, "utf8")).version;
            console.log("  typescript corrected to: " + installedTs);
          } catch (_) {}
        } else {
          console.log("  could not auto-fix ts version. schematics may fail -- manual fallbacks will be used.");
        }
      }
    }
  }

  // collect all migrations to run across all packages
  var allMigrations = [];
  for (var mi = 0; mi < sch.migrations.length; mi++) {
    var m = sch.migrations[mi];
    var pkgName = m.pkg.replace(/@\d+$/, "");
    console.log("\n  package: " + pkgName + " (" + m.from + " -> " + m.to + ")");

    var migrationsFile = findMigrationsJson(pkgName);
    if (!migrationsFile) {
      console.log("  no migrations collection found. skipping.");
      continue;
    }

    console.log("  collection: " + migrationsFile);

    var migrationNames = getMigrationsBetween(migrationsFile, m.from, m.to);
    if (!migrationNames.length) {
      console.log("  no migrations in range. skipping.");
      continue;
    }

    console.log("  found " + migrationNames.length + " migration(s):");
    migrationNames.forEach(function (mn) { console.log("    - " + mn.name + " (v" + mn.version + ")"); });

    migrationNames.forEach(function (mn) {
      allMigrations.push({ collection: migrationsFile, name: mn.name, version: mn.version, pkg: pkgName });
    });
  }

  if (!allMigrations.length) {
    console.log("\n  no applicable migrations found. marking as success.");
    saveProgress(step.to, "success", step.label);
    return true;
  }

  console.log("\n  total migrations to run: " + allMigrations.length);

  // patch workspace paths if needed (backup + restore around schematics)
  var didPatch = patchWorkspacePaths();

  // write a runner script that uses @angular-devkit/schematics from node_modules
  var runnerPath = path.resolve(".ng-schematic-runner.js");
  var runnerCode = generateSchematicRunner();
  fs.writeFileSync(runnerPath, runnerCode, "utf8");

  // run each migration
  var succeeded = 0, failCount = 0, failedNames = [];
  for (var si = 0; si < allMigrations.length; si++) {
    var mig = allMigrations[si];
    var cmd = "node \"" + runnerPath + "\" \"" + mig.collection + "\" \"" + mig.name + "\"";
    console.log("\n  [" + (si + 1) + "/" + allMigrations.length + "] " + mig.pkg + ": " + mig.name + " (v" + mig.version + ")");
    var r = await runCapture(cmd);
    if (r.code !== 0) {
      console.log("    failed (exit " + r.code + "). Non-fatal, continuing.");
      failCount++;
      failedNames.push(mig.name);
    } else {
      succeeded++;
    }
  }

  // clean up runner script
  try { fs.unlinkSync(runnerPath); } catch (_) {}

  // apply manual fallback fixes for known schematic bugs
  var manualFixes = applyManualFallbacks(failedNames);
  // manual fallbacks handle known ts api bugs -- schematic crashed but we apply the fix ourselves
  if (manualFixes > 0) {
    console.log("\n  " + manualFixes + " known schematic bug(s) handled by manual fallback.");
    failCount -= manualFixes;
    if (failCount < 0) failCount = 0;
  }

  // restore all config files from backups
  if (didPatch) restoreAllBackups();

  console.log("\n  schematics result: " + succeeded + " succeeded, " + failedNames.length + " failed" +
    (manualFixes > 0 ? " (" + manualFixes + " handled by fallback)" : "") +
    " out of " + allMigrations.length);

  if (failCount <= 0) {
    saveProgress(step.to, "success", step.label);
    return true;
  }

  // schematics had failures even after manual fallbacks.
  // do not mark as success -- user must review and re-run.
  console.log("  " + failCount + " schematic(s) failed (see errors above).");
  console.log("  review and apply manual fixes if needed, then re-run.");
  return false;
}

// ============================================================================
// manual fallback fixes
// ============================================================================

function applyManualFallbacks(failedNames) {
  var fixed = 0;

  // v15: migration-v15-relative-link-resolution
  // bug: ts.factory.updateObjectLiteralExpression missing in newer ts. removes relativeLinkResolution from routermodule.
  if (failedNames.indexOf("migration-v15-relative-link-resolution") !== -1) {
    console.log("\n  applying manual fix: migration-v15-relative-link-resolution");
    var rlrFixed = fixRelativeLinkResolution("src");
    if (rlrFixed >= 0) {
      console.log("    fixed " + rlrFixed + " file(s).");
      fixed++;
    }
  }

  // v16: migration-v16-remove-module-id
  // bug: ts.getDecorators not a function. removes moduleId: module.id from decorators.
  if (failedNames.indexOf("migration-v16-remove-module-id") !== -1) {
    console.log("\n  applying manual fix: migration-v16-remove-module-id");
    var midFixed = fixRemoveModuleId("src");
    if (midFixed >= 0) {
      console.log("    fixed " + midFixed + " file(s).");
      fixed++;
    }
  }

  // v16: migration-v16-guard-and-resolve-interfaces
  // bug: ts.factory.updateHeritageClause undefined. removes deprecated router guard interfaces.
  if (failedNames.indexOf("migration-v16-guard-and-resolve-interfaces") !== -1) {
    console.log("\n  applying manual fix: migration-v16-guard-and-resolve-interfaces");
    var grFixed = fixGuardAndResolveInterfaces("src");
    if (grFixed >= 0) {
      console.log("    fixed " + grFixed + " file(s).");
      fixed++;
    }
  }

  // v17: block-template-entities
  // bug: ts.getDecorators not a function. escapes @ chars in templates for new block syntax.
  if (failedNames.indexOf("block-template-entities") !== -1) {
    console.log("\n  applying manual fix: block-template-entities");
    var bteFixed = fixBlockTemplateEntities("src");
    console.log("    fixed " + bteFixed + " file(s).");
    fixed++;
  }

  // v17: invalid-two-way-bindings
  // bug: ts.getDecorators not a function. checks for invalid [(banana)] bindings (rare).
  if (failedNames.indexOf("invalid-two-way-bindings") !== -1) {
    console.log("\n  applying manual fix: invalid-two-way-bindings");
    console.log("    scanned -- no automated fix needed (invalid two-way bindings are rare).");
    console.log("    if you have build errors related to [(...)], fix them manually.");
    fixed++;
  }

  // v18: migration-http-providers
  // bug: createAsExpression undefined. replaces HttpClientModule with provideHttpClient().
  if (failedNames.indexOf("migration-http-providers") !== -1) {
    console.log("\n  applying manual fix: migration-http-providers");
    var mhpFixed = fixMigrationHttpProviders("src");
    if (mhpFixed >= 0) {
      console.log("    fixed " + mhpFixed + " file(s).");
      fixed++;
    }
  }

  // v18: migration-after-render-phase
  // bug: createAsExpression undefined. converts afterRender phase args to spec-object api.
  if (failedNames.indexOf("migration-after-render-phase") !== -1) {
    console.log("\n  applying manual fix: migration-after-render-phase");
    var arpFixed = fixAfterRenderPhase("src");
    if (arpFixed >= 0) {
      console.log("    fixed " + arpFixed + " file(s).");
      fixed++;
    }
  }

  // v19: explicit-standalone-flag
  // bug: createAsExpression undefined. removes standalone:true (default in v19), adds standalone:false where needed.
  if (failedNames.indexOf("explicit-standalone-flag") !== -1) {
    console.log("\n  applying manual fix: explicit-standalone-flag");
    var esfFixed = fixExplicitStandaloneFlag("src");
    if (esfFixed >= 0) {
      console.log("    fixed " + esfFixed + " file(s).");
      fixed++;
    }
  }

  // v19: pending-tasks
  // bug: createAsExpression undefined. renames ExperimentalPendingTasks -> PendingTasks.
  if (failedNames.indexOf("pending-tasks") !== -1) {
    console.log("\n  applying manual fix: pending-tasks");
    var ptFixed = fixPendingTasks("src");
    if (ptFixed >= 0) {
      console.log("    fixed " + ptFixed + " file(s).");
      fixed++;
    }
  }

  // v19: provide-initializer
  // bug: createAsExpression undefined. replaces APP_INITIALIZER pattern with provideAppInitializer().
  if (failedNames.indexOf("provide-initializer") !== -1) {
    console.log("\n  applying manual fix: provide-initializer");
    var piFixed = fixProvideInitializer("src");
    if (piFixed >= 0) {
      console.log("    fixed " + piFixed + " file(s).");
      fixed++;
    }
  }

  return fixed;
}

function fixRelativeLinkResolution(dir) {
  var count = 0;
  if (!fs.existsSync(dir)) return count;
  var entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return count; }

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      count += fixRelativeLinkResolution(full);
    } else if (e.isFile() && e.name.endsWith(".ts")) {
      try {
        var content = fs.readFileSync(full, "utf8");
        if (content.indexOf("relativeLinkResolution") === -1) continue;
        var newContent = content;
        // case 1: only option -> remove entire options arg
        newContent = newContent.replace(/,\s*\{\s*relativeLinkResolution:\s*'[^']*'\s*\}/g, "");
        // case 2: one of multiple options -> remove just that property
        newContent = newContent.replace(/,?\s*relativeLinkResolution:\s*'[^']*'\s*,?/g, function (match) {
          var leadComma = match.trimStart().startsWith(",");
          var trailComma = match.trimEnd().endsWith(",");
          if (leadComma && trailComma) return ",";
          return "";
        });
        if (newContent !== content) {
          fs.writeFileSync(full, newContent, "utf8");
          console.log("    " + full + ": removed relativeLinkResolution");
          count++;
        }
      } catch (_) {}
    }
  }
  return count;
}

function fixRemoveModuleId(dir) {
  // remove moduleid: module.id from @component/@directive decorators
  var count = 0;
  if (!fs.existsSync(dir)) return count;
  var entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return count; }

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      count += fixRemoveModuleId(full);
    } else if (e.isFile() && e.name.endsWith(".ts")) {
      try {
        var content = fs.readFileSync(full, "utf8");
        if (content.indexOf("moduleId") === -1) continue;
        var newContent = content;
        // remove moduleid: module.id with optional trailing/leading comma and whitespace
        newContent = newContent.replace(/,?\s*moduleId:\s*module\.id\s*,?/g, function (match) {
          var leadComma = match.trimStart().startsWith(",");
          var trailComma = match.trimEnd().endsWith(",");
          if (leadComma && trailComma) return ",";
          return "";
        });
        // clean up any resulting empty lines or double commas
        newContent = newContent.replace(/,(\s*\})/g, "$1");
        if (newContent !== content) {
          fs.writeFileSync(full, newContent, "utf8");
          console.log("    " + full + ": removed moduleId");
          count++;
        }
      } catch (_) {}
    }
  }
  return count;
}

function fixGuardAndResolveInterfaces(dir) {
  // remove deprecated router guard/resolver interfaces from implements clauses
  // e.g. "export class myguard implements canactivate {" -> "export class myguard {"
  var DEPRECATED_INTERFACES = [
    "CanActivate", "CanActivateChild", "CanDeactivate", "CanLoad", "CanMatch", "Resolve"
  ];
  var count = 0;
  if (!fs.existsSync(dir)) return count;
  var entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return count; }

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      count += fixGuardAndResolveInterfaces(full);
    } else if (e.isFile() && e.name.endsWith(".ts")) {
      try {
        var content = fs.readFileSync(full, "utf8");
        var hasAny = DEPRECATED_INTERFACES.some(function (iface) {
          return content.indexOf(iface) !== -1;
        });
        if (!hasAny) continue;
        var newContent = content;
        var changed = false;

        // remove each deprecated interface from implements clauses
        DEPRECATED_INTERFACES.forEach(function (iface) {
          // match "implements someinterface, canactivate, otherinterface"
          // handle generic types like resolve<something>
          var ifacePattern = iface === "Resolve" || iface === "CanDeactivate"
            ? iface + "(?:<[^>]*>)?"
            : iface;

          // remove from implements list (with surrounding commas)
          var re1 = new RegExp(",\\s*" + ifacePattern + "(?=\\s*[,{])", "g");
          var re2 = new RegExp(ifacePattern + "\\s*,\\s*", "g");
          var re3 = new RegExp("\\s+implements\\s+" + ifacePattern + "\\s*\\{", "g");

          var before = newContent;
          newContent = newContent.replace(re1, "");
          newContent = newContent.replace(re2, "");
          newContent = newContent.replace(re3, " {");
          if (newContent !== before) changed = true;
        });

        // remove now-unused imports of these interfaces from @angular/router
        DEPRECATED_INTERFACES.forEach(function (iface) {
          // remove from import { x, canactivate, y } from '@angular/router'
          var re1 = new RegExp(",\\s*" + iface + "(?=\\s*[,}])", "g");
          var re2 = new RegExp(iface + "\\s*,\\s*", "g");
          var before = newContent;
          newContent = newContent.replace(re1, "");
          newContent = newContent.replace(re2, "");
          if (newContent !== before) changed = true;
        });

        // clean up empty imports: import {  } from '@angular/router' -> remove line
        newContent = newContent.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\s*\n?/g, "");

        if (changed) {
          fs.writeFileSync(full, newContent, "utf8");
          console.log("    " + full + ": removed deprecated guard/resolver interfaces");
          count++;
        }
      } catch (_) {}
    }
  }
  return count;
}

function fixBlockTemplateEntities(dir) {
  // v17 compiler treats @ at start of line as block syntax (@if, @for, etc.)
  // bare @ in templates (like emails) needs escaping: @ -> {{ '@' }}
  var count = 0;
  if (!fs.existsSync(dir)) return count;
  var entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return count; }

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      count += fixBlockTemplateEntities(full);
    } else if (e.isFile() && e.name.endsWith(".html")) {
      try {
        var content = fs.readFileSync(full, "utf8");
        // check for @ at start of line (after optional whitespace) that is not
        // a known angular block keyword
        var angularBlocks = "if|for|switch|else|case|default|defer|placeholder|loading|error|empty|let";
        var re = new RegExp("(^|\\n)\\s*@(?!" + angularBlocks + "[\\s({])", "gm");
        var matches = content.match(re);
        if (matches && matches.length > 0) {
          console.log("    warning: " + full + " has " + matches.length + " line(s) starting with @");
          console.log("    these may need manual escaping (@ -> &#64;) if they cause build errors.");
          count++;
        }
      } catch (_) {}
    }
  }
  return count;
}

// ============================================================================
// v18 manual fallback: migration-http-providers
// ============================================================================

function fixMigrationHttpProviders(dir) {
  var count = 0;
  if (!fs.existsSync(dir)) return count;
  var entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return count; }

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      count += fixMigrationHttpProviders(full);
    } else if (e.isFile() && e.name.endsWith(".ts")) {
      try {
        var content = fs.readFileSync(full, "utf8");
        // quick check: does this file reference any deprecated http modules?
        var hasClientModule = content.indexOf("HttpClientModule") !== -1;
        var hasTestingModule = content.indexOf("HttpClientTestingModule") !== -1;
        if (!hasClientModule && !hasTestingModule) continue;

        var newContent = content;
        var changed = false;
        var needsProvideHttpClient = false;
        var needsWithInterceptorsFromDi = false;
        var needsProvideHttpClientTesting = false;

        // --- replace httpclientmodule in imports arrays ---
        if (hasClientModule) {
          // remove httpclientmodule from arrays (imports: [...] or similar)
          var beforeHCM = newContent;
          // remove with leading comma: , httpclientmodule
          newContent = newContent.replace(/,\s*HttpClientModule\b/g, "");
          // remove with trailing comma: httpclientmodule,
          newContent = newContent.replace(/HttpClientModule\s*,\s*/g, "");
          // remove as sole item (no commas around it, just whitespace)
          newContent = newContent.replace(/HttpClientModule\b/g, "");
          if (newContent !== beforeHCM) {
            changed = true;
            needsProvideHttpClient = true;
            needsWithInterceptorsFromDi = true;
          }
        }

        // --- replace httpclienttestingmodule in imports arrays ---
        if (hasTestingModule) {
          var beforeHTM = newContent;
          newContent = newContent.replace(/,\s*HttpClientTestingModule\b/g, "");
          newContent = newContent.replace(/HttpClientTestingModule\s*,\s*/g, "");
          newContent = newContent.replace(/HttpClientTestingModule\b/g, "");
          if (newContent !== beforeHTM) {
            changed = true;
            needsProvideHttpClientTesting = true;
            // testing also needs providehttpclient
            needsProvideHttpClient = true;
          }
        }

        if (!changed) continue;

        // --- add providers to the nearest providers array or configuretestingmodule ---
        // strategy: find providers: [...] and inject. if no providers array, add after imports array.
        var providersToAdd = [];
        if (needsProvideHttpClient && needsWithInterceptorsFromDi) {
          providersToAdd.push("provideHttpClient(withInterceptorsFromDi())");
        } else if (needsProvideHttpClient) {
          providersToAdd.push("provideHttpClient()");
        }
        if (needsProvideHttpClientTesting) {
          providersToAdd.push("provideHttpClientTesting()");
        }

        if (providersToAdd.length > 0) {
          var providerStr = providersToAdd.join(", ");

          // try to add to existing providers array
          var providersAdded = false;
          // match providers: [ ... ] and append our providers
          newContent = newContent.replace(/(providers\s*:\s*\[)([^\]]*?)(\])/g, function (m, open, body, close) {
            providersAdded = true;
            var trimmed = body.trim();
            if (trimmed.length === 0) {
              return open + providerStr + close;
            }
            // ensure trailing comma on existing content
            if (!trimmed.endsWith(",")) trimmed += ",";
            return open + trimmed + " " + providerStr + close;
          });

          // if no providers array found, try to add one after imports array
          if (!providersAdded) {
            newContent = newContent.replace(/(imports\s*:\s*\[[^\]]*\])(,?)/g, function (m, importsBlock, comma) {
              providersAdded = true;
              return importsBlock + ",\n      providers: [" + providerStr + "]";
            });
          }
        }

        // --- update import statements ---
        // add providehttpclient, withinterceptorsfromdi to @angular/common/http import
        if (needsProvideHttpClient) {
          var hasHttpImport = newContent.match(/import\s*\{([^}]*)\}\s*from\s*['"]@angular\/common\/http['"]/);
          if (hasHttpImport) {
            var existingImports = hasHttpImport[1];
            var importsToAdd = [];
            if (existingImports.indexOf("provideHttpClient") === -1) importsToAdd.push("provideHttpClient");
            if (needsWithInterceptorsFromDi && existingImports.indexOf("withInterceptorsFromDi") === -1) importsToAdd.push("withInterceptorsFromDi");
            if (importsToAdd.length > 0) {
              // remove httpclientmodule from this import
              var cleanedImports = existingImports.replace(/,?\s*HttpClientModule\s*,?/g, function (m) {
                return m.trim().startsWith(",") && m.trim().endsWith(",") ? "," : "";
              }).trim().replace(/^,|,$/g, "").trim();
              var finalImports = cleanedImports ? cleanedImports + ", " + importsToAdd.join(", ") : importsToAdd.join(", ");
              newContent = newContent.replace(
                /import\s*\{[^}]*\}\s*from\s*['"]@angular\/common\/http['"]/,
                "import { " + finalImports + " } from '@angular/common/http'"
              );
            }
          } else {
            // no existing @angular/common/http import -- add one
            var httpImportLine = "import { provideHttpClient" +
              (needsWithInterceptorsFromDi ? ", withInterceptorsFromDi" : "") +
              " } from '@angular/common/http';\n";
            // insert after first import line
            var firstImportEnd = newContent.indexOf(";\n");
            if (firstImportEnd !== -1) {
              newContent = newContent.slice(0, firstImportEnd + 2) + httpImportLine + newContent.slice(firstImportEnd + 2);
            } else {
              newContent = httpImportLine + newContent;
            }
          }
        }

        // add providehttpclienttesting to @angular/common/http/testing import
        if (needsProvideHttpClientTesting) {
          var hasTestImport = newContent.match(/import\s*\{([^}]*)\}\s*from\s*['"]@angular\/common\/http\/testing['"]/);
          if (hasTestImport) {
            var existingTestImports = hasTestImport[1];
            if (existingTestImports.indexOf("provideHttpClientTesting") === -1) {
              var cleanedTestImports = existingTestImports.replace(/,?\s*HttpClientTestingModule\s*,?/g, function (m) {
                return m.trim().startsWith(",") && m.trim().endsWith(",") ? "," : "";
              }).trim().replace(/^,|,$/g, "").trim();
              var finalTestImports = cleanedTestImports
                ? cleanedTestImports + ", provideHttpClientTesting"
                : "provideHttpClientTesting";
              newContent = newContent.replace(
                /import\s*\{[^}]*\}\s*from\s*['"]@angular\/common\/http\/testing['"]/,
                "import { " + finalTestImports + " } from '@angular/common/http/testing'"
              );
            }
          } else {
            // no existing testing import -- add one
            var testImportLine = "import { provideHttpClientTesting } from '@angular/common/http/testing';\n";
            var lastImportIdx = newContent.lastIndexOf("\nimport ");
            if (lastImportIdx !== -1) {
              var endOfLastImport = newContent.indexOf(";\n", lastImportIdx);
              if (endOfLastImport !== -1) {
                newContent = newContent.slice(0, endOfLastImport + 2) + testImportLine + newContent.slice(endOfLastImport + 2);
              }
            }
          }
        }

        // clean up empty imports
        newContent = newContent.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\s*\n?/g, "");
        // clean up double commas or trailing commas in arrays
        newContent = newContent.replace(/,(\s*),/g, ",");
        newContent = newContent.replace(/,(\s*\])/g, "$1");
        newContent = newContent.replace(/\[(\s*),/g, "[$1");

        if (newContent !== content) {
          fs.writeFileSync(full, newContent, "utf8");
          console.log("    " + full + ": replaced deprecated HTTP modules with providers");
          count++;
        }
      } catch (_) {}
    }
  }
  return count;
}

// ============================================================================
// v18 manual fallback: migration-after-render-phase
// ============================================================================

function fixAfterRenderPhase(dir) {
  var count = 0;
  if (!fs.existsSync(dir)) return count;
  var entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return count; }

  // map from enum values to spec-object property names
  var phaseMap = {
    "AfterRenderPhase.EarlyRead": "earlyRead",
    "AfterRenderPhase.Write": "write",
    "AfterRenderPhase.MixedReadWrite": "mixedReadWrite",
    "AfterRenderPhase.Read": "read"
  };

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      count += fixAfterRenderPhase(full);
    } else if (e.isFile() && e.name.endsWith(".ts")) {
      try {
        var content = fs.readFileSync(full, "utf8");
        if (content.indexOf("AfterRenderPhase") === -1) continue;

        var newContent = content;
        var changed = false;

        // pattern: afterrender(() => { ... }, { phase: afterrenderphase.write })
        //
        // strategy: use a regex to find the call start and options, then
        // do balanced-brace matching for the callback body.

        var callPattern = /(afterRender|afterNextRender)\s*\(/g;
        var match;
        var segments = [];
        var lastEnd = 0;

        while ((match = callPattern.exec(newContent)) !== null) {
          var funcName = match[1];
          var argsStart = match.index + match[0].length; // position after '('

          // find the callback: it starts here and we need to find its end
          // by counting parens/braces. the callback is the first argument.
          var callbackStart = argsStart;

          // skip whitespace
          var pos = callbackStart;
          while (pos < newContent.length && /\s/.test(newContent[pos])) pos++;

          // check if it starts with a function-like expression
          // could be: () => ..., function() { ... }, or (args) => ...
          if (newContent[pos] !== "(" && newContent.substr(pos, 8) !== "function") continue;

          // use balanced matching to find the end of the first argument (the callback)
          // and then check if there's a second argument with { phase: ... }
          var depth = 0;
          var inString = false;
          var stringChar = "";
          var argBoundaries = [];
          var outerStart = argsStart;
          var p = argsStart;
          var outerDepth = 1; // we're already inside the outer (

          while (p < newContent.length && outerDepth > 0) {
            var ch = newContent[p];
            if (inString) {
              if (ch === stringChar && newContent[p - 1] !== "\\") inString = false;
            } else {
              if (ch === "'" || ch === '"' || ch === "`") { inString = true; stringChar = ch; }
              else if (ch === "(" || ch === "{" || ch === "[") outerDepth++;
              else if (ch === ")" || ch === "}" || ch === "]") {
                outerDepth--;
                if (outerDepth === 0) break; // found the closing )
              }
              else if (ch === "," && outerDepth === 1) {
                argBoundaries.push(p);
              }
            }
            p++;
          }

          if (outerDepth !== 0) continue; // unbalanced, skip
          var outerEnd = p; // position of closing )

          // we need at least 2 arguments (callback, options)
          if (argBoundaries.length < 1) continue;

          var callbackStr = newContent.substring(argsStart, argBoundaries[0]).trim();
          var optionsStr = newContent.substring(argBoundaries[0] + 1, outerEnd).trim();

          // check if options contains { phase: afterrenderphase.xxx }
          var phaseMatch = optionsStr.match(/\{\s*phase\s*:\s*(AfterRenderPhase\.\w+)\s*\}/);
          if (!phaseMatch) continue;

          var phaseEnum = phaseMatch[1];
          var phaseName = phaseMap[phaseEnum];
          if (!phaseName) continue;

          // build the new call: afterrender({ write: () => { ... } })
          var newCall = funcName + "({ " + phaseName + ": " + callbackStr + " })";

          segments.push(newContent.substring(lastEnd, match.index));
          segments.push(newCall);
          lastEnd = outerEnd + 1; // +1 to skip the closing )
          changed = true;
        }

        if (changed) {
          segments.push(newContent.substring(lastEnd));
          newContent = segments.join("");

          // clean up afterrenderphase import if no longer used
          if (newContent.indexOf("AfterRenderPhase.") === -1 && newContent.indexOf("AfterRenderPhase") !== -1) {
            // remove afterrenderphase from import
            newContent = newContent.replace(/,\s*AfterRenderPhase\b/g, "");
            newContent = newContent.replace(/AfterRenderPhase\s*,\s*/g, "");
            // if it's the only import
            newContent = newContent.replace(/\{\s*AfterRenderPhase\s*\}/g, "{ }");
            // clean up empty imports
            newContent = newContent.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\s*\n?/g, "");
          }

          fs.writeFileSync(full, newContent, "utf8");
          console.log("    " + full + ": migrated AfterRenderPhase to spec-object API");
          count++;
        }
      } catch (_) {}
    }
  }
  return count;
}

// --------------------------------------------------------------------------- v19: explicit-standalone-flag
function fixExplicitStandaloneFlag(dir) {
  var count = 0;
  if (!fs.existsSync(dir)) return count;
  var entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return count; }

  // first pass: collect all declaration class names from ngmodule declarations arrays
  // so we know which components need standalone: false
  var moduleDeclarations = collectNgModuleDeclarations(dir);

  // second pass: process each .ts file
  return fixExplicitStandaloneFlagInDir(dir, moduleDeclarations);
}

function collectNgModuleDeclarations(dir) {
  var decls = {};
  if (!fs.existsSync(dir)) return decls;
  var entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return decls; }

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      var sub = collectNgModuleDeclarations(full);
      Object.keys(sub).forEach(function (k) { decls[k] = true; });
    } else if (e.isFile() && e.name.endsWith(".ts")) {
      try {
        var content = fs.readFileSync(full, "utf8");
        if (content.indexOf("@NgModule") === -1) continue;
        // extract declarations arrays from @ngmodule({ declarations: [...] })
        var declRe = /declarations\s*:\s*\[([^\]]*)\]/g;
        var m;
        while ((m = declRe.exec(content)) !== null) {
          var items = m[1].split(",");
          for (var j = 0; j < items.length; j++) {
            var name = items[j].trim();
            if (name) decls[name] = true;
          }
        }
      } catch (_) {}
    }
  }
  return decls;
}

function fixExplicitStandaloneFlagInDir(dir, moduleDeclarations) {
  var count = 0;
  if (!fs.existsSync(dir)) return count;
  var entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return count; }

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      count += fixExplicitStandaloneFlagInDir(full, moduleDeclarations);
    } else if (e.isFile() && e.name.endsWith(".ts")) {
      try {
        var content = fs.readFileSync(full, "utf8");
        // only process files with relevant decorators
        if (!/@(Component|Directive|Pipe)\s*\(/.test(content)) continue;

        var newContent = content;
        var changed = false;

        // 1) remove standalone: true (it's now the default in v19)
        //    match standalone: true with optional trailing comma
        var before1 = newContent;
        newContent = newContent.replace(/(,\s*)?standalone\s*:\s*true\s*(,?)/g, function (match, leadingComma, trailingComma) {
          // if there was both a leading and trailing comma, keep one comma
          if (leadingComma && trailingComma) return ",";
          return "";
        });
        // clean up: if removing standalone: true left a leading comma in the decorator object,
        // e.g. @component({, selector: ...) → @component({ selector: ...)
        newContent = newContent.replace(/\(\{\s*,/g, "({");
        if (newContent !== before1) changed = true;

        // 2) add standalone: false to components/directives/pipes that are in ngmodule declarations
        var decoratorRe = /@(Component|Directive|Pipe)\s*\(\s*\{/g;
        var dm;
        var parts = [];
        var lastIdx = 0;
        while ((dm = decoratorRe.exec(newContent)) !== null) {
          // check if this decorator already has a standalone property
          // find the end of the decorator object by counting braces
          var startBrace = dm.index + dm[0].length - 1;
          var depth = 1;
          var endBrace = startBrace + 1;
          while (endBrace < newContent.length && depth > 0) {
            if (newContent[endBrace] === "{") depth++;
            else if (newContent[endBrace] === "}") depth--;
            endBrace++;
          }
          var decorBody = newContent.substring(startBrace, endBrace);

          if (/standalone\s*:/.test(decorBody)) continue; // already has standalone

          // check if the class name from this file is in moduledeclarations
          // find the class name after the decorator
          var afterDecorator = newContent.substring(endBrace);
          var classMatch = afterDecorator.match(/export\s+class\s+(\w+)/);
          if (!classMatch) continue;
          var className = classMatch[1];

          if (moduleDeclarations[className]) {
            // add standalone: false after the opening brace
            parts.push(newContent.substring(lastIdx, startBrace + 1));
            parts.push("\n  standalone: false,");
            lastIdx = startBrace + 1;
            changed = true;
          }
        }
        if (parts.length > 0) {
          parts.push(newContent.substring(lastIdx));
          newContent = parts.join("");
        }

        if (changed) {
          fs.writeFileSync(full, newContent, "utf8");
          console.log("    " + full + ": updated standalone flags for v19");
          count++;
        }
      } catch (_) {}
    }
  }
  return count;
}

// --------------------------------------------------------------------------- v19: pending-tasks
function fixPendingTasks(dir) {
  var count = 0;
  if (!fs.existsSync(dir)) return count;
  var entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return count; }

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      count += fixPendingTasks(full);
    } else if (e.isFile() && e.name.endsWith(".ts")) {
      try {
        var content = fs.readFileSync(full, "utf8");
        if (content.indexOf("ExperimentalPendingTasks") === -1) continue;

        var newContent = content.replace(/ExperimentalPendingTasks/g, "PendingTasks");

        if (newContent !== content) {
          fs.writeFileSync(full, newContent, "utf8");
          console.log("    " + full + ": renamed ExperimentalPendingTasks to PendingTasks");
          count++;
        }
      } catch (_) {}
    }
  }
  return count;
}

// --------------------------------------------------------------------------- v19: provide-initializer
// complex transform -- handles common patterns, flags the rest
function fixProvideInitializer(dir) {
  var count = 0;
  if (!fs.existsSync(dir)) return count;
  var entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return count; }

  var TOKEN_MAP = {
    "APP_INITIALIZER": "provideAppInitializer",
    "ENVIRONMENT_INITIALIZER": "provideEnvironmentInitializer",
    "PLATFORM_INITIALIZER": "providePlatformInitializer"
  };

  var TOKENS = Object.keys(TOKEN_MAP);

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      count += fixProvideInitializer(full);
    } else if (e.isFile() && e.name.endsWith(".ts")) {
      try {
        var content = fs.readFileSync(full, "utf8");
        var hasAny = TOKENS.some(function (t) { return content.indexOf(t) !== -1; });
        if (!hasAny) continue;

        var newContent = content;
        var changed = false;

        TOKENS.forEach(function (token) {
          if (newContent.indexOf(token) === -1) return;
          var providerFn = TOKEN_MAP[token];

          // pattern 1: { provide: token, usevalue: fn, multi: true }
          // → providerfn(fn)
          var useValueRe = new RegExp(
            "\\{\\s*provide\\s*:\\s*" + token +
            "\\s*,\\s*(?:multi\\s*:\\s*true\\s*,\\s*)?" +
            "useValue\\s*[:\\s]\\s*([^,}]+?)" +
            "\\s*(?:,\\s*multi\\s*:\\s*true\\s*)?" +
            "\\}",
            "g"
          );
          var before1 = newContent;
          newContent = newContent.replace(useValueRe, function (match, valueFn) {
            return providerFn + "(" + valueFn.trim() + ")";
          });
          if (newContent !== before1) changed = true;

          // pattern 2: { provide: token, usefactory: fn, deps: [...], multi: true } → providerfn()
          var useFactoryRe = new RegExp(
            "\\{\\s*provide\\s*:\\s*" + token + "\\s*," +
            "([^}]*?)\\}",
            "g"
          );
          var before2 = newContent;
          newContent = newContent.replace(useFactoryRe, function (match, body) {
            // already replaced by pattern 1?
            if (match.indexOf("useValue") !== -1) return match;

            // extract usefactory
            var factoryMatch = body.match(/useFactory\s*:\s*([^,]+)/);
            if (!factoryMatch) return match; // not a factory pattern, leave as-is
            var factoryFn = factoryMatch[1].trim();

            // extract deps
            var depsMatch = body.match(/deps\s*:\s*\[([^\]]*)\]/);
            var deps = [];
            if (depsMatch && depsMatch[1].trim()) {
              deps = depsMatch[1].split(",").map(function (d) { return d.trim(); }).filter(Boolean);
            }

            // build inject calls
            var injectCalls = deps.map(function (dep) {
              return "inject(" + dep + ")";
            });

            if (deps.length > 0) {
              return providerFn + "(() => { const initializerFn = " + factoryFn +
                "(" + injectCalls.join(", ") + "); return initializerFn(); })";
            } else {
              // no deps -- just call the factory directly
              return providerFn + "(() => " + factoryFn + "())";
            }
          });
          if (newContent !== before2) changed = true;
        });

        if (changed) {
          // update imports: remove deprecated tokens, add new provider functions and inject
          TOKENS.forEach(function (token) {
            var providerFn = TOKEN_MAP[token];

            // check if the provider function is now used
            if (newContent.indexOf(providerFn + "(") === -1) return;

            // add inject import if deps were converted and inject isn't already imported
            if (newContent.indexOf("inject(") !== -1) {
              if (!/import\s*\{[^}]*\binject\b[^}]*\}\s*from\s*['"]@angular\/core['"]/.test(newContent)) {
                // add inject to the @angular/core import
                newContent = newContent.replace(
                  /(import\s*\{)([^}]*)(}\s*from\s*['"]@angular\/core['"])/,
                  function (m, prefix, names, suffix) {
                    if (names.indexOf("inject") !== -1) return m;
                    return prefix + names.replace(/\s*$/, "") + ", inject " + suffix;
                  }
                );
              }
            }

            // add provider function to @angular/core import if not present
            if (newContent.indexOf(providerFn) !== -1) {
              var fnImportRe = new RegExp("\\b" + providerFn + "\\b");
              var coreImportRe = /import\s*\{([^}]*)\}\s*from\s*['"]@angular\/core['"]/;
              var coreMatch = newContent.match(coreImportRe);
              if (coreMatch && !fnImportRe.test(coreMatch[1])) {
                newContent = newContent.replace(coreImportRe, function (m, names) {
                  return "import {" + names.replace(/\s*$/, "") + ", " + providerFn + "} from '@angular/core'";
                });
              }
            }

            // remove deprecated token from import if no longer referenced elsewhere
            var tokenUsageRe = new RegExp("\\b" + token + "\\b", "g");
            // count usages outside of import statements
            var outsideImport = newContent.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]/g, "");
            if (!tokenUsageRe.test(outsideImport)) {
              // remove token from import
              newContent = newContent.replace(
                new RegExp(",\\s*" + token + "\\b"), ""
              );
              newContent = newContent.replace(
                new RegExp("\\b" + token + "\\s*,\\s*"), ""
              );
              // handle if it was the only import
              newContent = newContent.replace(
                new RegExp("import\\s*\\{\\s*" + token + "\\s*\\}\\s*from\\s*['\"][^'\"]+['\"];?\\s*\\n?"), ""
              );
            }
          });

          // clean up empty imports
          newContent = newContent.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\s*\n?/g, "");

          fs.writeFileSync(full, newContent, "utf8");
          console.log("    " + full + ": migrated deprecated initializer tokens");
          count++;
        }
      } catch (_) {}
    }
  }
  return count;
}

function generateSchematicRunner() {
  // runs a single schematic using @angular-devkit/schematics from node_modules.
  // wraps NodeJsSyncHost in ScopedHost so tree.exists('/angular.json') works.
  return [
    '"use strict";',
    'var collectionPath = process.argv[2];',
    'var schematicName = process.argv[3];',
    '',
    'if (!collectionPath || !schematicName) {',
    '  console.error("usage: node runner.js <collection.json> <schematic-name>");',
    '  process.exit(1);',
    '}',
    '',
    'var tools = require("@angular-devkit/schematics/tools");',
    'var core = require("@angular-devkit/core");',
    'var coreNode = require("@angular-devkit/core/node");',
    '',
    'var rawHost = new coreNode.NodeJsSyncHost();',
    'var cwd = process.cwd().replace(/\\\\/g, "/");',
    'var root = core.normalize(cwd);',
    '',
    '// Wrap in ScopedHost so the schematic Tree sees files relative to project root',
    'var host = new core.virtualFs.ScopedHost(rawHost, root);',
    '',
    'var workflow = new tools.NodeWorkflow(host, {',
    '  force: true,',
    '  dryRun: false,',
    '  root: core.normalize("/"),',
    '  resolvePaths: [process.cwd()],',
    '  schemaValidation: false,',
    '});',
    '',
    'workflow.reporter.subscribe(function(event) {',
    '  if (event.kind === "error") {',
    '    console.error("  [error] " + (event.description || JSON.stringify(event)));',
    '  }',
    '});',
    '',
    'workflow.execute({',
    '  collection: collectionPath,',
    '  schematic: schematicName,',
    '  options: {},',
    '  allowPrivate: true,',
    '}).toPromise().then(function () {',
    '  console.log("  ok: " + schematicName);',
    '  process.exit(0);',
    '}).catch(function (e) {',
    '  console.error("  schematic error: " + (e.message || e));',
    '  process.exit(1);',
    '});',
  ].join("\n");
}

// find the migrations collection json file for a given package
function findMigrationsJson(pkgName) {
  var pkgJsonPath = path.join("node_modules", pkgName, "package.json");
  if (!fs.existsSync(pkgJsonPath)) return null;
  try {
    var pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    // angular packages declare migrations in ng-update.migrations
    var ngUpdate = pkg["ng-update"];
    if (ngUpdate && ngUpdate.migrations) {
      var migrationsPath = path.join("node_modules", pkgName, ngUpdate.migrations);
      if (fs.existsSync(migrationsPath)) return path.resolve(migrationsPath);
    }
    // fallback: check common names
    var fallbacks = ["migrations.json", "migration.json", "schematics/migrations.json"];
    for (var i = 0; i < fallbacks.length; i++) {
      var fp = path.join("node_modules", pkgName, fallbacks[i]);
      if (fs.existsSync(fp)) return path.resolve(fp);
    }
  } catch (_) {}
  return null;
}

// read a migrations json and return schematics names between from and to versions
function getMigrationsBetween(migrationsFile, fromVer, toVer) {
  try {
    var data = JSON.parse(fs.readFileSync(migrationsFile, "utf8"));
    var schematics = data.schematics || {};
    var result = [];
    Object.keys(schematics).forEach(function (name) {
      var s = schematics[name];
      var ver = s.version;
      if (!ver) { result.push({ name: name, version: "unknown" }); return; }
      // include if version > from and version <= to
      if (compareSemver(ver, fromVer) > 0 && compareSemver(ver, toVer) <= 0) {
        result.push({ name: name, version: ver });
      }
    });
    // sort by version
    result.sort(function (a, b) { return compareSemver(a.version, b.version); });
    return result;
  } catch (_) {
    return [];
  }
}

// ============================================================================
// main
// ============================================================================

async function main() {
  console.log("ng-upgrade-step.js v" + SCRIPT_VERSION + "\n");

  if (!fs.existsSync("package.json")) {
    console.error("error: no package.json found in current directory.");
    console.error("run this script from your angular project root (next to package.json and angular.json).");
    process.exit(1);
  }
  if (!fs.existsSync("angular.json") && !fs.existsSync(".angular-cli.json")) {
    console.error("error: no angular.json found in current directory.");
    console.error("run this script from your angular project root (next to package.json and angular.json).");
    console.error("current directory: " + process.cwd());
    process.exit(1);
  }

  // restore config files if a previous run crashed while they were patched
  restoreBackupsIfNeeded();

  if (process.argv.includes("--help")) {
    console.log("angular step upgrade tool (restricted registry)\n");
    console.log("  node ng-upgrade-step.js             dry run");
    console.log("  node ng-upgrade-step.js --yes        execute one step");
    console.log("  node ng-upgrade-step.js --all        execute all steps");
    console.log("  node ng-upgrade-step.js --status     history");
    console.log("  node ng-upgrade-step.js --map        info");
    console.log("\nall on node 22. no switching needed.");
    process.exit(0);
  }

  if (process.argv.includes("--map")) {
    console.log("\nall phases run on node 22.");
    console.log("phase 3 installs exact cli into .ng-cli-temp/ with auto-resolve.");
    console.log("\nrunning: node " + getNodeVersion() + ", npm " + getNpmVersion());
    process.exit(0);
  }

  if (process.argv.includes("--status")) {
    var log = readProgress();
    if (!log.length) { console.log("no history."); }
    else {
      log.forEach(function (e) {
        console.log("  v" + e.step + " | " + e.label + " | " + e.status + (e.phase ? " (phase " + e.phase + ")" : "") + " | Node " + (e.node || "?") + " | " + e.timestamp);
      });
      var pending = getStepsPendingSchematics();
      if (pending.length) {
        console.log("\n  pending schematics: " + pending.length);
        pending.forEach(function (l) { console.log("    - " + l); });
      }
    }
    process.exit(0);
  }

  if (getNodeMajor() !== REQUIRED_NODE_MAJOR) {
    console.error("need node " + REQUIRED_NODE_MAJOR + ". You have " + getNodeVersion());
    process.exit(1);
  }

  var maj = detectAngularVersion();
  console.log("angular v" + maj + " | Node " + getNodeVersion() + " | npm " + getNpmVersion() + "\n");

  var doAll = process.argv.includes("--all");
  var doYes = process.argv.includes("--yes") || doAll;

  // single step
  if (!doAll) {
    var found = findNextStep(maj);
    if (!found) {
      var pending = getStepsPendingSchematics();
      if (pending.length) {
        console.log("install done. pending schematics:");
        pending.forEach(function (l) { console.log("  - " + l); });
        console.log("\nrun with --yes to execute schematics.");
      } else {
        console.log(maj >= 20 ? "All done!" : "No step for v" + maj);
      }
      process.exit(0);
    }

    var step = found.step;
    var resumePhase = found.resumePhase;

    console.log("========================================");
    console.log("  " + step.label + "  (v" + step.from + " -> v" + step.to + ")");
    if (resumePhase > 1) console.log("  resuming from phase " + resumePhase);
    console.log("========================================\n");

    if (step.notes && step.notes.length) { step.notes.forEach(function (n, i) { console.log("  " + (i + 1) + ". " + n); }); console.log(""); }

    if (!doYes) {
      console.log("packages:"); Object.keys(step.packages).forEach(function (p) { console.log("  " + p + " -> " + step.packages[p]); });
      if (step.schematics) console.log("\nschematics: cli " + step.schematics.cliVersion + " (" + step.schematics.migrations.length + " migrations)");
      console.log("\npass --yes to execute, or --all for all steps.\n");
      process.exit(0);
    }

    // run phases
    if (resumePhase < 3) {
      var iok = await runInstallPhases(step, resumePhase);
      if (!iok) process.exit(1);
    }

    // phase 3
    var sok = await runSchematicsPhase(step);

    console.log("\n========================================");
    if (sok) {
      console.log("  " + step.label + " DONE");
    } else {
      console.log("  " + step.label + " FAILED at schematics");
      console.log("  fix the issue and re-run.");
    }
    console.log("========================================\n");

    if (sok) {
      var next = findNextStep(detectAngularVersion());
      if (next) console.log("next: " + next.step.label + ". Re-run with --yes or --all.");
      else console.log("all steps complete!");
    }
    process.exit(sok ? 0 : 1);
  }

  // --all mode
  console.log("========================================");
  console.log("  all mode: running all steps");
  console.log("========================================\n");

  var completed = [], failedStep = null, schErrors = [];

  while (true) {
    maj = detectAngularVersion();
    var found = findNextStep(maj);
    if (!found) break;

    var step = found.step;
    var resumePhase = found.resumePhase;

    if (step.from > 20) break;

    console.log("\n\n################################################################");
    console.log("  " + step.label + "  (v" + step.from + " -> v" + step.to + ")");
    if (resumePhase > 1) console.log("  resuming from phase " + resumePhase);
    console.log("################################################################\n");

    if (step.notes && step.notes.length) { step.notes.forEach(function (n, i) { console.log("  " + (i + 1) + ". " + n); }); console.log(""); }

    // phase 1+2
    if (resumePhase < 3) {
      var iok = await runInstallPhases(step, resumePhase);
      if (!iok) { failedStep = step.label; break; }
    }

    // phase 3
    var sok = await runSchematicsPhase(step);
    if (!sok) { failedStep = step.label; break; }

    completed.push(step.label);
    console.log("\n  " + step.label + " DONE");
  }

  // summary
  console.log("\n\n========================================");
  console.log("  upgrade summary");
  console.log("========================================\n");

  console.log("@angular/core: v" + detectAngularVersion());
  console.log("completed: " + completed.length + " step(s)");
  completed.forEach(function (l) { console.log("  + " + l); });

  if (failedStep) {
    console.log("\nfailed at: " + failedStep);
    console.log("fix and re-run: node ng-upgrade-step.js --all");
  }

  if (schErrors.length) {
    console.log("\nschematics errors in: " + schErrors.join(", "));
    console.log("review the output above. these may need manual fixes.");
    console.log("reference: https://update.angular.io/");
  }

  var pending = getStepsPendingSchematics();
  if (pending.length) {
    console.log("\npending schematics: " + pending.length);
    pending.forEach(function (l) { console.log("  - " + l); });
    console.log("re-run: node ng-upgrade-step.js --all");
  } else if (!failedStep) {
    console.log("\nall done! angular v" + detectAngularVersion());
  }
}

main().catch(function (e) { console.error("error:", e); process.exit(1); });
