# DPAL Nexus Console

Private institutional admin console for multi-tenant DPAL.

## Core screens
1. Entity Manager
2. Entity Setup Wizard
3. Global Oversight Dashboard
4. Roles & Access
5. Routing + SLA
6. Public Portal Settings
7. Platform Audit + Billing

## Deployment target
- Separate Vercel project (`dpal-nexus-console`)
- Separate domain (`nexus.dpal.app` or `console.dpal.app`)

## Integration
- Reads control-plane data from `dpal-nexus-api`
- Manages tenants, templates, modules, and governance settings
