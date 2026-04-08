/* ========================================
   상세페이지 생성 엔진
   - 입력 데이터를 받아 완성된 HTML 조립
   ======================================== */

const Generator = {
  /**
   * 전체 상세페이지 HTML 생성
   * @param {Object} data - 폼에서 수집한 데이터
   * @param {Object} options - 디자인 옵션
   * @returns {string} 완성된 HTML 문자열
   */
  generate(data, options) {
    const sections = [];

    // 히어로 배너
    if (options.incHero) {
      sections.push(Templates.hero(data));
    }

    // 셀링포인트
    if (options.incSelling && data.sellingPoints.length > 0) {
      sections.push(Templates.sellingPoints(data));
    }

    // 상세 특징
    if (options.incFeatures && data.features.length > 0) {
      sections.push(Templates.features(data));
    }

    // 제품 사양
    if (options.incSpecs && data.specs.length > 0) {
      sections.push(Templates.specs(data));
    }

    // 고객 리뷰
    if (options.incReviews && data.reviews.length > 0) {
      sections.push(Templates.reviews(data));
    }

    // 브랜드 스토리
    if (options.incBrand && (data.brandName || data.brandStory)) {
      sections.push(Templates.brand(data));
    }

    // CTA
    if (options.incCta) {
      sections.push(Templates.cta(data));
    }

    return sections.join('\n');
  },

  /**
   * 독립 실행 가능한 전체 HTML 파일 생성 (내보내기용)
   */
  generateStandalone(data, options) {
    const pageWidth = options.pageWidth || 780;
    const themeClass = `theme-${options.colorTheme || 'cool'}`;
    const layoutClass = `layout-${options.layoutStyle || 'modern'}`;
    const content = this.generate(data, options);

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.productName} - 상세페이지</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    ${this.getEmbeddedCSS()}
  </style>
</head>
<body>
  <div class="generated-page ${themeClass} ${layoutClass}" style="max-width:${pageWidth}px;margin:0 auto;">
    ${content}
  </div>
</body>
</html>`;
  },

  /**
   * 내보내기용 임베디드 CSS
   */
  getEmbeddedCSS() {
    return `
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif; color:#1d1d1f; line-height:1.6; -webkit-font-smoothing:antialiased; background:#fff; }

.dp-image-placeholder { background:#f0f0f5; border:2px dashed #c5c5d0; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#8888a0; position:relative; overflow:hidden; }
.dp-image-placeholder::before { content:''; position:absolute; inset:0; background:linear-gradient(45deg,transparent 48%,#dddde5 48%,#dddde5 52%,transparent 52%),linear-gradient(-45deg,transparent 48%,#dddde5 48%,#dddde5 52%,transparent 52%); background-size:30px 30px; opacity:0.3; }
.dp-image-placeholder .placeholder-content { position:relative; z-index:1; text-align:center; padding:20px; }
.dp-image-placeholder .placeholder-icon { width:48px; height:48px; margin-bottom:12px; opacity:0.5; }
.dp-image-placeholder .placeholder-label { font-size:14px; font-weight:700; color:#6666a0; margin-bottom:4px; }
.dp-image-placeholder .placeholder-desc { font-size:12px; color:#9999b0; max-width:280px; }
.dp-image-placeholder .placeholder-size { font-size:11px; color:#aaaabc; margin-top:8px; padding:2px 10px; background:rgba(255,255,255,0.7); border-radius:10px; }

.dp-hero { position:relative; text-align:center; }
.dp-hero .dp-image-placeholder { width:100%; min-height:500px; }
.dp-hero-overlay { position:absolute; bottom:0; left:0; right:0; padding:60px 40px 40px; background:linear-gradient(transparent,rgba(0,0,0,0.7)); color:white; text-align:left; }
.dp-hero-category { font-size:13px; font-weight:600; letter-spacing:2px; text-transform:uppercase; opacity:0.8; margin-bottom:8px; }
.dp-hero-title { font-size:36px; font-weight:800; line-height:1.3; margin-bottom:12px; }
.dp-hero-subtitle { font-size:18px; font-weight:300; opacity:0.9; line-height:1.5; }
.dp-hero-price { margin-top:20px; font-size:24px; font-weight:700; }

.dp-selling-section { padding:60px 40px; text-align:center; }
.dp-section-title { font-size:28px; font-weight:800; margin-bottom:12px; line-height:1.3; }
.dp-section-subtitle { font-size:15px; color:#666; margin-bottom:48px; }
.dp-selling-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:32px; max-width:800px; margin:0 auto; }
.dp-selling-item { text-align:center; padding:24px 16px; }
.dp-selling-icon { width:64px; height:64px; margin:0 auto 16px; background:var(--dp-primary-light,#eff6ff); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:28px; }
.dp-selling-item h3 { font-size:17px; font-weight:700; margin-bottom:8px; }
.dp-selling-item p { font-size:14px; color:#666; line-height:1.5; }

.dp-feature-section { padding:0; }
.dp-feature-block { display:grid; grid-template-columns:1fr 1fr; min-height:450px; }
.dp-feature-block.reverse .dp-feature-image { order:2; }
.dp-feature-block.reverse .dp-feature-text { order:1; }
.dp-feature-image { position:relative; }
.dp-feature-image .dp-image-placeholder { width:100%; height:100%; min-height:450px; }
.dp-feature-text { display:flex; flex-direction:column; justify-content:center; padding:48px; }
.dp-feature-text.bg-light { background:#fafafa; }
.dp-feature-text.bg-dark { background:#1a1a2e; color:white; }
.dp-feature-text.bg-dark p { color:rgba(255,255,255,0.7); }
.dp-feature-text.bg-gradient { background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:white; }
.dp-feature-text.bg-gradient p { color:rgba(255,255,255,0.8); }
.dp-feature-text.bg-color { background:var(--dp-primary-light,#eff6ff); }
.dp-feature-label { font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--dp-primary,#2563eb); margin-bottom:12px; }
.dp-feature-text.bg-dark .dp-feature-label, .dp-feature-text.bg-gradient .dp-feature-label { color:rgba(255,255,255,0.6); }
.dp-feature-title { font-size:28px; font-weight:800; line-height:1.3; margin-bottom:16px; }
.dp-feature-desc { font-size:15px; line-height:1.8; color:#555; }

.dp-spec-section { padding:60px 40px; background:#fafafa; }
.dp-spec-table { width:100%; border-collapse:collapse; margin-top:32px; }
.dp-spec-table tr { border-bottom:1px solid #eee; }
.dp-spec-table td { padding:16px 20px; font-size:14px; }
.dp-spec-table td:first-child { font-weight:600; color:#333; width:35%; background:#f5f5f7; }
.dp-spec-table td:last-child { color:#555; }

.dp-review-section { padding:60px 40px; }
.dp-review-grid { display:grid; gap:20px; margin-top:32px; }
.dp-review-card { background:#f9f9fb; border-radius:12px; padding:24px; border:1px solid #eee; }
.dp-review-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.dp-review-author { font-weight:700; font-size:15px; }
.dp-review-stars { color:#f59e0b; font-size:16px; letter-spacing:2px; }
.dp-review-text { font-size:14px; line-height:1.7; color:#555; }

.dp-brand-section { padding:60px 40px; text-align:center; background:#f5f5f7; }
.dp-brand-section .dp-image-placeholder { width:120px; height:120px; border-radius:50%; margin:0 auto 24px; }
.dp-brand-name { font-size:22px; font-weight:800; margin-bottom:12px; }
.dp-brand-story { font-size:15px; line-height:1.8; color:#666; max-width:600px; margin:0 auto; }

.dp-cta-section { padding:60px 40px; text-align:center; background:linear-gradient(135deg,var(--dp-primary,#2563eb),var(--dp-primary-dark,#1d4ed8)); color:white; }
.dp-cta-title { font-size:28px; font-weight:800; margin-bottom:12px; }
.dp-cta-subtitle { font-size:16px; opacity:0.85; margin-bottom:32px; }
.dp-cta-price { font-size:36px; font-weight:800; margin-bottom:24px; }
.dp-cta-button { display:inline-block; background:white; color:var(--dp-primary,#2563eb); padding:16px 48px; border-radius:50px; font-size:17px; font-weight:700; text-decoration:none; box-shadow:0 4px 20px rgba(0,0,0,0.2); }
.dp-divider { height:1px; background:linear-gradient(to right,transparent,#ddd,transparent); }

.theme-minimal { --dp-primary:#1d1d1f; --dp-primary-dark:#000; --dp-primary-light:#f5f5f7; }
.theme-warm { --dp-primary:#b45309; --dp-primary-dark:#92400e; --dp-primary-light:#fef3c7; }
.theme-cool { --dp-primary:#2563eb; --dp-primary-dark:#1d4ed8; --dp-primary-light:#eff6ff; }
.theme-luxury { --dp-primary:#b8860b; --dp-primary-dark:#996600; --dp-primary-light:#fdf6e3; }
.theme-natural { --dp-primary:#16a34a; --dp-primary-dark:#15803d; --dp-primary-light:#f0fdf4; }
.theme-vivid { --dp-primary:#e11d48; --dp-primary-dark:#be123c; --dp-primary-light:#fff1f2; }

.layout-modern .dp-hero-title { font-weight:700; letter-spacing:-0.5px; }
.layout-magazine .dp-hero-title { font-weight:900; font-size:40px; }
.layout-magazine .dp-section-title { font-weight:900; }
.layout-bold .dp-hero-title { font-size:44px; font-weight:900; text-transform:uppercase; }
.layout-bold .dp-section-title { font-size:32px; font-weight:900; }
.layout-bold .dp-feature-title { font-size:32px; }
    `;
  }
};
