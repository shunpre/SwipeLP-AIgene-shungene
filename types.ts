

export enum LpMode {
  NONE = 'none',
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
  FULL_CUSTOM = 'full_custom',
}

export interface CtaArea {
  id: string;
  targetImage: string;
  imageSize: string;
  areaSize: string;
  areaPosition: string;
}

export interface AbTestPage {
  id: string;
  pageNumberA: string;
  imageUrlB: string;
  altTextB: string;
}

export interface HtmlInsertion {
  id: string;
  position: string;
  content: string;
}

export interface VideoInsertion {
  id: string;
  position: string;
  url: string;
}

export interface IframeInsertion {
  id: string;
  position: string;
  url: string;
}

export interface HorizontalSlide {
  id: string;
  targetPage: string;
  slides: string; // Newline separated URLs
}

export interface InternalData {
  lp_title: string;
  gtm_id: string;
  ga4_id: string;
  perform_seo_setup: boolean;
  canonical_url: string;
  meta_description: string;
  og_image_url: string;
  first_page_content_type: string;
  first_image_url: string;
  first_image_alt: string;
  first_video_url: string;
  poster_delay_enabled: boolean;
  last_page_num: string;
  video_image_count: string;
  selected_features_input: string;
  company_info_url: string;
  privacy_policy_url: string;
  sct_law_url: string;
  allowed_domains_input: string;
  cta_url: string; // Legacy, but keep for structure
  cta_areas_input: string;
  cta_areas: CtaArea[];
  hidden_banner_pages_input: string; // Legacy, keep
  fallback_image_url: string;
  image_alt: string;
  cv_primary_url_patterns_input: string;
  cv_primary_event_names_input: string;
  cv_value_primary: string;
  cv_micro_url_patterns_input: string;
  cv_micro_event_names_input: string;
  cv_value_micro: string;

  // UI-specific state
  has_gtm_ga4: boolean;
  has_extra_features: boolean;
  has_ab_test: boolean;
  has_cta: boolean;
  has_conversions: boolean;
  has_micro_conversions: boolean;
  has_alt_text: boolean;
  has_fallback_image: boolean;

  // Extra features toggles
  feature_html_insert: boolean;
  html_insertions: HtmlInsertion[];
  feature_video_insert: boolean;
  video_insertions: VideoInsertion[];
  feature_iframe_insert: boolean;
  iframe_insertions: IframeInsertion[];
  feature_horizontal_slides: boolean;
  horizontal_slides: HorizontalSlide[];
  feature_popup: boolean;
  feature_floating_banner: boolean;
  enable_horizontal_swipe: boolean;

  // Popup structured state
  popup_image_url: string;
  popup_has_alt: boolean;
  popup_image_alt: string;
  popup_link_type: 'return' | 'url';
  popup_link_url: string;

  // Floating Banner structured state
  floating_banner_link_type: 'none' | 'shun_form' | 'other';
  floating_banner_shun_form_url: string;
  floating_banner_other_url: string;
  floating_banner_image_url: string;
  floating_banner_has_alt: boolean;
  floating_banner_alt: string;
  floating_banner_hidden_pages: string;

  // A/B test structured state
  ab_test_type: 'none' | 'creative' | 'presence';
  ab_creative_test_target: 'none' | 'firstView' | 'finalCta' | 'floatingBanner' | 'popup' | 'pages';
  ab_creative_fv_b_type: 'image' | 'video';
  ab_creative_fv_b_url: string;
  ab_creative_fv_b_alt: string;
  ab_creative_finalcta_b_url: string;
  ab_creative_finalcta_b_alt: string;
  ab_creative_finalcta_page_num: string;
  ab_creative_banner_b_url: string;
  ab_creative_banner_b_alt: string;
  ab_creative_popup_b_url: string;
  ab_creative_popup_b_alt: string;
  ab_test_pages: AbTestPage[];
  ab_presence_test_target: 'none' | 'popup' | 'floatingBanner';

  cta_link_type: 'none' | 'shun_form' | 'other' | 'floating_banner';
  cta_shun_form_url: string;
  cta_other_url: string;
}