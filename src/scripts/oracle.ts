import {track} from '../utils/analytics';
import {jstDate} from '../data/moon';
export function initOracle(root:HTMLElement) {
 const find=<T extends HTMLElement=HTMLElement>(selector:string)=>root.querySelector<T>(selector)!;
 const fan=find('[data-fan]'); const buttons=[...root.querySelectorAll<HTMLButtonElement>('[data-fan-card]')];
 for(let i=buttons.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[buttons[i],buttons[j]]=[buttons[j],buttons[i]];}
 const choose=find('[data-choose]'), reveal=find('[data-reveal]'), results=find('[data-results]'), notebook=find('[data-notebook]');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let center=5, position=5, target=5, spring=0, frame=0, last=0, state='choose', started=false;
 let reading:HTMLElement|null=null, gesture:{id:number;x:number;y:number;at:number;lastX:number;velocity:number;start:number;mode:string;central:boolean;tapIndex:number}|null=null;
 let lastDrag=0, upward=0, sequence=0;
 const limit=(x:number)=>Math.max(0,Math.min(buttons.length-1,x));
 function theme(){return find<HTMLInputElement>('input[name="oracle-theme"]:checked').value;}
 function start(){if(!started){track('oracle_start');started=true;}}
 function draw(){
  const step=innerWidth<640?67:innerWidth<1000?90:116;
  buttons.forEach((button,i)=>{
   const d=i-position, distance=Math.abs(d), active=i===Math.round(position);
   button.style.transform=`translate3d(${d*step}px,${Math.min(170,d*d*11)+(active?upward:0)}px,0) rotate(${d*8}deg) scale(${1-Math.min(distance,5)*.055})`;
   button.style.zIndex=String(30-Math.round(distance*3));
   button.style.opacity=distance>4.3?'0':'1';
   button.style.pointerEvents=distance>4.3?'none':'auto';
   button.dataset.center=String(active);button.tabIndex=active?0:-1;
   button.setAttribute('aria-label',`${i+1}枚目のカード${active?'を選ぶ':'を中央へ'}`);
  });
 }
 function settle(){center=Math.round(limit(target));target=center;find('[data-position]').textContent=`${center+1} / ${buttons.length}`;find<HTMLButtonElement>('[data-previous]').disabled=center===0;find<HTMLButtonElement>('[data-next]').disabled=center===buttons.length-1;}
 function tick(now:number){
  frame=0;const dt=Math.min(2,Math.max(.4,(now-last)/16.667||1));last=now;
  if(gesture){draw();return;}
  spring=(spring+(target-position)*.075*dt)*Math.pow(.72,dt);position+=spring*dt;
  if(Math.abs(target-position)<.002&&Math.abs(spring)<.002){position=target;spring=0;draw();return;}
  draw();frame=requestAnimationFrame(tick);
 }
 function animate(){if(motion.matches){position=target;spring=0;draw();return;}if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}}
 function move(index:number,focus=false){if(state!=='choose')return;target=limit(index);settle();animate();if(focus)buttons[center].focus({preventScroll:true});}
 function scrollTo(el:HTMLElement){el.scrollIntoView({block:'start',behavior:motion.matches?'instant':'smooth'});}
 function delay(ms:number){return new Promise<void>(resolve=>setTimeout(resolve,motion.matches?0:ms));}
 async function select(index:number){
  if(state!=='choose')return;state='reveal';start();sequence++;const token=sequence;
  const button=buttons[index],id=Number(button.dataset.id);reading=find(`[data-reading="${id}"]`);
  track('card_select',{card_id:id,theme:theme()});
  root.querySelectorAll<HTMLInputElement>('input[name="oracle-theme"]').forEach(input=>input.disabled=true);
  buttons.forEach(b=>{b.disabled=true;b.style.pointerEvents='none';});
  cancelAnimationFrame(frame);frame=0;gesture=null;upward=0;
  button.classList.add('fan-selected');root.dataset.state='depart';
  await delay(400);if(token!==sequence)return;
  choose.hidden=true;reveal.hidden=false;root.dataset.state='reveal';
  const front=find('[data-reveal-front]');front.replaceChildren(reading.querySelector('[data-front]')!.cloneNode(true));
  front.querySelectorAll<HTMLImageElement>('img').forEach(img=>img.loading='eager');
  const card=find('[data-reveal-card]');card.classList.remove('is-open');
  scrollTo(root);await delay(500);if(token!==sequence)return;
  card.classList.add('is-open');await delay(1050);if(token!==sequence)return;
  reveal.hidden=true;results.hidden=false;reading.hidden=false;root.dataset.state='result';state='result';
  reading.querySelector('[data-reading-theme]')!.textContent=theme();
  reading.querySelectorAll<HTMLImageElement>('img').forEach(img=>img.loading='eager');
  scrollTo(results);reading.querySelector<HTMLElement>('h2')!.focus({preventScroll:true});
  track('card_result',{card_id:id,theme:theme()});track('journal_prompt_view',{card_id:id,location:'oracle'});
 }
 fan.addEventListener('pointerdown',(event:PointerEvent)=>{
  if(state!=='choose'||!event.isPrimary||event.button!==0)return;
  const button=(event.target as Element).closest<HTMLButtonElement>('[data-fan-card]');if(!button)return;
  cancelAnimationFrame(frame);frame=0;spring=0;
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,at:performance.now(),lastX:event.clientX,velocity:0,start:position,mode:'',central:button.dataset.center==='true',tapIndex:buttons.indexOf(button)};
  fan.setPointerCapture(event.pointerId);
 });
 fan.addEventListener('pointermove',(event:PointerEvent)=>{
  if(!gesture||event.pointerId!==gesture.id)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(!gesture.mode&&Math.hypot(dx,dy)>7)gesture.mode=Math.abs(dx)>Math.abs(dy)?'horizontal':gesture.central?'vertical':'scroll';
  const now=performance.now();
  if(gesture.mode==='horizontal'){
   gesture.velocity=.65*gesture.velocity+.35*(event.clientX-gesture.lastX)/Math.max(8,now-gesture.at);
   const step=innerWidth<640?67:innerWidth<1000?90:116;
   position=limit(gesture.start-dx/step);target=position;
  } else if(gesture.mode==='vertical')upward=Math.max(-155,Math.min(28,dy*.85));
  gesture.lastX=event.clientX;gesture.at=now;
  if(!frame)frame=requestAnimationFrame(()=>{frame=0;draw();});
 });
 function finish(event:PointerEvent,cancelled=false){
  if(!gesture||gesture.id!==event.pointerId)return;
  const g=gesture;gesture=null;
  if(fan.hasPointerCapture(event.pointerId))fan.releasePointerCapture(event.pointerId);
  lastDrag=performance.now();
  if(!cancelled&&!g.mode){if(g.tapIndex===Math.round(position))void select(g.tapIndex);else move(g.tapIndex);return;}
  if(!cancelled&&g.mode==='vertical'&&upward < -68){upward=0;void select(Math.round(position));return;}
  if(!cancelled&&g.mode==='horizontal')target=limit(position-g.velocity*1.6);
  else target=Math.round(position);
  upward=0;settle();animate();
 }
 fan.addEventListener('pointerup',e=>finish(e));fan.addEventListener('pointercancel',e=>finish(e,true));
 buttons.forEach((button,i)=>{
  const number=button.querySelector('.back-number');if(number)number.textContent=String(i+1).padStart(2,'0');
  button.addEventListener('click',event=>{if(state!=='choose'||(event.detail>0&&performance.now()-lastDrag<450))return;if(event.detail===0||i===Math.round(position))void select(i);else move(i);});
  button.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();move(event.key==='Home'?0:event.key==='End'?buttons.length-1:center+(event.key==='ArrowRight'?1:-1),true);}});
 });
 find('[data-previous]').addEventListener('click',()=>move(center-1));find('[data-next]').addEventListener('click',()=>move(center+1));
 root.querySelectorAll<HTMLInputElement>('input[name="oracle-theme"]').forEach(input=>input.addEventListener('change',()=>{start();track('oracle_theme_select',{theme:input.value});}));
 root.querySelectorAll('[data-reset]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();find<HTMLTextAreaElement>('#notebook-words').value='';sequence++;state='choose';root.dataset.state=state;results.hidden=true;if(reading)reading.hidden=true;choose.hidden=false;reveal.hidden=true;
  buttons.forEach(b=>{b.disabled=false;b.classList.remove('fan-selected');});root.querySelectorAll<HTMLInputElement>('input[name="oracle-theme"]').forEach(input=>input.disabled=false);
  draw();find<HTMLInputElement>('input[name="oracle-theme"]:checked').focus({preventScroll:true});scrollTo(root);
 }));
 root.querySelectorAll('[data-open-notebook]').forEach(button=>button.addEventListener('click',()=>{
  if(!reading)return;find('[data-notebook-question]').textContent=reading.querySelector('[data-question]')!.textContent;find('[data-notebook-date]').textContent=jstDate().replaceAll('-',' / ');
  results.hidden=true;notebook.hidden=false;root.dataset.state='notebook';state='notebook';scrollTo(root);find('#notebook-heading').focus({preventScroll:true});
 }));
 find('[data-return-result]').addEventListener('click',()=>{notebook.hidden=true;results.hidden=false;root.dataset.state='result';state='result';scrollTo(results);reading?.querySelector<HTMLElement>('[data-open-notebook]')?.focus({preventScroll:true});});
 window.addEventListener('resize',()=>{if(state==='choose')draw();},{passive:true});
 motion.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;position=target;spring=0;draw();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;gesture=null;upward=0;position=target;draw();}});
 settle();draw();root.dataset.ready='true';
 const entrance=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){fan.classList.add('fan-entered');entrance.disconnect();}},{threshold:.12});entrance.observe(fan);
}
