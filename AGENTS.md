# AGENTS.md

SmartMonitoringFrontend is the **SmartMonitoring** web front end of the Smart\*
ecosystem: a NetBeans *HTML5 client project* — plain HTML, CSS and JavaScript
with no build step and no server-side code.

It is deployed next to, and reads its data from, `SmartData` and `SmartUser`,
and it loads `SWAC` as its UI component library. All three are addressed by
absolute path, and all runtime data comes from the SmartData storage
`smartmonitoring`.

Read this file before changing the packaging, the context root or
`configuration.js`. The deployment side (Compose, master Payara image, bootstrap
scripts) is documented in `../AGENTS.md`.

---

## 1. Runtime dependencies

| Dependency | Absolute path used | Purpose |
| --- | --- | --- |
| SWAC | `/SWAC/swac/swac.js`, `/SWAC/swac/libs/uikit/...`, `/SWAC/swac/DataAggregation.js`, `/SWAC/swac/TableExport.js` | UI components, tables, charts, uikit |
| SmartData | `/SmartData/smartdata/...` | all data access (TreeQL API) |
| SmartUser | `/SmartUser/smartuser/user/performLogin` | login, session cookie |
| itself | `/SmartMonitoringFrontend/...` | own JSON data sources below `data/` |

There is no build step, no `pom.xml`, no dependency bundling. Everything above
must be deployed into the same Payara instance; a second web server or a proxy
would break the absolute paths.

### Context root is part of the contract

`configuration.js` declares a data source with the URL

```js
"/SmartMonitoringFrontend/data/[fromName]"
```

and the front end loads `/SWAC/...`, `/SmartData/...` and `/SmartUser/...`
absolutely. The WAR is therefore deployed as `SmartMonitoringFrontend.war`,
which Payara turns into the application name and context root
`/SmartMonitoringFrontend`; `docker/WEB-INF/glassfish-web.xml` pins the same
value. Renaming the WAR requires changing `configuration.js`.

---

## 2. Configuration (`configuration.js`)

`configuration.js` at the document root is the single place to adapt a
deployment. SWAC loads `<app_root>/configuration.js` from the application that
embeds it, so it is served as `/SmartMonitoringFrontend/configuration.js`. It
defines:

- `SWAC_config.globalparams` — base URL and SmartData URLs
  (`smartdataurlnenc`, `smartdataurl`).
- `SWAC_config.datasources` — the two data sources:
  - `/SmartData/smartdata/[iface]/[fromName]?storage=smartmonitoring`
    (`get`, `list`, `defs`, `cdefs`, `create`, `update`, `delete`)
  - `/SmartMonitoringFrontend/data/[fromName]` (static JSON below `data/`)
- `userform_options` / `swac_login_options` (`index.js`) — login endpoint and
  the `tbl_systemconfiguration` row that activates the login form
  (`ckey=func_userlogin`, `active=true`).
- `window['favs_options']` — favourites, activated by
  `ckey=func_userfavs`.
- `footerlinks`, `startuptests`, `progressive`.

The **storage name `smartmonitoring` is hardcoded here**. Changing it requires
editing this file and creating the storage under the new name; the deployment
bootstrap (`init-smartmonitoring.sh`) assumes the default.

`js/ai-config.js` points at `/SmartData/smartdata/proxy/ai`. SmartData exposes
only `proxy/get` (GET) — the AI features are not functional in this stack.

---

## 3. Data model and bootstrap

The front end does not own its schema. All tables live in the SmartData storage
(= PostgreSQL schema) `smartmonitoring`:

| Table | Purpose |
| --- | --- |
| `tbl_observedobject` (+ `tbl_location`, `tbl_location_join_oo`) | observed objects / devices and their locations |
| `tbl_ootype`, `tbl_metatype`, `tbl_datatype` | type catalogue |
| `tbl_navigationroute` | navigation menu (records only, 50 rows) |
| `tbl_systemconfiguration` | feature switches, e.g. `func_userlogin`, `func_userfavs`, `func_object_list` (51 seed records, 50 distinct ids) |
| `tbl_measurement*`, `tbl_value*`, … | created afterwards by the admin pages / data import |

The initial table definitions and their seed records are shipped as **presets**
in `data/admin/presets/base.json`, served by the deployed application at
`/SmartMonitoringFrontend/data/admin/presets/base.json`:

| Preset | Creates | Records |
| --- | --- | --- |
| Base tables | `tbl_ootype`, `tbl_metatype`, `tbl_datatype`, `tbl_observedobject`, `tbl_location`, `tbl_location_join_oo` | – |
| Navigationsmenü | `tbl_navigationroute` | 50 |
| Admin Funktionsverwaltung | `tbl_systemconfiguration` | 51 (50 usable: `id` 1003 is used twice) |

They are applied through the SmartData API (`cdefs` → `POST
/SmartData/smartdata/collection/<name>?storage=smartmonitoring`, `create` →
`POST /SmartData/smartdata/records/<name>?storage=smartmonitoring`).

