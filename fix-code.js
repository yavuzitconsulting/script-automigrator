"use strict";

var fs = require("fs");
var path = require("path");

var VERSION = 11;
var fixes = [];

function log(msg) { console.log("  " + msg); }
function logFix(msg) { fixes.push(msg); console.log("  [fix] " + msg); }
function logSkip(msg) { console.log("  [skip] " + msg); }
function logWarn(msg) { console.log("  [WARN] " + msg); }

// --- helfer ---

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return null;
  }
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function findFiles(dir, pattern) {
  var results = [];
  if (!fs.existsSync(dir)) return results;

  function walk(d) {
    var entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch (e) {
      return;
    }
    entries.forEach(function (e) {
      var full = path.join(d, e.name);
      if (e.isDirectory() && e.name !== "node_modules" && e.name !== ".git") {
        walk(full);
      } else if (e.isFile() && pattern.test(e.name)) {
        results.push(full);
      }
    });
  }

  walk(dir);
  return results;
}

// tsconfig dateien aus angular.json und arbeitsverzeichnis sammeln
function findTsconfigFiles() {
  var candidates = [];
  var patterns = ["tsconfig.json", "tsconfig.app.json", "tsconfig.spec.json"];

  patterns.forEach(function (p) {
    if (fs.existsSync(p)) candidates.push(p);
  });

  // auch rekursiv nach tsconfig*.json suchen fuer projekte mit ungewoehnlicher struktur
  var found = findFiles(".", /^tsconfig[^/]*\.json$/);
  found.forEach(function (f) {
    var norm = path.normalize(f);
    if (candidates.indexOf(norm) === -1) {
      candidates.push(norm);
    }
  });

  if (fs.existsSync("angular.json")) {
    var aj = readJson("angular.json");
    if (aj && aj.projects) {
      Object.keys(aj.projects).forEach(function (proj) {
        var p = aj.projects[proj];
        if (p.architect) {
          Object.keys(p.architect).forEach(function (target) {
            var opts = p.architect[target] && p.architect[target].options;
            if (opts && opts.tsConfig) {
              var resolved = path.normalize(opts.tsConfig);
              if (fs.existsSync(resolved) && candidates.indexOf(resolved) === -1) {
                candidates.push(resolved);
              }
            }
          });
        }
      });
    }
  }

  return candidates;
}

// --- konfiguration: bekannte symbol-änderungen ---

var symbolFixes = [
  { module: "@angular/compiler", symbol: "templateJitUrl", action: "remove" },
  { module: "@progress/kendo-angular-dropdowns", symbol: "DataService", action: "remove" },
  { module: "@progress/kendo-angular-grid", symbol: "PagerContextService", action: "rename", newName: "ContextService" }
];

// --- konfiguration: symbole die aus ngmodule providers entfernt werden sollen ---
// wenn das symbol nicht mehr importierbar ist, muss es auch aus providers raus

var providerRemovals = [
  { symbol: "DataService", module: "@progress/kendo-angular-dropdowns", reason: "removed in newer kendo versions" }
];

// --- konfiguration: kendo selektor -> modul zuordnung ---

