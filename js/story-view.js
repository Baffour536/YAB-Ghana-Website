(async()=>{
 const el=s=>document.querySelector(s),id=new URLSearchParams(location.search).get('id');
 const fail=()=>{el('#story-title').textContent='Story unavailable';el('#story-subtitle').textContent='This publication is not available or has been archived.'};
 if(!id||!/^[0-9a-f-]{36}$/i.test(id)){fail();return}
 try{
 const r=await fetch('/.netlify/functions/public-content?id='+encodeURIComponent(id),{cache:'no-store'});
 if(!r.ok)throw Error('Unavailable');const entry=(await r.json()).items?.[0];if(!entry||entry.type!=='news')throw Error('Unavailable');
 document.title=entry.title+' | YAB Ghana';el('#story-title').textContent=entry.title;el('#story-subtitle').textContent=entry.summary||'';
 el('#story-meta').textContent=(entry.category||'YAB Ghana')+' · '+(entry.date||entry.publishedAt?.slice(0,10)||'');
 if(entry.imageId){let img=el('#story-image');img.src='/.netlify/functions/media?id='+encodeURIComponent(entry.imageId);img.alt=entry.alt||entry.title;img.hidden=false;el('#story-credit').textContent=entry.photoCredit||''}
 const box=el('#story-body');for(const p of entry.body.split(/\n\s*\n/).filter(Boolean)){const line=document.createElement('p');line.textContent=p;box.append(line)}
 }catch{fail()}
})();
