export const R={super:'yab_superadmin',secretary:'yab_secretary',media:'yab_media'};
const governance=new Set(['board','page']);
export function canCreate(role,type){return [R.super,R.secretary,R.media].includes(role)&&(!governance.has(type)||role===R.super)}
export function canEdit(role,record,email){
 if(!['draft','returned'].includes(record.status))return false;
 if(governance.has(record.type))return role===R.super;
 return role===R.super||role===R.secretary||(role===R.media&&record.createdBy===email);
}
export function canRevise(role,record,email){return record.status==='published'&&(role===R.super||(!governance.has(record.type)&&(role===R.secretary||role===R.media&&record.createdBy===email)))}
export function canReview(role,status){return [R.super,R.secretary].includes(role)&&status==='submitted'}
export function canReturn(role,status){return [R.super,R.secretary].includes(role)&&['submitted','reviewed'].includes(status)}
export function canPublish(role,record,email){return role===R.super&&(record.status==='reviewed'||(record.status==='draft'&&record.createdBy===email))}
export function canArchive(role,status){return role===R.super&&status==='published'}