var selectorToModule = {
  "kendo-numerictextbox": { moduleName: "InputsModule", packageName: "@progress/kendo-angular-inputs" },
  "kendo-textbox": { moduleName: "InputsModule", packageName: "@progress/kendo-angular-inputs" },
  "kendo-textarea": { moduleName: "InputsModule", packageName: "@progress/kendo-angular-inputs" },
  "kendo-slider": { moduleName: "InputsModule", packageName: "@progress/kendo-angular-inputs" },
  "kendo-switch": { moduleName: "InputsModule", packageName: "@progress/kendo-angular-inputs" },
  "kendo-maskedtextbox": { moduleName: "InputsModule", packageName: "@progress/kendo-angular-inputs" },
  "kendo-colorpicker": { moduleName: "InputsModule", packageName: "@progress/kendo-angular-inputs" },
  "kendo-rangeslider": { moduleName: "InputsModule", packageName: "@progress/kendo-angular-inputs" },
  "kendo-datepicker": { moduleName: "DateInputsModule", packageName: "@progress/kendo-angular-dateinputs" },
  "kendo-timepicker": { moduleName: "DateInputsModule", packageName: "@progress/kendo-angular-dateinputs" },
  "kendo-datetimepicker": { moduleName: "DateInputsModule", packageName: "@progress/kendo-angular-dateinputs" },
  "kendo-calendar": { moduleName: "DateInputsModule", packageName: "@progress/kendo-angular-dateinputs" },
  "kendo-daterange": { moduleName: "DateInputsModule", packageName: "@progress/kendo-angular-dateinputs" },
  "kendo-dropdownlist": { moduleName: "DropDownsModule", packageName: "@progress/kendo-angular-dropdowns" },
  "kendo-combobox": { moduleName: "DropDownsModule", packageName: "@progress/kendo-angular-dropdowns" },
  "kendo-autocomplete": { moduleName: "DropDownsModule", packageName: "@progress/kendo-angular-dropdowns" },
  "kendo-multiselect": { moduleName: "DropDownsModule", packageName: "@progress/kendo-angular-dropdowns" },
  "kendo-dropdowntree": { moduleName: "DropDownsModule", packageName: "@progress/kendo-angular-dropdowns" },
  "kendo-dialog": { moduleName: "DialogModule", packageName: "@progress/kendo-angular-dialog" },
  "kendo-window": { moduleName: "DialogModule", packageName: "@progress/kendo-angular-dialog" },
  "kendo-upload": { moduleName: "UploadsModule", packageName: "@progress/kendo-angular-upload" },
  "kendo-fileselect": { moduleName: "UploadsModule", packageName: "@progress/kendo-angular-upload" },
  "kendo-treeview": { moduleName: "TreeViewModule", packageName: "@progress/kendo-angular-treeview" },
  "kendo-grid": { moduleName: "GridModule", packageName: "@progress/kendo-angular-grid" },
  "kendo-buttongroup": { moduleName: "ButtonsModule", packageName: "@progress/kendo-angular-buttons" },
  "kendo-splitbutton": { moduleName: "ButtonsModule", packageName: "@progress/kendo-angular-buttons" },
  "kendo-dropdownbutton": { moduleName: "ButtonsModule", packageName: "@progress/kendo-angular-buttons" },
  "kendo-tooltip": { moduleName: "TooltipModule", packageName: "@progress/kendo-angular-tooltip" },
  "kendo-chart": { moduleName: "ChartsModule", packageName: "@progress/kendo-angular-charts" },
  "kendo-listview": { moduleName: "ListViewModule", packageName: "@progress/kendo-angular-listview" },
  "kendo-notification": { moduleName: "NotificationModule", packageName: "@progress/kendo-angular-notification" },
  "kendo-menu": { moduleName: "MenusModule", packageName: "@progress/kendo-angular-menu" },
  "kendo-tabstrip": { moduleName: "LayoutModule", packageName: "@progress/kendo-angular-layout" },
  "kendo-panelbar": { moduleName: "LayoutModule", packageName: "@progress/kendo-angular-layout" },
  "kendo-splitter": { moduleName: "LayoutModule", packageName: "@progress/kendo-angular-layout" },
  "kendo-progressbar": { moduleName: "ProgressBarModule", packageName: "@progress/kendo-angular-progressbar" },
  "kendo-scrollview": { moduleName: "ScrollViewModule", packageName: "@progress/kendo-angular-scrollview" }
};

var kendoThemePackages = [
  "@progress/kendo-theme-default",
  "@progress/kendo-theme-bootstrap",
  "@progress/kendo-theme-material",
  "@progress/kendo-theme-fluent",
  "@progress/kendo-theme-classic"
];

// --- browserslist: angular erlaubt nur eine quelle ---

function fixBrowserslist() {
  log("checking browserslist...");

  var pkg = readJson("package.json");
  var hasPkgBrowserslist = pkg && ("browserslist" in pkg);
  var hasBrowserslistrc = fs.existsSync(".browserslistrc");
  var hasBrowserslistFile = fs.existsSync("browserslist");

  var count =
    (hasPkgBrowserslist ? 1 : 0) +
    (hasBrowserslistrc ? 1 : 0) +
    (hasBrowserslistFile ? 1 : 0);

  if (count > 1) {
    if (hasBrowserslistrc) {
      fs.unlinkSync(".browserslistrc");
      logFix("removed .browserslistrc (multiple configs not allowed)");
    }
    if (hasBrowserslistFile) {
      fs.unlinkSync("browserslist");
      logFix("removed browserslist file (multiple configs not allowed)");
    }
    if (!hasPkgBrowserslist) {
      logSkip("removed all browserslist files, using angular defaults");
    } else {
      logSkip("keeping browserslist in package.json");
    }
    return;
  }

  if (count === 0) {
    logSkip("no browserslist config (angular uses defaults)");
  } else {
    logSkip("single browserslist config found");
  }
}

// --- tsconfig: veraltete optionen + fehlende datei-referenzen bereinigen ---

