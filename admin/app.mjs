import { login, logout, getUser, handleAuthCallback, acceptInvite, requestPasswordRecovery, updateUser } from '@netlify/identity';

const API='/.netlify/functions/cms';
const MEDIA='/.netlify/functions/media';
const ROLE={super:'yab_superadmin',secretary:'yab_secretary',media:'yab_media'};
const TYPES={news:'News',gallery:'Gallery',announcement:'Announcement',programme:'Programme',resource:'Resource',board:'Board biography',page:'Institutional page'};
const BOARD=['Lucky Adeline Aanomah','Collins Baffour Kyei','Dina Kessewaa Mintah','Evans Junior Owu','George Nartey-Wayo','Matilda Morkeh Annan','Perpetual Sroda Mansah Wadjoly','Yussif Jafaru Adaboro','Stephen Opoku Yeboah','Davis Akua Effah Kaufmann','Confidence Mawusi'];
const $=s=>document.querySelector(s);
let user=null,role=null,items=[],current=null,imageId='',pendingCallback=null;
function toast(s,error=false){const el=$('#toast');el.textContent=s;el.className='toast on'+(error?' error':'');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.className='toast',6000)}
function esc(s){return String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')}
async function api(method='GET',payload,query=''){
 const r=await fetch(API+query,{method,credentials:'same-origin',headers:{...(method!=='GET'?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{})});
 let data;try{data=await r.json()}catch{throw new Error('The server returned an invalid response. Check Netlify Functions deploy logs.')}if(!r.ok)throw new Error(data.error||'Request failed');return data;
}
function tab(name){document.querySelectorAll('.tab').forEach(x=>x.hidden=x.id!=='tab-'+name);document.querySelectorAll('.nav-button').forEach(x=>x.classList.toggle('active',x.dataset.tab===name));if(name==='audit')loadAudit();}
function labelRole(x){return x===ROLE.super?'LEVEL 1 · Leadership':x===ROLE.secretary?'LEVEL 2 · Secretary':x===ROLE.media?'LEVEL 3 · Media':'Unassigned';}
async function launch(){
 try{
  pendingCallback=await handleAuthCallback();
  if(pendingCallback?.type==='invite'){
   $('#callback-panel').hidden=false;$('#callback-note').textContent='Accept your YAB invitation. Create a password with at least 10 characters.';
   $('#login-form').hidden=true;$('#forgot-btn').hidden=true;return;
  }
  if(pendingCallback?.type==='recovery'){
   $('#callback-panel').hidden=false;$('#callback-note').textContent='Set a new password for your YAB account.';
   $('#login-form').hidden=true;$('#forgot-btn').hidden=true;return;
  }
  user=await getUser();if(user)await openDashboard();
 }catch(e){toast(e.message,true)}
}
async function openDashboard(){
 try{
  const profile=await api('GET',null,'?view=me');
  role=profile.role;if(!role)throw new Error('Your account is not yet assigned a YAB role. Ask the Chairperson/Deputy Chairperson to request role assignment.');
  $('#login-panel').hidden=true;$('#dashboard').hidden=false;
  $('#user-label').textContent='Signed in as '+profile.email;
  $('#role-pill').textContent=labelRole(role);
  $('#audit-button').hidden=role!==ROLE.super;
  if(role!==ROLE.super){[...$('#f-type').options].filter(x=>['board','page'].includes(x.value)).forEach(x=>x.remove());}
  await refresh();tab('entries');
 }catch(e){toast(e.message,true);$('#login-panel').hidden=false;$('#dashboard').hidden=true}
}
async function refresh(){
 try{const r=await api('GET');items=r.items||[];renderList();renderStats();}catch(e){toast(e.message,true)}
}
function renderStats(){
 const stats=[['All records',items.length],['Drafts',items.filter(x=>['draft','returned'].includes(x.status)).length],['In review',items.filter(x=>['submitted','reviewed'].includes(x.status)).length],['Published',items.filter(x=>x.status==='published').length]];
 $('#summary').innerHTML=stats.map(([t,v])=>`<div class="metric"><b>${v}</b><span>${esc(t)}</span></div>`).join('');
}
function renderList(){
 const status=$('#status-filter').value,type=$('#type-filter').value;
 const rows=items.filter(x=>(status==='all'||x.status===status)&&(type==='all'||x.type===type));
 $('#entry-list').innerHTML=rows.length?rows.map(x=>`<div class="entry-card"><div><span class="entry-meta">${esc(TYPES[x.type]||x.type)} · ${esc(x.createdBy||'')}</span><h3>${esc(x.title)}</h3><p>${esc((x.summary||x.body||'').slice(0,125))}</p><p style="margin-top:8px"><span class="status-chip ${esc(x.status)}">${esc(x.status)}</span> · ${new Date(x.updatedAt).toLocaleDateString('en-GB')}</p></div><button class="outline" data-edit="${esc(x.id)}">Open ↗</button></div>`).join(''):'<p>No records in this selection. Create the first publication to begin.</p>';
 document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openRecord(b.dataset.edit)));
}
function newRecord(){current=null;imageId='';$('#entry-form').reset();$('#image-preview').replaceChildren();$('#editor-heading').textContent='New content';$('#editor-subtitle').textContent='Prepare a private draft. Nothing goes live without Level 1 approval.';$('#record-actions').hidden=true;$('#editing-status').textContent='New private draft';setEditable(true);tab('editor');}
function setEditable(on){$('#entry-form').querySelectorAll('input,textarea,select,button').forEach(x=>x.disabled=!on);}
function openRecord(id){
 const r=items.find(x=>x.id===id);if(!r)return;
 current=r;imageId=r.imageId||'';
 for(const k of ['type','date','title','summary','body','category','url','member','page','alt'])$('#f-'+k).value=r[k]||'';
 $('#f-credit').value=r.photoCredit||'';
 $('#f-consent').checked=Boolean(r.consent);
 $('#f-image').value='';
 $('#editor-heading').textContent=r.title;$('#editor-subtitle').textContent=`${TYPES[r.type]} · ${r.status} · Version ${r.version}`;
 $('#editing-status').textContent=r.status;
 const edit=['draft','returned'].includes(r.status)&&(role!==ROLE.media||r.createdBy===user.email);
 setEditable(edit);$('#f-type').disabled=true;
 imagePreview();
 drawActions();tab('editor');
}
function imagePreview(){let e=$('#image-preview');e.replaceChildren();if(!imageId)return;const image=document.createElement('img');image.src=MEDIA+'?id='+encodeURIComponent(imageId);image.alt='Uploaded image preview';e.append(image);}
function formRecord(){return{type:$('#f-type').value,title:$('#f-title').value,summary:$('#f-summary').value,body:$('#f-body').value,category:$('#f-category').value,url:$('#f-url').value,member:$('#f-member').value,page:$('#f-page').value,date:$('#f-date').value,imageId,alt:$('#f-alt').value,photoCredit:$('#f-credit').value,consent:$('#f-consent').checked};}
async function uploadPhotoIfSelected(){
 const file=$('#f-image').files[0];if(!file)return;
 if(file.size>2*1024*1024)throw Error('Photographs must be 2 MB or smaller');
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose JPG, PNG or WebP');
 const r=await fetch(MEDIA,{method:'POST',body:file,credentials:'same-origin',headers:{'Content-Type':file.type}});
 const data=await r.json();if(!r.ok)throw Error(data.error||'Photograph upload failed');imageId=data.id;
 imagePreview();$('#f-image').value='';
}
async function save(e){e.preventDefault();try{
 $('#save-btn').disabled=true;$('#save-btn').textContent='Saving...';
 await uploadPhotoIfSelected();const record=formRecord();
 const result=current?await api('POST',{action:'save',id:current.id,version:current.version,record}):await api('POST',{action:'create',record});
 toast('Private draft saved.');await refresh();openRecord(result.record.id);
 }catch(e){toast(e.message,true)}finally{$('#save-btn').disabled=false;$('#save-btn').textContent='Save private draft';}}
