
declare global {
  interface Window {
    lpSettings: any;
    SLPFormBridge: {
      openFromCTA: () => void;
      openFromBanner: () => void;
      close: () => void;
    };
    dataLayer: any[];
  }
}

declare var DOMPurify: {
  sanitize: (html: string) => string;
};

// FIX: Add missing HTML_TEMPLATE export
export const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>{{lpTitle}}</title>
  {{seoMetaTags}}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.5/purify.min.js" integrity="sha512-JvADTTKTEELIUSq3lRR0lNWt3mH8sQ2gfbZceL8vE3gUR2s+bKz2/iLtzB8yOgp0WkCw7j/MMp_rC8M7K3/wKA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <style>
    {{swipeLpCss}}
  </style>
  <script>
    {{finalInlineScript}}
  </script>
</head>
<body>
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{gtmId}}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <h1 class="visually-hidden">{{lpTitle}}</h1>

  <div class="swipe-lp-wrapper">
    <div class="progress-container">
      <div class="progress-bar" id="progressBar"></div>
    </div>

    <div class="container">
      <div class="page active" id="page-1" data-pd="1" style="visibility: hidden;">
        <!-- First page content will be injected here -->
      </div>
      <div class="swipe-area"></div>
    </div>

    <div class="pc-nav">
      <button class="pc-nav-button prev-button" aria-label="前のページへ">▲</button>
      <div class="pc-nav-horizontal">
        <button class="pc-nav-button left-button" aria-label="左へ">◀</button>
        <button class="pc-nav-button right-button" aria-label="右へ">▶</button>
      </div>
      <button class="pc-nav-button next-button" aria-label="次のページへ">▼</button>
    </div>
  </div>

  <div id="floatingBannerContainer">
    <a class="floating-banner" data-device="pc" href="#" target="_blank" rel="noopener">
      <img class="floating-banner-image" src="" alt="">
    </a>
    <a class="floating-banner" data-device="mobile" href="#" target="_blank" rel="noopener">
      <img class="floating-banner-image" src="" alt="">
    </a>
  </div>

  <div class="exit-popup-overlay" id="exitPopup" hidden>
    <div class="exit-popup-container">
      <img id="popupImage" src="" alt="" class="exit-popup-image" style="cursor: pointer;">
      <button id="popupAction" class="popup-action-btn" aria-label="閉じる">
        <span class="close-text">&times;</span>
        <span class="return-text">ページに戻る</span>
      </button>
    </div>
  </div>

  <div class="exit-popup-overlay" id="legalInfoModal" hidden>
    <div class="legal-modal-container">
      <button id="closeLegalModal" class="exit-popup-close" aria-label="閉じる">&times;</button>
      <div class="legal-modal-content">
        <h3>運営会社情報等</h3>
        <div class="legal-links-container">
          <a id="companyInfoLink" href="#" class="legal-link" target="_blank" rel="noopener" hidden>運営会社情報</a>
          <a id="privacyPolicyLink" href="#" class="legal-link" target="_blank" rel="noopener" hidden>プライバシーポリシー</a>
          <a id="sctLawLink" href="#" class="legal-link" target="_blank" rel="noopener" hidden>特定商取引法に基づく表記</a>
        </div>
      </div>
    </div>
  </div>

  <!-- START_FORM_MODAL -->
  <!-- The form modal will be created by slp-form-bridge.js, 
       but we can leave this structure in case it's used for something else.
       The generator script specifically looks for and removes these comments. -->
  <!-- END_FORM_MODAL -->
  
  <script>
    {{swipeLpJs}}
  </script>
  <script>
    {{slpFormBridgeJs}}
  </script>
</body>
</html>
`;

// FIX: Add missing SLP_FORM_BRIDGE_JS export
export const SLP_FORM_BRIDGE_JS = `
/* js/slp-form-bridge.js v1.0 */
(function() {
  'use strict';
  if (typeof lpSettings === 'undefined' || !lpSettings.customFormUrl) return;

  const U = {
    push: function(p) {
      window.dataLayer = window.dataLayer || [];
      try {
        const shared = window.lpSettings?.sharedData || {};
        window.dataLayer.push({ ...p, ...shared });
      } catch (e) {}
    },
    getClickDetails: function(e, el) {
      if (!e || !el) return {};
      const r = el.getBoundingClientRect();
      return {
        click_x_rel: r.width > 0 ? (e.clientX - r.left) / r.width : 0,
        click_y_rel: r.height > 0 ? (e.clientY - r.top) / r.height : 0,
        elem_tag: el.tagName.toLowerCase(),
        elem_id: el.id || null,
        elem_classes: el.className || null
      };
    }
  };

  let modal, iframe;
  let isInitialized = false;

  function createModal() {
    if (document.getElementById('slpFormModal')) return;

    modal = document.createElement('div');
    modal.id = 'slpFormModal';
    Object.assign(modal.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: '100000',
      display: 'none',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: '0',
      transition: 'opacity 0.3s'
    });
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        close(e);
      }
    });

    const content = document.createElement('div');
    Object.assign(content.style, {
      position: 'relative',
      width: '95%',
      height: '95%',
      maxWidth: '800px',
      maxHeight: '90vh',
      backgroundColor: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    });

    iframe = document.createElement('iframe');
    iframe.id = 'slpFormIframe';
    Object.assign(iframe.style, {
      flex: '1',
      border: 'none'
    });

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    Object.assign(closeButton.style, {
      position: 'absolute',
      top: '5px',
      right: '5px',
      width: '30px',
      height: '30px',
      border: 'none',
      borderRadius: '50%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      color: '#fff',
      fontSize: '20px',
      cursor: 'pointer',
      lineHeight: '30px',
      textAlign: 'center',
      zIndex: '10'
    });
    closeButton.onclick = close;

    content.appendChild(iframe);
    content.appendChild(closeButton);
    modal.appendChild(content);
    document.body.appendChild(modal);
    isInitialized = true;
  }

  function open(source, e) {
    if (!isInitialized) createModal();
    if (!modal || !iframe) return;

    const url = new URL(lpSettings.customFormUrl);
    iframe.src = url.toString();

    modal.style.display = 'flex';
    setTimeout(() => { modal.style.opacity = '1'; }, 10);
    U.push({ event: 'slp_form_modal_opened', source: source, ...U.getClickDetails(e, e.target) });
  }

  function close(e) {
    if (!modal) return;
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.display = 'none';
      if (iframe) iframe.src = 'about:blank';
    }, 300);
    U.push({ event: 'slp_form_modal_closed', ...U.getClickDetails(e, e.target) });
  }
  
  window.SLPFormBridge = {
    openFromCTA: (e) => open('cta', e),
    openFromBanner: (e) => open('floating_banner', e),
    close: close
  };

  if (lpSettings.formModalOpenFrom && lpSettings.formModalOpenFrom.floatingBanner) {
      document.addEventListener('click', function(e) {
        const banner = e.target.closest('.floating-banner');
        if (banner) {
          e.preventDefault();
          window.SLPFormBridge.openFromBanner(e);
        }
      }, true);
  }

  window.addEventListener('message', function(event) {
    if (!lpSettings.allowedOrigins || !lpSettings.allowedOrigins.includes(event.origin)) return;
    
    const data = event.data;
    if (typeof data === 'object' && data.slpFormEvent) {
       U.push({
         event: data.slpFormEvent,
         ...data.params
       });
       
       if (data.slpFormEvent === 'slp_form_submit_success') {
          setTimeout(() => close(), 500);
       }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createModal);
  } else {
    createModal();
  }
})();
`;

export const SWIPE_LP_JS = `
/* js v1.0 */
/* js/swipe-lp.js v12.6-bridge
   - 変更点
     * PG.cta() の役割を .cta-page クラス付与のみに限定。
     * 画像全体をラップしていた <a> タグ生成ロジックを削除。
     * 全てのCTA（全体・部分領域）は HS.renderForActive() が
       動的に生成する .cta-hotspot (div) によって処理されるように統一。
     * これにより、lpGenerator 側で「領域未指定＝100%ホットスポット」として
       データを渡すことで、両方のケースに単一のロジックで対応。
*/

