/* ========= SECTION LOADER ========= */
function getAppRoot(){ return document.getElementById('app'); }
function keyFromUrl(url){ const f=url.split('/').pop().split('?')[0]; return f.replace(/\.html$/i,''); }

function clearAllPartials(){
  const root=getAppRoot();
  if(root) root.innerHTML='';
  document.querySelectorAll('[data-section-key]').forEach(n=>n.remove());
}
function injectPartial(key, html){
  const wrap=document.createElement('div'); wrap.setAttribute('data-section-key',key); wrap.innerHTML=html.trim();
  const ex=document.querySelector(`[data-section-key="${key}"]`);
  const root=getAppRoot();
  if(ex) ex.replaceWith(wrap);
  else if(root) root.appendChild(wrap);
  else document.body.appendChild(wrap);
}
async function loadSection(url){
  const key=keyFromUrl(url);
  const bust=url.includes('?')?`${url}&_=${Date.now()}`:`${url}?_=${Date.now()}`;
  const res=await fetch(`sections/${bust}`, {cache:'no-store'});
  if(!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html=await res.text(); injectPartial(key, html);
}
async function loadSections(list){ clearAllPartials(); for(const f of list) await loadSection(f); afterSectionsMounted(); }

/* ========= AFTER SECTIONS MOUNTED ========= */
function afterSectionsMounted(){
  // Footer year
  const yearSpan=document.getElementById('year');
  if(yearSpan) yearSpan.textContent=new Date().getFullYear();

  // (Legacy) Experience toggle safe to keep
  const xpToggle=document.getElementById('xpToggle');
  const xpExtra=document.getElementById('xpExtra');
  if(xpToggle && xpExtra){
    xpToggle.addEventListener('click',()=>{
      const expanded=xpToggle.getAttribute('aria-expanded')==='true';
      xpExtra.style.display=expanded?'none':'block';
      xpToggle.setAttribute('aria-expanded', String(!expanded));
      xpToggle.textContent=expanded?'View more':'View less';
    });
  }

  // Ticker modal
  (function(){
    const ticker=document.getElementById('ticker');
    const track=document.getElementById('tickerTrack');
    const dialog=document.getElementById('highlightsDialog');
    const closeBtn=document.getElementById('closeDialog');
    if(!ticker || !dialog || !closeBtn) return;
    let lastFocus=null;
    function openDialog(){
      lastFocus=document.activeElement; dialog.setAttribute('aria-hidden','false');
      document.body.classList.add('no-scroll'); if(track) track.style.animationPlayState='paused';
      closeBtn.focus(); ticker.setAttribute('aria-expanded','true'); document.addEventListener('keydown', escToClose);
    }
    function closeDialog(){
      dialog.setAttribute('aria-hidden','true'); document.body.classList.remove('no-scroll');
      if(track) track.style.animationPlayState=''; ticker.setAttribute('aria-expanded','false');
      if(lastFocus) lastFocus.focus(); document.removeEventListener('keydown', escToClose);
    }
    function escToClose(e){ if(e.key==='Escape') closeDialog(); }
    ticker.addEventListener('click', openDialog);
    ticker.addEventListener('keydown',(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openDialog(); }});
    closeBtn.addEventListener('click', closeDialog);
    dialog.addEventListener('click',(e)=>{ if(e.target===dialog) closeDialog(); });
  })();

  // Portfolio table
  (function(){
    const tbody=document.getElementById('portfolio-body');
    const moreBtn=document.getElementById('morePortfolio');
    if(!tbody || !moreBtn) return;
    const portfolioRows=[
      ['In Progress','WorkSafe Vic','Enterprise Design practice','Design Leadership','2022-2025','Enterprise Delivery'],
      ['In Progress','WorkSafe Vic','Enterprise Ai Policy','Design Leadership','2024-2025','WorkSafe Technology'],
      ['Complete','WorkSafe Vic','Futures Lab','Speculative Futures','2022','Insights & Innovation Division'],
      ['Complete','WorkSafe Vic','Community Innovation','Co-Design','2021','Insights & Innovation Division'],
      ['Complete','Confidential','Cash Management of the future','Service Design','2020','Craig Walker'],
      ['Complete','Australia Post','CX Guardrails','Service Design','2020','Craig Walker'],
      ['Complete','Meta','Youth Harm Workshops','Interaction Design','2019','Craig Walker'],
      ['Complete','Meta','TTC Labs Social Strategy','Strategic Design','2019','Craig Walker'],
      ['Complete','Affinity','UX strategy','Experience Strategy','2019','Craig Walker'],
      ['Complete','Australia Post','Community Strategy','Strategic Design','2019','Craig Walker'],
      ['Complete','Australia Post','Neighbourhood Welcome Service','Service Design','2019','Craig Walker'],
      ['Complete','Australia Post','AP Co-Lab','Design Leadership','2019','Craig Walker'],
      ['Complete','Australia Post','Brand Experience Strategy','Experience Strategy','2018','Craig Walker'],
      ['Complete','World Vision','Future of philanthropy','Design Strategy','2018','Craig Walker'],
      ['Complete','Me Bank','Inside job','Design Leadership','2017','Me Bank'],
      ['Complete','Me Bank','Dynamic Advertising and Performance strategy','Design Strategy','2017','Me Bank'],
      ['Complete','Me Bank','Brand positioning campaigns','Creative','2017','Me Bank'],
      ['Complete','Optus','Dynamic Advertising and creative strategy','Design Leadership','2017','Big Red'],
      ['Complete','Optus','TTL campaign — iPhone X launch','Creative','2017','Big Red'],
      ['Complete','BoM','Design framework for new feature innovation','Design Leadership','2016','BoM'],
      ['Complete','Amplifon','Localise brand experience — Australia','Creative','2016','Whippet'],
      ['Complete','Flybuys','TTL creative strategy','Creative','2016','Whippet'],
      ['Complete','Coles','TTL creative strategy','Creative','2015','Whippet'],
      ['Complete','Coles - Financial Services','TTL creative strategy','Creative','2015','Whippet'],
      ['Complete','MIFF','Website — Catalog and e-comm','Experience Design','2010-2015','Mecca Media Light'],
      ['Complete','Museum Victoria','Think Ahead Exhibition','Experience Design','2012','Mecca Media Light'],
      ['Complete','Museum Victoria','Age of the Dinosaurs','Experience Design','2012','Mecca Media Light'],
      ['Complete','EnergyAustralia','TTL campaigns','Creative','2012','Mecca Media Light'],
      ['Complete','EnergyAustralia','Online Quoting System','Experience Design','2012','Mecca Media Light'],
      ['Complete','AIR','Website — IA, Design System','Experience Design','2011','Mecca Media Light'],
      ['Complete','Music Victoria','Website — IA, Design System','Experience Design','2011','Mecca Media Light'],
      ['Complete','ACTF','Website — IA, Design System','Experience Design','2011','Mecca Media Light'],
      ['Complete','Ford Australia','TTL campaigns','Creative','2008','APD Group']
    ];
    let shown=5;
    function render(){
      tbody.innerHTML='';
      for(let i=0;i<Math.min(shown, portfolioRows.length);i++){
        const [status, client, proj, type, date, credits]=portfolioRows[i];
        const tr=document.createElement('tr');
        tr.innerHTML=`
          <td class="col-status"><span class="pill">${status}</span></td>
          <td class="col-client" title="${client}">${client}</td>
          <td class="col-project" title="${proj}">${proj}</td>
          <td class="col-type" title="${type}">${type}</td>
          <td class="col-date">${date}</td>
          <td class="col-credits" title="${credits}">${credits}</td>`;
        tbody.appendChild(tr);
      }
    }
    render();
    moreBtn.addEventListener('click', ()=>{
      shown=Math.min(shown+10, portfolioRows.length); render();
      if(shown===portfolioRows.length) moreBtn.textContent='All items shown';
    });
  })();

  /* ===== Mini-Carousel (shared by Thoughts/Speaking/About) ===== */
  (function initMiniCarousels(){
    const carousels=document.querySelectorAll('[data-carousel]');
    carousels.forEach((wrap)=>{
      const viewport=wrap.querySelector('.carousel');
      const track=wrap.querySelector('[data-carousel-track]');
      const prevBtn=wrap.querySelector('[data-carousel-prev]');
      const nextBtn=wrap.querySelector('[data-carousel-next]');
      if(!viewport || !track || !nextBtn || !prevBtn) return;

      const cards=Array.from(track.querySelectorAll('.carousel-card'));
      if(cards.length===0) return;

      let index=0, step=0, maxIndex=0;

      function calcStep(){
        const first=cards[0];
        const cardWidth=first.getBoundingClientRect().width;
        const styles=getComputedStyle(track);
        const gap=parseFloat(styles.gap || styles.columnGap || '0px') || 0;
        step=Math.round(cardWidth+gap);
        const visible=Math.max(1, Math.round(viewport.clientWidth/(cardWidth+gap)));
        maxIndex=Math.max(0, cards.length - visible);
        index=Math.min(index, maxIndex);
      }
      function apply(){
        track.style.transform=`translateX(${-index*step}px)`;
        prevBtn.disabled = index<=0;
        nextBtn.disabled = index>=maxIndex;
      }
      function onPrev(){ if(index>0){ index--; apply(); } }
      function onNext(){ if(index<maxIndex){ index++; apply(); } }

      calcStep(); apply();
      nextBtn.addEventListener('click', onNext);
      prevBtn.addEventListener('click', onPrev);
      nextBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); onNext(); }});
      prevBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); onPrev(); }});

      let resizeTO=null;
      window.addEventListener('resize', ()=>{
        clearTimeout(resizeTO);
        resizeTO=setTimeout(()=>{ calcStep(); apply(); }, 120);
      });
      document.fonts && document.fonts.ready && document.fonts.ready.then(()=>{ calcStep(); apply(); });
    });
  })();

  /* ===== Footer Callout (multiline + autosize + CTA reveal) ===== */
