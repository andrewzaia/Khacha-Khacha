(function(){
  'use strict';
  // Browser text shaping preserves joined Syriac letters and mixed text direction.
  // Each crisp page image has a Unicode ActualText layer for later text review.
  const encoder=new TextEncoder(),bytes=t=>encoder.encode(t);
  const join=parts=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let pos=0;parts.forEach(p=>{out.set(p,pos);pos+=p.length;});return out;};
  const utf16=t=>[...String(t)].map(c=>{const n=c.codePointAt(0);return n<=0xffff?n.toString(16).padStart(4,'0'):String.fromCodePoint(n).split('').map(x=>x.charCodeAt(0).toString(16).padStart(4,'0')).join('');}).join('').toUpperCase();
  const decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const W=595.28,H=841.89,M=42,BOTTOM=H-65,SCALE=3;
  const colors={ink:'#182c37',muted:'#52616b',blue:'#087e8b',correct:'#126844',incorrect:'#9b3e2d',missed:'#855b0d'};
  const font=(size)=>`${size}px KhachaSyriac, Arial, sans-serif`;
  const textSize=(text,size)=>/^[\s\u0700-\u074f\u0300-\u036f]+$/.test(text)?Math.max(size,17):size;
  const clean=t=>String(t).replace(/[\r\n\t\u00a0]/g,' ').replace(/\s+/g,' ').trim();
  function wrap(ctx,text,size){ctx.font=font(size);const lines=[];let line='';for(const word of clean(text).split(' ')){const next=(line?line+' ':'')+word;if(ctx.measureText(next).width>W-2*M&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
  async function create(report){
    if(!report||report.results?.length!==100)throw new Error('Complete a 100-question test first.');
    if(document.fonts){await document.fonts.load('20px KhachaSyriac');await document.fonts.ready;}
    const pages=[];let canvas,ctx,y,content=[];
    function draw(text,size=11,tone='ink'){
      ctx.font=font(size);ctx.fillStyle=colors[tone];ctx.textBaseline='alphabetic';
      const rtl=/^[\s\u0700-\u074f\u0300-\u036f]+$/.test(text);ctx.direction=rtl?'rtl':'ltr';ctx.textAlign=rtl?'right':'left';
      ctx.fillText(text,rtl?W-M:M,y);content.push({text,x:rtl?W-M-ctx.measureText(text).width:M,y,size});
    }
    function rule(at){ctx.strokeStyle='#d8e5e8';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(M,at);ctx.lineTo(W-M,at);ctx.stroke();}
    function flush(){if(!canvas)return;const data=canvas.toDataURL('image/jpeg',.94);pages.push({image:decode(data.split(',')[1]),width:canvas.width,height:canvas.height,content});}
    function page(){flush();canvas=document.createElement('canvas');canvas.width=Math.ceil(W*SCALE);canvas.height=Math.ceil(H*SCALE);ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable.');ctx.scale(SCALE,SCALE);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);content=[];y=38;draw('KHACHA KHACHA / SURETH PRACTICE',9,'blue');rule(49);y=80;}
    function paragraph(text,size=11,tone='ink',gap=6){size=textSize(text,size);for(const line of wrap(ctx,text,size)){if(y+size*1.75>BOTTOM)page();draw(line,size,tone);y+=size*1.75;}y+=gap;}
    function pair(label,text,tone='ink'){paragraph(label,9,'muted',1);paragraph(text,12,tone,5);}
    const duration=ms=>{const sec=Math.round(ms/1000);return Math.floor(sec/60)+'m '+String(sec%60).padStart(2,'0')+'s';};
    page();paragraph('Your test results',25,'ink',12);paragraph('100 mixed questions - one minute per question',11,'muted',12);
    paragraph(`${report.score} / 100 correct (${report.percent}%)`,24,'blue',14);
    paragraph(`${report.counts.correct} correct | ${report.counts.incorrect} incorrect | ${report.counts.missed} missed`,12,'ink',14);
    paragraph('Started: '+new Date(report.startedAt).toLocaleString('en-AU',{timeZoneName:'short'}),10,'muted');
    paragraph('Completed: '+new Date(report.completedAt).toLocaleString('en-AU',{timeZoneName:'short'}),10,'muted');
    paragraph('Time used: '+duration(report.durationMs)+' | Answers: '+(report.script==='syriac'?'Syriac':'Roman spelling'),10,'muted',16);
    if(report.endedEarly)paragraph('Test ended early. Unanswered questions are marked missed.',10,'missed',12);
    rule(y);y+=26;paragraph('By lesson',17,'ink',10);
    report.topics.forEach(t=>paragraph(`${t.title}: ${t.correct} / ${t.total} correct, ${t.incorrect} incorrect, ${t.missed} missed`,11,'ink',7));
    paragraph('The following pages show every question, your submitted answer, the correct answer and a short explanation.',11,'muted',10);
    paragraph('Missed means the minute expired or the test ended before an answer was submitted. All 100 questions count toward the score.',10,'muted');
    page();
    for(const row of report.results){
      const topic=report.topics.find(t=>t.id===row.topic).title;
      const answer=row.selected===null?row.reason:row.selected;
      const count=wrap(ctx,row.prompt,12).length*21+wrap(ctx,answer,textSize(answer,12)).length*textSize(answer,12)*1.75+wrap(ctx,row.answer,textSize(row.answer,12)).length*textSize(row.answer,12)*1.75+wrap(ctx,row.explanation,10).length*17.5+95;
      if(y+count>BOTTOM)page();
      paragraph(`Question ${row.number} / ${topic} / ${row.status.toUpperCase()}`,10,row.status,4);
      paragraph(row.prompt,12,'ink',5);pair('Your answer',answer);pair('Correct answer',row.answer,'blue');paragraph(row.explanation,10,'muted',10);rule(y);y+=18;
      // Yield between pages/items on slower phones.
      if(row.number%10===0)await new Promise(resolve=>setTimeout(resolve,0));
    }
    flush();
    return serialize(pages,report);
  }
  function serialize(pages,report){
    const objects=[null],add=data=>{objects.push(typeof data==='string'?bytes(data):data);return objects.length-1;};
    const stream=(data,extra='')=>join([bytes(`<< /Length ${data.length} ${extra} >>\nstream\n`),data,bytes('\nendstream')]);
    const catalog=add(''),tree=add(''),fontId=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const ids=pages.map((p,index)=>{
      const img=add(stream(p.image,`/Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`));
      let commands=`q ${W} 0 0 ${H} 0 0 cm /Img Do Q\n`;
      for(const l of p.content)commands+=`/Span << /ActualText <FEFF${utf16(l.text)}> >> BDC BT /F1 ${l.size} Tf 3 Tr 1 0 0 1 ${l.x.toFixed(2)} ${(H-l.y).toFixed(2)} Tm (x) Tj ET EMC\n`;
      commands+=`BT /F1 8 Tf 0.3 0.4 0.4 rg 0 Tr 1 0 0 1 ${M} 30 Tm (Khacha Khacha - Test review) Tj ET\nBT /F1 8 Tf 1 0 0 1 ${W-105} 30 Tm (Page ${index+1} of ${pages.length}) Tj ET\n`;
      const contents=add(stream(bytes(commands)));return add(`<< /Type /Page /Parent ${tree} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${fontId} 0 R >> /XObject << /Img ${img} 0 R >> >> /Contents ${contents} 0 R >>`);
    });
    objects[catalog]=bytes(`<< /Type /Catalog /Pages ${tree} 0 R >>`);objects[tree]=bytes(`<< /Type /Pages /Kids [${ids.map(i=>i+' 0 R').join(' ')}] /Count ${pages.length} >>`);
    const info=add(`<< /Title <FEFF${utf16(report.title)}> /Producer (Khacha Khacha) >>`);
    const parts=[bytes('%PDF-1.7\n')],offsets=[0];let offset=parts[0].length;
    for(let i=1;i<objects.length;i++){offsets[i]=offset;const chunk=join([bytes(i+' 0 obj\n'),objects[i],bytes('\nendobj\n')]);parts.push(chunk);offset+=chunk.length;}
    let xref='xref\n0 '+objects.length+'\n0000000000 65535 f \n';for(let i=1;i<objects.length;i++)xref+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    xref+=`trailer\n<< /Size ${objects.length} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${offset}\n%%EOF\n`;parts.push(bytes(xref));return join(parts);
  }
  window.AssyrianPDF={create};
})();
