import { PrismaClient, LibraryType, Role } from "@prisma/client";

const db = new PrismaClient();

// ── Raw library data (extracted from PoV Toolkit HTML) ────────────────────────

const PILLARS_DATA = [
  {
    "tag": "PLATFORM",
    "name": "Centralised Platform",
    "what": "Sophos Central is a single cloud console for endpoint, server, firewall, email, network, ITDR, ZTNA, Workspace Protection and Taegis XDR/MDR. Competitors typically need multiple consoles or third-party SIEM stitching to deliver the same view.",
    "vsCompetitors": "Palo Alto: separate Cortex/Prisma/Strata consoles. CrowdStrike: requires Falcon agent for full value, limited native network/email. Arctic Wolf: Aurora platform separate from your tools. ReliaQuest: requires you to keep best-of-breed tools, no native first-party stack. BlueVoyant: Microsoft Sentinel-centric, limited native platform."
  },
  {
    "tag": "NATIVE",
    "name": "Native Portfolio Breadth",
    "what": "Sophos delivers endpoint, network/firewall (XGS), email, identity, NDR, workspace, ZTNA and MDR/XDR all under one vendor. Sophos Endpoint is automatically included with Taegis MDR/XDR at no extra cost. Synchronized Security ties endpoint health directly to firewall policy in real time – a Sophos-only capability.",
    "vsCompetitors": "CrowdStrike: no native firewall, email or ZTNA. Palo Alto: strong network/firewall, weaker managed-services maturity, expensive. Fortinet: has the breadth but achieves it via FortiGuard SKU sprawl and multiple consoles (FortiManager, FortiAnalyzer, FortiClient EMS). Arctic Wolf & BlueVoyant: pure-play MDR – no own endpoint, firewall or email. ReliaQuest: tool-agnostic – customer still pays for and operates every underlying tool."
  },
  {
    "tag": "INTEL",
    "name": "Superior Threat Intelligence & IR",
    "what": "Sophos X-Ops unifies SophosLabs, SecOps, AI and the Secureworks Counter Threat Unit (CTU) – 500+ researchers, telemetry from 600,000+ customers, dark-web intelligence, law-enforcement collaboration. Full-scale Incident Response is included with Sophos MDR Complete – no hourly caps – plus a $1M breach-protection warranty.",
    "vsCompetitors": "BlueVoyant: light on original threat research and proactive hunting. Arctic Wolf: contains threats but typically does not perform full removal/IR – customers must engage a separate IR firm. CrowdStrike: IR is a separate paid service (Falcon Complete tier or add-on). ReliaQuest: depends on customer's underlying tools for response depth."
  },
  {
    "tag": "AGENTIC",
    "name": "Agentic AI built into the SOC",
    "what": "Sophos MDR is positioned as the world's largest Agentic SOC: AI resolves a published 52% of cases in 89 seconds with full human accountability. Sophos AI Assistant and Threat Hunting AI are integrated into XDR/MDR for guided investigations and natural-language threat hunts.",
    "vsCompetitors": "Arctic Wolf: human-Concierge model with limited published AI autonomy metrics. CrowdStrike: Charlotte AI is strong but tied to Falcon platform and licensed separately. BlueVoyant: limited published AI metrics. ReliaQuest: GreyMatter automation is strong but bounded by customer tools."
  },
  {
    "tag": "PRICING",
    "name": "Simple, Predictable Pricing",
    "what": "Per-user pricing, no hourly IR caps, no surprise fees, no 200-endpoint minimum. Sophos Endpoint is included with Taegis MDR/XDR. Workspace Protection is one bundle, one SKU.",
    "vsCompetitors": "CrowdStrike: 200–500 endpoint minimum eliminates SMB/lower mid-market; modular SKU sprawl. Palo Alto: among the most expensive XDR platforms, complex licensing. Arctic Wolf: $3M warranty requires buying additional bundles. BlueVoyant: per-endpoint pricing, separate cost for log sources in some packages. ReliaQuest: licence + you still pay for every underlying tool."
  }
];

