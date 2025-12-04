
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LpMode, InternalData, CtaArea, AbTestPage, HtmlInsertion, VideoInsertion, IframeInsertion, HorizontalSlide } from './types';
import RadioToggle from './components/RadioToggle';
import { TextInput, TextareaInput } from './components/FormElements';
import { generateFiles } from './services/lpGenerator';

// FIX: Define missing DEFAULT_CSS constant. Using an empty string as a placeholder.
const DEFAULT_CSS = `*,::before,::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --app-h:100vh; /* まずは確実な100vh */
  --banner-h-m:0px;
  --main-aspect-ratio:0.5625; /* 1080/1920 を既定 */
  --sa-top:env(safe-area-inset-top,0px);--sa-right:env(safe-area-inset-right,0px);
  --sa-bottom:env(safe-area-inset-bottom,0px);--sa-left:env(safe-area-inset-left,0px);

  /* 画面の有効高さ × アスペクト比 = コンテンツ理想幅（FV基準） */
  --content-w: calc((var(--app-h) - var(--sa-top) - var(--sa-bottom)) * var(--main-aspect-ratio));

  /* 追加：基準値を変数化（必要なら数値をいじるだけで調整可能） */
  --main-max-w: 600px;      /* 既存 .container の最大幅 */
  --banner-pc-scale: 0.85;  /* PCはコンテンツ幅の85%（中間寄り） */
  --banner-sp-max: 360px;   /* SPの最大幅（中間寄り） */
  --banner-min-w: 220px;    /* 読みやすさの下限（任意） */
}
@supports(height:100dvh){:root{--app-h:100dvh}}

html,body{
  height:var(--app-h);width:100%;overscroll-behavior-y:contain;position:relative;overflow:hidden;
  -webkit-overflow-scrolling:touch;-webkit-tap-highlight-color:transparent;
  font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;background:#f9f9f9;
}

/* 視覚的に隠す（テンプレの見出し用） */
.visually-hidden{
  position:absolute !important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;
  clip:rect(0,0,0,0);white-space:nowrap;border:0
}

.swipe-lp-wrapper{
  position:fixed;top:var(--sa-top);left:var(--sa-left);right:var(--sa-right);bottom:var(--sa-bottom);
  width:calc(100vw - var(--sa-left) - var(--sa-right));
  height:calc(var(--app-h) - var(--sa-top) - var(--sa-bottom));
  display:flex;justify-content:center;overflow:hidden;z-index:9999;background:#fff
}
.swipe-lp-wrapper.with-banner{padding-bottom:calc(var(--banner-h-m) + var(--sa-bottom))}

/* 既存の固定600px依存箇所を変数化＋縦100%基準で幅決定（広すぎる場合は --main-max-w で上限） */
.container{
  position:relative;width:100%;height:100%;
  max-width:min(var(--content-w), var(--main-max-w));
  perspective:1000px;overflow:hidden;background:#fff;margin:0 auto
}

.page{
  position:absolute;inset:0;transform:translate3d(0,100%,0);opacity:0;visibility:hidden;
  will-change:transform,opacity,visibility;
  transition:transform .4s cubic-bezier(.22,1,.36,1),opacity .4s,visibility 0s .4s;background:#fff;min-height:100%
}
.page.active,.page.prev,.page.next{visibility:visible;transition:transform .4s cubic-bezier(.22,1,.36,1),opacity .4s}
.page.active{transform:translate3d(0,0,0);opacity:1;z-index:6}
.page.prev{transform:translate3d(0,-30%,0);opacity:.4;z-index:1}
.page.next{transform:translate3d(0,30%,0);opacity:.4;z-index:1}

/* Horizontal Mode (Toggled by JS) */
.swipe-lp-wrapper.horizontal-mode .page.prev{transform:translate3d(-30%,0,0)}
.swipe-lp-wrapper.horizontal-mode .page.next{transform:translate3d(30%,0,0)}

.page-image,.page-video{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none}
.page-video{z-index:1;pointer-events:none}

/* HTML挿入ページ（横スクロール許可） */
.html-content-page{display:flex;justify-content:center;align-items:flex-start;padding:15px 0;overflow-y:auto;overflow-x:auto;touch-action:auto;background:#fff;color:#333}
.html-content{width:100%;max-width:min(var(--content-w), var(--main-max-w));margin:0 auto;padding:20px 0}
.html-content h2{font-size:24px;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #eee}
.html-content h3{font-size:20px;margin-top:30px;margin-bottom:15px}
.html-content p{margin-bottom:15px;line-height:1.6}
.html-content ul{margin-left:20px;margin-bottom:20px}
.html-content li{margin-bottom:10px}
.html-content video,.html-content img{max-width:100%;height:auto;display:block;margin:10px auto;border-radius:8px}

/* FV動画タップ時フォールバック表示 */
.video-fallback-play{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:64px;height:64px;background:rgba(0,0,0,.5);border-radius:50%;border:2px solid#fff;
  display:none;justify-content:center;align-items:center;cursor:pointer;pointer-events:auto;z-index:3
}
.video-fallback-play::after{
  content:'';width:0;height:0;border-top:12px solid transparent;border-bottom:12px solid transparent;border-left:20px solid #fff;margin-left:5px
}

/* 会社情報ページ：プレーンテキスト誘導（位置は中央やや下） */
.operator-info-container{width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding-bottom:80px;z-index:11}
.operator-trigger-link{background:none;border:none;color:#0066cc;text-decoration:underline;padding:10px;font-size:16px;cursor:pointer;transition:color .3s}
.operator-trigger-link:hover{color:#004c99}

/* 進捗バー（青系） */
.progress-container{position:fixed;top:var(--sa-top);left:var(--sa-left);right:var(--sa-right);height:4px;background:rgba(0,0,0,.08);z-index:10000;overflow:hidden}
.progress-bar{height:100%;width:0;background:linear-gradient(90deg,#3b82f6,#60a5fa);transition:width .4s cubic-bezier(.22,1,.36,1)}

/* PCナビ（青・丸／配置はコンテンツ右外側） */
.pc-nav{
  position:fixed;top:50%;
  right:calc((100vw - min(var(--content-w), var(--main-max-w))) / 2 - 70px + var(--sa-right));
  transform:translateY(-50%);display:none;flex-direction:column;z-index:10001
}
.pc-nav-button{width:40px;height:40px;border-radius:50%;border:none;background:rgba(59,130,246,.9);color:#fff;font-size:20px;margin:10px 0;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.2);transition:.3s}
.pc-nav-button:hover{background:rgba(37,99,235,1);transform:scale(1.05)}
.pc-nav-button:active{transform:scale(.95)}

/* スワイプ取得用の透明レイヤ（ページ全面） */
.swipe-area{position:absolute;inset:0;z-index:1;touch-action:pan-y;pointer-events:none}

/* ★CTAホットスポット（当たり判定） */
.cta-hotspots{position:absolute;inset:0;z-index:2;pointer-events:none}
.cta-hotspot{
  position:absolute;pointer-events:auto;cursor:pointer;background:transparent;
  /* デバッグ可視化：outline:2px solid rgba(255,0,0,.35); */
}

/* ===== バナーのサイズ調整 ===== */
.floating-banner{position:fixed;display:none;z-index:10002;cursor:pointer;transition:all .3s cubic-bezier(.22,1,.36,1)}
.floating-banner.show{display:block;animation:bannerUp .4s cubic-bezier(.22,1,.36,1)}
.floating-banner-image{display:block;width:100%;height:auto;border-radius:0;box-shadow:0 2px 12px rgba(0,0,0,.12)}
@keyframes bannerUp{from{transform:translate(-50%,120%)}to{transform:translate(-50%,0)}}

@media (max-width: 768px){
  .floating-banner[data-device=pc]{display:none!important}
  .floating-banner[data-device=mobile]{
    left:50%;bottom:var(--sa-bottom);transform:translateX(-50%);
    width:95vw;                         /* 画面の95%（中間寄り） */
    max-width:var(--banner-sp-max);     /* ただし最大360px */
    min-width:var(--banner-min-w);
  }
  .html-content{max-width:100%;padding:0 15px 20px}
}

@media (min-width: 1025px){
  .pc-nav{
    display:grid;
    grid-template-columns: 40px 40px 40px;
    grid-template-rows: 40px 40px 40px;
    gap: 0; /* Connected */
    position: fixed;
    top: auto; /* Reset top */
    bottom: 30px; /* Add margin */
    transform: none; /* Reset transform */
    /* Position relative to center: Move to right edge of content + 40px gap */
    left: 50%;
    right: auto;
    margin-left: calc(min(var(--content-w), var(--main-max-w)) / 2 + 40px);
    z-index: 1000; /* Ensure on top */
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)); /* Shadow for the whole shape */
  }
  /* Center Filler */
  .pc-nav::before {
    content: "";
    grid-column: 2;
    grid-row: 2;
    background: #333; /* Darker gray */
    z-index: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  .pc-nav-button{
    width: 40px;
    height: 40px;
    background: #333; /* Darker gray */
    color: #3b82f6; /* Blue arrows */
    border: none;
    border-radius: 0; /* Reset */
    font-size: 24px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background 0.2s, opacity 0.2s;
    z-index: 1;
    box-shadow: none;
  }
  
  .pc-nav-button.disabled {
    /* opacity: 0.3; <-- Removed to keep background solid */
    color: rgba(255, 255, 255, 0.2); /* Dim the arrow icon only */
    background: #333; /* Ensure background stays solid */
    pointer-events: none;
    cursor: default;
  }
  
  /* Specific Border Radii for Outer Edges */
  .pc-nav > .pc-nav-button:first-child { /* Up */
    grid-column: 2; grid-row: 1;
    border-radius: 8px 8px 0 0;
  }
  .pc-nav > .pc-nav-button:last-child { /* Down */
    grid-column: 2; grid-row: 3;
    border-radius: 0 0 8px 8px;
  }
  
  .pc-nav-button:hover{
    background: #333; /* Slightly lighter on hover */
    transform: none; /* No movement, just color change */
  }
  .pc-nav-button:active{
    background: #111; /* Darker on active */
  }
  
  .pc-nav-horizontal{
    display: contents;
  }
  /* Left Button */
  .pc-nav-horizontal .pc-nav-button:first-child { 
    grid-column: 1; grid-row: 2;
    border-radius: 8px 0 0 8px;
  }
  /* Right Button */
  .pc-nav-horizontal .pc-nav-button:last-child { 
    grid-column: 3; grid-row: 2;
    border-radius: 0 8px 8px 0;
  }

  /* Handle Opacity/Pointer-Events for Horizontal Buttons */
  .pc-nav-horizontal .pc-nav-button {
    /* opacity: 0.3;  <-- Removed to keep background solid */
    color: rgba(59, 130, 246, 0.3); /* Dim the arrow icon only */
    pointer-events: none;
    transition: color 0.3s, background 0.2s;
  }
  .pc-nav.cross-mode .pc-nav-horizontal .pc-nav-button {
    /* opacity: 1; <-- Removed */
    color: #3b82f6; /* Restore active blue */
    pointer-events: auto;
  }
  
  /* Adjust layout for cross mode */
  /* Up button is first child */
  /* Horizontal div is second child */
  /* Down button is third child */
  
  .page-image,.page-video{pointer-events:auto}
  .floating-banner[data-device=mobile]{display:none!important}
  .floating-banner[data-device=pc]{
    left:50%;bottom:var(--sa-bottom);transform:translateX(-50%);
    width:70vw; /* ビューポート基準の暫定幅（広い画面で緩やかに拡縮） */
    max-width:calc(min(var(--content-w), var(--main-max-w)) * var(--banner-pc-scale)); /* コンテンツの72% */
    min-width:var(--banner-min-w);
  }
}
  .floating-banner[data-device=pc]{
    left:50%;bottom:var(--sa-bottom);transform:translateX(-50%);
    width:70vw; /* ビューポート基準の暫定幅（広い画面で緩やかに拡縮） */
    max-width:calc(min(var(--content-w), var(--main-max-w)) * var(--banner-pc-scale)); /* コンテンツの72% */
    min-width:var(--banner-min-w);
  }
}

/* 離脱防止ポップアップ */
.exit-popup-overlay{position:fixed;inset:0;display:none;justify-content:center;align-items:center;background:rgba(0,0,0,.7);z-index:10010;opacity:0;transition:opacity .3s ease}
.exit-popup-overlay.active{display:flex;opacity:1}
.exit-popup-container{position:relative;width:90%;max-width:420px;max-height:90vh}
.exit-popup-close{position:absolute;top:-10px;right:-10px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.5);color:#fff;border:none;font-size:20px;cursor:pointer;padding:0;z-index:2}
.exit-popup-image{width:100%;height:auto;max-height:calc(90vh - 80px);object-fit:contain;border-radius:0}
.popup-action-btn{position:absolute;top:-10px;right:-10px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.5);color:#fff;border:none;font-size:20px;cursor:pointer;padding:0;z-index:2;display:flex;align-items:center;justify-content:center}
.popup-action-btn .return-text{display:none;font-size:12px}
.popup-action-btn.return-mode{width:auto;height:auto;min-width:80px;min-height:30px;border-radius:4px;font-size:12px;padding:6px 12px}
.popup-action-btn.return-mode .close-text{display:none}
.popup-action-btn.return-mode .return-text{display:block}

/* 会社情報モーダル */
.legal-modal-container{width:90%;max-width:480px;background:#fff;padding:20px 30px;border:1px solid #ccc;text-align:center;position:relative}
.legal-modal-content h3{margin-bottom:25px;font-size:20px;color:#333}
.legal-links-container{display:flex;flex-direction:column;gap:15px}
.legal-link{color:#06c;text-decoration:underline;font-size:16px}
.legal-link:hover{color:#004c99}

/* モーダルの✕を右上に固定（近くに） */
#closeLegalModal.exit-popup-close{top:10px;right:10px}


/* ===== ここから横スライダー用の最小追記だけ ===== */
  /* スライダーコンテナ：横スクロール有効化、縦スクロールはブラウザに任せる(pan-x) */
  .slider-container{
    display:flex;width:100%;height:100%;overflow-x:scroll;overflow-y:hidden;
    scroll-snap-type:x mandatory;
    scrollbar-width:none; /* Firefox */
    -ms-overflow-style:none; /* IE/Edge */
    touch-action: pan-x; /* 縦スクロールはブラウザ標準、横はJS制御(しないが、pan-xで明示) */
    z-index: 10; /* Ensure it sits above other page elements */
  }
  .slider-container::-webkit-scrollbar{display:none}
  .slider-item{
    flex:0 0 100%;width:100%;height:100%;scroll-snap-align:start;
    scroll-snap-stop:always; /* Prevent skipping slides */
    position:relative; /* 子要素の配置用 */
    display:flex;justify-content:center;align-items:center;
  }

  /* ページネーションドット（進行表示） */
  .slider-dots {
    position: absolute;
    bottom: max(20px, env(safe-area-inset-bottom, 20px));
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 20;
    pointer-events: none; /* ドット自体は操作不可 */
    background: rgba(0,0,0,0.3); /* Ensure contrast */
    padding: 4px 8px;
    border-radius: 12px;
  }
  .slider-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 1px 2px rgba(0,0,0,0.5); /* Ensure visibility on light backgrounds */
    transition: background 0.3s ease;
  }
  .slider-dot.active {
    background: #fff;
    transform: scale(1.2);
  }

.slider-item .page-image, .slider-item .page-video{
  width:100%;height:100%;object-fit:contain;
}
/* 中央でスナップしたい要素に .slider-snap-center を付与する用途（任意） */
.slider-snap-center{ scroll-snap-align:center; }
`;

