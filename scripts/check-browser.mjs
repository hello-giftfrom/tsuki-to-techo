// External QA only: Playwright is supplied by PLAYWRIGHT_MODULE, not an app dependency.
import {createRequire} from 'node:module';
import {existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const cardCode=ts.transpileModule(await readFile(new URL('../src/data/cards.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {cards:deck}=await import(`data:text/javascript;base64,${Buffer.from(cardCode).toString('base64')}`);
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=resolve('qa-output');await mkdir(output,{recursive:true});
const root=resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=resolve(root,'.'+path);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(await readFile(file));
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const results=[];let browser;
try{
 const installedChrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
 browser=await chromium.launch({headless:true,...(!existsSync(chromium.executablePath())&&existsSync(installedChrome)?{executablePath:installedChrome}:{})});
 for(const width of [1440,390,360,320]){
  const context=await browser.newContext({viewport:{width,height:width===1440?1000:800},hasTouch:width<640,isMobile:width<640});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  async function inspect(name){
   await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.images)if(img.getBoundingClientRect().width){img.loading='eager';await img.decode().catch(()=>{});}});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}/${name}: horizontal overflow`);
   const colors=await page.evaluate(()=>({body:getComputedStyle(document.body).backgroundColor,ink:getComputedStyle(document.body).color,oracle:document.querySelector('[data-oracle]')?getComputedStyle(document.querySelector('[data-oracle]')).backgroundColor:null}));
   if(name==='choose')assert.equal(colors.oracle,'rgb(35, 54, 79)');
   else {assert.equal(colors.body,'rgb(255, 255, 255)');assert.equal(colors.ink,'rgb(35, 54, 79)');}

   const footer=await page.locator('.footer-top').evaluate(el=>{
    const nav=el.querySelector('nav'),logo=el.querySelector('.brand');
    const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};};
    return {logo:rect(logo),nav:rect(nav),columns:getComputedStyle(nav).gridTemplateColumns,links:[...nav.querySelectorAll('a')].map(a=>({...rect(a),font:parseFloat(getComputedStyle(a).fontSize),clipped:a.scrollWidth>a.clientWidth+1||a.scrollHeight>a.clientHeight+1}))};
   });
   assert.ok(footer.links.every(a=>a.left>=0&&a.right<=width&&!a.clipped),`${width}/${name}: footer clipping`);
   if(width<640){
    assert.ok(footer.nav.top>=footer.logo.bottom,`${width}/${name}: footer logo above navigation`);
    assert.equal(footer.columns.split(' ').length,2);
    assert.ok(footer.links.every(a=>a.font>=14&&a.left>=23&&a.right<=width-23));
   }
   if(name==='top')await page.locator('.site-footer').screenshot({path:resolve(output,`${width}-footer.png`)});
   const broken=await page.locator('img:visible').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src));
   assert.deepEqual(broken,[],`${width}/${name}: broken images`);
   await page.screenshot({path:resolve(output,`${width}-${name}.png`),fullPage:true});
   results.push({width,page:name,status:'pass'});
  }
  await page.goto(base);await inspect('top');
  const menu=page.locator('.site-menu');await menu.locator('summary').click();assert.equal(await menu.getAttribute('open'),'');
  await menu.press('Escape');assert.equal(await menu.getAttribute('open'),null);
  await page.locator('.home-hero a').click();await page.waitForURL('**/oracle/');
  const cards=page.locator('[data-draw]');assert.equal(await cards.count(),5);
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-draw]')].every(b=>!b.disabled));
  const backs=await cards.evaluateAll(xs=>xs.map(x=>x.innerHTML));assert.ok(backs.every(x=>x===backs[0]));
  const boxes=await cards.evaluateAll(xs=>xs.map(x=>{const r=x.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
  assert.ok(boxes.every(b=>b.width>=85&&b.height>=140),`${width}: card size`);
  assert.equal(boxes[0].y,boxes[2].y);assert.equal(boxes[3].y,boxes[4].y);assert.ok(boxes[3].y>boxes[0].y);
  await inspect('choose');
  await cards.nth(2).focus();await page.keyboard.press('Enter');
  await page.waitForSelector('[data-reading]:visible');
  const reading=page.locator('[data-reading]:visible');assert.equal(await reading.count(),1);
  assert.ok(await reading.locator('.positive-message').innerText());assert.ok(await reading.locator('[data-journal-prompt]').isVisible());
  assert.equal(await page.evaluate(()=>document.activeElement?.tagName),'H2');
  await inspect('result');
  await reading.locator('[data-reset]').click();assert.equal(await page.locator('[data-results]').isVisible(),false);
  assert.equal(await cards.first().evaluate(el=>el===document.activeElement),true);
  await page.emulateMedia({reducedMotion:'reduce'});
  await cards.first().evaluate(el=>{el.click();el.click();});await page.waitForSelector('[data-reading]:visible');
  assert.equal(await page.locator('[data-reading]:visible').count(),1);
  for(const [url,name] of [['/new-moon/','article'],['/reading/','reading'],['/oracle/cards/yohaku/','direct-result']]){
   await page.goto(base+url);await inspect(name);
   if(name==='article'){
    const first=page.locator('.toc a').first();const href=await first.getAttribute('href');await first.click();assert.equal(decodeURIComponent(new URL(page.url()).hash),href);
   }
  }
  // Verify every card with the real long-form text at every requested width.
  for(const card of deck){
   await page.goto(base+`/oracle/cards/${card.slug}/`);
   const reading=page.locator('.oracle-reading');
   assert.equal(await reading.locator('h1').innerText(),card.title);
   assert.equal(await reading.locator('.positive-message').innerText(),card.affirmation);
   assert.equal(await reading.locator('.result-body').innerText(),card.message);
   assert.equal(await reading.locator('.message-box p').innerText(),card.cardMessage);
   assert.equal(await reading.locator('.prompt-box blockquote').innerText(),card.journalPrompt);
   assert.equal(await reading.locator('.botanical').count(),0);
   await reading.locator('img').evaluate(img=>img.decode());
   const imageLayout=await reading.locator('img').evaluate(img=>{
    const box=img.getBoundingClientRect();
    return {width:box.width,height:box.height,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,fit:getComputedStyle(img).objectFit};
   });
   assert.equal(imageLayout.naturalWidth,512);assert.equal(imageLayout.naturalHeight,512);
   assert.ok(Math.abs(imageLayout.width-imageLayout.height)<1,`${card.slug}: square image region`);
   assert.equal(imageLayout.fit,'contain');
   assert.equal(await reading.locator('.card-art-note').isVisible(),false);

   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}/${card.slug}: overflow`);
   const layout=await reading.evaluate(el=>{
    const rect=selector=>{const r=el.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,bottom:r.bottom};};
    return {top:rect('.result-top'),art:rect('.result-art'),name:rect('.result-top header'),affirmation:rect('.positive-message'),body:rect('.result-body'),message:rect('.message-box'),prompt:rect('.prompt-box')};
   });
   if(width<640){
    assert.ok(layout.name.y>=layout.art.bottom,`${card.slug}: mobile single column`);
    assert.ok(layout.art.width<=280.1&&layout.art.width/layout.top.width>=.69&&layout.art.width/layout.top.width<=.81,`${card.slug}: mobile art width`);
   }else assert.ok(layout.name.x>layout.art.x+layout.art.width,`${card.slug}: desktop columns`);
   assert.ok(layout.affirmation.y>=layout.top.bottom&&layout.body.y>=layout.affirmation.bottom&&layout.message.y>=layout.body.bottom&&layout.prompt.y>=layout.message.bottom,`${card.slug}: reading order`);
   if(['totonoeru','atarashii-tsuki'].includes(card.slug)){
    await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';await img.decode().catch(()=>{});}});
    await page.screenshot({path:resolve(output,`${width}-${card.slug}.png`),fullPage:true});
   }
   results.push({width,page:`card:${card.slug}`,status:'pass'});
  }
  await page.locator('.site-header .brand').click();await page.waitForURL(base+'/');
  assert.deepEqual(errors,[],`${width}: browser/network errors`);await context.close();
 }
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:360,height:800}});
 const page=await context.newPage();await page.goto(base+'/oracle/');assert.ok(await page.locator('.noscript-message').isVisible());
 await context.close();
 await writeFile(resolve(output,'results.json'),JSON.stringify({status:'pass',testedAt:new Date().toISOString(),browser:browser.version(),checks:results},null,2));
 console.log(`PASS: 1440 / 390 / 360 / 320px, all 36 cards, navigation, 3+2 cards, keyboard draw, reset, reduced motion, images, overflow, article links. Screenshots: ${output}`);
}catch(error){
 await writeFile(resolve(output,'results.json'),JSON.stringify({status:'failed',testedAt:new Date().toISOString(),checks:results,error:String(error)},null,2));
 console.error(error);process.exitCode=1;
}finally{await browser?.close();await new Promise(r=>server.close(r));}
