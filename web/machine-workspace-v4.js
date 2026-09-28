const S='fleetzi-realtime-sim-v2',A='fleetzi-realtime-actions-v2',$=s=>document.querySelector(s),e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])),f=n=>Number.isFinite(Number(n))?Number(n).toFixed(1):'—';
const qp=new URLSearchParams(location.search),id=qp.get('id'),view=qp.get('view')||'overview';let st=read(),map;
function read(){try{return JSON.parse(localStorage.getItem(S))||null}catch{return null}}function save(){localStorage.setItem(S,JSON.stringify(st))}function logs(){try{return JSON.parse(localStorage.getItem(A))||[]}catch{return[]}}function log(action,m,subject){const x=logs();x.unshift({time:new Date().toLocaleString('en-ZA'),action,machine:{id:m.id,asset:m.asset},subject,actor:'Fleet manager'});localStorage.setItem(A,JSON.stringify(x.slice(0,120)))}

function showModal({title,body,grid,confirmText,cancelText,confirmClass}){
  return new Promise(resolve=>{
    const ov=document.createElement('div');ov.className='bb-modal-overlay';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
    const dlg=document.createElement('div');dlg.className='bb-modal';
    const gridHtml=grid?`<div class="bb-modal-grid">${grid.map(([k,v])=>`<div><span>${e(k)}</span><b>${e(v)}</b></div>`).join('')}</div>`:'';
    dlg.innerHTML=`<h3>${e(title)}</h3>${body?`<p>${e(body)}</p>`:''}${gridHtml}<div class="bb-modal-actions"><button class="bb-button" data-cancel type="button">${e(cancelText||'Cancel')}</button><button class="bb-button ${confirmClass||'primary'}" data-confirm type="button">${e(confirmText||'Confirm')}</button></div>`;
    ov.append(dlg);document.body.append(ov);
    const focusEl=dlg.querySelector('[data-confirm]');focusEl.focus();
    const close=(val)=>{ov.remove();resolve(val);};
    dlg.querySelector('[data-cancel]').onclick=()=>close(false);
    dlg.querySelector('[data-confirm]').onclick=()=>close(true);
    ov.addEventListener('click',ev=>{if(ev.target===ov)close(false);});
    ov.addEventListener('keydown',ev=>{if(ev.key==='Escape')close(false);});
    // trap focus simplified
  });
}
let undoTimer=null;let undoState=null;
function showUndo(message,undoFn){
  clearTimeout(undoTimer);
  document.querySelector('.bb-toast')?.remove();
  const toast=document.createElement('div');toast.className='bb-toast';
  toast.innerHTML=`<span>${e(message)}</span><button type="button">Undo</button>`;
  document.body.append(toast);
  toast.querySelector('button').onclick=()=>{clearTimeout(undoTimer);toast.remove();undoFn();render();};
  undoTimer=setTimeout(()=>toast.remove(),10000);
}

