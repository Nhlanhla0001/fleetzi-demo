// Fleetzi Fleet Management workspace shell.
const nativeGet=Storage.prototype.getItem,nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem;
const storageAliases={'fleetzi-realtime-sim-v1':'fleetzi-realtime-sim-v2','fleetzi-realtime-actions-v1':'fleetzi-realtime-actions-v2'};
Storage.prototype.getItem=function(key){return nativeGet.call(this,storageAliases[key]||key)};
Storage.prototype.setItem=function(key,value){return nativeSet.call(this,storageAliases[key]||key,value)};
Storage.prototype.removeItem=function(key){return nativeRemove.call(this,storageAliases[key]||key)};

const menu=document.querySelector('.menu-toggle');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.getElementById('navigation')?.classList.toggle('open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');document.getElementById('navigation')?.classList.remove('open');menu.focus()}});

const opsPages=new Set(['fleet.html','live-map.html','sites.html','diagnostics.html','alerts.html','maintenance.html','utilisation.html','fuel.html','inspections.html','reports.html','hire.html','machine.html']);
const pageLabels={'fleet.html':'Fleet','live-map.html':'Live Map','sites.html':'Sites & Geofences','diagnostics.html':'Diagnostics','alerts.html':'Alerts','maintenance.html':'Maintenance','utilisation.html':'Utilisation','fuel.html':'Fuel','inspections.html':'Inspections','reports.html':'Reports','hire.html':'Hire & Billing','machine.html':'Machine'};
function currentPage(){return location.pathname.split('/').pop()||'index.html'}
function fleetState(){try{return JSON.parse(localStorage.getItem('fleetzi-realtime-sim-v2'))||null}catch{return null}}
function currentMachineLabel(){const id=new URLSearchParams(location.search).get('id'),s=fleetState(),m=s?.machines?.find(x=>x.id===id);return m?`${m.asset} · ${m.model}`:'Machine'}
function openAlertCount(){const s=fleetState();return s?.machines?.reduce((n,m)=>n+(m.alerts||[]).filter(a=>!a.ack&&!a.resolved).length,0)||0}
function navGroup(label,links){return `<small class="product-nav-label">${label}</small>${links.map(([page,_icon,text])=>`<a data-page="${page}" href="./${page}"><span class="product-nav-icon" aria-hidden="true"></span>${text}</a>`).join('')}`}
function escHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function searchMachineText(m){return [m.asset,m.type,m.model,m.serial,m.site,m.customer,m.attachment,m.status].join(' ').toLowerCase()}
function machineHref(m){return `./machine.html?id=${encodeURIComponent(m.id)}&view=overview`}

