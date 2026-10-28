import http from 'node:http';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {timingSafeEqual,randomBytes} from 'node:crypto';
import QRCode from 'qrcode';
import {Store,sha,id} from './lib/store.mjs';
import {verifyPayment,paymentUri} from './lib/payment.mjs';
import {bootstrap} from './lib/bootstrap.mjs';
import {generateComic} from './lib/ai.mjs';

const root=fileURLToPath(new URL('.',import.meta.url)),data=resolve(process.env.KOMA_DATA_DIR||join(root,'.data'));
const store=new Store(data);await mkdir(join(data,'art'),{recursive:true});
const adminfile=join(data,'creator.key');if(!existsSync(adminfile))writeFileSync(adminfile,randomBytes(24).toString('base64url'),{mode:0o600,flag:'wx'});
const admin=process.env.KOMA_CREATOR_TOKEN||readFileSync(adminfile,'utf8').trim();
await bootstrap(store,root);
const assets=new Map([['/','index.html'],['/app.js','app.js'],['/style.css','style.css']]);
const rates=new Map(),checking=new Set();
const aiRunning=new Set();store.run("UPDATE ai_jobs SET status='failed',error='Server restarted; unfinished generation was not billed again automatically.' WHERE status IN ('writing','drawing')");
const secure=process.env.NODE_ENV==='production';
function equal(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function json(res,status,body){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(body));}
function bad(code,status=400){const e=new Error(code);e.status=status;throw e;}
async function body(req){let size=0,parts=[];for await(const part of req){size+=part.length;if(size>12*1024*1024)bad('BODY_TOO_LARGE',413);parts.push(part);}try{return JSON.parse(Buffer.concat(parts).toString()||'{}');}catch{bad('INVALID_JSON');}}
function text(value,name,max=2000){if(typeof value!=='string'||!value.trim()||value.length>max)bad('INVALID_'+name);return value.trim();}
function amount(value,name='AMOUNT'){if(!Number.isSafeInteger(value)||value<10000||value>100000000)bad('INVALID_'+name);return value;}
function auth(req){const token=(req.headers.cookie||'').match(/(?:^|; )koma_creator=([^;]+)/)?.[1];if(!token||!equal(token,sha(admin)))bad('CREATOR_LOGIN_REQUIRED',401);}
function throttle(req){const key=sha(req.socket.remoteAddress||'unknown'),now=Date.now(),r=rates.get(key)||{n:0,at:now};if(now-r.at>60000){r.n=0;r.at=now;}if(++r.n>90)bad('SLOW_DOWN',429);rates.set(key,r);if(rates.size>5000)rates.clear();}
function session(req,res){let token=(req.headers.cookie||'').match(/(?:^|; )koma_reader=([A-Za-z0-9_-]{32,64})(?:;|$)/)?.[1];if(!token){token=randomBytes(32).toString('base64url');res.setHeader('Set-Cookie',`koma_reader=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${secure?'; Secure':''}`);}return sha(token);}
const seriesView=(s,sid)=>{const c=store.get('SELECT name,address FROM creators WHERE id=?',s.creator);return {...s,creatorName:c.name,address:c.address,supported:store.support(sid,s.id),backed:store.get("SELECT COALESCE(SUM(amount),0) AS n FROM orders WHERE series=? AND kind='back' AND status='paid'",s.id).n,episodes:store.all('SELECT id,title,summary,price,provenance FROM episodes WHERE series=? ORDER BY created',s.id).map(e=>({...e,unlocked:store.entitled(sid,e.id)})),rounds:store.all('SELECT * FROM rounds WHERE series=? ORDER BY closes DESC',s.id).map(r=>({...r,choices:JSON.parse(r.choices),mine:store.get('SELECT choice FROM votes WHERE round=? AND session=?',r.id,sid)?.choice??null,results:store.all('SELECT choice,COUNT(*) AS count FROM votes WHERE round=? GROUP BY choice',r.id),closed:Date.now()>=r.closes}))};};

