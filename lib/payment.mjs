export const formatZec = zat => `${Math.floor(zat/100000000)}.${String(zat%100000000).padStart(8,'0')}`;
export function paymentUri(address,amount,memo){
 if(!/^utest1[0-9a-z]+$/.test(address))throw new Error('Testnet shielded unified address required');
 if(!Number.isSafeInteger(amount)||amount<1||amount>100000000)throw new Error('Invalid amount');
 return `zcash:${address}?amount=${formatZec(amount)}&memo=${Buffer.from(memo,'utf8').toString('base64url')}&label=KOMA`;
}
export async function verifyPayment({order,uivk,txid,api=process.env.HANKO_API||'https://hanko-api.201-18-198-162.sslip.io'}){
 if(!/^[0-9a-f]{64}$/.test(txid))throw new Error('INVALID_TXID');
 if(!/^(uivktest|uvitest)1/.test(uivk))throw new Error('Incoming viewing key required');
 const response=await fetch(`${api}/api/verify`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({rail:'zcash',uivk,txid,amountZat:order.amount,memo:order.memo,minConf:1}),signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw new Error(response.status===429?'VERIFIER_BUSY':'VERIFIER_UNAVAILABLE');
 const result=await response.json();
 if(result.ok!==true||result.verdict!=='paid')return {paid:false,reasons:Array.isArray(result.reasons)?result.reasons:['PAYMENT_UNVERIFIED']};
 return {paid:true,reasons:[]};
}
