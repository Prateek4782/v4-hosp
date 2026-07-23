/* ═══════════════════════════════════════════
   AFFINITY HOSPITAL — script.js
   Shared JS for index.html & conditions.html
═══════════════════════════════════════════ */

/* Progress bar */
const pgbar = document.getElementById('pgbar');
function updatePg(){
  const s=document.documentElement.scrollTop||document.body.scrollTop;
  const h=document.documentElement.scrollHeight-document.documentElement.clientHeight;
  if(pgbar) pgbar.style.width=(h>0?(s/h)*100:0)+'%';
}

/* Sticky nav */
const nav=document.getElementById('main-nav');
function updateNav(){ if(nav) nav.classList.toggle('scrolled',window.scrollY>60); }

/* Back to top */
const bktop=document.getElementById('bktop');
function updateBktop(){ if(bktop) bktop.classList.toggle('show',window.scrollY>400); }
if(bktop) bktop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

/* Scroll reveal */
function reveal(){
  document.querySelectorAll('.reveal:not(.visible),.reveal-l:not(.visible),.reveal-r:not(.visible)').forEach(el=>{
    if(el.getBoundingClientRect().top < window.innerHeight-60) el.classList.add('visible');
  });
}

window.addEventListener('scroll',()=>{updatePg();updateNav();updateBktop();reveal();},{passive:true});
window.addEventListener('load',()=>{reveal();updateNav();});

/* Hamburger */
const ham=document.getElementById('ham');
const mobNav=document.getElementById('mob-nav');
function closeMob(){
  if(ham){ham.classList.remove('open');ham.setAttribute('aria-expanded','false');}
  if(mobNav) mobNav.classList.remove('open');
  document.body.style.overflow='';
}
if(ham) ham.addEventListener('click',()=>{
  const o=ham.classList.toggle('open');
  if(mobNav) mobNav.classList.toggle('open',o);
  ham.setAttribute('aria-expanded',String(o));
  document.body.style.overflow=o?'hidden':'';
});

/* Conditions Dropdown — JS click-based (fixes hover gap vanish issue) */
const condDrop=document.getElementById('cond-drop');
if(condDrop){
  const trigger=condDrop.querySelector('a');
  trigger.addEventListener('click',e=>{
    /* If conditions.html exists let it navigate; toggle dropdown first */
    e.preventDefault();
    condDrop.classList.toggle('open');
  });
  /* Close when clicking outside */
  document.addEventListener('click',e=>{
    if(!condDrop.contains(e.target)) condDrop.classList.remove('open');
  });
  /* Allow clicking links inside dropdown to navigate normally */
  condDrop.querySelectorAll('.dropdown a').forEach(a=>{
    a.addEventListener('click',()=>condDrop.classList.remove('open'));
  });
}

/* Smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

/* Counter animation — only for stats-band, no intersection observer that could hide it */
function animCount(el){
  const target=parseInt(el.dataset.count);
  if(!target||el.dataset.counted)return;
  el.dataset.counted='1';
  const dur=1800,step=16,steps=Math.ceil(dur/step);
  let cur=0;
  const suffix=el.querySelector('span')?el.querySelector('span').outerHTML:'';
  const timer=setInterval(()=>{
    cur++;
    const val=Math.round(target*(cur/steps));
    el.innerHTML=val.toLocaleString()+(suffix);
    if(cur>=steps){el.innerHTML=target.toLocaleString()+suffix;clearInterval(timer);}
  },step);
}
/* Trigger counter when stats band is visible */
const cntObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('[data-count]').forEach(el=>animCount(el));
    }
  });
},{threshold:0.3});
const statsBand=document.getElementById('stats-band');
if(statsBand) cntObs.observe(statsBand);
/* Also animate hero stats on load */
window.addEventListener('load',()=>{
  document.querySelectorAll('.hero-stats [data-count]').forEach(el=>animCount(el));
});

/* FAQ accordion */
document.querySelectorAll('.faq-q').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item=btn.closest('.faq-item');
    const wasOpen=item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i=>{
      i.classList.remove('open');
      i.querySelector('.faq-q').setAttribute('aria-expanded','false');
    });
    if(!wasOpen){item.classList.add('open');btn.setAttribute('aria-expanded','true');}
  });
});

/* Form validation & Formspree AJAX integration */
const form=document.getElementById('appt-form');
const formBtn=document.getElementById('form-btn');
const formSuccess=document.getElementById('form-success');