const CRITERIA_DATA = [
  {
    "id": "XDR-01",
    "product": "XDR",
    "requirement": "Ease of deployment",
    "businessProblem": "Security teams struggle to get visibility quickly because deploying and integrating telemetry sources across endpoints, identities and cloud takes weeks, delaying time-to-value of new tooling.",
    "successCriteria": "Ease of integrating/deploying EDR agents; Syslog ingestion; API-based integrations for Azure AD, Office 365, Graph Security.",
    "measurement": "X endpoints integrated; X syslog sources onboarded; Azure AD, Office 365, Graph Security connected.",
    "edgeTags": [
      "PLATFORM",
      "NATIVE"
    ],
    "competitiveEdge": "Sophos Endpoint is included with XDR at no extra cost and ingests natively into the Taegis platform on day one – competitors typically require you to license endpoint separately or stitch a third-party EDR into the SIEM."
  },
  {
    "id": "XDR-02",
    "product": "XDR",
    "requirement": "Detections across the attack surface",
    "businessProblem": "Threats hide across endpoint, network, identity and cloud; siloed tools miss correlated activity and leave the business exposed to ransomware and data theft.",
    "successCriteria": "Generate alerts across endpoints, network and cloud with cross-source correlation.",
    "measurement": "X critical, Y high severity, total Z alerts; X cross-source correlated cases (e.g. email → endpoint → identity).",
    "edgeTags": [
      "PLATFORM",
      "INTEL"
    ],
    "competitiveEdge": "Sophos correlates first-party telemetry from endpoint, firewall, email, identity, NDR and cloud out of the box – pure-play MDRs (Arctic Wolf, BlueVoyant) depend on you having and integrating all of those tools yourself."
  },
  {
    "id": "XDR-03",
    "product": "XDR",
    "requirement": "Alert Analysis & enrichment",
    "businessProblem": "Analyst time is wasted triaging low-context alerts; without rich context, true positives are missed or resolved too slowly to prevent business impact.",
    "successCriteria": "Rich context with X-Ops / CTU threat intelligence; recommended resolution / actions; severity-based prioritisation.",
    "measurement": "X investigations created; Y true positives with description and outcome; mean-time-to-triage measured.",
    "edgeTags": [
      "INTEL"
    ],
    "competitiveEdge": "Sophos X-Ops + Counter Threat Unit (from Secureworks) deliver adversary-named, dark-web-informed enrichment most competitors can't match; BlueVoyant in particular is light on original threat research."
  },
  {
    "id": "XDR-04",
    "product": "XDR",
    "requirement": "Agentic AI investigation",
    "businessProblem": "Analyst headcount is impossible to scale linearly with alert volume; AI-assisted investigation is required to keep up.",
    "successCriteria": "AI-driven case triage, natural-language threat hunting via Sophos AI Assistant; recommended next steps generated by AI with analyst oversight.",
    "measurement": "% of alerts auto-triaged by AI; X NL queries executed; analyst time saved per shift (minutes).",
    "edgeTags": [
      "AGENTIC"
    ],
    "competitiveEdge": "Sophos publishes that AI resolves 52% of cases in 89 seconds with full human accountability – Arctic Wolf and BlueVoyant publish no comparable autonomy metric; CrowdStrike Charlotte AI is strong but locked to the Falcon platform."
  },
  {
    "id": "XDR-05",
    "product": "XDR",
    "requirement": "Search / Threat Hunting",
    "businessProblem": "Security teams need to proactively hunt for adversaries hiding in their environment, but legacy tools force slow queries across fragmented data.",
    "successCriteria": "Search events across endpoints, network and cloud; generate statistics; saved searches with aggregates; natural-language search.",
    "measurement": "Demonstrated pivot searches; advanced hunts run for XYZ TTPs; saved searches created.",
    "edgeTags": [
      "PLATFORM",
      "AGENTIC"
    ],
    "competitiveEdge": "Natural-language search across up to 5 years of retained data, in one console – no need to bounce between SIEM, EDR and identity tools as you would with a Palo Alto or multi-vendor stack."
  },
  {
    "id": "XDR-06",
    "product": "XDR",
    "requirement": "Platform tuning",
    "businessProblem": "Out-of-the-box rules generate noise that doesn't match the customer's environment, causing alert fatigue and missed real threats.",
    "successCriteria": "Ability to author custom rules; ease of creating suppression rules; pre-tuned content out of the box.",
    "measurement": "X custom rules created for [use case]; Y suppression rules; false-positive reduction vs incumbent.",
    "edgeTags": [
      "PLATFORM"
    ],
    "competitiveEdge": "Customers retain custom-detection authoring – ReliaQuest and Arctic Wolf are far more opaque about how detections are tuned and changed."
  },
  {
    "id": "XDR-07",
    "product": "XDR",
    "requirement": "Automation / Response",
    "businessProblem": "Manual response is too slow during active intrusions; teams need automated containment to stop attackers before they reach crown-jewel assets.",
    "successCriteria": "Host isolation; Entra ID account isolation and password reset; test response actions on real alerts.",
    "measurement": "Laptop/server isolated and restored; account disabled and sessions killed; APT test script used to validate automations.",
    "edgeTags": [
      "NATIVE",
      "AGENTIC"
    ],
    "competitiveEdge": "Sophos supports 6 autonomous response actions (vs Arctic Wolf's 3) and full-scale removal, not just containment – critical when the attacker is already inside."
  },
  {
    "id": "XDR-08",
    "product": "XDR",
    "requirement": "Overall Experience & TCO",
    "businessProblem": "Tool sprawl, poor vendor support and lack of strategic guidance increase total cost of ownership and erode the value of security investments.",
    "successCriteria": "Reduction of customer's security management overhead; single console; strategic partnership; best-practice recommendations.",
    "measurement": "Number of consoles replaced; admin hours saved per week; CSAT / NPS for the account team; reference customers in same vertical.",
    "edgeTags": [
      "PLATFORM",
      "PRICING"
    ],
    "competitiveEdge": "Single Sophos Central pane of glass plus per-user, no-surprise pricing – vs Palo Alto's multi-console premium pricing and CrowdStrike's 200-endpoint minimum and modular SKUs."
  },
  {
    "id": "MDR-01",
    "product": "MDR",
    "requirement": "Ease of deployment",
    "businessProblem": "Customers can't hire and retain enough 24x7 SOC analysts and need a managed service that delivers immediate coverage without months of onboarding.",
    "successCriteria": "Ease of integrating/deploying EDR agents; syslog ingestion; API-based integrations; service live within agreed SLA.",
    "measurement": "X endpoints integrated; X syslog sources onboarded; service live within Y days vs incumbent.",
    "edgeTags": [
      "PLATFORM",
      "NATIVE"
    ],
    "competitiveEdge": "Sophos Endpoint is included with MDR – no additional licence cost – and integrates natively. CrowdStrike requires Falcon and a 200–500 endpoint minimum, eliminating most lower mid-market."
  },
  {
    "id": "MDR-02",
    "product": "MDR",
    "requirement": "24x7 Detection coverage",
    "businessProblem": "Adversaries operate around the clock – including evenings and weekends – when in-house teams are off-shift, creating a critical detection gap.",
    "successCriteria": "24x7 monitoring across endpoints, network, identity, email and cloud delivered by Sophos MDR analysts.",
    "measurement": "X critical/high alerts triaged; documented incidents handled outside business hours; SLA adherence.",
    "edgeTags": [
      "NATIVE",
      "INTEL"
    ],
    "competitiveEdge": "Sophos MDR covers 5 attack surfaces in base pricing (Arctic Wolf covers 3); deep Sophos X-Ops + CTU telemetry from 600,000+ customers feeds detection."
  },
  {
    "id": "MDR-03",
    "product": "MDR",
    "requirement": "Alert Analysis & Investigation",
    "businessProblem": "False-positive volumes overwhelm internal teams; customers need expert triage so they only act on confirmed threats.",
    "successCriteria": "Sophos MDR analysts enrich alerts with X-Ops/CTU threat-intel and recommended actions; AI-accelerated investigation.",
    "measurement": "X investigations completed; Y true positives confirmed; mean-time-to-acknowledge / respond within SLA.",
    "edgeTags": [
      "INTEL",
      "AGENTIC"
    ],
    "competitiveEdge": "Agentic AI auto-handles 52% of cases in 89s with analyst oversight; BlueVoyant has been flagged in reviews for thin original research and limited proactive hunting."
  },
  {
    "id": "MDR-04",
    "product": "MDR",
    "requirement": "Proactive Threat Hunting",
    "businessProblem": "Stealthy adversaries dwell in environments for weeks; reactive monitoring alone misses them.",
    "successCriteria": "Proactive threat hunts performed by Sophos MDR using X-Ops/CTU intel; findings shared with the customer.",
    "measurement": "X proactive hunts delivered; findings documented with TTPs and recommended actions.",
    "edgeTags": [
      "INTEL"
    ],
    "competitiveEdge": "Hunts are informed by CTU's adversary-tracking and dark-web visibility – BlueVoyant is repeatedly flagged for limited proactive hunting depth."
  },
  {
    "id": "MDR-05",
    "product": "MDR",
    "requirement": "Full-Scale Incident Response",
    "businessProblem": "Containing a threat is not enough – if the adversary is still inside, the business is still at risk; many MDRs hand off IR to a separate (paid) firm.",
    "successCriteria": "Full-scale IR included with no hourly caps; root-cause analysis, removal of attacker tooling and persistence, reporting.",
    "measurement": "IR engagement simulated; threats fully removed (not just contained); root-cause report delivered.",
    "edgeTags": [
      "INTEL",
      "PRICING"
    ],
    "competitiveEdge": "Sophos MDR Complete includes unlimited IR + a $1M breach warranty. Arctic Wolf contains but typically does not remove – customers separately engage IR. CrowdStrike IR is a paid uplift."
  },
  {
    "id": "MDR-06",
    "product": "MDR",
    "requirement": "Custom Detection & Tuning",
    "businessProblem": "Generic detections don't reflect the customer's unique business and tech stack, leading to noise or blind spots.",
    "successCriteria": "Custom detection rules tailored to the customer; tunable suppression rules; transparency into what is changed.",
    "measurement": "X custom rules tuned by MDR; Y suppression rules created; FP reduction vs incumbent.",
    "edgeTags": [
      "PLATFORM"
    ],
    "competitiveEdge": "Sophos exposes custom detection authoring and threat-hunt access to the customer – Arctic Wolf and ReliaQuest are more opaque, restricting customer access to underlying detections."
  },
  {
    "id": "MDR-07",
    "product": "MDR",
    "requirement": "Automated Response Actions",
    "businessProblem": "Even with great detection, customers need response actions to be taken on their behalf during incidents to limit business impact.",
    "successCriteria": "6 autonomous response actions (account disable, custom playbooks, endpoint isolation, file quarantine, network containment, process termination); approval configurable.",
    "measurement": "Each of the 6 actions exercised in test; APT test script used to validate automations.",
    "edgeTags": [
      "NATIVE",
      "AGENTIC"
    ],
    "competitiveEdge": "Sophos supports 6 autonomous actions vs Arctic Wolf's 3 – broader, deeper response without escalating to another team."
  },
  {
    "id": "MDR-08",
    "product": "MDR",
    "requirement": "Vendor-agnostic & Integration breadth",
    "businessProblem": "Most customers have multi-vendor environments; an MDR that forces a rip-and-replace is a non-starter.",
    "successCriteria": "350+ integrations to enrich telemetry; works with first-party Sophos products and the customer's existing stack (CrowdStrike, Microsoft, Palo Alto, Fortinet, AWS, Okta, etc.).",
    "measurement": "X third-party telemetry sources integrated; coverage of the customer's named tools confirmed.",
    "edgeTags": [
      "PLATFORM"
    ],
    "competitiveEdge": "Vendor-agnostic by design – contrast with CrowdStrike Falcon Complete, which requires the customer to be on Falcon, and Arctic Wolf which limits incident response on third-party telemetry."
  },
  {
    "id": "MDR-09",
    "product": "MDR",
    "requirement": "Overall Experience – Account team & TCO",
    "businessProblem": "Customers want a true security partner, not just a vendor – with regular engagement, breach warranty and strategic guidance.",
    "successCriteria": "Engagement with the SOC complements customer team; consistency of account team; regular reviews; best-practice recommendations.",
    "measurement": "SOC support during true-positive investigation rated helpful; deployment of agents, APIs and playbooks clearly documented; peer references in same vertical.",
    "edgeTags": [
      "INTEL",
      "PRICING"
    ],
    "competitiveEdge": "$1M breach-protection warranty + unlimited IR + Sophos Endpoint included = lowest measurable TCO at this service tier."
  },
  {
    "id": "ITDR-01",
    "product": "ITDR",
    "requirement": "Ease of deployment",
    "businessProblem": "Identity is now the #1 attack vector but identity threats are often invisible to EDR/SIEM; rapid integration with Entra ID is required to start surfacing identity risk.",
    "successCriteria": "Microsoft Entra ID integration to collect all identities; setup of response actions; configuration of dark-web and VIP monitoring.",
    "measurement": "5 minutes for successful setup; 15 minutes until posture findings populate; # VIPs added.",
    "edgeTags": [
      "PLATFORM",
      "NATIVE"
    ],
    "competitiveEdge": "ITDR is delivered from Sophos Central, alongside endpoint, email and XDR – no separate ITDR vendor or console required."
  },
  {
    "id": "ITDR-02",
    "product": "ITDR",
    "requirement": "Posture Risk Monitoring",
    "businessProblem": "Organisations have no single, quantifiable view of their identity attack surface, making it hard to prioritise remediation. Sophos IR data shows 95% of Entra ID environments are misconfigured.",
    "successCriteria": "Overall identity risk score; findings for the identity attack surface.",
    "measurement": "# total identity risks found; # high/critical risks detected.",
    "edgeTags": [
      "INTEL"
    ],
    "competitiveEdge": "Risk findings are calibrated using Sophos Incident Response casework and CTU adversary tracking – grounded in real-world attacker behaviour, not just configuration checks."
  },
  {
    "id": "ITDR-03",
    "product": "ITDR",
    "requirement": "Reduce Identity Posture Risks",
    "businessProblem": "Identity misconfigurations (stale accounts, MFA gaps, over-privileged users) provide easy paths for attackers; teams need to demonstrably reduce risk.",
    "successCriteria": "Reduce identity attack surface by resolving findings; reduce overall identity risk during the PoV.",
    "measurement": "# findings resolved/dismissed; posture risk score at PoV start vs end; % risk reduction.",
    "edgeTags": [
      "NATIVE"
    ],
    "competitiveEdge": "When ITDR is paired with Sophos MDR, remediation can be performed by the MDR team – not just reported back to the customer to fix."
  },
  {
    "id": "ITDR-04",
    "product": "ITDR",
    "requirement": "Credential Monitoring",
    "businessProblem": "Compromised credentials on the dark web are routinely used to breach organisations, but customers have no automated way to detect leaks of their VIPs.",
    "successCriteria": "Enumerate compromised credentials found on the dark web; VIP monitoring.",
    "measurement": "# breached email accounts; # unique passwords breached; # high-profile account leaks.",
    "edgeTags": [
      "INTEL"
    ],
    "competitiveEdge": "Dark-web intelligence comes from Sophos X-Ops + CTU's law-enforcement-grade adversary tracking, a capability competitors typically bolt on via 3rd parties."
  },
  {
    "id": "ITDR-05",
    "product": "ITDR",
    "requirement": "Identity Catalog and Enrichment",
    "businessProblem": "Investigators waste time pivoting across tools to understand who a user is, what they have access to and whether their credentials are current.",
    "successCriteria": "Identity context collected from Entra ID and available in Taegis ITDR; ease of access to context.",
    "measurement": "Comprehensive view of Entra ID entities (#Users, #Groups, #Devices, #Apps); credential update timestamps and MFA detection; related alerts.",
    "edgeTags": [
      "PLATFORM"
    ],
    "competitiveEdge": "Identity context surfaces in the same Taegis console as endpoint, email, network and cloud telemetry – no swivel-chair between an IAM tool, a SIEM and an EDR."
  },
  {
    "id": "ITDR-06",
    "product": "ITDR",
    "requirement": "Take Response Actions",
    "businessProblem": "When identity is compromised, slow response means lateral movement and data theft; teams need one-click response from the ITDR console.",
    "successCriteria": "Manage user access directly from ITDR – password reset, session revocation, disable user, confirm user as compromised.",
    "measurement": "Each response action tested end-to-end.",
    "edgeTags": [
      "AGENTIC",
      "NATIVE"
    ],
    "competitiveEdge": "Response is in-console and can be delegated to the Sophos MDR team via the same workflow – competitors typically alert and leave the action to the customer."
  },
  {
    "id": "ITDR-07",
    "product": "ITDR",
    "requirement": "Overall Experience",
    "businessProblem": "Identity tooling that is hard to use will not be adopted by stretched IT/security teams.",
    "successCriteria": "User-friendly; helpful recommendations.",
    "measurement": "Intuitive interface with rich context; useful recommendations on mitigating identity-threat findings.",
    "edgeTags": [
      "PLATFORM"
    ],
    "competitiveEdge": "Same Sophos Central UX customers already know – low training overhead vs introducing a standalone ITDR vendor."
  },
  {
    "id": "SIEM-01",
    "product": "NG SIEM",
    "requirement": "Ease of deployment & ingestion",
    "businessProblem": "Legacy SIEMs take months to deploy and tune; customers need a Next-Gen SIEM that ingests data from existing tools fast, without rebuilding the SOC.",
    "successCriteria": "Pre-built integrations across endpoint, network, identity, email and cloud; HTTP, syslog and API ingestion; native Sophos Endpoint telemetry.",
    "measurement": "X sources connected in Y days; # endpoints/users/cloud accounts ingested; GB/day vs forecast.",
    "edgeTags": [
      "PLATFORM",
      "NATIVE"
    ],
    "competitiveEdge": "Hundreds of pre-built integrations + native Sophos endpoint telemetry. Splunk/QRadar projects routinely take 6–12 months; Taegis NG SIEM is measured in days."
  },
  {
    "id": "SIEM-02",
    "product": "NG SIEM",
    "requirement": "Log Retention & Compliance",
    "businessProblem": "Compliance (PCI, HIPAA, SOX, GDPR, NIS2) requires 12 months or more of log retention, but legacy SIEMs make this prohibitively expensive.",
    "successCriteria": "Cost-effective storage of threat-relevant and compliance-required telemetry for up to 5 years (1 year default); predictable pricing.",
    "measurement": "Retention period configured; storage vs licensed allocation; query data from > X months ago confirmed.",
    "edgeTags": [
      "PRICING"
    ],
    "competitiveEdge": "1 year of retention included as standard, up to 5 years, with predictable pricing – Splunk and Palo Alto XSIAM ingestion economics typically force customers to drop sources to control cost."
  },
  {
    "id": "SIEM-03",
    "product": "NG SIEM",
    "requirement": "Detection Engineering",
    "businessProblem": "Generic detections produce noise; customers need to author rules aligned to their environment without learning a proprietary query language.",
    "successCriteria": "Layered detection using watchlists, signatures, patterns, AI/ML; pre-tuned content; custom-rule authoring.",
    "measurement": "# out-of-the-box detections enabled; # custom rules authored; FP reduction vs incumbent SIEM.",
    "edgeTags": [
      "INTEL",
      "AGENTIC"
    ],
    "competitiveEdge": "Detections backed by CTU threat-intel and continuously improved through Sophos AI – CISA itself has warned that legacy SIEM/SOAR require constant tuning that customers can't sustain."
  },
  {
    "id": "SIEM-04",
    "product": "NG SIEM",
    "requirement": "AI-enabled Search & Reporting",
    "businessProblem": "Auditors and incident responders need fast, flexible search across all retained data; analysts shouldn't need to learn a proprietary DSL.",
    "successCriteria": "AI-enabled natural-language search; prebuilt and custom reports and dashboards.",
    "measurement": "X advanced searches executed; Y dashboards created; demonstrated audit-ready reports for [PCI / NIS2 / HIPAA].",
    "edgeTags": [
      "AGENTIC"
    ],
    "competitiveEdge": "Natural-language search and AI-generated summaries – a capability competitors are still catching up to and usually charge for separately."
  },
  {
    "id": "SIEM-05",
    "product": "NG SIEM",
    "requirement": "Cross-surface correlation",
    "businessProblem": "Attacks span endpoint, identity, email and cloud; siloed tools miss the chain.",
    "successCriteria": "Correlate data across sources to detect threats legacy SIEMs miss; analyse raw telemetry, not just alerts.",
    "measurement": "X multi-source correlations demonstrated; example: phishing → endpoint detection → identity action chained into a single case.",
    "edgeTags": [
      "PLATFORM",
      "NATIVE"
    ],
    "competitiveEdge": "Native correlation with Sophos Endpoint, firewall, email and ITDR included – ReliaQuest depends entirely on the customer's underlying tools."
  },
  {
    "id": "SIEM-06",
    "product": "NG SIEM",
    "requirement": "SOAR / Automation",
    "businessProblem": "Manual response is slow; teams need built-in playbooks to contain common threats without buying a separate SOAR.",
    "successCriteria": "Built-in SOAR with pre-built playbooks designed by analysts; flexible workflows.",
    "measurement": "X playbooks deployed; Y automated response actions executed; MTTR reduction measured.",
    "edgeTags": [
      "AGENTIC",
      "PRICING"
    ],
    "competitiveEdge": "SOAR included – no separate SOAR licence (Splunk SOAR, Palo Alto XSOAR, etc.) which can match or exceed the SIEM licence cost on its own."
  },
  {
    "id": "SIEM-07",
    "product": "NG SIEM",
    "requirement": "TCO vs legacy SIEM",
    "businessProblem": "Customers are exiting expensive legacy SIEM contracts (Splunk, QRadar, Sentinel) and need a credible Next-Gen alternative.",
    "successCriteria": "Predictable, scalable pricing; reduced staffing and tuning effort vs legacy SIEM.",
    "measurement": "TCO comparison (licence + storage + FTE); analyst time saved/week; reduction in tuning effort.",
    "edgeTags": [
      "PRICING"
    ],
    "competitiveEdge": "Customers consistently report material TCO reduction switching from Splunk/QRadar to Taegis NG SIEM, particularly in log-volume-driven costs."
  },
  {
    "id": "SIEM-08",
    "product": "NG SIEM",
    "requirement": "Overall Experience",
    "businessProblem": "If the platform is too complex, it won't deliver the promised outcomes regardless of features.",
    "successCriteria": "Usable for both analysts and IT admins; clear documentation, training and account team support.",
    "measurement": "Analyst CSAT; documentation rated clear; SE/CSM engagement met expectations; reference customers in same vertical.",
    "edgeTags": [
      "PLATFORM"
    ],
    "competitiveEdge": "Same Sophos Central UX across the portfolio – lower training overhead than spinning up a dedicated SIEM team."
  },
  {
    "id": "WSP-01",
    "product": "Workspace Protection",
    "requirement": "Ease of deployment",
    "businessProblem": "Securing remote and hybrid workers traditionally requires multiple agents, VPNs and complex back-hauling – expensive and slow to roll out.",
    "successCriteria": "Per-user licensing; single Chromium-based Protected Browser deployed via Sophos Central; no back-hauling or MITM decryption.",
    "measurement": "X users deployed within Y days; # locations; effort vs incumbent (SWG + VPN + DLP).",
    "edgeTags": [
      "PLATFORM",
      "PRICING"
    ],
    "competitiveEdge": "One bundle, one SKU, per user – competitors typically charge for SWG, ZTNA, DNS, DLP and email-augment separately."
  },
  {
    "id": "WSP-02",
    "product": "Workspace Protection",
    "requirement": "Web & Phishing Protection (SWG)",
    "businessProblem": "Web and phishing attacks remain the #1 ransomware entry vector; remote workers bypass perimeter controls when off-network.",
    "successCriteria": "Integrated SWG in the Protected Browser; full web-policy enforcement using AI threat intel from Sophos X-Ops.",
    "measurement": "# malicious URLs blocked; # categories enforced; phishing-test block rate.",
    "edgeTags": [
      "INTEL"
    ],
    "competitiveEdge": "Web threat intelligence driven by Sophos X-Ops – the same intel feeding endpoint, email and firewall – delivers more consistent verdicts than stitched best-of-breed SWGs."
  },
  {
    "id": "WSP-03",
    "product": "Workspace Protection",
    "requirement": "DNS Protection",
    "businessProblem": "Malware uses DNS for C2 and exfiltration; DNS is a critical, often-missed control point.",
    "successCriteria": "Sophos DNS Protection across all ports, protocols and apps on Windows endpoints; DNS over HTTPS.",
    "measurement": "# malicious/risky/unwanted domains blocked; coverage on/off corporate network.",
    "edgeTags": [
      "NATIVE"
    ],
    "competitiveEdge": "Included in the Workspace Protection bundle – not a separate add-on or DNS-vendor relationship."
  },
  {
    "id": "WSP-04",
    "product": "Workspace Protection",
    "requirement": "Zero Trust Network Access (ZTNA)",
    "businessProblem": "Legacy VPNs expose the whole network and are slow; customers want application-level access without exposing apps to the internet.",
    "successCriteria": "Integrated ZTNA in Protected Browser (agentless or thin-agent); device-posture assessment via Synchronized Security.",
    "measurement": "# private apps published via ZTNA; X users without VPN; posture checks enforced for Y device-health policies.",
    "edgeTags": [
      "NATIVE",
      "PLATFORM"
    ],
    "competitiveEdge": "ZTNA-Endpoint Synchronized Security (Sophos Heartbeat) ties device health to access – a native capability no MDR-only or pure-browser-security vendor can offer."
  },
  {
    "id": "WSP-05",
    "product": "Workspace Protection",
    "requirement": "Data Boundary Controls / DLP",
    "businessProblem": "Sensitive data leaks via copy/paste, screen capture, uploads/downloads to personal or AI apps – traditional DLP is heavy and bypassed.",
    "successCriteria": "Granular control over copy/paste, screen capture, uploads, downloads, data redaction in the Protected Browser.",
    "measurement": "# DLP policies configured; data-exfil attempts blocked in test; controls applied to [SaaS / GenAI app].",
    "edgeTags": [
      "NATIVE"
    ],
    "competitiveEdge": "Browser-level DLP is enforced where the user actually works – no MITM decryption and no separate DLP suite needed."
  },
  {
    "id": "WSP-06",
    "product": "Workspace Protection",
    "requirement": "Shadow IT & GenAI governance",
    "businessProblem": "Employees adopt unsanctioned SaaS and Generative-AI tools, putting sensitive data at risk; blanket blocks hurt productivity.",
    "successCriteria": "Visibility and control over SaaS / GenAI usage with policy controls and data redaction in-browser.",
    "measurement": "# shadow-IT apps discovered; # GenAI tools governed; sensitive data redacted before submission.",
    "edgeTags": [
      "NATIVE"
    ],
    "competitiveEdge": "Native GenAI governance in the browser is a 2026 differentiator – competitors typically rely on add-on CASB or DLP licences."
  },
  {
    "id": "WSP-07",
    "product": "Workspace Protection",
    "requirement": "Email Monitoring System",
    "businessProblem": "Customers on M365/Google native email security still see phishing and BEC slip through – they want a second layer without ripping out existing tooling.",
    "successCriteria": "Email Monitoring System deployed alongside M365/Google; identifies missed threats and feeds telemetry into MDR/XDR.",
    "measurement": "# additional phishing/BEC threats detected vs native filter; email telemetry visible in Central/Taegis.",
    "edgeTags": [
      "INTEL",
      "NATIVE"
    ],
    "competitiveEdge": "Adds Sophos email telemetry into MDR/XDR cases – BlueVoyant (Microsoft-centric) and Arctic Wolf typically rely on whatever signals the customer's existing tools surface."
  },
  {
    "id": "WSP-08",
    "product": "Workspace Protection",
    "requirement": "Browser hardening",
    "businessProblem": "Browser exploits and malicious extensions are increasingly common attack vectors against remote workers.",
    "successCriteria": "Hardened Chromium browser; control over extensions, local data and app usage.",
    "measurement": "# browser-policy violations blocked; extension allow/deny list enforced; tamper-protection confirmed.",
    "edgeTags": [
      "NATIVE"
    ],
    "competitiveEdge": "Hardened enterprise browser (powered by Island) is a true product category – not a policy bolted onto Edge/Chrome."
  },
  {
    "id": "WSP-09",
    "product": "Workspace Protection",
    "requirement": "Overall Experience",
    "businessProblem": "Security solutions that hurt user experience are bypassed by users and rolled back by IT.",
    "successCriteria": "Transparent Chromium experience; per-user licensing; single Sophos Central console.",
    "measurement": "UX survey ≥ X/10; helpdesk tickets re access reduced by Y%; admin CSAT.",
    "edgeTags": [
      "PLATFORM",
      "PRICING"
    ],
    "competitiveEdge": "Per-user pricing, one console – lowest-friction option for remote-worker security."
  },
  {
    "id": "EMAIL-01",
    "product": "Email Security",
    "requirement": "Ease of deployment",
    "businessProblem": "Email is the #1 attack vector but adding email security is often perceived as risky and complex – customers want fast onboarding for M365/Google without disrupting mail flow.",
    "successCriteria": "Compatible with M365/Google; certificate-based mail-flow connectors; integration with AD Sync.",
    "measurement": "X mailboxes onboarded within Y hours; zero mail-flow disruption; AD Sync configured.",
    "edgeTags": [
      "PLATFORM"
    ],
    "competitiveEdge": "Onboarding from Sophos Central – the same console used for endpoint and MDR. Competing email-only vendors (Mimecast, Proofpoint) require yet another console."
  },
  {
    "id": "EMAIL-02",
    "product": "Email Security",
    "requirement": "Anti-phishing & Malicious URL/Attachment",
    "businessProblem": "Phishing remains the cheapest, most reliable initial-access vector for attackers.",
    "successCriteria": "Multi-layered AI detection of phishing URLs and malicious attachments; URL rewriting and time-of-click; sandboxing.",
    "measurement": "# phishing emails blocked; # malicious attachments detonated and blocked; phishing-sim block rate.",
    "edgeTags": [
      "INTEL",
      "AGENTIC"
    ],
    "competitiveEdge": "Detection backed by X-Ops + Sophos AI deep-learning models – the same intelligence that powers endpoint, browser and firewall."
  },
  {
    "id": "EMAIL-03",
    "product": "Email Security",
    "requirement": "Impersonation / BEC Protection",
    "businessProblem": "BEC (CEO fraud, supplier-invoice fraud) typically has no payload and bypasses traditional filters, causing some of the largest financial losses.",
    "successCriteria": "VIP, brand and general impersonation detection using display-name analysis, header analysis and ML on tone/wording.",
    "measurement": "# VIPs configured; # BEC/impersonation attempts blocked or tagged; FP rate.",
    "edgeTags": [
      "AGENTIC",
      "INTEL"
    ],
    "competitiveEdge": "AI-driven tone/wording analysis goes beyond signature-based filters – particularly important as attackers use generative-AI to write more convincing BEC."
  },
  {
    "id": "EMAIL-04",
    "product": "Email Security",
    "requirement": "Anti-spam & filtering controls",
    "businessProblem": "Spam wastes user time and can hide targeted attacks within bulk noise.",
    "successCriteria": "Anti-spam engine; granular actions (block, quarantine, banner, tag).",
    "measurement": "Spam catch rate %; FP rate; quarantine-review process tested.",
    "edgeTags": [
      "PLATFORM"
    ],
    "competitiveEdge": "Single-console quarantine and policy management – no separate email-security admin team."
  },
  {
    "id": "EMAIL-05",
    "product": "Email Security",
    "requirement": "DLP & Encryption",
    "businessProblem": "Regulated industries must prevent sensitive data leaving via email; legacy DLP/encryption add-ons are clunky.",
    "successCriteria": "DLP policies; range of encryption options for outbound mail.",
    "measurement": "# DLP policies enforced; # encrypted messages sent; compliance use case [PCI/HIPAA/GDPR] supported.",
    "edgeTags": [
      "NATIVE"
    ],
    "competitiveEdge": "DLP and encryption are part of Sophos Email, not separate licences – simpler licensing than typical M365 add-on or third-party DLP."
  },
  {
    "id": "EMAIL-06",
    "product": "Email Security",
    "requirement": "Awareness Training & Phishing Simulation",
    "businessProblem": "Users remain the most exploited control; without ongoing training, behaviour does not improve.",
    "successCriteria": "Automated phishing-simulation campaigns; awareness training; actionable reporting.",
    "measurement": "# campaigns delivered; click-through rate trend; # users completing training; risk-score reduction.",
    "edgeTags": [
      "NATIVE"
    ],
    "competitiveEdge": "Phishing simulation and training are bundled with the Sophos Email portfolio – no need for a separate KnowBe4/PhishMe contract."
  },
  {
    "id": "EMAIL-07",
    "product": "Email Security",
    "requirement": "Reporting & MDR/XDR integration",
    "businessProblem": "Security and compliance leaders need defensible reporting on email threats and full visibility into multi-stage attacks that start in email.",
    "successCriteria": "Full visibility into email traffic and detections; integration with XDR/MDR so email is a first-class telemetry source.",
    "measurement": "X dashboards/reports demonstrated; email telemetry visible in Sophos Central or Taegis; audit-ready reports produced.",
    "edgeTags": [
      "PLATFORM",
      "NATIVE"
    ],
    "competitiveEdge": "Email telemetry feeds Taegis MDR/XDR cases directly – BlueVoyant typically depends on the customer's existing Microsoft signals only."
  },
  {
    "id": "EMAIL-08",
    "product": "Email Security",
    "requirement": "Overall Experience",
    "businessProblem": "Email security that creates friction for end-users or admins ends up disabled or replaced.",
    "successCriteria": "Simple policy management; user-friendly self-service quarantine; responsive support.",
    "measurement": "Admin CSAT; end-user quarantine self-service used by X% of users; support response within SLA.",
    "edgeTags": [
      "PRICING"
    ],
    "competitiveEdge": "Per-user pricing model and bundling reduce TCO vs Mimecast/Proofpoint best-of-breed quotes for similar feature coverage."
  },
  {
    "id": "EP-01",
    "product": "Endpoint",
    "requirement": "Ease of deployment & migration",
    "businessProblem": "Migrating endpoint protection across thousands of devices typically causes performance issues and project overruns; customers need fast, low-friction rollout.",
    "successCriteria": "Cloud-managed via Sophos Central; lightweight agent; coexistence options during migration; per-user/per-device licensing.",
    "measurement": "X endpoints (Win/macOS/Linux/server) deployed within Y days; coexistence with incumbent AV; CPU/RAM impact within threshold.",
    "edgeTags": [
      "PLATFORM",
      "PRICING"
    ],
    "competitiveEdge": "No 200-endpoint minimum (unlike CrowdStrike) – Sophos serves from SMB to enterprise on the same product."
  },
  {
    "id": "EP-02",
    "product": "Endpoint",
    "requirement": "Anti-Ransomware (CryptoGuard)",
    "businessProblem": "Ransomware causes catastrophic business disruption and ransom demands; signature-based AV can't keep up.",
    "successCriteria": "CryptoGuard stops unauthorised local and remote file encryption and rolls back affected files; MBR protection.",
    "measurement": "Ransomware simulation blocked and files rolled back; remote-encryption attempt blocked; MBR attack blocked.",
    "edgeTags": [
      "INTEL"
    ],
    "competitiveEdge": "CryptoGuard is patented technology with proven file-rollback – a capability not all NGAV/EDR vendors include natively. Sophos was a 16x Leader in Gartner Magic Quadrant for EPP."
  },
  {
    "id": "EP-03",
    "product": "Endpoint",
    "requirement": "Deep-Learning Malware Detection",
    "businessProblem": "Unknown/zero-day malware bypasses signature-based AV; customers need predictive protection.",
    "successCriteria": "Deep-learning neural-network detection of known and unknown malware without signatures.",
    "measurement": "# zero-day/unknown samples detected in test set; FP rate; detection vs incumbent on a sample set.",
    "edgeTags": [
      "AGENTIC",
      "INTEL"
    ],
    "competitiveEdge": "Sophos AI was an early deep-learning adopter and Sophos AI is integrated with X-Ops – models are continuously trained on telemetry from 600,000+ customers."
  },
  {
    "id": "EP-04",
    "product": "Endpoint",
    "requirement": "Exploit Prevention",
    "businessProblem": "Attackers reuse a small set of exploit techniques across many CVEs; blocking techniques stops zero-days before patches exist.",
    "successCriteria": "60+ proprietary exploit mitigations including credential-theft, code-cave, APC protection; no tuning required.",
    "measurement": "# exploit techniques blocked in test; credential-theft attempt blocked; LotL technique blocked.",
    "edgeTags": [
      "NATIVE"
    ],
    "competitiveEdge": "Largest catalogue of exploit mitigations in the EPP market with zero tuning – Cortex XDR and CrowdStrike are powerful but typically need more expert tuning."
  },
  {
    "id": "EP-05",
    "product": "Endpoint",
    "requirement": "Adaptive Defences & Tamper Protection",
    "businessProblem": "Skilled attackers disable EDR via 'bring-your-own-vulnerable-driver' before deploying ransomware.",
    "successCriteria": "Adaptive Attack Protection; kernel-level Tamper Protection; defences adapt under active attack.",
    "measurement": "Attempt to disable agent blocked; vulnerable-driver load blocked; AAP triggers logged.",
    "edgeTags": [
      "AGENTIC"
    ],
    "competitiveEdge": "AAP changes the endpoint's posture automatically when an attack is detected – an autonomous-AI-like control few competitors expose to customers."
  },
  {
    "id": "EP-06",
    "product": "Endpoint",
    "requirement": "EDR/XDR threat hunting",
    "businessProblem": "Customers need to investigate suspicious activity and IT-hygiene questions without ripping data out.",
    "successCriteria": "Live Discover (SQL-like) queries across endpoints and servers; Live Response for remote investigation.",
    "measurement": "X Live Discover queries executed; Y Live Response sessions performed; saved hunt queries created.",
    "edgeTags": [
      "PLATFORM"
    ],
    "competitiveEdge": "Same Sophos Central UI as the rest of the stack – CrowdStrike's depth is comparable but adds platform-lock-in and higher cost."
  },
  {
    "id": "EP-07",
    "product": "Endpoint",
    "requirement": "Application / Peripheral / Web Control",
    "businessProblem": "Unmanaged applications, USB devices and risky web categories expand the attack surface and create compliance risk.",
    "successCriteria": "App Control, Peripheral Control, Web Control policies enforced via Sophos Central.",
    "measurement": "# applications categorised and controlled; # peripherals controlled; # web categories managed.",
    "edgeTags": [
      "NATIVE"
    ],
    "competitiveEdge": "Included with Sophos Endpoint – competitors often charge extra for device control / web filtering."
  },
  {
    "id": "EP-08",
    "product": "Endpoint",
    "requirement": "Synchronized Security with Firewall",
    "businessProblem": "Compromised endpoints continue to talk to the firewall and network; customers want automatic isolation without manual analyst action.",
    "successCriteria": "Security Heartbeat between Sophos Endpoint and Sophos Firewall; automatic isolation of compromised hosts.",
    "measurement": "Test compromise triggers Heartbeat red; firewall isolates host automatically; cleanup restores green.",
    "edgeTags": [
      "NATIVE",
      "PLATFORM"
    ],
    "competitiveEdge": "Synchronized Security is a Sophos-only capability – CrowdStrike, SentinelOne and Cortex XDR don't have a first-party firewall to coordinate with."
  },
  {
    "id": "EP-09",
    "product": "Endpoint",
    "requirement": "Overall Experience & TCO",
    "businessProblem": "Endpoint tools are managed daily by IT teams – usability, manageability and support directly affect outcomes.",
    "successCriteria": "Single Sophos Central console for Endpoint, EDR/XDR and other Sophos products; clear root-cause analysis; responsive support.",
    "measurement": "Admin CSAT; RCA produced for X test incidents; support cases resolved within SLA.",
    "edgeTags": [
      "PRICING",
      "PLATFORM"
    ],
    "competitiveEdge": "Sophos Endpoint is included with MDR – the only major vendor that bundles its market-leading endpoint into the managed service at no extra cost."
  },
  {
    "id": "NDR-01",
    "product": "NDR",
    "requirement": "Ease of deployment",
    "businessProblem": "Adding network detection traditionally means complex hardware, span ports and tuning; customers want fast value without disrupting the network.",
    "successCriteria": "Virtual appliance authenticates to Sophos Central; integrates with managed endpoints and firewalls; no baseline-learning delay.",
    "measurement": "X NDR sensors deployed within Y days; visibility confirmed in Sophos Central; MDR/XDR integration active.",
    "edgeTags": [
      "PLATFORM"
    ],
    "competitiveEdge": "Plug-and-play with Sophos Central – no baseline-learning delay like generic NDR products that need weeks of traffic before producing detections."
  },
  {
    "id": "NDR-02",
    "product": "NDR",
    "requirement": "Visibility into unmanaged & IoT devices",
    "businessProblem": "Unmanaged, IoT and OT devices can't run an EDR agent – they are common attack entry and lateral-movement paths invisible to endpoint tools.",
    "successCriteria": "Identify unprotected devices (IoT, OT, legacy OS); pinpoint unauthorised/rogue devices.",
    "measurement": "# unmanaged devices discovered; # rogue/unexpected devices; manufacturer & OS attribution.",
    "edgeTags": [
      "NATIVE"
    ],
    "competitiveEdge": "Critical companion to Sophos Endpoint – covers exactly the surfaces endpoint can't, in the same Central console."
  },
  {
    "id": "NDR-03",
    "product": "NDR",
    "requirement": "Detection of network-only threats",
    "businessProblem": "Skilled adversaries evade endpoint controls but must cross the network – C2, lateral movement and exfiltration leave network traces.",
    "successCriteria": "Five real-time detection engines: rule-based, AI-powered ML, behavioural analytics; detect C2, DGA, encrypted-traffic anomalies, lateral movement.",
    "measurement": "# detections per engine; C2 attempt detected in simulation; encrypted-traffic detection demonstrated.",
    "edgeTags": [
      "INTEL",
      "AGENTIC"
    ],
    "competitiveEdge": "Five engines including deep-learning for encrypted-traffic analysis – competitors often rely on a single rule-based engine."
  },
  {
    "id": "NDR-04",
    "product": "NDR",
    "requirement": "Encrypted traffic analysis",
    "businessProblem": "Most network traffic is now encrypted; decryption is expensive and privacy-sensitive – customers need detection without TLS interception.",
    "successCriteria": "Deep-learning analysis of encrypted-traffic metadata; detection of malicious payloads without TLS decryption.",
    "measurement": "Encrypted-C2 sample detected without decryption; DGA-domain detections logged.",
    "edgeTags": [
      "AGENTIC",
      "INTEL"
    ],
    "competitiveEdge": "Detect-without-decrypt is a key 2026 advantage as customers move away from MITM SSL inspection."
  },
  {
    "id": "NDR-05",
    "product": "NDR",
    "requirement": "Insider threat & data movement",
    "businessProblem": "Insider threats and abnormal east-west flows are invisible to perimeter tools and rarely produce endpoint alerts.",
    "successCriteria": "Behavioural analytics on east-west traffic; visibility into 'normal' data movement.",
    "measurement": "Baseline of normal traffic established; abnormal data-movement scenario flagged; insider-threat scenario detected.",
    "edgeTags": [
      "INTEL"
    ],
    "competitiveEdge": "East-west visibility from inside the network – something Palo Alto's gateway-centric posture struggles to deliver without expensive sensor sprawl."
  },
  {
    "id": "NDR-06",
    "product": "NDR",
    "requirement": "Cross-product Active Threat Response",
    "businessProblem": "Network detections are only valuable if they trigger fast response; isolated NDR creates yet another silo.",
    "successCriteria": "Detections flow into Sophos Central data lake; cross-product automation with XDR, MDR and Sophos Firewall (Active Threat Response) blocks malicious activity automatically.",
    "measurement": "X NDR detections triggered XDR cases; threat feed pushed to firewall to block in test; investigation in NDR Investigation Console demonstrated.",
    "edgeTags": [
      "NATIVE",
      "PLATFORM"
    ],
    "competitiveEdge": "Sophos NDR + Firewall + Endpoint + MDR cross-product automation is a true Synchronized-Security advantage – competitors require SOAR orchestration to glue equivalents together."
  },
  {
    "id": "NDR-07",
    "product": "NDR",
    "requirement": "Overall Experience",
    "businessProblem": "If NDR is noisy or hard to investigate, analysts ignore it and value is lost.",
    "successCriteria": "Low false-positive rate via correlation and scoring across engines; NDR Investigation Console for forensic drill-down.",
    "measurement": "FP rate within agreed threshold; X forensic investigations completed; analyst CSAT.",
    "edgeTags": [
      "INTEL"
    ],
    "competitiveEdge": "Five-engine correlation reduces noise – contrast with first-generation NDR tools known for high false-positive rates."
  },
  {
    "id": "FW-01",
    "product": "Firewall",
    "requirement": "Ease of deployment & central management",
    "businessProblem": "Branch and distributed networks make firewall rollout, configuration drift and ongoing management hard; customers want zero-touch deployment and one place to manage all firewalls.",
    "successCriteria": "Cloud-managed via Sophos Central; zero-touch deployment of XGS appliances; group policy; backup, firmware and template management across sites.",
    "measurement": "X firewalls deployed in Y days; templated policies applied to N sites; ZTD success rate; admin hours saved per change vs incumbent.",
    "edgeTags": [
      "PLATFORM"
    ],
    "competitiveEdge": "Sophos Central manages firewalls alongside endpoint, MDR, email, ITDR and Workspace Protection in a single console – Fortinet requires FortiManager/FortiAnalyzer, Palo Alto requires Panorama, Check Point requires SmartConsole as separate platforms with their own licensing."
  },
  {
    "id": "FW-02",
    "product": "Firewall",
    "requirement": "Xstream TLS 1.3 inspection performance",
    "businessProblem": "~99% of web traffic is encrypted; firewalls that can't inspect TLS without major performance loss create a massive blind spot for malware, ransomware C2 and data exfiltration.",
    "successCriteria": "Xstream architecture with dedicated Flow Processor delivers TLS 1.3 inspection without downgrading; FastPath offload of trusted traffic; deep-packet inspection in a single streaming engine.",
    "measurement": "Throughput with TLS inspection enabled vs incumbent at the same ruleset; % of encrypted traffic now visible; latency impact measured.",
    "edgeTags": [
      "NATIVE"
    ],
    "competitiveEdge": "Xstream's hardware-accelerated TLS 1.3 inspection without downgrade is a Sophos differentiator – Fortinet and many competitors still struggle with TLS-inspection performance penalties or downgrade to TLS 1.2."
  },
  {
    "id": "FW-03",
    "product": "Firewall",
    "requirement": "AI-powered threat protection (IPS, AV, sandboxing)",
    "businessProblem": "Customers need protection against ransomware, zero-day exploits and advanced persistent threats at the network edge, not just at the endpoint.",
    "successCriteria": "Streaming DPI engine for next-gen IPS, AV, web/app control; cloud sandboxing (Zero-Day Protection); deep-learning file analysis; AI-driven detection by SophosLabs/X-Ops.",
    "measurement": "# IPS attacks blocked in test; # zero-day samples blocked by sandboxing; # PUA / risky web categories blocked; FP rate.",
    "edgeTags": [
      "INTEL"
    ],
    "competitiveEdge": "Network-edge AI detection is fed by Sophos X-Ops + CTU – the same intelligence that powers endpoint, email and MDR. Competitors typically maintain separate, smaller threat-research teams."
  },
  {
    "id": "FW-04",
    "product": "Firewall",
    "requirement": "Synchronized Security with Sophos Endpoint",
    "businessProblem": "Compromised endpoints continue to communicate through the firewall and laterally; manual investigation and isolation is slow and depends on alert correlation across two tools.",
    "successCriteria": "Security Heartbeat between Sophos Endpoint and Sophos Firewall; automatic isolation of unhealthy hosts; user identity and application context shared with firewall policy.",
    "measurement": "Test compromise triggers Heartbeat red; firewall isolates host automatically; cleanup restores green; lateral-movement attempt blocked.",
    "edgeTags": [
      "NATIVE",
      "PLATFORM"
    ],
    "competitiveEdge": "Synchronized Security is a Sophos-only capability – Fortinet's Security Fabric is broadly comparable in concept but Sophos uniquely ties endpoint health directly to firewall policy in real time. CrowdStrike, SentinelOne and Cortex XDR have no first-party firewall to coordinate with."
  },
  {
    "id": "FW-05",
    "product": "Firewall",
    "requirement": "Active Threat Response & cross-product automation",
    "businessProblem": "Customers need active threats stopped automatically across the whole estate – endpoint, network and SOC – not just notifications.",
    "successCriteria": "Active Threat Response: threat feeds from XDR/MDR/NDR pushed to the firewall to block malicious activity in real time; integrated NDR Essentials in the firewall (v21.5+).",
    "measurement": "End-to-end test: NDR/XDR detection → automatic firewall block; time-to-block measured; # of threats blocked via automated feed.",
    "edgeTags": [
      "NATIVE",
      "AGENTIC"
    ],
    "competitiveEdge": "Cross-product automation between Firewall, Endpoint, NDR, MDR and XDR is unique to Sophos. Building the equivalent on Fortinet or Palo Alto typically requires SOAR licensing and custom playbooks."
  },
  {
    "id": "FW-06",
    "product": "Firewall",
    "requirement": "Integrated ZTNA Gateway",
    "businessProblem": "VPNs are slow, expose the whole network and are routinely targeted by ransomware groups; customers want to retire VPN in favour of zero-trust application access.",
    "successCriteria": "Integrated ZTNA Gateway on the firewall; ZTNA included with Sophos Workspace Protection; agentless or thin-agent access; device-posture checks via Synchronized Security.",
    "measurement": "# applications published via ZTNA; # users accessing without VPN; posture checks enforced for X policies; user-experience survey.",
    "edgeTags": [
      "NATIVE",
      "PLATFORM"
    ],
    "competitiveEdge": "ZTNA is integrated into the firewall and bundled with Workspace Protection – Fortinet ZTNA requires FortiClient, Palo Alto Prisma Access is a separate product, and Cisco needs DUO + AnyConnect + Umbrella."
  },
  {
    "id": "FW-07",
    "product": "Firewall",
    "requirement": "Xstream SD-WAN",
    "businessProblem": "Hybrid and multi-site organisations need SD-WAN for cloud and SaaS performance, but enterprise SD-WAN vendors charge an additional product line on top of the firewall.",
    "successCriteria": "Xstream SD-WAN with performance-based link selection, application-aware routing, zero-impact link transitions, cloud-managed orchestration; FastPath acceleration of VPN tunnel traffic.",
    "measurement": "# SD-WAN profiles configured; failover time on link drop; throughput improvement on cloud apps; site-to-site VPN throughput.",
    "edgeTags": [
      "NATIVE",
      "PRICING"
    ],
    "competitiveEdge": "SD-WAN is included with Sophos Firewall – Fortinet SD-WAN is strong but often pushes customers into bigger appliances; Cisco Meraki, VMware VeloCloud and Versa are separate SD-WAN purchases on top of the firewall."
  },
  {
    "id": "FW-08",
    "product": "Firewall",
    "requirement": "NDR Essentials (integrated)",
    "businessProblem": "Encrypted-traffic blind spots and rogue/IoT devices on the network are missed by perimeter-only firewalls; customers want NDR-style visibility without buying a separate NDR product.",
    "successCriteria": "Cloud-delivered NDR Essentials integrated with Sophos Firewall v21.5+: AI detection of malicious encrypted payloads (no TLS decryption) and DGA domains; Active Threat Response feed back to the firewall.",
    "measurement": "# encrypted-payload detections; # DGA detections; threats fed back into Active Threat Response.",
    "edgeTags": [
      "NATIVE",
      "INTEL"
    ],
    "competitiveEdge": "NDR Essentials is included with the firewall – an industry-first integration. Customers get a slice of NDR value without licensing a separate NDR product (which most competitors require)."
  },
  {
    "id": "FW-09",
    "product": "Firewall",
    "requirement": "Secure by Design (automatic hotfixes & health check)",
    "businessProblem": "Firewall appliances have been a recurring target (Pulse, Fortinet, Palo Alto, Cisco) with CVEs exploited within days; customers need a firewall that hardens itself.",
    "successCriteria": "Automatic hotfix delivery; health-check for risky configuration; remote integrity monitoring by Sophos; hardened code base.",
    "measurement": "Automatic hotfix applied during PoV verified; health-check findings remediated; integrity-monitoring status confirmed.",
    "edgeTags": [
      "INTEL"
    ],
    "competitiveEdge": "Fortinet and Palo Alto have suffered high-profile zero-day exploitation in firewall code (FortiOS, PAN-OS); Sophos's Secure by Design programme – automatic hotfixes, config health-check and remote integrity monitoring – materially reduces this risk."
  },
  {
    "id": "FW-10",
    "product": "Firewall",
    "requirement": "Reporting & MDR/XDR integration",
    "businessProblem": "Firewalls produce massive logs but most go unanalysed; customers need clear reporting plus their firewall telemetry feeding the SOC.",
    "successCriteria": "On-box and cloud reporting via Sophos Central; multi-firewall reporting with save/schedule/export; native ingestion of firewall telemetry into Sophos MDR and Taegis XDR/NG SIEM.",
    "measurement": "X dashboards produced; firewall events visible in Taegis cases; audit-ready compliance report generated.",
    "edgeTags": [
      "PLATFORM",
      "INTEL"
    ],
    "competitiveEdge": "Firewall logs feed Sophos MDR and Taegis XDR/NG SIEM natively – on Fortinet or Palo Alto the same integration typically requires extra SIEM licensing and bespoke parsers."
  },
  {
    "id": "FW-11",
    "product": "Firewall",
    "requirement": "Total Cost of Ownership",
    "businessProblem": "Enterprise firewall renewals have ballooned, with Palo Alto and Fortinet often the largest line item in the network budget.",
    "successCriteria": "Xstream Protection bundle includes Base / Network / Web / Zero-Day Protection; unlimited remote-access and site-to-site VPN; SD-WAN; programmable architecture improves performance over time without hardware swap.",
    "measurement": "Three-year TCO comparison vs incumbent (appliance + subscriptions + management + support); price-per-protected-Mbps; module-count comparison.",
    "edgeTags": [
      "PRICING"
    ],
    "competitiveEdge": "Sophos consistently delivers the best price-per-protected-Mbps in the XGS series. Palo Alto is one of the most expensive next-gen firewalls on the market; Fortinet creates SKU complexity by separating capabilities into multiple FortiGuard subscriptions."
  }
];

