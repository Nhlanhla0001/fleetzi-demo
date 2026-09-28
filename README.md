# Fleetzi Demo

**A responsive fleet-management product demonstration for plant and heavy equipment.**

[Open the live demo](https://blackbox-equipment.vercel.app)

Fleetzi demonstrates how an equipment operator can register machines, plan tracker installations, review simulated operating data and move from fleet-level exceptions to an exact machine record.

## What the demo demonstrates

- Fleet overview, search and filtering
- Equipment onboarding and installation planning
- Fleet and machine map views with simulated movement
- Utilisation, fuel, maintenance and inspection workflows
- Alerts with machine-specific follow-up
- Hire-hour review that keeps measured activity separate from approved billing
- Browser-local persistence and reset
- Responsive navigation and accessible interaction patterns

## Engineering highlights

- **Dependency-light frontend:** plain HTML, CSS and JavaScript
- **Deterministic build tooling:** Node-based static build scripts
- **Automated tests:** Node.js test runner
- **Local persistence:** browser storage for demonstration state
- **Responsive UX:** desktop and mobile layouts
- **Clear data boundary:** simulated data remains separate from real telemetry

## Run locally

Requires Node.js 22 or newer.

```bash
npm run dev
npm test
npm run build
```

The development server runs locally. The production build is emitted to `dist/` for static hosting.

## Demonstration boundary

This repository is a frontend product prototype. Its machines, customers, locations, readings, rates and alerts are fictional demonstration data.

It does **not**:

- connect to real tracking devices
- contain customer or production data
- create production customer accounts
- issue invoices or approve billable hours
- claim simulated readings are real telemetry

A production system would require authenticated organisations, account isolation, server-side asset workflows, secure device provisioning, telemetry-provider credentials, verified readings, audit trails and installer workflows.

## Production architecture direction

```text
Equipment / sensor
      ↓
Telematics device
      ↓
Provider protocol / API
      ↓
Ingestion + validation
      ↓
Asset / telemetry service
      ↓
Customer application
      ↓
Alerts, reporting and maintenance workflows
```

Provider credentials belong in secure server-side infrastructure and are not included in this frontend.

## Status

Portfolio demonstration and active product prototype.