(function initFooterCallout(){
  const wrap = document.querySelector('.footer-callout-wrap');
  if(!wrap) return;

  const container = wrap.querySelector('.container');
  const slots = Array.from(wrap.querySelectorAll('.slot'));
  if(slots.length < 2 || !container) return;

  // start state
  slots.forEach(s => s.classList.remove('is-active','is-exiting'));
  let active = 0;
  slots[active].classList.add('is-active');

  const prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const intervalMs = 3000;
  let timer = null;

  function syncHeight(){
    const activeEl = slots[active];
    if(!activeEl) return;
    const h = activeEl.offsetHeight || activeEl.getBoundingClientRect().height;
    container.style.minHeight = Math.ceil(h) + 'px';
  }

  function tick(){
    const next = (active + 1) % slots.length;
    const currentEl = slots[active];
    const nextEl    = slots[next];
    if(!currentEl || !nextEl) return;

    currentEl.classList.remove('is-active');
    currentEl.classList.add('is-exiting');
    nextEl.classList.remove('is-exiting');
    nextEl.classList.add('is-active');

    active = next;
    requestAnimationFrame(()=>{ requestAnimationFrame(syncHeight); });

    setTimeout(()=> currentEl.classList.remove('is-exiting'), 360);
  }

  function start(){ if(!prefersReduced){ stop(); timer = setInterval(tick, intervalMs); } }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }

  // reveal CTA + pause rotation on interaction
  function openCTA(){ wrap.classList.add('cta-open'); stop(); }
  function closeCTA(){ wrap.classList.remove('cta-open'); start(); }

  wrap.addEventListener('mouseenter', openCTA);
  wrap.addEventListener('mouseleave', closeCTA);
  wrap.addEventListener('focusin', openCTA);
  wrap.addEventListener('focusout', ()=>{ if(!wrap.contains(document.activeElement)) closeCTA(); });

  // keep height correct on resize / font load
  let resizeTO=null;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTO);
    resizeTO = setTimeout(syncHeight, 120);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncHeight);
  }

  syncHeight();
  start();
})();

  // Optional GSAP (unchanged)
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section').forEach((el)=>{
      gsap.fromTo(el,{autoAlpha:1,y:0},{autoAlpha:1,y:0,duration:.4,ease:'power1.out',
        scrollTrigger:{trigger:el,start:'top 95%',toggleActions:'play none none none'}});
    });
    gsap.utils.toArray('.case-card, .carousel-card').forEach((card,i)=>{
      gsap.fromTo(card,{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.5,delay:i*.03,ease:'power2.out',
        scrollTrigger:{trigger:card,start:'top 90%',toggleActions:'play none none reverse'}});
    });
  }
}

/* ========= KICKOFF ========= */
window.addEventListener('DOMContentLoaded', ()=>{
  loadSections([
    'hero.html',
    'work.html',
    'speaking.html',
    'about-experience.html',
    'thoughts.html',
    'portfolio.html',
    'footer-callout.html',
    'footer.html',
    'ticker.html',
    'modal.html'
  ]);
});