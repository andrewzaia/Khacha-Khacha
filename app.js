(function () {
  'use strict';
  const D = window.Assyrian;
  const STORAGE_KEY='khacha-khacha-course-level-v1';
  let savedLevel='beginner';
  try{const stored=localStorage.getItem(STORAGE_KEY);if(D.levels.some(l=>l.id===stored))savedLevel=stored;}catch{}
  const state = {level:savedLevel,lesson:'alphabet',mode:'learn',script:'roman',selected:0,revealed:false,session:null};
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])).replace(/[\u0700-\u074f][\u0700-\u074f\u0300-\u036f]*(?: +[\u0700-\u074f][\u0700-\u074f\u0300-\u036f]*)*/g,t=>'<bdi class="syriac-run" lang="aii-Syrc" dir="rtl">'+t+'</bdi>');
  const sr = text => state.script==='syriac'?D.toSyriac(text):text;
  const lesson = () => D.lessons.find(l=>l.id===state.lesson);
  const activeLessons=()=>D.getLessons(state.level);
  const currentLevel=()=>D.levels.find(l=>l.id===state.level);
  const levelIsReady=()=>activeLessons().length>0;
  function setLevel(id){
    if(window.AssyrianTest?.isRunning())return;
    if(!D.levels.some(l=>l.id===id))throw new Error('Unknown level');
    state.level=id;state.lesson=activeLessons()[0]?.id||null;
    state.mode='learn';state.selected=0;state.revealed=false;state.session=null;
    try{localStorage.setItem(STORAGE_KEY,id);}catch{}
    render();
  }
  const shuffle = items => { const result=[...items]; for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];} return result; };
  function cards() { return [...lesson().cards]; }
  const decks = new Map();
  function quizItems(id) { return D.quiz[id].map(r=>({id:r[4].id,prompt:r[0],answers:[r[1]],options:[r[1],...r[2]],explanation:r[3],topic:id,category:r[4].category,optionsScript:r[4].optionsScript})); }
  function practiceItems(id) { return D.practice[id].map(r=>({id:r[3].id,prompt:r[0],answers:r[1],hint:r[2],topic:id,category:r[3].category,optionsScript:r[3].optionsScript,latinOnly:r[3].latinOnly})); }
  function takeQuestions(id, mode, count) {
    const key=id+'-'+mode;
    if(!decks.has(key))decks.set(key,D.createQuestionDeck(mode==='quiz'?quizItems(id):practiceItems(id)));
    return decks.get(key).draw(count).map(question=>({...question,options:question.options?shuffle(question.options):undefined}));
  }
  function displayAnswer(question, value) { return question.optionsScript==='display'?sr(value):value; }
  function startSession(mixed=false) {
    let questions;
    if(mixed){
      const lessons=shuffle(activeLessons()).slice(0,8);
      const base=Math.floor(8/lessons.length),extra=8%lessons.length;
      questions=shuffle(lessons.flatMap((l,i)=>takeQuestions(l.id,'practice',base+(i<extra?1:0))));
    }
    else questions=takeQuestions(state.lesson,state.mode,state.mode==='quiz'?5:8);
    state.session={questions,index:0,results:[],selected:null,status:null,input:'',attempts:0,hinted:false,showHint:false,resolved:false,mixed};
  }
  function setLesson(id) {
    if(window.AssyrianTest?.isRunning())return;
    const target=D.lessons.find(l=>l.id===id);
    if(!target) throw new Error('Unknown lesson');
    state.level=target.level;
    if(state.mode==='test')state.mode='learn';
    state.lesson=id;state.selected=0;state.revealed=false;
    if(state.mode!=='learn')startSession();
    try{localStorage.setItem(STORAGE_KEY,state.level);}catch{}
    render();
  }
  function setMode(mode,mixed=false) {
    if(window.AssyrianTest?.isRunning()&&mode!=='test')return;
    if(!['learn','quiz','practice','test'].includes(mode)) throw new Error('Unknown mode');
    if(!levelIsReady()&&mode!=='learn')throw new Error('This level is coming soon');
    state.mode=mode;
    if(mode!=='learn'&&mode!=='test')startSession(mixed);
    render();
  }
  function setScript(script) {
    if(window.AssyrianTest?.isRunning())return;
    if(!['roman','syriac'].includes(script)) throw new Error('Unknown script');
    const selected=levelIsReady()?cards()[state.selected]?.id:null;
    state.script=script;
    if(state.mode==='learn'&&levelIsReady())state.selected=Math.max(0,cards().findIndex(c=>c.id===selected));
    render();
  }
  function render() {
    const ready=levelIsReady(),l=ready?lesson():null,level=currentLevel();
    const testing=ready&&state.mode==='test',running=!!window.AssyrianTest?.isRunning();
    document.querySelector('.mode-nav').hidden=testing||!ready;
    document.querySelector('.lesson-tip').hidden=testing||!ready;
    document.querySelector('.nav-label').hidden=!ready;
    $('testing-link').hidden=!ready;
    document.querySelector('.daily-note').hidden=!ready;
    document.querySelector('.mobile-mix')?.toggleAttribute('hidden',!ready);
    $('mode-content').hidden=testing;
    $('test-content').hidden=!testing;
    $('testing-link').classList.toggle('active',testing);
    if(testing)$('testing-link').setAttribute('aria-current','page');else $('testing-link').removeAttribute('aria-current');
    $('lesson-nav').innerHTML=activeLessons().map((item,i)=>`<button type="button" data-lesson="${item.id}" class="lesson-link ${item.id===state.lesson?'active':''}" ${item.id===state.lesson?'aria-current="page"':''}><span class="lesson-number">${String(i+1).padStart(2,'0')}</span><span><strong>${escape(item.title)}</strong><small>${escape(item.short)}</small></span></button>`).join('');
    document.querySelectorAll('[data-level]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.level===state.level));b.disabled=running;});
    $('level-description').textContent=level.title+' · '+(ready?level.description:'Coming soon. '+level.description);
    if(!ready){
      $('lesson-kicker').textContent='LEVEL '+level.number+' · '+level.title.toUpperCase();
      $('lesson-title').textContent=level.title+' — Coming soon';
      $('lesson-description').textContent=level.description;
      $('lesson-count').textContent='Coming soon';
      $('mode-content').setAttribute('aria-labelledby','lesson-title');
      $('mode-content').innerHTML=`<div class="exercise-shell coming-soon-panel"><span class="coming-soon-icon" aria-hidden="true">⌛</span><div class="eyebrow">LEVEL ${level.number} · ${escape(level.title.toUpperCase())}</div><h2>Coming soon</h2><p>We're preparing the ${escape(level.title.toLowerCase())} Sureth course. Its lessons and assessments aren't available yet.</p><p>In the meantime, keep practising the beginner material at your own pace.</p><button type="button" class="primary-button" data-level="beginner">Return to Level 1</button></div>`;
      return;
    }
    $('lesson-kicker').innerHTML=`${level.title} · Lesson ${activeLessons().indexOf(l)+1} of ${activeLessons().length} <span aria-hidden="true"> / </span> <span lang="${state.script==='syriac'?'aii-Syrc':'en'}">${escape(sr(l.assyrian))}</span>`;
    $('lesson-title').textContent=l.title;
    $('lesson-description').textContent=l.description;
    $('lesson-count').textContent=l.cards.length+' cards · '+D.poolCounts[l.id].quiz+' quiz questions';
    $('tip-content').textContent=l.tip;
    document.querySelectorAll('[data-script]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.script===state.script));b.disabled=running;});
    document.querySelectorAll('[data-lesson],[data-action="daily-mix"]').forEach(b=>b.disabled=running);
    document.querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode===state.mode;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    $('mode-content').setAttribute('aria-labelledby','tab-'+state.mode);
    if(testing){
      document.querySelectorAll('[data-lesson]').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current');});
      $('lesson-kicker').textContent='MIXED '+level.title.toUpperCase()+' TEST';
      $('lesson-title').textContent='A little of everything.';
      $('lesson-description').textContent='100 questions across '+activeLessons().length+' '+level.title.toLowerCase()+' lessons. One minute for each answer.';
      $('lesson-count').textContent='100 questions';
      window.AssyrianTest?.render();
    }else if(state.mode==='learn')renderLearn();else renderExercise();
  }
  function renderLearn() {
    const l=lesson(), list=cards(), card=list[state.selected], isLetter=card.kind==='letter';
    let grid=list.map((c,i)=>{
      const selected=i===state.selected;
      let group='';
      if(state.lesson==='numbers'&&[0,10,20,28].includes(i))group=`<div class="group-label">${{0:'1–10',10:'11–20',20:'Tens to 100',28:'Bigger numbers'}[i]}</div>`;
      return group+`<button type="button" class="${isLetter?'letter-tile':'word-tile'}" data-card="${i}" aria-pressed="${selected}" aria-label="Study card ${i+1}"><span lang="${state.script==='syriac'?'aii-Syrc':'en'}">${escape(isLetter?(state.script==='syriac'?c.syriac:c.latin):state.lesson==='numbers'?c.label:sr(c.label))}</span>${isLetter?`<span class="secondary-letter" lang="${state.script==='syriac'?'en':'aii-Syrc'}">${escape(state.script==='syriac'?c.latin:c.syriac)}</span>`:''}${c.sub?`<small>${escape(c.sub)}</small>`:''}</button>`;
    }).join('');
    const answer=isLetter?`<strong lang="aii">${escape(sr(card.example))}</strong><p>${escape(card.english)}</p>`:`<strong>${escape(card.english)}</strong>${card.example?`<p><span lang="aii">${escape(sr(card.example))}</span><br>${escape(card.exampleMeaning)}</p>`:''}`;
    $('mode-content').innerHTML=`<div class="reference-layout"><div class="catalogue"><div class="section-label"><strong>${isLetter?'Choose a letter':'Choose a card'}</strong><span>${isLetter?('Alap Bet order'):list.length+' cards'}</span></div><div class="${isLetter?'tile-grid':'word-grid'} ${state.lesson==='conversation'?'phrases':''}">${grid}</div><p class="catalogue-note">${isLetter?'22 letters, read from right to left. Letter names and Roman cues help you begin.':'Choose a card, say the Assyrian out loud, then reveal its meaning.'}</p></div><article class="flashcard" aria-label="Selected reference card"><div class="card-top"><span class="card-tag">${isLetter?'LETTER & SOUND':'READ · SAY · REMEMBER'}</span><span>Card ${state.selected+1} / ${list.length}</span></div><div class="card-face"><div class="${isLetter?'big-letter':'big-word'}" lang="${state.script==='syriac'?'aii-Syrc':'en'}">${escape(isLetter?(state.script==='syriac'?card.syriac:card.latin):sr(card.latin))}</div><div class="script-pair" lang="${state.script==='syriac'?'en':'aii-Syrc'}">${escape(state.script==='syriac'?card.latin:(isLetter?card.syriac:D.toSyriac(card.latin)))}</div><p class="pronunciation">Sounds like <strong>${escape(card.sound)}</strong></p></div><div class="card-details"><p class="sound-note">${escape(card.note)}</p><div id="card-answer" aria-live="polite">${state.revealed?`<div class="revealed">${answer}</div><button type="button" class="small-button hide-answer" data-action="reveal" style="margin-top:10px">Hide answer</button>`:`<button type="button" class="reveal-button" data-action="reveal">${isLetter?'Reveal an example':'Reveal meaning'}</button>`}</div><div class="card-actions"><button type="button" class="small-button" data-action="previous-card">Previous</button><span>Say it out loud</span><button type="button" class="small-button" data-action="next-card">Next card</button></div></div></article></div>`;
  }
  function q() { return state.session.questions[state.session.index]; }
  function feedbackHTML(status) {
    const question=q();
    if(!status)return '<div id="feedback" role="status" aria-live="polite" aria-atomic="true"></div>';
    let title='',detail='';
    if(state.mode==='quiz'){
      title=status==='correct'?'Correct. Nice work.':'Keep going. Here’s the answer.';
      detail=question.explanation;
    }else{
      const answer=escape(displayAnswer(question,question.answers[0]));
      if(status==='correct'){title='Correct. Nice work.';detail='You wrote '+answer+'.';}
      else if(status==='empty'){title='Give it a try.';detail='Type an answer, or use a hint.';}
      else if(status==='accent'){title='Almost. Check the Assyrian letters.';detail='Check the Roman spelling and try again.';}
      else if(status==='script'){title='Try Roman spelling.';detail='For this card, type the Roman name or spelling.';}
      else if(status==='revealed'){title='Let’s learn this one.';detail='The answer is <strong lang="aii">'+answer+'</strong>. Say it once, then carry on.';}
      else {title='Not quite yet. Try again.';detail='Use a hint if you need one. You can also reveal the answer.';}
    }
    return `<div id="feedback" role="status" aria-live="polite" aria-atomic="true" class="feedback ${status==='correct'?'correct':status==='revealed'?'':'incorrect'}"><strong>${title}</strong><p>${detail}</p></div>`;
  }
  function renderExercise(focus) {
    const s=state.session;
    if(s.index>=s.questions.length){renderCompletion();return;}
    const question=q(),quiz=state.mode==='quiz';
    const available=s.mixed?Object.values(D.poolCounts).reduce((total,counts)=>total+counts.practice,0):D.poolCounts[state.lesson][state.mode];
    const content=quiz?`<div class="choice-list">${question.options.map((option,i)=>{
      const correct=s.resolved&&option===question.answers[0],incorrect=s.resolved&&s.selected===option&&!correct;
      const display=displayAnswer(question,option);
      return `<button type="button" data-option="${i}" class="choice ${correct?'correct':''} ${incorrect?'incorrect':''}" ${s.resolved?'disabled':''}><span class="choice-key" aria-hidden="true">${String.fromCharCode(65+i)}</span><span>${escape(display)}${correct?' <span aria-label="correct answer">✓</span>':''}${incorrect?' <span aria-label="incorrect answer">×</span>':''}</span></button>`;
    }).join('')}</div>`:`<form id="practice-form"><label class="input-label" for="answer-input">Your answer in ${question.latinOnly?'Roman spelling':'Roman spelling or Syriac'}</label><input id="answer-input" class="answer-input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" value="${String(s.input).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}" ${s.resolved?'disabled':''} aria-describedby="input-note feedback"><div class="character-keys" aria-label="Sureth letter helpers">${['kh','sh','th','ܐ','ܒ','ܚ','ܫ','ܬ'].map(c=>`<button type="button" data-character="${c}" ${s.resolved?'disabled':''} aria-label="Insert ${c}">${c}</button>`).join('')}</div><p id="input-note" class="input-note">${question.latinOnly?'Use Roman spelling for this reading question.':'Roman spelling or the lesson’s Syriac form works. Case and final punctuation do not matter.'} Keep vowel marks when they distinguish two endings.</p><div class="practice-tools"><button type="submit" class="primary-button" ${s.resolved?'disabled':''}>Check answer</button><button type="button" class="small-button" data-action="hint" ${s.resolved?'disabled':''}>${s.showHint?'Hide hint':'Need a hint?'}</button><button type="button" class="small-button" data-action="show-answer" ${s.resolved?'disabled':''}>Reveal answer</button></div>${s.showHint?`<div class="hint">${escape(question.hint)}</div>`:''}</form>`;
    $('mode-content').innerHTML=`<div class="exercise-shell"><div class="exercise-meta"><span>${s.mixed?'Daily mix':quiz?'Quick quiz':'Typing practice'}</span><span>Question ${s.index+1} of ${s.questions.length}</span></div><div class="progress-track" role="progressbar" aria-label="Session progress" aria-valuemin="0" aria-valuemax="${s.questions.length}" aria-valuenow="${s.index}"><span style="width:${s.index/s.questions.length*100}%"></span></div><p class="pool-note">${s.questions.length} questions this round · ${available} available${s.mixed?' across all five lessons':' in this lesson'}</p><div class="question-label">${s.mixed?escape(D.lessons.find(l=>l.id===question.topic).title):quiz?'Choose one answer':'A little recall'}</div><h2 id="question-heading">${escape(question.prompt)}</h2>${content}${feedbackHTML(s.status)}<div class="exercise-footer"><span>${quiz?'One question at a time.':s.resolved?'Say the answer out loud before you continue.':'No timer. Take your time.'}</span><button type="button" class="primary-button" data-action="next-question" ${s.resolved?'':'disabled'}>${s.index===s.questions.length-1?'See results':'Next question'}</button></div></div>`;
    if(focus){const element=focus==='input'?$('answer-input'):document.querySelector('[data-action="next-question"]');element?.focus();}
  }
  function chooseOption(index) {
    const s=state.session;
    if(state.mode!=='quiz'||s.resolved)return;
    const question=q();
    if(!Number.isInteger(index)||index<0||index>=question.options.length)throw new Error('Invalid answer option');
    s.selected=question.options[index];s.status=s.selected===question.answers[0]?'correct':'incorrect';s.resolved=true;
    s.results.push({question,status:s.status,firstTry:s.status==='correct'});
    renderExercise('next');
  }
  function submitAnswer(input) {
    const s=state.session;
    if(state.mode!=='practice'||s.resolved)return;
    if(typeof input!=='string')throw new Error('Answer must be text');
    s.input=input;
    let status=D.assess(input,q().answers);
    if(q().latinOnly&&/[\u0700-\u074f]/.test(input))status='script';
    s.status=status;
    if(status==='correct'){s.resolved=true;s.results.push({question:q(),status,firstTry:s.attempts===0&&!s.hinted});}
    if(status!=='empty')s.attempts++;
    renderExercise(status==='correct'?'next':'input');
    return {status,resolved:s.resolved};
  }
  function showAnswer() {
    const s=state.session;if(state.mode!=='practice'||s.resolved)return;
    s.status='revealed';s.resolved=true;s.results.push({question:q(),status:'revealed',firstTry:false});renderExercise('next');
  }
  function nextQuestion() {
    const s=state.session;if(!s?.resolved)return;
    s.index++;s.selected=null;s.status=null;s.input='';s.attempts=0;s.hinted=false;s.showHint=false;s.resolved=false;
    renderExercise();
    if(s.index<s.questions.length){const target=state.mode==='practice'?$('answer-input'):document.querySelector('[data-option]');target?.focus();}else{document.querySelector('[data-action="restart"]')?.focus();}
  }
  function renderCompletion() {
    const s=state.session,score=s.results.filter(r=>r.firstTry).length,review=s.results.filter(r=>!r.firstTry);
    const reviewHTML=review.length?`<section class="review-list" aria-labelledby="review-heading"><h3 id="review-heading">Keep these close</h3><ul class="review-items">${review.map(r=>`<li class="review-row"><p class="review-question">${escape(r.question.prompt)}</p><div class="review-answer"><span class="review-answer-label">Correct answer</span><strong lang="${r.question.optionsScript==='english'?'en':'aii'}">${escape(displayAnswer(r.question,r.question.answers[0]))}</strong></div></li>`).join('')}</ul></section>`:'';
    $('mode-content').innerHTML=`<div class="exercise-shell completion"><div class="finish-mark" aria-hidden="true">✓</div><div class="eyebrow">${s.mixed?'DAILY MIX COMPLETE':state.mode==='quiz'?'QUIZ COMPLETE':'PRACTICE COMPLETE'}</div><h2>${score===s.questions.length?'You’ve got this set.':'A little better than before.'}</h2><div class="score">${score}<span style="font-size:1.5rem;color:#7786a3"> / ${s.questions.length}</span></div><p>${state.mode==='quiz'?'Correct answers.':'Correct on the first try, without hints.'} ${review.length?'Review the answers below, then try again whenever you like.':'Try another lesson, or come back tomorrow for a little more.'}</p><div class="completion-buttons"><button type="button" class="primary-button" data-action="restart">Try a fresh round</button><button type="button" class="small-button" data-mode="learn">Back to reference cards</button></div>${reviewHTML}</div>`;
  }
  function selectCard(index) { if(!Number.isInteger(index)||index<0||index>=cards().length)throw new Error('Invalid card');state.selected=index;state.revealed=false;renderLearn(); }
  function doAction(action) {
    if(action==='open-test'){if(levelIsReady())setMode('test');return;}
    if(action==='reveal'){state.revealed=!state.revealed;renderLearn();document.querySelector('[data-action="reveal"]')?.focus();}
    if(action==='next-card'||action==='previous-card'){selectCard((state.selected+(action==='next-card'?1:-1)+cards().length)%cards().length);document.querySelector(`[data-action="${action}"]`)?.focus();}
    if(action==='next-question')nextQuestion();
    if(action==='show-answer')showAnswer();
    if(action==='hint'){const s=state.session;if(s.resolved)return;s.showHint=!s.showHint;if(s.showHint)s.hinted=true;renderExercise();document.querySelector('[data-action="hint"]')?.focus();}
    if(action==='restart'){startSession(state.session.mixed);renderExercise();}
    if(action==='daily-mix')setMode('practice',true);
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.level){setLevel(b.dataset.level);document.querySelector(`[data-level="${b.dataset.level}"]`)?.focus();}
    else if(b.dataset.lesson){setLesson(b.dataset.lesson);document.querySelector(`[data-lesson="${b.dataset.lesson}"]`)?.focus();}
    else if(b.dataset.script){setScript(b.dataset.script);document.querySelector(`[data-script="${b.dataset.script}"]`)?.focus();}
    else if(b.dataset.mode){setMode(b.dataset.mode);$('tab-'+b.dataset.mode)?.focus();}
    else if(b.dataset.card!==undefined){selectCard(Number(b.dataset.card));document.querySelector(`[data-card="${b.dataset.card}"]`)?.focus();}
    else if(b.dataset.option!==undefined)chooseOption(Number(b.dataset.option));
    else if(b.dataset.character){const input=$('answer-input');if(!input||input.disabled)return;const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;input.value=input.value.slice(0,start)+b.dataset.character+input.value.slice(end);state.session.input=input.value;input.focus();input.setSelectionRange(start+b.dataset.character.length,start+b.dataset.character.length);}
    else if(b.dataset.action)doAction(b.dataset.action);
  });
  document.addEventListener('input',event=>{if(event.target.id==='answer-input')state.session.input=event.target.value;});
  document.addEventListener('submit',event=>{if(event.target.id==='practice-form'){event.preventDefault();submitAnswer($('answer-input').value);}});
  document.querySelector('.mode-nav').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const modes=['learn','quiz','practice'];let index=modes.indexOf(state.mode);
    index=event.key==='Home'?0:event.key==='End'?2:(index+(event.key==='ArrowRight'?1:-1)+3)%3;
    setMode(modes[index]);$('tab-'+modes[index]).focus();
  });
  document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();if(window.AssyrianTest?.isRunning())return;setLevel('beginner');});
  const daily=document.querySelector('.daily-note');
  daily.insertAdjacentHTML('beforeend','<button type="button" class="small-button" data-action="daily-mix" style="margin-top:17px;width:100%">Practise a daily mix</button>');
  document.querySelector('.topbar').insertAdjacentHTML('beforeend','<button type="button" class="small-button mobile-mix" data-action="daily-mix">Daily mix</button>');
  render();
  // The same actions power both the interface and optional browser agent tools.
  const publicAPI={
    readState(){const s=state.session;if(!levelIsReady())return {level:state.level,available:false,lesson:null,mode:'learn',script:state.script,card:null,revealed:false,question:null,completed:false};if(state.mode==='test')return {level:state.level,available:true,lesson:null,mode:'test',script:state.script,card:null,revealed:false,question:null,test:window.AssyrianTest?.readState(),completed:!!window.AssyrianTest?.isComplete()};return {level:state.level,available:true,lesson:state.lesson,mode:state.mode,script:state.script,card:state.mode==='learn'?cards()[state.selected].id:null,revealed:state.revealed,question:s&&state.mode!=='learn'&&s.index<s.questions.length?{id:q().id,topic:q().topic,category:q().category,optionsScript:q().optionsScript,prompt:q().prompt,index:s.index,total:s.questions.length,resolved:s.resolved}:null,completed:!!s&&s.index>=s.questions.length};},
    setLevel,setLesson,setMode,setScript,selectCard,submitAnswer,chooseOption,nextQuestion,doAction,render
  };
  window.AssyrianPractice=publicAPI;
  const context=document.modelContext;
  if(context?.registerTool){const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
    const definitions=[
      {name:'read_assyrian_practice',description:'Read the current Assyrian lesson and practice state without changing it.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).length)throw new Error('No input fields expected');return publicAPI.readState();}},
      {name:'start_assyrian_lesson',description:'Open an available Assyrian lesson in reference, quiz or typing mode. Starting a quiz or practice resets the current round.',inputSchema:{type:'object',properties:{lesson:{type:'string',enum:D.lessons.map(l=>l.id)},mode:{type:'string',enum:['learn','quiz','practice']}},required:['lesson','mode'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(window.AssyrianTest?.isRunning())throw new Error('Finish the active test before opening a lesson');if(!input||!D.lessons.some(l=>l.id===input.lesson)||!['learn','quiz','practice'].includes(input.mode)||Object.keys(input).some(k=>!['lesson','mode'].includes(k)))throw new Error('Choose a valid lesson and mode');state.mode='learn';setLesson(input.lesson);setMode(input.mode);return publicAPI.readState();}},
      {name:'check_assyrian_practice_answer',description:'Submit a typed answer to the current typing question and return immediate feedback. Does not advance to the next question.',inputSchema:{type:'object',properties:{answer:{type:'string'}},required:['answer'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input.answer!=='string'||Object.keys(input).some(k=>k!=='answer'))throw new Error('Provide answer text');if(state.mode!=='practice'||!state.session||state.session.index>=state.session.questions.length||state.session.resolved)throw new Error('Open an unanswered typing question first');return submitAnswer(input.answer);}}
    ];
    definitions.forEach(tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}});
  }
})();
