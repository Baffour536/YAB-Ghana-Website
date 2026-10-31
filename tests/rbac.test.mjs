import assert from 'node:assert/strict';
import { R, canCreate, canEdit, canRevise, canReview, canReturn, canPublish, canArchive } from '../netlify/lib/policy.mjs';
// Role permissions must be enforced by Netlify Functions, not browser UI.
for(const type of ['news','gallery','announcement','programme','resource']){
 for(const role of Object.values(R))assert.equal(canCreate(role,type),true);
}
for(const type of ['page','board']){
 assert.equal(canCreate(R.super,type),true);assert.equal(canCreate(R.secretary,type),false);assert.equal(canCreate(R.media,type),false);
}
const draft={type:'news',status:'draft',createdBy:'a@example.org'};
assert.equal(canEdit(R.media,draft,'a@example.org'),true);assert.equal(canEdit(R.media,draft,'other@example.org'),false);
assert.equal(canEdit(R.secretary,draft,'other@example.org'),true);
assert.equal(canEdit(R.media,{...draft,type:'board'},'a@example.org'),false);
assert.equal(canEdit(R.secretary,{...draft,type:'board'},'a@example.org'),false);
assert.equal(canEdit(R.super,{...draft,type:'board'},'a@example.org'),true);
assert.equal(canEdit(R.super,{...draft,status:'published'},'a@example.org'),false);
assert.equal(canRevise(R.media,{...draft,status:'published'},'a@example.org'),true);
assert.equal(canRevise(R.media,{...draft,type:'board',status:'published'},'a@example.org'),false);
assert.equal(canReview(R.media,'submitted'),false);assert.equal(canReview(R.secretary,'submitted'),true);
assert.equal(canReturn(R.secretary,'reviewed'),true);assert.equal(canReturn(R.media,'reviewed'),false);
assert.equal(canPublish(R.media,{...draft,status:'reviewed'},'a@example.org'),false);assert.equal(canPublish(R.secretary,{...draft,status:'reviewed'},'a@example.org'),false);assert.equal(canPublish(R.super,{...draft,status:'reviewed'},'other@example.org'),true);assert.equal(canPublish(R.super,{...draft,status:'submitted'},'other@example.org'),false);assert.equal(canPublish(R.super,{...draft,status:'draft'},'other@example.org'),false);assert.equal(canPublish(R.super,{...draft,status:'draft'},'a@example.org'),true);
assert.equal(canArchive(R.secretary,'published'),false);assert.equal(canArchive(R.super,'published'),true);
console.log('RBAC permissions: 25+ cases passed');
