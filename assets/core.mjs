export const normalizeDigits = value => String(value).replace(/[٠-٩۰-۹]/g, x => String(x.charCodeAt(0) - (x.charCodeAt(0)>=0x6f0 ? 0x6f0 : 0x660)));
export const digitSum = n => [...String(n)].reduce((s,x)=>s+Number(x),0);
export function reduce22(n) { if(!Number.isSafeInteger(n)||n<1) throw Error('positive integer'); while(n>22)n=digitSum(n); return n; }
export function parseDate(value,today=new Date()) {
 const m=/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/.exec(normalizeDigits(value).trim());
 if(!m)throw Error('date');const [d,mo,y]=m.slice(1).map(Number),v=new Date(Date.UTC(y,mo-1,d));
 if(y<1583||v.getUTCFullYear()!==y||v.getUTCMonth()!==mo-1||v.getUTCDate()!==d||y*10000+mo*100+d>today.getFullYear()*10000+(today.getMonth()+1)*100+today.getDate())throw Error('date');
 return{d,mo,y};
}
export function matrix({d,mo,y}) {const A=reduce22(d),B=mo,C=reduce22(digitSum(y)),D=reduce22(A+B+C),E=reduce22(A+B+C+D);return{A,B,C,D,E,F:reduce22(A+B),G:reduce22(B+C),H:reduce22(C+D),I:reduce22(D+A)};}
function finite(n,min=0,max=Number.MAX_SAFE_INTEGER){if(!Number.isFinite(n)||n<min||n>max)throw Error('range');return n;}
export function expected(turnover,rtp,fee){finite(turnover);finite(rtp,0,100);finite(fee);return{gross:turnover*rtp/100,loss:turnover*(1-rtp/100)+fee,edge:100-rtp};}
export function rake({total,excluded,rate,cap=null,fee}){finite(total);finite(excluded,0,total);finite(rate,0,100);finite(fee);if(cap!==null)finite(cap);const eligible=total-excluded,raw=eligible*rate/100,credited=cap===null?raw:Math.min(raw,cap),net=credited-fee;return{eligible,raw,credited,net,cost:total-net,effective:total?net/total*100:null};}
export function parseCSV(text){
 if(typeof text!=='string'||text.length>1000000)throw Error('size');
 const rows=[];let row=[],field='',quoted=false,afterQuote=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;afterQuote=true;}}else field+=c;continue;}
 if(c==='"'){if(field||afterQuote)throw Error('quotes');quoted=true;continue;}
 if(c===','){row.push(field);field='';afterQuote=false;}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field='';afterQuote=false;}else{if(afterQuote&&!/\s/.test(c))throw Error('quotes');field+=c;}}
 if(quoted)throw Error('quotes');row.push(field);if(row.some(x=>x.trim()))rows.push(row);
 if(rows.length<2||rows.length>20001)throw Error('rows');
 if(rows[0].map(x=>x.trim().replace(/^\uFEFF/,'').toLowerCase()).join(',')!=='stake,payout')throw Error('header');
 return rows.slice(1).map((r,i)=>{if(r.length!==2||r.some(x=>x.trim()===''||!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(x.trim())))throw Error('row '+(i+2));const [stake,payout]=r.map(Number);finite(stake,Number.MIN_VALUE,1e12);finite(payout,0,1e12);return{stake,payout};});
}
export function observed(rows){if(!rows.length)throw Error('empty');let stake=0,payout=0;for(const r of rows){finite(r.stake,Number.MIN_VALUE);finite(r.payout);stake+=r.stake;payout+=r.payout;}finite(stake,Number.MIN_VALUE);finite(payout);return{stake,payout,rtp:100*payout/stake,count:rows.length,net:payout-stake};}
export function shuffledPairs(random=Math.random){const a=Array.from({length:16},(_,i)=>i%8);for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
