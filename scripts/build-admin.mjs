import { build } from 'esbuild';
import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

// Only the following public assets are deployed. Private notes, source,
// dependencies and local RStudio history never enter the published directory.
await rm('dist',{recursive:true,force:true});
await mkdir('dist/admin',{recursive:true});
for(const name of ['assets','css','js','stories'])await cp(name,path.join('dist',name),{recursive:true});
for(const f of await readdir('.')){
 if(f.endsWith('.html')||['_redirects','robots.txt'].includes(f))await cp(f,path.join('dist',f));
}
await cp('admin/index.html','dist/admin/index.html');
await cp('admin/admin.css','dist/admin/admin.css');
await build({entryPoints:['admin/app.mjs'],bundle:true,format:'esm',platform:'browser',target:['es2020'],outfile:'dist/admin/app.js',minify:true,sourcemap:false});
console.log('YAB secure deployment built in dist/ (only public assets).');
