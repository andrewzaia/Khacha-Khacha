const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const context={window:{}};
vm.createContext(context);
for(const filename of ['data.js','course-levels.js'])vm.runInContext(read(filename),context);
const D=context.window.Assyrian;

test('Beginner lessons and their existing question banks remain intact',()=>{
  assert.deepEqual(Array.from(D.getLessons('beginner'),l=>l.id),['alphabet','numbers','pronouns','be','conversation']);
  const counts={alphabet:[301,235],numbers:[848,572],pronouns:[199,142],be:[351,270],conversation:[289,146]};
  for(const [id,[quiz,practice]] of Object.entries(counts)){
    assert.equal(D.quiz[id].length,quiz,id+' quiz count');
    assert.equal(D.practice[id].length,practice,id+' typing count');
  }
});

test('Intermediate and Advanced are placeholders until valid course content is added',()=>{
  assert.deepEqual(Array.from(D.levels,l=>l.id),['beginner','intermediate','advanced']);
  assert.equal(D.getLessons('intermediate').length,0);
  assert.equal(D.getLessons('advanced').length,0);
  assert.equal(D.getLessons('beginner').length,5);
});

test('The site shows numbered levels and visibly marks the future courses',()=>{
  const html=read('index.html'),css=read('styles.css');
  for(const [id,n] of [['beginner',1],['intermediate',2],['advanced',3]]){
    assert.match(html,new RegExp('data-level="'+id+'"[^>]*>Level '+n));
  }
  assert.equal((html.match(/class="level-soon">Soon/g)||[]).length,2);
  assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.ok(html.indexOf('data.js')<html.indexOf('course-levels.js'));
  assert.ok(html.indexOf('course-levels.js')<html.indexOf('app.js'));
});

test('Empty future levels cannot launch a test or an ordinary question session',()=>{
  const app=read('app.js'),assessment=read('test.js');
  assert.ok(app.includes("if(!levelIsReady()&&mode!=='learn')throw new Error('This level is coming soon')"));
  assert.ok(app.includes("const ready=levelIsReady(),l=ready?lesson():null"));
  assert.ok(app.includes("if(!ready){"));
  assert.ok(assessment.includes("const lessons=shuffle(D.getLessons(level))"));
  assert.ok(assessment.includes("if(!D.getLessons(level).length)return false"));
});

test('The available beginner bank can still supply 100 unique test questions',()=>{
  const selected=D.getLessons('beginner').flatMap(l=>D.createQuestionDeck(D.quiz[l.id].map(r=>({id:r[4].id,category:r[4].category}))).draw(20));
  assert.equal(selected.length,100);
  assert.equal(new Set(selected.map(row=>row.id)).size,100);
});
