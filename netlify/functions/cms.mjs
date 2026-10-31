import { verifiedUser, ROLES, GOVERNANCE, cleanRecord, contentStore, respond, bad, owner, safeId, checkOrigin, addAudit, getRecord, listRecords, validateImageReference, activateImage, auditStore } from '../lib/cms-shared.mjs';
import { canCreate, canEdit, canRevise, canReview, canReturn, canPublish, canArchive } from '../lib/policy.mjs';

// ALL authorisation happens server-side. Hiding buttons is not access control.
export default async function cms(req){
 try {
  const {user,role}=await verifiedUser();
  if(!user)return bad('Sign in to the YAB administration dashboard.',401);
  if(!role)return bad('Account is not assigned a YAB editorial role.',403);
  const url=new URL(req.url);
  if(req.method==='GET'){
   if(url.searchParams.get('view')==='me')return respond({email:user.email,role,id:user.id});
   if(url.searchParams.get('view')==='audit'){
    if(role!==ROLES.superadmin)return bad('Only Level 1 users may view the action log.',403);
    const a=auditStore();const {blobs}=await a.list({prefix:'event/'});
    const items=await Promise.all(blobs.slice(-250).map(x=>a.get(x.key,{type:'json',consistency:'strong'})));
    return respond({items:items.filter(Boolean).sort((a,b)=>b.at.localeCompare(a.at)).slice(0,100)});
   }
   const items=await listRecords();
   const visible=items.filter(x=>{
    if(role===ROLES.superadmin||role===ROLES.secretary)return true;
    return !GOVERNANCE.has(x.type)&& (x.createdBy===owner(user)||x.status==='published');
   });
   return respond({items:visible});
  }
  if(req.method!=='POST')return bad('Method not allowed',405);
  if(!checkOrigin(req))return bad('Cross-origin update rejected',403);
  if(Number(req.headers.get('content-length')||'0')>26000)return bad('Payload is too large',413);
  const data=await req.json();const action=String(data.action||'');
  if(action==='create'){
   const clean=cleanRecord(data.record);
   if(!canCreate(role,clean.type))return bad('Your role cannot create this content type.',403);
   await validateImageReference(clean.imageId);
   const now=new Date().toISOString();
   const record={...clean,id:crypto.randomUUID(),status:'draft',version:1,createdBy:owner(user),createdAt:now,updatedAt:now,reviewedBy:null,publishedBy:null,revisionOf:null};
   await contentStore().setJSON('entry/'+record.id,record,{onlyIfNew:true});
   await addAudit('create',user,record);return respond({record},201);
  }
  const id=data.id;
  if(!safeId(id))return bad('Invalid content ID');
  const hit=await getRecord(id);if(!hit||!hit.data)return bad('Content not found',404);
  const record=hit.data,oldStatus=record.status;
  if(role===ROLES.media && (record.createdBy!==owner(user)||GOVERNANCE.has(record.type)))return bad('You may only edit your own media drafts.',403);
  const mustVersion=Number(data.version);
  if(!Number.isInteger(mustVersion)||mustVersion!==record.version)return bad('Content changed in another session. Refresh to continue.',409);
  const isSuper=role===ROLES.superadmin,isSecretary=role===ROLES.secretary;
  if(action==='revise'){
   if(!canRevise(role,record,owner(user)))return bad('Your role cannot revise this publication.',403);
   const now=new Date().toISOString();
   const revision={...record,id:crypto.randomUUID(),status:'draft',version:1,revisionOf:record.id,createdBy:owner(user),createdAt:now,updatedAt:now,reviewedBy:null,publishedBy:null};
   await contentStore().setJSON('entry/'+revision.id,revision,{onlyIfNew:true});
   await addAudit('revise',user,revision);return respond({record:revision},201);
  }
  if(action==='save'){
   if(!canEdit(role,record,owner(user)))return bad('Your role cannot edit this draft.',403);
   const clean=cleanRecord({...data.record,type:record.type});
   if(clean.type!==record.type)throw new Error('Changing the content type is not allowed');
   await validateImageReference(clean.imageId);
   Object.assign(record,clean);
  }else if(action==='submit'){
   if(!['draft','returned'].includes(oldStatus))return bad('Only drafts may be submitted',409);
   record.status=isSecretary||isSuper?'reviewed':'submitted';
   if(isSecretary||isSuper)record.reviewedBy=owner(user);
  }else if(action==='review'){
   if(!canReview(role,oldStatus))return bad('This role cannot review the submitted item.',403);
   record.status='reviewed';record.reviewedBy=owner(user);
  }else if(action==='return'){
   if(!canReturn(role,oldStatus))return bad('This role cannot return this submission.',403);
   record.status='returned';record.reviewedBy=null;
  }else if(action==='publish'){
   if(!canPublish(role,record,owner(user)))return bad('Publication requires Level 1 approval.',403);
   await validateImageReference(record.imageId);
   record.status='published';record.publishedBy=owner(user);record.publishedAt=new Date().toISOString();
  }else if(action==='archive'){
   if(!canArchive(role,oldStatus))return bad('Only Level 1 may archive published content.',403);
   record.status='archived';
  }else return bad('Unknown action');
  record.version+=1;record.updatedAt=new Date().toISOString();
  const result=await contentStore().setJSON('entry/'+record.id,record,{onlyIfMatch:hit.etag});
  if(!result.modified)return bad('A concurrent change was detected. Refresh before editing.',409);
  if(action==='publish'){
   await activateImage(record.imageId);
   if(record.revisionOf){const original=await getRecord(record.revisionOf);if(original?.data?.status==='published'){
     const older=original.data;older.status='archived';older.updatedAt=new Date().toISOString();older.version+=1;
     await contentStore().setJSON('entry/'+older.id,older,{onlyIfMatch:original.etag});
     await addAudit('superseded',user,older);
   }}
  }
  await addAudit(action,user,record);return respond({record});
 }catch(e){console.error('YAB CMS:',e);return bad(e?.message||'Request could not be completed',400)}
}
