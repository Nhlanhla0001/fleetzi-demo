import {validateIntelligence} from './intelligence.js';
export const STORAGE_KEY='fleetzi-equipment-demo-v1';
export const stages=['registered','planned','assigned','connected'];
export function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function estimate(machine){if(!machine.readings||!machine.contract)return null;const r=machine.contract.rate,m=machine.contract.minimum,h=machine.readings.hours;if(!Number.isFinite(r)||r<=0||!Number.isFinite(m)||m<0||!Number.isFinite(h)||h<0)return null;const chargeable=Math.max(h,m);return{hours:h,minimum:m,chargeable,rate:r,total:Math.round(chargeable*r*100)/100};}
export function newMachine(values,id){const name=String(values.name||'').trim(),asset=String(values.asset||'').trim(),model=String(values.model||'').trim();if(!name||!asset||!model)throw new Error('Enter the equipment name, asset number and make/model.');return{id,name:name.slice(0,80),asset:asset.slice(0,30),model:model.slice(0,80),type:String(values.type||'Other equipment'),stage:'registered',installation:null,tracker:null,readings:null,intelligence:null,maintenance:null,contract:null,review:null,offline:false};}
export function assignTracker(machine,tracker){if(machine.stage!=='planned')throw new Error('Plan installation before assigning a demo tracker.');if(!/^DEMO-[A-Z0-9-]{3,30}$/.test(tracker))throw new Error('Use a fictional tracker label beginning with DEMO-.');return{...machine,tracker,stage:'assigned'};}
function sampleIntelligence(){return{source:'Illustrative FMC650/flespi-shaped sample',availableWindow:'10-hour configured operating window',days:[
{date:'26 Aug',engine:6.8,working:5.7,idle:1.1,available:10,distance:14.2,fuelUsed:41.8,fuelLevel:78,fuelSource:'Illustrative J1939 sample'},
{date:'27 Aug',engine:8.1,working:6.9,idle:1.2,available:10,distance:18.4,fuelUsed:48.5,fuelLevel:66,fuelSource:'Illustrative J1939 sample'},
{date:'28 Aug',engine:5.4,working:4.7,idle:.7,available:10,distance:11.8,fuelUsed:32.1,fuelLevel:58,fuelSource:'Illustrative J1939 sample'},
{date:'29 Aug',engine:7.9,working:6.6,idle:1.3,available:10,distance:16.7,fuelUsed:46.2,fuelLevel:45,fuelSource:'Illustrative J1939 sample'},
{date:'30 Aug',engine:0,working:0,idle:0,available:10,distance:0,fuelUsed:0,fuelLevel:45,fuelSource:'Illustrative J1939 sample'},
{date:'31 Aug',engine:6.2,working:5.3,idle:.9,available:10,distance:13.3,fuelUsed:37.4,fuelLevel:34,fuelSource:'Illustrative J1939 sample'},
{date:'1 Sep',engine:7.2,working:6.1,idle:1.1,available:10,distance:15.6,fuelUsed:42.8,fuelLevel:72,fuelSource:'Illustrative J1939 sample'}],
movement:[
{time:'06:18',lat:-26.0064,lng:28.1147,state:'moving',speed:23,label:'Departed example depot'},
{time:'06:29',lat:-26.0031,lng:28.1198,state:'moving',speed:31,label:'In transit'},
{time:'06:41',lat:-26.0008,lng:28.1242,state:'moving',speed:18,label:'Approaching site'},
{time:'06:43',lat:-25.9997,lng:28.1255,state:'site-entry',speed:7,label:'Entered Midrand earthworks'},
{time:'08:05',lat:-25.9993,lng:28.1260,state:'working',speed:3,label:'Working area A'},
{time:'10:32',lat:-25.9989,lng:28.1268,state:'idle',speed:0,label:'Idle event'},
{time:'12:16',lat:-25.9995,lng:28.1275,state:'working',speed:4,label:'Working area B'},
{time:'15:48',lat:-25.9992,lng:28.1263,state:'stopped',speed:0,label:'Last sample position'}],
events:[
{time:'06:18',type:'trip',label:'Trip started from example depot'},
{time:'06:43',type:'geofence',label:'Entered Midrand earthworks geofence'},
{time:'07:02',type:'engine',label:'Engine activity verified on site'},
{time:'10:32',type:'idle',label:'Idle period started'},
{time:'10:54',type:'idle',label:'Idle period ended'},
{time:'15:48',type:'engine',label:'Engine stopped at last sample position'}],
alerts:[
{time:'10:42',type:'idle',severity:'warning',label:'Excessive idle threshold reached'},
{time:'14:21',type:'speed',severity:'info',label:'Brief sample speed event recorded'},
{time:'15:51',type:'connectivity',severity:'info',label:'Latest sample uploaded successfully'}]};}
export function receiveReadings(machine){if(machine.stage!=='assigned')throw new Error('Assign the demo tracker first.');return{...machine,stage:'connected',readings:{hours:7.2,idle:1.1,meter:2847,day:'1 September 2026',location:machine.installation?.area||'Example site',position:{lat:-25.9992,lng:28.1263,accuracy:8,source:'Illustrative GNSS sample'},ignition:false,lastSeen:'15:51',distanceToday:15.6},intelligence:sampleIntelligence(),maintenance:{nextServiceMeter:3000,source:'Example maintenance schedule'},offline:false};}
export function restore(raw){const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.machines)||data.machines.length>100)throw new Error('Invalid demo data');for(const m of data.machines){if(typeof m.id!=='string'||typeof m.name!=='string'||typeof m.asset!=='string'||typeof m.model!=='string'||typeof m.type!=='string'||!stages.includes(m.stage))throw new Error('Invalid equipment');if(m.readings&&(!Number.isFinite(m.readings.hours)||!Number.isFinite(m.readings.idle)||!Number.isFinite(m.readings.meter)))throw new Error('Invalid readings');if(m.readings?.position&&(!Number.isFinite(m.readings.position.lat)||!Number.isFinite(m.readings.position.lng)||m.readings.position.lat<-90||m.readings.position.lat>90||m.readings.position.lng<-180||m.readings.position.lng>180))throw new Error('Invalid position');if(!validateIntelligence(m.intelligence))throw new Error('Invalid equipment intelligence');if(m.contract&&(!Number.isFinite(m.contract.rate)||!Number.isFinite(m.contract.minimum)))throw new Error('Invalid agreement');}return data;}
export function examples(){let a=newMachine({name:'Earthworks excavator',asset:'EX-001',model:'CAT 320',type:'Excavator'},'example-ex');a={...a,stage:'planned',installation:{area:'Midrand — example site',window:'Example installation',notes:''}};a=receiveReadings(assignTracker(a,'DEMO-TRACKER-001'));a.contract={customer:'Example Civil Co.',site:'Midrand earthworks',rate:950,minimum:8};const b=newMachine({name:'Roadworks backhoe',asset:'TLB-002',model:'JCB 3DX',type:'Backhoe loader'},'example-tlb');return[a,b];}
