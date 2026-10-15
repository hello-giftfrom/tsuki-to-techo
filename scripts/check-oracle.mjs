// State-machine verification with DOM doubles; does not replace browser QA.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const cardSource=ts.transpileModule(readFileSync(new URL('../src/data/cards.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {cards}=await import(`data:text/javascript;base64,${Buffer.from(cardSource).toString('base64')}`);
assert.equal(cards.length,36);
for(const key of ['id','slug'])assert.equal(new Set(cards.map(c=>c[key])).size,36);
for(const chapter of ['ひらく','みつめる','うごく','やすむ'])assert.equal(cards.filter(c=>c.chapter===chapter).length,9);
for(const c of cards)for(const key of ['title','keyword','affirmation','message','cardMessage','journalPrompt','image'])assert.ok(c[key]);
for(const c of cards){
 const length=c.message.replaceAll('\n','').length;
 assert.ok(length>=200&&length<=350,`${c.slug}: message length ${length}`);
 assert.ok(c.cardMessage.length>=80&&c.cardMessage.length<=160,`${c.slug}: cardMessage length`);
 assert.ok(c.journalPrompt.endsWith('？'));
 assert.ok(readFileSync(new URL('../public'+c.image,import.meta.url)).length>0);
}
const source=readFileSync(new URL('../src/scripts/oracle.ts',import.meta.url),'utf8').replace("import {cards} from '../data/cards';",`const cards=${JSON.stringify(cards)};`).replace("import {track} from '../utils/analytics';",'const track=()=>{};');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {initOracle}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
class Element {
 dataset={}; hidden=false; disabled=false; events={}; classes=new Set();
 classList={add:(...names)=>names.forEach(n=>this.classes.add(n)),remove:(...names)=>names.forEach(n=>this.classes.delete(n))};
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
 click(){return Promise.all((this.events.click??[]).map(fn=>fn()));}
 focus(){globalThis.focused=this;}
 setAttribute(name,value){this[name]=value;}
 scrollIntoView(){}
}
globalThis.document={body:new Element()};
globalThis.matchMedia=()=>({matches:true});
// Fixed entropy means every instance receives the same hand, enabling a position/uniqueness check.
Object.defineProperty(globalThis,'crypto',{value:{getRandomValues:a=>{a[0]=0;return a;}}});
function fixture(){
 const root=new Element(),choose=new Element(),results=new Element(),status=new Element();
 const buttons=Array.from({length:5},()=>new Element());
 const readings=cards.map(c=>{const e=new Element();e.dataset.reading=String(c.id);e.hidden=true;e.heading=new Element();e.image=new Element();e.querySelector=s=>s==='h2'?e.heading:e.image;return e;});
 const reset=new Element();results.hidden=true;
 root.querySelectorAll=s=>({'[data-draw]':buttons,'[data-reading]':readings,'[data-reset]':[reset]}[s]);
 root.querySelector=s=>({'[data-choose]':choose,'[data-results]':results,'[data-status]':status}[s]);
 return {root,choose,results,status,buttons,readings,reset};
}
const selected=[];
for(let position=0;position<5;position++){
 const f=fixture();initOracle(f.root);initOracle(f.root);
 assert.ok(f.buttons.every(b=>!b.disabled&&b.events.click.length===1));
 const first=f.buttons[position].click();await f.buttons[(position+1)%5].click();await first;
 const shown=f.readings.filter(r=>!r.hidden);assert.equal(shown.length,1);selected.push(shown[0].dataset.reading);
 assert.equal(f.choose.hidden,true);assert.equal(f.results.hidden,false);assert.ok(f.buttons.every(b=>b.disabled));
 assert.equal(globalThis.focused,shown[0].heading);assert.equal(shown[0].image.loading,'eager');
 assert.equal(document.body.classes.has('dark-page'),false);
 await f.reset.click();assert.equal(f.choose.hidden,false);assert.equal(f.results.hidden,true);
 assert.ok(f.readings.every(r=>r.hidden));assert.equal(globalThis.focused,f.buttons[0]);
 assert.equal(document.body.classes.has('dark-page'),true);assert.ok(f.buttons.every(b=>!b.disabled));
 await f.buttons[0].click();assert.equal(f.readings.filter(r=>!r.hidden).length,1);
}
assert.equal(new Set(selected).size,5);
console.log('PASS: 36 cards / four chapters, 5 unique positions, rapid-click guard, single result, focus, reset, redraw, reduced motion, one-time init');
