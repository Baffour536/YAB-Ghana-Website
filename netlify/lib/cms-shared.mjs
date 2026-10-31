import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';

export const BOARD_MEMBERS = Object.freeze([
  'Lucky Adeline Aanomah','Collins Baffour Kyei','Dina Kessewaa Mintah',
  'Evans Junior Owu','George Nartey-Wayo','Matilda Morkeh Annan',
  'Perpetual Sroda Mansah Wadjoly','Yussif Jafaru Adaboro',
  'Stephen Opoku Yeboah','Davis Akua Effah Kaufmann','Confidence Mawusi'
]);
export const TYPES = ['news', 'gallery', 'announcement', 'programme', 'resource', 'board', 'page'];
export const GOVERNANCE = new Set(['board', 'page']);
export const ROLES = Object.freeze({ superadmin: 'yab_superadmin', secretary: 'yab_secretary', media: 'yab_media' });
export function roleOf(user){
  if (!user) return null;
  const roles=Array.isArray(user.roles) ? user.roles : [];
  return [ROLES.superadmin,ROLES.secretary,ROLES.media].find(x=>roles.includes(x))||null;
}
export const contentStore=()=>getStore({name:'yab-content-v1',consistency:'strong'});
export const mediaStore=()=>getStore({name:'yab-media-v1',consistency:'strong'});
export const mediaMetaStore=()=>getStore({name:'yab-media-metadata-v1',consistency:'strong'});
export const auditStore=()=>getStore({name:'yab-audit-v1',consistency:'strong'});
export function respond(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export const bad=(error,status=400)=>respond({error},status);
export const owner=(u)=>u?.email||u?.id||'unknown';
export async function verifiedUser(){
 const user=await getUser();return {user,role:roleOf(user)};
}
export function checkOrigin(req){
 const origin=req.headers.get('origin');
 const fetchSite=req.headers.get('sec-fetch-site');
 // Never accept cross-site writes using browser session cookies.
 if(fetchSite && !['same-origin','none'].includes(fetchSite)) return false;
 if(!origin) return false;
 try{return new URL(origin).origin === new URL(req.url).origin;}catch{return false;}
}
export const safeId=id=>typeof id==='string'&&/^[0-9a-f-]{36}$/i.test(id);
export function safeUrl(s){
 if(!s)return '';
 try{const x=new URL(String(s));return ['https:'].includes(x.protocol)?x.href:'';}catch{return '';}
}
export function cleanRecord(input){
 if(!input||typeof input!=='object')throw new Error('Missing content record');
 const type=String(input.type||'');if(!TYPES.includes(type))throw new Error('Unsupported content type');
 const str=(k,max)=>String(input[k]??'').trim().slice(0,max);
 const title=str('title',160),body=str('body',12000),summary=str('summary',550);
 if(!title||!body) throw new Error('A title and body are required');
 const imageId=str('imageId',60);
 if(imageId&&!safeId(imageId))throw new Error('Invalid image reference');
 if(type==='gallery'&&!imageId)throw new Error('Gallery entries must include a photograph');
 const url=safeUrl(str('url',800));if(type==='resource'&&!url)throw new Error('Resources require a valid HTTPS source link');
 const member=str('member',140),page=str('page',30);
 if(type==='board'&&!BOARD_MEMBERS.includes(member))throw new Error('Select a recognised Board member');
 if(type==='page'&&!['about','programmes','values','resources'].includes(page))throw new Error('Select a supported page');
 const consent=Boolean(input.consent);
 if((type==='gallery'||imageId)&&!consent)throw new Error('Confirm photograph permission and safeguarding before submission');
 const date=str('date',10);if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Use YYYY-MM-DD date');
 return {type,title,body,summary,imageId,consent,url,member,page,date,category:str('category',60),photoCredit:str('photoCredit',120),alt:str('alt',220)};
}
export async function addAudit(action,actor,record){
 await auditStore().setJSON('event/'+crypto.randomUUID(),{action,at:new Date().toISOString(),actor:owner(actor),role:roleOf(actor),recordId:record.id,title:record.title,type:record.type,status:record.status});
}
export async function getRecord(id){if(!safeId(id))return null;return contentStore().getWithMetadata('entry/'+id,{type:'json',consistency:'strong'});}
export async function listRecords(){const store=contentStore();const {blobs}=await store.list({prefix:'entry/'});const all=await Promise.all(blobs.map(x=>store.get(x.key,{type:'json',consistency:'strong'})));return all.filter(Boolean).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));}
export async function activateImage(id){
 if(!id)return;
 const store=mediaMetaStore();const meta=await store.get('asset/'+id,{type:'json',consistency:'strong'});
 if(!meta)throw new Error('Image does not exist');
 meta.public=true;meta.approvedAt=new Date().toISOString();
 await store.setJSON('asset/'+id,meta);
}
export async function validateImageReference(id){if(!id)return;const m=await mediaMetaStore().get('asset/'+id,{type:'json',consistency:'strong'});if(!m)throw new Error('Image reference not found');}
