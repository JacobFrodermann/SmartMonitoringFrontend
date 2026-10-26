# syntax=docker/dockerfile:1

# SmartMonitoringFrontend is a NetBeans HTML5 client project: static HTML, CSS
# and JavaScript with no build step. This packages the document root as a WAR
# so that Payara auto-deploys it below the context root /SmartMonitoringFrontend.
#
# That context root is mandatory: configuration.js references
# /SmartMonitoringFrontend/data/[fromName] absolutely, and the front end loads
# SWAC, SmartData and SmartUser by absolute path as well.
#
# Build:
#   docker build -t smartmonitoringfrontend-war:local .
#
# The resulting image is only an artifact carrier containing
# /opt/wars/SmartMonitoringFrontend.war. The master Payara image
# (SmartDataDeployment/Dockerfile.payara) copies that WAR into
# /opt/payara/deployments.
FROM alpine:3.20 AS build

RUN apk add --no-cache zip

WORKDIR /src

# Document root. Everything ends up at the WAR root, so the context root stays
# /SmartMonitoringFrontend and all relative paths keep working.
COPY index.html index.js configuration.js ./
COPY manifest.json site.webmanifest serviceworker.js favicon.ico ./
COPY css ./css
COPY js ./js
COPY sites ./sites
COPY data ./data
COPY customisations ./customisations
COPY files ./files

# Minimal WEB-INF: welcome file, MIME types and the pinned context root.
COPY docker/WEB-INF ./WEB-INF

# "test files/" (sample imports) and docs/ are not part of the deployed
# application and are intentionally not copied.
RUN zip -qr /SmartMonitoringFrontend.war .

FROM alpine:3.20 AS artifact

COPY --from=build /SmartMonitoringFrontend.war /opt/wars/SmartMonitoringFrontend.war
