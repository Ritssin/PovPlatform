// Generates a self-contained offline PoV Toolkit HTML file from live library data.

interface Criterion {
  id: string; product: string; requirement: string; businessProblem: string;
  successCriteria: string; measurement: string; competitiveEdge: string; edgeTags: string[];
}
interface Outcome   { id: string; icon: string; color: string; title: string; description: string; criteriaIds: string[]; }
interface Pillar    { tag: string; name: string; what: string; vsCompetitors: string; }
interface LibItem   { id: string; text: string; meta?: unknown; }

interface LibraryData {
  criteria:   Criterion[];
  outcomes:   Outcome[];
  pillars:    Pillar[];
  drivers:    LibItem[];
  risks:      LibItem[];
  actions:    LibItem[];
  products:   LibItem[];
  industries: LibItem[];
  exportDate: string;
}

export function generatePartnerHtml(lib: LibraryData): string {
  const data = JSON.stringify({
    CRITERIA:       lib.criteria,
    OUTCOMES:       lib.outcomes,
    PILLARS:        lib.pillars,
    COMMON_DRIVERS: lib.drivers.map(d => ({ id: d.id, text: d.text })),
    COMMON_RISKS:   lib.risks.map(r => ({ id: r.id, text: r.text })),
    DEFAULT_ACTIONS: lib.actions.map(a => ({ id: a.id, text: a.text, ...((a.meta ?? {}) as object) })),
    ALL_PRODUCTS:   lib.products.map(p => p.text),
    INDUSTRIES:     lib.industries.map(i => i.text),
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sophos Proof of Value Toolkit</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f1f5f9;color:#1e293b;font-size:14px}
.app{max-width:1100px;margin:0 auto;padding:20px}
header{background:#0b1f3a;color:#fff;padding:16px 24px;border-radius:12px;margin-bottom:24px;display:flex;align-items:center;gap:12px}
header h1{font-size:18px;font-weight:700}header p{font-size:12px;color:#94a3b8;margin-top:2px}
.steps{display:flex;gap:0;margin-bottom:24px;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0}
.step-btn{flex:1;padding:12px;text-align:center;background:#fff;border:none;cursor:pointer;font-size:13px;font-weight:600;color:#64748b;border-right:1px solid #e2e8f0;transition:all .2s}
.step-btn:last-child{border-right:none}
.step-btn.active{background:#0049bd;color:#fff}
.step-btn.done{background:#f0fdf4;color:#16a34a}
.card{background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:20px;margin-bottom:16px}
.card h2{font-size:15px;font-weight:700;margin-bottom:16px;color:#0f172a}
.card h3{font-size:13px;font-weight:600;margin-bottom:10px;color:#374151}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.form-row.three{grid-template-columns:1fr 1fr 1fr}
label{display:block;font-size:11px;font-weight:600;color:#6b7280;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px}
input[type=text],input[type=date],select,textarea{width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:13px;color:#1e293b;background:#fff;outline:none;transition:border .2s}
input:focus,select:focus,textarea:focus{border-color:#0049bd;box-shadow:0 0 0 3px rgba(0,73,189,.1)}
textarea{resize:vertical;min-height:72px}
.slider-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.slider-row label{width:140px;flex-shrink:0;margin-bottom:0}
input[type=range]{flex:1}
.slider-val{width:28px;text-align:right;font-weight:700;color:#0049bd}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid #e2e8f0;background:#f8fafc;color:#475569;transition:all .15s}
.chip.active{background:#dbeafe;color:#1d4ed8;border-color:#93c5fd}
.chip .x{color:#94a3b8;font-size:10px}
.chip-add{background:none;border:1px dashed #cbd5e1;color:#94a3b8}
.chip-add:hover{border-color:#0049bd;color:#0049bd}
.outcome-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:16px}
.outcome-tile{border:2px solid #e2e8f0;border-radius:10px;padding:12px;cursor:pointer;text-align:center;transition:all .2s}
.outcome-tile.sel{border-color:#0049bd;background:#eff6ff}
.outcome-tile .ico{font-size:24px;margin-bottom:4px}
.outcome-tile .ttl{font-size:12px;font-weight:600;color:#1e293b}
.outcome-tile .cnt{font-size:10px;color:#94a3b8;margin-top:2px}
.criteria-filters{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.criteria-filters input,.criteria-filters select{padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;flex:none}
.criteria-filters input{width:200px}
.crit-table{width:100%;border-collapse:collapse}
.crit-table th{text-align:left;padding:8px 10px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #e2e8f0;background:#f8fafc}
.crit-table td{padding:8px 10px;border-bottom:1px solid #f1f5f9;vertical-align:top}
.crit-table tr:hover td{background:#f8fafc}
.badge{display:inline-block;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600}
.badge-blue{background:#dbeafe;color:#1d4ed8}
.badge-slate{background:#f1f5f9;color:#475569}
.toggle-btn{padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #e2e8f0;background:#fff;color:#475569;transition:all .15s}
.toggle-btn.added{background:#dcfce7;color:#16a34a;border-color:#86efac}
.toggle-btn:hover{background:#f1f5f9}
.exec-table{width:100%;border-collapse:collapse}
.exec-table th{text-align:left;padding:8px 10px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #e2e8f0;background:#f8fafc}
.exec-table td{padding:8px 10px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
.status-select{padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;border:1px solid #e2e8f0;cursor:pointer}
.status-Not.Started{background:#f1f5f9;color:#475569}
.status-In.Progress{background:#fef3c7;color:#92400e}
.status-Validated{background:#dcfce7;color:#166534}
.status-Failed{background:#fee2e2;color:#991b1b}
.progress-bar{height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;margin-bottom:4px}
.progress-fill{height:100%;background:#0049bd;border-radius:3px;transition:width .3s}
.action-row{display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #f1f5f9}
.action-row input{flex:1;padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px}
.action-row select{padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px}
.action-row .del{color:#dc2626;cursor:pointer;font-size:16px;padding:2px 6px;border:none;background:none}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .2s}
.btn-primary{background:#0049bd;color:#fff}.btn-primary:hover{background:#003da0}
.btn-secondary{background:#f1f5f9;color:#475569;border:1px solid #e2e8f0}.btn-secondary:hover{background:#e2e8f0}
.btn-success{background:#16a34a;color:#fff}.btn-success:hover{background:#15803d}
.toolbar{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.note-entry{border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:10px}
.note-entry .meta{font-size:11px;color:#94a3b8;margin-bottom:4px}
.note-entry .title{font-size:13px;font-weight:600;margin-bottom:4px}
.note-entry .body{font-size:13px;color:#374151}
.score-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
.score-box{text-align:center;padding:12px;border:1px solid #e2e8f0;border-radius:8px}
.score-box .val{font-size:24px;font-weight:800;color:#0049bd}
.score-box .lbl{font-size:11px;color:#6b7280;margin-top:2px}
.hidden{display:none}
@media(max-width:600px){.form-row,.form-row.three{grid-template-columns:1fr}.outcome-grid{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<div class="app">
<header>
  <div>
    <h1>Sophos Proof of Value Toolkit</h1>
    <p>Partner Edition &nbsp;·&nbsp; Library export: ${lib.exportDate}</p>
  </div>
</header>

<div class="steps">
  <button class="step-btn active" onclick="goStep(1)" id="s1">1 · Business Context</button>
  <button class="step-btn" onclick="goStep(2)" id="s2">2 · Success Criteria</button>
  <button class="step-btn" onclick="goStep(3)" id="s3">3 · Execute &amp; Track</button>
</div>

<!-- ── STEP 1 ── -->
<div id="step1">
<div class="card">
  <h2>Engagement Details</h2>
  <div class="form-row">
    <div><label>Customer Name *</label><input type="text" id="customerName" oninput="save()"></div>
    <div><label>Industry</label>
      <select id="industry" onchange="save()">
        <option value="">Select…</option>
      </select>
    </div>
  </div>
  <div class="form-row three">
    <div><label>Partner Name</label><input type="text" id="partnerName" oninput="save()"></div>
    <div><label>Sophos SE</label><input type="text" id="salesEngineer" oninput="save()"></div>
    <div><label>Executive Sponsor</label><input type="text" id="execSponsor" oninput="save()"></div>
  </div>
  <div class="form-row three">
    <div><label>Opportunity Value</label><input type="text" id="oppValue" oninput="save()"></div>
    <div><label>PoV Start Date</label><input type="date" id="startDate" onchange="save()"></div>
    <div><label>PoV End Date</label><input type="date" id="endDate" onchange="save()"></div>
  </div>
</div>

<div class="card">
  <h2>Readiness Assessment</h2>
  <div id="sliders"></div>
  <div id="scoreBoxes" class="score-summary"></div>
</div>

<div class="card">
  <h2>Business Drivers</h2>
  <div id="driverChips" class="chips"></div>
  <div style="margin-top:8px"><label>Additional context</label><textarea id="bizDriverText" oninput="save()" placeholder="Describe the key business drivers…"></textarea></div>
</div>

<div class="card">
  <h2>Assumptions &amp; Dependencies</h2>
  <div id="riskChips" class="chips"></div>
</div>

<div class="toolbar">
  <button class="btn btn-primary" onclick="goStep(2)">Next: Success Criteria →</button>
  <button class="btn btn-secondary" onclick="exportJSON()">Export JSON</button>
</div>
</div>

<!-- ── STEP 2 ── -->
<div id="step2" class="hidden">
<div class="card">
  <h2>Select Evaluation Outcomes</h2>
  <div id="outcomeTiles" class="outcome-grid"></div>
</div>
<div class="card">
  <h2>Criteria Library</h2>
  <div class="criteria-filters">
    <input type="text" id="critSearch" placeholder="Search criteria…" oninput="renderCriteria()">
    <select id="critProduct" onchange="renderCriteria()">
      <option value="">All products</option>
    </select>
    <select id="critShow" onchange="renderCriteria()">
      <option value="suggested">Suggested for selected outcomes</option>
      <option value="all">All criteria</option>
      <option value="added">Added only</option>
    </select>
  </div>
  <div style="overflow-x:auto"><table class="crit-table">
    <thead><tr>
      <th style="width:70px">ID</th><th style="width:90px">Product</th>
      <th>Requirement</th><th style="width:90px"></th>
    </tr></thead>
    <tbody id="critBody"></tbody>
  </table></div>
</div>
<div class="toolbar">
  <button class="btn btn-secondary" onclick="goStep(1)">← Back</button>
  <button class="btn btn-primary" onclick="goStep(3)">Next: Execute →</button>
  <button class="btn btn-secondary" onclick="exportJSON()">Export JSON</button>
</div>
</div>

<!-- ── STEP 3 ── -->
<div id="step3" class="hidden">
<div class="card">
  <h2>Criteria Tracking</h2>
  <div id="progressSummary" style="margin-bottom:12px"></div>
  <div style="overflow-x:auto"><table class="exec-table">
    <thead><tr>
      <th style="width:70px">ID</th><th style="width:90px">Product</th>
      <th>Requirement</th><th style="width:130px">Status</th>
      <th>Findings / Notes</th>
    </tr></thead>
    <tbody id="execBody"></tbody>
  </table></div>
</div>

<div class="card">
  <h2>Action Items</h2>
  <div id="actionItems"></div>
  <div class="toolbar"><button class="btn btn-secondary" onclick="addAction()">+ Add Action</button></div>
</div>

<div class="card">
  <h2>Progress Notes</h2>
  <div id="noteForm" style="margin-bottom:12px">
    <div class="form-row"><div><label>Title</label><input type="text" id="noteTitle"></div></div>
    <div><label>Note</label><textarea id="noteText" placeholder="What happened today?"></textarea></div>
    <div class="toolbar"><button class="btn btn-secondary" onclick="addNote()">Add Note</button></div>
  </div>
  <div id="noteList"></div>
</div>

<div class="toolbar">
  <button class="btn btn-secondary" onclick="goStep(2)">← Back</button>
  <button class="btn btn-success" onclick="exportJSON()">Export JSON Deck</button>
</div>
</div>
</div>

<script>
const LIB = ${data};

const SLIDERS = [
  {key:'exec',   label:'Executive Sponsorship'},
  {key:'uc',     label:'Use Case Clarity'},
  {key:'urg',    label:'Urgency / Timeline'},
  {key:'comp',   label:'Competitive Situation'},
  {key:'read',   label:'Technical Readiness'},
  {key:'align',  label:'Budget Alignment'},
];

let state = {
  customerName:'', industry:'', partnerName:'', salesEngineer:'', execSponsor:'',
  oppValue:'', startDate:'', endDate:'',
  scores:{exec:3,uc:3,urg:3,comp:3,read:3,align:3},
  driverChips:[], riskChips:[], bizDriverText:'',
  selectedOutcomes:[], planCriteria:[],
  trackingData:{}, actionItems:[], updateLog:[],
};

// ── Init ──────────────────────────────────────────────────────────────────────
window.onload = function() {
  const saved = localStorage.getItem('sophos-pov-toolkit');
  if (saved) try { state = {...state, ...JSON.parse(saved)}; } catch(e) {}

  // Industries dropdown
  const indSel = document.getElementById('industry');
  LIB.INDUSTRIES.forEach(i => { const o=document.createElement('option'); o.value=o.textContent=i; indSel.appendChild(o); });

  // Products filter
  const prodSel = document.getElementById('critProduct');
  const prods = [...new Set(LIB.CRITERIA.map(c => c.product))].sort();
  prods.forEach(p => { const o=document.createElement('option'); o.value=p; o.textContent=p; prodSel.appendChild(o); });

  // Sliders
  const sc = document.getElementById('sliders');
  SLIDERS.forEach(s => {
    sc.innerHTML += '<div class="slider-row"><label>'+s.label+'</label>' +
      '<input type="range" min="1" max="5" value="'+(state.scores[s.key]||3)+'" ' +
      'oninput="updateSlider(this,\''+s.key+'\')" id="sl_'+s.key+'">' +
      '<span class="slider-val" id="sv_'+s.key+'">'+(state.scores[s.key]||3)+'</span></div>';
  });

  updateScoreBoxes();
  renderDriverChips();
  renderRiskChips();
  renderOutcomeTiles();
  renderCriteria();
  renderExec();
  renderActions();
  renderNotes();
  loadFormValues();
};

function loadFormValues() {
  ['customerName','industry','partnerName','salesEngineer','execSponsor','oppValue','startDate','endDate']
    .forEach(k => { const el=document.getElementById(k); if(el) el.value=state[k]||''; });
  const bt = document.getElementById('bizDriverText');
  if(bt) bt.value = state.bizDriverText||'';
}

function save() {
  ['customerName','industry','partnerName','salesEngineer','execSponsor','oppValue','startDate','endDate']
    .forEach(k => { const el=document.getElementById(k); if(el) state[k]=el.value; });
  const bt = document.getElementById('bizDriverText');
  if(bt) state.bizDriverText=bt.value;
  localStorage.setItem('sophos-pov-toolkit', JSON.stringify(state));
}

// ── Steps ─────────────────────────────────────────────────────────────────────
function goStep(n) {
  [1,2,3].forEach(i => {
    document.getElementById('step'+i).classList.toggle('hidden', i!==n);
    const btn = document.getElementById('s'+i);
    btn.classList.remove('active','done');
    if(i===n) btn.classList.add('active');
    else if(i<n) btn.classList.add('done');
  });
  if(n===3) renderExec();
}

// ── Sliders ───────────────────────────────────────────────────────────────────
function updateSlider(el, key) {
  state.scores[key] = parseInt(el.value);
  document.getElementById('sv_'+key).textContent = el.value;
  updateScoreBoxes();
  save();
}
function updateScoreBoxes() {
  const total = Object.values(state.scores).reduce((a,b)=>a+b,0);
  const max = SLIDERS.length * 5;
  const pct = Math.round(total/max*100);
  const rec = total>=24?'Strong Go':'total>=18?\'Conditional Go\':\'No-Go\'';
  const recTxt = total>=24?'Strong Go':total>=18?'Conditional Go':'Needs Review';
  document.getElementById('scoreBoxes').innerHTML =
    '<div class="score-box"><div class="val">'+total+'</div><div class="lbl">Score (max '+max+')</div></div>'+
    '<div class="score-box"><div class="val">'+pct+'%</div><div class="lbl">Readiness</div></div>'+
    '<div class="score-box"><div class="val" style="font-size:16px">'+recTxt+'</div><div class="lbl">Recommendation</div></div>';
}

// ── Chips ─────────────────────────────────────────────────────────────────────
function renderDriverChips() {
  const el = document.getElementById('driverChips');
  if(!el) return;
  el.innerHTML = '';
  LIB.COMMON_DRIVERS.forEach(d => {
    const active = state.driverChips.includes(d.id);
    const span = document.createElement('span');
    span.className = 'chip'+(active?' active':'');
    span.textContent = d.text;
    if(active) { const x=document.createElement('span'); x.className='x'; x.textContent='×'; span.appendChild(x); }
    span.onclick = () => { state.driverChips = active?state.driverChips.filter(i=>i!==d.id):[...state.driverChips,d.id]; save(); renderDriverChips(); };
    el.appendChild(span);
  });
}
function renderRiskChips() {
  const el = document.getElementById('riskChips');
  if(!el) return;
  el.innerHTML = '';
  LIB.COMMON_RISKS.forEach(r => {
    const active = state.riskChips.includes(r.id);
    const span = document.createElement('span');
    span.className = 'chip'+(active?' active':'');
    span.textContent = r.text;
    if(active) { const x=document.createElement('span'); x.className='x'; x.textContent='×'; span.appendChild(x); }
    span.onclick = () => { state.riskChips = active?state.riskChips.filter(i=>i!==r.id):[...state.riskChips,r.id]; save(); renderRiskChips(); };
    el.appendChild(span);
  });
}

// ── Outcome tiles ─────────────────────────────────────────────────────────────
function renderOutcomeTiles() {
  const el = document.getElementById('outcomeTiles');
  if(!el) return;
  el.innerHTML = '';
  LIB.OUTCOMES.forEach(o => {
    const sel = state.selectedOutcomes.includes(o.id);
    const div = document.createElement('div');
    div.className = 'outcome-tile'+(sel?' sel':'');
    div.innerHTML = '<div class="ico">'+o.icon+'</div><div class="ttl">'+o.title+'</div><div class="cnt">'+o.criteriaIds.length+' criteria</div>';
    div.onclick = () => {
      state.selectedOutcomes = sel ? state.selectedOutcomes.filter(i=>i!==o.id) : [...state.selectedOutcomes,o.id];
      save(); renderOutcomeTiles(); renderCriteria();
    };
    el.appendChild(div);
  });
}

// ── Criteria ──────────────────────────────────────────────────────────────────
function renderCriteria() {
  const search  = (document.getElementById('critSearch')||{}).value||'';
  const product = (document.getElementById('critProduct')||{}).value||'';
  const show    = (document.getElementById('critShow')||{}).value||'suggested';
  const q = search.toLowerCase();

  const suggestedIds = new Set(state.selectedOutcomes.flatMap(oid => {
    const o = LIB.OUTCOMES.find(x=>x.id===oid);
    return o ? o.criteriaIds : [];
  }));

  let list = LIB.CRITERIA.filter(c => {
    if(product && c.product !== product) return false;
    if(q && !c.requirement.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false;
    if(show==='suggested' && !suggestedIds.has(c.id) && !state.planCriteria.includes(c.id)) return false;
    if(show==='added' && !state.planCriteria.includes(c.id)) return false;
    return true;
  });

  const tbody = document.getElementById('critBody');
  if(!tbody) return;
  if(list.length===0) { tbody.innerHTML='<tr><td colspan="4" style="padding:20px;text-align:center;color:#94a3b8">No criteria match.</td></tr>'; return; }
  tbody.innerHTML = list.map(c => {
    const added = state.planCriteria.includes(c.id);
    const sugg  = suggestedIds.has(c.id);
    return '<tr>'+
      '<td><span class="badge badge-slate">'+c.id+'</span></td>'+
      '<td><span class="badge badge-blue">'+c.product+'</span></td>'+
      '<td>'+escHtml(c.requirement)+(sugg?'<br><span style="font-size:10px;color:#16a34a">✓ suggested</span>':'')+'</td>'+
      '<td><button class="toggle-btn'+(added?' added':'')+'" onclick="toggleCrit(\''+c.id+'\')">'+
      (added?'✓ Added':'+ Add')+'</button></td></tr>';
  }).join('');
}
function toggleCrit(id) {
  state.planCriteria = state.planCriteria.includes(id)
    ? state.planCriteria.filter(i=>i!==id)
    : [...state.planCriteria, id];
  if(!state.trackingData[id]) state.trackingData[id]={status:'Not Started',findings:'',owner:''};
  save(); renderCriteria(); renderExec();
}

// ── Execute ───────────────────────────────────────────────────────────────────
const STATUSES = ['Not Started','In Progress','Validated','Failed'];
function renderExec() {
  const tbody = document.getElementById('execBody');
  if(!tbody) return;
  const validated = state.planCriteria.filter(id => (state.trackingData[id]||{}).status==='Validated').length;
  const total     = state.planCriteria.length;
  const pct       = total ? Math.round(validated/total*100) : 0;
  const ps = document.getElementById('progressSummary');
  if(ps) ps.innerHTML = '<div class="progress-bar" style="margin-bottom:6px"><div class="progress-fill" style="width:'+pct+'%"></div></div>'+
    '<div style="font-size:12px;color:#6b7280">'+validated+' / '+total+' criteria validated &nbsp;('+pct+'%)</div>';

  if(!state.planCriteria.length) {
    tbody.innerHTML='<tr><td colspan="5" style="padding:20px;text-align:center;color:#94a3b8">No criteria added. Go to Step 2 to add criteria.</td></tr>';
    return;
  }
  tbody.innerHTML = state.planCriteria.map(id => {
    const c  = LIB.CRITERIA.find(x=>x.id===id) || {id,product:'',requirement:id};
    const td = state.trackingData[id] || {status:'Not Started',findings:'',owner:''};
    const statusOpts = STATUSES.map(s=>'<option value="'+s+'"'+(td.status===s?' selected':'')+'>'+s+'</option>').join('');
    return '<tr>'+
      '<td><span class="badge badge-slate">'+id+'</span></td>'+
      '<td><span class="badge badge-blue">'+c.product+'</span></td>'+
      '<td style="font-size:12px">'+escHtml(c.requirement)+'</td>'+
      '<td><select class="status-select" onchange="updateStatus(\''+id+'\',this.value)">'+statusOpts+'</select></td>'+
      '<td><input type="text" style="padding:4px 6px;font-size:12px" value="'+escAttr(td.findings||'')+'" '+
        'oninput="updateFindings(\''+id+'\',this.value)" placeholder="Notes…"></td></tr>';
  }).join('');
}
function updateStatus(id, status) {
  if(!state.trackingData[id]) state.trackingData[id]={};
  state.trackingData[id].status = status;
  save(); renderExec();
}
function updateFindings(id, text) {
  if(!state.trackingData[id]) state.trackingData[id]={};
  state.trackingData[id].findings = text;
  save();
}

// ── Actions ───────────────────────────────────────────────────────────────────
function renderActions() {
  const el = document.getElementById('actionItems');
  if(!el) return;
  el.innerHTML = state.actionItems.map((a,i) =>
    '<div class="action-row">'+
    '<input type="text" placeholder="Task" value="'+escAttr(a.task||'')+'" oninput="updateAction('+i+',\'task\',this.value)">'+
    '<input type="text" placeholder="Owner" value="'+escAttr(a.owner||'')+'" style="max-width:120px" oninput="updateAction('+i+',\'owner\',this.value)">'+
    '<input type="date" value="'+(a.dueDate||'')+'" style="max-width:130px" onchange="updateAction('+i+',\'dueDate\',this.value)">'+
    '<select onchange="updateAction('+i+',\'priority\',this.value)" style="max-width:80px">'+
      ['High','Medium','Low'].map(p=>'<option'+(a.priority===p?' selected':'')+'>'+p+'</option>').join('')+
    '</select>'+
    '<select onchange="updateAction('+i+',\'status\',this.value)" style="max-width:100px">'+
      ['Open','In Progress','Done'].map(s=>'<option'+(a.status===s?' selected':'')+'>'+s+'</option>').join('')+
    '</select>'+
    '<button class="del" onclick="removeAction('+i+')">×</button></div>'
  ).join('');
  if(!state.actionItems.length) el.innerHTML='<p style="color:#94a3b8;font-size:12px">No action items yet.</p>';
}
function addAction() {
  state.actionItems.push({id:'ai-'+Date.now(),task:'',owner:'',dueDate:'',priority:'Medium',status:'Open'});
  save(); renderActions();
}
function updateAction(i, key, val) { state.actionItems[i][key]=val; save(); }
function removeAction(i) { state.actionItems.splice(i,1); save(); renderActions(); }

// ── Notes ─────────────────────────────────────────────────────────────────────
function renderNotes() {
  const el = document.getElementById('noteList');
  if(!el) return;
  if(!state.updateLog.length) { el.innerHTML='<p style="color:#94a3b8;font-size:12px">No notes yet.</p>'; return; }
  el.innerHTML = [...state.updateLog].reverse().map(n =>
    '<div class="note-entry">'+
    '<div class="meta">'+new Date(n.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})+'</div>'+
    '<div class="title">'+escHtml(n.title)+'</div>'+
    '<div class="body">'+escHtml(n.text)+'</div></div>'
  ).join('');
}
function addNote() {
  const t = document.getElementById('noteTitle').value.trim();
  const b = document.getElementById('noteText').value.trim();
  if(!t && !b) return;
  state.updateLog.push({id:'n-'+Date.now(),date:new Date().toISOString(),title:t,text:b});
  document.getElementById('noteTitle').value='';
  document.getElementById('noteText').value='';
  save(); renderNotes();
}

// ── Export JSON ───────────────────────────────────────────────────────────────
function exportJSON() {
  const json = JSON.stringify({
    exportedAt: new Date().toISOString(),
    libraryDate: '${lib.exportDate}',
    engagement: {
      customerName: state.customerName, industry: state.industry,
      partnerName: state.partnerName, salesEngineer: state.salesEngineer,
      executiveSponsor: state.execSponsor, opportunityValue: state.oppValue,
      startDate: state.startDate, endDate: state.endDate,
    },
    scores: state.scores,
    readinessScore: Object.values(state.scores).reduce((a,b)=>a+b,0),
    driverItems: state.driverChips.map(id => LIB.COMMON_DRIVERS.find(d=>d.id===id)).filter(Boolean),
    riskItems:   state.riskChips.map(id  => LIB.COMMON_RISKS.find(r=>r.id===id)).filter(Boolean),
    selectedOutcomes: state.selectedOutcomes,
    planCriteria: state.planCriteria,
    trackingData: state.trackingData,
    actionItems: state.actionItems,
    updateLog: state.updateLog,
    percentValidated: state.planCriteria.length
      ? Math.round(state.planCriteria.filter(id=>(state.trackingData[id]||{}).status==='Validated').length/state.planCriteria.length*100)
      : 0,
  }, null, 2);
  const blob = new Blob([json], {type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = (state.customerName||'pov').replace(/[^a-z0-9]/gi,'-').toLowerCase()+'-pov-deck.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s) { return (s||'').replace(/"/g,'&quot;'); }
</script>
</body>
</html>`;
}
