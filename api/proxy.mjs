// Same-origin transport only. All application state and payment logic stay on the VPS.
export default async function handler(req,res){
 const incoming=new URL(req.url,'https://koma-zcash.vercel.app');
 const path=incoming.searchParams.get('upstream');
 if(!path||!/^\/(api|art)\/[A-Za-z0-9_./-]+$/.test(path)||path.includes('..')){res.statusCode=400;res.end('Invalid path');return;}
 if(!['GET','POST','HEAD'].includes(req.method)){res.statusCode=405;res.end();return;}
 const headers={};for(const name of ['cookie','content-type','origin','x-payment'])if(req.headers[name])headers[name]=req.headers[name];
 try{
  let body;if(req.method==='POST'){body=typeof req.body==='string'||Buffer.isBuffer(req.body)?req.body:JSON.stringify(req.body??{});if(Buffer.byteLength(body)>12*1024*1024){res.statusCode=413;res.end();return;}}
  const upstream=await fetch('https://koma-zcash.201-18-198-162.sslip.io'+path,{method:req.method,headers,body,redirect:'error',signal:AbortSignal.timeout(100000)});
  res.statusCode=upstream.status;
  for(const name of ['content-type','content-security-policy','x-content-type-options','referrer-policy','x-frame-options','x-payment-response']){const value=upstream.headers.get(name);if(value)res.setHeader(name,value);}
  res.setHeader('Cache-Control','private, no-store');
  const cookies=upstream.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
  res.end(Buffer.from(await upstream.arrayBuffer()));
 }catch{res.statusCode=502;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({error:'BACKEND_UNAVAILABLE'}));}
}
