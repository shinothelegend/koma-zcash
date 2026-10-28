import {readFile,copyFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {id} from './store.mjs';
export async function bootstrap(store,root){
 if(store.get('SELECT COUNT(*) AS n FROM series').n||!process.env.KOMA_DEMO_ADDRESS||!process.env.KOMA_DEMO_UIVK)return;
 let catalog;try{catalog=JSON.parse(await readFile(join(root,'bootstrap/catalog.json'),'utf8'));}catch{return;}
 await mkdir(join(store.dir,'art'),{recursive:true});
 const creator=store.creator({name:'KOMA Archive Studio',address:process.env.KOMA_DEMO_ADDRESS,uivk:process.env.KOMA_DEMO_UIVK});
 for(const item of catalog){
  for(const name of item.files)await copyFile(join(root,'bootstrap/art',name),join(store.dir,'art',name));
  const series=store.series({creator,title:item.title,pitch:item.pitch,character:item.character,genre:item.genre,goal:100000,cover:item.cover});
  store.episode({series,title:item.episodeTitle,summary:item.summary,price:10000,pages:item.pages,provenance:item.provenance});
  store.run('INSERT INTO rounds VALUES (?,?,?,?,?)',id(),series,'Which direction should the next chapter take?',JSON.stringify(item.choices),Date.now()+24*3600000);
 }
}
