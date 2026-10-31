import {listRecords,respond,bad,safeId} from '../lib/cms-shared.mjs';
export default async function publicContent(req){
 if(req.method!=='GET')return bad('Method not allowed',405);
 try{
  const url=new URL(req.url),type=url.searchParams.get('type'),id=url.searchParams.get('id');
  if(id&&!safeId(id))return bad('Invalid ID');
  const all=await listRecords();let items=all.filter(x=>x.status==='published');
  if(type)items=items.filter(x=>x.type===type);
  if(id)items=items.filter(x=>x.id===id);
  // Exclude private workflow information and contact identifiers.
  const safe=items.map(({id,type,title,body,summary,imageId,url,member,page,date,category,photoCredit,alt,publishedAt})=>({id,type,title,body,summary,imageId,url,member,page,date,category,photoCredit,alt,publishedAt}));
  return respond({items:safe.slice(0,200)});
 }catch(e){console.error('YAB public content:',e);return bad('Temporarily unable to load updates',503)}
}
