(() => {
  'use strict';
  window.MRHeroMotion = function (scene, gsap) {
    if (!scene || !gsap) return () => {};
    const video=scene.querySelector('.mr-hero-video');
    const atmosphere=document.createElement('div');
    atmosphere.className='mr-atmosphere';
    atmosphere.innerHTML='<div class="mr-sunlight"></div>';
    scene.append(atmosphere);
    const photo=scene.querySelector('.mr-hero-photo');
    const animations=[];
    if(!video)animations.push(gsap.fromTo(photo,{scale:1.015,xPercent:-.3},{scale:1.065,xPercent:.3,duration:26,ease:'none',repeat:-1,yoyo:true}));
    animations.push(gsap.fromTo(atmosphere.querySelector('.mr-sunlight'),{opacity:.4,rotation:-3},{opacity:.7,rotation:3,duration:12,ease:'sine.inOut',repeat:-1,yoyo:true}));
    let visible=true,disposed=false;
    const show=()=>{if(!disposed)video?.classList.add('is-playing');};
    const error=()=>video?.classList.remove('is-playing');
    if(video){video.muted=true;video.defaultMuted=true;video.addEventListener('playing',show);video.addEventListener('error',error);}
    const sync=()=>{
      const paused=!visible||document.hidden||disposed;
      animations.forEach(animation=>animation.paused(paused));
      if(video){if(paused)video.pause();else video.play()?.catch(()=>{});}
    };
    const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}):null;
    observer?.observe(scene.parentElement);document.addEventListener('visibilitychange',sync);sync();
    return ()=>{disposed=true;observer?.disconnect();document.removeEventListener('visibilitychange',sync);animations.forEach(animation=>animation.kill());if(video){video.pause();video.classList.remove('is-playing');video.removeEventListener('playing',show);video.removeEventListener('error',error);}gsap.set(photo,{clearProps:'transform'});atmosphere.remove();};
  };
})();