const OUTCOMES_DATA = [
  {
    "id": "ransomware",
    "icon": "shield",
    "color": "red",
    "title": "Stop ransomware & active intrusions",
    "description": "Prove Sophos detects, contains and rolls back a live attack without human delay",
    "criteriaIds": [
      "EP-02",
      "EP-04",
      "EP-05",
      "MDR-05",
      "FW-03",
      "FW-04",
      "FW-05"
    ]
  },
  {
    "id": "soc-fatigue",
    "icon": "sparkles",
    "color": "purple",
    "title": "Reduce SOC alert fatigue",
    "description": "Fewer, higher-fidelity alerts with AI-accelerated triage and auto-resolution in 89 seconds",
    "criteriaIds": [
      "XDR-03",
      "XDR-04",
      "XDR-06",
      "MDR-03",
      "SIEM-03",
      "SIEM-06"
    ]
  },
  {
    "id": "24x7",
    "icon": "clock",
    "color": "blue",
    "title": "Prove 24×7 coverage without extra headcount",
    "description": "MDR hunts, detects and responds around the clock — unlimited IR included, no capped hours",
    "criteriaIds": [
      "MDR-01",
      "MDR-02",
      "MDR-03",
      "MDR-05",
      "MDR-07",
      "MDR-09"
    ]
  },
  {
    "id": "identity",
    "icon": "users",
    "color": "orange",
    "title": "Tame identity-attack risk",
    "description": "Enumerate Entra ID / AD posture risks and demonstrate in-console remediation",
    "criteriaIds": [
      "ITDR-01",
      "ITDR-02",
      "ITDR-03",
      "ITDR-04",
      "ITDR-06"
    ]
  },
  {
    "id": "siem",
    "icon": "database",
    "color": "teal",
    "title": "Replace ageing SIEM before renewal",
    "description": "Prove lower TCO, AI search and up to 5-year retention vs Splunk / QRadar",
    "criteriaIds": [
      "SIEM-01",
      "SIEM-02",
      "SIEM-04",
      "SIEM-06",
      "SIEM-07"
    ]
  },
  {
    "id": "remote",
    "icon": "globe",
    "color": "green",
    "title": "Secure the remote & hybrid workforce",
    "description": "Browser protection, DNS, ZTNA and DLP in one per-user bundle — no VPN required",
    "criteriaIds": [
      "WSP-01",
      "WSP-02",
      "WSP-03",
      "WSP-04",
      "EP-01"
    ]
  },
  {
    "id": "firewall",
    "icon": "flame",
    "color": "amber",
    "title": "Prove firewall ROI vs incumbent",
    "description": "Xstream TLS performance, Synchronized Security and 3-year TCO vs FortiGate / PAN-OS",
    "criteriaIds": [
      "FW-01",
      "FW-02",
      "FW-04",
      "FW-09",
      "FW-11"
    ]
  },
  {
    "id": "compliance",
    "icon": "file-text",
    "color": "indigo",
    "title": "Deliver compliance-ready reporting",
    "description": "Audit-trail logs, configurable retention and dashboards for NIS2 / ISO 27001 / PCI",
    "criteriaIds": [
      "SIEM-02",
      "SIEM-04",
      "EMAIL-05",
      "FW-10",
      "SIEM-08"
    ]
  },
  {
    "id": "network",
    "icon": "network",
    "color": "cyan",
    "title": "Close the network blind spot",
    "description": "NDR discovers unmanaged, IoT and OT devices that endpoint agents cannot see",
    "criteriaIds": [
      "NDR-01",
      "NDR-02",
      "NDR-03",
      "NDR-04",
      "NDR-06"
    ]
  },
  {
    "id": "email",
    "icon": "mail",
    "color": "pink",
    "title": "Stop BEC & advanced email threats",
    "description": "AI-powered catch rate for impersonation, malicious URLs and targeted attachments",
    "criteriaIds": [
      "EMAIL-01",
      "EMAIL-02",
      "EMAIL-03",
      "EMAIL-06",
      "EMAIL-07"
    ]
  }
];

