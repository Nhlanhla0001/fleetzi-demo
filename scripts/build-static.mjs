import {cp,mkdir,rm,readdir,readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';

const version=(process.env.GITHUB_SHA||Date.now().toString(36)).slice(0,10);

await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('web','dist',{recursive:true,filter:source=>!source.split('/').pop().startsWith('__')&&!source.endsWith('.webp.json')});

async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=join(dir,entry.name);
    if(entry.isDirectory()){await walk(path);continue;}
    if(!/\.(html|css|js)$/.test(entry.name))continue;
    let text=await readFile(path,'utf8');

    if(entry.name.endsWith('.html')){
      if(!text.includes('polish.css'))text=text.replace('</head>',`<link rel="stylesheet" href="./polish.css?v=${version}"></head>`);
      if(!text.includes('mobile.css'))text=text.replace('</head>',`<link rel="stylesheet" href="./mobile.css?v=${version}"></head>`);
      text=text
        .replace(/<i aria-hidden="true"><\/i><div>FLEETZI<small>FLEET MANAGEMENT<\/small><\/div>/g,'<img src="./brand/fleetzi-mark.svg" alt="" aria-hidden="true" width="42" height="42" style="display:block;object-fit:contain"><div>FLEETZI<small>MANAGE SMARTER</small></div>')
        .replace(/Fleetzi Plant Hire/g,'Fleetzi Demo Fleet')
        .replace(/FLEETZI/g,'FLEETZI')
        .replace(/Fleetzi/g,'Fleetzi')
        .replace(/FLEET MANAGEMENT/g,'MANAGE SMARTER')
        .replace(/(href|src|action)=(["'])\/(?!\/)/g,'$1=$2./')
        .replace(/((?:href|src)=["']\.\/(?:styles\.css|polish\.css|mobile\.css|map\.css|dashboard\.css|dashboard-shell\.css|hardware\.css|simulator-app\.css|simulator-ux\.css|operations-pages\.css|machine-workspace\.css|site\.js|demo\.js|intelligence-enhance\.js|simulator-dashboard\.js|hardware\.js|simulator-app\.js|simulator-ux\.js|operations-pages\.js|dashboard-routing\.js|dashboard-overview\.js|dashboard-map-gl\.js|live-map-gl\.js|machine-workspace-v4\.js|simulator-runtime\.js))(["'])/g,`$1?v=${version}$2`)
        .replace(/(href|action)=(["'])(\.\/[^"'#?]+)\.html(?=([?#][^"']*)?\2)/g,'$1=$2$3')
        .replace(/(href|action)=(["'])\.\/demo(?=([?#][^"']*)?\2)/g,'$1=$2./app');
    }

    if(entry.name.endsWith('.js')){
      text=text
        .replace(/Fleetzi/g,'Fleetzi')
        .replace(/FLEETZI/g,'FLEETZI')
        .replace(
          "function currentPage(){return location.pathname.split('/').pop()||'index.html'}",
          "function currentPage(){const leaf=location.pathname.split('/').filter(Boolean).pop()||'index';return leaf.includes('.')?leaf:`${leaf}.html`}"
        )
        .replace(/(["'])\.\/demo(?=([?#][^"']*)?\1)/g,'$1./app');
    }

    if(entry.name.endsWith('.css')){
      text=text
        .replace(/url\((['"]?)\/(?!\/)/g,'url($1./')
        .replace(/#d7aa39/gi,'#296AAE')
        .replace(/#f3b43b/gi,'#296AAE');
    }
    await writeFile(path,text);
  }
}

await walk('dist');
await rename('dist/demo.html','dist/app.html');
console.log(`Built Fleetzi static website with clean internal URLs, /app product route, shared UI polish and mobile responsiveness (${version}).`);
