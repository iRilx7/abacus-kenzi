// © 2025 Kenzi. All rights reserved.
(()=>{
  // iOS double-tap zoom guard
  let lastTouchEnd=0;
  document.addEventListener('touchend', function(e){
    const now=Date.now();
    if(now-lastTouchEnd<=350){ e.preventDefault(); }
    lastTouchEnd=now;
  }, {passive:false});

  // i18n
  const I = {
    ar: {
      brand:"🧮 كنزي | تدريب الأباكوس",
      trainer:"التدريب", worksheet:"ورقة تدريبات",
      setup:"الإعداد", mode:"العملية", mixed:"+ / − (مخلوط)", digits:"عدد الخانات لكل رقم",
      strictHelp:"الخانات الصارمة: إذا اخترت ٢ خانتين فستظهر أرقام من 10 إلى 99 فقط (لا تظهر 1-خانة). في الطرح نلتزم بالخانتين ونمنع الناتج السالب بتبديل تلك الخطوة إلى جمع عند الحاجة.",
      strictEx:"مثال: 35 − 12 + 47 (كل رقم من خانتين)",
      howmany:"عدد الأرقام المعروضة", speed:"السرعة",
      flash:"مدة ظهور الرقم (ث)", gap:"الفاصل بين الأرقام (ث)",
      flashExplain:"المدة = زمن عرض كل رقم. الفاصل = زمن الصمت بين رقمٍ وآخر.",
      beep:"صوت عند كل رقم", noneg:"لا مجموع سالب", strict:"خانات صارمة",
      start:"ابدأ", pause:"إيقاف مؤقت", stop:"إيقاف", keys:"اختصارات: مسافة = ابدأ/أوقف • إنتر = إرسال • R = إعادة",
      play:"اللعب", num:"الرقم", elapsed:"الوقت", submit:"إرسال",
      previous:"السؤال السابق", history:"السجل", export:"تصدير CSV", clear:"مسح",
      slow:"بطيء", normal:"عادي", fast:"سريع",
      ready:"استعد!", readyDone:"انطلق!", correct:"صحيح!", answer:"الإجابة: ",
      last:"السابق",
      corner:"عرض سجل الأرقام في الركن",
      // worksheet
      wtitle:"مولّد ورقة تدريبات", wcols:"عدد الأعمدة", wrows:"عدد الأرقام بكل عمود",
      wdigits:"الخانات", wmode:"نوع الإشارات", wgenerate:"توليد ورقة",
      wprint:"طباعة", whelp:"ورقة +/− مع خانة لإجابة الطالب، وخط واضح أسفل رقم العمود.",
      wshowans:"إظهار الإجابة لكل عمود",
      checkall:"تحقق من جميع الإجابات",
      title:"🧮 كنزي | تدريب الأباكوس للأطفال (Kenzi Abacus)"
    },
    en: {
      brand:"🧮 Kenzi | Abacus Trainer",
      trainer:"Trainer", worksheet:"Worksheet",
      setup:"Setup", mode:"Mode", mixed:"Mixed +/-", digits:"Digits per number",
      strictHelp:"Strict digits: choosing 2 means every number is 10–99. Subtractions keep the same digits; if negative, switch to addition.",
      strictEx:"Example: 35 − 12 + 47 (all two-digit)",
      howmany:"How many numbers", speed:"Speed",
      flash:"Flash (s)", gap:"Gap (s)",
      flashExplain:"Flash = how long a number shows. Gap = quiet time between numbers.",
      beep:"Beep each number", noneg:"No negative total", strict:"Strict digits",
      start:"Start", pause:"Pause", stop:"Stop", keys:"Shortcuts: Space=start/pause • Enter=submit • R=restart",
      play:"Play", num:"Number", elapsed:"Elapsed", submit:"Submit",
      previous:"Previous", history:"History", export:"Export CSV", clear:"Clear",
      slow:"Slow", normal:"Normal", fast:"Fast",
      ready:"Get ready!", readyDone:"Go!", correct:"Correct!", answer:"Answer: ",
      last:"Last",
      corner:"Show corner stack",
      wtitle:"Worksheet Generator", wcols:"Columns", wrows:"Rows/column",
      wdigits:"Digits", wmode:"Signs", wgenerate:"Generate",
      wprint:"Print", whelp:"Stacked +/- columns with a student answer box per column.",
      wshowans:"Show answer per column",
      checkall:"Check all",
      title:"🧮 Kenzi | Abacus Trainer (Kids)"
    }
  };
  let lang="ar";
  const $ = s=>document.querySelector(s);
  const $$ = s=>Array.from(document.querySelectorAll(s));
  function applyI18n(){
    const t=I[lang];
    document.documentElement.lang=lang;
    document.documentElement.dir=(lang==="ar")?"rtl":"ltr";
    document.title=t.title;
    $("#brand").textContent=t.brand;
    $$("[data-i]").forEach(el=>{ const k=el.getAttribute("data-i"); if(t[k]) el.textContent=t[k]; });
    $("#status").textContent=(lang==="ar")?"جاهز":"Idle";
    $("#readyText").textContent=t.ready;
  }
  $$(".lang .chip").forEach(b=> b.onclick=()=>{ lang=b.dataset.lang; applyI18n(); });
  applyI18n();

  // tabs
  $$(".tab").forEach(tab=>{
    tab.onclick=()=>{
      $$(".tab").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
      const scr=tab.dataset.tab;
      document.querySelector("main.layout").setAttribute("data-screen", scr);
      $$(".card.t").forEach(c=> c.style.display=(scr==="trainer")?"block":"none");
      $$(".card.w").forEach(c=> c.style.display=(scr==="worksheet")?"block":"none");
    };
  });
  // default = trainer
  $$(".card.w").forEach(c=> c.style.display="none");

  // helpers
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const fmt=s=>(Math.round(s*10)/10).toFixed(1)+'s';
  const s2ms=s=>Math.round(parseFloat(s)*1000);
  const isTouch=('ontouchstart' in window)|| (navigator.maxTouchPoints>0);

  // trainer
  const status=$("#status"), displayText=$("#displayText"), idx=$("#idx"), total=$("#total"), elapsed=$("#elapsed");
  const answer=$("#answer"), result=$("#result");
  const overlay=$("#overlay"), barFill=$("#barFill");
  const prevSeq=$("#prevSeq"), prevAns=$("#prevAns"), progFill=$("#progFill");
  const cornerStack=$("#cornerStack");
  const cornerToggle=$("#cornerToggle");

  if(isTouch){ answer.setAttribute('readonly','readonly'); answer.setAttribute('inputmode','none'); }
  else { answer.removeAttribute('readonly'); answer.setAttribute('inputmode','numeric'); }

  function updateCornerVisibility(){ cornerStack.style.display = cornerToggle.checked ? 'flex':'none'; }
  cornerToggle.addEventListener('change', updateCornerVisibility); updateCornerVisibility();

  let mode="mix", digits=1, count=3, flash=1.0, gap=0.2;
  let strictDigits=true, noNegative=true, beeps=true;
  $("#modeTiles").addEventListener("click", e=>{
    if(!e.target.classList.contains("tile")) return;
    mode=e.target.dataset.val; $$("#modeTiles .tile").forEach(x=>x.classList.remove("active")); e.target.classList.add("active");
  });
  const digitsOut=$("#digitsOut"), countOut=$("#countOut"), flashOut=$("#flashOut"), gapOut=$("#gapOut");
  $("#digitsMinus").onclick=()=>{ digits=clamp(digits-1,1,6); digitsOut.textContent=digits; };
  $("#digitsPlus").onclick =()=>{ digits=clamp(digits+1,1,6); digitsOut.textContent=digits; };
  $$("[data-d]").forEach(b=> b.onclick=()=>{ digits=+b.dataset.d; digitsOut.textContent=digits; });
  $("#countMinus").onclick =()=>{ count=clamp(count-1,1,50); countOut.textContent=count; };
  $("#countPlus").onclick  =()=>{ count=clamp(count+1,1,50); countOut.textContent=count; };
  $$("[data-c]").forEach(b=> b.onclick=()=>{ count=+b.dataset.c; countOut.textContent=count; });
  const stepS=v=>Math.round((v+Number.EPSILON)*10)/10;
  $("#flashMinus").onclick=()=>{ flash=clamp(stepS(flash-0.1),0.1,5); flashOut.textContent=flash.toFixed(1); };
  $("#flashPlus").onclick =()=>{ flash=clamp(stepS(flash+0.1),0.1,5); flashOut.textContent=flash.toFixed(1); };
  $("#gapMinus").onclick  =()=>{ gap  =clamp(stepS(gap-0.1),0,5); gapOut.textContent=gap.toFixed(1); };
  $("#gapPlus").onclick   =()=>{ gap  =clamp(stepS(gap+0.1),0,5); gapOut.textContent=gap.toFixed(1); };
  $("#beep").onchange=e=> beeps=e.target.checked;
  $("#noNegative").onchange=e=> noNegative=e.target.checked;
  $("#strictDigits").onchange=e=> strictDigits=e.target.checked;

  // beep
  let ctx;
  function beep(dur=0.05,freq=800,vol=0.05){
    if(!beeps) return;
    try{
      ctx = ctx || new (window.AudioContext||window.webkitAudioContext)();
      const o=ctx.createOscillator(), g=ctx.createGain(); o.type="sine"; o.frequency.value=freq; g.gain.value=vol;
      o.connect(g); g.connect(ctx.destination); o.start(); setTimeout(()=>o.stop(), dur*1000);
    }catch{}
  }

  function digitRange(d){ return {min:Math.pow(10,d-1), max:Math.pow(10,d)-1}; }
  function genSequence(){
    const {min:autoMin,max:autoMax}=digitRange(digits);
    const min=autoMin, max=autoMax;
    const seq=[]; let running=0;
    if(mode==="mul"){
      const a=ri(min,max), b=ri(min,max);
      seq.push({sign:'×',val:a}); seq.push({sign:'',val:b});
      return {seq, answer:a*b};
    }
    for(let i=0;i<count;i++){
      let s = (mode==="add")?'+':(mode==="sub")?'-':(Math.random()<0.5?'+':'-');
      if(s==='-' && noNegative){
        if(strictDigits && running < autoMin) s='+';
        if(!strictDigits && running <= 0) s='+';
      }
      let v;
      if(s==='+'){ v = ri(min,max); }
      else{
        const upper = Math.min(running,max);
        if(strictDigits){
          if(upper < autoMin){ s='+'; v=ri(min,max); }
          else { v=ri(autoMin,upper); }
        }else{
          if(upper < min){ s='+'; v=ri(min,max); }
          else { v=ri(min,upper); }
        }
      }
      running = s==='+'? running+v : running-v;
      seq.push({sign:s,val:v});
    }
    return {seq, answer:running};
  }

  let state={running:false, paused:false, seq:[], answer:0, startTs:0};

  function showOverlay(ms=1200){
    overlay.style.display="flex"; barFill.style.width="0%";
    const start=performance.now();
    const step=()=>{
      const p=Math.min(1,(performance.now()-start)/ms);
      barFill.style.width=(p*100)+"%";
      if(p<1 && overlay.style.display==="flex") requestAnimationFrame(step);
      else { setTimeout(()=>overlay.style.display="none", 140); }
    };
    requestAnimationFrame(step);
  }

  async function run(){
    const pack=genSequence(); state.seq=pack.seq; state.answer=pack.answer;
    state.running=true; state.paused=false; state.startTs=performance.now();
    $("#display").classList.remove("dim"); displayText.textContent="•";
    idx.textContent="0"; total.textContent=String(state.seq.length);
    progFill.style.width="0%"; result.style.display="none"; cornerStack.innerHTML="";
    $("#status").textContent=(lang==="ar")?"يعمل":"Running";
    $("#startBtn").disabled=true; $("#pauseBtn").disabled=false; $("#stopBtn").disabled=false;
    showOverlay(1200); await sleep(1300);
    const fms=s2ms(flash), gms=s2ms(gap);
    for(let i=0;i<state.seq.length;i++){
      if(!state.running) return; await waitWhilePaused();
      const it=state.seq[i]; idx.textContent=String(i+1);
      progFill.style.width=((i)/state.seq.length*100).toFixed(1)+"%";
      const signTxt = (it.sign==='+'?'+': it.sign==='-'?'−': it.sign)+' ';
      displayText.textContent = signTxt + it.val; beep(0.04,820);
      elapsed.textContent = fmt((performance.now()-state.startTs)/1000);
      await sleep(fms); if(!state.running) return; await waitWhilePaused();
      const txt=(it.sign==='×'||it.sign==='')? String(it.val):(signTxt+it.val).trim();
      const node=document.createElement("div"); node.className="bubble"; node.textContent=txt;
      cornerStack.appendChild(node); if(cornerStack.children.length>60) cornerStack.removeChild(cornerStack.firstChild);
      if(i<state.seq.length-1){ displayText.textContent="•"; await sleep(gms); }
    }
    progFill.style.width="100%"; displayText.textContent="=?"; if(!isTouch){ answer.focus(); }
  }

  function stop(reset=true){
    state.running=false; state.paused=false;
    $("#startBtn").disabled=false; $("#pauseBtn").disabled=true; $("#stopBtn").disabled=true;
    if(reset){ displayText.textContent="—"; $("#display").classList.add("dim"); }
    idx.textContent="0"; total.textContent="0"; elapsed.textContent="0.0s";
    overlay.style.display="none"; progFill.style.width="0%";
    $("#status").textContent=(lang==='ar')?'جاهز':'Idle';
  }

  function seqToBubbles(seq){
    prevSeq.innerHTML="";
    seq.forEach(s=>{
      const b=document.createElement("span"); b.className="bubble";
      const sign=(s.sign==='+'?'+': s.sign==='-'?'−': s.sign);
      b.textContent=(s.sign==='×'||s.sign==='')? String(s.val) : `${sign} ${s.val}`;
      prevSeq.appendChild(b);
    });
  }

  function submit(e){
    if(e){ e.preventDefault(); }
    const raw=(answer.value||"").trim(); if(raw==="") return;
    const guess=Number(raw.replace(/[,\s_]/g,""));
    const ok=(guess===state.answer);
    seqToBubbles(state.seq);
    prevAns.textContent = (lang==='ar'?'الإجابة: ':'Answer: ')+ state.answer;
    result.style.display="inline-block";
    result.textContent = ok ? (lang==='ar'?'صحيح!':'Correct!') : (lang==='ar'?'الإجابة: ':'Answer: ')+state.answer;
    result.style.background = ok ? "rgba(20,184,94,.12)" : "rgba(229,57,53,.10)";
    result.style.border = ok ? "2px solid rgba(20,184,94,.35)" : "2px solid rgba(229,57,53,.35)";
    $("#startBtn").disabled=false; $("#pauseBtn").disabled=true; $("#stopBtn").disabled=true;
    if(isTouch){ answer.blur(); }
  }
  $("#startBtn").onclick=()=>{ stop(false); run(); };
  $("#pauseBtn").onclick=()=>{ if(!state.running) return; state.paused=!state.paused; $("#pauseBtn").textContent=state.paused?(lang==='ar'?'ابدأ':'Start'):(lang==='ar'?'إيقاف مؤقت':'Pause'); $("#status").textContent=state.paused?(lang==='ar'?'متوقف':'Paused'):(lang==='ar'?'يعمل':'Running'); };
  $("#stopBtn").onclick=()=> stop();
  $("#submitBtn").onclick=(e)=>submit(e);

  if(!isTouch){
    answer.addEventListener("keydown", e=>{ if(e.key==="Enter") submit(e); });
    document.addEventListener("keydown", e=>{
      if(e.target && ["INPUT","TEXTAREA"].includes(e.target.tagName)) return;
      if(e.code==="Space"){ e.preventDefault(); if(!state.running){ stop(false); run(); } else { $("#pauseBtn").click(); } }
      if(e.key.toLowerCase()==="r"){ stop(false); run(); }
    });
  } else {
    document.addEventListener("keydown", e=>{ if(e.code==="Space") e.preventDefault(); });
  }
  $("#keypad").addEventListener("click", e=>{
    if(e.target.tagName!=="BUTTON") return;
    const t=e.target.textContent;
    if(t==="←"){ answer.value=answer.value.slice(0,-1); return; }
    if(t==="✖"){ answer.value=""; return; }
    if(/\d/.test(t)) answer.value+=t;
  });
  $("#exportBtn").onclick=()=>{
    const items=[...document.getElementById("hist").children].map(li=>li.textContent);
    if(items.length===0) return;
    const csv="Run\n"+items.map(x=>`"${x.replace(/"/g,'""')}"`).join("\n");
    const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="abacus_runs.csv"; a.click(); URL.revokeObjectURL(url);
  };
  $("#clearBtn").onclick=()=> document.getElementById("hist").innerHTML="";
  function sleep(ms){ return new Promise(res=>setTimeout(res,ms)); }
  async function waitWhilePaused(){ while(state.paused && state.running){ await sleep(80);} }

  // Worksheet generator
  let wCols=10, wRows=5, wDigits=2, wMode="mix", wShowAns=false;
  let sheetData=[]; // store generated columns to avoid regen
  const wColsOut=$("#wColsOut"), wRowsOut=$("#wRowsOut"), wDigitsOut=$("#wDigitsOut");
  const wColClamp=n=>clamp(n,1,20), wRowClamp=n=>clamp(n,3,12);
  $("#wColsMinus").onclick=()=>{ wCols=wColClamp(wCols-1); wColsOut.textContent=wCols; };
  $("#wColsPlus").onclick =()=>{ wCols=wColClamp(wCols+1); wColsOut.textContent=wCols; };
  $("#wRowsMinus").onclick=()=>{ wRows=wRowClamp(wRows-1); wRowsOut.textContent=wRows; };
  $("#wRowsPlus").onclick =()=>{ wRows=wRowClamp(wRows+1); wRowsOut.textContent=wRows; };
  $("#wDigitsMinus").onclick=()=>{ wDigits=clamp(wDigits-1,1,3); wDigitsOut.textContent=wDigits; };
  $("#wDigitsPlus").onclick =()=>{ wDigits=clamp(wDigits+1,1,3); wDigitsOut.textContent=wDigits; };
  $("#wModeTiles").addEventListener("click", e=>{
    if(!e.target.classList.contains("tile")) return;
    wMode=e.target.dataset.val; $$("#wModeTiles .tile").forEach(x=>x.classList.remove("active")); e.target.classList.add("active");
  });
  $("#wShowAns").onchange=e=>{ wShowAns = e.target.checked; refreshAnswerVisibility(); };

  function riDigits(d){ const a=Math.pow(10,d-1), b=Math.pow(10,d)-1; return ri(a,b); }
  function signPick(){ return wMode==="add"?'+': wMode==="sub"?'-': (Math.random()<0.5?'+':'-'); }

  function buildCol(index){
    const col=document.createElement("div"); col.className="sheetCol"; col.dataset.index=index;
    const h=document.createElement("h4"); h.textContent=String(index); col.appendChild(h);
    const div=document.createElement("div"); div.className="divider"; col.appendChild(div);

    const input=document.createElement("input"); input.className="ansInput"; input.placeholder=(lang==='ar'?'إجابة الطالب':'Student answer');
    input.setAttribute('inputmode','numeric'); col.appendChild(input);

    let sum=0; const terms=[];
    for(let r=0;r<wRows;r++){
      const line=document.createElement("div"); line.className="line";
      const s=signPick(); const num=riDigits(wDigits);
      if(s==='+'){ sum += num; line.textContent = String(num); terms.push({sign:'+',val:num}); }
      else { sum -= num; line.textContent = '−' + String(num); terms.push({sign:'-',val:num}); }
      col.appendChild(line);
    }
    const a=document.createElement("div"); a.className="ans"; a.textContent=(lang==='ar'?'الإجابة: ':'Ans: ')+String(sum);
    if(!wShowAns) a.style.display="none";
    col.appendChild(a);

    input.addEventListener('change', ()=>{
      const v=Number(input.value.trim()); col.classList.remove('correct','wrong');
      if(!isNaN(v)){
        if(v===sum) col.classList.add('correct'); else col.classList.add('wrong');
      }
    });

    sheetData[index-1]={sum, terms};
    return col;
  }

  function makeSheet(){
    sheetData = new Array(wCols).fill(null);
    const grid=$("#sheet"); grid.innerHTML="";
    $("#sheetMeta").textContent=new Date().toLocaleString();
    for(let c=1;c<=wCols;c++){ grid.appendChild(buildCol(c)); }
  }
  function refreshAnswerVisibility(){
    $$(".sheetCol .ans").forEach(a=> a.style.display = wShowAns ? "block":"none");
  }
  $("#genSheet").onclick=makeSheet;
  $("#checkAll").onclick=()=>{
    $$(".sheetCol").forEach(col=>{
      const input=col.querySelector(".ansInput"); const a=col.querySelector(".ans").textContent.replace(/[^0-9\-]/g,'');
      const sum=Number(a); const v=Number((input.value||'').trim()); col.classList.remove('correct','wrong');
      if(!isNaN(v)) { col.classList.add(v===sum?'correct':'wrong'); }
    });
  };
  $("#printStudent").onclick=()=>{
    // hide answers temporarily
    const prev=wShowAns; wShowAns=false; refreshAnswerVisibility(); window.print(); wShowAns=prev; refreshAnswerVisibility();
  };
  $("#printAnswers").onclick=()=>{
    const prev=wShowAns; wShowAns=true; refreshAnswerVisibility(); window.print(); wShowAns=prev; refreshAnswerVisibility();
  };

  // initial sheet
  makeSheet();
})();