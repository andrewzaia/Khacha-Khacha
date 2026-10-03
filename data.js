(function () {
  'use strict';
  // Roman spelling is a reading aid for common Eastern Sureth, not a reversible alphabet.
  const forward = new Map(), reverse = new Map(), bareReverse=new Map();
  const scriptKey=text=>String(text).normalize('NFC').replace(/[.!?,;:]/g,'').trim().replace(/\s+/g,' ');
  const key = text => String(text).normalize('NFD').replace(/[\u0300-\u036f\u0730-\u074a\u070f]/g,'').toLowerCase().replace(/[.!?,;:’'\-]/g,' ').trim().replace(/\s+/g,' ');
  function register(roman, syriac, aliases=[]) {
    if (!syriac) throw new Error('Missing Syriac: '+roman);
    forward.set(key(roman),syriac); reverse.set(scriptKey(syriac),roman);
    const bare=key(syriac);if(!bareReverse.has(bare))bareReverse.set(bare,roman);else if(bareReverse.get(bare)!==roman)bareReverse.set(bare,null);
    aliases.forEach(a=>forward.set(key(a),syriac));
    return roman;
  }
  function toSyriac(text) { return forward.get(key(text)) || String(text); }
  function toRoman(text) { return reverse.get(scriptKey(text)) || bareReverse.get(key(text)) || String(text); }
  function normalise(text) { return key(toRoman(text)); }
  function assess(input, answers) {
    const value=normalise(input); if(!value)return 'empty';
    return answers.some(a=>normalise(a)===value || (forward.has(key(a))&&forward.has(key(input))&&scriptKey(toSyriac(a))===scriptKey(toSyriac(input))))?'correct':'incorrect';
  }
  const letterRows=[
    ['Alap','ܐ','vowel carrier','Often carries a vowel. It does not always have a spoken consonant.'],
    ['Bet','ܒ','b / w','Hard b; a soft form is often w in Sureth.'],
    ['Gamal','ܓ','g / gh','Hard g as in go; a soft form is gh.'],
    ['Dalat','ܕ','d / dh','Hard d as in dog; softened pronunciation varies by dialect.'],
    ['He','ܗ','h','An airy h as in hello.'],['Waw','ܘ','w / oo / oh','Can be a consonant w or help write a vowel.'],
    ['Zain','ܙ','z','Like z in zoo.'],['Khet','ܚ','kh','A back-of-the-throat sound, close to ch in Scottish loch.'],
    ['Tet','ܛ','emphatic t','A heavier t sound; there is no exact English match.'],['Yod','ܝ','y / ee','Can be y as in yes or help write a vowel.'],
    ['Kap','ܟ','k / kh','Hard k or soft kh.'],['Lamad','ܠ','l','Like l in lamp.'],['Mim','ܡ','m','Like m in moon.'],
    ['Nun','ܢ','n','Like n in net.'],['Semkat','ܣ','s','Like s in sun.'],['Ayn','ܥ','historical throat sound','Often weak or silent in everyday Sureth. Keep it in the spelling.'],
    ['Pe','ܦ','p / f','Hard p or soft f.'],['Sadhe','ܨ','emphatic s','A heavier s sound.'],['Qop','ܩ','q','A k-like sound made further back in the mouth.'],
    ['Resh','ܪ','r','Tap or gently roll the r.'],['Shin','ܫ','sh','Like sh in shop.'],['Taw','ܬ','t / th','Hard t or soft th as in thin; dialects vary.']
  ];
  const exampleRows=[
    ['ana','ܐܵܢܵܐ','I','ah-nah'],['bayta','ܒܲܝܬܵܐ','house','bye-tah'],['gawra','ܓܲܒ݂ܪܵܐ','man','gow-rah'],['dayra','ܕܲܝܪܵܐ','monastery','dye-rah'],
    ['hawa','ܗܵܘܵܐ','air','hah-wah'],['warda','ܘܲܪܕܵܐ','rose','war-dah'],['zuze','ܙܘܼܙܹ̈ܐ','money','zoo-zeh'],['khubba','ܚܘܼܒܵܐ','love','khoo-bah'],
    ['tura','ܛܘܼܪܵܐ','mountain','too-rah'],['yoma','ܝܵܘܡܵܐ','day','yoh-mah'],['ktawa','ܟܬܵܒ݂ܵܐ','book','ktah-wah'],['lishana','ܠܸܫܵܢܵܐ','language / tongue','li-shah-nah'],
    ['mayya','ܡܝܼ̈ܵܐ','water','my-yah'],['nura','ܢܘܼܪܵܐ','fire','noo-rah'],['sahra','ܣܲܗܪܵܐ','moon','sah-rah'],['ayna','ܥܲܝܢܵܐ','eye','eye-nah'],
    ['pumma','ܦܘܼܡܵܐ','mouth','poom-mah'],['sapra','ܨܲܦܪܵܐ','morning','sap-rah'],['qala','ܩܵܠܵܐ','voice / sound','qah-lah'],['resha','ܪܹܫܵܐ','head','reh-shah'],
    ['shlama','ܫܠܵܡܵܐ','peace / hello','shlah-mah'],['tara','ܬܲܪܥܵܐ','door','tah-rah']
  ];
  exampleRows.forEach(r=>register(r[0],r[1]));
  const alphabet=letterRows.map((r,i)=>{register(r[0],r[1]);return {id:'letter-'+i,latin:r[0],syriac:r[1],sound:r[2],note:r[3],english:exampleRows[i][2],example:exampleRows[i][0],label:r[0],kind:'letter'};});
  const numberRows=[
    [1,'kha','ܚܲܕ݇','khah',['khad']], [2,'tre','ܬܪܹܝܢ','treh',['tren','trey']], [3,'tlatha','ܬܠܵܬ݂ܵܐ','tlah-thah',['tla']],
    [4,'arba','ܐܲܪܒܥܵܐ','ar-bah',[]], [5,'khamsha','ܚܲܡܫܵܐ','kham-shah',[]], [6,'shta','ܫܬܵܐ','shtah',['ishta']],
    [7,'shawwa','ܫܲܒ݂ܥܵܐ','shaw-wah',['shawa','shaba']], [8,'tmanya','ܬܡܵܢܝܵܐ','tmah-nyah',[]], [9,'tisha','ܬܸܫܥܵܐ','ti-shah',['tesha']], [10,'isra','ܥܸܣܪܵܐ','is-rah',['esra']],
    [11,'khadesar','ܚܲܕܥܣܲܪ','khah-deh-sar',['khad esar']], [12,'tresar','ܬܪܸܥܣܲܪ','treh-sar',[]], [13,'tlathesar','ܬܠܵܬܥܣܲܪ','tlah-theh-sar',[]],
    [14,'arbesar','ܐܲܪܒܥܣܲܪ','ar-beh-sar',[]], [15,'khamshesar','ܚܲܡܫܥܣܲܪ','kham-sheh-sar',[]], [16,'shtesar','ܫܬܥܣܲܪ','shteh-sar',[]],
    [17,'shawesar','ܫܒ݂ܥܣܲܪ','shaw-eh-sar',['shawwasar']], [18,'tmanyesar','ܬܡܵܢܥܣܲܪ','tmah-nyeh-sar',[]], [19,'tishesar','ܬܸܫܥܣܲܪ','ti-sheh-sar',[]],
    [20,'isri','ܥܸܣܪܝܼܢ','is-ree',['esri','isrin','esrin']], [30,'tlathi','ܬܠܵܬ݂ܝܼܢ','tlah-thee',['tlathin']], [40,'arbi','ܐܲܪܒܥܝܼܢ','ar-bee',['arbin']],
    [50,'khamshi','ܚܲܡܫܝܼܢ','kham-shee',['khamshin']], [60,'shti','ܫܬܝܼܢ','shtee',['shtin']], [70,'shawwi','ܫܲܒ݂ܥܝܼܢ','shaw-wee',['shawi','shabin']],
    [80,'tmanyi','ܬܡܵܢܝܼܢ','tmah-nyee',['tmanyin']], [90,'tishi','ܬܸܫܥܝܼܢ','ti-shee',['tishin']], [100,'maa','ܡܵܐܐ','mah-ah',['ma','mea']],
    [1000,'alpa','ܐܲܠܦܵܐ','al-pah',[]], [10000,'isra alpe','ܥܸܣܪܵܐ ܐܲܠܦܹ̈ܐ','is-rah al-peh',[]]
  ];
  numberRows.forEach(r=>register(r[1],r[2],r[4]));
  const numbers=numberRows.map(r=>({id:'number-'+r[0],latin:r[1],english:r[0].toLocaleString('en-AU'),sound:r[3],label:r[0].toLocaleString('en-AU'),note:r[0]===1?'The written dalat is often silent: kha. Khad is also accepted.':r[0]===2?'Tre is a common spoken form; tren is also accepted.':r[0]===3?'Tlatha is the fuller form; you may also hear tla.':r[0]===20?'The final written nun in the tens is often silent in speech. Isrin is accepted too.':'These are standalone counting forms. Forms can change when counting nouns.'}));
  const pronounRows=[
    ['ana','ܐܵܢܵܐ','I','ah-nah','The person speaking.'], ['at','ܐܲܢ݇ܬ','you · one person','aht','At is used for one person; ati is another common pronunciation. Verb endings distinguish gender.'],
    ['aw','ܐܵܘ','he / masculine it','ow','For a male person or masculine noun.'], ['ay','ܐܵܝ','she / feminine it','eye','For a female person or feminine noun.'],
    ['akhnan','ܐܲܚܢܲܢ','we','akh-nan','Includes the speaker and other people. Akhni is a common regional form.'],
    ['akhtun','ܐܲܚܬܘܿܢ','you · more than one person','akh-toon','Use for a group. Akhton is another common spelling.'],
    ['ani','ܐܵܢܝܼ','they','ah-nee','For a group of people. Ane is another common pronunciation.']
  ];
  const pronounAliases={at:['ati'],akhnan:['akhni'],akhtun:['akhton'],ani:['ane']};
  const pronouns=pronounRows.map((r,i)=>{register(r[0],r[1],pronounAliases[r[0]]||[]);return {id:'pronoun-'+i,latin:r[0],english:r[2],sound:r[3],note:r[4],label:r[0],sub:r[2]};});
  const subjects=[
    ['ana','I (male speaker)','iwen','ܝܼܘܸܢ','ee-wen'],['ana','I (female speaker)','iwan','ܝܼܘܵܢ','ee-wahn'],
    ['at','you (one male)','iwet','ܝܼܘܸܬ','ee-wet'],['at','you (one female)','iwat','ܝܼܘܵܬܝ','ee-waht'],
    ['aw','he','ileh','ܝܼܠܹܗ','ee-leh'],['ay','she','ilah','ܝܼܠܵܗ̇','ee-lah'],
    ['akhnan','we','iwakh','ܝܼܘܲܚ','ee-wakh'],['akhtun','you (a group)','itun','ܝܼܬܘܿܢ','ee-toon'],['ani','they','ina','ܝܼܢܵܐ','ee-nah']
  ].map(([pronoun,meaning,verb,syriac,sound])=>{register(verb,syriac,{iwen:['ewin','iwin'],iwan:['ewan','eewan'],iwet:['ewit','iwit'],iwat:['ewat'],itun:['iton'],ileh:['ile','eeleh'],ilah:['ila'],iwakh:['ewakh']}[verb]||[]);register(pronoun+' '+verb,toSyriac(pronoun)+' '+syriac);return {pronoun,meaning,verb,sound};});
  const be=subjects.map((s,i)=>({id:'be-'+i,latin:s.pronoun+' '+s.verb,english:s.meaning+' '+(s.pronoun==='ana'?'am':['aw','ay'].includes(s.pronoun)?'is':'are'),sound:pronouns.find(p=>p.latin===s.pronoun).sound+' '+s.sound,label:s.pronoun+' '+s.verb,sub:s.meaning,note:'Learn the matching ending. The first and second person singular forms distinguish male and female.'}));
  const places=[['akha','ܐܲܟ݂ܵܐ','here'],['tama','ܬܵܡܵܐ','there'],['go bayta','ܓܵܘ ܒܲܝܬܵܐ','at home'],['go madrasha','ܓܵܘ ܡܲܕܪܵܫܵܐ','at school']];
  places.forEach(p=>register(p[0],p[1]));
  function sentenceFor(s,p){const text=`${s.pronoun} ${p[0]} ${s.verb}`;register(text,`${toSyriac(s.pronoun)} ${p[1]} ${toSyriac(s.verb)}`);return text;}
  function sentenceMeaning(s,p){return `${s.meaning} ${s.pronoun==='ana'?'am':['aw','ay'].includes(s.pronoun)?'is':'are'} ${p[2]}`;}
  be.forEach((c,i)=>{c.example=sentenceFor(subjects[i],places[0]);c.exampleMeaning=sentenceMeaning(subjects[i],places[0]);c.note+=' Akha means here. The ending comes after the place in these example sentences.';});
  const phraseRows=[
    ['shlama','ܫܠܵܡܵܐ','Hello','shlah-mah','A greeting related to the word peace.'],
    ['shlama lokh','ܫܠܵܡܵܐ ܠܘܼܟ݂','Hello · to one male','shlah-mah lokh','Lokh addresses one male.'],
    ['shlama lakh','ܫܠܵܡܵܐ ܠܵܟ݂ܝ','Hello · to one female','shlah-mah lakh','Lakh addresses one female.'],
    ['shlama lokhun','ܫܠܵܡܵܐ ܠܵܘܟ݂ܘܿܢ','Hello · to a group','shlah-mah loh-khoon','A greeting to more than one person.'],
    ['bshena','ܒܫܲܝܢܵܐ','Welcome','b-sheh-nah','Literally in peace. Also used as a warm reply.'],
    ['qdamta brikhta','ܩܲܕܲܡܬܵܐ ܒܪܝܼܟ݂ܬܵܐ','Good morning','q-dam-tah bree-kh-tah','Literally blessed morning.'],
    ['ramsha brikha','ܪܲܡܫܵܐ ܒܪܝܼܟ݂ܵܐ','Good evening','ram-shah bree-khah','Literally blessed evening.'],
    ['push bshena','ܦܘܼܫ ܒܫܲܝܢܵܐ','Goodbye · to one male staying behind','poosh b-sheh-nah','Stay in peace. Used by the person leaving.'],
    ['dakhi iwet','ܕܵܐܟ݂ܝܼ ܝܼܘܸܬ','How are you? · to one male','dah-khee ee-wet','Iwet is the male singular ending.'],
    ['dakhi iwat','ܕܵܐܟ݂ܝܼ ܝܼܘܵܬܝ','How are you? · to one female','dah-khee ee-waht','Iwat is the female singular ending.'],
    ['dakhi itun','ܕܵܐܟ݂ܝܼ ܝܼܬܘܿܢ','How are you? · to a group','dah-khee ee-toon','Itun is the plural ending.'],
    ['spay iwen','ܨܦܵܝܝܼ ܝܼܘܸܢ','I am well · male speaker','spy ee-wen','Spay means well / good.'],
    ['spay iwan','ܨܦܵܝܝܼ ܝܼܘܵܢ','I am well · female speaker','spy ee-wahn','The ending agrees with the speaker.'],
    ['basima','ܒܲܣܝܼܡܵܐ','Thank you · to one male','bah-see-mah','Use basimta when thanking a female.'],
    ['basimta','ܒܲܣܝܼܡܬܵܐ','Thank you · to one female','bah-seem-tah','Use basima when thanking a male.'],
    ['basime','ܒܲܣܝܼܡܹ̈ܐ','Thank you · to a group','bah-see-meh','The plural form.'],
    ['tawdi','ܬܵܘܕܝܼ','Thanks','tow-dee','A useful alternative expression of thanks.'],
    ['in basmalukh','ܐܸܢ ܒܲܣܡܵܐ ܠܘܼܟ݂','Please · to one male','in bas-mah-lookh','The final part addresses one male.'],
    ['in basmalakh','ܐܸܢ ܒܲܣܡܵܐ ܠܵܟ݂ܝ','Please · to one female','in bas-mah-lakh','The final part addresses one female.'],
    ['in basmalokhun','ܐܸܢ ܒܲܣܡܵܐ ܠܵܘܟ݂ܘܿܢ','Please · to a group','in bas-mah-loh-khoon','The final part addresses a group.'],
    ['he','ܗܹܐ','Yes','heh','A short positive answer.'],['la','ܠܵܐ','No','lah','A short negative answer.'],
    ['pakhalta','ܦܲܚܲܠܬܵܐ','Sorry / excuse me','pa-khal-tah','A useful apology.'],
    ['shimmi ileh Rami','ܫܸܡܝܼ ܝܼܠܹܗ ܪܵܡܝܼ','My name is Rami','shim-mee ee-leh rah-mee','Shimmi means my name. Replace Rami with your name.'],
    ['modi ileh shimukh','ܡܘܼܕܝܼ ܝܼܠܹܗ ܫܸܡܘܼܟ݂','What is your name? · to one male','moh-dee ee-leh shi-mookh','Shimukh means your name when speaking to a male.'],
    ['modi ileh shimakh','ܡܘܼܕܝܼ ܝܼܠܹܗ ܫܸܡܵܟ݂ܝ','What is your name? · to one female','moh-dee ee-leh shi-makh','Shimakh addresses a female.'],
    ['len parmuye','ܠܹܝܢ ܦܲܪܡܘܼܝܹܐ','I do not understand','lehn par-moo-yeh','Say this when you need help understanding.'],
    ['he khacha','ܗܹܐ ܚܲܟ̰ܵܐ','Yes, a little','heh kha-chah','A simple reply about how much you speak.'],
    ['khacha khacha','ܚܲܟ̰ܵܐ ܚܲܟ̰ܵܐ','Little by little','kha-chah kha-chah','The name of your learning space. Khacha means a little.']
  ];
  const conversation=phraseRows.map((r,i)=>{register(r[0],r[1]);return {id:'phrase-'+i,latin:r[0],english:r[2],sound:r[3],note:r[4],label:r[0]};});
  const lessons=[
    {id:'alphabet',title:'The alphabet',assyrian:'Alap Bet',short:'22 letters · right to left',description:'Meet the Syriac letters. Learn their names and try a few familiar words.',tip:'Syriac reads from right to left. Letters join and may change shape in a word. Dots and vowel marks help you read. Roman spellings are speaking guides, not a second Assyrian alphabet.',cards:alphabet},
    {id:'numbers',title:'Numbers',assyrian:'Minyana',short:'1 to 10,000',description:'Start with 1–10, then learn the teens, tens and simple combinations.',tip:'For 21–99, use the tens + u (and) + the unit: isri u kha = 21. This lesson uses standalone Eastern counting forms. Number words change with the nouns they count.',cards:numbers},
    {id:'pronouns',title:'Pronouns',assyrian:'Ana, at, aw…',short:'I, you, we…',description:'Learn the small words that tell us who we mean.',tip:'Ana = I. At = you, one person. Akhtun = you, a group. Aw and ay also refer to masculine and feminine things. Family dialects may use ati, akhni or ane.',cards:pronouns},
    {id:'be',title:'“To be”',assyrian:'Iwen, iwan, ileh…',short:'I am · you are · we are',description:'Build small sentences and learn the ending that matches the person.',tip:'A male speaker uses iwen for I am; a female speaker uses iwan. One male you uses iwet; one female you uses iwat. Learn the whole phrase and notice the ending.',cards:be},
    {id:'conversation',title:'Everyday conversation',assyrian:'Shlama!',short:'Greetings & first phrases',description:'Say hello, thank someone, introduce yourself and ask for help.',tip:'Many greetings change depending on who you address. Basima thanks one male, basimta one female, and basime a group. Start with shlama, tawdi and pakhalta.',cards:conversation}
  ];
  const quiz=Object.fromEntries(lessons.map(l=>[l.id,[]])),practice=Object.fromEntries(lessons.map(l=>[l.id,[]]));
  const unique=values=>[...new Map(values.map(v=>[normalise(v),String(v)])).values()];
  function addQuiz(topic,prompt,answer,candidates,explanation,category,optionsScript='display'){
    const equivalentGroups=[['shlama','shlama lokh','shlama lakh','shlama lokhun'],['basima','basimta','basime','tawdi']];
    const generic=answer==='shlama'||answer==='tawdi';
    const excluded=topic==='conversation'?equivalentGroups.find(g=>g.includes(answer))||[]:[];
    const wrong=unique(candidates).filter(v=>normalise(v)!==normalise(answer)&&(!excluded.includes(v)||(!generic&&v!=='shlama'&&v!=='tawdi')));if(wrong.length<3)throw new Error('Not enough choices: '+prompt);
    const offset=quiz[topic].length%wrong.length;const choices=[0,1,2].map(i=>wrong[(offset+i)%wrong.length]);
    quiz[topic].push([prompt,answer,choices,explanation,{id:topic+'-quiz-'+quiz[topic].length,category,optionsScript}]);
  }
  function addPractice(topic,prompt,answers,hint,category,optionsScript='display'){
    practice[topic].push([prompt,answers,hint,{id:topic+'-practice-'+practice[topic].length,category,optionsScript,latinOnly:optionsScript==='roman'}]);
  }
  const names=alphabet.map(c=>c.latin),letters=alphabet.map(c=>c.syriac),words=exampleRows.map(r=>r[0]),meanings=exampleRows.map(r=>r[2]);
  alphabet.forEach((c,i)=>{
    addQuiz('alphabet',`Which letter name belongs to ${c.syriac}?`,c.latin,names,`${c.syriac} is ${c.latin}. ${c.note}`,'letter-name','roman');
    addQuiz('alphabet',`Find the Syriac letter ${c.latin}.`,c.syriac,letters,`${c.latin} = ${c.syriac}.`,'letter-shape','syriac');
    addQuiz('alphabet',`Which letter has the cue “${c.sound}”?`,c.latin,names,`${c.latin}: ${c.note}`,'letter-sound','roman');
    addQuiz('alphabet',`Read ${toSyriac(c.example)}. Choose the Roman spelling.`,c.example,words,`${c.example} means ${c.english}.`,'word-reading','roman');
    addQuiz('alphabet',`What does “${c.example}” mean?`,c.english,meanings,`${c.example} = ${c.english}.`,'word-meaning','english');
    addQuiz('alphabet',`Which lesson word means “${c.english}”?`,c.example,words,`${c.example} = ${c.english}.`,'word-recall');
    addPractice('alphabet',`Name the letter ${c.syriac} using Roman spelling.`,[c.latin],c.note,'letter-name','roman');
    addPractice('alphabet',`Read ${toSyriac(c.example)}. Type the Roman spelling.`,[c.example],`It means ${c.english}.`,'word-reading','roman');
    addPractice('alphabet',`Write the lesson word for “${c.english}”.`,[c.example],`Pronunciation cue: ${exampleRows[i][3]}.`,'word-recall');
  });
  const base=new Map(numberRows.map(r=>[r[0],r]));
  function numberWord(n){if(base.has(n))return base.get(n)[1];if(Number.isInteger(n)&&n>20&&n<100){const tens=base.get(Math.floor(n/10)*10),unit=base.get(n%10);const roman=tens[1]+' u '+unit[1];register(roman,tens[2]+' ܘ'+unit[2],[roman.replace(' u ',' w ')]);return roman;}throw new Error('Number outside this course');}
  const values=[...Array.from({length:100},(_,i)=>i+1),1000,10000],numberWords=values.map(numberWord);
  values.forEach(n=>{
    const roman=numberWord(n),digits=n.toLocaleString('en-AU'),explanation=`${digits} = ${roman}.`;
    addQuiz('numbers',`Choose the counting form for ${digits}.`,roman,numberWords,explanation,'number-to-word');
    addQuiz('numbers',`Read “${roman}”. Which number is it?`,digits,values.map(v=>v.toLocaleString('en-AU')),explanation,'word-to-number','digits');
    addQuiz('numbers',`Read ${toSyriac(roman)}. Which number is it?`,digits,values.map(v=>v.toLocaleString('en-AU')),explanation,'script-to-number','digits');
    addPractice('numbers',`Write ${digits} in Sureth (standalone counting form).`,[roman,...(base.get(n)?.[4]||[])],n>20&&n<100&&n%10?'Use tens + u + unit.':'Use the reference-card spelling.','number-to-word');
    if(n>20&&n<100&&n%10){
      const tens=numberWord(Math.floor(n/10)*10),unit=numberWord(n%10);
      addQuiz('numbers',`Complete ${digits}: ${tens} u ___.`,unit,values.slice(0,9).map(numberWord),explanation,'compound-unit');
      addQuiz('numbers',`Complete ${digits}: ___ u ${unit}.`,tens,[20,30,40,50,60,70,80,90].map(numberWord),explanation,'compound-tens');
      addPractice('numbers',`Complete ${digits}: ${tens} u ___. Type the unit.`,[unit],`The last digit is ${n%10}.`,'compound-unit');
    }
  });
  const pronounChoices=pronouns.map(c=>c.latin),pronounMeanings=pronouns.map(c=>c.english);
  pronouns.forEach(c=>{
    addQuiz('pronouns',`Choose the pronoun for “${c.english}”.`,c.latin,pronounChoices,`${c.latin} means ${c.english}.`,'pronoun-recall');
    addQuiz('pronouns',`What does “${c.latin}” mean?`,c.english,pronounMeanings,`${c.latin} = ${c.english}.`,'pronoun-meaning','english');
    addQuiz('pronouns',`Read ${toSyriac(c.latin)}. Which pronoun is it?`,c.latin,pronounChoices,c.note,'pronoun-reading','roman');
    addPractice('pronouns',`Write the pronoun for “${c.english}”.`,[c.latin,...(pronounAliases[c.latin]||[])],c.note,'pronoun-recall');
  });
  const scenarios=[['You refer to yourself.','ana'],['You address one friend.','at'],['You address your brother.','at'],['You address your sister.','at'],['You address two friends together.','akhtun'],['You address your whole family.','akhtun'],['You refer to a man as he.','aw'],['You refer to a boy as he.','aw'],['You refer to a woman as she.','ay'],['You refer to a girl as she.','ay'],['You and a friend together are we.','akhnan'],['You and your family together are we.','akhnan'],['Two people across the room are they.','ani'],['A group of women are they.','ani'],['A group of men are they.','ani']];
  scenarios.forEach(([p,a])=>{addQuiz('pronouns',p+' Choose the pronoun.',a,pronounChoices,pronouns.find(c=>c.latin===a).note,'people-scenario');addPractice('pronouns',p+' Write the pronoun.',[a],pronouns.find(c=>c.latin===a).note,'people-scenario');});
  const verbChoices=subjects.map(s=>s.verb);
  subjects.forEach(s=>{
    addQuiz('be',`Choose the ending for “${s.meaning} ${s.pronoun==='ana'?'am':['aw','ay'].includes(s.pronoun)?'is':'are'}”.`,s.verb,verbChoices,`${s.pronoun} ${s.verb}: ${s.meaning}.`,'ending-recall');
    addQuiz('be',`Read “${s.pronoun} ${s.verb}”. Which person does it describe?`,s.meaning,subjects.map(x=>x.meaning),`The ending ${s.verb} matches ${s.meaning}.`,'ending-meaning','english');
    addPractice('be',`Write the ending for “${s.meaning} ${s.pronoun==='ana'?'am':['aw','ay'].includes(s.pronoun)?'is':'are'}”.`,[s.verb],`Cue: ${s.sound}.`,'ending-recall');
    places.forEach(p=>{
      const sentence=sentenceFor(s,p),meaning=sentenceMeaning(s,p);
      addQuiz('be',`“${meaning}.” Fill the ending: ${s.pronoun} ${p[0]} ___.`,s.verb,verbChoices,`${sentence} = ${meaning}.`,'sentence-ending');
      addQuiz('be',`Choose the whole sentence: “${meaning}”.`,sentence,subjects.map(x=>sentenceFor(x,p)),`${sentence} = ${meaning}.`,'sentence-building');
      addQuiz('pronouns',`“${meaning}.” Fill the pronoun: ___ ${p[0]} ${s.verb}.`,s.pronoun,pronounChoices,`${sentence} uses ${s.pronoun} for ${s.meaning}.`,'sentence-pronoun');
      addPractice('be',`Write “${meaning}” using pronoun + ${p[0]} + ending.`,[sentence],`${p[0]} means ${p[2]}.`,'sentence-building');
      addPractice('pronouns',`“${meaning}.” Fill the pronoun: ___ ${p[0]} ${s.verb}.`,[s.pronoun],`You need the word for ${s.meaning}.`,'sentence-pronoun');
    });
  });
  const phrases=conversation.map(c=>c.latin),phraseMeanings=conversation.map(c=>c.english);
  conversation.forEach(c=>{
    addQuiz('conversation',`Choose the phrase for “${c.english}”.`,c.latin,phrases,`${c.latin} = ${c.english}. ${c.note}`,'phrase-recall');
    addQuiz('conversation',`What does “${c.latin}” mean?`,c.english,phraseMeanings,c.note,'phrase-meaning','english');
    addQuiz('conversation',`Read ${toSyriac(c.latin)}. Choose the Roman spelling.`,c.latin,phrases,`${c.latin} = ${c.english}.`,'phrase-reading','roman');
    addPractice('conversation',`Write the lesson phrase for “${c.english}”.`,[c.latin],c.note,'phrase-recall');
  });
  const dialogues=[
    ['A man is asked: Dakhi iwet? Reply “I am well”.','spay iwen'],['A woman is asked: Dakhi iwat? Reply “I am well”.','spay iwan'],
    ['Thank one male who helped you.','basima'],['Thank one female who helped you.','basimta'],['Thank a group who helped you.','basime'],
    ['Greet one male friend.','shlama lokh'],['Greet one female friend.','shlama lakh'],['Greet a whole group.','shlama lokhun'],
    ['Ask a male friend how he is.','dakhi iwet'],['Ask a female friend how she is.','dakhi iwat'],['Ask a group how they are.','dakhi itun'],
    ['Introduce yourself as Rami.','shimmi ileh Rami'],['Ask a male friend his name.','modi ileh shimukh'],['Ask a female friend her name.','modi ileh shimakh'],
    ['Greet someone in the morning.','qdamta brikhta'],['Greet someone in the evening.','ramsha brikha'],['Say that you do not understand.','len parmuye'],
    ['Add “please” when speaking to one male.','in basmalukh'],['Add “please” when speaking to one female.','in basmalakh'],['Add “please” when speaking to a group.','in basmalokhun'],
    ['Apologise with “sorry”.','pakhalta'],['Reply “yes, a little” about how much you speak.','he khacha']
  ];
  dialogues.forEach(([p,a])=>{addQuiz('conversation',p+' Choose the lesson phrase.',a,phrases,conversation.find(c=>c.latin===a).note,'dialogue-situation');addPractice('conversation',p+' Write the lesson phrase.',[a],conversation.find(c=>c.latin===a).note,'dialogue-situation');});
  function createQuestionDeck(pool, random = Math.random) {
    const bank = [...pool];
    if(!bank.length || new Set(bank.map(q => q.id)).size !== bank.length) throw new Error('Question IDs must be unique');
    let remaining = [];
    const shuffled = values => {const out=[...values];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
    return {
      draw(count) {
        if(!Number.isInteger(count)||count<1||count>bank.length) throw new Error('Invalid round length');
        const selected=[], ids=new Set(), categories=new Set();
        while(selected.length<count){
          if(!remaining.length) remaining=shuffled(bank);
          let index=remaining.findIndex(q=>!ids.has(q.id)&&!categories.has(q.category));
          if(index<0)index=remaining.findIndex(q=>!ids.has(q.id));
          if(index<0)throw new Error('Unable to draw a distinct round');
          const [question]=remaining.splice(index,1);
          selected.push(question);ids.add(question.id);categories.add(question.category);
        }
        return selected;
      }
    };
  }
  const poolCounts=Object.fromEntries(lessons.map(l=>[l.id,{quiz:quiz[l.id].length,practice:practice[l.id].length}]));
  window.Assyrian={lessons,quiz,practice,toSyriac,toRoman,normalise,assess,createQuestionDeck,poolCounts,numberWord};
})();