function drawActions(){
 if(!current){$('#record-actions').hidden=true;return;}$('#record-actions').hidden=false;
 const r=current,buttons=[];
 const add=(label,action)=>buttons.push(`<button class="outline" data-action="${action}" type="button">${label}</button>`);
 if(['draft','returned'].includes(r.status))add(role===ROLE.media?'Submit to Secretary':'Submit for Leadership approval','submit');
 if(r.status==='submitted'&&role!==ROLE.media){add('Mark as reviewed','review');add('Return for corrections','return');}
 if(r.status==='reviewed'&&role!==ROLE.media)add('Return for corrections','return');
 if(role===ROLE.super&&(r.status==='reviewed'||(r.status==='draft'&&r.createdBy===user.email)))add('Approve & publish','publish');
 if(r.status==='published'){if(role===ROLE.super||role===ROLE.secretary||r.createdBy===user.email)add('Create new draft revision','revise');if(role===ROLE.super)add('Archive publication','archive');}
 $('#workflow-explain').textContent=r.status==='published'?'Published content is read-only. Create a revision to propose updates.':r.status==='draft'?'Save before submitting for review.':'Review and approval actions follow your assigned permission level.';
 $('#workflow-buttons').innerHTML=buttons.join('')||'<span class="smallmuted">No actions are available for this role and status.</span>';
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>act(b.dataset.action));
}
async function act(action){
 if(['publish','archive'].includes(action)&&!confirm(action==='publish'?'Approve and make this content publicly visible?':'Remove this publication from the public feed?'))return;
 try{const data=await api('POST',{action,id:current.id,version:current.version});toast(action==='publish'?'Published successfully.':action==='revise'?'Draft revision created.':'Action completed.');await refresh();openRecord(data.record.id);}catch(e){toast(e.message,true)}
}
async function loadAudit(){try{const r=await api('GET',null,'?view=audit');$('#audit-list').innerHTML=r.items.map(x=>`<div class="audit-row"><b>${esc(x.action)}</b> · ${esc(x.title)}<br>${esc(x.actor)} · ${new Date(x.at).toLocaleString('en-GB')}</div>`).join('')||'<p>No action history yet.</p>';}catch(e){toast(e.message,true)}}
$('#login-form').addEventListener('submit',async e=>{e.preventDefault();try{await login($('#login-email').value,$('#login-password').value);user=await getUser();await openDashboard();}catch(e){toast(e.message,true)}});
$('#forgot-btn').addEventListener('click',async()=>{const email=$('#login-email').value||prompt('Enter the email address used for your YAB account');if(!email)return;try{await requestPasswordRecovery(email);toast('Password recovery email requested. Check your inbox.');}catch(e){toast(e.message,true)}});
$('#callback-form').addEventListener('submit',async e=>{e.preventDefault();const password=$('#callback-password').value;try{
 if(pendingCallback.type==='invite')await acceptInvite(pendingCallback.token,password);
 else if(pendingCallback.type==='recovery')await updateUser({password});
 pendingCallback=null;user=await getUser();$('#callback-panel').hidden=true;$('#login-form').hidden=false;$('#forgot-btn').hidden=false;
 if(user)await openDashboard();else toast('Account set up. Sign in with your email and password.');
 }catch(e){toast(e.message,true)}});
$('#logout-btn').addEventListener('click',async()=>{await logout();location.replace('/admin/');});
$('#reload-btn').addEventListener('click',refresh);
document.querySelectorAll('.nav-button').forEach(x=>x.addEventListener('click',()=>tab(x.dataset.tab)));
$('#new-btn').addEventListener('click',newRecord);$('#clear-btn').addEventListener('click',newRecord);
$('#entry-form').addEventListener('submit',save);
$('#status-filter').addEventListener('change',renderList);$('#type-filter').addEventListener('change',renderList);
for(const [k,v] of Object.entries(TYPES)){let opt=document.createElement('option');opt.value=k;opt.textContent=v;$('#type-filter').append(opt)}
for(const n of BOARD){let opt=document.createElement('option');opt.value=n;opt.textContent=n;$('#f-member').append(opt)}
launch();
