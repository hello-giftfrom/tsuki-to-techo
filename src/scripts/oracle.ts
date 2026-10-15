import {cards} from '../data/cards';
import {track} from '../utils/analytics';
export function initOracle(root:HTMLElement){
 if(root.dataset.ready)return;root.dataset.ready='true';
 const buttons=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-draw]'));
 const choose=root.querySelector<HTMLElement>('[data-choose]')!;
 const results=root.querySelector<HTMLElement>('[data-results]')!;
 const readings=Array.from(root.querySelectorAll<HTMLElement>('[data-reading]'));
 const status=root.querySelector<HTMLElement>('[data-status]')!;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let hand:typeof cards=[];let busy=false;
 // Rejection sampling avoids modulo bias, followed by a Fisher–Yates shuffle.
 function randomInt(n:number){const max=2**32;const limit=max-max%n;const word=new Uint32Array(1);do{crypto.getRandomValues(word);}while(word[0]>=limit);return word[0]%n;}
 function deal(){hand=[...cards];for(let i=hand.length-1;i>0;i--){const j=randomInt(i+1);[hand[i],hand[j]]=[hand[j],hand[i]];}hand=hand.slice(0,5);buttons.forEach(b=>{b.disabled=false;b.classList.remove('lifting','flipping');});status.textContent='準備ができたら、一枚を選んでください。';}
 const pause=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,reduced.matches?0:ms));
 buttons.forEach((button,index)=>button.addEventListener('click',async()=>{
  if(busy)return;busy=true;buttons.forEach(b=>b.disabled=true);const card=hand[index];
  track('oracle_start');track('card_select',{card_id:card.id});status.textContent='カードをひらいています。';
  button.classList.add('lifting');await pause(180);button.classList.add('flipping');await pause(380);
  choose.hidden=true;results.hidden=false;root.dataset.state='result';document.body.classList.remove('dark-page');
  readings.forEach(el=>{el.hidden=Number(el.dataset.reading)!==card.id;});
  const reading=readings.find(el=>Number(el.dataset.reading)===card.id)!;
  reading.querySelector<HTMLImageElement>('img')?.setAttribute('loading','eager');
  reading.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});root.scrollIntoView({behavior:'instant',block:'start'});
  track('card_result',{card_id:card.id});track('journal_prompt_view',{location:'result'});
 }));
 root.querySelectorAll<HTMLButtonElement>('[data-reset]').forEach(button=>button.addEventListener('click',()=>{
  results.hidden=true;readings.forEach(el=>el.hidden=true);choose.hidden=false;root.dataset.state='choose';document.body.classList.add('dark-page');busy=false;deal();
  root.scrollIntoView({behavior:'instant',block:'start'});buttons[0].focus({preventScroll:true});
 }));deal();
}