There are two ways to apply them:

1. **UI**: `sites/admin/setup.html` (and `functions.html`) in a running
   deployment.
2. **Headless**: `../scripts/init-smartmonitoring.sh`,
   which creates the storage, applies every preset idempotently and is safe to
   re-run. This is the supported way for the Docker stack.

Without `tbl_systemconfiguration` (and its `func_userlogin` row) the login form
and favourites are not activated; without `tbl_observedobject` the device list
on the start page stays empty. The front end is therefore only usable after the
bootstrap ran.

Legacy material, not used by the preset mechanism:

- `data/admin/presets/legacy/*` — older per-table dumps
  (`tbl_*_attributes.json` / `tbl_*_records.json`).
- `data/admin/functions/functions.json` — function catalogue used by
  `sites/admin/functions.html`.
- `docs/setup/view_oo_hierarchy.sql`, `docs/setup/view_oo_without_locations.sql`
  — optional PostgreSQL views over `tbl_observedobject`; apply manually with
  `psql` inside the `smartmonitoring` schema if the map/hierarchy pages need
  them.
- `test files/*.json` — sample data for manual import tests.

---

## 4. Docker packaging

`Dockerfile` packages the document root into a static WAR:

1. Alpine stage with `zip` copies the application files and `docker/WEB-INF`,
   then zips everything into `/SmartMonitoringFrontend.war`.
2. Alpine artifact stage copies it to `/opt/wars/SmartMonitoringFrontend.war`.

Build:

```bash
docker build -t smartmonitoringfrontend-war:local .
```

The image is only an artifact carrier; it never runs Payara. The master image
in `../Dockerfile.payara` copies the WAR into
`/opt/payara/deployments`.

Not packaged: `test files/`, `docs/`, `nbproject/`, Markdown files, `.git`
(see `.dockerignore`).

`docker/WEB-INF/web.xml` supplies only the welcome file and MIME mappings that
Payara does not have by default:

- `woff2` → `font/woff2` (otherwise the uikit icon font is served as
  `application/octet-stream` and icons break)
- `webmanifest`/`manifest` → `application/manifest+json`
- `svg`, `woff`, `json`, `wasm`, `ico`

Do not add servlets or filters; the container's default servlet serves
everything.

---

## 5. Progressive web app behaviour

The application ships `manifest.json`, `site.webmanifest` and
`serviceworker.js` (a service worker registered from the document root, so its
scope is the whole application).

Consequence for deployments: the worker caches assets, so after redeploying a
new build a browser may keep serving the old files. When a deployment shows
stale assets, unregister the service worker / clear site data, or bump the
cache version inside `serviceworker.js`. Do not "fix" this by removing the
manifest files.

---

## 6. Known pre-existing quirks

- `index.html` loads the translator from `languages/translations.json`, but the
  file lives in `data/languages/translations.json` (that is what all pages
  below `sites/` use). The start page therefore has no translations; it is an
  application bug, not a deployment problem.
- `configuration.js` defines `userform_options`, while `index.html` refers to
  `swac_login_options`; the real definition lives in `index.js`. Keep both when
  changing login behaviour.
- Every feature switch in the preset data ships with `active=false`, including
  `func_userlogin` (id 1101), which gates the login form on the start page. A
  fresh installation therefore shows no login form until the switch is
  activated in `sites/admin/functions.html`. The deployment bootstrap
  (`../scripts/init-smartmonitoring.sh`) enables exactly
  that switch; everything else stays inactive by default.
- `js/ai-config.js` targets `/SmartData/smartdata/proxy/ai`, which SmartData
  does not implement (only `proxy/get`). AI features are inert.
- The `tbl_systemconfiguration` preset data contains a duplicate primary key:
  `id` 1003 is used by two records (51 records, 50 distinct ids). Posting the
  array in one request aborts with HTTP 500 halfway. The deployment bootstrap
  therefore inserts record by record and skips existing ids, which yields 50
  rows. Fixing the preset data is an application change.
- `sites/user/account.html` and `register.html` expect SmartUser endpoints; the
  SmartUser deployment in this stack has `confirm_mail=false` and local user
  storage, so registrations do not send mail.

---

## 7. Verification after packaging changes

With the stack running (`../scripts/up.sh`):

```bash
curl -sI http://localhost:8080/SmartMonitoringFrontend/                     # 200, text/html
curl -sI http://localhost:8080/SmartMonitoringFrontend/configuration.js     # 200
curl -sI http://localhost:8080/SmartMonitoringFrontend/data/admin/presets/base.json
curl -sI http://localhost:8080/SmartData/smartdata/collection?storage=smartmonitoring
# uikit font must be a font, not octet-stream:
curl -sI http://localhost:8080/SWAC/swac/libs/uikit/css/uikit.min.css
```

and check in the browser console that `/SWAC/swac/swac.js`, `/SmartUser/...`
and `/SmartData/...` load without 404 and that the login form appears (it
requires the `func_userlogin` row from the bootstrap).