function validateForm(){
  let ok=true;
  const name=document.getElementById('f-name');
  const phone=document.getElementById('f-phone');
  const dept=document.getElementById('f-dept');
  const nameOk = name?.value.trim().length >= 2;
  const phoneOk = /^[+\d\s\-()]{8,}$/.test(phone?.value.trim()||'');
  const deptOk = !!dept?.value;
  document.getElementById('fg-name')?.classList.toggle('err',!nameOk);
  document.getElementById('fg-phone')?.classList.toggle('err',!phoneOk);
  document.getElementById('fg-dept')?.classList.toggle('err',!deptOk);
  return nameOk && phoneOk && deptOk;
}

if(form) form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!validateForm()) return;
  if(formBtn){formBtn.textContent='⏳ Sending...';formBtn.disabled=true;}
  try{
    const res = await fetch('https://formspree.io/f/mgodyokd',{
      method:'POST',
      headers:{'Accept':'application/json'},
      body: new FormData(form)
    });
    if(res.ok){
      if(formSuccess){formSuccess.classList.add('show');}
      if(formBtn){formBtn.textContent='✅ Sent!';formBtn.disabled=false;}
      form.reset();
      setTimeout(()=>{if(formBtn)formBtn.textContent='📅 Request Appointment';},3000);
    } else {
      throw new Error('Server error');
    }
  } catch(err){
    console.error('Submission error:',err);
    if(formBtn){formBtn.textContent='⚠️ Error — Try Again';formBtn.disabled=false;}
  }
});
['f-name','f-phone','f-dept'].forEach(id=>{
  const el=document.getElementById(id);
  if(el) el.addEventListener('input',function(){this.closest('.fg')?.classList.remove('err');});
});

