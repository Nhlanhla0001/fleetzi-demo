const tabs=[...document.querySelectorAll('[data-hardware-tab]')];
const panels=[...document.querySelectorAll('[data-hardware-panel]')];

function activate(id,focus=false){
  tabs.forEach(tab=>{
    const active=tab.dataset.hardwareTab===id;
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex=active?0:-1;
    if(active&&focus)tab.focus();
  });
  panels.forEach(panel=>{panel.hidden=panel.dataset.hardwarePanel!==id;});
}

tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activate(tab.dataset.hardwareTab));
  tab.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    let next=index;
    if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    activate(tabs[next].dataset.hardwareTab,true);
  });
});

if(tabs[0])activate(tabs[0].dataset.hardwareTab);