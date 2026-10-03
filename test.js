(function () {
  'use strict';
  const D=window.Assyrian, A=window.AssyrianPractice;
  // This is a simple browser-side gate, not authentication. Change the word here.
  const TEST_WORD='shlama', QUESTION_MS=60000, TEST_SIZE=100;
  const $=id=>document.getElementById(id);
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])).replace(/[\u0700-\u074f][\u0700-\u074f\u0300-\u036f]*(?: +[\u0700-\u074f][\u0700-\u074f\u0300-\u036f]*)*/g,t=>'<bdi class="syriac-run" lang="aii-Syrc" dir="rtl">'+t+'</bdi>');
  const shuffle=items=>{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;};
  let run=null, clock=null, confirmEnd=false, filter='all';
  const isRunning=()=>!!run&&!run.completedAt;
  const isComplete=()=>!!run?.completedAt;
  const topicName=id=>D.lessons.find(l=>l.id===id).title;
  const formatDuration=ms=>{const seconds=Math.round(ms/1000);return Math.floor(seconds/60)+'m '+String(seconds%60).padStart(2,'0')+'s';};
  const display=(question,value)=>question.optionsScript==='display'&&run.script==='syriac'?D.toSyriac(value):value;
  const answerLanguage=question=>question.optionsScript==='english'?'en':'aii';
  function drawQuestions() {
    // Equal coverage: twenty distinct multiple-choice questions from each bank.
    return shuffle(D.lessons.flatMap(l=>{
      const bank=D.quiz[l.id].map(r=>({id:r[4].id,topic:l.id,prompt:r[0],answer:r[1],options:[r[1],...r[2]],explanation:r[3],optionsScript:r[4].optionsScript,category:r[4].category}));
      return D.createQuestionDeck(bank).draw(20).map(q=>({...q,options:shuffle(q.options)}));
    }));
  }
  function start(word) {
    if(isRunning())return false;
    if(typeof word!=='string'||word.trim().toLowerCase()!==TEST_WORD)return false;
    const now=Date.now();
    run={questions:drawQuestions(),results:[],index:0,selection:null,script:A.readState().script,startedAt:now,questionStartedAt:now,deadline:now+QUESTION_MS,completedAt:null,endedEarly:false,notice:''};
    confirmEnd=false;filter='all';
    if(clock!==null)window.clearInterval(clock);
    clock=window.setInterval(syncClock,250);
    A.render();focusQuestion();return true;
  }
  function record(selected,status,at,reason) {
    const q=run.questions[run.index];
    run.results.push({number:run.index+1,id:q.id,topic:q.topic,prompt:q.prompt,answer:display(q,q.answer),selected:selected===null?null:display(q,selected),explanation:q.explanation,status,reason:reason||null,seconds:Math.min(60,Math.max(0,(at-run.questionStartedAt)/1000))});
    run.index++;run.selection=null;
  }
  function complete(at) {
    run.completedAt=at;confirmEnd=false;
    if(clock!==null)window.clearInterval(clock);clock=null;
    A.render();$('test-results-heading')?.focus();
  }
  function syncClock(now=Date.now()) {
    if(!isRunning())return false;
    let expired=0;
    // Recover every expired deadline after throttling, sleep, or a hidden tab.
    while(run.index<TEST_SIZE&&now>=run.deadline){
      const boundary=run.deadline;
      record(null,'missed',boundary,'Time expired');expired++;
      run.questionStartedAt=boundary;run.deadline=boundary+QUESTION_MS;
    }
    if(run.index>=TEST_SIZE){complete(run.questionStartedAt);return true;}
    if(expired){run.notice=expired===1?'Time expired. The previous question was marked missed.':expired+' questions timed out and were marked missed.';render();focusQuestion();}
    updateTimer(now);return expired>0;
  }
  function updateTimer(now=Date.now()) {
    if(!isRunning())return;
    const seconds=Math.max(0,Math.ceil((run.deadline-now)/1000));
    const timer=$('test-timer');
    if(timer){timer.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');timer.classList.toggle('timer-low',seconds<=10);}
    const status=$('test-timer-status');
    if(status&&seconds===10&&status.textContent!=='10 seconds remaining.')status.textContent='10 seconds remaining.';
  }
  function select(index) {
    if(!isRunning())return;
    const id=run.questions[run.index].id;
    syncClock();if(!isRunning()||run.questions[run.index].id!==id)return;
    if(!Number.isInteger(index)||index<0||index>=4)return;
    run.selection=index;
    document.querySelectorAll('.test-choice').forEach((label,i)=>label.classList.toggle('selected',i===index));
    $('test-submit').disabled=false;
  }
  function submit() {
    if(!isRunning())return;
    const id=run.questions[run.index].id,now=Date.now();
    syncClock(now);if(!isRunning()||run.questions[run.index].id!==id||run.selection===null)return;
    const q=run.questions[run.index],selected=q.options[run.selection];
    record(selected,selected===q.answer?'correct':'incorrect',now);
    if(run.index===TEST_SIZE){complete(now);return;}
    run.questionStartedAt=now;run.deadline=now+QUESTION_MS;run.notice='';
    render();focusQuestion();
  }
  function finishEarly() {
    if(!isRunning())return;
    const now=Date.now();syncClock(now);if(!isRunning())return;
    run.endedEarly=true;
    while(run.index<TEST_SIZE){record(null,'missed',now,'Test ended early');run.questionStartedAt=now;}
    complete(now);
  }
  function report() {
    if(!isComplete())throw new Error('Complete the test before exporting results.');
    const counts={correct:0,incorrect:0,missed:0};run.results.forEach(r=>counts[r.status]++);
    const topics=D.lessons.map(l=>{const rows=run.results.filter(r=>r.topic===l.id);return {id:l.id,title:l.title,total:rows.length,correct:rows.filter(r=>r.status==='correct').length,incorrect:rows.filter(r=>r.status==='incorrect').length,missed:rows.filter(r=>r.status==='missed').length};});
    return {title:'Khacha Khacha - Assyrian test',total:TEST_SIZE,score:counts.correct,percent:counts.correct,counts,topics,script:run.script,startedAt:run.startedAt,completedAt:run.completedAt,durationMs:run.completedAt-run.startedAt,endedEarly:run.endedEarly,results:run.results.map(r=>({...r}))};
  }
  function focusQuestion(){ $('test-question')?.focus(); }
  function render() {
    if(A.readState().mode!=='test')return;
    if(!run){renderGate();return;}
    if(isComplete()){renderResults();return;}
    const q=run.questions[run.index];
    $('test-content').innerHTML=`<div class="exercise-shell test-shell"><div class="test-meta"><div><span class="question-label">${escape(topicName(q.topic))}</span><p>Question ${run.index+1} of ${TEST_SIZE}</p></div><div class="test-clock"><span>Time left</span><strong id="test-timer" role="timer" aria-label="Time remaining for this question">1:00</strong></div></div><div class="progress-track" role="progressbar" aria-label="Test progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${run.index}"><span style="width:${run.index}%"></span></div><p class="test-notice" role="status">${escape(run.notice)}</p><span id="test-timer-status" class="sr-only" role="status" aria-live="polite"></span><form id="test-answer-form"><fieldset class="test-answers"><legend id="test-question" tabindex="-1">${escape(q.prompt)}</legend><div class="choice-list">${q.options.map((option,i)=>`<label class="test-choice ${run.selection===i?'selected':''}"><input type="radio" name="test-answer" value="${i}" ${run.selection===i?'checked':''}><span class="choice-key" aria-hidden="true">${String.fromCharCode(65+i)}</span><span lang="${answerLanguage(q)}">${escape(display(q,option))}</span></label>`).join('')}</div></fieldset><div class="test-actions"><p>Answers are reviewed at the end.</p><button id="test-submit" type="submit" class="primary-button" ${run.selection===null?'disabled':''}>${run.index===99?'Finish test':'Submit answer'}</button></div></form><div class="test-end">${confirmEnd?`<p>Finish now? All remaining questions will be marked missed.</p><div class="test-buttons"><button type="button" class="small-button" data-test-action="keep-going">Keep going</button><button type="button" class="small-button" data-test-action="finish">Finish and see results</button></div>`:`<button type="button" class="text-button" data-test-action="ask-end">End test early</button>`}</div></div>`;
    updateTimer();
  }
  function renderGate() {
    $('test-content').innerHTML=`<div class="exercise-shell test-gate"><div class="eyebrow">A BEGINNER CHECK-IN</div><h2>Ready for a longer round?</h2><p>Try 100 multiple-choice questions drawn from the existing quiz bank: 20 from each lesson, mixed into a random order.</p><ul class="test-rules"><li><strong>One minute per question.</strong> Unused time does not carry over.</li><li><strong>Time runs out?</strong> That question is marked missed and the next begins automatically.</li><li><strong>One submitted answer.</strong> No hints or answer reveals during the test.</li><li><strong>Results straight away.</strong> Review every answer and download a PDF.</li></ul><p class="test-small-note">Allow up to 100 minutes. Keep this page open: the timer continues in the background, and refreshing resets the test.</p><form id="test-start-form"><label class="input-label" for="test-password">Test password</label><input id="test-password" class="answer-input" type="password" autocomplete="off" required aria-describedby="test-password-error"><p id="test-password-error" class="test-error" role="alert"></p><div class="test-buttons"><button type="submit" class="primary-button">Start the 100-question test</button><button type="button" class="small-button" data-mode="learn">Back to lessons</button></div></form><p class="test-small-note gate-note">The password is a simple access word, not a secure login.</p></div>`;
  }
  function renderResults() {
    const r=report(),rows=filter==='review'?r.results.filter(x=>x.status!=='correct'):r.results;
    $('test-content').innerHTML=`<div class="exercise-shell test-results"><div class="eyebrow">TEST COMPLETE</div><h2 id="test-results-heading" tabindex="-1">Your results, ready to review.</h2><p class="test-score"><strong>${r.score}</strong><span>/ 100 · ${r.percent}%</span></p><div class="test-stats"><div><strong>${r.counts.correct}</strong><span>Correct</span></div><div><strong>${r.counts.incorrect}</strong><span>Incorrect</span></div><div><strong>${r.counts.missed}</strong><span>Missed</span></div></div><p class="test-result-meta">${escape(new Date(r.completedAt).toLocaleString(undefined,{timeZoneName:'short'}))} · ${formatDuration(r.durationMs)} · ${r.script==='syriac'?'Syriac':'Roman spelling'} answers</p>${r.endedEarly?'<p class="test-small-note">You ended the test early. Unanswered questions are included as missed.</p>':''}<div class="test-buttons"><button type="button" class="primary-button" data-test-action="pdf">Download results PDF</button><button type="button" class="small-button" data-test-action="new">Start another test</button><button type="button" class="small-button" data-mode="learn">Back to lessons</button></div><p id="test-export-status" class="test-small-note" role="status"></p><section class="test-breakdown" aria-labelledby="breakdown-heading"><h3 id="breakdown-heading">By lesson</h3><div class="test-table-wrap"><table><thead><tr><th scope="col">Lesson</th><th scope="col">Correct</th><th scope="col">Incorrect</th><th scope="col">Missed</th></tr></thead><tbody>${r.topics.map(t=>`<tr><th scope="row">${escape(t.title)}</th><td>${t.correct} / ${t.total}</td><td>${t.incorrect}</td><td>${t.missed}</td></tr>`).join('')}</tbody></table></div></section><section class="test-review" aria-labelledby="test-review-heading"><div class="test-review-heading"><h3 id="test-review-heading">Question review</h3><div class="test-filters" aria-label="Review filter"><button type="button" data-test-filter="all" aria-pressed="${filter==='all'}">All 100</button><button type="button" data-test-filter="review" aria-pressed="${filter==='review'}">Needs review (${r.counts.incorrect+r.counts.missed})</button></div></div>${rows.length?rows.map(row=>`<details class="test-review-item"><summary><span class="test-review-number">${row.number}</span><span><span class="test-review-topic">${escape(topicName(row.topic))}</span>${escape(row.prompt)}</span><span class="test-status ${row.status}">${row.status==='correct'?'Correct':row.status==='incorrect'?'Incorrect':'Missed'}</span></summary><div class="test-review-body"><p><span>Your answer</span><strong>${row.selected===null?escape(row.reason):escape(row.selected)}</strong></p><p><span>Correct answer</span><strong>${escape(row.answer)}</strong></p><p class="test-explanation">${escape(row.explanation)}</p></div></details>`).join(''):'<p class="test-small-note">Every answer was correct. Nice work.</p>'}</section></div>`;
  }
  async function downloadPDF() {
    const status=$('test-export-status');
    try {
      status.textContent='Preparing your PDF…';
      const button=document.querySelector('[data-test-action="pdf"]');if(button)button.disabled=true;
      const r=report(),bytes=await window.AssyrianPDF.create(r),blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob);
      const link=document.createElement('a');link.href=url;link.download='Khacha_Khacha_Test_'+new Date(r.completedAt).toISOString().replace(/[:.]/g,'-')+'.pdf';document.body.appendChild(link);link.click();link.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),60000);
      status.textContent='Your PDF is ready. It includes the score, lesson breakdown, and all 100 answers.';
    }catch(error){status.textContent='The PDF could not be created. Your results are still here; please try again.';}finally{const button=document.querySelector('[data-test-action="pdf"]');if(button)button.disabled=false;}
  }
  document.addEventListener('submit',event=>{
    if(event.target.id==='test-start-form'){
      event.preventDefault();const word=$('test-password').value;
      if(!start(word)){$('test-password').value='';$('test-password-error').textContent='That password is not correct. Try again.';$('test-password').setAttribute('aria-invalid','true');$('test-password').focus();}
    }
    if(event.target.id==='test-answer-form'){event.preventDefault();submit();}
  });
  document.addEventListener('change',event=>{if(event.target.name==='test-answer')select(Number(event.target.value));});
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.dataset.testFilter){filter=button.dataset.testFilter;renderResults();document.querySelector(`[data-test-filter="${filter}"]`)?.focus();}
    const action=button.dataset.testAction;
    if(action==='ask-end'){confirmEnd=true;render();document.querySelector('[data-test-action="keep-going"]')?.focus();}
    if(action==='keep-going'){confirmEnd=false;render();focusQuestion();}
    if(action==='finish')finishEarly();
    if(action==='new'){run=null;filter='all';renderGate();$('test-password').focus();}
    if(action==='pdf')downloadPDF();
  });
  document.addEventListener('visibilitychange',()=>syncClock());
  window.addEventListener('focus',()=>syncClock());
  window.addEventListener('beforeunload',event=>{if(isRunning()){event.preventDefault();event.returnValue='';}});
  window.AssyrianTest={render,start,isRunning,isComplete,readState(){return {running:isRunning(),completed:isComplete(),index:run?.index||0,total:TEST_SIZE,deadline:isRunning()?run.deadline:null,question:isRunning()?{id:run.questions[run.index].id,topic:run.questions[run.index].topic,prompt:run.questions[run.index].prompt}:null};},getReport:report};
})();
