(() => {
  'use strict';
  const english = document.documentElement.lang === 'en';
  const copy = english ? {
    open:'Open menu', close:'Close menu', count:'questions',
    preview:'This is a local preview. Your details have not been sent. Enquiry delivery will be connected later.',
    socialTitle:'Our social media', socialBody:'Links to the official profiles will be added when available.'
  } : {
    open:'פתיחת תפריט', close:'סגירת תפריט', count:'שאלות',
    preview:'זו תצוגה מקומית. הפרטים לא נשלחו. שליחת הפניות תחובר בהמשך.',
    socialTitle:'הרשתות החברתיות שלנו', socialBody:'הקישורים לפרופילים הרשמיים יתווספו כשיהיו זמינים.'
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const userPaused = false;
  let cleanupMotion = () => {}, lenis = null, motionGeneration = 0;
  const site = document.querySelector('.mr-site');
  if (!site) return;
  const stickyHeader = site.querySelector('.mr-header');
  const syncHeader = () => stickyHeader?.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', syncHeader, {passive:true});
  window.addEventListener('pageshow', syncHeader);
  syncHeader();

  // The same path in the other language, with a matching in-page anchor when present.
  document.querySelector('.mr-language')?.addEventListener('click', event => {
    if (location.hash && /^#(?:section-\d+|question-\d+|solution-\d+|contact|process|values|team|about|blog|main)$/.test(location.hash)) {
      const target = new URL(event.currentTarget.href); target.hash = location.hash; event.currentTarget.href = target.href;
    }
  });
  const menu = site.querySelector('.mr-header-nav'), toggle = site.querySelector('.mr-menu-toggle');
  if (menu && toggle) {
    menu.id = 'mr-mobile-menu';
    const close = (restore = false) => {menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label',copy.open); if(restore)toggle.focus();};
    toggle.addEventListener('click', () => {
      const opening = toggle.getAttribute('aria-expanded') !== 'true';
      menu.classList.toggle('is-open',opening); toggle.setAttribute('aria-expanded',String(opening)); toggle.setAttribute('aria-label',opening?copy.close:copy.open);
      if(opening && window.gsap && !userPaused && !reduced.matches) gsap.fromTo(menu.children,{opacity:0,y:6},{opacity:1,y:0,stagger:.035,duration:.3,clearProps:'opacity,transform'});
    });
    menu.addEventListener('click',e=>{if(e.target.closest('a'))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && menu.classList.contains('is-open'))close(true);});
    document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!toggle.contains(e.target))close();});
    matchMedia('(min-width:1101px)').addEventListener('change',()=>close());
  }
  const dialog=document.querySelector('.mr-dialog');
  document.querySelectorAll('[data-social]').forEach(button=>button.addEventListener('click',()=>{
    if(!dialog)return;
    dialog.querySelector('h2').textContent=copy.socialTitle;dialog.querySelector('.mr-dialog-body').textContent=copy.socialBody;dialog.showModal();lenis?.stop();
  }));
  if(dialog){
    dialog.querySelector('.mr-dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>lenis?.start());
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  }
  site.querySelectorAll('[data-mr-form]').forEach(form=>{
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!form.reportValidity())return;
      if(form.elements.website.value)return;
      form.querySelector('.mr-form-status').textContent=copy.preview;
      // Deliberately no network request or persisted personal data in the local phase.
      window.ScrollTrigger?.refresh(true);
    });
  });
  const search=document.querySelector('#faq-search');
  if(search){
    const rows=[...document.querySelectorAll('.mr-faq-item')];
    const normalize=value=>value.normalize('NFKD').replace(/[\u0591-\u05C7]/g,'').toLocaleLowerCase().trim();
    const filter=()=>{
      const query=normalize(search.value);let count=0;
      rows.forEach(row=>{const show=normalize(row.textContent).includes(query);row.hidden=!show;if(show)count++;});
      document.querySelector('.mr-faq-count').textContent=`${count} ${copy.count}`;
      document.querySelector('.mr-faq-empty').hidden=count>0;
      window.ScrollTrigger?.refresh(true);lenis?.resize();
    };
    search.addEventListener('input',filter);filter();
  }
  site.querySelectorAll('.mr-schedule-table td').forEach(cell=>{cell.dataset.parent=/Parent A|הורה א/.test(cell.textContent)?'a':'b';});
  site.querySelectorAll('.mr-step-icon').forEach((icon,index)=>{
    const number=document.createElement('span');number.className='mr-step-number';number.textContent=String(index+1).padStart(2,'0');number.setAttribute('aria-hidden','true');icon.append(number);
  });
  document.addEventListener('click',event=>{
    const a=event.target.closest('a[href^="#"]');if(!a||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const hash=a.getAttribute('href');if(hash.length<2)return;
    const target=document.getElementById(decodeURIComponent(hash.slice(1)));if(!target)return;
    if(!lenis)return;
    event.preventDefault();
    try{history.pushState(null,'',hash);}catch{}
    lenis.scrollTo(target,{offset:-(document.querySelector('.mr-header')?.offsetHeight||70)-20,onComplete:()=>{const old=target.getAttribute('tabindex');target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.addEventListener('blur',()=>{if(old===null)target.removeAttribute('tabindex');else target.setAttribute('tabindex',old);},{once:true});}});
  });
  const fitButtons=()=>site.querySelectorAll('.mr-button a,.mr-cta a,.mr-form button').forEach(label=>{
    label.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode(' ')));
    label.style.removeProperty('font-size');
    const available=label.clientWidth-parseFloat(getComputedStyle(label).paddingLeft)-parseFloat(getComputedStyle(label).paddingRight);
    const range=document.createRange();range.selectNodeContents(label);
    const width=range.getBoundingClientRect?.().width||0;
    if(width>available&&available>0)label.style.fontSize=(parseFloat(getComputedStyle(label).fontSize)*available/width)+'px';
  });
  document.fonts?.ready.then(fitButtons);window.addEventListener('resize',fitButtons);
  function buildTyping(heading,restores){
    const original=heading.innerHTML,oldLabel=heading.getAttribute('aria-label');
    const words=heading.textContent;heading.setAttribute('aria-label',words);
    const visual=document.createElement('span');visual.setAttribute('aria-hidden','true');visual.innerHTML=original;
    heading.replaceChildren(visual);
    const walker=document.createTreeWalker(visual,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    const chars=[];
    const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter(english?'en':'he',{granularity:'grapheme'}):null;
    nodes.forEach(node=>{
      const frag=document.createDocumentFragment();
      const segments=segmenter?[...segmenter.segment(node.nodeValue)].map(s=>s.segment):Array.from(node.nodeValue);
      segments.forEach(char=>{if(/^\s+$/.test(char)){frag.append(document.createTextNode(char));return;}const span=document.createElement('span');span.className='mr-type-char';span.textContent=char;chars.push(span);frag.append(span);});node.replaceWith(frag);
    });
    restores.push(()=>{heading.innerHTML=original;if(oldLabel===null)heading.removeAttribute('aria-label');else heading.setAttribute('aria-label',oldLabel);});
    return chars;
  }
  async function configureMotion(){
    const generation=++motionGeneration;
    cleanupMotion();cleanupMotion=()=>{};
    if(userPaused||reduced.matches||!window.gsap||!window.ScrollTrigger){document.documentElement.dataset.motion='off';return;}
    // Wait for fonts so line wrapping and ScrollTrigger measurements remain stable.
    try{await document.fonts?.ready;}catch{}
    if(generation!==motionGeneration||userPaused||reduced.matches)return;
    const {gsap,ScrollTrigger}=window;gsap.registerPlugin(ScrollTrigger);
    document.documentElement.dataset.motion='on';
    const restoreHeadings=[];let cleanupHero=()=>{},tick=null;
    const context=gsap.context(()=>{
      document.querySelectorAll('[data-type]').forEach(heading=>{
        const chars=buildTyping(heading,restoreHeadings);if(!chars.length)return;
        const hero=!!heading.closest('.mr-hero-content');
        gsap.fromTo(chars,{opacity:0},{opacity:1,duration:.025,stagger:Math.min(.04,1.5/chars.length),ease:'none',delay:hero ? 0.2 : 0,
          scrollTrigger:{trigger:heading,start:'top 92%',once:true}});
      });
      const elements=gsap.utils.toArray('main .mr-body,.mr-article-body>ul,.mr-form-widget,.mr-table-scroll');
      elements.forEach(el=>gsap.from(el,{y:22,opacity:0,duration:.85,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 96%',once:true}}));
      // A single restrained card turn on entry; reading remains static afterwards.
      gsap.utils.toArray('.mr-value,.mr-blog-card,.mr-step-card').forEach((card,index)=>{
        gsap.fromTo(card,{rotationY:english ? -12 : 12,rotationX:3,transformPerspective:1200,opacity:0,transformOrigin:'50% 50%'},
          {rotationY:0,rotationX:0,opacity:1,duration:1.1,ease:'power2.out',delay:(index%3)*.07,
           scrollTrigger:{trigger:card,start:'top 95%',once:true}});
      });
      gsap.utils.toArray('.mr-about-photo,.mr-portrait,.mr-locations-photo,.mr-calendar-example').forEach(el=>gsap.from(el,{y:24,opacity:0,scale:.975,duration:1.15,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}}));
      gsap.utils.toArray('.mr-olive,.mr-intro-olive,.mr-footer-branch').forEach(el=>gsap.fromTo(el,{clipPath:'inset(0 50% 0 50%)'},{clipPath:'inset(0 0% 0 0%)',ease:'none',scrollTrigger:{trigger:el,start:'top 95%',end:'top 65%',scrub:.45}}));
      gsap.utils.toArray('.mr-about-divider').forEach(el=>gsap.fromTo(el,{'--line-scale':0},{'--line-scale':1,ease:'none',scrollTrigger:{trigger:el,start:'top 92%',end:'top 55%',scrub:.45}}));
      gsap.utils.toArray('.mr-quote-text').forEach(el=>{
        const chars=buildTyping(el,restoreHeadings);
        gsap.fromTo(chars,{opacity:.18},{opacity:1,duration:1,stagger:.035,ease:'none',scrollTrigger:{trigger:el,start:'top 85%',end:'bottom 48%',scrub:.5}});
      });
      const timeline=document.querySelector('.mr-timeline');
      if(timeline){
        gsap.fromTo('.mr-timeline-fill',{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{trigger:timeline,start:'top 65%',end:'bottom 65%',scrub:.6}});
        timeline.querySelectorAll('.mr-step').forEach(step=>{
          const icon=step.querySelector('.mr-step-icon'),card=step.querySelector('.mr-step-card');
          const tl=gsap.timeline({scrollTrigger:{trigger:step,start:'top 80%',end:'top 42%',scrub:.5,onUpdate:self=>step.dataset.active=self.progress>.5?'true':'false'}});
          tl.fromTo(icon.querySelector('img'),{filter:'grayscale(1) brightness(0) invert(.78)'},{filter:'grayscale(1) brightness(0) invert(1)',duration:1},0);
          tl.fromTo(icon,{backgroundColor:'#858b83',borderColor:'#858b83','--halo':0},{backgroundColor:'#6c765f',borderColor:'#6c765f','--halo':1,duration:1},0)
            .fromTo(card,{backgroundColor:'#f1f0ed',borderColor:'#e3e3dd',y:16},{backgroundColor:'#edf0e5',borderColor:'#a5ad92',y:0,duration:1},0)
            .fromTo(card.querySelector('.mr-script'),{color:'#7f8278'},{color:'#69735b',duration:1},0);
        });
      }
      cleanupHero=window.MRHeroMotion?.(document.querySelector('.mr-hero-scene'),gsap)||(()=>{});
    },site);
    if(window.Lenis){
      lenis=new window.Lenis({duration:1.05,smoothWheel:true,syncTouch:false,anchors:false,autoRaf:false,gestureOrientation:'vertical'});
      lenis.on('scroll',ScrollTrigger.update);
      tick=time=>lenis?.raf(time*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
    }
    const refreshed=()=>{lenis?.resize();ScrollTrigger.refresh();};
    window.addEventListener('load',refreshed,{once:true});
    document.querySelectorAll('img').forEach(img=>{if(!img.complete)img.addEventListener('load',refreshed,{once:true});});
    ScrollTrigger.refresh();
    cleanupMotion=()=>{
      cleanupHero();context.revert();restoreHeadings.forEach(restore=>restore());
      if(tick)gsap.ticker.remove(tick);lenis?.destroy();lenis=null;
      window.removeEventListener('load',refreshed);document.querySelectorAll('img').forEach(img=>img.removeEventListener('load',refreshed));
      document.querySelectorAll('.mr-step').forEach(step=>delete step.dataset.active);document.documentElement.dataset.motion='off';
    };
  }
  reduced.addEventListener('change',configureMotion);
  window.addEventListener('pageshow',event=>{if(event.persisted)configureMotion();});
  configureMotion();
})();
