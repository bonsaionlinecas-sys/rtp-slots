import {parseDate,matrix,digitSum,reduce22,expected,rake,parseCSV,observed,shuffledPairs} from './core.mjs';
const c=JSON.parse(document.querySelector('#site-config').textContent),$=id=>document.getElementById(id);
document.documentElement.classList.add('js');
const fmt=(n,d=2)=>new Intl.NumberFormat(c.locale,{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const error=(message='')=>{$('error').textContent=message;};
const read=id=>{const x=$(id);if(!x.value.trim())throw Error('empty');const n=Number(x.value);if(!Number.isFinite(n))throw Error('finite');return n;};
const ledger=rows=>{const dl=$('result-ledger');dl.replaceChildren(...rows.map(([key,val])=>{const wrap=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=val;wrap.append(dt,dd);return wrap;}));};
if(c.type==='matrix'){
 const calc=()=>{try{const date=parseDate($('date').value),v=matrix(date);$('date').removeAttribute('aria-invalid');error();$('result-heading').textContent=`${fmt(date.d,0)}/${fmt(date.mo,0)}/${fmt(date.y,0)}`;document.querySelectorAll('.result [data-node]').forEach(n=>n.textContent=fmt(v[n.dataset.node],0));$('map-values').replaceChildren(...Object.entries(v).map(([k,value])=>{const span=document.createElement('span');span.textContent=`${k} ${fmt(value,0)}`;return span;}));$('operations').textContent=`A=R(${date.d})=${v.A} · B=${v.B} · C=R(${digitSum(date.y)})=${v.C}\nD=R(${v.A}+${v.B}+${v.C})=${v.D}\nE=R(${v.A}+${v.B}+${v.C}+${v.D})=${v.E}\nF=R(${v.A}+${v.B})=${v.F} · G=R(${v.B}+${v.C})=${v.G}\nH=R(${v.C}+${v.D})=${v.H} · I=R(${v.D}+${v.A})=${v.I}`;
 }catch{$('date').setAttribute('aria-invalid','true');error(c.t.invalid);}};
 $('matrix-form').addEventListener('submit',e=>{e.preventDefault();calc();});
 $('date-example').addEventListener('click',()=>{$('date').value='29/02/2000';calc();});
 $('print').addEventListener('click',()=>window.print());
}
if(c.type==='casino'){
 $('casino-form').addEventListener('submit',e=>{e.preventDefault();try{const turnover=read('turnover'),a=expected(turnover,read('rtp-a'),read('fee-a')),b=expected(turnover,read('rtp-b'),read('fee-b'));error();$('main-value').textContent=fmt(a.loss);ledger([['A · theoretical gross return',fmt(a.gross)],['A · loss before fees',fmt(turnover*a.edge/100)],['A · fixed fee',fmt(read('fee-a'))],['B · total expected cost',fmt(b.loss)],['A cost − B cost',fmt(a.loss-b.loss)]]);$('cost-meter').style.width=a.edge+'%';$('result-note').textContent=`Scenario A: ${fmt(a.edge)}% theoretical loss before fees. Difference can be negative when A has the lower expected cost.`;}catch{error(c.t.invalid);}});
}
if(c.type==='rake'){
 $('rake-form').addEventListener('submit',e=>{e.preventDefault();try{const r=rake({total:read('total'),excluded:read('excluded'),rate:read('rate'),cap:$('cap').value.trim()===''?null:read('cap'),fee:read('fee')});error();$('main-value').textContent=fmt(r.net);ledger([[c.t.eligible,fmt(r.eligible)],[c.t.raw,fmt(r.raw)],[c.t.credited,fmt(r.credited)],[c.t.cost,fmt(r.cost)]]);$('result-note').textContent=c.t.effective+': '+(r.effective===null?'—':fmt(r.effective)+'%');$('cost-meter').style.width=(r.effective===null?0:Math.max(0,Math.min(100,r.effective)))+'%';}catch{error(c.t.invalid);}});
}
if(c.type==='rtp'){
 const calc=()=>{try{const r=observed(parseCSV($('csv').value));error();$('csv').removeAttribute('aria-invalid');$('main-value').textContent=fmt(r.rtp)+'%';ledger([['Rows',fmt(r.count,0)],['Total stakes',fmt(r.stake)],['Total gross payouts',fmt(r.payout)],['Payouts − stakes',fmt(r.net)]]);$('result-note').textContent=`${fmt(r.payout)} / ${fmt(r.stake)} × 100 = ${fmt(r.rtp)}%. This describes the supplied sample only.`;}catch{$('csv').setAttribute('aria-invalid','true');error(c.t.invalid);}};
 $('rtp-form').addEventListener('submit',e=>{e.preventDefault();calc();});$('csv-example').addEventListener('click',()=>{$('csv').value='stake,payout\n1,2\n9,0';calc();});
}
if(c.type==='games'){
 const gameById=new Map(c.games.map(g=>[g.id,g])),cards=[...document.querySelectorAll('.game-card')];let favoriteSet=new Set(),onlyFavorite=false,limit=24,sort='original',search='';
 const storageKey='bonsai-favorites-'+c.slug;
 try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))favoriteSet=new Set(saved.filter(id=>gameById.has(id)));}catch{}
 const setFavorites=()=>{document.querySelectorAll('[data-favorite]').forEach(b=>{const g=gameById.get(b.dataset.favorite),on=favoriteSet.has(g.id);b.textContent=on?'★':'☆';b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',`${on?c.t.remove:c.t.save}: ${g.title}`);});};
 const filter=()=>{const selected=cards.filter(card=>card.dataset.title.toLocaleLowerCase().includes(search)&&(!onlyFavorite||favoriteSet.has(card.dataset.id)));selected.sort((a,b)=>sort==='original'?Number(a.dataset.order)-Number(b.dataset.order):(sort==='az'?1:-1)*a.dataset.title.localeCompare(b.dataset.title));cards.forEach(x=>x.hidden=true);selected.forEach((x,i)=>{x.hidden=i>=limit;$('games').append(x);});$('catalog-count').textContent=`${Math.min(limit,selected.length)} / ${selected.length} · ${c.games.length} ${c.rtl?'لعبة في القائمة':'játék a listában'}`;$('empty').hidden=selected.length!==0;$('more').hidden=limit>=selected.length;};
 $('search').addEventListener('input',e=>{search=e.target.value.trim().toLocaleLowerCase();limit=24;filter();});$('sort').addEventListener('change',e=>{sort=e.target.value;filter();});$('favorite-filter').addEventListener('click',()=>{onlyFavorite=!onlyFavorite;$('favorite-filter').setAttribute('aria-pressed',String(onlyFavorite));limit=24;filter();});$('more').addEventListener('click',()=>{limit+=24;filter();});
 document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{$('search').value=b.dataset.preset;search=b.dataset.preset;onlyFavorite=false;$('favorite-filter').setAttribute('aria-pressed','false');limit=24;filter();$('search').focus();}));
 let lastPlayButton;
 const close=()=>{$('game-frame').replaceChildren();$('player').hidden=true;if(lastPlayButton&&!lastPlayButton.closest('[hidden]'))lastPlayButton.focus();};
 $('games').addEventListener('click',e=>{const favorite=e.target.closest('[data-favorite]');if(favorite){const id=favorite.dataset.favorite;favoriteSet.has(id)?favoriteSet.delete(id):favoriteSet.add(id);try{localStorage.setItem(storageKey,JSON.stringify([...favoriteSet]));}catch{}setFavorites();filter();return;}
 const button=e.target.closest('[data-play]');if(!button)return;const game=gameById.get(button.dataset.play);if(!game)return;const u=new URL(game.embedUrl);if(u.protocol!=='https:'||u.hostname!=='playgama.com'||!u.pathname.startsWith('/export/game/'))return;
 lastPlayButton=button;$('game-frame').replaceChildren();const iframe=document.createElement('iframe');iframe.title=game.title;iframe.src=u.href;iframe.allow='autoplay; fullscreen; gamepad';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';$('player-title').textContent=game.title;$('game-frame').append(iframe);$('player').hidden=false;$('player').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('close-game').focus();});
 $('close-game').addEventListener('click',close);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('player').hidden)close();});setFavorites();filter();
 const symbols=['●','◆','♥','☀','✿','★','☂','♫'];let deck=[],open=[],found=new Set(),moves=0,generation=0;
 const updateScore=()=>{$('memory-score').textContent=`${c.t.moves}: ${fmt(moves,0)} · ${c.t.matched}: ${fmt(found.size/2,0)}/8${found.size===16?' · '+c.t.done:''}`;};
 const reveal=(i,on)=>{const b=$('memory-board').children[i];b.dataset.open=String(on);b.textContent=on?symbols[deck[i]]:'?';b.setAttribute('aria-label',on?symbols[deck[i]]:c.t.back+' '+(i+1));};
 const start=()=>{generation++;deck=shuffledPairs();open=[];found=new Set();moves=0;$('memory-board').replaceChildren(...deck.map((_,i)=>{const b=document.createElement('button');b.type='button';b.className='memory-cell';b.textContent='?';b.setAttribute('aria-label',c.t.back+' '+(i+1));b.addEventListener('click',()=>{if(open.length===2||open.includes(i)||found.has(i))return;open.push(i);reveal(i,true);if(open.length===2){moves++;if(deck[open[0]]===deck[open[1]]){open.forEach(n=>{found.add(n);$('memory-board').children[n].disabled=true;});open=[];updateScore();}else{const thisGeneration=generation;setTimeout(()=>{if(generation!==thisGeneration)return;open.forEach(n=>reveal(n,false));open=[];},850);}updateScore();}});return b;}));updateScore();};
 $('memory-new').addEventListener('click',start);start();
}