const COMMON_DRIVERS: string[] = ["Reduce risk of ransomware and active threats", "Improve detection and response capability", "24×7 security coverage without additional headcount", "Consolidate security tools and reduce vendor sprawl", "Replace or upgrade ageing SIEM or endpoint solution", "Meet compliance requirements (NIS2, ISO 27001, PCI-DSS)", "Gain visibility across hybrid and remote workforce", "Reduce mean time to detect and respond (MTTD/MTTR)", "Protect against identity-based attacks and credential theft", "Improve network security posture and encrypted traffic visibility", "Enable secure remote working and replace legacy VPN", "Evaluate MDR to supplement or replace internal SOC", "Address a recent security incident or near-miss", "Executive or board-level security mandate", "Cost reduction vs current security investment"];

const COMMON_RISKS: string[] = ["Deployment environment not ready", "Agent/connector compatibility issues", "Firewall or proxy blocking test traffic", "IT change freeze in place", "Key stakeholder unavailable during evaluation", "Executive sponsor disengaged", "Competing project taking bandwidth", "Insufficient test data / lab environment", "No agreed success metrics", "Budget approval pending", "Integration with third-party tools required", "Security policy restricting test scenarios"];

const PRODUCTS: string[] = ["Endpoint", "MDR", "XDR", "NG SIEM", "Firewall", "ITDR", "Workspace Protection", "Email Security", "NDR"];