/* ── ASSESSMENT MODALS ── */
function openModal(type){
  document.getElementById('modal-'+type).classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(type){
  document.getElementById('modal-'+type).classList.remove('open');
  document.body.style.overflow='';
}
/* Close on overlay click */
document.querySelectorAll('.modal-overlay').forEach(overlay=>{
  overlay.addEventListener('click',e=>{
    if(e.target===overlay){
      overlay.classList.remove('open');
      document.body.style.overflow='';
    }
  });
});

/* PHQ-9 */
function calcPHQ9(e){
  e.preventDefault();
  const fd=new FormData(document.getElementById('form-phq9'));
  let score=0;
  for(let i=1;i<=9;i++) score+=parseInt(fd.get('p'+i)||0);
  let level,label,desc;
  if(score<=4){level='low';label='Minimal Depression';desc='Your score suggests minimal or no depression symptoms. Continue maintaining a healthy lifestyle.';}
  else if(score<=9){level='moderate';label='Mild Depression';desc='Your score suggests mild depression. We recommend speaking with a professional for a proper evaluation.';}
  else if(score<=14){level='moderate';label='Moderate Depression';desc='Your score suggests moderate depression. Professional consultation is recommended. Our team can help.';}
  else{level='high';label='Moderately-Severe Depression';desc='Your score indicates significant depression symptoms. Please book a consultation with Dr. Neena Vijayvargiya promptly.';}
  showResult('phq9',score+'/27',label,desc,level);
}

/* GAD-7 */
function calcGAD7(e){
  e.preventDefault();
  const fd=new FormData(document.getElementById('form-gad7'));
  let score=0;
  for(let i=1;i<=7;i++) score+=parseInt(fd.get('g'+i)||0);
  let level,label,desc;
  if(score<=4){level='low';label='Minimal Anxiety';desc='Your score suggests minimal anxiety. This is within the normal range.';}
  else if(score<=9){level='moderate';label='Mild Anxiety';desc='Your score suggests mild anxiety. A professional consultation can provide clarity and coping strategies.';}
  else if(score<=14){level='moderate';label='Moderate Anxiety';desc='Your score indicates moderate anxiety. We recommend speaking with our psychologist or psychiatrist.';}
  else{level='high';label='Severe Anxiety';desc='Your score indicates severe anxiety. Please book a consultation with our specialists as soon as possible.';}
  showResult('gad7',score+'/21',label,desc,level);
}

/* PSS-10 */
function calcPSS10(e){
  e.preventDefault();
  const fd=new FormData(document.getElementById('form-pss10'));
  const names=['s1','s2','s3','s4r','s5r','s6','s7r','s8r','s9','s10'];
  let score=names.reduce((s,n)=>s+parseInt(fd.get(n)||0),0);
  let level,label,desc;
  if(score<=13){level='low';label='Low Stress';desc='Your perceived stress level is low. Keep up your healthy coping habits!';}
  else if(score<=26){level='moderate';label='Moderate Stress';desc='Your stress levels are moderate. Speaking with a counsellor can help build better stress management skills.';}
  else{level='high';label='High Stress';desc='Your score indicates high perceived stress. Please consider booking a consultation with our team for personalised support.';}
  showResult('pss10',score+'/40',label,desc,level);
}

function showResult(type,score,label,desc,level){
  const box=document.getElementById('res-'+type);
  document.getElementById('score-'+type).textContent=score;
  document.getElementById('label-'+type).textContent=label;
  document.getElementById('desc-'+type).textContent=desc;
  box.className='result-box show '+level;
  box.scrollIntoView({behavior:'smooth',block:'nearest'});
}
/* ── WELCOME APPOINTMENT POPUP ── */
(function(){
  const overlay = document.getElementById('welcome-popup');
  if(!overlay) return;
  const box = overlay.querySelector('.popup-box');
  const closeBtn = document.getElementById('popup-close');
  const dismissBtn = document.getElementById('popup-dismiss');
  const form = document.getElementById('popup-appt-form');
  const formBtn = document.getElementById('popup-form-btn');
  const formSuccess = document.getElementById('popup-form-success');

  function openPopup(){
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closePopup(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* Show on every visit / refresh, after a short warm delay */
  window.addEventListener('load', () => setTimeout(openPopup, 900));

  /* Close on backdrop click (anywhere outside the card) */
  overlay.addEventListener('click', e => { if(e.target === overlay) closePopup(); });
  /* Close via ✕ button */
  if(closeBtn) closeBtn.addEventListener('click', closePopup);
  /* Gentle "maybe later" dismiss */
  if(dismissBtn) dismissBtn.addEventListener('click', closePopup);
  /* Close on Escape key */
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && overlay.classList.contains('open')) closePopup(); });

  function validatePopupForm(){
    let ok = true;
    const name = document.getElementById('pf-name');
    const phone = document.getElementById('pf-phone');
    const dept = document.getElementById('pf-dept');
    const nameOk = name?.value.trim().length >= 2;
    const phoneOk = /^[+\d\s\-()]{8,}$/.test(phone?.value.trim() || '');
    const deptOk = !!dept?.value;
    document.getElementById('pfg-name')?.classList.toggle('err', !nameOk);
    document.getElementById('pfg-phone')?.classList.toggle('err', !phoneOk);
    document.getElementById('pfg-dept')?.classList.toggle('err', !deptOk);
    return nameOk && phoneOk && deptOk;
  }

  if(form) form.addEventListener('submit', async e => {
    e.preventDefault();
    if(!validatePopupForm()) return;
    if(formBtn){ formBtn.textContent = '⏳ Sending...'; formBtn.disabled = true; }
    try{
      const res = await fetch('https://formspree.io/f/mgodyokd', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      if(res.ok){
        if(formSuccess) formSuccess.classList.add('show');
        if(formBtn){ formBtn.textContent = '✅ Sent — We\'ll Call You Soon'; formBtn.disabled = false; }
        form.reset();
        setTimeout(closePopup, 2200);
      } else {
        throw new Error('Server error');
      }
    } catch(err){
      console.error('Popup submission error:', err);
      if(formBtn){ formBtn.textContent = '⚠️ Error — Try Again'; formBtn.disabled = false; }
    }
  });
  ['pf-name','pf-phone','pf-dept'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', function(){ this.closest('.fg')?.classList.remove('err'); });
  });
})();
(function(){
  if(window.innerWidth > 640) return;
  const grids = document.querySelectorAll('.dept-grid, .why-grid');
  grids.forEach(grid => {
    const cards = Array.from(grid.children);
    cards.forEach((card, i) => {
      card.classList.add('stack-card');
      card.style.transitionDelay = (i * 0.06) + 's';
    });
    grid.classList.add('stack-mode');
  });
})();

/* ── REHAB LIFE GALLERY FILTER ──
   Generic: works automatically for any future data-filter pills/categories added */
(function(){
  const pills = document.querySelectorAll('.rg-pill');
  const items = document.querySelectorAll('.rg-item');
  if(!pills.length || !items.length) return;
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      items.forEach(item => {
        const show = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('rg-hide', !show);
      });
    });
  });
})();