function m(){return st?.machines?.find(x=>x.id===id)||st?.machines?.[0]}function label(s){return s==='dark'?'Offline':String(s||'unknown').replace(/^./,c=>c.toUpperCase())}function href(x,v){return`./machine.html?id=${encodeURIComponent(x.id)}&view=${v}`}function day(x){return x.history?.at(-1)||{}}function fuel(x){return x.sensor?.at(-1)?.fuel??x.fuel??0}function util(x){return Math.max(0,Math.min(100,Math.round((+day(x).working||0)/8*100)))}function alertsOpen(x){return(x.alerts||[]).filter(a=>!a.ack&&!a.resolved)}function remain(x){return +x.nextService-+x.meter}
function table(items,cols){return`<div class="ops-table-wrap"><table class="ops-table"><thead><tr>${cols.map(c=>`<th>${e(c[0])}</th>`).join('')}</tr></thead><tbody>${items.map(r=>`<tr>${cols.map(c=>`<td>${e(typeof c[1]==='function'?c[1](r):r[c[1]])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}function grid(items){return`<div class="mw-state-grid">${items.map(([k,v])=>`<div><span>${e(k)}</span><b>${e(v)}</b></div>`).join('')}</div>`}
function header(x){const r=remain(x);return`<section class="mw-header"><div><div class="mw-breadcrumb"><a href="./fleet.html">Fleet</a><span>/</span>${e(x.asset)}</div><div class="mw-title-row"><span class="ops-status"><i class="ops-dot ${e(x.status)}"></i>${e(label(x.status))}</span><h2>${e(x.asset)} · ${e(x.model)}</h2></div><p>${e(x.type)} · ${e(x.site)} · ${e(x.customer)}</p></div><div class="mw-summary">${[['Engine',x.status==='off'?'Off':x.status==='Offline'?'Offline':'Running'],['Meter',`${f(x.meter)} h`],['Fuel',`${Math.round(fuel(x))}%`],['Utilisation',`${util(x)}% \u00b7 working/8h`],['Alerts',alertsOpen(x).length],['Service',r<=0?`${Math.abs(Math.round(r))} h overdue`:`${Math.round(r)} h`]].map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('')}</div></section>`}function tabs(x){return`<nav class="mw-tabs" aria-label="Machine record">${[['overview','Overview'],['live','Live'],['history','History'],['fuel','Fuel'],['maintenance','Maintenance'],['hire','Hire'],['alerts','Alerts'],['timeline','Timeline']].map(([v,t])=>`<a href="${href(x,v)}" ${view===v?'aria-current="page"':''}>${t}${v==='alerts'&&alertsOpen(x).length?` <b>${alertsOpen(x).length}</b>`:''}</a>`).join('')}</nav>`}
function overview(x){const d=day(x),h=x.hire?.[0]||{},r=remain(x);return`<div class="mw-grid"><article class="ops-card mw-primary"><div class="ops-card-head"><div><h3>What is happening now</h3><p>Current operating state for this machine.</p></div><a class="ops-link primary" href="${href(x,'live')}">Open live</a></div>${grid([['Status',label(x.status)],['Signal',x.signal],['Site',x.site],['Customer',x.customer],['Working today',`${f(d.working)} h \u00b7 working/8h`],['Idle today',`${f(d.idle)} h`],['Engine load',x.engineLoad==null?'Not available \u2014 machine does not expose CAN J1939':`${x.engineLoad}%`],['Coolant',x.coolant==null?'Not available \u2014 sensor not fitted':`${x.coolant} \u00b0C`]])}</article><aside class="ops-card"><div class="ops-card-head"><h3>Needs attention</h3></div><div class="mw-attention">${alertsOpen(x).map(a=>`<a href="${href(x,'alerts')}"><b>${e(a.text)}</b><small>${e(a.time)} · ${e(a.severity)}</small></a>`).join('')||'<p>No open alerts.</p>'}${r<=50?`<a href="${href(x,'maintenance')}"><b>${r<=0?'Service overdue':'Service due soon'}</b><small>${r<=0?`${Math.abs(Math.round(r))} h overdue`:`${Math.round(r)} h remaining`}</small></a>`:''}</div></aside><article class="ops-card"><div class="ops-card-head"><h3>Hire context</h3><a class="ops-link" href="${href(x,'hire')}">Review</a></div>${grid([['Rate',`R${Number(x.rate||0).toLocaleString('en-ZA')}/h`],['Measured',`${f(h.measured)} h`],['Proposed',`${f(h.proposed??Math.max(h.minimum||0,h.measured||0))} h`],['Status',h.status||'Needs review']])}</article></div>`}
function live(x){return`<article class="ops-card"><div class="ops-card-head"><div><h3>Live machine</h3><p>Current or last-known state for ${e(x.asset)}.</p></div><a class="ops-link" href="${href(x,'history')}">Movement history</a></div><div class="mw-live-grid"><div id="mw-map" class="ops-map maplibre-fleet-map"></div><aside class="mw-telemetry">${grid([['Engine',x.status==='off'?'Off':x.status==='dark'?'Unknown':'Running'],['State',label(x.status)],['Speed',`${Math.round(x.speed||0)} km/h`],['Hour meter',`${f(x.meter)} h`],['Fuel',`${Math.round(fuel(x))}%`],['Engine load',x.engineLoad==null?'Not available':`${x.engineLoad}%`],['Coolant',x.coolant==null?'Not available':`${x.coolant} °C`],['Position',`${Number(x.lat).toFixed(5)}, ${Number(x.lng).toFixed(5)}`]])}</aside></div></article>`}
function history(x){return`<article class="ops-card"><div class="ops-card-head"><div><h3>Movement & operating history</h3><p>Route and operating events for ${e(x.asset)}.</p></div></div><div class="ops-range"><button data-range="30m" type="button">30 min</button><button data-range="2h" type="button">2 hours</button><button data-range="all" class="active" type="button">All</button></div><p id="mw-route-summary" class="mw-muted"></p><div id="mw-map" class="ops-map maplibre-fleet-map"></div><div class="mw-split"><section><h3>Events</h3>${table((x.events||[]).slice(0,40),[['Time','time'],['Type','type'],['Event','text']])}</section><section><h3>Run vs idle</h3>${table(x.history||[],[['Date','date'],['Run',r=>`${f(r.run)} h`],['Working',r=>`${f(r.working)} h`],['Idle',r=>`${f(r.idle)} h`],['Meter',r=>`${f(r.meter)} h`]])}</section></div></article>`}
function fuelView(x){return`<article class="ops-card"><div class="ops-card-head"><div><h3>Fuel</h3><p>Fuel history for this machine.</p></div><button id="refuel" class="ops-button primary" type="button">Record refuel</button></div><div class="mw-fuel-hero"><strong>${Math.round(fuel(x))}%</strong><span>Current level</span></div>${table((x.sensor||[]).slice().reverse().slice(0,30),[['Time','time'],['Fuel',r=>`${f(r.fuel)}%`],['Coolant',r=>r.temp==null?'Not available':`${r.temp} °C`]])}</article>`}
function maintenance(x){const r=remain(x);return`<article class="ops-card"><div class="ops-card-head"><div><h3>Maintenance</h3><p>Service state and work history for ${e(x.asset)}.</p></div><button id="schedule" class="ops-button primary" type="button">Schedule service</button></div>${grid([['Current meter',`${f(x.meter)} h`],['Next service',`${f(x.nextService)} h`],['Remaining',r<=0?`${Math.abs(Math.round(r))} h overdue`:`${Math.round(r)} h`],['Last service',x.lastService]])}${table(x.maintenance||[],[['Date','date'],['Work','work'],['Meter',r=>`${r.meter} h`],['Status','status']])}</article>`}
function hireView(x){const h=x.hire?.[0]||{},p=h.proposed??Math.max(h.minimum||0,h.measured||0);return`<article class="ops-card"><div class="ops-card-head"><div><h3>Hire reconciliation</h3><p>Measured activity and commercial review for this machine.</p></div></div>${grid([['Customer',x.customer],['Site',x.site],['Rate',`R${Number(x.rate||0).toLocaleString('en-ZA')}/h`],['Measured',`${f(h.measured)} h \u00b7 ${f(h.meterStart)}→${f(h.meterEnd)}`],['Minimum',`${f(h.minimum)} h \u00b7 agreement term`],['Proposed',`${f(p)} h`],['Status',h.status||'Needs review'],['Value',`R${Math.round(p*Number(x.rate||0)).toLocaleString('en-ZA')}`]])}<div class="ops-actions mw-actions"><button data-hire="approve" class="bb-button primary" type="button">Approve hours</button><button data-hire="flag" class="bb-button" type="button">Flag discrepancy</button></div></article>`}
function alerts(x){return`<article class="ops-card"><div class="ops-card-head"><div><h3>Alerts for ${e(x.asset)}</h3><p>Every action applies to this machine only.</p></div></div><div class="mw-alert-list">${(x.alerts||[]).map(a=>`<article class="mw-alert ${a.resolved?'resolved':''}"><header><div><b>${e(a.text)}</b><small>${e(a.time)} · ${e(a.severity)}</small></div><span>${a.resolved?'Resolved':a.ack?'Acknowledged':'Open'}</span></header><div class="ops-actions">${!a.ack&&!a.resolved?`<button data-alert="ack" class="bb-button primary" data-id="${a.id}" type="button">Acknowledge</button>`:''}${!a.resolved?`<button data-alert="assign" class="bb-button" data-id="${a.id}" type="button">Assign</button>`:''}${a.ack&&!a.resolved?`<button data-alert="resolve" class="bb-button" data-id="${a.id}" type="button">Resolve</button>`:''}</div>${a.acknowledgedAt?`<small>Acknowledged ${e(a.acknowledgedAt)} by ${e(a.acknowledgedBy||'Fleet manager')}</small>`:''}${a.assignedTo?`<small>Assigned to ${e(a.assignedTo)}</small>`:''}</article>`).join('')||'<div class="ops-empty">No alert history.</div>'}</div></article>`}
function timeline(x){
  const op=logs().filter(a=>a.machine?.id===x.id||a.machine===x.asset).map(a=>({time:a.time,type:'Action',text:`${a.action} \u00b7 ${a.subject}`})),
        ev=(x.events||[]).map(a=>({time:a.time,type:a.type,text:a.text})),
        all=[...op,...ev].slice(0,80),
        open=alertsOpen(x).length;
  const closure=open===0?`<div class="ops-empty ops-empty--done"><b>Caught up</b><small>No open alerts — last action recorded ${e(all[0]?.time||'recently')}.</small></div>`:`<div class="ops-empty"><b>${open} open exception${open>1?'s':''} requiring attention</b><small>Review Alerts tab to acknowledge or assign.</small></div>`;
  return`<article class="ops-card"><div class="ops-card-head"><div><h3>Timeline</h3><p>Machine events and fleet actions for ${e(x.asset)}.</p></div></div>${table(all,[['Time','time'],['Type','type'],['What happened','text']])}${closure}</article>`}
function panel(x){return view==='live'?live(x):view==='history'?history(x):view==='fuel'?fuelView(x):view==='maintenance'?maintenance(x):view==='hire'?hireView(x):view==='alerts'?alerts(x):view==='timeline'?timeline(x):overview(x)}

function maybeShowTabsHint(){
  const key='fleetzi-onboard-tabs-seen';
  if(localStorage.getItem(key)) return;
  const tabs=document.querySelector(".mw-tabs");
  if(!tabs) return;
  requestAnimationFrame(()=>{
    if(tabs.scrollWidth <= tabs.clientWidth + 8) return;
    if(document.querySelector(".bb-swipe-hint")) return;
    const hint=document.createElement("div");hint.className="bb-swipe-hint";
    hint.innerHTML="<b>Swipe for more</b><span>History, Fuel, Maintenance, Hire, Alerts, Timeline live here</span><button type=\"button\">Dismiss</button>";
    tabs.insertAdjacentElement("afterend", hint);
    hint.querySelector("button").onclick=()=>{ hint.remove(); localStorage.setItem(key,"1"); };
    tabs.addEventListener("scroll", ()=>{ if(tabs.scrollLeft>24){ hint.style.opacity=".55"; }}, {once:true});
    setTimeout(()=>{ hint.remove(); }, 8000);
  });
}

function render(){st=read();const host=$('#machine-workspace'),x=m();if(!host)return;if(!x){host.innerHTML='<div class="ops-empty"><h2>No machine selected</h2><a class="ops-link primary" href="./fleet.html">Open fleet</a></div>';return}document.title=`${x.asset} · ${x.model} | Fleetzi`;host.innerHTML=header(x)+tabs(x)+`<div class="mw-body">${panel(x)}</div>`;bind(x);maybeShowTabsHint();if(view==='live'||view==='history')drawMap(x,view==='history'?'all':'2h')}
function bind(x){document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-range]').forEach(y=>y.classList.toggle('active',y===b));drawMap(x,b.dataset.range)});document.querySelectorAll('[data-alert]').forEach(b=>b.onclick=()=>doAlert(x,b.dataset.id,b.dataset.alert));document.querySelectorAll('[data-hire]').forEach(b=>b.onclick=()=>doHire(x,b.dataset.hire));$('#refuel')?.addEventListener('click',()=>{const before=+fuel(x)||0;x.fuel=Math.min(100,before+25);x.sensor.push({time:new Date().toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'}),fuel:+x.fuel.toFixed(1),temp:x.coolant??null});x.events.unshift({time:new Date().toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'}),type:'fuel',text:`Refuel recorded: ${Math.round(before)}% → ${Math.round(x.fuel)}%`});log('Record refuel',x,`Fuel ${Math.round(before)}% → ${Math.round(x.fuel)}%`);save();render()});$('#schedule')?.addEventListener('click',()=>{x.maintenance.unshift({date:new Date().toLocaleDateString('en-ZA'),work:'Service scheduled',meter:Math.round(x.meter),status:'Scheduled'});log('Schedule service',x,'Maintenance work order');save();render()})}
async function doAlert(x,aid,action){
  const a=x.alerts.find(y=>y.id===aid);if(!a)return;
  if(action==='ack'){
    const ok=await showModal({title:'Acknowledge alert?',body:a.text,grid:[['Machine',x.asset],['Severity',a.severity],['Time',a.time]],confirmText:'Acknowledge',confirmClass:'primary',cancelText:'Cancel'});
    if(!ok)return;
    const prev={ack:a.ack,acknowledgedAt:a.acknowledgedAt,acknowledgedBy:a.acknowledgedBy};
    const now=new Date().toLocaleString('en-ZA');a.ack=true;a.acknowledgedAt=now;a.acknowledgedBy='Fleet manager';if(x.exception)x.exception.ack=true;log('Acknowledge alert',x,a.text);save();render();
    showUndo('Alert acknowledged',()=>{Object.assign(a,prev);if(x.exception)x.exception.ack=false;save();});
  } else if(action==='assign'){
    const ok=await showModal({title:'Assign alert?',body:a.text,grid:[['Machine',x.asset],['Alert',a.text]],confirmText:'Assign to Fleet operations',cancelText:'Cancel'});
    if(!ok)return;
    const prev={assignedTo:a.assignedTo,assignedAt:a.assignedAt};
    const now=new Date().toLocaleString('en-ZA');a.assignedTo='Fleet operations';a.assignedAt=now;log('Assign alert',x,a.text);save();render();
    showUndo('Alert assigned',()=>{a.assignedTo=prev.assignedTo;a.assignedAt=prev.assignedAt;save();});
  } else {
    const ok=await showModal({title:'Resolve alert?',body:a.text,grid:[['Machine',x.asset],['Status',a.ack?'Acknowledged':'Open']],confirmText:'Resolve',confirmClass:'primary',cancelText:'Cancel'});
    if(!ok)return;
    const prev={resolved:a.resolved,resolvedAt:a.resolvedAt};
    const now=new Date().toLocaleString('en-ZA');a.resolved=true;a.resolvedAt=now;log('Resolve alert',x,a.text);save();render();
    showUndo('Alert resolved',()=>{a.resolved=prev.resolved;a.resolvedAt=prev.resolvedAt;save();});
  }
}async function doHire(x,action){
  const h=x.hire?.[0];if(!h)return;
  const p=h.proposed??Math.max(h.minimum||0,h.measured||0);
  const value=Math.round(p*Number(x.rate||0)).toLocaleString('en-ZA');
  if(action==='approve'){
    const ok=await showModal({title:'Approve billable hours?',body:'This value will be proposed for invoicing. Measured hours remain separate until human review.',grid:[['Machine',x.asset],['Customer',x.customer],['Measured',`${f(h.measured)} h`],['Minimum',`${f(h.minimum)} h`],['Proposed',`${f(p)} h`],['Rate',`R${Number(x.rate||0).toLocaleString('en-ZA')}/h`],['Proposed value',`R${value}`]],confirmText:`Approve R${value}`,confirmClass:'primary',cancelText:'Cancel'});
    if(!ok)return;
    const prev={status:h.status,reviewedAt:h.reviewedAt};
    h.status='Approved';h.reviewedAt=new Date().toLocaleString('en-ZA');log('Approve hire hours',x,`${f(p)} h \u00b7 R${value}`);save();render();
    showUndo(`Approved ${f(p)} h \u00b7 R${value}`,()=>{h.status=prev.status;h.reviewedAt=prev.reviewedAt;save();});
  } else {
    const ok=await showModal({title:'Flag discrepancy?',body:'This will mark the hire record for review and keep measured hours separate from billing.',grid:[['Machine',x.asset],['Measured',`${f(h.measured)} h`],['Proposed',`${f(p)} h`]],confirmText:'Flag for review',cancelText:'Cancel'});
    if(!ok)return;
    const prev={status:h.status};
    h.status='Discrepancy';log('Flag hire discrepancy',x,`${f(h.measured)} h measured`);save();render();
    showUndo('Flagged for review',()=>{h.status=prev.status;save();});
  }
}
function drawMap(x,range){const host=$('#mw-map');if(!host||!window.maplibregl)return;if(map){map.remove();map=null}const pts=range==='30m'?(x.trail||[]).slice(-15):range==='2h'?(x.trail||[]).slice(-60):(x.trail||[]);const coords=pts.map(p=>[p.lng,p.lat]);const style={version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'osm',type:'raster',source:'osm'}]};map=new maplibregl.Map({container:host,style,center:[x.lng,x.lat],zoom:15,attributionControl:true});map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');map.on('load',()=>{map.addSource('route',{type:'geojson',data:{type:'Feature',geometry:{type:'LineString',coordinates:coords.length>1?coords:[[x.lng,x.lat],[x.lng,x.lat]]},properties:{}}});map.addLayer({id:'route',type:'line',source:'route',paint:{'line-color':'#2872c7','line-width':5,'line-opacity':.9}});map.addSource('current',{type:'geojson',data:{type:'Feature',geometry:{type:'Point',coordinates:[x.lng,x.lat]},properties:{}}});map.addLayer({id:'current',type:'circle',source:'current',paint:{'circle-radius':10,'circle-color':x.status==='dark'?'#c43d32':x.status==='idle'?'#d99b1e':['running','moving'].includes(x.status)?'#23884c':'#69747a','circle-stroke-color':'#ffffff','circle-stroke-width':3}});if(coords.length>1){const b=coords.reduce((z,c)=>z.extend(c),new maplibregl.LngLatBounds(coords[0],coords[0]));map.fitBounds(b,{padding:35,maxZoom:16,duration:450});if($('#mw-route-summary'))$('#mw-route-summary').textContent=`${pts.length} location points · ${pts[0].t||'start'} to ${pts.at(-1).t||'latest'}`}})}
render();window.addEventListener('storage',z=>{if(z.key===S)render()});