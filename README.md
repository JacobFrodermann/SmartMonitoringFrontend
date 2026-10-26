# SmartMonitoringFrontend

Web front end of the Smart\* ecosystem: a NetBeans HTML5 client project
(static HTML/CSS/JavaScript, no build step) that visualises monitoring data.

It runs against two sibling applications and one component library, all
deployed in the same Payara instance:

| Dependency | Context root | Purpose |
| --- | --- | --- |
| [SWAC](../SWAC) | `/SWAC` | UI component library |
| [SmartData](../SmartData) | `/SmartData` | data access (TreeQL REST API), storage `smartmonitoring` |
| [SmartUser](../SmartUser) | `/SmartUser` | login and user accounts |

## Docker artifact image

`Dockerfile` packages the document root into a static WAR:

```bash
docker build -t smartmonitoringfrontend-war:local .
```

The image contains `/opt/wars/SmartMonitoringFrontend.war` and nothing else; it
never runs Payara. It is deployed by the master image of the
[SmartDataDeployment](..) repository, which runs the whole
stack (Payara + PostgreSQL + SmartDataJobs + SmartUser + SmartData + SWAC +
this front end).

## Full stack

```bash
cd ..
./scripts/up.sh                 # build all artifact images and start the stack
./scripts/init-smartuser.sh     # once, on a fresh database
./scripts/init-smartmonitoring.sh   # creates the smartmonitoring storage,
                                    # tables, menu and feature switches
```

Then open <http://localhost:8080/SmartMonitoringFrontend/> and log in with
`admin` / `admin`.

The bootstrap step is mandatory: without the `smartmonitoring` storage and its
`tbl_systemconfiguration` rows, the login form and the menus are not activated.

## Configuration

`configuration.js` at the document root is the only file to adapt for a
deployment (data source URLs, login URL, footer links, favourites). The storage
name `smartmonitoring` is part of it.

## Documentation

`AGENTS.md` documents the runtime dependencies, the context-root contract, the
data model and presets, the Docker packaging, the PWA/service-worker behaviour
and the known pre-existing quirks.
