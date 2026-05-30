import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

// Candidate template locations (first found wins)
const TEMPLATE_PATHS = [
  join(process.cwd(), "public", "PoV_Toolkit_v1.1.html"),
  join(process.cwd(), "..", "PoV Toolkit 2", "PoV_Toolkit_v1.1.html"),
  join(process.cwd(), "..", "PoV_Toolkit_v1.1.html"),
];

export async function GET() {
  const session = await auth();
  const guard = requireAdmin(session);
  if (guard) return guard;

  const templatePath = TEMPLATE_PATHS.find(p => existsSync(p));

  if (!templatePath) {
    return NextResponse.json(
      { error: "Template not found. Place PoV_Toolkit_v1.1.html in the public/ directory." },
      { status: 404 }
    );
  }

  const [criteria, outcomes, pillars, drivers, risks, actions, products, industries] =
    await Promise.all([
      db.criterion.findMany({ where: { active: true }, orderBy: [{ product: "asc" }, { sortOrder: "asc" }] }),
      db.outcome.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      db.pillar.findMany({ where: { active: true } }),
      db.libraryItem.findMany({ where: { type: "DRIVER",   active: true }, orderBy: { sortOrder: "asc" } }),
      db.libraryItem.findMany({ where: { type: "RISK",     active: true }, orderBy: { sortOrder: "asc" } }),
      db.libraryItem.findMany({ where: { type: "ACTION",   active: true }, orderBy: { sortOrder: "asc" } }),
      db.libraryItem.findMany({ where: { type: "PRODUCT",  active: true }, orderBy: { sortOrder: "asc" } }),
      db.libraryItem.findMany({ where: { type: "INDUSTRY", active: true }, orderBy: { sortOrder: "asc" } }),
    ]);

  // Map DB records to the exact format the HTML tool expects
  const criteriaArr = criteria.map(c => ({
    id: c.id, product: c.product, requirement: c.requirement,
    businessProblem: c.businessProblem, successCriteria: c.successCriteria,
    measurement: c.measurement, competitiveEdge: c.competitiveEdge, edgeTags: c.edgeTags,
  }));

  const outcomesArr = outcomes.map(o => ({
    id: o.id, icon: o.icon, color: o.color, title: o.title,
    description: o.description, criteriaIds: o.criteriaIds,
  }));

  const pillarsArr = pillars.map(p => ({
    tag: p.tag, name: p.name, what: p.what, vsCompetitors: p.vsCompetitors,
  }));

  // Drivers and risks are plain string arrays in the HTML tool
  const driversArr = drivers.map(d => d.text);
  const risksArr   = risks.map(r => r.text);

  // Default actions include status/priority meta
  const actionsArr = actions.map((a, i) => ({
    id: i + 1,
    task: a.text,
    owner: "",
    dueDate: "",
    priority: ((a.meta as Record<string, string> | null)?.priority) ?? "High",
    status: "Not Started",
  }));

  // Products: plain string array
  const productsArr   = products.map(p => p.text);

  // Industries: HTML tool expects leading empty string for "Select…" placeholder
  const industriesArr = ["", ...industries.map(i => i.text)];

  let html = readFileSync(templatePath, "utf-8");

  // Anchor ];  to start-of-line (^]; with m flag) so the lazy [\s\S]*? never
  // stops early at a ]; that appears inside a string value in the array.
  const replacements: [RegExp, string][] = [
    [/const CRITERIA\s*=\s*\[[\s\S]*?^];/m,        `const CRITERIA = ${JSON.stringify(criteriaArr, null, 2)};`],
    [/const OUTCOMES\s*=\s*\[[\s\S]*?^];/m,        `const OUTCOMES = ${JSON.stringify(outcomesArr, null, 2)};`],
    [/const PILLARS\s*=\s*\[[\s\S]*?^];/m,         `const PILLARS = ${JSON.stringify(pillarsArr, null, 2)};`],
    [/const COMMON_DRIVERS\s*=\s*\[[\s\S]*?^];/m,  `const COMMON_DRIVERS = ${JSON.stringify(driversArr)};`],
    [/const COMMON_RISKS\s*=\s*\[[\s\S]*?^];/m,    `const COMMON_RISKS = ${JSON.stringify(risksArr)};`],
    [/const DEFAULT_ACTIONS\s*=\s*\[[\s\S]*?^];/m, `const DEFAULT_ACTIONS = ${JSON.stringify(actionsArr, null, 2)};`],
    // ALL_PRODUCTS and INDUSTRIES are single-line — simple replacement is safe
    [/const ALL_PRODUCTS\s*=\s*\[.*?\];/,           `const ALL_PRODUCTS = ${JSON.stringify(productsArr)};`],
    [/const INDUSTRIES\s*=\s*\[.*?\];/,             `const INDUSTRIES = ${JSON.stringify(industriesArr)};`],
  ];

  for (const [pattern, replacement] of replacements) {
    html = html.replace(pattern, replacement);
  }

  // Inject export date watermark
  const today = new Date().toISOString().split("T")[0];
  html = html.replace(
    "</body>",
    `<div style="text-align:center;padding:8px;font-size:11px;color:#999;border-top:1px solid #e5e7eb;margin-top:16px">Library export: ${today}</div></body>`
  );

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="PoV_Toolkit_${today}.html"`,
    },
  });
}