function bindFleetFinder(top){
  const form=top.querySelector('.product-global-search'),input=form?.querySelector('input'),results=top.querySelector('#product-search-results');
  if(!form||!input||!results)return;
  let activeIndex=-1;
  const close=()=>{results.hidden=true;results.innerHTML='';input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');activeIndex=-1};
  const setActive=index=>{const options=[...results.querySelectorAll('[role="option"]')];if(!options.length)return;activeIndex=(index+options.length)%options.length;options.forEach((el,i)=>{el.classList.toggle('active',i===activeIndex);el.setAttribute('aria-selected',String(i===activeIndex))});const active=options[activeIndex];input.setAttribute('aria-activedescendant',active.id);active.scrollIntoView({block:'nearest'})};
  const render=()=>{const raw=input.value.trim(),q=raw.toLowerCase(),s=fleetState();if(!q){close();return}const matches=(s?.machines||[]).filter(m=>searchMachineText(m).includes(q)).slice(0,6);if(!matches.length){results.innerHTML=`<div class="product-search-empty">No matching machines.<a href="./fleet.html?q=${encodeURIComponent(raw)}">View fleet search</a></div>`}else{results.innerHTML=matches.map((m,i)=>`<a id="fleet-search-option-${i}" class="product-search-result" role="option" aria-selected="false" href="${machineHref(m)}"><span><b>${escHtml(m.asset)}</b><small>${escHtml(m.model)} · ${escHtml(m.type)}</small></span><span class="product-search-meta"><b>${escHtml(m.status==='dark'?'Offline':m.status)}</b><small>${escHtml(m.site)}</small></span></a>`).join('')+`<a class="product-search-all" href="./fleet.html?q=${encodeURIComponent(raw)}">View all matching machines</a>`}results.hidden=false;input.setAttribute('aria-expanded','true');activeIndex=-1};
  input.addEventListener('input',render);input.addEventListener('focus',()=>{if(input.value.trim())render()});
  input.addEventListener('keydown',e=>{if(e.key==='Escape'){close();return}if(results.hidden)return;if(e.key==='ArrowDown'){e.preventDefault();setActive(activeIndex+1)}else if(e.key==='ArrowUp'){e.preventDefault();setActive(activeIndex-1)}else if(e.key==='Enter'&&activeIndex>=0){const option=results.querySelectorAll('[role="option"]')[activeIndex];if(option){e.preventDefault();location.href=option.href}}});
  form.addEventListener('submit',close);results.addEventListener('mousemove',e=>{const option=e.target.closest('[role="option"]');if(!option)return;const options=[...results.querySelectorAll('[role="option"]')];setActive(options.indexOf(option))});
  document.addEventListener('pointerdown',e=>{if(!top.querySelector('.product-global-search-wrap')?.contains(e.target))close()});
}

function installOperationsShell(){
  const page=currentPage();if(!opsPages.has(page)||document.querySelector('.product-sidebar'))return;
  document.body.classList.add('product-ops-body');
  const legacyHeader=document.querySelector('body > .header'),legacyNav=document.querySelector('body > .ops-nav'),main=document.querySelector('body > main');if(!main)return;
  legacyHeader?.classList.add('product-shell-hidden');legacyNav?.classList.add('product-shell-hidden');
  const shell=document.createElement('div');shell.className='product-shell';
  const sidebar=document.createElement('aside');sidebar.className='product-sidebar';sidebar.id='product-sidebar';sidebar.setAttribute('aria-label','Fleet management navigation');
  sidebar.innerHTML=`<a class="product-brand" href="./demo.html" aria-label="Fleetzi Fleet Management overview"><span class="product-brand-mark" aria-hidden="true"></span><span>FLEETZI<small>FLEET MANAGEMENT</small></span></a><div class="product-workspace-context"><small>ORGANISATION</small><b>Fleetzi Plant Hire</b><span>Fleet management workspace</span></div><nav class="product-nav" aria-label="Fleet management sections">${navGroup('Monitor',[['demo.html','','Overview'],['fleet.html','','Fleet'],['live-map.html','','Live Map'],['utilisation.html','','Utilisation'],['fuel.html','','Fuel']])}${navGroup('Operate',[['maintenance.html','','Maintenance'],['inspections.html','','Inspections'],['alerts.html','','Alerts'],['reports.html','','Reports']])}${navGroup('Commercial',[['hire.html','','Hire & Billing'],['installation.html','','Hardware & Setup']])}</nav><div class="product-sidebar-foot"><b>Fleet manager</b><small>Fleetzi Plant Hire</small></div>`;
  const content=document.createElement('div');content.className='product-content';
  const top=document.createElement('header');top.className='product-topbar';
  const section=page==='machine.html'?currentMachineLabel():(pageLabels[page]||'Fleet Management'),alerts=openAlertCount();
  top.innerHTML=`<button class="product-menu-button" type="button" aria-expanded="false" aria-controls="product-sidebar" aria-label="Open fleet navigation">Menu</button><div class="product-workspace-title"><small>Fleetzi Plant Hire / Fleet Management</small><b>${section}</b></div><div class="product-global-search-wrap"><form action="./fleet.html" method="get" class="product-global-search" role="search"><input type="search" name="q" placeholder="Search machine, serial, site or customer" aria-label="Search fleet" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="product-search-results"></form><div id="product-search-results" class="product-search-results" role="listbox" aria-label="Fleet search results" hidden></div></div><a class="product-top-link" href="./alerts.html?status=open">Open alerts${alerts?` <span class="product-alert-count" aria-label="${alerts} open alerts">${alerts}</span>`:''}</a>`;
  main.parentNode.insertBefore(shell,main);shell.append(sidebar,content);content.append(top,main);
  const active=page==='machine.html'?'fleet.html':page;sidebar.querySelector(`[data-page="${active}"]`)?.setAttribute('aria-current','page');
  const toggle=top.querySelector('.product-menu-button');
  const closeSidebar=(returnFocus=false)=>{sidebar.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open fleet navigation');if(returnFocus)toggle.focus()};
  toggle.addEventListener('click',()=>{const open=sidebar.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close fleet navigation':'Open fleet navigation')});
  sidebar.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeSidebar(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.classList.contains('open'))closeSidebar(true)});
  bindFleetFinder(top);
  import('./simulator-runtime.js').catch(()=>{});
}

function maybeShowMobileCoach(){
  const key='fleetzi-onboard-menu-seen';
  if(localStorage.getItem(key)) return;
  if(matchMedia('(max-width: 900px)').matches===false) return;
  const btn=document.querySelector('.product-menu-button, .dash-menu, .menu-toggle');
  if(!btn) return;
  // delay to let shell mount
  setTimeout(()=>{
    if(localStorage.getItem(key)) return;
    if(document.querySelector('.bb-coach')) return;
    const coach=document.createElement('div');coach.className='bb-coach';coach.setAttribute('role','dialog');coach.setAttribute('aria-label','Fleet navigation help');
    const rect=btn.getBoundingClientRect();
    coach.style.left=Math.min(window.innerWidth-340, Math.max(12, rect.left))+'px';
    coach.style.top=(rect.bottom+12)+'px';
    coach.innerHTML=`<div class="bb-coach-arrow" style="left:18px;top:-6px"></div><h4>Fleet navigation is here</h4><p>Overview, Fleet, Live Map, Utilisation & Fuel are in this menu. On mobile it hides to keep the map and table readable — tap Menu to open.</p><div class="bb-coach-actions"><button class="ghost" data-coach-skip type="button">Skip</button><button class="primary" data-coach-got type="button">Got it</button></div>`;
    document.body.append(coach);
    const close=(remember)=>{
      coach.remove();
      if(remember) localStorage.setItem(key,'1');
    };
    coach.querySelector('[data-coach-skip]').onclick=()=>close(true);
    coach.querySelector('[data-coach-got]').onclick=()=>close(true);
    coach.addEventListener('keydown',e=>{if(e.key==='Escape') close(true);});
    // auto dismiss on outside tap
    const outside=(e)=>{ if(!coach.contains(e.target) && !btn.contains(e.target)) {close(true); document.removeEventListener('pointerdown', outside);}};
    setTimeout(()=>document.addEventListener('pointerdown', outside), 300);
  }, 900);
}
maybeShowMobileCoach();
window.addEventListener('resize', maybeShowMobileCoach, {once:true});

installOperationsShell();

export function downloadText(text,name,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const planner=document.getElementById('plan-form');planner?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(planner);const text=['FLEETZI — INSTALLATION BRIEF','Prepared locally. Not submitted; not a confirmed booking.','',`Machines: ${data.get('count')}`,`Category: ${data.get('category')}`,`Makes and models: ${data.get('models')}`,`Installation area: ${data.get('area')}`,`Required information: ${data.getAll('needs').join(', ')||'To discuss'}`,`Notes: ${data.get('notes')||'None'}`,'','Compatibility, installation access, available readings and commercial terms require confirmation.'].join('\n');downloadText(text,'fleetzi-installation-brief.txt');const status=document.getElementById('plan-status');if(status)status.textContent='Your brief is ready as a download. Nothing has been sent or booked.'});