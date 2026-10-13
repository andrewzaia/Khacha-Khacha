const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const disallowed=new Set([String.fromCodePoint(0x2013),String.fromCodePoint(0x2014)]);
const extensions=new Set(['.js','.cjs','.mjs','.html','.css','.md','.txt','.json','.yml','.yaml','.xml','.svg']);
function scan(dir){
 const found=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.name==='.git'||entry.name==='node_modules')continue;
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())found.push(...scan(full));
  else if(entry.isFile()&&extensions.has(path.extname(entry.name).toLowerCase())){
   const source=fs.readFileSync(full,'utf8');
   if([...source].some(char=>disallowed.has(char)))found.push(path.relative(root,full));
  }
 }
 return found;
}
test('Public content and source code use ASCII hyphens',()=>{
 assert.deepEqual(scan(root),[],'Replace typographic dash characters with the ASCII hyphen');
});
