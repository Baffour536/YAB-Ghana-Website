import {verifiedUser,respond,bad,checkOrigin,mediaStore,mediaMetaStore,safeId,ROLES} from '../lib/cms-shared.mjs';
function mimeFrom(bytes){
 if(bytes[0]===0xFF&&bytes[1]===0xD8&&bytes[2]===0xFF)return'image/jpeg';
 if(bytes.slice(0,8).every((v,i)=>v===[137,80,78,71,13,10,26,10][i]))return'image/png';
 if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return'image/webp';
 return null;
}
export default async function media(req){
 try{
  const url=new URL(req.url);
  if(req.method==='GET'){
   const id=url.searchParams.get('id');if(!safeId(id))return bad('Invalid image ID');
   const m=await mediaMetaStore().get('asset/'+id,{type:'json',consistency:'strong'});
   if(!m)return bad('Image not found',404);
   if(!m.public){const {role}=await verifiedUser();if(!role)return bad('Image is awaiting approval',403);}
   const data=await mediaStore().get('asset/'+id,{type:'arrayBuffer',consistency:'strong'});
   if(!data)return bad('Image not found',404);
   return new Response(data,{headers:{'Content-Type':m.mime,'Cache-Control':m.public?'public, max-age=3600':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
  }
  if(req.method!=='POST')return bad('Method not allowed',405);
  if(!checkOrigin(req))return bad('Cross-origin upload rejected',403);
  const {user,role}=await verifiedUser();if(!user||!role)return bad('Editorial sign-in required',401);
  if(![ROLES.superadmin,ROLES.secretary,ROLES.media].includes(role))return bad('Permission denied',403);
  if(Number(req.headers.get('content-length')||0)>2200000)return bad('Maximum image size: 2 MB',413);
  const buf=await req.arrayBuffer();if(buf.byteLength<16||buf.byteLength>2*1024*1024)return bad('Image must be 16 bytes to 2 MB',413);
  const mime=mimeFrom(new Uint8Array(buf));if(!mime)return bad('Upload JPG, PNG or WebP photographs only. SVG and HEIC are not accepted.');
  const id=crypto.randomUUID();await mediaStore().set('asset/'+id,buf,{onlyIfNew:true});
  await mediaMetaStore().setJSON('asset/'+id,{mime,public:false,uploadedAt:new Date().toISOString(),uploadedBy:user.email});
  return respond({id,url:`/.netlify/functions/media?id=${id}`},201);
 }catch(e){console.error('YAB media:',e);return bad('Image request failed',500)}
}
