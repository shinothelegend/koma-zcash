import {DatabaseSync} from 'node:sqlite';
import {randomBytes,createHash,createCipheriv,createDecipheriv} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';

export const sha = value => createHash('sha256').update(value).digest('hex');
export const id = () => randomBytes(18).toString('base64url');
export class Store {
 constructor(dir) {
  mkdirSync(dir,{recursive:true,mode:0o700});this.dir=dir;
  const keyfile=join(dir,'server.key');if(!existsSync(keyfile))writeFileSync(keyfile,randomBytes(32),{mode:0o600,flag:'wx'});
  this.key=readFileSync(keyfile);this.db=new DatabaseSync(join(dir,'koma.sqlite'));
  this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
   CREATE TABLE IF NOT EXISTS creators(id TEXT PRIMARY KEY,name TEXT NOT NULL,address TEXT NOT NULL,uivk TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS series(id TEXT PRIMARY KEY,creator TEXT NOT NULL REFERENCES creators(id),title TEXT NOT NULL,pitch TEXT NOT NULL,character TEXT NOT NULL,genre TEXT NOT NULL,goal INTEGER NOT NULL CHECK(goal>0),cover TEXT,created INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS episodes(id TEXT PRIMARY KEY,series TEXT NOT NULL REFERENCES series(id),title TEXT NOT NULL,summary TEXT NOT NULL,price INTEGER NOT NULL CHECK(price>0),pages TEXT NOT NULL,provenance TEXT NOT NULL,created INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,session TEXT NOT NULL,series TEXT NOT NULL REFERENCES series(id),episode TEXT REFERENCES episodes(id),kind TEXT NOT NULL CHECK(kind IN ('back','episode')),amount INTEGER NOT NULL CHECK(amount>0),memo TEXT UNIQUE NOT NULL,status TEXT NOT NULL DEFAULT 'pending',txhash TEXT UNIQUE,txid TEXT,created INTEGER NOT NULL,paid INTEGER);
   CREATE TABLE IF NOT EXISTS rounds(id TEXT PRIMARY KEY,series TEXT NOT NULL REFERENCES series(id),question TEXT NOT NULL,choices TEXT NOT NULL,closes INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS votes(round TEXT NOT NULL REFERENCES rounds(id),session TEXT NOT NULL,choice INTEGER NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(round,session));
   CREATE TABLE IF NOT EXISTS ai_jobs(id TEXT PRIMARY KEY,session TEXT NOT NULL,series TEXT NOT NULL REFERENCES series(id),prompt TEXT NOT NULL,status TEXT NOT NULL,result TEXT,error TEXT,created INTEGER NOT NULL);
  `);
 }
 seal(text){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',this.key,iv);const b=Buffer.concat([c.update(text,'utf8'),c.final()]);return Buffer.concat([iv,c.getAuthTag(),b]).toString('base64');}
 open(text){const b=Buffer.from(text,'base64'),d=createDecipheriv('aes-256-gcm',this.key,b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return Buffer.concat([d.update(b.subarray(28)),d.final()]).toString('utf8');}
 get(sql,...args){return this.db.prepare(sql).get(...args);}
 all(sql,...args){return this.db.prepare(sql).all(...args);}
 run(sql,...args){return this.db.prepare(sql).run(...args);}
 creator(input){const uid=id();this.run('INSERT INTO creators VALUES (?,?,?,?)',uid,input.name,input.address,this.seal(input.uivk));return uid;}
 series(input){const uid=id();this.run('INSERT INTO series VALUES (?,?,?,?,?,?,?,?,?)',uid,input.creator,input.title,input.pitch,input.character,input.genre,input.goal,input.cover||null,Date.now());return uid;}
 episode(input){const uid=id();this.run('INSERT INTO episodes VALUES (?,?,?,?,?,?,?,?)',uid,input.series,input.title,input.summary,input.price,JSON.stringify(input.pages),input.provenance,Date.now());return uid;}
 order(session,series,episode,kind,amount){const uid=id(),memo='koma1:'+id();this.run('INSERT INTO orders(id,session,series,episode,kind,amount,memo,created) VALUES (?,?,?,?,?,?,?,?)',uid,session,series,episode||null,kind,amount,memo,Date.now());return this.get('SELECT * FROM orders WHERE id=?',uid);}
 support(session,series){return !!this.get("SELECT 1 FROM orders WHERE session=? AND series=? AND status='paid' LIMIT 1",session,series);}
 entitled(session,episode){return !!this.get("SELECT 1 FROM orders WHERE session=? AND episode=? AND kind='episode' AND status='paid' LIMIT 1",session,episode);}
 settle(orderId,session,txid){
  this.db.exec('BEGIN IMMEDIATE');
  try {
   const o=this.get('SELECT * FROM orders WHERE id=? AND session=?',orderId,session);if(!o)throw new Error('ORDER_NOT_FOUND');
   if(o.status==='paid'){if(o.txhash!==sha(txid))throw new Error('ORDER_ALREADY_PAID');this.db.exec('COMMIT');return o;}
   if(this.get('SELECT 1 FROM orders WHERE txhash=?',sha(txid)))throw new Error('PAYMENT_ALREADY_USED');
   this.run("UPDATE orders SET status='paid',txhash=?,txid=?,paid=? WHERE id=?",sha(txid),this.seal(txid),Date.now(),orderId);
   this.db.exec('COMMIT');return this.get('SELECT * FROM orders WHERE id=?',orderId);
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 vote(roundId,session,choice){
  const r=this.get('SELECT * FROM rounds WHERE id=?',roundId);if(!r)throw new Error('ROUND_NOT_FOUND');
  if(Date.now()>=r.closes)throw new Error('VOTING_CLOSED');if(!this.support(session,r.series))throw new Error('SUPPORT_REQUIRED');
  const choices=JSON.parse(r.choices);if(!Number.isInteger(choice)||choice<0||choice>=choices.length)throw new Error('INVALID_CHOICE');
  this.run('INSERT INTO votes VALUES (?,?,?,?) ON CONFLICT(round,session) DO UPDATE SET choice=excluded.choice',roundId,session,choice,Date.now());
 }
 catalog(){return this.all('SELECT s.*,c.name AS creatorName FROM series s JOIN creators c ON c.id=s.creator ORDER BY s.created DESC').map(s=>({...s,backed:this.get("SELECT COALESCE(SUM(amount),0) AS n FROM orders WHERE series=? AND kind='back' AND status='paid'",s.id).n,episodes:this.get('SELECT COUNT(*) AS n FROM episodes WHERE series=?',s.id).n}));}
 close(){this.db.close();}
}