// FIX: Inlined ResultAccordion component to avoid creating new files.
interface ResultAccordionProps {
  title: string;
  fileName: string;
  language: string;
  code: string;
}

const ResultAccordion: React.FC<ResultAccordionProps> = ({ title, fileName, language, code }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-expanded={isOpen}
      >
        <div>
          <h3 className="text-md font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{fileName}</p>
        </div>
        <div className="flex items-center space-x-4">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-200">
          <div className="flex justify-end items-center px-4 py-2 bg-slate-50 space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  コピーしました！
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  コピー
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              ダウンロード
            </button>
          </div>
          <div className="bg-slate-800 p-4 overflow-x-auto">
            <pre><code className={`language-${language} text-sm text-slate-100`}>{code}</code></pre>
          </div>
        </div>
      )}
    </div>
  );
};

const HintBox: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 rounded-r-lg shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-sm font-semibold text-blue-800">{title}</h3>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-blue-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 pl-9 text-sm text-slate-700 space-y-3 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
          {children}
        </div>
      )}
    </div>
  );
};


const initialData: InternalData = {
  lp_title: '', gtm_id: '', ga4_id: '', perform_seo_setup: false, canonical_url: '',
  meta_description: '', og_image_url: '', first_page_content_type: 'image',
  first_image_url: '', first_image_alt: '', first_video_url: '',
  poster_delay_enabled: true, last_page_num: '', video_image_count: '',
  selected_features_input: '', company_info_url: '', privacy_policy_url: '',
  sct_law_url: '', allowed_domains_input: '', cta_url: '', cta_areas_input: '',
  cta_areas: [{ id: `cta-area-${Date.now()}`, targetImage: '', imageSize: '', areaSize: '', areaPosition: '' }],
  hidden_banner_pages_input: '',
  fallback_image_url: '', image_alt: '', cv_primary_url_patterns_input: '',
  cv_primary_event_names_input: '', cv_value_primary: '',
  cv_micro_url_patterns_input: '', cv_micro_event_names_input: '', cv_value_micro: '',
  has_gtm_ga4: false, has_extra_features: false, has_ab_test: false, has_cta: false,
  has_conversions: false, has_micro_conversions: false,
  feature_html_insert: false,
  html_insertions: [{ id: `html-ins-${Date.now()}`, position: '', content: '' }],
  feature_video_insert: false,
  video_insertions: [{ id: `video-ins-${Date.now()}`, position: '', url: '' }],
  feature_iframe_insert: false,
  iframe_insertions: [{ id: `iframe-ins-${Date.now()}`, position: '', url: '' }],
  feature_horizontal_slides: false,
  horizontal_slides: [{ id: `h-slide-${Date.now()}`, targetPage: '', slides: '' }],
  feature_popup: false,
  feature_floating_banner: false,
  enable_horizontal_swipe: false,

  popup_image_url: '',
  popup_has_alt: false,
  popup_image_alt: '',
  popup_link_type: 'return',
  popup_link_url: '',

  floating_banner_link_type: 'none',
  floating_banner_shun_form_url: '',
  floating_banner_other_url: '',
  floating_banner_image_url: '',
  floating_banner_has_alt: false,
  floating_banner_alt: '',
  floating_banner_hidden_pages: '',

  ab_test_type: 'none',
  ab_creative_test_target: 'none',
  ab_creative_fv_b_type: 'image',
  ab_presence_test_target: 'none',
  ab_creative_fv_b_url: '',
  ab_creative_fv_b_alt: '',
  ab_creative_finalcta_b_url: '',
  ab_creative_finalcta_b_alt: '',
  ab_creative_finalcta_page_num: '',
  ab_creative_banner_b_url: '',
  ab_creative_banner_b_alt: '',
  ab_creative_popup_b_url: '',
  ab_creative_popup_b_alt: '',
  ab_test_pages: [{ id: `ab-page-${Date.now()}`, pageNumberA: '', imageUrlB: '', altTextB: '' }],

  cta_link_type: 'none',
  cta_shun_form_url: '',
  cta_other_url: '',
  has_alt_text: false,
  has_fallback_image: false,
};

const ModeCard: React.FC<{ title: string, description: string, onClick: () => void }> = ({ title, description, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer border border-slate-200"
  >
    <h3 className="text-xl font-bold text-blue-600">{title}</h3>
    <p className="mt-2 text-slate-600">{description}</p>
  </div>
);

const toHalfWidth = (str: string): string => {
  if (typeof str !== 'string') return str;
  return str.replace(/[！-～]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  }).replace(/　/g, ' ');
};