const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
 res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
 try {
  const url=new URL(req.url,'http://localhost'),path=url.pathname;
  if(req.method==='POST'){
   const origin=req.headers.origin;if(origin&&new URL(origin).host!==req.headers.host)bad('CROSS_ORIGIN_REQUEST',403);
   if(!(req.headers['content-type']||'').startsWith('application/json'))bad('JSON_REQUIRED',415);
   throttle(req);
  }
  if(req.method==='GET'&&assets.has(path)){const f=assets.get(path);const b=await readFile(join(root,'public',f));res.writeHead(200,{'content-type':f.endsWith('.css')?'text/css':f.endsWith('.js')?'text/javascript':'text/html; charset=utf-8','cache-control':'no-cache'});res.end(b);return;}
  if(req.method==='GET'&&path==='/fonts/Anton-Regular.ttf'){res.writeHead(200,{'content-type':'font/ttf','cache-control':'public, max-age=604800'});res.end(await readFile(join(root,'public/fonts/Anton-Regular.ttf')));return;}
  if(path.startsWith('/api/')){
   const sid=session(req,res);
   const walletPay=path.match(/^\/api\/wallet-pay\/([A-Za-z0-9_-]+)$/);
   if(req.method==='GET'&&walletPay){
    throttle(req);const o=store.get('SELECT * FROM orders WHERE id=?',walletPay[1]);if(!o)bad('ORDER_NOT_FOUND',404);
    const c=store.get('SELECT c.* FROM creators c JOIN series s ON s.creator=c.id WHERE s.id=?',o.series);
    const header=req.headers['x-payment'];
    if(!header)return json(res,402,{x402Version:1,accepts:[{scheme:'zcash-shielded',network:'zcash-testnet',maxAmountRequired:String(o.amount),payTo:c.address,asset:'ZEC',extra:{memoNonce:o.memo,expiresAt:Math.floor(Date.now()/1000)+3600,paymentUri:paymentUri(c.address,o.amount,o.memo)}}],error:'Payment required'});
    if(typeof header!=='string'||header.length>4096)bad('INVALID_PAYMENT_HEADER');let p;try{p=JSON.parse(Buffer.from(header,'base64').toString());}catch{bad('INVALID_PAYMENT_HEADER');}
    if(p.x402Version!==1||p.scheme!=='zcash-shielded'||p.network!=='zcash-testnet'||p.payload?.memoNonce!==o.memo||!/^[0-9a-f]{64}$/.test(p.payload?.txid||''))bad('INVALID_PAYMENT_HEADER');
    const txid=p.payload.txid;if(o.status==='paid'&&o.txhash!==sha(txid))bad('ORDER_ALREADY_PAID',409);
    if(o.status!=='paid'){
     if(checking.size>=3||checking.has(o.id))bad('VERIFIER_BUSY',429);checking.add(o.id);
     try{const r=await verifyPayment({order:o,uivk:store.open(c.uivk),txid});if(!r.paid)return json(res,402,{x402Version:1,error:'Payment awaiting verification',reasons:r.reasons});store.settle(o.id,o.session,txid);}finally{checking.delete(o.id);}
    }
    res.setHeader('X-PAYMENT-RESPONSE',Buffer.from(JSON.stringify({success:true,network:'zcash-testnet',transaction:txid,payer:''})).toString('base64'));
    return json(res,200,{paid:true,invoice:o.id,episode:o.episode,access:'Entitlement belongs to the original browser session that requested this invoice.'});
   }
   if(req.method==='GET'&&path==='/api/status')return json(res,200,{name:'KOMA',network:'Zcash testnet',series:store.get('SELECT COUNT(*) AS n FROM series').n,paymentVerification:'Hanko incoming-viewing-key verification',aiConfigured:!!process.env.FAL_KEY,creatorLoggedIn:!!((req.headers.cookie||'').includes('koma_creator='+sha(admin)))});
   if(req.method==='GET'&&path==='/api/series')return json(res,200,{series:store.catalog()});
   if(req.method==='POST'&&path==='/api/creator/login'){const b=await body(req);if(typeof b.token!=='string'||!equal(b.token,admin))bad('INVALID_CREATOR_KEY',401);res.setHeader('Set-Cookie',`koma_creator=${sha(admin)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure?'; Secure':''}`);return json(res,200,{ok:true});}
   if(req.method==='POST'&&path==='/api/creator/logout'){res.setHeader('Set-Cookie','koma_creator=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(res,200,{ok:true});}
   if(req.method==='POST'&&path==='/api/creators'){
    auth(req);const b=await body(req);const address=text(b.address,'ADDRESS',1000),uivk=text(b.uivk,'UIVK',4000);
    if(!/^utest1[0-9a-z]+$/.test(address)||!/^(uivktest|uvitest)1[0-9a-z]+$/.test(uivk))bad('TESTNET_SHIELDED_ADDRESS_AND_INCOMING_KEY_REQUIRED');
    return json(res,201,{id:store.creator({name:text(b.name,'NAME',100),address,uivk})});
   }
   if(req.method==='GET'&&path==='/api/creators'){auth(req);return json(res,200,{creators:store.all('SELECT id,name,address FROM creators')});}
   if(req.method==='POST'&&path==='/api/ai'){
    auth(req);if(!process.env.FAL_KEY)bad('Setup required: FAL_KEY for real AI generation',503);if(aiRunning.size)bad('AI_STUDIO_BUSY',429);
    const b=await body(req),s=store.get('SELECT * FROM series WHERE id=?',b.series);if(!s)bad('SERIES_NOT_FOUND');
    const job={id:id(),session:sid,series:s.id,prompt:text(b.prompt,'PROMPT',1500)};
    store.run('INSERT INTO ai_jobs(id,session,series,prompt,status,created) VALUES (?,?,?,?,?,?)',job.id,sid,s.id,job.prompt,'writing',Date.now());
    aiRunning.add(job.id);generateComic({store,job,series:s,key:process.env.FAL_KEY}).then(result=>store.run("UPDATE ai_jobs SET status='ready',result=? WHERE id=?",JSON.stringify(result),job.id)).catch(e=>store.run("UPDATE ai_jobs SET status='failed',error=? WHERE id=?",String(e.message).slice(0,300),job.id)).finally(()=>aiRunning.delete(job.id));
    return json(res,202,{id:job.id,status:'writing'});
   }
   const aiMatch=path.match(/^\/api\/ai\/([A-Za-z0-9_-]+)$/);
   if(req.method==='GET'&&aiMatch){auth(req);const j=store.get('SELECT id,status,result,error FROM ai_jobs WHERE id=? AND session=?',aiMatch[1],sid);if(!j)bad('JOB_NOT_FOUND',404);return json(res,200,{...j,result:j.result?JSON.parse(j.result):null});}
   if(req.method==='POST'&&path==='/api/series'){
    auth(req);const b=await body(req);if(!store.get('SELECT id FROM creators WHERE id=?',b.creator))bad('CREATOR_NOT_FOUND');
    return json(res,201,{id:store.series({creator:b.creator,title:text(b.title,'TITLE',100),pitch:text(b.pitch,'PITCH',1000),character:text(b.character,'CHARACTER',500),genre:text(b.genre,'GENRE',40),goal:amount(b.goal,'GOAL')})});
   }
   const seriesMatch=path.match(/^\/api\/series\/([A-Za-z0-9_-]+)$/);
   if(req.method==='GET'&&seriesMatch){const s=store.get('SELECT * FROM series WHERE id=?',seriesMatch[1]);if(!s)bad('SERIES_NOT_FOUND',404);return json(res,200,seriesView(s,sid));}
   if(req.method==='POST'&&path==='/api/episodes'){
    auth(req);const b=await body(req);if(!store.get('SELECT id FROM series WHERE id=?',b.series))bad('SERIES_NOT_FOUND');
    if(!Array.isArray(b.pages)||b.pages.length<1||b.pages.length>8)bad('ONE_TO_EIGHT_PAGES_REQUIRED');
    for(const p of b.pages){if(!Array.isArray(p.panels)||p.panels.length<1||p.panels.length>8)bad('INVALID_PANELS');for(const panel of p.panels){if(typeof panel.img!=='string'||!/^\/art\/[A-Za-z0-9_.-]+$/.test(panel.img))bad('UPLOAD_ART_FIRST');panel.alt=text(panel.alt,'ALT',1000);if(panel.balloons&&!Array.isArray(panel.balloons))bad('INVALID_BALLOONS');}}
    const eid=store.episode({series:b.series,title:text(b.title,'TITLE',100),summary:text(b.summary,'SUMMARY',1000),price:amount(b.price,'PRICE'),pages:b.pages,provenance:text(b.provenance,'PROVENANCE',1000)});
    const img=b.pages[0].panels[0].img;store.run('UPDATE series SET cover=COALESCE(cover,?) WHERE id=?',img,b.series);
    return json(res,201,{id:eid});
   }
   if(req.method==='POST'&&path==='/api/art'){
    auth(req);const b=await body(req);if(typeof b.data!=='string'||!/^data:image\/(jpeg|png|webp);base64,/.test(b.data))bad('JPEG_PNG_WEBP_REQUIRED');
    const [,type,encoded]=b.data.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/)||[];if(!encoded)bad('INVALID_IMAGE');
    const bytes=Buffer.from(encoded,'base64');if(bytes.length>6*1024*1024||bytes.length<20)bad('INVALID_IMAGE_SIZE');
    const magic=type==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):type==='jpeg'?bytes[0]===255&&bytes[1]===216:bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';if(!magic)bad('INVALID_IMAGE_SIGNATURE');
    const name=id()+'.'+type;await writeFile(join(data,'art',name),bytes,{flag:'wx'});return json(res,201,{path:'/art/'+name});
   }
   if(req.method==='POST'&&path==='/api/rounds'){
    auth(req);const b=await body(req);if(!store.get('SELECT id FROM series WHERE id=?',b.series))bad('SERIES_NOT_FOUND');
    if(!Array.isArray(b.choices)||b.choices.length<2||b.choices.length>4)bad('TWO_TO_FOUR_CHOICES_REQUIRED');const choices=b.choices.map(c=>text(c,'CHOICE',200));
    if(!Number.isSafeInteger(b.minutes)||b.minutes<1||b.minutes>43200)bad('INVALID_VOTING_WINDOW');
    const rid=id();store.run('INSERT INTO rounds VALUES (?,?,?,?,?)',rid,b.series,text(b.question,'QUESTION',300),JSON.stringify(choices),Date.now()+b.minutes*60000);return json(res,201,{id:rid});
   }
   if(req.method==='POST'&&path==='/api/votes'){const b=await body(req);store.vote(text(b.round,'ROUND',100),sid,b.choice);return json(res,200,{ok:true});}
   if(req.method==='POST'&&path==='/api/orders'){
    const b=await body(req),kind=b.kind;if(!['back','episode'].includes(kind))bad('INVALID_ORDER_KIND');
    const s=store.get('SELECT * FROM series WHERE id=?',b.series);if(!s)bad('SERIES_NOT_FOUND',404);
    let cost,episode=null;if(kind==='episode'){episode=store.get('SELECT * FROM episodes WHERE id=? AND series=?',b.episode,s.id);if(!episode)bad('EPISODE_NOT_FOUND',404);cost=episode.price;}else cost=amount(b.amount);
    if(store.get("SELECT COUNT(*) AS n FROM orders WHERE session=? AND status='pending' AND created>?",sid,Date.now()-3600000).n>=12)bad('TOO_MANY_OPEN_INVOICES',429);
    const o=store.order(sid,s.id,episode?.id,kind,cost),c=store.get('SELECT address FROM creators WHERE id=?',s.creator),uri=paymentUri(c.address,o.amount,o.memo);
    return json(res,201,{id:o.id,kind,amount:o.amount,memo:o.memo,address:c.address,paymentUri:uri,qr:await QRCode.toDataURL(uri,{width:360,margin:2}),network:'Zcash testnet',title:episode?.title||s.title});
   }
   const orderMatch=path.match(/^\/api\/orders\/([A-Za-z0-9_-]+)\/verify$/);
   if(req.method==='POST'&&orderMatch){
    const b=await body(req),txid=text(b.txid,'TXID',64).toLowerCase();if(!/^[0-9a-f]{64}$/.test(txid))bad('INVALID_TXID');
    const o=store.get('SELECT * FROM orders WHERE id=? AND session=?',orderMatch[1],sid);if(!o)bad('ORDER_NOT_FOUND',404);
    if(o.status==='paid'){if(o.txhash!==sha(txid))bad('ORDER_ALREADY_PAID',409);return json(res,200,{paid:true,series:o.series,episode:o.episode});}
    if(checking.size>=3||checking.has(o.id))bad('VERIFIER_BUSY',429);checking.add(o.id);
    try {
     const c=store.get('SELECT c.* FROM creators c JOIN series s ON s.creator=c.id WHERE s.id=?',o.series);
     const r=await verifyPayment({order:o,uivk:store.open(c.uivk),txid});if(!r.paid)return json(res,402,r);
     store.settle(o.id,sid,txid);return json(res,200,{paid:true,series:o.series,episode:o.episode});
    }finally{checking.delete(o.id);}
   }
   const episodeMatch=path.match(/^\/api\/episodes\/([A-Za-z0-9_-]+)$/);
   if(req.method==='GET'&&episodeMatch){const e=store.get('SELECT * FROM episodes WHERE id=?',episodeMatch[1]);if(!e)bad('EPISODE_NOT_FOUND',404);if(!store.entitled(sid,e.id))bad('PAYMENT_REQUIRED',402);return json(res,200,{...e,pages:JSON.parse(e.pages)});}
   if(req.method==='GET'&&path==='/api/receipts'){const rows=store.all("SELECT o.id,o.kind,o.amount,o.series,o.episode,o.paid,s.title FROM orders o JOIN series s ON s.id=o.series WHERE o.session=? AND o.status='paid' ORDER BY paid DESC",sid);return json(res,200,{receipts:rows});}
   bad('NOT_FOUND',404);
  }
  if(req.method==='GET'&&/^\/art\/[A-Za-z0-9_.-]+$/.test(path)){
   // Only a catalog cover is public. Every other panel requires an actual paid episode.
   const sid=session(req,res),publicCover=store.get('SELECT 1 FROM series WHERE cover=?',path);
   const isCreator=!!((req.headers.cookie||'').includes('koma_creator='+sha(admin)));
   if(!publicCover&&!isCreator){const matches=store.all('SELECT id,pages FROM episodes').filter(e=>JSON.parse(e.pages).some(p=>p.panels.some(pn=>pn.img===path)));if(!matches.some(e=>store.entitled(sid,e.id)))bad('PAYMENT_REQUIRED',402);}
   const file=join(data,'art',path.slice(5));const b=await readFile(file);res.writeHead(200,{'content-type':extname(file)==='.png'?'image/png':extname(file)==='.webp'?'image/webp':'image/jpeg','cache-control':'private, no-store'});res.end(b);return;
  }
  bad('NOT_FOUND',404);
 }catch(error){const known=['ORDER_NOT_FOUND','PAYMENT_ALREADY_USED','ORDER_ALREADY_PAID','SUPPORT_REQUIRED','VOTING_CLOSED','ROUND_NOT_FOUND','INVALID_CHOICE'];const status=error.status||(known.includes(error.message)?409:error.code==='ENOENT'?404:503);json(res,status,{error:status===503&&!error.status?'SERVICE_UNAVAILABLE':error.message});}
});
const port=Number(process.env.PORT||4327);server.listen(port,'0.0.0.0',()=>console.log(`KOMA Zcash testnet on port ${port}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{store.close();process.exit(0);}));