function fixTsconfig() {
  log("checking tsconfig files...");

  var files = findTsconfigFiles();

  files.forEach(function (file) {
    var ts = readJson(file);
    if (!ts) return;

    var changed = false;

    if (ts.compilerOptions) {
      if (ts.compilerOptions.target !== undefined) {
        delete ts.compilerOptions.target;
        changed = true;
      }
      if (ts.compilerOptions.useDefineForClassFields !== undefined) {
        delete ts.compilerOptions.useDefineForClassFields;
        changed = true;
      }
    }

    // dateien aus files-array entfernen die nicht existieren
    if (ts.files && Array.isArray(ts.files)) {
      var dir = path.dirname(file);
      var originalLen = ts.files.length;

      ts.files = ts.files.filter(function (f) {
        var resolved = path.resolve(dir, f);
        if (!fs.existsSync(resolved)) {
          log("  " + file + ": entferne fehlende referenz: " + f);
          return false;
        }
        return true;
      });

      if (ts.files.length < originalLen) {
        changed = true;
        if (ts.files.length === 0) delete ts.files;
      }
    }

    if (changed) {
      writeJson(file, ts);
      logFix(file + ": cleaned up");
    }
  });
}

// --- sass: tilde entfernen, @import zu @use konvertieren ---

function fixSassImports() {
  log("checking sass files...");

  var scssFiles = findFiles("src", /\.scss$/);
  var totalFixed = 0;
  var tildeFixed = 0;

  scssFiles.forEach(function (file) {
    var content = fs.readFileSync(file, "utf8");
    var original = content;

    content = content.replace(/(@use\s+["'])~([^"']+)/g, "$1$2");
    content = content.replace(/(@import\s+["'])~([^"']+)/g, "$1$2");

    if (content !== original) tildeFixed++;

    content = content.replace(
      /@import\s+["']node_modules\/([^"']+)["']\s*;/g,
      function (_, p) {
        return '@use "' + p + '" as *;';
      }
    );

    content = content.replace(
      /@import\s+["'](?!\.|node_modules)([^"']+)["']\s*;/g,
      function (full, p) {
        if (/^(https?:|url\()/.test(p)) return full;
        return '@use "' + p + '" as *;';
      }
    );

    if (content !== original) {
      fs.writeFileSync(file, content, "utf8");
      totalFixed++;
    }
  });

  if (tildeFixed > 0)
    logFix("removed tilde (~) from imports in " + tildeFixed + " scss file(s)");
  if (totalFixed > tildeFixed)
    logFix("converted @import to @use in " + (totalFixed - tildeFixed) + " scss file(s)");
  if (totalFixed === 0) logSkip("no scss import fixes needed");
}

// --- kendo theme scss: kaputte tiefe pfade erkennen und auf scss/all.scss konsolidieren ---

function fixKendoThemePaths() {
  log("checking kendo theme scss paths...");

  var scssFiles = findFiles("src", /\.scss$/);
  var pkg = readJson("package.json") || {};
  var deps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {});

  var totalFixed = 0;
  var missingPackages = {};

  scssFiles.forEach(function (file) {
    var content = fs.readFileSync(file, "utf8");
    var original = content;

    kendoThemePackages.forEach(function (themePkg) {
      var escaped = themePkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // tiefe subpfad-imports erkennen (nicht scss/all.scss selbst)
      var deepPattern = new RegExp(
        "@use\\s+[\"']" + escaped + "\\/scss\\/(?!all\\.scss)[^\"']+[\"']\\s*as\\s*\\*\\s*;",
        "g"
      );

      var matches = content.match(deepPattern);
      if (!matches || matches.length === 0) return;

      if (!deps[themePkg]) {
        missingPackages[themePkg] = true;
      }

      var brokenMatches = [];
      var workingMatches = [];

      matches.forEach(function (m) {
        var importPath = m.match(/["']([^"']+)["']/);
        if (!importPath) return;

        var p = importPath[1];
        var resolved = path.join("node_modules", p);

        if (
          fs.existsSync(resolved) ||
          fs.existsSync(resolved.replace(/\.scss$/, "")) ||
          fs.existsSync(resolved.replace(/\/_index\.scss$/, ".scss"))
        ) {
          workingMatches.push(m);
        } else {
          brokenMatches.push(m);
        }
      });

      if (brokenMatches.length === 0) return;

      var allScssImport = "@use '" + themePkg + "/scss/all.scss' as *;";
      var hasAllImport = content.indexOf(themePkg + "/scss/all.scss") !== -1 ||
                         content.indexOf(themePkg + "/scss/all'") !== -1;

      if (workingMatches.length === 0) {
        // alle kaputt -> zu scss/all.scss zusammenfassen
        var firstReplaced = false;
        matches.forEach(function (m) {
          if (!firstReplaced && !hasAllImport) {
            content = content.replace(m, allScssImport);
            firstReplaced = true;
          } else {
            content = content.replace(m, "// [fix-code] konsolidiert in " + themePkg + "/scss/all.scss");
          }
        });
      } else {
        // einzelne kaputte pfade reparieren
        brokenMatches.forEach(function (m) {
          var importPath = m.match(/["']([^"']+)["']/);
          if (!importPath) return;

          var origPath = importPath[1];
          var withoutIndex = origPath.replace(/\/_index\.scss$/, "");
          var alternatives = [
            withoutIndex + "/_index.scss",
            withoutIndex + ".scss",
            withoutIndex
          ];

          var resolved = false;
          for (var i = 0; i < alternatives.length; i++) {
            if (fs.existsSync(path.join("node_modules", alternatives[i]))) {
              content = content.replace(m, "@use '" + alternatives[i] + "' as *;");
              resolved = true;
              break;
            }
          }

          if (!resolved && !hasAllImport) {
            content = content.replace(m, allScssImport + " // war: " + origPath.split("/").pop());
            hasAllImport = true;
          } else if (!resolved) {
            content = content.replace(m, "// [fix-code] entfernt (nicht auflösbar): " + origPath);
          }
        });
      }
    });

    if (content !== original) {
      fs.writeFileSync(file, content, "utf8");
      totalFixed++;
      logFix("fixed kendo theme scss paths in " + file);
    }
  });

  Object.keys(missingPackages).forEach(function (p) {
    logWarn(p + " wird in scss referenziert aber fehlt in package.json");
    logWarn("  npm install --save " + p);
  });

  if (totalFixed === 0) logSkip("no kendo theme path fixes needed");
}

// --- polyfills.ts: zone.js pfade aktualisieren, triviale datei löschen ---

function fixPolyfills() {
  log("checking polyfills.ts...");

  var file = "src/polyfills.ts";
  if (!fs.existsSync(file)) {
    logSkip("no polyfills.ts");
    return;
  }

  var content = fs.readFileSync(file, "utf8");
  var original = content;

  content = content.replace(/["']zone\.js\/dist\/zone["']/g, '"zone.js"');
  content = content.replace(/["']zone\.js\/dist\/zone-testing["']/g, '"zone.js/testing"');
  content = content.replace(/["']zone\.js\/dist\/([^"']+)["']/g, '"zone.js/$1"');

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    logFix("updated zone.js import paths in polyfills.ts");
  }

  var clean = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim();

  if (/^import\s+['"]zone\.js['"];?$/.test(clean) || clean === "") {
    fs.unlinkSync(file);
    logFix("deleted polyfills.ts (zone.js wird automatisch importiert)");
    removePolyfillsFromAngularJson();
  } else {
    logSkip("polyfills.ts hat eigene polyfills, wird beibehalten");
  }
}

// --- verwaiste polyfills.ts referenzen aus angular.json entfernen ---

function fixPolyfillsReferences() {
  log("checking stale polyfills.ts references...");

  if (fs.existsSync("src/polyfills.ts")) {
    logSkip("polyfills.ts exists");
    return;
  }

  var anyFixed = removePolyfillsFromAngularJson();
  if (!anyFixed) logSkip("no stale polyfills.ts references in angular.json");
}

function removePolyfillsFromAngularJson() {
  if (!fs.existsSync("angular.json")) return false;

  var aj = readJson("angular.json");
  if (!aj || !aj.projects) return false;

  var changed = false;

  Object.keys(aj.projects).forEach(function (proj) {
    var p = aj.projects[proj];

    ["build", "test", "serve"].forEach(function (target) {
      var opts = p.architect && p.architect[target] && p.architect[target].options;
      if (!opts || !opts.polyfills) return;

      if (Array.isArray(opts.polyfills)) {
        var idx = opts.polyfills.indexOf("src/polyfills.ts");
        if (idx !== -1) {
          opts.polyfills.splice(idx, 1);
          changed = true;
        }
        if (opts.polyfills.length === 0) delete opts.polyfills;
      } else if (opts.polyfills === "src/polyfills.ts") {
        delete opts.polyfills;
        changed = true;
      }
    });
  });

  if (changed) {
    writeJson("angular.json", aj);
    logFix("removed polyfills.ts references from angular.json");
  }
  return changed;
}

// --- verwaiste polyfills.ts referenzen aus tsconfig files-arrays entfernen ---
// ergaenzung: tsconfig.app.json kann "files": ["src/main.ts", "src/polyfills.ts"] enthalten

function fixPolyfillsTsconfigReferences() {
  log("checking stale polyfills.ts references in tsconfig files...");

  if (fs.existsSync("src/polyfills.ts")) {
    logSkip("polyfills.ts exists, skipping tsconfig cleanup");
    return;
  }

  var files = findTsconfigFiles();
  var totalFixed = 0;

  files.forEach(function (file) {
    var ts = readJson(file);
    if (!ts || !ts.files || !Array.isArray(ts.files)) return;

    var originalLen = ts.files.length;

    ts.files = ts.files.filter(function (f) {
      // polyfills.ts und polyfills.ngtypecheck.ts entfernen wenn datei nicht existiert
      if (/polyfills[^/]*\.ts$/.test(f)) {
        var dir = path.dirname(file);
        var resolved = path.resolve(dir, f);
        if (!fs.existsSync(resolved)) {
          log("  " + file + ": entferne verwaiste polyfills-referenz: " + f);
          return false;
        }
      }
      return true;
    });

    if (ts.files.length < originalLen) {
      if (ts.files.length === 0) delete ts.files;
      writeJson(file, ts);
      totalFixed++;
      logFix(file + ": removed stale polyfills.ts reference(s)");
    }
  });

  if (totalFixed === 0) logSkip("no stale polyfills.ts references in tsconfig files");
}

// --- HttpClientModule migration: deprecated -> provideHttpClient(withInterceptorsFromDi()) ---

function fixHttpClientModule() {
  log("checking for deprecated HttpClientModule usage...");

  var moduleFiles = findFiles("src", /\.module\.ts$/);
  var totalFixed = 0;

  moduleFiles.forEach(function (file) {
    var content = fs.readFileSync(file, "utf8");
    var original = content;

    // pruefen ob HttpClientModule verwendet wird
    if (content.indexOf("HttpClientModule") === -1) return;

    // --- schritt 1: HttpClientModule aus imports-array des @NgModule entfernen ---
    var ngModuleImports = findNgModuleArray(content, "imports");
    if (ngModuleImports) {
      content = removeSymbolFromNgModuleArray(content, ngModuleImports, "HttpClientModule");
    }

    // --- schritt 2: HttpClientModule aus exports-array des @NgModule entfernen ---
    var ngModuleExports = findNgModuleArray(content, "exports");
    if (ngModuleExports) {
      // nach schritt 1 neu parsen da sich positionen verschoben haben koennten
      ngModuleExports = findNgModuleArray(content, "exports");
      if (ngModuleExports) {
        content = removeSymbolFromNgModuleArray(content, ngModuleExports, "HttpClientModule");
      }
    }

    // --- schritt 3: sicherstellen dass provideHttpClient(withInterceptorsFromDi()) in providers ist ---
    var hasProvideHttpClient = /provideHttpClient\s*\(/.test(content);
    if (!hasProvideHttpClient) {
      var ngModuleProviders = findNgModuleArray(content, "providers");
      if (ngModuleProviders) {
        var before = content.slice(0, ngModuleProviders.closePos);
        var after = content.slice(ngModuleProviders.closePos);
        var trimmed = before.trimEnd();
        var needsComma = /[\w)\]"']$/.test(trimmed);
        content = trimmed + (needsComma ? "," : "") + "\n    provideHttpClient(withInterceptorsFromDi())" + "\n  " + after.trimStart();
      }
    }

    // --- schritt 4: ts-import anpassen ---
    // HttpClientModule import entfernen, provideHttpClient + withInterceptorsFromDi sicherstellen
    var httpImportPattern = /import\s*\{([^}]+)\}\s*from\s*['"]@angular\/common\/http['"]\s*;?/;
    var httpMatch = httpImportPattern.exec(content);

    if (httpMatch) {
      var symbols = httpMatch[1].split(",").map(function (s) { return s.trim(); }).filter(Boolean);

      // HttpClientModule entfernen
      symbols = symbols.filter(function (s) {
        return s.split(/\s+as\s+/)[0].trim() !== "HttpClientModule";
      });

      // provideHttpClient und withInterceptorsFromDi hinzufuegen wenn nicht vorhanden
      var hasProvide = symbols.some(function (s) { return s.split(/\s+as\s+/)[0].trim() === "provideHttpClient"; });
      var hasWithInterceptors = symbols.some(function (s) { return s.split(/\s+as\s+/)[0].trim() === "withInterceptorsFromDi"; });

      if (!hasProvide) symbols.push("provideHttpClient");
      if (!hasWithInterceptors) symbols.push("withInterceptorsFromDi");

      content = content.replace(httpMatch[0],
        "import { " + symbols.join(", ") + " } from '@angular/common/http';"
      );
    } else {
      // kein @angular/common/http import vorhanden, aber HttpClientModule wird verwendet
      // -> import hinzufuegen und HttpClientModule referenz bereinigen
      if (content.indexOf("provideHttpClient") === -1) {
        var importLine = "import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';";
        var lines = content.split("\n");
        var lastImportLine = -1;
        for (var i = 0; i < lines.length; i++) {
          if (/^\s*import\s/.test(lines[i])) {
            var j = i;
            while (j < lines.length && lines[j].indexOf(";") === -1) j++;
            lastImportLine = j;
          }
        }
        if (lastImportLine >= 0) {
          lines.splice(lastImportLine + 1, 0, importLine);
        } else {
          lines.unshift(importLine);
        }
        content = lines.join("\n");
      }
    }

    // --- schritt 5: verwaiste HttpClientModule referenzen bereinigen ---
    // falls nach den array-aenderungen noch ein nacktes HttpClientModule im code steht
    // das nicht teil eines imports ist, ist es ein fehler -> entfernen aus deklarationen
    // (wird bereits durch die array-entfernung oben abgedeckt)

    if (content !== original) {
      fs.writeFileSync(file, content, "utf8");
      totalFixed++;
      logFix("migrated HttpClientModule -> provideHttpClient(withInterceptorsFromDi()) in " + file);
    }
  });

  if (totalFixed === 0) logSkip("no HttpClientModule migration needed");
}

// --- veraltete/umbenannte imports erkennen und beheben ---

function fixDeprecatedImports() {
  log("scanning for deprecated/renamed imports...");

  var tsFiles = findFiles("src", /\.ts$/);
  var totalFixed = 0;

  tsFiles.forEach(function (file) {
    var content = fs.readFileSync(file, "utf8");
    var original = content;

    symbolFixes.forEach(function (fix) {
      var escaped = fix.module.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      var symEscaped = fix.symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      var importPattern = new RegExp(
        "import\\s*\\{([^}]+)\\}\\s*from\\s*['\"]" + escaped + "['\"];?"
      );

      var safetyCounter = 0;
      var match;
      while ((match = importPattern.exec(content)) && safetyCounter < 50) {
        safetyCounter++;
        var fullMatch = match[0];
        var imports = match[1];
        var symbols = imports.split(",").map(function (s) { return s.trim(); }).filter(Boolean);

        var hasSymbol = symbols.some(function (s) {
          return s.split(/\s+as\s+/)[0].trim() === fix.symbol;
        });

        if (!hasSymbol) break;

        if (fix.action === "rename") {
          var renamed = symbols.map(function (s) {
            var name = s.split(/\s+as\s+/)[0].trim();
            if (name === fix.symbol) {
              var parts = s.split(/\s+as\s+/);
              if (parts.length > 1) {
                return fix.newName + " as " + parts[1].trim();
              }
              return fix.newName;
            }
            return s;
          });

          content = content.replace(fullMatch,
            "import { " + renamed.join(", ") + " } from '" + fix.module + "';"
          );

          // alle verwendungen im file umbenennen
          var usagePattern = new RegExp("\\b" + symEscaped + "\\b", "g");
          content = content.replace(usagePattern, fix.newName);

        } else {
          // entfernen
          var filtered = symbols.filter(function (s) {
            return s.split(/\s+as\s+/)[0].trim() !== fix.symbol;
          });

          if (filtered.length === 0) {
            content = content.replace(fullMatch,
              "// [fix-code] entfernt: " + fix.symbol + " (nicht mehr in " + fix.module + ")"
            );
          } else {
            content = content.replace(fullMatch,
              "import { " + filtered.join(", ") + " } from '" + fix.module + "';"
            );
          }

          // typ-referenzen durch any ersetzen
          var typePattern = new RegExp("(:\\s*)" + symEscaped + "\\b", "g");
          content = content.replace(typePattern, "$1any /* " + fix.symbol + " entfernt */");
        }
      }
    });

    if (content !== original) {
      fs.writeFileSync(file, content, "utf8");
      totalFixed++;
      logFix("fixed deprecated/renamed imports in " + file);
    }
  });

  if (totalFixed === 0) logSkip("no deprecated imports found");
}

// --- entfernte symbole aus ngmodule providers-arrays bereinigen ---

function fixRemovedProviders() {
  log("checking for removed symbols in NgModule providers...");

  var moduleFiles = findFiles("src", /\.module\.ts$/);
  var totalFixed = 0;

  moduleFiles.forEach(function (file) {
    var content = fs.readFileSync(file, "utf8");
    var original = content;

    providerRemovals.forEach(function (removal) {
      // nur entfernen wenn das symbol NICHT lokal definiert oder aus einer anderen quelle importiert wird
      // pruefen: ist das symbol aus dem bekannten (entfernten) paket importiert oder gar nicht importiert?
      var escapedModule = removal.module.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      var escapedSymbol = removal.symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // pruefen ob das symbol aus einer ANDEREN quelle importiert wird (dann nicht anfassen)
      var anyImportPattern = new RegExp(
        "import\\s*\\{[^}]*\\b" + escapedSymbol + "\\b[^}]*\\}\\s*from\\s*['\"]([^'\"]+)['\"]"
      );
      var anyImportMatch = anyImportPattern.exec(content);

      if (anyImportMatch) {
        var importSource = anyImportMatch[1];
        // wenn es von einer anderen quelle kommt, nicht anfassen
        if (importSource !== removal.module) {
          return;
        }
      }

      // symbol ist entweder vom entfernten paket importiert oder gar nicht importiert
      // -> aus providers entfernen
      var ngModuleProviders = findNgModuleArray(content, "providers");
      if (ngModuleProviders && ngModuleProviders.items.indexOf(removal.symbol) !== -1) {
        content = removeSymbolFromNgModuleArray(content, ngModuleProviders, removal.symbol);
        log("  " + file + ": removed " + removal.symbol + " from providers (" + removal.reason + ")");
      }
    });

    if (content !== original) {
      fs.writeFileSync(file, content, "utf8");
      totalFixed++;
      logFix("cleaned up removed providers in " + file);
    }
  });

  if (totalFixed === 0) logSkip("no removed providers to clean up");
}

// --- fehlende kendo module in ngmodules erkennen und einfügen ---

function fixMissingKendoModuleImports() {
  log("checking for missing kendo module imports...");

  // schritt 1: templates scannen
  var tsFiles = findFiles("src", /\.component\.ts$/);
  var componentNeeds = {};

  tsFiles.forEach(function (tsFile) {
    var tsContent = fs.readFileSync(tsFile, "utf8");

    var classMatch = tsContent.match(/export\s+class\s+(\w+)/);
    if (!classMatch) return;
    var className = classMatch[1];

    var templateContent = "";

    var templateUrlMatch = tsContent.match(/templateUrl\s*:\s*['"]\.\/([^'"]+)['"]/);
    if (templateUrlMatch) {
      var templatePath = path.join(path.dirname(tsFile), templateUrlMatch[1]);
      if (fs.existsSync(templatePath)) {
        templateContent = fs.readFileSync(templatePath, "utf8");
      }
    }

    var inlineMatch = tsContent.match(/template\s*:\s*`([\s\S]*?)`/);
    if (!inlineMatch) inlineMatch = tsContent.match(/template\s*:\s*'([\s\S]*?)'/);
    if (inlineMatch) templateContent += inlineMatch[1];

    if (!templateContent) return;

    var needed = {};
    Object.keys(selectorToModule).forEach(function (sel) {
      if (templateContent.indexOf("<" + sel) !== -1) {
        var mod = selectorToModule[sel];
        needed[mod.moduleName] = mod;
      }
    });

    if (Object.keys(needed).length > 0) {
      componentNeeds[className] = { file: tsFile, needs: needed };
    }
  });

  if (Object.keys(componentNeeds).length === 0) {
    logSkip("no kendo selector usage found in templates");
    return;
  }

  // schritt 2: ngmodule prüfen und fehlende imports ergänzen
  var moduleFiles = findFiles("src", /\.module\.ts$/);
  var totalFixed = 0;

  moduleFiles.forEach(function (modFile) {
    var content = fs.readFileSync(modFile, "utf8");
    if (content.indexOf("@NgModule") === -1) return;

    var original = content;
    var modulesToAdd = [];

    Object.keys(componentNeeds).forEach(function (className) {
      if (content.indexOf(className) === -1) return;

      var info = componentNeeds[className];
      Object.keys(info.needs).forEach(function (modName) {
        if (content.indexOf(modName) !== -1) return;
        modulesToAdd.push(info.needs[modName]);
      });
    });

    var seen = {};
    modulesToAdd = modulesToAdd.filter(function (m) {
      if (seen[m.moduleName]) return false;
      seen[m.moduleName] = true;
      return true;
    });

    if (modulesToAdd.length === 0) return;

    modulesToAdd.forEach(function (mod) {
      content = addModuleImport(content, mod.moduleName, mod.packageName);
    });

    if (content !== original) {
      fs.writeFileSync(modFile, content, "utf8");
      totalFixed++;
      var names = modulesToAdd.map(function (m) { return m.moduleName; }).join(", ");
      logFix("added " + names + " to " + modFile);
    }
  });

  if (totalFixed === 0) logSkip("kendo modules already properly imported");
}

// ts-import und ngmodule-imports-array erweitern
function addModuleImport(content, moduleName, packageName) {
  var pkgEscaped = packageName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  var existingPkgImport = content.match(
    new RegExp("import\\s*\\{([^}]+)\\}\\s*from\\s*['\"]" + pkgEscaped + "['\"]")
  );

  if (existingPkgImport) {
    if (existingPkgImport[1].indexOf(moduleName) === -1) {
      var newImports = existingPkgImport[1].trimEnd() + ", " + moduleName;
      content = content.replace(existingPkgImport[0],
        "import { " + newImports + " } from '" + packageName + "'"
      );
    }
  } else {
    var importStmt = "import { " + moduleName + " } from '" + packageName + "';";
    var lines = content.split("\n");
    var lastImportLine = -1;
    for (var i = 0; i < lines.length; i++) {
      if (/^\s*import\s/.test(lines[i])) {
        var j = i;
        while (j < lines.length && lines[j].indexOf(";") === -1) j++;
        lastImportLine = j;
      }
    }
    if (lastImportLine >= 0) {
      lines.splice(lastImportLine + 1, 0, importStmt);
    } else {
      lines.unshift(importStmt);
    }
    content = lines.join("\n");
  }

  var ngModuleImports = findNgModuleImportsArray(content);
  if (ngModuleImports && ngModuleImports.items.indexOf(moduleName) === -1) {
    var before = content.slice(0, ngModuleImports.closePos);
    var after = content.slice(ngModuleImports.closePos);

    var trimmed = before.trimEnd();
    var needsComma = /[\w)]$/.test(trimmed);

    content = trimmed + (needsComma ? "," : "") + "\n    " + moduleName + "\n  " + after.trimStart();
  }

  return content;
}

// ngmodule imports-array finden (mit verschachtelten klammern)
function findNgModuleImportsArray(content) {
  return findNgModuleArray(content, "imports");
}

// generisch: beliebiges ngmodule array finden (imports, exports, providers, declarations)
function findNgModuleArray(content, arrayName) {
  var ngModuleIdx = content.indexOf("@NgModule");
  if (ngModuleIdx === -1) return null;

  var braceStart = content.indexOf("{", ngModuleIdx);
  if (braceStart === -1) return null;

  // ngmodule objekt-ende finden (verschachtelte klammern beachten)
  var ngModuleEnd = findMatchingBrace(content, braceStart);
  if (ngModuleEnd === -1) return null;

  var escapedName = arrayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  var keyPattern = new RegExp("\\b" + escapedName + "\\s*:\\s*\\[", "g");
  keyPattern.lastIndex = braceStart;
  var match = keyPattern.exec(content);
  if (!match || match.index > ngModuleEnd) return null;

  var arrayStart = match.index + match[0].length;

  var depth = 1;
  var pos = arrayStart;
  while (pos < content.length && depth > 0) {
    var ch = content[pos];
    if (ch === "[") depth++;
    else if (ch === "]") depth--;
    else if (ch === "'" || ch === '"' || ch === "`") {
      var quote = ch;
      pos++;
      while (pos < content.length && content[pos] !== quote) {
        if (content[pos] === "\\") pos++;
        pos++;
      }
    }
    pos++;
  }

  if (depth !== 0) return null;

  var closePos = pos - 1;
  var items = content.slice(arrayStart, closePos);

  return { startPos: arrayStart, closePos: closePos, items: items };
}

function findMatchingBrace(content, openPos) {
  var depth = 1;
  var pos = openPos + 1;
  while (pos < content.length && depth > 0) {
    var ch = content[pos];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (ch === "'" || ch === '"' || ch === "`") {
      var quote = ch;
      pos++;
      while (pos < content.length && content[pos] !== quote) {
        if (content[pos] === "\\") pos++;
        pos++;
      }
    }
    pos++;
  }
  return depth === 0 ? pos - 1 : -1;
}

// symbol aus einem ngmodule array entfernen (imports, exports, providers)
function removeSymbolFromNgModuleArray(content, arrayInfo, symbolName) {
  var items = arrayInfo.items;

  // einfache symbole (kein objekt-literal, kein funktionsaufruf) aus dem array entfernen
  // pattern: symbolName mit optionalem komma davor/danach und whitespace
  var escapedSym = symbolName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // das symbol im array-inhalt finden und entfernen
  var symPattern = new RegExp(
    "(?:,\\s*)?\\b" + escapedSym + "\\b\\s*,?|\\b" + escapedSym + "\\b\\s*,?"
  );

  var newItems = items.replace(symPattern, "");

  // fuehrende/abschliessende kommas bereinigen
  newItems = newItems.replace(/^\s*,/, "").replace(/,\s*$/, "");

  // leere zeilen am anfang/ende bereinigen
  newItems = newItems.replace(/^\s*\n/, "").replace(/\n\s*$/, "");

  var newContent =
    content.slice(0, arrayInfo.startPos) +
    newItems +
    content.slice(arrayInfo.closePos);

  return newContent;
}

// --- hauptprogramm ---

function main() {
  console.log("fix-code v" + VERSION + "\n");

  if (!fs.existsSync("package.json")) {
    console.error("no package.json found");
    process.exit(1);
  }

  fixBrowserslist();
  fixTsconfig();
  fixSassImports();
  fixKendoThemePaths();
  fixPolyfills();
  fixPolyfillsReferences();
  fixPolyfillsTsconfigReferences();
  fixHttpClientModule();
  fixDeprecatedImports();
  fixRemovedProviders();
  fixMissingKendoModuleImports();

  console.log("\n---");
  if (fixes.length === 0) {
    console.log("  no fixes needed");
  } else {
    console.log("  applied " + fixes.length + " fix(es)");
    console.log("  run npm run build to check for remaining issues");
  }
}

main();