const AddItemButton: React.FC<{ onClick: () => void; text: string }> = ({ onClick, text }) => (
  <button
    onClick={onClick}
    type="button"
    className="w-full mt-2 flex items-center justify-center px-4 py-2 border border-dashed border-slate-300 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
    {text}
  </button>
);

const CustomRadio: React.FC<{ name: string, value: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string }> = ({ name, value, checked, onChange, label }) => (
  <label className="flex items-center space-x-2 cursor-pointer text-slate-700">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="hidden"
    />
    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
      {checked && <span className="w-2 h-2 rounded-full bg-white"></span>}
    </span>
    <span>{label}</span>
  </label>
);

const CtaAreaEditor: React.FC<{
  cta_areas: CtaArea[];
  handleCtaAreaChange: (index: number, field: keyof Omit<CtaArea, 'id'>, value: string) => void;
  handleCtaAreaBlur: (index: number, field: keyof Omit<CtaArea, 'id'>) => (e: React.FocusEvent<HTMLInputElement>) => void;
  removeCtaArea: (index: number) => void;
  addCtaArea: () => void;
  isSimple: boolean;
  error?: string;
}> = ({ cta_areas, handleCtaAreaChange, handleCtaAreaBlur, removeCtaArea, addCtaArea, isSimple, error }) => (
  <div className="space-y-4">
    <HintBox title="CTA領域指定のケーススタディ">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800">ケース1：画像全体をCTAにする</h4>
          <p>「対象の画像」にファイル名 (例: <code>08.jpg</code>) を入力するだけ。他の項目は空欄でOKです。</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">ケース2：画像の一部を精密に指定する</h4>
          <p>「画像のサイズ」「CTAボタンのサイズ」に正確なピクセル値 (例: <code>1080x1920</code>、<code>1070x200</code>) を入力すると、ボタンの位置を精密に指定できます。</p>
          <div className="mt-2 pl-4 border-l-2 border-slate-300 space-y-1">
            <p><strong>CTAボタンの位置の書き方例:</strong></p>
            <ul className="list-disc list-inside">
              <li><code>下端から20px・中央</code>: 画像の下の端から20px上、左右は中央に配置。</li>
              <li><code>上から100px・左から50px</code>: 画像の左上を基準に配置。</li>
              <li><code>中央</code>: 画像のど真ん中に配置。</li>
            </ul>
          </div>
          <p className="mt-2"><strong>Tip:</strong> 画像サイズは、PCで画像ファイルを右クリック →「プロパティ」→「詳細」で確認できます。</p>
        </div>
      </div>
    </HintBox>
    <div>
      <label className="block text-sm font-medium text-slate-700">CTAボタンの領域指定</label>
      <div className="mt-1 text-xs text-slate-500 space-y-1">
        <p>対象の画像ごとにCTAボタンの領域を指定してください。</p>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>

    {cta_areas.map((area, index) => (
      <div key={area.id} className="p-4 border border-slate-200 rounded-lg space-y-3 relative bg-slate-50/50">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-slate-700">領域 {index + 1}</h4>
          {cta_areas.length > 1 && (
            <button
              onClick={() => removeCtaArea(index)}
              className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-full"
              aria-label={`領域 ${index + 1} を削除`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <TextInput label={isSimple ? "対象の画像" : "対象の画像または動画"} placeholder="例: 08.jpg または 8" value={area.targetImage} onChange={e => handleCtaAreaChange(index, 'targetImage', e.target.value)} onBlur={handleCtaAreaBlur(index, 'targetImage')} required />
        <TextInput
          label="画像のサイズ（任意）"
          placeholder="例: 1080x1920"
          value={area.imageSize}
          onChange={e => handleCtaAreaChange(index, 'imageSize', e.target.value)}
          onBlur={handleCtaAreaBlur(index, 'imageSize')}
          description={<>クリック領域をパーセントで計算するのに使用します。正確な「幅x高さ」を入力してください。</>}
        />
        <TextInput label="CTAボタンのサイズ（任意）" placeholder="例: 1070x200" value={area.areaSize} onChange={e => handleCtaAreaChange(index, 'areaSize', e.target.value)} onBlur={handleCtaAreaBlur(index, 'areaSize')} />
        <TextInput label="CTAボタンの位置（任意）" placeholder="例: 下端から10px・中央" value={area.areaPosition} onChange={e => handleCtaAreaChange(index, 'areaPosition', e.target.value)} onBlur={handleCtaAreaBlur(index, 'areaPosition')} />
      </div>
    ))}
    <AddItemButton onClick={addCtaArea} text="CTA領域を追加する" />
  </div>
);

const AbTestEditor: React.FC<{
  data: InternalData;
  handleDataChange: <K extends keyof InternalData>(key: K, value: InternalData[K]) => void;
  handleDataBlur: (key: keyof InternalData) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAbTestPageChange: (index: number, field: keyof Omit<AbTestPage, 'id'>, value: string) => void;
  handleAbTestPageBlur: (index: number, field: keyof Omit<AbTestPage, 'id'>) => (e: React.FocusEvent<HTMLInputElement>) => void;
  addAbTestPage: () => void;
  removeAbTestPage: (index: number) => void;
}> = ({ data, handleDataChange, handleDataBlur, handleAbTestPageChange, handleAbTestPageBlur, addAbTestPage, removeAbTestPage }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">ABテストのタイプ</label>
      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="ab_test_type" value="creative" checked={data.ab_test_type === 'creative'} onChange={e => handleDataChange('ab_test_type', e.target.value as any)} className="form-radio text-blue-600" /><span>1. 画像または動画比較テスト</span></label>
        <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="ab_test_type" value="presence" checked={data.ab_test_type === 'presence'} onChange={e => handleDataChange('ab_test_type', e.target.value as any)} className="form-radio text-blue-600" /><span>2. 機能の表示/非表示テスト</span></label>
      </div>
    </div>

    {data.ab_test_type === 'creative' && (
      <div className="p-4 border border-slate-200 rounded-lg space-y-4 bg-slate-50/50">
        <h3 className="text-md font-semibold text-slate-800">画像または動画比較テストの設定</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">どの要素でテストしますか？</label>
          <select value={data.ab_creative_test_target} onChange={e => handleDataChange('ab_creative_test_target', e.target.value as any)} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option value="none">選択してください</option>
            <option value="firstView">1. ファーストビュー</option>
            <option value="finalCta">2. 最終CTA（最後の画像）</option>
            <option value="floatingBanner">3. フローティングバナー</option>
            <option value="popup">4. 離脱防止ポップアップ</option>
            <option value="pages">5. 任意のページ</option>
          </select>
        </div>

        {data.ab_creative_test_target === 'firstView' && <div className="p-3 border-l-4 border-blue-300 space-y-3">
          <label className="block text-sm font-medium text-slate-700">Bパターンのタイプ</label>
          <div className="flex items-center space-x-6"><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="ab_creative_fv_b_type" value="image" checked={data.ab_creative_fv_b_type === 'image'} onChange={e => handleDataChange('ab_creative_fv_b_type', 'image')} className="form-radio text-blue-600" /><span>画像</span></label><label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="ab_creative_fv_b_type" value="video" checked={data.ab_creative_fv_b_type === 'video'} onChange={e => handleDataChange('ab_creative_fv_b_type', 'video')} className="form-radio text-blue-600" /><span>動画</span></label></div>
          <TextInput label="Bパターン URL" type="url" value={data.ab_creative_fv_b_url} onChange={e => handleDataChange('ab_creative_fv_b_url', e.target.value)} onBlur={handleDataBlur('ab_creative_fv_b_url')} required />
          <TextInput label="Bパターン 代替テキスト（任意）" value={data.ab_creative_fv_b_alt} onChange={e => handleDataChange('ab_creative_fv_b_alt', e.target.value)} onBlur={handleDataBlur('ab_creative_fv_b_alt')} />
        </div>}
        {data.ab_creative_test_target === 'finalCta' && <div className="p-3 border-l-4 border-blue-300 space-y-3">
          <TextInput
            label="最終CTAの画像番号"
            description="最終CTAの画像番号を入力してください（LPのページではありません）。"
            type="text"
            placeholder="例: 8"
            value={data.ab_creative_finalcta_page_num}
            onChange={e => handleDataChange('ab_creative_finalcta_page_num', e.target.value)}
            onBlur={handleDataBlur('ab_creative_finalcta_page_num')}
            required
          />
          <TextInput label="Bパターン 画像URL" type="url" value={data.ab_creative_finalcta_b_url} onChange={e => handleDataChange('ab_creative_finalcta_b_url', e.target.value)} onBlur={handleDataBlur('ab_creative_finalcta_b_url')} required />
          <TextInput label="Bパターン 代替テキスト（任意）" value={data.ab_creative_finalcta_b_alt} onChange={e => handleDataChange('ab_creative_finalcta_b_alt', e.target.value)} onBlur={handleDataBlur('ab_creative_finalcta_b_alt')} />
        </div>}
        {data.ab_creative_test_target === 'floatingBanner' && <div className="p-3 border-l-4 border-blue-300 space-y-3">
          <TextInput label="Bパターン 画像URL" type="url" value={data.ab_creative_banner_b_url} onChange={e => handleDataChange('ab_creative_banner_b_url', e.target.value)} onBlur={handleDataBlur('ab_creative_banner_b_url')} required />
          <TextInput label="Bパターン 代替テキスト（任意）" value={data.ab_creative_banner_b_alt} onChange={e => handleDataChange('ab_creative_banner_b_alt', e.target.value)} onBlur={handleDataBlur('ab_creative_banner_b_alt')} />
        </div>}
        {data.ab_creative_test_target === 'popup' && <div className="p-3 border-l-4 border-blue-300 space-y-3">
          <TextInput label="Bパターン 画像URL" type="url" value={data.ab_creative_popup_b_url} onChange={e => handleDataChange('ab_creative_popup_b_url', e.target.value)} onBlur={handleDataBlur('ab_creative_popup_b_url')} required />
          <TextInput label="Bパターン 代替テキスト（任意）" value={data.ab_creative_popup_b_alt} onChange={e => handleDataChange('ab_creative_popup_b_alt', e.target.value)} onBlur={handleDataBlur('ab_creative_popup_b_alt')} />
        </div>}
        {data.ab_creative_test_target === 'pages' && <div className="p-3 border-l-4 border-blue-300 space-y-4">
          <p className="text-sm text-slate-600">Bパターンを適用するページを3行1セットで入力してください。</p>
          {data.ab_test_pages.map((page, index) => (
            <div key={page.id} className="p-4 border border-slate-200 rounded-lg space-y-3 relative bg-white">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-slate-700">ページセット {index + 1}</h4>
                {data.ab_test_pages.length > 1 && <button onClick={() => removeAbTestPage(index)} className="text-slate-400 hover:text-red-600 p-1 rounded-full" aria-label={`削除`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
              </div>
              <TextInput label="Aパターンのページ番号" type="number" placeholder="例: 2" value={page.pageNumberA} onChange={e => handleAbTestPageChange(index, 'pageNumberA', e.target.value)} onBlur={handleAbTestPageBlur(index, 'pageNumberA')} required />
              <TextInput label="Bパターンの画像URL" type="url" placeholder="https://..." value={page.imageUrlB} onChange={e => handleAbTestPageChange(index, 'imageUrlB', e.target.value)} onBlur={handleAbTestPageBlur(index, 'imageUrlB')} required />
              <TextInput label="Bパターンの代替テキスト（任意）" value={page.altTextB} onChange={e => handleAbTestPageChange(index, 'altTextB', e.target.value)} onBlur={handleAbTestPageBlur(index, 'altTextB')} />
            </div>
          ))}
          <AddItemButton onClick={addAbTestPage} text="ページセットを追加" />
        </div>}
      </div>
    )}

    {data.ab_test_type === 'presence' && (
      <div className="p-4 border border-slate-200 rounded-lg space-y-4 bg-slate-50/50">
        <h3 className="text-md font-semibold text-slate-800">機能の表示/非表示テストの設定</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">B パターンはどの機能を非表示にしますか？</label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="ab_presence_test_target" value="popup" checked={data.ab_presence_test_target === 'popup'} onChange={e => handleDataChange('ab_presence_test_target', 'popup')} className="form-radio text-blue-600" /><span>離脱防止ポップアップ</span></label>
            <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="ab_presence_test_target" value="floatingBanner" checked={data.ab_presence_test_target === 'floatingBanner'} onChange={e => handleDataChange('ab_presence_test_target', 'floatingBanner')} className="form-radio text-blue-600" /><span>フローティングバナー</span></label>
          </div>
        </div>
      </div>
    )}
  </div>
);

const ExtraFeatures: React.FC<{
  data: InternalData;
  handleDataChange: <K extends keyof InternalData>(key: K, value: InternalData[K]) => void;
  handleDataBlur: (key: keyof InternalData) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleHtmlInsertionChange: (index: number, field: keyof Omit<HtmlInsertion, 'id'>, value: string) => void;
  handleHtmlInsertionBlur: (index: number, field: keyof Omit<HtmlInsertion, 'id'>) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  addHtmlInsertion: () => void;
  removeHtmlInsertion: (index: number) => void;
  handleVideoInsertionChange: (index: number, field: keyof Omit<VideoInsertion, 'id'>, value: string) => void;
  handleVideoInsertionBlur: (index: number, field: keyof Omit<VideoInsertion, 'id'>) => (e: React.FocusEvent<HTMLInputElement>) => void;
  addVideoInsertion: () => void;
  removeVideoInsertion: (index: number) => void;
  handleIframeInsertionChange: (index: number, field: keyof Omit<IframeInsertion, 'id'>, value: string) => void;
  handleIframeInsertionBlur: (index: number, field: keyof Omit<IframeInsertion, 'id'>) => (e: React.FocusEvent<HTMLInputElement>) => void;
  addIframeInsertion: () => void;
  removeIframeInsertion: (index: number) => void;
  handleHorizontalSlideChange: (index: number, field: keyof Omit<HorizontalSlide, 'id'>, value: string) => void;
  handleHorizontalSlideBlur: (index: number, field: keyof Omit<HorizontalSlide, 'id'>) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  addHorizontalSlide: () => void;
  removeHorizontalSlide: (index: number) => void;
  mode: LpMode;
}> = ({
  data,
  handleDataChange,
  handleDataBlur,
  handleHtmlInsertionChange, handleHtmlInsertionBlur, addHtmlInsertion, removeHtmlInsertion,
  handleVideoInsertionChange, handleVideoInsertionBlur, addVideoInsertion, removeVideoInsertion,
  handleIframeInsertionChange, handleIframeInsertionBlur, addIframeInsertion, removeIframeInsertion,
  handleHorizontalSlideChange, handleHorizontalSlideBlur, addHorizontalSlide, removeHorizontalSlide,
  mode
}) => (
    <div className="space-y-6">
      {mode === LpMode.FULL_CUSTOM && (
        <>
          <RadioToggle label="横スワイプコンテンツ" options={[{ label: 'しない', value: false }, { label: 'する', value: true }]} value={data.feature_horizontal_slides} onChange={v => handleDataChange('feature_horizontal_slides', v)}>
            <p className="text-sm text-slate-600 mb-2">特定のページ内に横スワイプで閲覧できる画像を追加します。</p>
            {data.horizontal_slides.map((item, index) => (
              <div key={item.id} className="p-4 border border-slate-200 rounded-lg space-y-3 relative bg-slate-50/50 mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-slate-700">スライドグループ {index + 1}</h4>
                  {data.horizontal_slides.length > 1 && <button onClick={() => removeHorizontalSlide(index)} className="text-slate-400 hover:text-red-600 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
                </div>
                <TextInput label="対象ページ番号" placeholder="例: 2" value={item.targetPage} onChange={e => handleHorizontalSlideChange(index, 'targetPage', e.target.value)} onBlur={handleHorizontalSlideBlur(index, 'targetPage')} required />
                <TextareaInput label="スライド画像URL (1行に1つ)" placeholder="https://...\nhttps://..." value={item.slides} onChange={e => handleHorizontalSlideChange(index, 'slides', e.target.value)} onBlur={handleHorizontalSlideBlur(index, 'slides')} rows={4} required />
              </div>
            ))}
            <AddItemButton onClick={addHorizontalSlide} text="スライドグループを追加" />
          </RadioToggle>
        </>
      )}

      <RadioToggle label="HTMLの挿入" options={[{ label: 'しない', value: false }, { label: 'する', value: true }]} value={data.feature_html_insert} onChange={v => handleDataChange('feature_html_insert', v)}>
        {data.html_insertions.map((item, index) => (
          <div key={item.id} className="p-4 border border-slate-200 rounded-lg space-y-3 relative bg-slate-50/50 mb-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-slate-700">HTML {index + 1}</h4>
              {data.html_insertions.length > 1 && <button onClick={() => removeHtmlInsertion(index)} className="text-slate-400 hover:text-red-600 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
            </div>
            <TextInput label="挿入位置" placeholder="例: 1.5 (1と2ページ目の間)" value={item.position} onChange={e => handleHtmlInsertionChange(index, 'position', e.target.value)} onBlur={handleHtmlInsertionBlur(index, 'position')} required />
            <TextareaInput label="HTMLコード" placeholder="<div>...</div>" value={item.content} onChange={e => handleHtmlInsertionChange(index, 'content', e.target.value)} onBlur={handleHtmlInsertionBlur(index, 'content')} rows={4} required />
          </div>
        ))}
        <AddItemButton onClick={addHtmlInsertion} text="HTMLを追加" />
      </RadioToggle>

      <RadioToggle label="動画の挿入" options={[{ label: 'しない', value: false }, { label: 'する', value: true }]} value={data.feature_video_insert} onChange={v => handleDataChange('feature_video_insert', v)}>
        {data.video_insertions.map((item, index) => (
          <div key={item.id} className="p-4 border border-slate-200 rounded-lg space-y-3 relative bg-slate-50/50 mb-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-slate-700">動画 {index + 1}</h4>
              {data.video_insertions.length > 1 && <button onClick={() => removeVideoInsertion(index)} className="text-slate-400 hover:text-red-600 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
            </div>
            <TextInput label="挿入位置" placeholder="例: 2.5" value={item.position} onChange={e => handleVideoInsertionChange(index, 'position', e.target.value)} onBlur={handleVideoInsertionBlur(index, 'position')} required />
            <TextInput label="動画URL" type="url" placeholder="https://..." value={item.url} onChange={e => handleVideoInsertionChange(index, 'url', e.target.value)} onBlur={handleVideoInsertionBlur(index, 'url')} required />
          </div>
        ))}
        <AddItemButton onClick={addVideoInsertion} text="動画を追加" />
      </RadioToggle>

      <RadioToggle label="iframeの挿入" options={[{ label: 'しない', value: false }, { label: 'する', value: true }]} value={data.feature_iframe_insert} onChange={v => handleDataChange('feature_iframe_insert', v)}>
        {data.iframe_insertions.map((item, index) => (
          <div key={item.id} className="p-4 border border-slate-200 rounded-lg space-y-3 relative bg-slate-50/50 mb-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-slate-700">iframe {index + 1}</h4>
              {data.iframe_insertions.length > 1 && <button onClick={() => removeIframeInsertion(index)} className="text-slate-400 hover:text-red-600 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
            </div>
            <TextInput label="挿入位置" placeholder="例: 3.5" value={item.position} onChange={e => handleIframeInsertionChange(index, 'position', e.target.value)} onBlur={handleIframeInsertionBlur(index, 'position')} required />
            <TextInput label="iframe URL" type="url" placeholder="https://..." value={item.url} onChange={e => handleIframeInsertionChange(index, 'url', e.target.value)} onBlur={handleIframeInsertionBlur(index, 'url')} required />
          </div>
        ))}
        <AddItemButton onClick={addIframeInsertion} text="iframeを追加" />
      </RadioToggle>

      <RadioToggle label="離脱防止ポップアップ" options={[{ label: 'しない', value: false }, { label: 'する', value: true }]} value={data.feature_popup} onChange={v => handleDataChange('feature_popup', v)}>
        <div className="space-y-4">
          <TextInput label="画像URL" type="url" value={data.popup_image_url} onChange={e => handleDataChange('popup_image_url', e.target.value)} onBlur={handleDataBlur('popup_image_url')} placeholder="https://example.com/popup.jpg" required />
          <RadioToggle label="代替テキスト" options={[{ label: '設定しない', value: false }, { label: '設定する', value: true }]} value={data.popup_has_alt} onChange={v => handleDataChange('popup_has_alt', v)}>
            <TextInput label="代替テキストの内容" placeholder="キャンペーン情報" value={data.popup_image_alt} onChange={e => handleDataChange('popup_image_alt', e.target.value)} onBlur={handleDataBlur('popup_image_alt')} required />
          </RadioToggle>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">クリック時の動作</label>
            <div className="flex items-center space-x-4">
              <CustomRadio name="popup_link_type" value="return" label="ページに戻る" checked={data.popup_link_type === 'return'} onChange={e => handleDataChange('popup_link_type', e.target.value as 'return' | 'url')} />
              <CustomRadio name="popup_link_type" value="url" label="リンク先に移動" checked={data.popup_link_type === 'url'} onChange={e => handleDataChange('popup_link_type', e.target.value as 'return' | 'url')} />
            </div>
          </div>
          {data.popup_link_type === 'url' && (
            <TextInput label="リンク先URL" type="url" value={data.popup_link_url} onChange={e => handleDataChange('popup_link_url', e.target.value)} onBlur={handleDataBlur('popup_link_url')} placeholder="https://example.com/product" required />
          )}
        </div>
      </RadioToggle>

      <RadioToggle label="フローティングバナー" options={[{ label: 'しない', value: false }, { label: 'する', value: true }]} value={data.feature_floating_banner} onChange={v => handleDataChange('feature_floating_banner', v)}>
        <div className="space-y-4">
          <TextInput label="バナー画像URL" type="url" placeholder="https://example.com/banner.png" value={data.floating_banner_image_url} onChange={e => handleDataChange('floating_banner_image_url', e.target.value)} onBlur={handleDataBlur('floating_banner_image_url')} required />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">リンク先タイプ</label>
            <div className="flex items-center space-x-4">
              <CustomRadio name="fb_link_type" value="shun_form" label="瞬フォーム" checked={data.floating_banner_link_type === 'shun_form'} onChange={e => handleDataChange('floating_banner_link_type', e.target.value as any)} />
              <CustomRadio name="fb_link_type" value="other" label="その他" checked={data.floating_banner_link_type === 'other'} onChange={e => handleDataChange('floating_banner_link_type', e.target.value as any)} />
            </div>
          </div>

          {data.floating_banner_link_type === 'shun_form' && (
            <TextInput label="瞬フォームURL" type="url" placeholder="https://..." value={data.floating_banner_shun_form_url} onChange={e => handleDataChange('floating_banner_shun_form_url', e.target.value)} onBlur={handleDataBlur('floating_banner_shun_form_url')} required />
          )}
          {data.floating_banner_link_type === 'other' && (
            <TextInput label="リンク先URL" type="url" placeholder="https://..." value={data.floating_banner_other_url} onChange={e => handleDataChange('floating_banner_other_url', e.target.value)} onBlur={handleDataBlur('floating_banner_other_url')} required />
          )}

          <RadioToggle label="代替テキスト" options={[{ label: '設定しない', value: false }, { label: '設定する', value: true }]} value={data.floating_banner_has_alt} onChange={v => handleDataChange('floating_banner_has_alt', v)}>
            <TextInput label="代替テキストの内容" placeholder="詳細はこちら" value={data.floating_banner_alt} onChange={e => handleDataChange('floating_banner_alt', e.target.value)} onBlur={handleDataBlur('floating_banner_alt')} required />
          </RadioToggle>

          <TextareaInput
            label="非表示にするページ"
            value={data.floating_banner_hidden_pages}
            onChange={e => handleDataChange('floating_banner_hidden_pages', e.target.value)}
            onBlur={handleDataBlur('floating_banner_hidden_pages')}
            rows={3}
            description="非表示にしたいページ番号やファイル名を改行区切りで入力。例: 3, fv.jpg, 会社情報"
          />
        </div>
      </RadioToggle>
    </div>
  );

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [mode, setMode] = useState<LpMode>(LpMode.NONE);
  const [data, setData] = useState<InternalData>(initialData);
  const [generated, setGenerated] = useState<{ html: string, json: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof InternalData, string>>>({});
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (sessionStorage.getItem('shun-gene-auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === '1121' && password === '1124') {
      sessionStorage.setItem('shun-gene-auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('IDまたはパスワードが正しくありません。');
    }
  };

  const handleDataChange = <K extends keyof InternalData>(key: K, value: InternalData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleCtaAreaChange = (index: number, field: keyof Omit<CtaArea, 'id'>, value: string) => {
    setData(prev => {
      const newCtaAreas = [...prev.cta_areas];
      newCtaAreas[index] = { ...newCtaAreas[index], [field]: value };
      return { ...prev, cta_areas: newCtaAreas };
    });
  };

  const handleDataBlur = (key: keyof InternalData) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const processedValue = toHalfWidth(value);
    if ((data[key] as string) !== processedValue) {
      // FIX: Corrected an invalid type cast. The generic parameter 'K' was not defined in this scope.
      // Using 'any' resolves the compilation error and is consistent with other event handlers in the component.
      handleDataChange(key, processedValue as any);
    }
  };

  const handleCtaAreaBlur = (index: number, field: keyof Omit<CtaArea, 'id'>) => (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const processedValue = toHalfWidth(value);
    if (data.cta_areas[index][field] !== processedValue) {
      handleCtaAreaChange(index, field, processedValue);
    }
  };

  const addCtaArea = () => {
    setData(prev => ({
      ...prev,
      cta_areas: [
        ...prev.cta_areas,
        { id: `cta-area-${Date.now()}`, targetImage: '', imageSize: '', areaSize: '', areaPosition: '' }
      ]
    }));
  };

  const removeCtaArea = (index: number) => {
    setData(prev => ({
      ...prev,
      cta_areas: prev.cta_areas.filter((_, i) => i !== index)
    }));
  };

  const handleAbTestPageChange = (index: number, field: keyof Omit<AbTestPage, 'id'>, value: string) => {
    setData(prev => {
      const newPages = [...prev.ab_test_pages];
      newPages[index] = { ...newPages[index], [field]: value };
      return { ...prev, ab_test_pages: newPages };
    });
  };

  const handleAbTestPageBlur = (index: number, field: keyof Omit<AbTestPage, 'id'>) => (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const processedValue = toHalfWidth(value);
    if (data.ab_test_pages[index][field] !== processedValue) {
      handleAbTestPageChange(index, field, processedValue);
    }
  };

  const addAbTestPage = () => {
    setData(prev => ({
      ...prev,
      ab_test_pages: [
        ...prev.ab_test_pages,
        { id: `ab-page-${Date.now()}`, pageNumberA: '', imageUrlB: '', altTextB: '' }
      ]
    }));
  };

  const removeAbTestPage = (index: number) => {
    setData(prev => ({
      ...prev,
      ab_test_pages: prev.ab_test_pages.filter((_, i) => i !== index)
    }));
  };

  // Handlers for HTML Insertions
  const handleHtmlInsertionChange = (index: number, field: keyof Omit<HtmlInsertion, 'id'>, value: string) => {
    setData(prev => {
      const newItems = [...prev.html_insertions];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, html_insertions: newItems };
    });
  };
  const handleHtmlInsertionBlur = (index: number, field: keyof Omit<HtmlInsertion, 'id'>) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const processedValue = toHalfWidth(value);
    if (data.html_insertions[index][field] !== processedValue) {
      handleHtmlInsertionChange(index, field, processedValue);
    }
  };
  const addHtmlInsertion = () => {
    setData(prev => ({ ...prev, html_insertions: [...prev.html_insertions, { id: `html-ins-${Date.now()}`, position: '', content: '' }] }));
  };
  const removeHtmlInsertion = (index: number) => {
    setData(prev => ({ ...prev, html_insertions: prev.html_insertions.filter((_, i) => i !== index) }));
  };

  // Handlers for Video Insertions
  const handleVideoInsertionChange = (index: number, field: keyof Omit<VideoInsertion, 'id'>, value: string) => {
    setData(prev => {
      const newItems = [...prev.video_insertions];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, video_insertions: newItems };
    });
  };
  const handleVideoInsertionBlur = (index: number, field: keyof Omit<VideoInsertion, 'id'>) => (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const processedValue = toHalfWidth(value);
    if (data.video_insertions[index][field] !== processedValue) {
      handleVideoInsertionChange(index, field, processedValue);
    }
  };
  const addVideoInsertion = () => {
    setData(prev => ({ ...prev, video_insertions: [...prev.video_insertions, { id: `video-ins-${Date.now()}`, position: '', url: '' }] }));
  };
  const removeVideoInsertion = (index: number) => {
    setData(prev => ({ ...prev, video_insertions: prev.video_insertions.filter((_, i) => i !== index) }));
  };

  // Handlers for Iframe Insertions
  const handleIframeInsertionChange = (index: number, field: keyof Omit<IframeInsertion, 'id'>, value: string) => {
    setData(prev => {
      const newItems = [...prev.iframe_insertions];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, iframe_insertions: newItems };
    });
  };
  const handleIframeInsertionBlur = (index: number, field: keyof Omit<IframeInsertion, 'id'>) => (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const processedValue = toHalfWidth(value);
    if (data.iframe_insertions[index][field] !== processedValue) {
      handleIframeInsertionChange(index, field, processedValue);
    }
  };
  const addIframeInsertion = () => {
    setData(prev => ({ ...prev, iframe_insertions: [...prev.iframe_insertions, { id: `iframe-ins-${Date.now()}`, position: '', url: '' }] }));
  };
  const removeIframeInsertion = (index: number) => {
    setData(prev => ({ ...prev, iframe_insertions: prev.iframe_insertions.filter((_, i) => i !== index) }));
  };

  // Handlers for Horizontal Slides
  const handleHorizontalSlideChange = (index: number, field: keyof Omit<HorizontalSlide, 'id'>, value: string) => {
    setData(prev => {
      const newItems = [...prev.horizontal_slides];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, horizontal_slides: newItems };
    });
  };
  const handleHorizontalSlideBlur = (index: number, field: keyof Omit<HorizontalSlide, 'id'>) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const processedValue = toHalfWidth(value);
    if (data.horizontal_slides[index][field] !== processedValue) {
      handleHorizontalSlideChange(index, field, processedValue);
    }
  };
  const addHorizontalSlide = () => {
    setData(prev => ({ ...prev, horizontal_slides: [...prev.horizontal_slides, { id: `h-slide-${Date.now()}`, targetPage: '', slides: '' }] }));
  };
  const removeHorizontalSlide = (index: number) => {
    setData(prev => ({ ...prev, horizontal_slides: prev.horizontal_slides.filter((_, i) => i !== index) }));
  };

  const isSimple = mode === LpMode.SIMPLE;
  const isAdvanced = mode === LpMode.ADVANCED;
  const isFull = mode === LpMode.FULL_CUSTOM;

  const isCtaAreaDisabled = data.cta_link_type === 'floating_banner';

  const validate = () => {
    const newErrors: Partial<Record<keyof InternalData, string>> = {};

    // 1. Basic info validation
    if (!data.lp_title) newErrors.lp_title = 'LPタイトルは必須です。';
    if (!data.first_image_url) newErrors.first_image_url = isSimple ? '1ページ目に使用する画像のURLは必須です。' : '1ページ目に使用する画像/動画のURLは必須です。';
    if (!data.last_page_num) newErrors.last_page_num = '総枚数は必須です。';
    if (data.has_fallback_image && !data.fallback_image_url) {
      newErrors.fallback_image_url = '代替画像URLは必須です。';
    }

    // 2. CTA validation
    if (data.cta_link_type === 'none') {
      newErrors.cta_link_type = 'CTAのリンク先タイプは必須です。';
    } else if (data.cta_link_type === 'shun_form' && !data.cta_shun_form_url) {
      newErrors.cta_shun_form_url = '瞬フォームURLは必須です。';
    } else if (data.cta_link_type === 'other' && !data.cta_other_url) {
      newErrors.cta_other_url = 'その他のリンク先URLは必須です。';
    }

    if (data.cta_link_type !== 'none' && data.cta_link_type !== 'floating_banner' && data.cta_areas.some(area => !area.targetImage)) {
      newErrors.cta_areas_input = 'CTAを設定する場合、少なくとも1つの「対象の画像」を指定してください。';
    }

    // 3. Conversions validation
    const conversionsRequired = data.has_conversions;
    if (conversionsRequired && !disableConversions) {
      if (!data.cv_primary_url_patterns_input && !data.cv_primary_event_names_input) {
        newErrors.cv_primary_url_patterns_input = 'URLに含むワードかGA4イベント名のどちらかは入力してください。';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareDataForGenerator = () => {
    const ctaAreasString = data.cta_areas
      .filter(area => area.targetImage || area.imageSize || area.areaSize || area.areaPosition)
      .map(area =>
        `${area.targetImage}\n${area.imageSize}\n${area.areaSize}\n${area.areaPosition}`
      )
      .join('\n\n');

    return {
      ...data,
      cta_areas_input: ctaAreasString,
    };
  };

  const handleGenerate = () => {
    if (!validate()) {
      const firstErrorKey = Object.keys(errors)[0] as keyof InternalData;
      if (firstErrorKey) {
        const element = fieldRefs.current[firstErrorKey];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // Trial version behavior: open modal instead of generating files
    // setIsTrialModalOpen(true);

    // --- Full version logic ---
    const dataForGenerator = prepareDataForGenerator();
    const { html, json } = generateFiles(dataForGenerator, DEFAULT_CSS);
    setGenerated({ html, json });

    setTimeout(() => {
      const resultEl = document.getElementById('generation-result');
      resultEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const disableConversions = useMemo(() => {
    const shunFormInCta = data.cta_link_type === 'shun_form' && !!data.cta_shun_form_url;
    const shunFormInBanner = data.feature_floating_banner && data.floating_banner_link_type === 'shun_form' && !!data.floating_banner_shun_form_url;
    return shunFormInCta || shunFormInBanner;
  }, [data.cta_link_type, data.cta_shun_form_url, data.feature_floating_banner, data.floating_banner_link_type, data.floating_banner_shun_form_url]);

  const contentOrderPreview = useMemo(() => {
    if (mode !== LpMode.ADVANCED && mode !== LpMode.FULL_CUSTOM) return [];

    const items: { position: number; type: string; description: string }[] = [];

    // Base pages
    const totalPages = parseInt(data.last_page_num, 10);
    if (!isNaN(totalPages) && totalPages > 0 && data.first_image_url) {
      // Page 1
      items.push({
        position: 1,
        type: '画像/動画',
        description: `1ページ目として設定 (${data.first_image_url.split('/').pop()})`,
      });
      // Pages 2+
      for (let i = 2; i <= totalPages; i++) {
        items.push({
          position: i,
          type: '画像/動画',
          description: `${i}ページ目として設定`,
        });
      }
    }

    // Insertions
    const addInsertions = (
      isEnabled: boolean,
      insertions: { id: string; position: string;[key: string]: any }[],
      type: string
    ) => {
      if (isEnabled) {
        insertions.forEach(item => {
          const pos = parseFloat(item.position);
          if (!isNaN(pos) && item.position.trim() !== '') {
            items.push({
              position: pos,
              type: type,
              description: `挿入位置: ${item.position}`,
            });
          }
        });
      }
    };

    addInsertions(data.feature_html_insert, data.html_insertions, 'HTML');
    addInsertions(data.feature_video_insert, data.video_insertions, '動画');
    addInsertions(data.feature_iframe_insert, data.iframe_insertions, 'iframe');

    return items.sort((a, b) => a.position - b.position);
  }, [
    mode, data.last_page_num, data.first_image_url,
    data.feature_html_insert, data.html_insertions,
    data.feature_video_insert, data.video_insertions,
    data.feature_iframe_insert, data.iframe_insertions,
  ]);


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800">瞬ジェネ</h1>
            <p className="mt-2 text-slate-600">ログインしてください</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg border border-slate-200">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-slate-700">ID</label>
                <input
                  id="id"
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">パスワード</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              {authError && <p className="text-sm text-red-500 text-center">{authError}</p>}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ログイン
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (mode === LpMode.NONE) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-800">スワイプLP AIジェネレーター 瞬ジェネ</h1>
          <p className="mt-3 text-lg text-slate-600">作成したいLPのタイプを番号で選択してください。</p>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800 max-w-2xl mx-auto text-left">
            <p><strong className="font-semibold">【重要】</strong> 本ジェネレーターで使用する画像や動画は、事前にサーバーへアップロードし、公開URLをご用意いただく必要があります。</p>
          </div>
        </div>
        <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6">
          <ModeCard title="1. シンプル版" description="画像+CTA構成のみ" onClick={() => setMode(LpMode.SIMPLE)} />
          <ModeCard title="2. 高機能版" description="動画、カスタムHTML、離脱防止ポップアップ、フローティングバナーの追加が可能" onClick={() => setMode(LpMode.ADVANCED)} />
          <ModeCard title="3. フルカスタム版" description="高機能版+ABテストを含む全機能" onClick={() => {
            setMode(LpMode.FULL_CUSTOM);
            handleDataChange('has_ab_test', true);
          }} />
        </div>
      </div>
    );
  }

  const renderRef = (key: keyof InternalData) => (el: HTMLDivElement | null) => {
    fieldRefs.current[key] = el;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">スワイプLP AIジェネレーター 瞬ジェネ</h1>
        <p className="mt-2 text-slate-600">選択されたモード: <span className="font-semibold text-blue-600">{mode.replace('_', ' ').toUpperCase()}</span></p>
        <button onClick={() => { setMode(LpMode.NONE); setGenerated(null); setData(initialData); setErrors({}); }} className="mt-4 text-sm text-blue-600 hover:underline">← モード選択に戻る</button>
      </header>

      <main className="space-y-8">

        {/* Section 1 */}
        <div ref={renderRef('lp_title')} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 border-l-4 border-blue-500 pl-3">1. 基本情報・サイト情報</h2>
          <TextInput label="LPタイトル" placeholder="例：革新的な美容液LP" value={data.lp_title} onChange={e => handleDataChange('lp_title', e.target.value)} onBlur={handleDataBlur('lp_title')} required error={errors.lp_title} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">サイト情報</label>
            <p className="text-xs text-slate-500 mb-2">以下の情報を入力してください。（不要な項目は空欄のままにしてください）</p>
            <div className="grid md:grid-cols-3 gap-4">
              <TextInput label="運営者情報ページURL" placeholder="https://example.com/company" type="url" value={data.company_info_url} onChange={e => handleDataChange('company_info_url', e.target.value)} onBlur={handleDataBlur('company_info_url')} />
              <TextInput label="個人情報保護方針URL" placeholder="https://example.com/privacy" type="url" value={data.privacy_policy_url} onChange={e => handleDataChange('privacy_policy_url', e.target.value)} onBlur={handleDataBlur('privacy_policy_url')} />
              <TextInput label="特定商取引法表記URL" placeholder="https://example.com/legal" type="url" value={data.sct_law_url} onChange={e => handleDataChange('sct_law_url', e.target.value)} onBlur={handleDataBlur('sct_law_url')} />
            </div>
          </div>
        </div>

        <RadioToggle label="データ解析 (GTM/GA4)" options={[{ label: 'しない', value: false }, { label: 'する', value: true }]} value={data.has_gtm_ga4} onChange={v => handleDataChange('has_gtm_ga4', v)}>
          <div className="grid md:grid-cols-2 gap-4">
            <TextInput label="GTM ID" placeholder="例：GTM-XXXXXXX" value={data.gtm_id} onChange={e => handleDataChange('gtm_id', e.target.value)} onBlur={handleDataBlur('gtm_id')} />
            <TextInput label="GA4測定ID" placeholder="例：G-XXXXXXXXXX" value={data.ga4_id} onChange={e => handleDataChange('ga4_id', e.target.value)} onBlur={handleDataBlur('ga4_id')} />
          </div>
        </RadioToggle>

        {/* Section 2 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 border-l-4 border-blue-500 pl-3">2. ページの設定</h2>
          <HintBox title="画像の連番ルールとヒント" defaultOpen={false}>
            {isSimple ? (
              <>
                <h4 className="font-semibold text-slate-800">・1ページ目に使用する画像のURL</h4>
                <p>画像は必ず同じ拡張子で連番にしてください。</p>
                <div className="mt-2 pl-4 border-l-2 border-slate-300 space-y-1">
                  <p><strong>例1: ゼロ埋めあり</strong><br /><code>https://.../img-01.jpg</code> → <code>.../img-02.jpg</code>, <code>.../img-03.jpg</code></p>
                  <p><strong>例2: ゼロ埋めなし</strong><br /><code>https://.../photo_1.png</code> → <code>.../photo_2.png</code>,<code>.../photo_3.png</code></p>
                  <p><strong>例3: 数字のみ</strong><br /><code>https://.../1.webp</code> → <code>.../2.webp</code>, <code>.../3.webp</code></p>
                </div>
                <p className="mt-2">ゼロ埋め (01, 02...) は必須ではありませんが、桁数が揃うため推奨です。</p>
                <p>ファイル形式 (.jpg, .png など) は問いません。</p>
                <h4 className="font-semibold text-slate-800 mt-4">・総枚数</h4>
                <p>画像の総枚数を記入してください。</p>
              </>
            ) : (
              <>
                <h4 className="font-semibold text-slate-800">・1ページ目に使用する画像/動画のURL</h4>
                <p>画像/動画は必ず同じ拡張子で連番にしてください。</p>
                <div className="mt-2 pl-4 border-l-2 border-slate-300 space-y-1">
                  <p><strong>例1: ゼロ埋めあり</strong><br /><code>https://.../img-01.jpg</code> → <code>.../img-02.jpg</code>, <code>.../img-03.jpg</code></p>
                  <p><strong>例2: ゼロ埋めなし</strong><br /><code>https://.../photo_1.png</code> → <code>.../photo_2.png</code>,<code>.../photo_3.png</code></p>
                  <p><strong>例3: 数字のみ</strong><br /><code>https://.../1.mp4</code> → <code>.../2.mp4</code>, <code>.../3.mp4</code></p>
                </div>
                <p className="mt-2">ゼロ埋め (01, 02...) は必須ではありませんが、桁数が揃うため推奨です。</p>
                <p>ファイル形式 (.jpg, .png など) は問いません。</p>
                <h4 className="font-semibold text-slate-800 mt-4">・総枚数</h4>
                <p>同じ拡張子の総枚数を記入してください。<br />画像メインで動画を挿入したい場合など、違う拡張子のコンテンツはカウントしないでください。</p>
                <p className="mt-2"><strong>例:</strong> 画像が8枚、動画が1つの場合「8」と記入</p>
              </>
            )}
          </HintBox>
          <div ref={renderRef('first_image_url')}><TextInput placeholder="https://.../img-01.jpg" label={isSimple ? "1ページ目に使用する画像のURL" : "1ページ目に使用する画像/動画のURL"} type="url" value={data.first_image_url} onChange={e => handleDataChange('first_image_url', e.target.value)} onBlur={handleDataBlur('first_image_url')} required error={errors.first_image_url} /></div>
          <div ref={renderRef('last_page_num')}><TextInput placeholder="例: 8" label="総枚数" type="number" value={data.last_page_num} onChange={e => handleDataChange('last_page_num', e.target.value)} onBlur={handleDataBlur('last_page_num')} required error={errors.last_page_num} /></div>
          <RadioToggle label="altテキスト設定" options={[{ label: 'しない', value: false }, { label: 'する', value: true }]} value={data.has_alt_text} onChange={v => handleDataChange('has_alt_text', v)}>
            <div className="space-y-4">
              <TextInput
                label="1ページ目の説明"
                description="1ページ目の画像/動画の代替テキスト（alt属性）を設定します。SEOやアクセシビリティに有効です。"
                placeholder="例：革新的な美容液の紹介画像"
                value={data.first_image_alt}
                onChange={e => handleDataChange('first_image_alt', e.target.value)}
                onBlur={handleDataBlur('first_image_alt')}
              />
              <TextInput
                label="2ページ目以降の説明"
                description="例: 「LP画像 {n}」のように入力すると、{n} がページ番号に置き換わります。"
                placeholder="例: LP画像 {n}"
                value={data.image_alt}
                onChange={e => handleDataChange('image_alt', e.target.value)}
                onBlur={handleDataBlur('image_alt')}
              />
            </div>
          </RadioToggle>
          <div ref={renderRef('fallback_image_url')}>
            <RadioToggle
              label="画像/動画の読み込み失敗時の代替画像URL"
              description="画像や動画が表示できない場合に代わりに表示する画像を設定します。"
              options={[{ label: 'しない', value: false }, { label: 'する', value: true }]}
              value={data.has_fallback_image}
              onChange={v => handleDataChange('has_fallback_image', v)}
            >
              <TextInput
                label="代替画像URL"
                type="url"
                placeholder="https://example.com/fallback.jpg"
                value={data.fallback_image_url}
                onChange={e => handleDataChange('fallback_image_url', e.target.value)}
                onBlur={handleDataBlur('fallback_image_url')}
                required
                error={errors.fallback_image_url}
              />
            </RadioToggle>
          </div>
        </div>

        {/* Section 3: CTA */}
        <div ref={renderRef('cta_link_type')} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 border-l-4 border-blue-500 pl-3">3. CTA（コール・トゥ・アクション）</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">CTAのリンク先タイプ<span className="text-red-500 text-xs font-normal ml-1">必須</span></label>
            <select value={data.cta_link_type} onChange={e => handleDataChange('cta_link_type', e.target.value as any)} className={`block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors ${errors.cta_link_type ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}>
              <option value="none">選択してください</option>
              <option value="shun_form">瞬フォーム</option>
              <option value="other">その他（外部サイトなど）</option>
              {(isAdvanced || isFull) && (
                <option value="floating_banner">フローティングバナーから設定</option>
              )}
            </select>
            {errors.cta_link_type && <p className="mt-1 text-xs text-red-500">{errors.cta_link_type}</p>}
          </div>
          {data.cta_link_type === 'shun_form' && <div ref={renderRef('cta_shun_form_url')}><TextInput label="瞬フォームURL" type="url" value={data.cta_shun_form_url} onChange={e => handleDataChange('cta_shun_form_url', e.target.value)} onBlur={handleDataBlur('cta_shun_form_url')} required error={errors.cta_shun_form_url} /></div>}
          {data.cta_link_type === 'other' && <div ref={renderRef('cta_other_url')}><TextInput label="その他のリンク先URL" type="url" value={data.cta_other_url} onChange={e => handleDataChange('cta_other_url', e.target.value)} onBlur={handleDataBlur('cta_other_url')} required error={errors.cta_other_url} /></div>}

          <div className={`pt-4 border-t border-slate-200/80 ${isCtaAreaDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <CtaAreaEditor cta_areas={data.cta_areas} handleCtaAreaChange={handleCtaAreaChange} handleCtaAreaBlur={handleCtaAreaBlur} removeCtaArea={removeCtaArea} addCtaArea={addCtaArea} isSimple={isSimple} error={isCtaAreaDisabled ? undefined : errors.cta_areas_input} />
          </div>
        </div>

        {/* Section 4: Conversions */}
        <div ref={renderRef('cv_primary_url_patterns_input')} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 border-l-4 border-blue-500 pl-3">4. コンバージョン設定</h2>

          {disableConversions && <div className="p-3 bg-blue-50 text-blue-700 rounded-md text-sm">瞬フォームで設定したサンクスページが自動的にメインコンバージョン地点になります。</div>}

          <div className={disableConversions ? 'opacity-50 pointer-events-none' : ''}>
            <RadioToggle label="メインコンバージョン" description="最も重要な成果（例：購入完了、本登録）" options={[{ label: 'しない', value: false }, { label: 'する', value: true }]} value={data.has_conversions} onChange={v => handleDataChange('has_conversions', v)}>
              <div className="space-y-4">
                <TextInput label="サンクスページURLに含まれるワード" description="複数ある場合は改行またはカンマ区切りで入力。例: /thanks, /complete" value={data.cv_primary_url_patterns_input} onChange={e => handleDataChange('cv_primary_url_patterns_input', e.target.value)} onBlur={handleDataBlur('cv_primary_url_patterns_input')} error={errors.cv_primary_url_patterns_input} />
                <TextInput label="または、GA4イベント名" description="複数ある場合は改行またはカンマ区切りで入力。例: purchase, sign_up" value={data.cv_primary_event_names_input} onChange={e => handleDataChange('cv_primary_event_names_input', e.target.value)} onBlur={handleDataBlur('cv_primary_event_names_input')} />
                <TextInput label="計測する値（任意）" description="例: 10000" type="number" value={data.cv_value_primary} onChange={e => handleDataChange('cv_value_primary', e.target.value)} onBlur={handleDataBlur('cv_value_primary')} />
              </div>
            </RadioToggle>
          </div>

          <RadioToggle label="マイクロコンバージョン" description="中間的な成果（例：カート追加、フォーム入力開始）" options={[{ label: 'しない', value: false }, { label: 'する', value: true }]} value={data.has_micro_conversions} onChange={v => handleDataChange('has_micro_conversions', v)}>
            <div className="space-y-4">
              <TextInput label="対象ページのURLに含まれるワード" description="複数ある場合は改行またはカンマ区切りで入力。" value={data.cv_micro_url_patterns_input} onChange={e => handleDataChange('cv_micro_url_patterns_input', e.target.value)} onBlur={handleDataBlur('cv_micro_url_patterns_input')} />
              <TextInput label="または、GA4イベント名" description="複数ある場合は改行またはカンマ区切りで入力。" value={data.cv_micro_event_names_input} onChange={e => handleDataChange('cv_micro_event_names_input', e.target.value)} onBlur={handleDataBlur('cv_micro_event_names_input')} />
              <TextInput label="計測する値（任意）" type="number" value={data.cv_value_micro} onChange={e => handleDataChange('cv_value_micro', e.target.value)} onBlur={handleDataBlur('cv_value_micro')} />
            </div>
          </RadioToggle>
        </div>

        {/* Section 5: Advanced features */}
        {isAdvanced && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 border-l-4 border-blue-500 pl-3 mb-4">5. 追加機能</h2>
            <HintBox title="コンテンツ挿入位置のケーススタディ">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800">ケース1: ファーストビューを動画や特別な画像にしたい</h4>
                  <p>例:挿入位置に「<code>0.5</code>」と入力し、動画や特別な画像URLを指定します。これにより、全ページの先頭にコンテンツが配置され、元々の1ページ目(<code>01.jpg</code>)は2ページ目になります。</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">ケース2: 特定の画像ペアの間にカスタムHTMLを挿入したい</h4>
                  <p>例えば、<code>03.jpg</code>と<code>04.jpg</code>の間に挿入するには、位置を「<code>3.5</code>」と指定します。</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">ケース3:特定の画像ペアの間に複数コンテンツを挿入したい</h4>
                  <p>例えば、<code>03.jpg</code>と<code>04.jpg</code>の間に動画を2つ挿入するには、位置を「<code>3.5</code>」と「<code>3.6</code>」指定して動画を追加していきます。</p>
                  <p>動画とiframeを挿入したい場合は、位置を「<code>3.5</code>」と指定して動画を追加、位置を「<code>3.6</code>」と指定してiframeを追加します。</p>
                </div>
                <p className="pt-3 mt-3 border-t border-blue-200">
                  <strong>重要:</strong> 挿入したコンテンツは、2. ページの設定「総枚数」にはカウントしないでください。コンテンツを追加した場合、「総枚数」に間違いがないかご確認ください。
                </p>
              </div>
            </HintBox>
            <ExtraFeatures
              data={data}
              handleDataChange={handleDataChange}
              handleDataBlur={handleDataBlur}
              handleHtmlInsertionChange={handleHtmlInsertionChange}
              handleHtmlInsertionBlur={handleHtmlInsertionBlur}
              addHtmlInsertion={addHtmlInsertion}
              removeHtmlInsertion={removeHtmlInsertion}
              handleVideoInsertionChange={handleVideoInsertionChange}
              handleVideoInsertionBlur={handleVideoInsertionBlur}
              addVideoInsertion={addVideoInsertion}
              removeVideoInsertion={removeVideoInsertion}
              handleIframeInsertionChange={handleIframeInsertionChange}
              handleIframeInsertionBlur={handleIframeInsertionBlur}
              addIframeInsertion={addIframeInsertion}
              removeIframeInsertion={removeIframeInsertion}
              handleHorizontalSlideChange={handleHorizontalSlideChange}
              handleHorizontalSlideBlur={handleHorizontalSlideBlur}
              addHorizontalSlide={addHorizontalSlide}
              removeHorizontalSlide={removeHorizontalSlide}
              mode={mode}
            />
          </div>
        )}
        {isFull && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 border-l-4 border-blue-500 pl-3">5. 追加機能</h2>
              </div>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <CustomRadio name="has_extra_features" value="false" checked={!data.has_extra_features} onChange={() => handleDataChange('has_extra_features', false)} label="しない" />
                <CustomRadio name="has_extra_features" value="true" checked={data.has_extra_features} onChange={() => handleDataChange('has_extra_features', true)} label="する" />
              </div>
            </div>
            {data.has_extra_features && (
              <div className="mt-6 pt-6 border-t border-slate-200/80">
                <HintBox title="コンテンツ挿入位置のケーススタディ">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-800">ケース1: ファーストビューを動画や特別な画像にしたい</h4>
                      <p>例:挿入位置に「<code>0.5</code>」と入力し、動画や特別な画像URLを指定します。これにより、全ページの先頭にコンテンツが配置され、元々の1ページ目(<code>01.jpg</code>)は2ページ目になります。</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">ケース2: 特定の画像ペアの間にカスタムHTMLを挿入したい</h4>
                      <p>例えば、<code>03.jpg</code>と<code>04.jpg</code>の間に挿入するには、位置を「<code>3.5</code>」と指定します。</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">ケース3:特定の画像ペアの間に複数コンテンツを挿入したい</h4>
                      <p>例えば、<code>03.jpg</code>と<code>04.jpg</code>の間に動画を2つ挿入するには、位置を「<code>3.5</code>」と「<code>3.6</code>」指定して動画を追加していきます。</p>
                      <p>動画とiframeを挿入したい場合は、位置を「<code>3.5</code>」と指定して動画を追加、位置を「<code>3.6</code>」と指定してiframeを追加します。</p>
                    </div>
                    <p className="pt-3 mt-3 border-t border-blue-200">
                      <strong>重要:</strong> 挿入したコンテンツは、2. ページの設定「総枚数」にはカウントしないでください。コンテンツを追加した場合、「総枚数」に間違いがないかご確認ください。
                    </p>
                  </div>
                </HintBox>
                <ExtraFeatures
                  data={data}
                  handleDataChange={handleDataChange}
                  handleDataBlur={handleDataBlur}
                  handleHtmlInsertionChange={handleHtmlInsertionChange}
                  handleHtmlInsertionBlur={handleHtmlInsertionBlur}
                  addHtmlInsertion={addHtmlInsertion}
                  removeHtmlInsertion={removeHtmlInsertion}
                  handleVideoInsertionChange={handleVideoInsertionChange}
                  handleVideoInsertionBlur={handleVideoInsertionBlur}
                  addVideoInsertion={addVideoInsertion}
                  removeVideoInsertion={removeVideoInsertion}
                  handleIframeInsertionChange={handleIframeInsertionChange}
                  handleIframeInsertionBlur={handleIframeInsertionBlur}
                  addIframeInsertion={addIframeInsertion}
                  removeIframeInsertion={removeIframeInsertion}
                  handleHorizontalSlideChange={handleHorizontalSlideChange}
                  handleHorizontalSlideBlur={handleHorizontalSlideBlur}
                  addHorizontalSlide={addHorizontalSlide}
                  removeHorizontalSlide={removeHorizontalSlide}
                  mode={mode}
                />
              </div>
            )}
          </div>
        )}

        {(isAdvanced || isFull) && contentOrderPreview.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 border-l-4 border-blue-500 pl-3 mb-4">コンテンツの表示順序</h2>
            <p className="text-sm text-slate-500 mb-4">設定された画像・動画と、挿入されたHTML・動画などを合わせた最終的なページの表示順です。</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 bg-slate-50 p-4 rounded-md">
              {contentOrderPreview.map((item, index) => (
                <li key={index} className="text-sm">
                  <span className="inline-block bg-slate-200 text-slate-700 text-xs font-semibold mr-2 px-2 py-0.5 rounded-full">{item.type}</span>
                  {item.description}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Section 6: AB Test */}
        {isFull && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 border-l-4 border-blue-500 pl-3">6. ABテスト</h2>
              </div>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <CustomRadio name="has_ab_test" value="false" checked={!data.has_ab_test} onChange={() => handleDataChange('has_ab_test', false)} label="しない" />
                <CustomRadio name="has_ab_test" value="true" checked={data.has_ab_test} onChange={() => handleDataChange('has_ab_test', true)} label="する" />
              </div>
            </div>
            {data.has_ab_test && (
              <div className="mt-6 pt-6 border-t border-slate-200/80">
                <AbTestEditor
                  data={data}
                  handleDataChange={handleDataChange}
                  handleDataBlur={handleDataBlur}
                  handleAbTestPageChange={handleAbTestPageChange}
                  handleAbTestPageBlur={handleAbTestPageBlur}
                  addAbTestPage={addAbTestPage}
                  removeAbTestPage={removeAbTestPage}
                />
              </div>
            )}
          </div>
        )}

        <RadioToggle
          label="SEO・SNS設定"
          description="検索エンジン最適化やSNSでシェアされた際の表示を設定します。"
          options={[{ label: 'しない', value: false }, { label: 'する', value: true }]}
          value={data.perform_seo_setup}
          onChange={v => handleDataChange('perform_seo_setup', v)}
        >
          <div className="space-y-4">
            <TextInput
              label="正規ページURL (canonical)"
              type="url"
              placeholder="https://example.com/lp"
              value={data.canonical_url}
              onChange={e => handleDataChange('canonical_url', e.target.value)}
              onBlur={handleDataBlur('canonical_url')}
              description="ページの正式なURLを指定します。重複コンテンツの評価を防ぎます。"
            />
            <TextareaInput
              label="サイト説明文 (meta description)"
              placeholder="このページは革新的な美容液を紹介するLPです..."
              value={data.meta_description}
              onChange={e => handleDataChange('meta_description', e.target.value)}
              onBlur={handleDataBlur('meta_description')}
              rows={2}
              description="検索結果やSNSで表示されるページの説明文です。120文字程度を推奨します。"
            />
            <TextInput
              label="SNSシェア時の画像URL (og:image)"
              type="url"
              placeholder="https://example.com/og-image.jpg"
              value={data.og_image_url}
              onChange={e => handleDataChange('og_image_url', e.target.value)}
              onBlur={handleDataBlur('og_image_url')}
              description="LINEやTwitterなどでシェアされた際に表示される画像のURLです。未入力の場合は1ページ目の画像が使用されます。"
            />
          </div>
        </RadioToggle>

        <div className="pt-6">
          <button onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors shadow-md hover:shadow-lg">
            ファイル生成
          </button>
        </div>
      </main>

      {generated && (
        <footer id="generation-result" className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">生成結果</h2>
          <div className="space-y-4">
            <ResultAccordion title="HTML" fileName="index.html" language="html" code={generated.html} />
            <ResultAccordion title="JSON" fileName="gtm-config.json" language="json" code={generated.json} />
          </div>
        </footer>
      )}

      {isTrialModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          aria-labelledby="trial-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4 text-center">
            <h2 id="trial-modal-title" className="text-xl font-bold text-slate-800">お試しいただきありがとうございます</h2>
            <p className="mt-4 text-slate-600">
              こちらは機能をお試しいただくためのデモ版です。<br />
              詳しくは11月14日（金）のセミナーにご参加ください。
            </p>
            <div className="mt-6 sm:mt-8">
              <button
                type="button"
                onClick={() => setIsTrialModalOpen(false)}
                className="w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
