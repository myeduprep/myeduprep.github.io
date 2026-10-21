// Run with NODE_PATH containing jsdom, or MEP_JSDOM pointing to jsdom's entry.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const {JSDOM} = require(process.env.MEP_JSDOM || 'jsdom');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read = f=>fs.readFileSync(path.join(root,f),'utf8');
const data=JSON.parse(read('boarding-schools/schools.json'));
let checks=0;
function check(value,message){assert.ok(value,message);checks++;}
async function page(file,search='',lang='ko',fetchOk=true) {
 const dom=new JSDOM(read(file),{url:'https://myeduprep.com/'+file.replace('index.html','')+search,runScripts:'outside-only'});
 const w=dom.window;w.matchMedia=()=>({matches:true});w.localStorage.setItem('mep-language',lang);
 w.eval(read('site.js'));
 if (file.startsWith('boarding-schools/')) {
  w.fetch=async()=>({ok:fetchOk,json:async()=>data}); w.eval(read('boarding-schools/boarding.js'));await new Promise(r=>setTimeout(r,20));
 }
 return w;
}
const cards=w=>[...w.document.querySelectorAll('[data-school]')].filter(x=>!x.hidden);
const click=(w,s)=>w.document.querySelector(s).click();
const set=(w,name,value)=>{const c=w.document.querySelector(`[name="${name}"]`);c.value=value;c.dispatchEvent(new w.Event('input',{bubbles:true}));};
let w=await page('boarding-schools/index.html');
check(cards(w).length===8,'All eight schools appear');
check(data.schools.map(s=>s.name).join('|')===[...data.schools].sort((a,b)=>a.name.localeCompare(b.name)).map(s=>s.name).join('|'),'Alphabetical order');
set(w,'q','BEDE’S');check(cards(w).length===1,'Search ignores case and apostrophe style');
set(w,'q','');set(w,'county','Dorset');set(w,'programme','IB');check(cards(w).length===1 && cards(w)[0].dataset.school==='bryanston','Filters combine');
set(w,'county','');set(w,'programme','');set(w,'gender','girls');check(cards(w).length===1 && cards(w)[0].dataset.school==='talbot-heath','Girls filter identifies Talbot Heath');
set(w,'gender','');set(w,'fee','0-50000');check(cards(w).length===0,'Unverified annual fees excluded');
set(w,'fee','50000-55000');check(cards(w).length===1 && cards(w)[0].dataset.school==='embley','International total used for Embley');
click(w,'button[type="reset"]');await new Promise(r=>setTimeout(r,10));check(cards(w).length===8,'Clear filters');
for (const slug of ['bedes','bradfield','bryanston']) click(w,`[data-compare-add="${slug}"]`);
check(w.document.querySelector('[data-compare-add="canford"]').disabled,'Maximum three schools enforced');
check(JSON.parse(w.localStorage.getItem('mep-school-comparison')).length===3,'Selection persists');
click(w,'[data-compare-add="bedes"]');check(!w.document.querySelector('[data-compare-add="canford"]').disabled,'Removing re-enables other schools');
check(w.document.querySelector('[data-compare-link]').href.includes('bradfield,bryanston'),'Comparison URL carries selection');w.close();
w=await page('boarding-schools/compare/index.html','?schools=bedes,canford,talbot-heath,unknown,embley','en');
check(w.document.querySelectorAll('thead [data-school-column]').length===3,'Shared URL validates IDs and limits three');
check(w.document.querySelector('table').textContent.includes('2026/27'),'Comparison labels fee years');
check(w.document.querySelector('table').textContent.includes('A*–B'),'Comparison labels result metrics');
check(!w.document.querySelector('[data-mobile-pair]').hidden,'Three-school mobile pair control');
let pair=w.document.querySelector('#compare-pair');pair.value='1,2';pair.dispatchEvent(new w.Event('change'));
check(w.document.querySelector('thead [data-school-column="0"]').classList.contains('mobile-hidden'),'Mobile pair selection works');
check(w.document.querySelector('#compare-school option[value=""]').textContent==='Select a school','English select placeholder');
click(w,'[data-compare-remove="canford"]');check(w.document.querySelectorAll('thead [data-school-column]').length===2,'Comparison removal updates table');
check(w.document.querySelector('#share-url').value.includes('bedes,talbot-heath'),'Share URL updates after removal');w.close();
w=await page('boarding-schools/compare/index.html','?schools=');check(!w.document.querySelector('table'),'Empty comparison has no fabricated rows');w.close();
w=await page('boarding-schools/index.html','','ko',false);check(!w.document.querySelector('[data-guide-error]').hidden,'Load errors are visible');check(cards(w).length===8,'Static directory survives fetch failure');w.close();
for(const school of data.schools){
 const filename=`boarding-schools/${school.slug}/index.html`;const html=read(filename);
 check(html.includes(school.name.replaceAll("'",'&#x27;')) || html.includes(school.name),`${school.slug} static profile`);
 for(const fact of Object.values(school.facts).filter(Boolean)) check(fact.source.startsWith('https://') && fact.verified==='2026-10-21',`${school.slug} provenance`);
}
w=await page('contact/index.html');w.eval(read('contact/contact.js'));let phone=w.document.querySelector('[name="phone"]');
check(phone.required && phone.type==='tel','Required tel input');
for(const value of ['010-1234-5678','+82 10-1234-5678','+44 (0)20 7946 0958']){
 phone.value=value;phone.dispatchEvent(new w.Event('input'));check(phone.validity.valid,`Accept ${value}`);
 const payload=new w.FormData(w.document.querySelector('form'));check(payload.get('phone')===value,'Actual native POST payload includes phone');
}
for(const value of ['abc','+++821012345678','123','010-1234-5678;']){phone.value=value;phone.dispatchEvent(new w.Event('input'));check(!phone.validity.valid,`Reject ${value}`);}
phone.value='';phone.dispatchEvent(new w.Event('input'));check(!phone.validity.valid,'Blank number rejected');
check(w.document.querySelector('[name="_honey"]') && w.document.querySelector('form').action==='https://formsubmit.co/myeduprep@gmail.com','Existing POST endpoint and honeypot preserved');w.close();
// Check every local href/src in every HTML file resolves (including existing pages).
const files=fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.html')&&!f.startsWith('.git/'));
let links=0;
for(const file of files){const d=new JSDOM(read(file));for(const el of d.window.document.querySelectorAll('[href],[src]')){
 const v=el.getAttribute('href')||el.getAttribute('src');if(!v||v.startsWith('#')||/^(https?:|mailto:|tel:|data:)/.test(v))continue;
 const local=v.split(/[?#]/)[0];const target=local.startsWith('/')?path.join(root,local):path.resolve(root,path.dirname(file),local);
 check(fs.existsSync(target),`${file}: ${v} exists`);links++;
}d.window.close();}
console.log(`PASS: ${checks} checks, ${links} local links/assets, 8 schools. Email inbox delivery and visual layout require separate verification.`);
