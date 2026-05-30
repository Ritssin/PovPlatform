# Sophos PoV Platform

Internal web application for managing Proof of Value engagements. Built with Next.js 14, Supabase (PostgreSQL), and Microsoft Entra ID SSO.

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)
- A Microsoft Entra ID app registration (for Sophos SSO)

### 2. Environment variables

Copy `.env.local` and fill in your values:

```bash
# Auth — register an app at https://entra.microsoft.com
# Add redirect URI: http://localhost:3000/api/auth/callback/microsoft-entra-id
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# Generate with: openssl rand -base64 32
AUTH_SECRET=

NEXTAUTH_URL=http://localhost:3000

# From Supabase → Settings → Database → Connection string
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# From Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 3. Install and initialise

```bash
npm install

# Generate Prisma client
npm run db:generate

# Push schema to Supabase (creates all tables)
npm run db:push

# Seed library data (76 criteria, 10 outcomes, 5 pillars, drivers, risks)
npm run db:seed
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

### 5. First login

Navigate to `http://localhost:3000` → redirected to `/login` → "Sign in with Sophos" → Microsoft SSO → lands on `/dashboard`.

The first user is created as role `SE`. To promote to `ADMIN`:

```sql
-- Run in Supabase SQL editor
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@sophos.com';
```

---

## Architecture

```
Three-step PoV flow (same as PoV_Toolkit_v1.1.html):
  /pov/[id]/context   → Step 1: Business Context
  /pov/[id]/criteria  → Step 2: Success Criteria  
  /pov/[id]/execute   → Step 3: Execute & Track

Dashboard:
  /dashboard          → Pipeline table (real-time — refresh to update, Realtime sub coming in Phase 2)

Admin:
  /admin/library      → Manage criteria, outcomes, drivers, risks (Phase 2)
```

## Roles

| Role | Access |
|------|--------|
| SE | Own PoVs only |
| SME | Own PoVs only |
| MANAGER | All PoVs (read) |
| ADMIN | All PoVs + Library management + Audit logs |

## Module system

New integrations are added without touching core code:

```typescript
// lib/modules/integrations/my-integration/index.ts
import { registry } from "@/lib/modules/registry";
import type { PoVModule } from "@/lib/modules/types";

const MyModule: PoVModule = {
  id: "my-integration",
  name: "My Integration",
  category: "INTEGRATION",
  version: "1.0.0",
  onPoVComplete: async (pov) => { /* push to external system */ },
  CriterionPanel: MyMetricsPanel, // optional UI slot
};

registry.register(MyModule);
```

## Implementation phases

- **Phase 1 (this)** — Core app: SSO, PoV CRUD, 3-step form, auto-save, dashboard
- **Phase 2** — Admin library UI, Supabase Realtime dashboard, RBAC, CSV export
- **Phase 3** — Salesforce module (pull opportunity → push completion)
- **Phase 4** — Vivun module (sync Technical Win + webhook)
- **Phase 5** — Sophos Customer Dashboard module (live telemetry in criteria cards)
- **Phase 6** — Test Suites module (test playbooks + evidence attachments)
- **Phase 7** — Security review + pen test

## Partner HTML tool

The standalone `PoV_Toolkit_v1.1.html` remains in use for partners.  
In Phase 2, `/admin/library/export/html` will regenerate it with the current library data.
