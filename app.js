(()=>{
  // ---------- i18n ----------
  const I = {
    ar: {
      brand:"🧮 كنزي | تدريب الأباكوس",
      setup:"الإعداد", mode:"العملية", mixed:"+ / − (مخلوط)", digits:"عدد الخانات لكل رقم",
      strictHelp:"الخانات الصارمة: إذا اخترت 2 خانتين فستظهر أرقام من 10 إلى 99 فقط (لا تظهر 1-خانة). في الطرح نلتزم بالخانتين ونمنع الناتج السالب بتبديل تلك الخطوة إلى جمع عند الحاجة.",
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
      title:"🧮 كنزي | تدريب الأباكوس للأطفال (Kenzi Abacus)"
    },
    en: {
      brand:"🧮 Kenzi | Abacus Trainer",
      setup:"Setup", mode:"Mode", mixed:"Mixed +/-", digits:"Digits per number",
      strictHelp:"Strict digits: e.g., choosing 2 means every number is 10–99. In subtraction we still keep two digits; if that would go negative, we flip that step to addition.",
      strictEx:"Example: 35 − 12 + 47 (all two-digit)",
      howmany:"How many numbers", speed:"Speed",
      flash:"Flash time (seconds)", gap:"Gap between numbers (seconds)",
      flashExplain:"Flash = how long a number shows. Gap = quiet time between numbers.",
      beep:"Beep on each number", noneg:"Prevent negative total", strict:"Strict digits",
      start:"Start", pause:"Pause", stop:"Stop", keys:"Shortcuts: Space=start/pause • Enter=submit • R=restart",
      play:"Play", num:"Number", elapsed:"Elapsed", submit:"Submit",
      previous:"Previous question", history:"History", export:"Export CSV", clear:"Clear",
      slow:"Slow", normal:"Normal", fast:"Fast",
      ready:"Get ready!", readyDone:"Go!", correct:"Correct!", answer:"Answer: ",
      last:"Last",
      title:"🧮 Kenzi | Abacus Trainer (Kids)"
    }
  };
  let lang = "ar";
  const $ = s => document.querySelector(s);
  function applyI18n(){
    const t = I[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang==="ar") ? "rtl" : "ltr";
    document.title = t.title;
    const brand = document.getElementById("brand"); if(brand) brand.textContent = t.brand;
    document.querySelectorAll("[data-i]").forEach(el=>{
      const k = el.getAttribute("data-i");
      if(t[k]) el.textContent = t[k];
    });
    $("#answer").placeholder = (lang==="ar") ? "..." : "...";
    $("#status").textContent = (lang==="ar") ? "جاهز" : "Idle";
    $("#readyText").textContent = t.ready;
  }
  document.querySelectorAll(".lang .chip").forEach(b=>{
    b.onclick = ()=>{ lang = b.dataset.lang; applyI18n(); };
  });
  applyI18n();

  // ---------- helpers ----------
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const fmt=s=>(Math.round(s*10)/10).toFixed(1)+'s';
  const s2ms=s=>Math.round(parseFloat(s)*1000);

  // refs
  const status=$("#status"), display=$("#display"), idx=$("#idx"), total=$("#total"), elapsed=$("#elapsed");
  const answerWrap=$("#answerWrap"), answer=$("#answer"), result=$("#result");
  const overlay=$("#overlay"), readyText=$("#readyText"), barFill=$("#barFill");
  const prevSeq=$("#prevSeq"), prevAns=$("#prevAns"), progFill=$("#progFill");
  const lastBubble=$("#lastBubble");

  // options
  let mode="mix", digits=1, count=3, flash=1.0, gap=0.2;
  let strictDigits=true, noNegative=true, beeps=true;
  const showSigns=true;

  // controls
  $("#modeTiles").addEventListener("click", e=>{
    if(!e.target.classList.contains("tile")) return;
    mode = e.target.dataset.val;
    $("#modeTiles").querySelectorAll(".tile").forEach(x=>x.classList.remove("active"));
    e.target.classList.add("active");
  });
  const digitsOut=$("#digitsOut"), countOut=$("#countOut"), flashOut=$("#flashOut"), gapOut=$("#gapOut");
  $("#digitsMinus").onclick=()=>{ digits=clamp(digits-1,1,6); digitsOut.textContent=digits; };
  $("#digitsPlus").onclick =()=>{ digits=clamp(digits+1,1,6); digitsOut.textContent=digits; };
  document.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{ digits=+b.dataset.d; digitsOut.textContent=digits; });
  $("#countMinus").onclick =()=>{ count=clamp(count-1,1,50); countOut.textContent=count; };
  $("#countPlus").onclick  =()=>{ count=clamp(count+1,1,50); countOut.textContent=count; };
  document.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{ count=+b.dataset.c; countOut.textContent=count; });
  const stepS=v=>Math.round((v+Number.EPSILON)*10)/10;
  $("#flashMinus").onclick=()=>{ flash=clamp(stepS(flash-0.1),0.1,5); flashOut.textContent=flash.toFixed(1); };
  $("#flashPlus").onclick =()=>{ flash=clamp(stepS(flash+0.1),0.1,5); flashOut.textContent=flash.toFixed(1); };
  $("#gapMinus").onclick  =()=>{ gap  =clamp(stepS(gap-0.1),0,5);   gapOut.textContent  =gap.toFixed(1); };
  $("#gapPlus").onclick   =()=>{ gap  =clamp(stepS(gap+0.1),0,5);   gapOut.textContent  =gap.toFixed(1); };
  document.querySelectorAll(".chips .chip").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(btn.dataset.flash){ flash=+btn.dataset.flash; gap=+btn.dataset.gap; flashOut.textContent=flash.toFixed(1); gapOut.textContent=gap.toFixed(1); }
    });
  });
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
    overlay.style.display="flex"; barFill.style.width="0%"; readyText.textContent = I[lang].ready;
    const start=performance.now();
    const step=()=>{
      const p=Math.min(1,(performance.now()-start)/ms);
      barFill.style.width=(p*100)+"%";
      if(p<1 && overlay.style.display==="flex") requestAnimationFrame(step);
      else { readyText.textContent=I[lang].readyDone; setTimeout(()=>overlay.style.display="none", 180); }
    };
    requestAnimationFrame(step);
  }

  async function run(){
    const pack=genSequence();
    state.seq=pack.seq; state.answer=pack.answer;
    state.running=true; state.paused=false; state.startTs=performance.now();

    display.classList.remove("dim"); display.textContent="•";
    idx.textContent="0"; total.textContent=String(state.seq.length);
    progFill.style.width="0%";
    answerWrap.style.display="none"; result.style.display="none";
    status.textContent=(lang==="ar")?"يعمل":"Running";
    $("#startBtn").disabled=true; $("#pauseBtn").disabled=false; $("#stopBtn").disabled=false;

    showOverlay(1200); await sleep(1300);

    const fms=s2ms(flash), gms=s2ms(gap);
    for(let i=0;i<state.seq.length;i++){
      if(!state.running) return; await waitWhilePaused();
      const it=state.seq[i];
      idx.textContent=String(i+1);
      progFill.style.width = ((i)/state.seq.length*100).toFixed(1)+"%";
      const signTxt = (it.sign==='+'?'+': it.sign==='-'?'−': it.sign)+' ';
      display.textContent = signTxt + it.val;
      lastBubble.textContent = (it.sign==='×'||it.sign==='') ? String(it.val) : (signTxt + it.val).trim();
      beep(0.04,820);

      elapsed.textContent = fmt((performance.now()-state.startTs)/1000);
      await sleep(fms); if(!state.running) return; await waitWhilePaused();

      if(i<state.seq.length-1){ display.textContent="•"; await sleep(gms); }
    }
    progFill.style.width = "100%";

    display.textContent="=?";
    answerWrap.style.display="flex"; answer.value=""; answer.focus();
  }

  function stop(reset=true){
    state.running=false; state.paused=false;
    status.textContent=(lang==="ar")?"جاهز":"Idle";
    $("#startBtn").disabled=false; $("#pauseBtn").disabled=true; $("#stopBtn").disabled=true;
    if(reset){ display.textContent="—"; display.classList.add("dim"); }
    answerWrap.style.display="none"; result.style.display="none";
    idx.textContent="0"; total.textContent="0"; elapsed.textContent="0.0s";
    overlay.style.display="none"; progFill.style.width="0%";
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

  function celebrateOK(){
    try{
      if(navigator.vibrate) navigator.vibrate(80);
      const e=document.createElement("div");
      e.style.position="fixed"; e.style.inset="0"; e.style.pointerEvents="none";
      for(let i=0;i<18;i++){
        const s=document.createElement("div");
        s.textContent = i%2? "🎉":"⭐";
        s.style.position="absolute"; s.style.fontSize=(16+Math.random()*16)+"px";
        s.style.left=(Math.random()*100)+"%"; s.style.top="-10px";
        s.animate([{transform:"translateY(0)"},{transform:"translateY(110vh)"}],{duration:900+Math.random()*700,iterations:1,easing:"ease-out"});
        e.appendChild(s);
      }
      document.body.appendChild(e); setTimeout(()=>e.remove(),1200);
    }catch{}
  }

  function submit(){
    if(!("answer" in state)) return;
    const raw=(answer.value||"").trim(); if(!raw){ answer.focus(); return; }
    const guess=Number(raw.replace(/[,\s_]/g,""));
    const ok=(guess===state.answer);

    seqToBubbles(state.seq);
    prevAns.textContent = I[lang].answer + state.answer;

    result.style.display="inline-block";
    result.textContent = ok ? I[lang].correct : I[lang].answer + state.answer;
    result.style.background = ok ? "rgba(20,184,94,.12)" : "rgba(229,57,53,.10)";
    result.style.border = ok ? "2px solid rgba(20,184,94,.35)" : "2px solid rgba(229,57,53,.35)";
    if(ok) celebrateOK();

    const line=`[${new Date().toLocaleTimeString()}] ${mode.toUpperCase()} • ${digits}-digit • ${count} • ${flash}s/${gap}s • Ans=${state.answer} • Yours=${raw} • ${ok?'✔':'✘'}`;
    const li=document.createElement("li"); li.textContent=line; $("#hist").prepend(li);
    while($("#hist").children.length>150){ $("#hist").removeChild($("#hist").lastChild); }

    $("#startBtn").disabled=false; $("#pauseBtn").disabled=true; $("#stopBtn").disabled=true;
    status.textContent=(lang==="ar")?"انتهى":"Finished";
  }

  // buttons & keys
  $("#startBtn").onclick=()=>{ stop(false); run(); };
  $("#pauseBtn").onclick=()=>{ if(!state.running) return; state.paused=!state.paused; $("#pauseBtn").textContent=state.paused?I[lang].start:I[lang].pause; status.textContent=state.paused?((lang==="ar")?"متوقف":"Paused"):((lang==="ar")?"يعمل":"Running"); };
  $("#stopBtn").onclick=()=> stop();
  $("#submitBtn").onclick=submit;
  answer.addEventListener("keydown", e=>{ if(e.key==="Enter") submit(); });
  document.addEventListener("keydown", e=>{
    if(e.target && ["INPUT","TEXTAREA"].includes(e.target.tagName)) return;
    if(e.code==="Space"){ e.preventDefault(); if(!state.running){ stop(false); run(); } else { $("#pauseBtn").click(); } }
    if(e.key.toLowerCase()==="r"){ stop(false); run(); }
  });
  $("#keypad").addEventListener("click", e=>{
    if(e.target.tagName!=="BUTTON") return;
    const t=e.target.textContent;
    if(t==="←"){ answer.value=answer.value.slice(0,-1); return; }
    if(t==="✖"){ answer.value=""; return; }
    if(/\d/.test(t)) answer.value+=t; answer.focus();
  });

  // export / clear
  $("#exportBtn").onclick=()=>{
    const items=[...$("#hist").children].map(li=>li.textContent); if(items.length===0) return;
    const csv="Run\n"+items.map(x=>`"${x.replace(/"/g,'""')}"`).join("\n");
    const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="abacus_runs.csv"; a.click(); URL.revokeObjectURL(url);
  };
  $("#clearBtn").onclick=()=> $("#hist").innerHTML="";

  function sleep(ms){ return new Promise(res=>setTimeout(res,ms)); }
  async function waitWhilePaused(){ while(state.paused && state.running){ await sleep(80); } }
})();