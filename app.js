(()=>{
  let lastTouchEnd=0;
  document.addEventListener('touchend', function(e){
    const now=Date.now();
    if(now-lastTouchEnd<=350){ e.preventDefault(); }
    lastTouchEnd=now;
  }, {passive:false});

  const I = { ar: {
      brand:"🧮 كنزي الصوفي | تدريب الأباكوس", trainer:"التدريب", worksheet:"ورقة تدريبات",
      setup:"الإعداد", mode:"العملية", mixed:"+ / − (مخلوط)", digits:"عدد الخانات لكل رقم",
      howmany:"عدد الأرقام المعروضة", speed:"السرعة", flash:"مدة ظهور الرقم (ث)", gap:"الفاصل بين الأرقام (ث)",
      flashExplain:"المدة = عرض الرقم، الفاصل = المسافة بين الأرقام.", beep:"صوت عند كل رقم", noneg:"لا مجموع سالب", strict:"خانات صارمة",
      start:"ابدأ", pause:"إيقاف مؤقت", stop:"إيقاف", keys:"اختصارات: مسافة = ابدأ/أوقف • إنتر = إرسال • R = إعادة",
      play:"اللعب", num:"الرقم", elapsed:"الوقت", submit:"إرسال",
      previous:"السؤال السابق", slow:"بطيء", normal:"عادي", fast:"سريع", ready:"استعد!", corner:"عرض سجل الأرقام في الركن",
      wtitle:"مولّد ورقة تدريبات", wcols:"عدد الأعمدة", wrows:"عدد الأرقام بكل عمود", wdigits:"الخانات", wmode:"نوع الإشارات", wgenerate:"توليد ورقة",
      whelp:"كل عمود = سؤال. يوجد حقل لإجابة الطالب + زر 👁 لإظهار الحل لذلك العمود + زر ✓ للتحقق.",
      correct:"إجابة صحيحة ✓", wrong:"إجابة خاطئة ✗", theAnswer:"الإجابة: "
    },
    en: {
      brand:"🧮 Kenzi AL-Soufi | Abacus Trainer", trainer:"Trainer", worksheet:"Worksheet",
      setup:"Setup", mode:"Mode", mixed:"Mixed +/-", digits:"Digits per number",
      howmany:"How many numbers", speed:"Speed", flash:"Flash (s)", gap:"Gap (s)",
      flashExplain:"Flash = show time; Gap = time between numbers.", beep:"Beep", noneg:"No negative", strict:"Strict digits",
      start:"Start", pause:"Pause", stop:"Stop", keys:"Shortcuts: Space=start/pause • Enter=submit • R=restart",
      play:"Play", num:"Number", elapsed:"Elapsed", submit:"Submit",
      previous:"Previous", slow:"Slow", normal:"Normal", fast:"Fast", ready:"Get ready!", corner:"Show corner stack",
      wtitle:"Worksheet Generator", wcols:"Columns", wrows:"Rows/column", wdigits:"Digits", wmode:"Signs", wgenerate:"Generate",
      whelp:"Each column is a question. Student answer box, 👁 reveal, ✓ check.",
      correct:"Correct ✓", wrong:"Wrong ✗", theAnswer:"Answer: "
    }
  };
  let lang="ar";
  const $ = s=>document.querySelector(s);
  const $$ = s=>Array.from(document.querySelectorAll(s));
  function applyI18n(){
    const t=I[lang]; document.documentElement.lang=lang; document.documentElement.dir=(lang==="ar")?"rtl":"ltr";
    document.title="🧮 كنزي الصوفي | تدريب الأباكوس للأطفال (Kenzi Abacus)"; $("#brand").textContent=t.brand;
    $$("[data-i]").forEach(el=>{ const k=el.getAttribute("data-i"); if(t[k]) el.textContent=t[k]; });
    $("#status").textContent=(lang==='ar')?'جاهز':'Idle'; $("#readyText").textContent=t.ready||"استعد!";
  }
  $$(".lang .chip").forEach(b=> b.onclick=()=>{ lang=b.dataset.lang; applyI18n(); });
  applyI18n();

  $$(".tab").forEach(tab=>{
    tab.onclick=()=>{
      $$(".tab").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector("main.layout").setAttribute("data-screen", tab.dataset.tab);
      window.scrollTo({top:0, behavior:"smooth"});
    };
  });

  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const fmt=s=>(Math.round(s*10)/10).toFixed(1)+'s';
  const isTouch=('ontouchstart' in window)|| (navigator.maxTouchPoints>0);
  const displayText=$("#displayText"), idx=$("#idx"), total=$("#total"), elapsed=$("#elapsed");
  const answer=$("#answer"), result=$("#result");
  const overlay=$("#overlay"), barFill=$("#barFill"); const prevSeq=$("#prevSeq"), prevAns=$("#prevAns"), progFill=$("#progFill");
  const cornerStack=$("#cornerStack"), cornerToggle=$("#cornerToggle");
  if(isTouch){ answer.setAttribute('readonly','readonly'); answer.setAttribute('inputmode','none'); }

  function updateCornerVisibility(){ cornerStack.style.display = cornerToggle.checked ? 'flex':'none'; }
  cornerToggle.addEventListener('change', updateCornerVisibility); updateCornerVisibility();

  let mode="mix", digits=1, count=3, flash=1.0, gap=0.2; let strictDigits=true, noNegative=true, beeps=true;
  $("#modeTiles").addEventListener("click", e=>{ if(!e.target.classList.contains("tile")) return; mode=e.target.dataset.val; $$("#modeTiles .tile").forEach(x=>x.classList.remove("active")); e.target.classList.add("active"); });
  const digitsOut=$("#digitsOut"), countOut=$("#countOut"), flashOut=$("#flashOut"), gapOut=$("#gapOut");
  $("#digitsMinus").onclick=()=>{ digits=clamp(digits-1,1,6); digitsOut.textContent=digits; };
  $("#digitsPlus").onclick =()=>{ digits=clamp(digits+1,1,6); digitsOut.textContent=digits; };
  $$("[data-d]").forEach(b=> b.onclick=()=>{ digits=+b.dataset.d; digitsOut.textContent=digits; });
  $("#countMinus").onclick =()=>{ count=clamp(count-1,1,50); countOut.textContent=count; };
  $("#countPlus").onclick  =()=>{ count=clamp(count+1,1,50); countOut.textContent=count; };
  $$("[data-c]").forEach(b=> b.onclick=()=>{ count=+b.dataset.c; countOut.textContent=count; });
  const stepS=v=>Math.round((v+Number.EPSILON)*10)/10;
  $("#flashMinus").onclick=()=>{ flash=Math.max(.1, stepS(flash-0.1)); flashOut.textContent=flash.toFixed(1); };
  $("#flashPlus").onclick =()=>{ flash=Math.min(5, stepS(flash+0.1));  flashOut.textContent=flash.toFixed(1); };
  $("#gapMinus").onclick  =()=>{ gap  =Math.max(0, stepS(gap-0.1));    gapOut.textContent=gap.toFixed(1); };
  $("#gapPlus").onclick   =()=>{ gap  =Math.min(5, stepS(gap+0.1));    gapOut.textContent=gap.toFixed(1); };
  $("#beep").onchange=e=> beeps=e.target.checked; $("#noNegative").onchange=e=> noNegative=e.target.checked; $("#strictDigits").onchange=e=> strictDigits=e.target.checked;

  let ctx; function beep(d=0.05,f=800,v=0.05){ if(!beeps) return; try{ ctx=ctx||new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(), g=ctx.createGain(); o.type="sine"; o.frequency.value=f; g.gain.value=v; o.connect(g); g.connect(ctx.destination); o.start(); setTimeout(()=>o.stop(), d*1000);}catch{} }
  function digitRange(d){ return {min:Math.pow(10,d-1), max:Math.pow(10,d)-1}; }
  function riDigits(d){ const r=digitRange(d); return Math.floor(Math.random()*(r.max-r.min+1))+r.min; }

  function genSequence(){
    const {min,max}=digitRange(digits);
    const seq=[]; let running=0;
    if(mode==="mul"){ const a=riDigits(digits), b=riDigits(digits); seq.push({sign:'×',val:a}); seq.push({sign:'',val:b}); return {seq,answer:a*b}; }
    for(let i=0;i<count;i++){
      let s = (mode==="add")?'+':(mode==="sub")?'-':(Math.random()<0.5?'+':'-');
      if(s==='-' && noNegative){ if(strictDigits && running<min) s='+'; if(!strictDigits && running<=0) s='+'; }
      let v;
      if(s==='+'){ v=riDigits(digits); }
      else{
        const upper = Math.min(running, max);
        if(strictDigits){ if(upper<min){ s='+'; v=riDigits(digits);} else { v=Math.floor(Math.random()*(upper-min+1))+min; } }
        else{ if(upper<min){ s='+'; v=riDigits(digits);} else { v=Math.floor(Math.random()*(upper-min+1))+min; } }
      }
      running = s==='+'? running+v : running-v;
      seq.push({sign:s,val:v});
    }
    return {seq, answer:running};
  }

  let state={running:false, paused:false, seq:[], answer:0, startTs:0};
  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  async function waitWhilePaused(){ while(state.paused && state.running){ await sleep(80);} }
  function showOverlay(ms=1000){
    $("#overlay").style.display="flex"; $("#barFill").style.width="0%";
    const start=performance.now();
    const step=()=>{
      const p=Math.min(1,(performance.now()-start)/ms);
      $("#barFill").style.width=(p*100)+'%';
      if(p<1 && $("#overlay").style.display==="flex") requestAnimationFrame(step);
      else setTimeout(()=>$("#overlay").style.display="none",120);
    };
    requestAnimationFrame(step);
  }

  async function run(){
    const pack=genSequence(); state.seq=pack.seq; state.answer=pack.answer;
    state.running=true; state.paused=false; state.startTs=performance.now();
    $("#display").classList.remove("dim"); $("#displayText").textContent="•";
    $("#idx").textContent="0"; $("#total").textContent=String(state.seq.length);
    $("#progFill").style.width="0%"; $("#result").style.display="none"; $("#result").className='resultBanner'; $("#answer").classList.remove('ok','bad'); $("#cornerStack").innerHTML="";
    $("#status").textContent=(lang==='ar')?'يعمل':'Running';
    $("#startBtn").disabled=true; $("#pauseBtn").disabled=false; $("#stopBtn").disabled=false;
    showOverlay(900); await sleep(950);
    const fms=Math.round(parseFloat($("#flashOut").textContent)*1000);
    const gms=Math.round(parseFloat($("#gapOut").textContent)*1000);
    for(let i=0;i<state.seq.length;i++){
      if(!state.running) return; await waitWhilePaused();
      const it=state.seq[i];
      $("#idx").textContent=String(i+1);
      $("#progFill").style.width=((i)/state.seq.length*100).toFixed(1)+'%';
      const signTxt=(it.sign==='+'?'+': it.sign==='-'?'−': it.sign)+' ';
      $("#displayText").textContent=signTxt+it.val; beep(0.04,820);
      $("#elapsed").textContent=fmt((performance.now()-state.startTs)/1000);
      await sleep(fms); if(!state.running) return; await waitWhilePaused();
      const txt=(it.sign==='×'||it.sign==='')? String(it.val):(signTxt+it.val).trim();
      const node=document.createElement('div'); node.className='bubble'; node.textContent=txt; $("#cornerStack").appendChild(node);
      if($("#cornerStack").children.length>80) $("#cornerStack").removeChild($("#cornerStack").firstChild);
      if(i<state.seq.length-1){ $("#displayText").textContent='•'; await sleep(gms); }
    }
    $("#progFill").style.width='100%'; $("#displayText").textContent='=?';
    $("#startBtn").disabled=false; $("#pauseBtn").disabled=true; $("#stopBtn").disabled=true;
    $("#status").textContent=(lang==='ar')?'أجب ثم ابدأ من جديد':'Answer or start again';
  }

  function stop(reset=true){
    state.running=false; state.paused=false;
    $("#startBtn").disabled=false; $("#pauseBtn").disabled=true; $("#stopBtn").disabled=true;
    if(reset){ $("#displayText").textContent='—'; $("#display").classList.add('dim'); }
    $("#idx").textContent='0'; $("#total").textContent='0'; $("#elapsed").textContent='0.0s';
    $("#overlay").style.display='none'; $("#progFill").style.width='0%';
    $("#status").textContent=(lang==='ar')?'جاهز':'Idle';
  }

  function seqToBubbles(seq){
    $("#prevSeq").innerHTML='';
    seq.forEach(s=>{
      const b=document.createElement('span'); b.className='bubble';
      const sign=(s.sign==='+'?'+': s.sign==='-'?'−': s.sign);
      b.textContent=(s.sign==='×'||s.sign==='')? String(s.val) : `${sign} ${s.val}`;
      $("#prevSeq").appendChild(b);
    });
  }

  function submit(e){
    if(e) e.preventDefault();
    const raw=($("#answer").value||'').trim();
    if(raw===''){
      $("#result").style.display='inline-block';
      $("#result").className='resultBanner bad';
      $("#result").textContent=I[lang].theAnswer + String(state.answer);
      $("#answer").classList.remove('ok'); $("#answer").classList.add('bad');
      $("#startBtn").disabled=false; $("#pauseBtn").disabled=true; $("#stopBtn").disabled=true;
      return;
    }
    const guess=Number(raw.replace(/[,\s_]/g,''));
    const ok=(guess===state.answer);
    seqToBubbles(state.seq);
    $("#prevAns").textContent=I[lang].theAnswer + state.answer;
    $("#result").style.display='inline-block';
    $("#result").className='resultBanner ' + (ok?'ok':'bad');
    $("#result").textContent = ok ? I[lang].correct : (I[lang].wrong + ' — ' + I[lang].theAnswer + state.answer);
    $("#answer").classList.remove('ok','bad'); $("#answer").classList.add(ok?'ok':'bad');
    $("#startBtn").disabled=false; $("#pauseBtn").disabled=true; $("#stopBtn").disabled=true;
  }

  $("#startBtn").onclick=()=>{ stop(false); run(); };
  $("#pauseBtn").onclick=()=>{
    if(!state.running) return;
    state.paused=!state.paused;
    $("#pauseBtn").textContent=state.paused?(lang==='ar'?'ابدأ':'Start'):(lang==='ar'?'إيقاف مؤقت':'Pause');
    $("#status").textContent=state.paused?(lang==='ar'?'متوقف':'Paused'):(lang==='ar'?'يعمل':'Running');
  };
  $("#stopBtn").onclick=()=> stop();
  $("#submitBtn").onclick=(e)=>submit(e);

  if(!isTouch){
    $("#answer").addEventListener('keydown', e=>{ if(e.key==='Enter') submit(e); });
    document.addEventListener('keydown', e=>{
      if(e.target && ['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
      if(e.code==='Space'){ e.preventDefault(); if(!state.running){ stop(false); run(); } else { $("#pauseBtn").click(); } }
      if(e.key.toLowerCase()==='r'){ stop(false); run(); }
    });
  }

  $("#keypad").addEventListener("click", e=>{
    if(e.target.tagName!=="BUTTON") return;
    const t=e.target.textContent;
    if(t==="←"){ $("#answer").value=$("#answer").value.slice(0,-1); return; }
    if(t==="✖"){ $("#answer").value=""; return; }
    if(/\d/.test(t)) $("#answer").value += t;
  });

  // Worksheet
  let wCols=10, wRows=5, wDigits=2, wMode='mix';
  const wColsOut=$("#wColsOut"), wRowsOut=$("#wRowsOut"), wDigitsOut=$("#wDigitsOut");
  const clampN=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  $("#wColsMinus").onclick=()=>{ wCols=clampN(wCols-1,1,20); wColsOut.textContent=wCols; };
  $("#wColsPlus").onclick =()=>{ wCols=clampN(wCols+1,1,20); wColsOut.textContent=wCols; };
  $("#wRowsMinus").onclick=()=>{ wRows=clampN(wRows-1,3,12); wRowsOut.textContent=wRows; };
  $("#wRowsPlus").onclick =()=>{ wRows=clampN(wRows+1,3,12); wRowsOut.textContent=wRows; };
  $("#wDigitsMinus").onclick=()=>{ wDigits=clampN(wDigits-1,1,3); wDigitsOut.textContent=wDigits; };
  $("#wDigitsPlus").onclick =()=>{ wDigits=clampN(wDigits+1,1,3); wDigitsOut.textContent=wDigits; };
  $("#wModeTiles").addEventListener('click', e=>{ if(!e.target.classList.contains('tile')) return; wMode=e.target.dataset.val; $$("#wModeTiles .tile").forEach(x=>x.classList.remove('active')); e.target.classList.add('active'); });

  function riDigits(d){ const a=Math.pow(10,d-1), b=Math.pow(10,d)-1; return Math.floor(Math.random()*(b-a+1))+a; }
  function signPick(){ return wMode==='add'?'+': wMode==='sub'?'-': (Math.random()<0.5?'+':'-'); }

  function buildCol(index){
    const col=document.createElement('div'); col.className='sheetCol'; col.dataset.index=index;
    const h=document.createElement('h4'); h.textContent=String(index); col.appendChild(h);
    const div=document.createElement('div'); div.className='divider'; col.appendChild(div);
    const controls=document.createElement('div'); controls.className='controls';
    const reveal=document.createElement('button'); reveal.className='icn'; reveal.textContent='👁'; controls.appendChild(reveal);
    const check=document.createElement('button'); check.className='icn'; check.textContent='✓'; controls.appendChild(check);
    col.appendChild(controls);

    const input=document.createElement('input'); input.className='ansInput'; input.placeholder=(lang==='ar'?'إجابة الطالب':'Student answer'); input.setAttribute('inputmode','numeric'); col.appendChild(input);

    let sum=0;
    for(let r=0;r<wRows;r++){
      const line=document.createElement('div'); line.className='line';
      const s=signPick(); const num=riDigits(wDigits);
      if(s==='+'){ sum += num; line.textContent = String(num); }
      else { sum -= num; line.textContent = '−' + String(num); }
      col.appendChild(line);
    }
    const a=document.createElement('div'); a.className='ans'; a.textContent=(lang==='ar'?'الإجابة: ':'Ans: ')+String(sum);
    a.style.display='none'; col.dataset.sum=String(sum);
    col.appendChild(a);

    reveal.addEventListener('click', ()=>{ a.style.display = (a.style.display==='none')?'block':'none'; });
    check.addEventListener('click', ()=>{
      const v=Number((input.value||'').trim()); col.classList.remove('correct','wrong');
      if(!isNaN(v)){ col.classList.add(v===sum?'correct':'wrong'); }
    });
    return col;
  }

  function makeSheet(){
    const grid=$("#sheet"); grid.innerHTML=""; $("#sheetMeta").textContent=new Date().toLocaleString();
    for(let c=1;c<=wCols;c++){ grid.appendChild(buildCol(c)); }
  }
  $("#genSheet").onclick=makeSheet;
  $("#checkAll").onclick=()=>{
    $$(".sheetCol").forEach(col=>{
      const input=col.querySelector('.ansInput'); const sum=Number(col.dataset.sum);
      const v=Number((input.value||'').trim()); col.classList.remove('correct','wrong');
      if(!isNaN(v)) col.classList.add(v===sum?'correct':'wrong');
    });
  };
  makeSheet();
})();