(function(){
'use strict';
if (typeof lpSettings === 'undefined') return;

const C={U:lpSettings,K:{SEL:".swipe-lp-wrapper ",TD:400,WHEEL_TH:50,WHEEL_D:15,OVERSCROLL_TH:100}};
const S={pn:1,tp:1,anim:false,et:Date.now(),st:Date.now(),mp:1,sc:0,ph:[],pm:[],prev_path:'/',cta:[],fcta:0,dev:'pc',v:{s:null,p:null,c:null},bn:false,exit:false,utm:{},overscrollDelta:0,preFvKey:null};

const U={
  init(){const p=new URLSearchParams(location.search);S.utm={utm_source:p.get('utm_source'),utm_medium:p.get('utm_medium'),utm_campaign:p.get('utm_campaign'),utm_content:p.get('utm_content')}}
  ,push(p){window.dataLayer=window.dataLayer||[];try{window.dataLayer.push({...p,...this.shared()})}catch(e){}}
  ,shared(){return{session_variant:S.v.s,presence_test_variant:S.v.p,creative_test_variant:S.v.c,device_type:S.dev,page_path:S.pm[S.pn-1]||'',prev_page_path:S.prev_path,page_num_dom:S.pn,max_page_reached:S.mp,total_pages:S.tp,...S.utm}}
  ,parseCta(){return[...new Set((C.U.ctaPagesInput||'').replace(/[　、 ，]/g,',').split(/[\\s,]+/).map(n=>Number(n)).filter(Number.isFinite))]}
  ,scrollable(el){return el && el.scrollHeight>el.clientHeight+1}
  ,detectDevice(){let m=/Mobi|Android/i.test(navigator.userAgent);try{if(navigator.userAgentData?.mobile)m=navigator.userAgentData.mobile;if(!m&&navigator.maxTouchPoints>1&&/Macintosh/i.test(navigator.userAgent))m=true}catch(e){}return m?'mobile':'pc'}
  ,getClickDetails(e,el){if(!e||!el)return{};const r=el.getBoundingClientRect();return{click_x_rel:r.width>0?(e.clientX-r.left)/r.width:0,click_y_rel:r.height>0?(e.clientY-r.top)/r.height:0,elem_tag:el.tagName.toLowerCase(),elem_id:el.id||null,elem_classes:el.className||null}}
  ,fireCta(o,e){if(!o||!e)return;sessionStorage.setItem('resumePage',S.pn);const n=(o===S.fcta)?'lp_final_cta_click':'lp_cta_click';this.push({event:n,original_page_num:o,link_url:C.U.ctaUrl,...this.getClickDetails(e,e.target)})}
};
function normalizeHTML(s){return String(s).replace(/\\n/g,'\\n').replace(/\\"/g,'"').replace(/\\\\\\//g,'/')}
function fileBaseName(u){try{return String(u||'').split('/').pop().split(/[?#]/)[0]}catch(_){return''}}
function lower(s){return String(s||'').toLowerCase()}
function getContentRect(el){
  const r=el.getBoundingClientRect();const natW=el?.videoWidth||el?.naturalWidth||0;const natH=el?.videoHeight||el?.naturalHeight||0;
  if(!natW||!natH){return r}const scale=Math.min(r.width/natW,r.height/natH);const w=natW*scale,h=natH*scale;
  return{left:r.left+(r.width-w)/2,top:r.top+(r.height-h)/2,width:w,height:h}
}

/* ===== AB粘着 ===== */
const AB_TTL_DAYS=7;
const AB_KEY=['slp_ab',location.hostname+location.pathname,(C.U.abTestType||'none'),(C.U.abTestTarget||'none')].join(':');
function getStickyVariant(){try{const raw=localStorage.getItem(AB_KEY);if(!raw)return null;const{v,exp}=JSON.parse(raw);if(!v||(exp&&Date.now()>exp)){localStorage.removeItem(AB_KEY);return null}return(v==='A'||v==='B')?v:null}catch{return null}}
function setStickyVariant(v){try{const exp=Date.now()+AB_TTL_DAYS*864e5;localStorage.setItem(AB_KEY,JSON.stringify({v,exp}))}catch{}}
function pickVariant(){return Math.random()<.5?'A':'B'}
const AB={
  init(){const t=C.U.abTestType;if(t==='none')return;
    const q=new URLSearchParams(location.search).get('ab');
    let v=(q==='A'||q==='B')?q:getStickyVariant();if(!v){v=pickVariant();setStickyVariant(v)}
    S.v.s=v;if(t==='presence')S.v.p=v;else if(t==='creative')S.v.c=v;
    U.push({event:'lp_ab_test_assigned',ab_test_type:t,ab_test_target:C.U.abTestTarget,assigned:v})
  }
};

const PG={
  init(){
    S.cta=U.parseCta();S.fcta=Math.max(0,...S.cta);
    const c=document.querySelector(C.K.SEL+'.container');if(!c)return;
    this.first();this.rest(c);this.map();
  },
  first(){
    const p=document.getElementById('page-1');if(!p)return;
    const container=document.querySelector(C.K.SEL+'.container');
    let d=1;
    const ins=C.U.htmlInsertions||{};
    const preKeysAll=Object.keys(ins).map(parseFloat).filter(k=>k>0&&k<1).sort((a,b)=>a-b).map(String);

    let preFvUsed=false, preFvUrl='';
    for(const k of preKeysAll){
      const raw=String(ins[k]||'').trim();
      if(/^video\\s*:|^動画\\s*:/i.test(raw)){
        preFvUsed=true;S.preFvKey=k;
        preFvUrl=raw.replace(/^video\\s*:|^動画\\s*:/i,'').trim();
        break;
      }
    }

    for(const k of preKeysAll){
      if(k===S.preFvKey) continue;
      container.insertBefore(this.makeInsertion(ins[k],d++,k),p);
    }

    const setImage=(src,alt)=>{
      const i=document.createElement('img');
      Object.assign(i,{className:'page-image',id:'firstContent',src,loading:'eager',decoding:'async',alt});
      i.addEventListener('error',()=>{if(C.U.fallbackImageUrl&&i.src!==C.U.fallbackImageUrl){i.src=C.U.fallbackImageUrl}});
      p.innerHTML='';p.appendChild(i);
    };

    p.id=\`page-content-\${d}\`;
    p.dataset.pd=String(d);

    const isCreativeAB = (C.U.abTestType==='creative' && C.U.abTestTarget==='firstView');
    const isVariantB   = (S.v.c==='B');
    const firstImageSrc = this.url('firstImage', C.U.firstImageUrl);
    const firstImageAlt = C.U.firstImageAlt || (C.U.abTestBUrls?.firstAlt || 'メイン画像');
    const patternIsVideo = this.isVideoUrl(firstImageSrc);
    const firstVideoSrc  = patternIsVideo ? firstImageSrc : this.url('firstVideo', C.U.firstVideoUrl);

    let renderType=null, renderSrc=null, renderAlt=firstImageAlt;
    if (isCreativeAB && isVariantB) {
      if (C.U.abTestBUrls?.firstVideo) {
        renderType='video'; renderSrc=C.U.abTestBUrls.firstVideo; renderAlt=C.U.abTestBUrls.firstAlt||renderAlt;
      } else if (C.U.abTestBUrls?.firstImage) {
        renderType='image'; renderSrc=C.U.abTestBUrls.firstImage; renderAlt=C.U.abTestBUrls.firstAlt||renderAlt;
      }
    }
    if (!renderType) {
      if (preFvUsed && preFvUrl) { renderType='video'; renderSrc=preFvUrl; }
      else if (patternIsVideo || firstVideoSrc) { renderType='video'; renderSrc=firstVideoSrc || firstImageSrc; }
      else { renderType='image'; renderSrc=firstImageSrc; }
    }

    if (renderType==='video') {
      p.innerHTML='';
      const v=document.createElement('video');
      Object.assign(v,{className:'page-video',id:'firstContent',src:renderSrc,muted:true,loop:true,playsInline:true,preload:'auto'});
      v.dataset.fv='1';
      v.addEventListener('error',()=>{const fb=C.U.firstImageUrl||C.U.fallbackImageUrl;setImage(fb,'メイン画像(代替)')});
      VM.addVideoListeners(v);
      
      const orig = preFvUsed ? String(S.preFvKey) : '1';
      p.dataset.oi = orig;
      SL.wrapInSlider(p, d, orig, v);
      
      const f=document.createElement('div');f.className='video-fallback-play';p.appendChild(f);
    } else { 
      // setImage logic inlined/modified to use wrapInSlider
      const i=document.createElement('img');
      Object.assign(i,{className:'page-image',id:'firstContent',src:renderSrc,loading:'eager',decoding:'async',alt:renderAlt});
      i.addEventListener('error',()=>{if(C.U.fallbackImageUrl&&i.src!==C.U.fallbackImageUrl){i.src=C.U.fallbackImageUrl}});
      p.innerHTML='';
      
      const orig = preFvUsed ? String(S.preFvKey) : '1';
      p.dataset.oi = orig;
      SL.wrapInSlider(p, d, orig, i);
    }

    // p.dataset.oi is already set in the block above


    const ctaKey = preFvUsed ? parseFloat(S.preFvKey) : 1;
    if (S.cta.includes(ctaKey)) this.cta(p, ctaKey);

    p.style.visibility='visible';
  },
  rest(c){
    let d=document.querySelectorAll(C.K.SEL+'.page').length+1;
    const ins=C.U.htmlInsertions||{};
    const keys=Object.keys(ins).map(parseFloat).sort((a,b)=>a-b).map(String);
    const s=c.querySelector('.swipe-area');

    const declaredFirstType = String(C.U.firstPageContentType||'image').toLowerCase();
    const usePreFv = !!S.preFvKey;

    keys.forEach(k=>{const pos=parseFloat(k);if(pos>0&&pos<1&&k!==S.preFvKey){c.insertBefore(this.makeInsertion(ins[k],d++,k),s)}});

    const lastDom = C.U.lastPageNum + ((usePreFv && declaredFirstType !== 'video') ? 1 : 0);

    for(let i=2;i<=lastDom;i++){
      keys.forEach(k=>{const pos=parseFloat(k);if(pos>i-1 && pos<i){c.insertBefore(this.makeInsertion(ins[k],d++,k),s)}});
      const shiftByOne = (declaredFirstType === 'video') || usePreFv;
      const orig = shiftByOne ? (i-1) : i;
      c.insertBefore(this.img(i,d++,orig),s);
    }

    keys.forEach(k=>{const pos=parseFloat(k);if(pos>=lastDom){c.insertBefore(this.makeInsertion(ins[k],d++,k),s)}});

    c.insertBefore(this.operator(d++),s);
    S.tp=document.querySelectorAll(C.K.SEL+'.page').length;
  },

  isVideoUrl(u){return typeof u==='string' && /\\.(mp4|webm|ogg|mov|m4v)(\\?|#|$)/i.test(u)},
  resolveAssetForPage(orig){
    const baseAlt = C.U.imageAlt || \`LP画像 \${String(orig).padStart(2,'0')}\`;
    let type='image',src='',alt=baseAlt;
    if(C.U.firstImageUrl){
      src=C.U.firstImageUrl.replace(/(\\d+)(?!.*\\d)\\.([a-z0-9]+)$/i,(_,n,e)=>String(orig).padStart(n.length,'0')+'.'+e);
      type=this.isVideoUrl(src)?'video':'image';
    }else{src=C.U.fallbackImageUrl||''}
    if(C.U.abTestType==='creative'&&S.v.c==='B'){
      if(C.U.abTestTarget==='finalCta' && C.U.abTestFinalCtaPageNum && String(orig) === String(C.U.abTestFinalCtaPageNum) && C.U.abTestBUrls?.finalCta?.url){
        const b=C.U.abTestBUrls.finalCta; type=this.isVideoUrl(b.url)?'video':'image'; src=b.url; alt=b.alt||alt;
      }else if(C.U.abTestTarget==='pages' && C.U.abTestBUrls?.pages?.map){
        const map=C.U.abTestBUrls.pages.map; const entry=map[orig]||map[String(orig)];
        if(entry?.url){type=this.isVideoUrl(entry.url)?'video':'image';src=entry.url;alt=entry.alt||alt}
      }
    }
    return{type,src,alt}
  },
  img(iDom,d,orig){
    const p=document.createElement('div');p.className='page';p.id=\`page-content-\${d}\`;p.dataset.pd=d;p.dataset.oi=String(orig);
    const a=this.resolveAssetForPage(orig);
    
    let mainEl;
    if(a.type==='video'){
      const v=document.createElement('video');Object.assign(v,{className:'page-video',src:a.src,muted:true,loop:true,playsInline:true,preload:'auto'});
      v.addEventListener('error',()=>{if(C.U.fallbackImageUrl){const i=document.createElement('img');i.className='page-image';i.src=C.U.fallbackImageUrl;i.alt='代替画像';
        // If error happens inside slider, we need to replace v with i.
        // But v is already inside slider. We can just replaceWith.
        v.replaceWith(i);
      }});
      VM.addVideoListeners(v);
      mainEl = v;
    }else{
      const m=document.createElement('img');m.className='page-image';m.loading='lazy';m.decoding='async';m.alt=a.alt;m.src=a.src||C.U.fallbackImageUrl||'';
      m.addEventListener('error',()=>{if(C.U.fallbackImageUrl && m.src!==C.U.fallbackImageUrl){m.src=C.U.fallbackImageUrl}});
      mainEl = m;
    }

    SL.wrapInSlider(p, d, orig, mainEl);
    if(S.cta.includes(orig)) this.cta(p,orig);
    return p;
  },
  makeInsertion(v,d,key){
    const posStr=String(key??'');const isStr=typeof v==='string';const raw=isStr?v.trim():'';
    if(isStr && /^video\\s*:|^動画\\s*:/i.test(raw)){const url=raw.replace(/^video\\s*:|^動画\\s*:/i,'').trim();return this.video(url,d,posStr)}
    if(isStr && /^iframe\\s*:/i.test(raw)){const url=raw.replace(/^iframe\\s*:/i,'').trim();return this.iframe(url,d,posStr)}
    return this.html(v,d,posStr);
  },
  video(url,d,posStr){
    const p=document.createElement('div');p.className='page';p.id=\`page-content-\${d}\`;p.dataset.pd=d;p.dataset.oi=posStr||'';
    const v=document.createElement('video');Object.assign(v,{className:'page-video',src:url,muted:true,loop:true,playsInline:true,preload:'auto'});
    v.addEventListener('error',()=>{if(C.U.fallbackImageUrl){const i=document.createElement('img');i.className='page-image';i.src=C.U.fallbackImageUrl;i.alt='代替画像';v.replaceWith(i)}});
    VM.addVideoListeners(v);
    SL.wrapInSlider(p, d, posStr, v);
    return p;
  },
  iframe(url,d,posStr){
    const p=document.createElement('div');p.className='page html-content-page';p.id=\`page-content-\${d}\`;p.dataset.pd=d;p.dataset.oi=posStr||'';
    const wrapper = document.createElement('div'); wrapper.className = 'html-content';
    wrapper.innerHTML=\`<iframe src="\${url}" width="100%" frameborder="0" allowfullscreen loading="lazy" style="display:block;margin:0 auto;max-width:100%;min-height:50vh"></iframe>\`;
    SL.wrapInSlider(p, d, posStr, wrapper);
    EV.addScrollListener(p);return p;
  },
  html(c,d,posStr){
    const p=document.createElement('div');p.className='page html-content-page';p.id=\`page-content-\${d}\`;p.dataset.pd=d;p.dataset.oi=posStr||'';
    const rawHtml=typeof c==='string'?normalizeHTML(c):'';
    const sanitized=typeof DOMPurify!=='undefined'?DOMPurify.sanitize(rawHtml):rawHtml;
    const wrapper = document.createElement('div'); wrapper.className = 'html-content';
    wrapper.innerHTML=sanitized;
    SL.wrapInSlider(p, d, posStr, wrapper);
    p.querySelectorAll('video').forEach(v=>{v.muted=true;v.loop=true;v.playsInline=true;v.preload='auto';VM.addVideoListeners(v)});
    EV.addScrollListener(p);return p;
  },
  operator(d){
    const p=document.createElement('div');p.className='page';p.id='page-operator';p.dataset.pd=d;p.dataset.oi='operator';
    p.innerHTML="<div class='operator-info-container'><a id='openLegalModal' class='operator-trigger-link' href='javascript:void(0)'>運営会社情報等のご確認</a></div>";
    return p;
  },
  cta(p,orig){
    p.classList.add('cta-page');
  },
  url(type,def){
    const{abTestType:t,abTestTarget:a,abTestBUrls:b}=C.U;
    if(t!=='creative'||S.v.c!=='B'||!b) return def;
    if(a==='firstView'){
      if(type==='firstImage'&&b.firstImage)return b.firstImage;
      if(type==='firstVideo'&&b.firstVideo)return b.firstVideo;
    }
    if(a==='popup'&&type==='popup'&&b.popup?.url) return b.popup.url;
    return def;
  },
  map(){
    S.pm=[...document.querySelectorAll(C.K.SEL+'.page')].map((p,i)=>{
      if(p.id==='page-operator')return'/lp/operator-info';
      if(p.classList.contains('html-content-page'))return \`/lp/html-\${p.dataset.oi||p.dataset.pd}\`;
      const d=p.dataset.oi;return d?(p.classList.contains('cta-page')?\`/lp/cta-\${d}\`:\`/lp/img-\${d}\`):\`/lp/unknown-\${i+1}\`
    })
  }
};

const HS={
  clear(p){p?.querySelector('.cta-hotspots')?.remove()},
  renderForActive(){
    const p=document.querySelector(C.K.SEL+'.page.active');if(!p)return;
    this.clear(p);
    const oi=p.dataset.oi;const orig=oi&&!isNaN(parseFloat(oi))?String(parseFloat(oi)):null;
    if(!orig)return;
    const areas=(C.U.ctaAreas||{})[orig];if(!areas||!areas.length)return;
    const m=p.querySelector('.page-image,.page-video');if(!m)return;
    const r=getContentRect(m);const pr=p.getBoundingClientRect();if(r.width<=1||r.height<=1)return;
    const cont=document.createElement('div');cont.className='cta-hotspots';
    Object.assign(cont.style,{position:'absolute',left:'0',top:'0',right:'0',bottom:'0',zIndex:'4',pointerEvents:'none'});
    p.appendChild(cont);
    areas.forEach(z=>{
      const left=(r.left-pr.left)+(z.left/100)*r.width;
      const top =(r.top -pr.top )+(z.top /100)*r.height;
      const width =(z.width /100)*r.width;
      const height=(z.height/100)*r.height;
      if(width<=1||height<=1)return;
      const d=document.createElement('div');d.className='cta-hotspot';
      Object.assign(d.style,{position:'absolute',left:left+'px',top:top+'px',width:width+'px',height:height+'px',cursor:'pointer',pointerEvents:'auto',background:'transparent'});
      d.setAttribute('role','button');d.setAttribute('aria-label','CTA');
      d.addEventListener('click',e=>{
        e.stopPropagation();
        U.fireCta(parseFloat(orig),e);
        const useFormModal = !!(C.U.formModalOpenFrom && C.U.formModalOpenFrom.cta && C.U.customFormUrl && !C.U.ctaUrl);
        if (useFormModal) {
          e.preventDefault();
          if (window.SLPFormBridge && typeof window.SLPFormBridge.openFromCTA==='function') {
            window.SLPFormBridge.openFromCTA(e);
          }
        } else if (C.U.ctaUrl) {
          location.href=C.U.ctaUrl;
        }
      });
      cont.appendChild(d);
    });
  }
};

const BN={
  init(){
    this.container=document.getElementById('floatingBannerContainer');
    this.wrapper=document.querySelector('.swipe-lp-wrapper');
    if(!this.container)return;
    this.aTags=[...this.container.querySelectorAll('.floating-banner')];
    let enabled=!!C.U.floatingBannerEnabled&&!!C.U.floatingBannerImageUrl;
    if(C.U.abTestType==='presence'&&(C.U.abTestTarget==='floatingBanner'||/banner/i.test(C.U.abTestTarget||''))){if(S.v.p==='B')enabled=false}
    let imgUrl=C.U.floatingBannerImageUrl, imgAlt=C.U.floatingBannerImageAlt||'';
    if(C.U.abTestType==='creative'&&(C.U.abTestTarget==='floatingBanner'||/banner/i.test(C.U.abTestTarget||''))&&S.v.c==='B'&&C.U.abTestBUrls?.floatingBanner?.url){
      imgUrl=C.U.abTestBUrls.floatingBanner.url; imgAlt=C.U.abTestBUrls.floatingBanner.alt||imgAlt;
    }
    this.enabled=enabled;this.imgUrl=imgUrl;this.imgAlt=imgAlt;this.linkUrl=C.U.floatingBannerLinkUrl;

    const rawInput=C.U.hiddenBannerPages||C.U.hidden_banner_pages_input||C.U.hiddenBannerPagesInput||[];
    const tokens=Array.isArray(rawInput)?rawInput:String(rawInput||'').split(/[\\s,　、，]+/).filter(Boolean);
    const pages=[...document.querySelectorAll(C.K.SEL+'.page')];
    const logicalPages=pages.filter(p=>!/^\\d+\\.\\d+$/.test(String(p.dataset.oi||'')));
    const synonyms=new Map();
    pages.forEach(p=>{
      const oi=String(p.dataset.oi||'');const isDecimal=/^\\d+\\.\\d+$/.test(oi);
      const canonical=isDecimal?oi:String(logicalPages.indexOf(p)+1);
      const media=p.querySelector('.page-image,.page-video');
      if(media){
        const src=lower(media.currentSrc||media.src||'');const base=lower(fileBaseName(src));
        const nodot=base.replace(/\\./g,'');const noext=base.replace(/\\.[a-z0-9]+$/i,'');
        [base,nodot,noext].forEach(k=>{if(k)synonyms.set(k,canonical)})
      }
      if(oi)synonyms.set(oi,canonical);
      if(p.id==='page-operator'){['会社情報','運営会社','legal','operator','会社情報ページ'].forEach(k=>synonyms.set(lower(k),canonical))}
    });
    ['fv','first','firstview','first_view','first-view','fv.jpg','fv.mp4'].forEach(k=>synonyms.set(k,'1'));
    function normalizeToken(t){
      const x=lower(String(t||'').trim()); if(!x)return null;
      if(/^\\d+\\.\\d+$/.test(x))return x; if(/^\\d+$/.test(x))return String(parseInt(x,10));
      const m=x.match(/^(\\d{1,2})(jpg|jpeg|png|webp|gif|mp4|webm|mov|m4v|ogg)$/); if(m){const n=String(parseInt(m[1],10));return n;}
      return synonyms.get(x)||null;
    }
    this.hiddenPages=new Set(tokens.map(normalizeToken).filter(Boolean));

    const useFormModal = !!(C.U.formModalOpenFrom && C.U.formModalOpenFrom.floatingBanner && C.U.customFormUrl);
    this.aTags.forEach(a=>{
      const im=a.querySelector('.floating-banner-image');
      if(im){im.src=this.imgUrl;im.alt=this.imgAlt;im.addEventListener('load',()=>this.updatePadding(),{once:false})}
      if (useFormModal) {
        a.href='javascript:void(0)';
      } else {
        a.href=this.linkUrl||'';
      }
    });

    this.check();
    window.addEventListener('resize',()=>this.onViewportChange(),{passive:true});
    window.addEventListener('orientationchange',()=>this.onViewportChange(),{passive:true});
  },
  onViewportChange(){this.check();this.updatePadding()},
  currentKey(){
    const active=document.querySelector(C.K.SEL+'.page.active');if(!active)return'';
    const oi=String(active.dataset.oi||'');
    if(/^\\d+\\.\\d+$/.test(oi))return oi;
    const logicalPages=[...document.querySelectorAll(C.K.SEL+'.page')].filter(p=>!/^\\d+\\.\\d+$/.test(String(p.dataset.oi||'')));
    const idx=logicalPages.indexOf(active);
    if(idx<0)return String(parseInt(active.dataset.pd||'0',10));
    return String(idx+1);
  },
  visibleBannerEl(){return this.aTags.find(a=>getComputedStyle(a).display!=='none')||null},
  updatePadding(){
    if(!this.enabled||!S.bn){this.clearPadding();return}
    const el=this.visibleBannerEl();if(!el){this.clearPadding();return}
    const h=el.getBoundingClientRect().height||0;
    if(h>0){document.documentElement.style.setProperty('--banner-h-m',Math.ceil(h)+'px');this.wrapper?.classList.add('with-banner')}
    else{this.clearPadding()}
  },
  clearPadding(){document.documentElement.style.setProperty('--banner-h-m','0px');this.wrapper?.classList.remove('with-banner')},
  shouldHideOnThisPage(){if(!this.enabled)return true;return this.hiddenPages?.has(this.currentKey())},
  check(){this.shouldHideOnThisPage()?this.hide():this.show()},
  show(){if(S.bn)return;this.aTags.forEach(a=>a.classList.add('show'));S.bn=true;this.updatePadding()},
  hide(){if(!S.bn)return;this.aTags.forEach(a=>a.classList.remove('show'));S.bn=false;this.clearPadding()}
};

const SL={
  init(){this.bind();try{this.mo=new MutationObserver(m=>{if(m.some(x=>x.addedNodes&&x.addedNodes.length))this.bind()});this.mo.observe(document.body,{childList:true,subtree:true})}catch(_){ }},
  bind(){
    document.querySelectorAll('.slider-container').forEach(sc=>{
      if(sc.dataset.slBound)return;sc.dataset.slBound='1';
      
      // Wheel support
      // Wheel support (Vertical Wheel -> Horizontal Scroll)
      sc.addEventListener('wheel',e=>{
        if(e.ctrlKey)return;
        // If vertical scroll (deltaY), treat as horizontal
        const delta = e.deltaY || e.deltaX;
        if(!delta) return;
        
        const before = sc.scrollLeft;
        sc.scrollLeft += delta;
        
        // If we scrolled, prevent default (page scroll)
        if(sc.scrollLeft !== before){
          e.preventDefault();
          e.stopPropagation();
        }
      },{passive:false});

      // PC Mouse Drag Support
      let isDown = false;
      let startX;
      let scrollLeft;
      sc.addEventListener('mousedown', (e) => {
        isDown = true;
        sc.classList.add('active'); // Optional: for cursor style
        sc.style.scrollSnapType = 'none'; // Disable snap for smooth dragging
        startX = e.pageX - sc.offsetLeft;
        scrollLeft = sc.scrollLeft;
        e.preventDefault(); // Prevent text selection
      });
      const stopDrag = () => {
        isDown = false;
        sc.classList.remove('active');
        sc.style.scrollSnapType = ''; // Restore snap
      };
      sc.addEventListener('mouseleave', stopDrag);
      sc.addEventListener('mouseup', stopDrag);
      sc.addEventListener('mousemove', (e) => {
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - sc.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        sc.scrollLeft = scrollLeft - walk;
      });

      // Looping Logic
      const clone = sc.querySelector('.clone-first');
      if(clone){
        const observer = new IntersectionObserver((entries)=>{
          entries.forEach(entry=>{
            if(entry.isIntersecting && entry.intersectionRatio >= 0.9){
              sc.style.scrollBehavior = 'auto';
              sc.scrollLeft = 0;
              requestAnimationFrame(()=>{ sc.style.scrollBehavior = ''; });
            }
          });
        }, { root: sc, threshold: [0.9, 1.0] });
        observer.observe(clone);
      }
    });
  },
  wrapInSlider(p, d, posStr, mainContentEl){
    const hSlides = (C.U.horizontalSlides||{})[String(posStr||d)];
    if(!hSlides || hSlides.length === 0){
      p.appendChild(mainContentEl);
      return;
    }
    const sc = document.createElement('div'); sc.className = 'slider-container';
    const mkSlide = (src, alt) => {
      const s = document.createElement('div'); s.className = 'slider-item';
      if(PG.isVideoUrl(src)){
         const v=document.createElement('video');Object.assign(v,{className:'page-video',src,muted:true,loop:true,playsInline:true,preload:'auto'});
         s.appendChild(v);VM.addVideoListeners(v);
      } else {
         const m=document.createElement('img');m.className='page-image';m.loading='lazy';m.decoding='async';m.alt=alt||'';m.src=src;
         m.draggable=false; // Fix for PC drag
         s.appendChild(m);
      }
      return s;
    };

    // Main Slide
    const s1 = document.createElement('div'); s1.className = 'slider-item';
    s1.appendChild(mainContentEl);
    sc.appendChild(s1);

    // Extra Slides
    hSlides.forEach(src => sc.appendChild(mkSlide(src, '')));

    // Loop: Clone First Slide
    if(sc.children.length > 1){
      const first = sc.children[0].cloneNode(true);
      first.classList.add('clone-first');
      const img = first.querySelector('img');
      if(img) img.loading = 'eager';
      // If video, we might need to re-attach listeners or mute it?
      // CloneNode copies attributes but not event listeners.
      // VM.addVideoListeners needs to be called on cloned video.
      const v = first.querySelector('video');
      if(v) { v.muted=true; VM.addVideoListeners(v); }
      sc.appendChild(first);
    }
    p.appendChild(sc);

    // Pagination Dots
    if(hSlides.length > 0){
      const dots = document.createElement('div'); dots.className = 'slider-dots';
      // Total slides = Main(1) + Extra(hSlides.length). 
      // Note: We don't count the clone for dots.
      const total = 1 + hSlides.length;
      for(let i=0; i<total; i++){
        const dot = document.createElement('div');
        dot.className = 'slider-dot' + (i===0 ? ' active' : '');
        dots.appendChild(dot);
      }
      p.appendChild(dots);

      // Scroll Listener for Dots
      sc.addEventListener('scroll', () => {
        const w = sc.clientWidth;
        if(!w) return;
        // Calculate index based on scroll position
        // Round to nearest integer to find current slide
        let idx = Math.round(sc.scrollLeft / w);
        // Handle Loop (Clone)
        if(idx >= total) idx = 0; 
        
        // Update dots
        Array.from(dots.children).forEach((d, i) => {
          if(i === idx) d.classList.add('active');
          else d.classList.remove('active');
        });
      }, {passive: true});
    }
  }
};

const NAV={
  go(t,m='swipe'){
    if(S.anim||t<1||t>S.tp||t===S.pn)return;
    if(m!=='swipe')document.querySelector('.swipe-lp-wrapper')?.classList.remove('horizontal-mode');
    S.overscrollDelta=0;const n=performance.now();const d=t>S.pn?'forward':'backward';
    S.prev_path=S.pm[S.pn-1]||'/';U.push({event:'lp_page_exit',stay_ms:Date.now()-S.et,method:m,direction:d});
    S.anim=true;if(['swipe','wheel','nav_btn','key'].includes(m))S.sc++;S.pn=t;S.mp=Math.max(S.mp,S.pn);
    this.ui();this.fireEvents(n);S.et=Date.now();S.ph.push(S.pm[S.pn-1]);U.push({event:'lp_page_enter',method:m,direction:d});
    setTimeout(()=>S.anim=false,C.K.TD+50);
  },
  ui(){
    document.querySelectorAll(C.K.SEL+'.page').forEach(p=>{
      const i=parseInt(p.dataset.pd||'0',10);let c='page';
      if(p.classList.contains('html-content-page'))c+=' html-content-page';
      if(p.classList.contains('cta-page'))c+=' cta-page';
      if(i===S.pn)c+=' active';else if(i===S.pn-1)c+=' prev';else if(i===S.pn+1)c+=' next';p.className=c;
    });
    document.getElementById('progressBar').style.width=\`\${(S.pn/S.tp)*100}%\`;
    VM.handle();BN.check();HS.renderForActive();
    
    // Cross Nav Logic
    const activeP = document.querySelector(C.K.SEL+'.page.active');
    const hasSlider = activeP?.querySelector('.slider-container');
    const nav = document.querySelector('.pc-nav');
    if(nav){
      if(hasSlider) nav.classList.add('cross-mode');
      else nav.classList.remove('cross-mode');
    }
  },
  fireEvents(n){
    const a=document.querySelector('.page.active');if(!a)return;
    if(parseInt(a.dataset.pd,10)>1 && !a.dataset.loadTimeMeasured){this.measurePageLoad(a,n);a.dataset.loadTimeMeasured='true'}
    const orig=a.dataset.oi&&!isNaN(parseFloat(a.dataset.oi))?parseFloat(a.dataset.oi):null;
    if(orig&&orig===S.fcta){const e=(S.pm[S.pn-1]||'').includes(\`cta-\${orig}\`)?'lp_final_cta_shown':'lp_cta_shown';U.push({event:e,original_page_num:orig})}
    if(a.id!=='page-operator'&&S.pn===S.tp-1)U.push({event:'lp_content_completed'})
  },
  measurePageLoad(p,s){
    if(!p)return;const c=p.querySelector('.page-image,.page-video,.html-content video');if(!c)return;
    const l=()=>{const t=performance.now()-s;U.push({event:'lp_page_content_loaded',page_num_dom:parseInt(p.dataset.pd,10),original_page_num:p.dataset.oi||null,load_time_ms:Math.round(t)});HS.renderForActive();BN.check()};
    if(c.tagName==='IMG'){if(c.complete)l();else{c.addEventListener('load',l,{once:true});c.addEventListener('error',l,{once:true})}}
    else if(c.tagName==='VIDEO'){if(c.readyState>=3)l();else{c.addEventListener('canplay',l,{once:true});c.addEventListener('loadedmetadata',l,{once:true})}}
  }
};

const VM={
  play(v){
    if(!v||v.dataset.playInitiated)return;v.dataset.playInitiated='true';this.clear(v);
    const start=()=>{const y=v.play();if(y!==undefined){y.catch(()=>{const f=v.closest('.page').querySelector('.video-fallback-play');if(f){f.style.display='flex';f.onclick=()=>{v.muted=false;v.play().then(()=>f.style.display='none')}}})}};
    if(v.dataset.fv==='1'){v.delayTimeoutId=setTimeout(start,800)}else{start()}
  },
  clear(v){if(v&&v.delayTimeoutId){clearTimeout(v.delayTimeoutId);delete v.delayTimeoutId}},
  handle(){document.querySelectorAll('.page video').forEach(v=>{const p=v.closest('.page');if(p.classList.contains('active')){if(v.paused)this.play(v)}else{v.pause();this.clear(v);delete v.dataset.playInitiated}})},
  addVideoListeners(v){
    if(!v||v.dataset.analyticsAttached)return;v.dataset.analyticsAttached='true';
    v.progressSent={25:false,50:false,75:false,100:false};
    v.addEventListener('play',()=>U.push({event:'lp_video_play',video_src:v.currentSrc}));
    v.addEventListener('timeupdate',()=>{if(!v.duration)return;const c=v.currentTime,d=v.duration,p=(c/d)*100;
      [25,50,75].forEach(t=>{if(p>=t&&!v.progressSent[t]){v.progressSent[t]=true;U.push({event:\`lp_video_progress_\${t}\`,video_src:v.currentSrc})}});
      if(c>=d-.5&&!v.progressSent[100]){v.progressSent[100]=true;U.push({event:'lp_video_ended',video_src:v.currentSrc})}
    })
  },
  cleanup(){document.querySelectorAll('video').forEach(this.clear)}
};

const POP={
  init(){
    if(C.U.abTestType==='presence'&&(C.U.abTestTarget==='popup'||/popup/i.test(C.U.abTestTarget||''))&&S.v.p==='B')return;
    if(!C.U.popupEnabled)return;
    document.getElementById('popupImage').src=this.url('popup',C.U.popupImageUrl);
    this.events();
  },
  url(type,def){const{abTestType:t,abTestTarget:a,abTestBUrls:b}=C.U;if(t!=='creative'||S.v.c!=='B'||!b)return def; if(a==='popup'&&type==='popup'&&b.popup?.url)return b.popup.url;return def;},
  events(){
    const p=document.getElementById('exitPopup');if(!p)return;
    const a=document.getElementById('popupAction');a.addEventListener('click',e=>this.hide(e));
    p.addEventListener('click',e=>{
      if(e.target.id==='exitPopup')this.hide(e);
      const i=e.target.closest('#popupImage');
      if(i&&C.U.popupLinkUrl){sessionStorage.setItem('resumePage',S.pn);U.push({event:'exit_popup_click',link_url:C.U.popupLinkUrl,...U.getClickDetails(e,i)});location.href=C.U.popupLinkUrl}
      if(i&&!C.U.popupLinkUrl){this.hide(e)}
    });
    document.body.addEventListener('mouseleave',e=>{if(S.dev==='pc'&&e.clientY<=0)this.show()});
    if(S.dev==='mobile'){
      const g=location.href.includes('#')?location.href.replace(/#.*/,'#slp'):location.href+'#slp';
      if(!history.state?.slp)history.pushState({slp:'guard'},'',g);
      window.addEventListener('popstate',()=>{if(!S.exit){this.show();history.pushState({slp:'guard'},'',g)}else{history.back()}},{passive:true})
    }
  },
  show(){if(S.exit||!C.U.popupEnabled)return;S.exit=true;const p=document.getElementById('exitPopup');p.hidden=false;setTimeout(()=>p.classList.add('active'),10);U.push({event:'exit_popup_shown'})},
  hide(e){document.getElementById('exitPopup').classList.remove('active');U.push({event:'exit_popup_closed',...U.getClickDetails(e,e?.target?.closest('.popup-action-btn'))})}
};

const EV={
  init(){this.clicks();this.swipe();this.wheel();this.keys();this.navBtns();this.modals();this.unload();this.resizes()},
  clicks(){document.body.addEventListener('click',e=>{
    if(S.anim)return;
    if(document.getElementById('legalInfoModal')?.classList.contains('active')){if(!e.target.closest('.legal-modal-container')){e.preventDefault()}return}
    const c=e.target.closest('.cta-image-link');
    if(c){
      const o=parseFloat(c.closest('.page')?.dataset.oi);
      const useFormModal = !!(C.U.formModalOpenFrom && C.U.formModalOpenFrom.cta && C.U.customFormUrl && !C.U.ctaUrl);
      U.fireCta(o,e);
      if(useFormModal){
        e.preventDefault();
        if (window.SLPFormBridge && typeof window.SLPFormBridge.openFromCTA==='function') {
          window.SLPFormBridge.openFromCTA(e);
        }
        return;
      }
    }
  },{passive:false})},
  swipe(){
    const c=document.querySelector('.container');const w=document.querySelector('.swipe-lp-wrapper');let sY=null,sX=null,d='none';
    c.addEventListener('touchstart',e=>{sY=e.touches[0].clientY;sX=e.touches[0].clientX;d='none'},{passive:true});
    c.addEventListener('touchmove',e=>{
      // Aggressive Lock Check: If we are already locked, just return (let browser handle horizontal scroll)
      if(d==='slider_lock'){
        return;
      }

      if(!sY||d!=='none'||S.anim)return;const cY=e.touches[0].clientY,cX=e.touches[0].clientX;const dY=Math.abs(sY-cY),dX=Math.abs(sX-cX);
      if(dX>10||dY>10){
        // Strict Vertical Swipe Logic
        // Inside slider: Vertical movement must be > 1x Horizontal (45 degrees)
        // Outside slider: Vertical movement must be > 3x Horizontal (Standard)
        const isSlider = !!e.target.closest('.slider-container');
        const vTh = isSlider ? 1.0 : 3;

        if(dY > dX * vTh) {
          d='v'; 
        } else {
          // Horizontal or Lock
          if(isSlider) {
            d='slider_lock';
          } else if(C.U.enableHorizontalSwipe) {
            d='h';
          } else {
            d='none';
          }
        }
        
        if(d==='h')w?.classList.add('horizontal-mode');else w?.classList.remove('horizontal-mode');
        
        // If we just locked, NO preventDefault. Let browser handle pan-x.
        // if(d==='slider_lock' && e.cancelable) e.preventDefault();
      }
    },{passive:false});
    c.addEventListener('touchend',e=>{
      if(S.anim||sY===null)return;const cY=e.changedTouches[0].clientY;const cX=e.changedTouches[0].clientX;const dY=sY-cY;const dX=sX-cX;sY=null;sX=null;
      if(d==='v'||d==='none'){
        const aP=document.querySelector('.page.active');
        if(aP?.classList.contains('html-content-page')){
          const sE=aP;const iAT=sE.scrollTop<=0;const iAB=sE.scrollTop+sE.clientHeight>=sE.scrollHeight-1;
          if((dY>30&&iAB)||(dY<-30&&iAT)){NAV.go(S.pn+(dY>0?1:-1),'swipe')}
        }else if(Math.abs(dY)>30){NAV.go(S.pn+(dY>0?1:-1),'swipe')}
      }else if(d==='h'){
        if(Math.abs(dX)>30){NAV.go(S.pn+(dX>0?1:-1),'swipe')}
      }
      d='none'
    },{passive:true})
  },
  wheel(){
    let t=null,d=0,lastWheelTime=0;const throttleDuration=800;
    document.querySelector('.container').addEventListener('wheel',e=>{
      const now=Date.now();if(now-lastWheelTime<throttleDuration && S.pn>1){e.preventDefault();return}
      if(S.anim){e.preventDefault();return}
      const aP=document.querySelector('.page.active');
      if(!aP?.classList.contains('html-content-page')){
        e.preventDefault();d+=e.deltaY;clearTimeout(t);
        t=setTimeout(()=>{if(Math.abs(d)>C.K.WHEEL_D){lastWheelTime=now;NAV.go(d>0?S.pn+1:S.pn-1,'wheel')}d=0},C.K.WHEEL_TH);return
      }
      const sE=aP;const isUp=e.deltaY<0,isDown=e.deltaY>0;
      const isAtTop=sE.scrollTop<=0;const isAtBottom=sE.scrollTop+sE.clientHeight>=sE.scrollHeight-1;
      const triggerNav=(dir)=>{lastWheelTime=now;NAV.go(S.pn+dir,'wheel')};
      if(isDown&&isAtBottom){e.preventDefault();S.overscrollDelta+=e.deltaY;if(S.overscrollDelta>C.K.OVERSCROLL_TH){triggerNav(1)}return}
      if(isUp&&isAtTop){e.preventDefault();S.overscrollDelta+=Math.abs(e.deltaY);if(S.overscrollDelta>C.K.OVERSCROLL_TH){triggerNav(-1)}return}
      S.overscrollDelta=0
    },{passive:false})
  },
  keys(){document.addEventListener('keydown',e=>{if(S.anim)return;if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key))NAV.go(S.pn-1,'key');if(['ArrowDown','ArrowRight',' ','PageDown'].includes(e.key))NAV.go(S.pn+1,'key')})},
  navBtns(){
    document.querySelector('.prev-button')?.addEventListener('click',()=>this.handleBtn(-1));
    document.querySelector('.next-button')?.addEventListener('click',()=>this.handleBtn(1));
    document.querySelector('.left-button')?.addEventListener('click',()=>this.handleHorizontalBtn(-1));
    document.querySelector('.right-button')?.addEventListener('click',()=>this.handleHorizontalBtn(1));
  },
  handleHorizontalBtn(dir){
    const p=document.querySelector('.page.active');
    if(p){
      const sc=p.querySelector('.slider-container');
      if(sc){
         const w=sc.clientWidth;
         const cur=Math.round(sc.scrollLeft/w);
         let next=cur+dir;
         
         const total = sc.children.length; // Safer than scrollWidth/w
         
         // Handle Loop seamlessly
         if(dir === 1){
           // Forward
           if(cur >= total - 1){
             // We are at clone (or past it). Snap to 0, then scroll to 1.
             sc.children[0].scrollIntoView({behavior: 'auto', block: 'nearest', inline: 'start'});
             requestAnimationFrame(()=>{
               sc.children[1].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
             });
           } else {
             // Normal forward
             sc.children[cur + 1].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
           }
         } else {
           // Backward
           if(cur <= 0){
             // We are at 0. Snap to clone, then scroll to second-to-last.
             const cloneIdx = total - 1;
             sc.children[cloneIdx].scrollIntoView({behavior: 'auto', block: 'nearest', inline: 'start'});
             requestAnimationFrame(()=>{
               sc.children[cloneIdx - 1].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
             });
           } else {
             // Normal backward
             sc.children[cur - 1].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
           }
         }
      }
    }
  },
  handleBtn(dir){
    // Strict Vertical: Only change page.
    NAV.go(S.pn+dir,'nav_btn');
  },
  modals(){
    const l=document.getElementById('legalInfoModal');if(!l)return;
    document.getElementById('openLegalModal')?.addEventListener('click',e=>{l.hidden=false;setTimeout(()=>l.classList.add('active'),10);U.push({event:'legal_modal_opened',...U.getClickDetails(e,e.target)})});
    const c=e=>{l.classList.remove('active');U.push({event:'legal_modal_closed',...U.getClickDetails(e,e.target)})};
    document.getElementById('closeLegalModal')?.addEventListener('click',c);
    l.addEventListener('click',e=>{if(e.target.id==='legalInfoModal')c(e)});
    l.addEventListener('transitionend',()=>{if(!l.classList.contains('active'))l.hidden=true});
    [['companyInfoLink',C.U.companyInfoUrl],['privacyPolicyLink',C.U.privacyPolicyUrl],['sctLawLink',C.U.sctLawUrl]].forEach(([id,url])=>{
      const a=document.getElementById(id);if(a){if(url){a.href=url;a.hidden=false}else{a.hidden=true;a.removeAttribute('href')}}});
  },
  resizes(){let t=null;const reflow=()=>{clearTimeout(t);t=setTimeout(()=>{HS.renderForActive();BN.check()},100)};window.addEventListener('resize',reflow,{passive:true});window.addEventListener('orientationchange',reflow,{passive:true})},
  unload(){window.addEventListener('beforeunload',()=>{if(!S.exit){S.exit=true;U.push({event:'lp_session_end',total_duration_ms:Date.now()-S.st,completion_rate:S.tp>0?(S.mp/S.p)*100:0})}VM.cleanup()})},
  addScrollListener(p){
    if(!p||!U.scrollable(p))return;let h;p.dataset.scrollSent="[]";
    p.addEventListener('scroll',()=>{if(h)return;h=setTimeout(()=>{const s=Math.round(100*(p.scrollTop+p.clientHeight)/p.scrollHeight);const e=JSON.parse(p.dataset.scrollSent);[25,50,75,90].forEach(t=>{if(s>=t&&!e.includes(t)){e.push(t);U.push({event:'lp_html_scroll',scroll_pct:t})}});p.dataset.scrollSent=JSON.stringify(e);h=null},250)})
  }
};

const App={
  init(){
    S.dev=U.detectDevice();U.init();document.title=C.U.lpTitle||'スワイプLP';
    this.gtm();this.links();this.setAspectRatio();AB.init();PG.init();
    const r=parseInt(sessionStorage.getItem('resumePage')||'0',10);S.pn=0;NAV.go(r>1?r:1,r>1?'resume':'load');if(r)sessionStorage.removeItem('resumePage');
    EV.init();POP.init();BN.init();SL.init();this.fvLoad();U.push({event:'lp_session_start'})
  },
  gtm(){const id=C.U.gtmId;if(!id)return;if(!document.getElementById('slp-gtm')){const s=document.createElement('script');s.id='slp-gtm';s.innerHTML="(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','"+id+"');";document.head.appendChild(s)}},
  links(){const m={companyInfoLink:C.U.companyInfoUrl,privacyPolicyLink:C.U.privacyPolicyUrl,sctLawLink:C.U.sctLawUrl};for(const[i,u]of Object.entries(m)){const e=document.getElementById(i);if(e&&u)e.href=u}},
  fvLoad(){
    const f=document.getElementById('firstContent');if(!f)return;
    const l=()=>{let e=Math.round(performance.now());try{const r=f.currentSrc||f.src||'';const s=r?performance.getEntriesByName(r)[0]:null;if(s?.responseEnd)e=Math.round(s.responseEnd)}catch(_){ }
      U.push({event:'lp_fv_loaded',load_time_ms:e});HS.renderForActive();BN.check()};
    if(f.tagName==='IMG'){if(f.complete)l();else{f.onload=l;f.onerror=l}}
// FIX: Corrected typo 'c' to 'f'. 'c' was not defined in this scope.
    else if(f.tagName==='VIDEO'){if(f.readyState>=3)l();else{f.addEventListener('canplay',l,{once:true});f.addEventListener('loadedmetadata',l,{once:true})}}
  },
  setAspectRatio(){
    const s=(w,h)=>{document.documentElement.style.setProperty('--main-aspect-ratio',(w>0&&h>0)?w/h:.5625)};
    const c=document.getElementById('firstContent');if(!c){s(1080,1920);return}
    if(c.tagName==='IMG'){if(c.complete)s(c.naturalWidth,c.naturalHeight);else{c.onload=()=>s(c.naturalWidth,c.naturalHeight);c.onerror=()=>s(0,0)}}
    else if(c.tagName==='VIDEO'){if(c.readyState>=1)s(c.videoWidth,c.videoHeight);else{c.onloadedmetadata=()=>s(c.videoWidth,c.videoHeight);c.onerror=()=>s(0,0)}}
  }
};

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>App.init())}else{App.init()}

})();
`;