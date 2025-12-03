import { InternalData } from '../types';
import { HTML_TEMPLATE, SWIPE_LP_JS, SLP_FORM_BRIDGE_JS } from '../constants';

const GTM_FULL_TEMPLATE = `{
  "exportFormatVersion": 2,
  "containerVersion": {
    "path": "accounts/0000000000/containers/0000000000/versions/0",
    "accountId": "0000000000",
    "containerId": "0000000000",
    "containerVersionId": "0",
    "name": "Swipe LP + Form (Light GA4 Router) – FULL",
    "description": "Lightweight GA4 router for Swipe LP & Form events. Maps all lp_* / floating_banner_* / exit_popup_* / legal_* / slp_form_* and catches all custom (no gtm.*). Includes full DLVs for form KPIs and CV params.",
    "container": {
      "path": "accounts/0000000000/containers/0000000000",
      "accountId": "0000000000",
      "containerId": "0000000000",
      "name": "Swipe LP Minimal",
      "publicId": "{{GTM_ID}}",
      "usageContext": ["WEB"],
      "fingerprint": "1725000000000",
      "tagManagerUrl": "https://tagmanager.google.com/"
    },
    "tag": [
      {
        "accountId": "0000000000",
        "containerId": "0000000000",
        "tagId": "1",
        "name": "Google Tag",
        "type": "googtag",
        "parameter": [
          { "type": "TEMPLATE", "key": "tagId", "value": "{{GA4_MEASUREMENT_ID}}" }
        ],
        "firingTriggerId": ["2"]
      },
      {
        "accountId": "0000000000",
        "containerId": "0000000000",
        "tagId": "3",
        "name": "GA4 Event – LP/Form Router",
        "type": "gaawe",
        "parameter": [
          { "type": "TEMPLATE", "key": "eventName", "value": "{{Event}}" },
          { "type": "TEMPLATE", "key": "measurementIdOverride", "value": "{{GA4_MEASUREMENT_ID}}" },
          {
            "type": "LIST",
            "key": "eventSettingsTable",
            "list": [
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"page_location" },        { "type":"TEMPLATE","key":"parameterValue","value":"{{Page URL}}" }] },

              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"session_variant" },       { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - session_variant}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"presence_test_variant" }, { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - presence_test_variant}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"creative_test_variant" }, { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - creative_test_variant}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"device_type" },           { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - device_type}}" }] },

              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"page_path" },             { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - page_path}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"prev_page_path" },        { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - prev_page_path}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"page_num_dom" },          { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - page_num_dom}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"original_page_num" },     { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - original_page_num}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"direction" },             { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - direction}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"navigation_method" },     { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - navigation_method}}" }] },

              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"stay_ms" },               { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - stay_ms}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"load_time_ms" },          { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - load_time_ms}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"max_page_reached" },      { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - max_page_reached}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"total_duration_ms" },     { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - total_duration_ms}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"total_pages" },           { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - total_pages}}" }] },

              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"link_url" },              { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - link_url}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"video_src" },             { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - video_src}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"scroll_pct" },            { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - scroll_pct}}" }] },

              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"click_x_rel" },           { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - click_x_rel}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"click_y_rel" },           { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - click_y_rel}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"elem_tag" },              { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - elem_tag}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"elem_id" },               { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - elem_id}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"elem_classes" },          { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - elem_classes}}" }] },

              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"utm_source" },            { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - utm_source}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"utm_medium" },            { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - utm_medium}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"utm_campaign" },          { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - utm_campaign}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"utm_content" },           { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - utm_content}}" }] },

              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"completion_rate" },       { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - completion_rate}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"ab_test_target" },        { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - ab_test_target}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"ab_test_type" },          { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - ab_test_type}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"ab_variant" },            { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - ab_variant}}" }] },

              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"cv_type" },               { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - cv_type}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"cv_value" },              { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - cv_value}}" }] },
              { "type":"MAP","map":[{ "type":"TEMPLATE","key":"parameter","value":"value" },                 { "type":"TEMPLATE","key":"parameterValue","value":"{{DLV - value}}" }] }
            ]
          }
        ],
        "firingTriggerId": ["4","5"]
      }
    ],
    "trigger": [
      {
        "accountId": "0000000000",
        "containerId": "0000000000",
        "triggerId": "2",
        "name": "Initialization - All Pages",
        "type": "PAGEVIEW"
      },
      {
        "accountId": "0000000000",
        "containerId": "0000000000",
        "triggerId": "4",
        "name": "Event - LP & Form (named)",
        "type": "CUSTOM_EVENT",
        "customEventFilter": [
          {
            "type": "MATCH_REGEX",
            "parameter": [
              { "type": "TEMPLATE", "key": "arg0", "value": "{{Event}}" },
              { "type": "TEMPLATE", "key": "arg1", "value": "^(lp_|floating_banner_|exit_popup_|legal_|slp_form_).*" }
            ]
          }
        ]
      },
      {
        "accountId": "0000000000",
        "containerId": "0000000000",
        "triggerId": "5",
        "name": "CE - All custom (no gtm., not named)",
        "type": "CUSTOM_EVENT",
        "customEventFilter": [
          {
            "type": "MATCH_REGEX",
            "parameter": [
              { "type": "TEMPLATE", "key": "arg0", "value": "{{Event}}" },
              { "type": "TEMPLATE", "key": "arg1", "value": "^gtm\\\\." },
            ],
            "negate": true
          },
          {
            "type": "MATCH_REGEX",
            "parameter": [
              { "type": "TEMPLATE", "key": "arg0", "value": "{{Event}}" },
              { "type": "TEMPLATE", "key": "arg1", "value": "^(lp_|floating_banner_|exit_popup_|legal_|slp_form_).*" }
            ],
            "negate": true
          }
        ]
      }
    ],
    "variable": [
      { "accountId":"0000000000","containerId":"0000000000","variableId":"1","name":"GA4_MEASUREMENT_ID","type":"c","parameter":[{ "type":"TEMPLATE","key":"value","value":"{{GA4_MEASUREMENT_ID}}" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"2","name":"DLV - session_variant","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"session_variant" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"3","name":"DLV - presence_test_variant","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"presence_test_variant" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"4","name":"DLV - creative_test_variant","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"creative_test_variant" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"5","name":"DLV - device_type","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"device_type" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"6","name":"DLV - page_path","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"page_path" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"7","name":"DLV - prev_page_path","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"prev_page_path" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"8","name":"DLV - page_num_dom","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"page_num_dom" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"9","name":"DLV - original_page_num","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"original_page_num" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"10","name":"DLV - direction","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"direction" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"11","name":"DLV - navigation_method","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"navigation_method" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"12","name":"DLV - stay_ms","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"stay_ms" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"13","name":"DLV - load_time_ms","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"load_time_ms" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"14","name":"DLV - max_page_reached","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"max_page_reached" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"15","name":"DLV - total_duration_ms","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"total_duration_ms" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"16","name":"DLV - total_pages","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"total_pages" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"17","name":"DLV - link_url","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"link_url" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"18","name":"DLV - video_src","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"video_src" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"19","name":"DLV - scroll_pct","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"scroll_pct" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"20","name":"DLV - click_x_rel","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"click_x_rel" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"21","name":"DLV - click_y_rel","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"click_y_rel" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"22","name":"DLV - elem_tag","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"elem_tag" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"23","name":"DLV - elem_id","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"elem_id" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"24","name":"DLV - elem_classes","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"elem_classes" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"25","name":"DLV - utm_source","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"utm_source" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"26","name":"DLV - utm_medium","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"utm_medium" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"27","name":"DLV - utm_campaign","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"utm_campaign" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"28","name":"DLV - utm_content","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"utm_content" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"29","name":"DLV - completion_rate","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"completion_rate" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"30","name":"DLV - ab_test_target","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"ab_test_target" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"31","name":"DLV - ab_test_type","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"ab_test_type" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"32","name":"DLV - ab_variant","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"ab_variant" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"42","name":"DLV - cv_type","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"cv_type" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"43","name":"DLV - cv_value","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"cv_value" }] },
      { "accountId":"0000000000","containerId":"0000000000","variableId":"44","name":"DLV - value","type":"v","parameter":[{ "type":"INTEGER","key":"dataLayerVersion","value":"2" },{ "type":"TEMPLATE","key":"name","value":"value" }] }
    ],
    "builtInVariable": [
      { "accountId": "0000000000", "containerId": "0000000000", "type": "PAGE_URL", "name": "Page URL" },
      { "accountId": "0000000000", "containerId": "0000000000", "type": "EVENT", "name": "Event" }
    ]
  }
}`;

