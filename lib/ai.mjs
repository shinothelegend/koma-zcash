import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {id} from './store.mjs';

const clean=(s,n)=>String(s||'').replace(/\s+/g,' ').trim().slice(0,n);
export async function generateComic({store,job,series,key}){
 const reserve=0.10,cap=Math.min(0.5,Number(process.env.KOMA_AI_BUDGET_USD||0.5));
 store.db.exec('CREATE TABLE IF NOT EXISTS ai_budget(job TEXT PRIMARY KEY,reserved REAL NOT NULL,created INTEGER NOT NULL)');
 const used=store.get('SELECT COALESCE(SUM(reserved),0) AS n FROM ai_budget').n;
 if(used+reserve>cap+0.000001)throw new Error('AI_BUDGET_REACHED');
 // Reserve before any paid request; failures retain the reservation and cannot silently spend twice.
 store.run('INSERT INTO ai_budget VALUES (?,?,?)',job.id,reserve,Date.now());
 const r=await fetch('https://fal.run/openrouter/router/openai/v1/chat/completions',{method:'POST',headers:{Authorization:'Key '+key,'content-type':'application/json'},signal:AbortSignal.timeout(120000),body:JSON.stringify({model:'moonshotai/kimi-k2.6',max_tokens:2000,reasoning:{enabled:false},response_format:{type:'json_object'},messages:[{role:'system',content:'Write an original, family-friendly 4-panel comic as JSON only. No real people or copyrighted characters. Shape: {title,logline,panels:[{shot,alt,caption}]}. Exactly four panels, one memorable consistent lead. Each shot repeats the lead visual description, is an illustration prompt, and requests no lettering. Each caption is at most 65 characters. The final panel lands a satisfying twist.'},{role:'user',content:`Series: ${series.title}. Character: ${series.character}. Pitch: ${series.pitch}. New chapter: ${job.prompt}`}]})});
 if(!r.ok)throw new Error('SCRIPT_PROVIDER_'+r.status);
 const result=await r.json(),raw=result.choices?.[0]?.message?.content||'';let script;
 try{script=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));}catch{throw new Error('SCRIPT_FORMAT_INVALID');}
 if(!Array.isArray(script.panels)||script.panels.length!==4)throw new Error('SCRIPT_REQUIRES_FOUR_PANELS');
 store.run("UPDATE ai_jobs SET status='drawing' WHERE id=?",job.id);
 const panels=[];
 for(let i=0;i<4;i++){
  const p=script.panels[i],size=i===0||i===3?{width:768,height:432}:{width:768,height:768};
  const response=await fetch('https://fal.run/fal-ai/flux-2',{method:'POST',headers:{Authorization:'Key '+key,'content-type':'application/json'},signal:AbortSignal.timeout(150000),body:JSON.stringify({prompt:`Hand-inked graphic novel, expressive bold contour, warm paper and deep shadows, restrained orange and gold, cinematic comic panel. ${clean(p.shot,1400)}. No text, letters, logo, watermark or speech bubbles.`,image_size:size,num_images:1,num_inference_steps:28,guidance_scale:2.5,enable_safety_checker:true,output_format:'jpeg'})});
  if(!response.ok)throw new Error('ART_PROVIDER_'+response.status);
  const image=await response.json();if(image.has_nsfw_concepts?.[0])throw new Error('ART_SAFETY_REFUSAL');
  const url=new URL(image.images?.[0]?.url||'https://invalid.invalid');if(url.protocol!=='https:'||!(url.hostname==='fal.media'||url.hostname.endsWith('.fal.media')))throw new Error('UNEXPECTED_ART_ORIGIN');
  const bytes=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!bytes.ok)throw new Error('ART_DOWNLOAD_FAILED');const data=Buffer.from(await bytes.arrayBuffer());if(data.length>8*1024*1024)throw new Error('ART_TOO_LARGE');
  const name='ai-'+id()+'.jpg';await writeFile(join(store.dir,'art',name),data,{flag:'wx'});
  panels.push({img:'/art/'+name,alt:clean(p.alt,300),shape:i===0||i===3?'wide':'square',balloons:[{kind:'caption',text:clean(p.caption,65),x:4,y:4,w:i===0||i===3?45:65}]});
 }
 return {title:clean(script.title,100),summary:clean(script.logline,1000),pages:[{panels}],provenance:`Generated for KOMA Zcash on ${new Date().toISOString().slice(0,10)}. Script: Kimi K2.6 via fal. Art: FLUX.2. Provider output, not a template.`,reservedBudgetUsd:reserve};
}