const INDUSTRIES: string[] = ["Financial Services", "Healthcare / Life Sciences", "Government / Public Sector", "Retail / Consumer", "Manufacturing", "Technology / Software", "Energy & Utilities", "Professional Services", "Education", "Telecommunications", "Legal", "Insurance", "Media & Entertainment", "Construction / Real Estate", "Other"];

const DEFAULT_ACTIONS = [
  { task: "Kickoff call & scope confirmation", priority: "High" },
  { task: "Deploy agents / connect telemetry sources", priority: "High" },
  { task: "Configure and run success criteria tests", priority: "High" },
  { task: "Week 1 check-in with customer", priority: "Medium" },
  { task: "Mid-evaluation executive update", priority: "Medium" },
  { task: "Validate all success criteria", priority: "High" },
  { task: "Prepare executive summary", priority: "High" },
  { task: "Final executive presentation & close", priority: "High" },
];

// ── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding library data...");

  // Pillars
  for (const p of PILLARS_DATA) {
    await db.pillar.upsert({
      where: { tag: p.tag },
      update: { name: p.name, what: p.what, vsCompetitors: p.vsCompetitors },
      create: { tag: p.tag, name: p.name, what: p.what, vsCompetitors: p.vsCompetitors },
    });
  }
  console.log(`  Pillars: ${PILLARS_DATA.length}`);

  // Criteria
  for (let i = 0; i < CRITERIA_DATA.length; i++) {
    const c = CRITERIA_DATA[i];
    await db.criterion.upsert({
      where: { id: c.id },
      update: {
        product: c.product,
        requirement: c.requirement,
        businessProblem: c.businessProblem,
        successCriteria: c.successCriteria,
        measurement: c.measurement,
        competitiveEdge: c.competitiveEdge,
        edgeTags: c.edgeTags || [],
        sortOrder: i,
      },
      create: {
        id: c.id,
        product: c.product,
        requirement: c.requirement,
        businessProblem: c.businessProblem,
        successCriteria: c.successCriteria,
        measurement: c.measurement,
        competitiveEdge: c.competitiveEdge,
        edgeTags: c.edgeTags || [],
        sortOrder: i,
      },
    });
  }
  console.log(`  Criteria: ${CRITERIA_DATA.length}`);

  // Outcomes
  for (let i = 0; i < OUTCOMES_DATA.length; i++) {
    const o = OUTCOMES_DATA[i];
    await db.outcome.upsert({
      where: { id: o.id },
      update: {
        icon: o.icon,
        color: o.color,
        title: o.title,
        description: o.description,
        criteriaIds: o.criteriaIds || [],
        sortOrder: i,
      },
      create: {
        id: o.id,
        icon: o.icon,
        color: o.color,
        title: o.title,
        description: o.description,
        criteriaIds: o.criteriaIds || [],
        sortOrder: i,
      },
    });
  }
  console.log(`  Outcomes: ${OUTCOMES_DATA.length}`);

  // Library items — drivers, risks, products, industries, actions
  const seedings = [
    { type: LibraryType.DRIVER,   items: COMMON_DRIVERS.map((t, i) => ({ text: t, sortOrder: i })) },
    { type: LibraryType.RISK,     items: COMMON_RISKS.map((t, i) => ({ text: t, sortOrder: i })) },
    { type: LibraryType.PRODUCT,  items: PRODUCTS.map((t, i) => ({ text: t, sortOrder: i })) },
    { type: LibraryType.INDUSTRY, items: INDUSTRIES.map((t, i) => ({ text: t, sortOrder: i })) },
    { type: LibraryType.ACTION,   items: DEFAULT_ACTIONS.map((a, i) => ({ text: a.task, sortOrder: i, meta: { priority: a.priority } })) },
  ];

  for (const { type, items } of seedings) {
    // Delete existing items of this type and recreate (idempotent via type+text)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const existing = await db.libraryItem.findFirst({
        where: { type, text: item.text },
      });
      if (!existing) {
        await db.libraryItem.create({
          data: { type, text: item.text, sortOrder: item.sortOrder, meta: (item as { meta?: object }).meta ?? undefined },
        });
      } else {
        await db.libraryItem.update({
          where: { id: existing.id },
          data: { sortOrder: item.sortOrder },
        });
      }
    }
    console.log(`  ${type}: ${items.length} items`);
  }

  // ── Bootstrap admin user ───────────────────────────────────────────────────
  const adminEmail    = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const { hash } = await import("bcryptjs");
    const hashed = await hash(adminPassword, 12);
    await db.user.upsert({
      where:  { email: adminEmail },
      update: { role: "ADMIN", password: hashed },
      create: {
        email:    adminEmail,
        name:     process.env.SEED_ADMIN_NAME ?? "Admin",
        password: hashed,
        role:     "ADMIN",
      },
    });
    console.log(`  Admin user: ${adminEmail}`);
  } else {
    console.log("  Skipping admin bootstrap (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set)");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