// This file is a TypeScript adaptation of the provided convertToLpSettings.js v1.5 script.

const generateNonce = (): string => {
  try {
    if (globalThis.crypto?.getRandomValues) {
      const a = new Uint8Array(16);
      globalThis.crypto.getRandomValues(a);
      return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch { }
  return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
};

const convertToLpSettings = (internalData: InternalData) => {
  /* ---------- 1) Helpers ---------- */
  const safeString = (v: any): string => (v == null || String(v).trim() === 'なし') ? '' : String(v).trim();
  const safeUrl = (v: any): string => {
    const s = safeString(v);
    if (!s) return '';
    try {
      new URL(s);
      return s;
    } catch {
      return '';
    }
  };
  const toHalfWidthNumber = (s: any): string =>
    String(s).replace(/[０-９．]/g, (ch) => (ch === '．' ? '.' : String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)));
  const safeNumber = (v: any, def = 0): number => {
    const n = parseInt(toHalfWidthNumber(v), 10);
    return Number.isFinite(n) ? Math.max(0, n) : def;
  };
  const truthyYes = (v: any): boolean => {
    const s = String(v ?? '').trim().toLowerCase();
    return s === 'はい' || s === 'yes' || s === 'true' || s === '1' || s === 'on' || s === 'enabled';
  };
  const escapeForHtmlAttr = (s: string): string =>
    safeString(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;')
      .replace(/>/g, '&gt;');
  const escapeForInlineJs = (s: string): string => String(s).replace(/<\/script/gi, '<\\/script');
  const escapeRegex = (s: string): string => String(s).replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const splitList = (raw: any): string[] => safeString(raw).split(/[,\n、，\s]+/).map((s) => s.trim()).filter(Boolean);

  /* ---------- 2) Page Config ---------- */
  const firstUrlExt = (safeUrl(internalData.first_image_url) || '').split('.').pop()?.toLowerCase() || '';
  const firstType = ['mp4', 'webm', 'mov'].includes(firstUrlExt) ? 'video' : 'image';
  const firstImageUrl = firstType === 'image' ? safeUrl(internalData.first_image_url) : '';
  const firstVideoUrl = firstType === 'video' ? safeUrl(internalData.first_image_url) : '';

  let totalPages = safeNumber(internalData.last_page_num, 0);
  if (!Number.isFinite(totalPages) || totalPages < 1) totalPages = 1;

  /* ---------- 3) Floating Banner / Popup ---------- */
  // POPUP
  const popupEnabled = truthyYes(internalData.feature_popup) && !!safeUrl(internalData.popup_image_url);
  const popupImageUrl = safeUrl(internalData.popup_image_url);
  const popupImageAlt = internalData.popup_has_alt ? safeString(internalData.popup_image_alt) : '';
  const popupLinkUrl = internalData.popup_link_type === 'url' ? safeUrl(internalData.popup_link_url) : '';

  // FLOATING BANNER
  const fbImageUrl = safeUrl(internalData.floating_banner_image_url);
  let fbUseForm = false;
  let fbFormUrl = '';
  let fbOtherUrl = '';

  if (internalData.floating_banner_link_type === 'shun_form') {
    fbUseForm = true;
    fbFormUrl = safeUrl(internalData.floating_banner_shun_form_url);
  } else if (internalData.floating_banner_link_type === 'other') {
    fbOtherUrl = safeUrl(internalData.floating_banner_other_url);
  }

  const fbEnabled = truthyYes(internalData.feature_floating_banner) && !!fbImageUrl && (!!fbFormUrl || !!fbOtherUrl);
  const fbAlt = internalData.floating_banner_has_alt ? safeString(internalData.floating_banner_alt) : '';
  const fbHiddenPagesRaw = safeString(internalData.floating_banner_hidden_pages);

  /* ---------- 4) A/B Test ---------- */
  const abTestEnabled = internalData.has_ab_test;
  const abTestType = abTestEnabled ? internalData.ab_test_type : 'none';
  let abTestTarget: string | null = null;
  const abTestBUrls: any = {};
  let abTestFinalCtaPageNum: string | null = null;

  if (abTestEnabled) {
    if (abTestType === 'creative' && internalData.ab_creative_test_target !== 'none') {
      abTestTarget = internalData.ab_creative_test_target;
      switch (abTestTarget) {
        case 'firstView':
          if (internalData.ab_creative_fv_b_url) {
            if (internalData.ab_creative_fv_b_type === 'video') abTestBUrls.firstVideo = internalData.ab_creative_fv_b_url;
            else abTestBUrls.firstImage = internalData.ab_creative_fv_b_url;
            abTestBUrls.firstAlt = internalData.ab_creative_fv_b_alt;
          }
          break;
        case 'finalCta':
          if (internalData.ab_creative_finalcta_b_url) {
            abTestBUrls.finalCta = { url: internalData.ab_creative_finalcta_b_url, alt: internalData.ab_creative_finalcta_b_alt };
            abTestFinalCtaPageNum = safeString(internalData.ab_creative_finalcta_page_num);
          }
          break;
        case 'floatingBanner':
          if (internalData.ab_creative_banner_b_url) {
            abTestBUrls.floatingBanner = { url: internalData.ab_creative_banner_b_url, alt: internalData.ab_creative_banner_b_alt };
          }
          break;
        case 'popup':
          if (internalData.ab_creative_popup_b_url) {
            abTestBUrls.popup = { url: internalData.ab_creative_popup_b_url, alt: internalData.ab_creative_popup_b_alt };
          }
          break;
        case 'pages':
          const pageMap = internalData.ab_test_pages.reduce((acc, page) => {
            const pageNum = parseInt(page.pageNumberA, 10);
            if (Number.isFinite(pageNum) && page.imageUrlB) {
              acc[pageNum] = { url: page.imageUrlB, alt: page.altTextB };
            }
            return acc;
          }, {} as any);
          if (Object.keys(pageMap).length > 0) {
            abTestBUrls.pages = { map: pageMap };
          }
          break;
      }
    } else if (abTestType === 'presence' && internalData.ab_presence_test_target !== 'none') {
      abTestTarget = internalData.ab_presence_test_target;
    }
  }


  /* ---------- 5) CV Config ---------- */
  const normalizeUrlPatterns = (raw: string) => splitList(raw).map(it => /^(正規表現:|regex:)/i.test(it) ? it.replace(/^(正規表現:|regex:)/i, '').trim() : `(?i)${escapeRegex(it)}`);
  const normalizeEventNames = (raw: string) => splitList(raw);

  const cvConfig = {
    primary: {
      urlRegexes: normalizeUrlPatterns(internalData.cv_primary_url_patterns_input),
      eventNames: normalizeEventNames(internalData.cv_primary_event_names_input),
      value: Number.isFinite(Number(internalData.cv_value_primary)) ? Number(internalData.cv_value_primary) : null,
    },
    micro: {
      urlRegexes: normalizeUrlPatterns(internalData.cv_micro_url_patterns_input),
      eventNames: normalizeEventNames(internalData.cv_micro_event_names_input),
      value: Number.isFinite(Number(internalData.cv_value_micro)) ? Number(internalData.cv_value_micro) : null,
    },
  };

  /* ---------- 6) CTA Parsing ---------- */
  const toHalfWidthNumForCta = (s: string): string => {
    if (!s) return '';
    return String(s)
      .replace(/[０-９．]/g, (ch) => (ch === '．' ? '.' : String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)))
      .replace(/％|%/g, '%')
      .replace(/　/g, ' ')
      .replace(/[ｘ×Ｘ＊*]/g, 'x') // Handles full-width x, multiplication signs, asterisk
      .replace(/px|PX/gi, '') // Case-insensitive removal of px
      .trim();
  };

  const parseSizeWH = (s: string) => {
    const cleaned = toHalfWidthNumForCta(s);
    // Match only strings that are strictly in "Number x Number" format.
    const m = cleaned.match(/^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)$/);
    return m ? { w: parseFloat(m[1]), h: parseFloat(m[2]) } : null;
  };

  const parseLen = (s: string, base: number) => {
    const t = toHalfWidthNumForCta(s).trim();
    if (t.endsWith('%')) return base * (parseFloat(t) / 100);
    const m = t.match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
  };

  const parsePositionExpr = (expr: string, imgW: number, imgH: number, areaW: number, areaH: number) => {
    const s = toHalfWidthNumForCta(expr).replace(/\s|-|・/g, ''); // ・も除去
    // 横
    let leftPx;
    if (/左/.test(s)) leftPx = parseLen(s.replace(/.*左(?:から)?/, '') || '0', imgW);
    else if (/右/.test(s)) leftPx = imgW - areaW - parseLen(s.replace(/.*右(?:から)?/, '') || '0', imgW);
    else /* 中央 */ leftPx = (imgW - areaW) / 2;
    // 縦
    let topPx;
    if (/上/.test(s)) topPx = parseLen(s.replace(/.*上(?:端|から)?/, '') || '0', imgH);
    else if (/下/.test(s)) topPx = imgH - areaH - parseLen(s.replace(/.*下(?:端|から)?/, '') || '0', imgH);
    else /* 中央 */ topPx = (imgH - areaH) / 2;

    leftPx = Math.max(0, Math.min(leftPx, imgW - areaW));
    topPx = Math.max(0, Math.min(topPx, imgH - areaH));
    return { leftPx, topPx };
  };

  const ctaAreasMap: { [key: string]: { left: number, top: number, width: number, height: number }[] } = {};
  if (internalData.cta_link_type !== 'none' && internalData.cta_areas) {
    internalData.cta_areas.forEach(area => {
      const targetNumRaw = (area.targetImage || '').replace(/\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/i, '');
      const targetNum = parseFloat(toHalfWidthNumber(targetNumRaw));

      if (!Number.isFinite(targetNum)) return;

      const key = String(targetNum);
      if (!ctaAreasMap[key]) {
        ctaAreasMap[key] = [];
      }

      const imgSize = parseSizeWH(area.imageSize);
      const areaSize = parseSizeWH(area.areaSize);
      const hasPosition = area.areaPosition && area.areaPosition.trim() !== '';

      // Strict check for partial CTA: all size and position info must be valid.
      if (imgSize && areaSize && hasPosition) {
        const W = imgSize.w, H = imgSize.h;
        const Aw = Math.min(areaSize.w, W), Ah = Math.min(areaSize.h, H);
        const { leftPx, topPx } = parsePositionExpr(area.areaPosition, W, H, Aw, Ah);
        const rect = {
          left: +((leftPx / W) * 100).toFixed(4),
          top: +((topPx / H) * 100).toFixed(4),
          width: +((Aw / W) * 100).toFixed(4),
          height: +((Ah / H) * 100).toFixed(4),
        };
        ctaAreasMap[key].push(rect);
      }
      // Strict check for full-image CTA: only targetImage should be present.
      else if (area.targetImage && !area.imageSize && !area.areaSize && !area.areaPosition) {
        if (!ctaAreasMap[key].some(r => r.width === 100 && r.height === 100)) {
          ctaAreasMap[key].push({ left: 0, top: 0, width: 100, height: 100 });
        }
      }
      // Any other combination is considered a configuration error and is ignored.
    });
  }

  /* ---------- 7) Insertions ---------- */
  const htmlInsertions: { [key: string]: string } = {};
  if (internalData.feature_html_insert) {
    internalData.html_insertions.forEach(ins => {
      const pos = safeString(ins.position);
      const content = safeString(ins.content);
      if (pos && content) {
        htmlInsertions[toHalfWidthNumber(pos)] = content;
      }
    });
  }
  if (internalData.feature_video_insert) {
    internalData.video_insertions.forEach(ins => {
      const pos = safeString(ins.position);
      const url = safeUrl(ins.url);
      if (pos && url) {
        htmlInsertions[toHalfWidthNumber(pos)] = `video: ${url}`;
      }
    });
  }
  if (internalData.feature_iframe_insert) {
    internalData.iframe_insertions.forEach(ins => {
      const pos = safeString(ins.position);
      const url = safeUrl(ins.url);
      if (pos && url) {
        htmlInsertions[toHalfWidthNumber(pos)] = `iframe: ${url}`;
      }
    });
  }

  /* ---------- 8) CTA links ---------- */
  const ctaUseForm = internalData.cta_link_type === 'shun_form';
  const ctaFormUrl = ctaUseForm ? safeUrl(internalData.cta_shun_form_url) : '';
  const finalCtaUrl = internalData.cta_link_type === 'other' ? safeUrl(internalData.cta_other_url) : '';

  /* ---------- 8.5) Horizontal Slides ---------- */
  const horizontalSlides: { [key: string]: string[] } = {};
  if (internalData.feature_horizontal_slides) {
    internalData.horizontal_slides.forEach(slide => {
      const pageNum = toHalfWidthNumber(slide.targetPage);
      const images = splitList(slide.slides).map(s => safeUrl(s)).filter(Boolean);
      if (pageNum && images.length > 0) {
        horizontalSlides[pageNum] = images;
      }
    });
  }

  /* ---------- 9) allowedOrigins ---------- */
  const origins = new Set(splitList(internalData.allowed_domains_input).map(s => { try { return new URL(/^https?:\/\//i.test(s) ? s : 'https://' + s).origin; } catch { return ''; } }).filter(Boolean));
  if (ctaFormUrl) origins.add(new URL(ctaFormUrl).origin);
  if (fbFormUrl) origins.add(new URL(fbFormUrl).origin);

  /* ---------- 10) ctaPagesInput (for whole page CTA) ---------- */
  const ctaPagesInput = internalData.cta_areas
    .map(area => (area.targetImage || '').replace(/\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/i, ''))
    .filter(Boolean)
    .join(',');

  /* ---------- 11) lpSettings Object ---------- */
  const lpSettings: any = {
    lpTitle: safeString(internalData.lp_title) || 'スワイプLP',
    gtmId: safeString(internalData.gtm_id),
    ga4MeasurementId: safeString(internalData.ga4_id),
    firstPageContentType: firstType,
    firstImageUrl,
    firstImageAlt: safeString(internalData.first_image_alt),
    firstVideoUrl,
    lastPageNum: totalPages,
    fallbackImageUrl: safeUrl(internalData.fallback_image_url),
    companyInfoUrl: safeUrl(internalData.company_info_url),
    privacyPolicyUrl: safeUrl(internalData.privacy_policy_url),
    sctLawUrl: safeUrl(internalData.sct_law_url),
    ctaUrl: finalCtaUrl,
    ctaPagesInput,
    ctaAreas: ctaAreasMap,
    htmlInsertions,
    floatingBannerEnabled: fbEnabled,
    floatingBannerLinkUrl: fbOtherUrl,
    floatingBannerImageUrl: fbImageUrl,
    floatingBannerImageAlt: fbAlt,
    hiddenBannerPages: splitList(fbHiddenPagesRaw),
    popupEnabled: popupEnabled,
    popupImageUrl: popupImageUrl,
    popupImageAlt: popupImageAlt,
    popupLinkUrl: popupLinkUrl,
    abTestEnabled,
    abTestType,
    abTestTarget,
    abTestBUrls,
    abTestFinalCtaPageNum,
    imageAlt: safeString(internalData.image_alt),
    posterDelayEnabled: internalData.poster_delay_enabled,
    cvConfig,
    customFormUrl: '',
    formModalOpenFrom: { cta: false, floatingBanner: false },
    cvSuppressedByForm: false,
    allowedOrigins: Array.from(origins),
    enableHorizontalSwipe: truthyYes(internalData.enable_horizontal_swipe),
    horizontalSlides,
  };

  if (ctaUseForm) {
    lpSettings.customFormUrl = ctaFormUrl;
    lpSettings.formModalOpenFrom.cta = true;
    lpSettings.cvSuppressedByForm = true;
    lpSettings.cvConfig.primary = { urlRegexes: [], eventNames: [], value: null };
  }
  if (fbUseForm) {
    lpSettings.customFormUrl = lpSettings.customFormUrl || fbFormUrl;
    lpSettings.formModalOpenFrom.floatingBanner = true;
    lpSettings.cvSuppressedByForm = true;
    lpSettings.cvConfig.primary = { urlRegexes: [], eventNames: [], value: null };
  }

  const finalInlineScript = escapeForInlineJs(`window.lpSettings = ${JSON.stringify(lpSettings, null, 2)};`);

  /* ---------- 12) SEO Meta ---------- */
  let seoMetaTags = '';
  if (internalData.perform_seo_setup) {
    const metaDesc = safeString(internalData.meta_description);
    const canonical = safeUrl(internalData.canonical_url);
    const ogimg = safeUrl(internalData.og_image_url) || lpSettings.firstImageUrl || safeUrl(internalData.fallback_image_url);
    if (metaDesc) seoMetaTags += `  <meta name="description" content="${escapeForHtmlAttr(metaDesc)}">\\n`;
    if (canonical) seoMetaTags += `  <link rel="canonical" href="${canonical}">\\n`;
    seoMetaTags += `  <meta property="og:type" content="website">\\n`;
    seoMetaTags += `  <meta property="og:title" content="${escapeForHtmlAttr(lpSettings.lpTitle)}">\\n`;
    if (metaDesc) seoMetaTags += `  <meta property="og:description" content="${escapeForHtmlAttr(metaDesc)}"> \\n`;
    if (canonical) seoMetaTags += `  <meta property="og:url" content="${canonical}">\\n`;
    if (ogimg) seoMetaTags += `  <meta property="og:image" content="${ogimg}">\\n`;
  }

  const needsFormModal = ctaUseForm || fbUseForm;

  /* ---------- 13) GTM JSON ---------- */
  const gtmConfigJson = GTM_FULL_TEMPLATE
    .replace(/{{GTM_ID}}/g, safeString(internalData.gtm_id))
    .replace(/{{GA4_MEASUREMENT_ID}}/g, safeString(internalData.ga4_id));

  return { lpTitle: lpSettings.lpTitle, seoMetaTags, finalInlineScript, gtmConfigJson, gtmId: safeString(internalData.gtm_id), needsFormModal };
};

export const generateFiles = (internalData: InternalData, customCss: string): { html: string; json: string } => {
  const { lpTitle, seoMetaTags, finalInlineScript, gtmConfigJson, gtmId, needsFormModal } = convertToLpSettings(internalData);

  let html = HTML_TEMPLATE
    .replace(/{{lpTitle}}/g, lpTitle)
    .replace('{{seoMetaTags}}', seoMetaTags)
    .replace(/{{gtmId}}/g, gtmId)
    .replace('{{finalInlineScript}}', finalInlineScript)
    .replace('{{swipeLpCss}}', customCss)
    .replace('{{swipeLpJs}}', SWIPE_LP_JS)
    .replace('{{slpFormBridgeJs}}', SLP_FORM_BRIDGE_JS);

  if (!needsFormModal) {
    html = html.replace(/<!-- START_FORM_MODAL -->[\s\S]*?<!-- END_FORM_MODAL -->/, '');
  }

  return { html, json: gtmConfigJson };
};
