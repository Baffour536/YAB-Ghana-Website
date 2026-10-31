// Approved YAB content. DOM APIs are used instead of injecting user-created HTML.
(()=>{
 const endpoint='/.netlify/functions/public-content';
 const imgEndpoint='/.netlify/functions/media?id=';
 const byId=s=>document.querySelector(s);
 const make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el};
 const image=(id,alt)=>{const im=make('img');im.src=imgEndpoint+encodeURIComponent(id);im.alt=alt||'YAB Ghana activity';im.loading='lazy';im.decoding='async';return im};
 const records=async type=>{try{const response=await fetch(endpoint+'?type='+encodeURIComponent(type),{cache:'no-store'});if(!response.ok)return[];const obj=await response.json();return obj.items||[]}catch{return[]}};
 const date=x=>{const s=x.date||x.publishedAt||'';return s?s.slice(0,10):''};
 function newsCard(x){
   const card=make('article','news-card');card.dataset.category=x.category||'News';
   const url='story.html?id='+encodeURIComponent(x.id);
   if(x.imageId){const cover=make('a','news-image');cover.href=url;cover.append(image(x.imageId,x.alt||x.title));card.append(cover)}
   const box=make('div','news-card-content');const meta=make('span','news-meta',(x.category||'YAB news')+' · '+date(x));
   const h3=make('h3');const link=make('a','',x.title);link.href=url;h3.append(link);
   const p=make('p','',x.summary||x.body.slice(0,190));const read=make('a','text-arrow','Read story ↗');read.href=url;
   box.append(meta,h3,p,read);card.append(box);return card;
 }
 async function news(){const grids=[...document.querySelectorAll('.news-grid')];if(!grids.length)return;const entries=(await records('news')).sort((a,b)=>date(b).localeCompare(date(a)));for(const grid of grids){
   const count=document.body.dataset.page==='home'?3:20;
   entries.slice(0,count).reverse().forEach(x=>grid.prepend(newsCard(x)));
 }}
 async function gallery(){const grid=byId('.gallery-grid');if(!grid)return;const entries=await records('gallery');for(const x of entries){if(!x.imageId)continue;
   const btn=make('button','gallery-item');btn.type='button';const src=imgEndpoint+encodeURIComponent(x.imageId);
   btn.dataset.caption=x.title+' · '+(x.photoCredit||'YAB Ghana');btn.dataset.image=src;
   btn.append(image(x.imageId,x.alt||x.title));const span=make('span');span.append(make('b','',x.title),make('small','',x.summary||x.date||''));btn.append(span,make('i','','↗'));
   const dlg=byId('#lightbox');if(dlg)btn.addEventListener('click',()=>{dlg.querySelector('#lightbox-img').src=src;dlg.querySelector('#lightbox-img').alt=x.alt||x.title;dlg.querySelector('#lightbox-caption').textContent=btn.dataset.caption;dlg.showModal()});
   grid.prepend(btn);
 }}
 async function resources(){const grid=byId('.resources-grid');if(!grid)return;for(const x of await records('resource')){if(!x.url)continue;const card=make('article','resource-card');card.append(make('span','resource-type','YAB RESOURCE'),make('h2','',x.title),make('p','',x.summary||x.body));const a=make('a','', 'Open official resource ↗');a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';card.append(a);grid.append(card)}}
 async function board(){if(document.body.dataset.page!=='board')return;const updates=await records('board');for(const x of updates){const btn=[...document.querySelectorAll('[data-member]')].find(b=>b.dataset.member===x.member);if(!btn)continue;
   const card=btn.closest('.person-card');const summary=card?.querySelector('.person-info p');if(summary&&x.summary)summary.textContent=x.summary;
   // Original modal data remains available for all other members.
   btn.addEventListener('click',event=>{
     const dlg=byId('#member-dialog');if(!dlg)return;event.stopImmediatePropagation();
     dlg.querySelector('#dialog-name').textContent=x.member;dlg.querySelector('#dialog-role').textContent=card.querySelector('.person-role')?.textContent||'';
     dlg.querySelector('#dialog-bio').textContent=x.body;dlg.querySelector('#dialog-value').textContent='';
     dlg.querySelector('#dialog-sources')?.replaceChildren();dlg.showModal();
   },true);
 }}
 async function notices(){
   const page=document.body.dataset.page;
   const announcements=await records('announcement');if(page==='home'&&announcements.length){
     const section=make('section','section yab-dynamic-announcements');const box=make('div','container');box.append(make('span','eyebrow','BOARD ANNOUNCEMENTS'),make('h2','','Latest official notices'));
     for(const x of announcements.slice(0,4)){const a=make('article','yab-cms-note');a.append(make('h3','',x.title),make('p','',x.body));box.append(a)}section.append(box);byId('main')?.append(section);
   }
   const updates=(await records('page')).filter(x=>x.page===page);
   const programmes=page==='programmes'?await records('programme'):[];
   if(!updates.length&&!programmes.length)return;
   const s=make('section','section yab-dynamic-announcements'),c=make('div','container');c.append(make('span','eyebrow','APPROVED YAB UPDATES'),make('h2','','Recent institutional updates'));
   for(const x of [...updates,...programmes]){const a=make('article','yab-cms-note');a.append(make('h3','',x.title));for(const p of x.body.split(/\n\s*\n/).filter(Boolean))a.append(make('p','',p));c.append(a)}
   s.append(c);byId('main')?.append(s);
 }
 Promise.all([news(),gallery(),resources(),board(),notices()]);
})();
