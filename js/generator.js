/* ========================================
   상세페이지 생성 엔진
   JSON 기획서 → 완성된 상세페이지 HTML
   ======================================== */

const Generator = {

  /**
   * 섹션 name → 템플릿 함수 매핑
   */
  sectionMap: {
    'hero_cover': 'hero_cover',
    'problem_section': 'problem_section',
    'solution_section': 'solution_section',
    'benefit_storage': 'benefit',
    'benefit_portable': 'benefit',
    'benefit_fast': 'benefit',
    'benefit_field': 'benefit',
    'target_users': 'target_users',
    'comparison_table': 'comparison_table',
    'product_detail': 'product_detail',
    'usage_flow': 'usage_flow',
    'trust_section': 'trust_section',
    'faq': 'faq',
    'experience_message': 'experience_message',
    'final_cta': 'final_cta'
  },

  /**
   * 전체 상세페이지 생성
   */
  generate(planData, options) {
    const sections = planData.sections || [];
    const ctx = this.buildContext(planData, options);

    let benefitIndex = 0;
    const htmlParts = sections.map(section => {
      const templateName = this.sectionMap[section.name];

      if (!templateName) {
        return Templates.generic(section, ctx);
      }

      if (templateName === 'benefit') {
        return Templates.benefit(section, ctx, benefitIndex++);
      }

      if (typeof Templates[templateName] === 'function') {
        return Templates[templateName](section, ctx);
      }

      return Templates.generic(section, ctx);
    });

    return htmlParts.join('\n');
  },

  /**
   * 컨텍스트 객체 생성 (각 템플릿에 전달)
   */
  buildContext(planData, options) {
    return {
      productName: planData.product?.name || '',
      brandName: planData.product?.brand || '',
      productType: planData.product?.type || '',
      concept: planData.product?.concept || '',
      visualDirection: planData.visualDirection || {},
      brandSystem: planData.brandSystem || {},
      pageGoal: planData.pageGoal || {},
      fileNames: planData.fileNamingGuide || [],
      guideLevel: options?.imageGuideLevel || 'full',
      pageWidth: options?.pageWidth || 780
    };
  },

  /**
   * 비주얼 디렉션 → CSS 변수 변환
   */
  getThemeCSS(planData) {
    const vd = planData.visualDirection || {};
    const bgUsage = vd.backgroundUsage || {};

    // 히어로 배경색 추출
    let heroBg = '#111827';
    const heroBgText = (bgUsage.hero || '').toLowerCase();
    if (heroBgText.includes('네이비')) heroBg = '#0f172a';
    else if (heroBgText.includes('블랙')) heroBg = '#111111';
    else if (heroBgText.includes('화이트')) heroBg = '#ffffff';

    // 베네핏 배경
    let benefitBg = '#f9fafb';
    const benefitBgText = (bgUsage.benefit || '').toLowerCase();
    if (benefitBgText.includes('화이트')) benefitBg = '#ffffff';
    else if (benefitBgText.includes('라이트') || benefitBgText.includes('그레이')) benefitBg = '#f3f4f6';

    // CTA 배경
    let ctaBg = '#f8fafc';
    const ctaBgText = (bgUsage.cta || '').toLowerCase();
    if (ctaBgText.includes('밝은')) ctaBg = '#f0f9ff';

    return `
      --dp-hero-bg: ${heroBg};
      --dp-benefit-bg: ${benefitBg};
      --dp-cta-bg: ${ctaBg};
      --dp-accent: #2563eb;
      --dp-text: #1f2937;
      --dp-text-light: #6b7280;
    `;
  },

  /**
   * 독립 실행 HTML 파일 생성 (내보내기용)
   */
  generateStandalone(planData, options) {
    const content = this.generate(planData, options);
    const themeCSS = this.getThemeCSS(planData);
    const pageWidth = options?.pageWidth || 780;
    const productName = planData.product?.name || '상세페이지';

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productName} - 상세페이지</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>${this.getEmbeddedCSS()}</style>
</head>
<body>
  <div class="generated-page" style="max-width:${pageWidth}px;margin:0 auto;${themeCSS}">
    ${content}
  </div>
</body>
</html>`;
  },

  /**
   * 촬영 가이드 문서 생성
   */
  generateImageGuide(planData) {
    const sections = planData.sections || [];
    const fileNames = planData.fileNamingGuide || [];
    const checklist = planData.image_asset_checklist || [];
    const prompts = planData.image_generation_prompt_examples || [];

    let md = `# ${planData.product?.name || '상품'} 상세페이지 촬영 가이드\n\n`;
    md += `## 전체 비주얼 방향\n`;
    md += `- 무드: ${planData.visualDirection?.overallMood || '-'}\n`;
    md += `- 촬영 스타일: ${(planData.visualDirection?.photoStyle || []).join(', ')}\n`;
    md += `- 라이팅: ${(planData.visualDirection?.lighting || []).join(' / ')}\n\n`;

    md += `## 섹션별 이미지 가이드\n\n`;
    sections.forEach((s, i) => {
      if (!s.imageConcept) return;
      md += `### ${s.moduleId} - ${s.name}\n`;
      md += `- **파일명**: ${fileNames[i] || '-'}\n`;
      md += `- **요약**: ${s.imageConcept.summary}\n`;
      md += `- **상세 가이드**: ${s.imageConcept.detailedDescription}\n\n`;
    });

    if (checklist.length) {
      md += `## 필수 촬영 에셋 체크리스트\n`;
      checklist.forEach(c => { md += `- [ ] ${c}\n`; });
      md += '\n';
    }

    if (prompts.length) {
      md += `## AI 이미지 생성 프롬프트 예시\n`;
      prompts.forEach((p, i) => { md += `${i + 1}. ${p}\n`; });
    }

    return md;
  },

  /**
   * 내보내기용 CSS (독립 실행 HTML에 포함)
   */
  getEmbeddedCSS() {
    return `
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif; color:var(--dp-text,#1f2937); line-height:1.6; -webkit-font-smoothing:antialiased; background:#fff; }
.generated-page { overflow:hidden; }

/* 이미지 플레이스홀더 */
.dp-image-placeholder { background:#f0f0f5; border:2px dashed #c5c5d0; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
.dp-image-placeholder::before { content:''; position:absolute; inset:0; background:linear-gradient(45deg,transparent 48%,#dddde5 48%,#dddde5 52%,transparent 52%),linear-gradient(-45deg,transparent 48%,#dddde5 48%,#dddde5 52%,transparent 52%); background-size:30px 30px; opacity:0.2; }
.ph-content { position:relative; z-index:1; text-align:center; padding:32px 24px; max-width:500px; }
.ph-icon { width:40px; height:40px; margin:0 auto 12px; color:#9ca3af; }
.ph-icon svg { width:100%; height:100%; }
.ph-label { font-size:15px; font-weight:700; color:#6b7280; margin-bottom:8px; }
.ph-detail { font-size:12px; color:#9ca3af; line-height:1.6; }
.ph-file { font-size:11px; color:#a5b4fc; margin-top:8px; padding:2px 10px; background:rgba(99,102,241,0.08); border-radius:10px; display:inline-block; }

/* 히어로 */
.dp-hero { position:relative; background:var(--dp-hero-bg,#111827); }
.dp-hero .dp-image-placeholder { min-height:500px; background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.15); }
.dp-hero .dp-image-placeholder::before { opacity:0.05; }
.dp-hero .ph-label,.dp-hero .ph-detail,.dp-hero .ph-icon { color:rgba(255,255,255,0.4); }
.hero-overlay { position:absolute; bottom:0; left:0; right:0; padding:80px 48px 48px; background:linear-gradient(transparent,rgba(0,0,0,0.85)); color:#fff; }
.hero-headline { font-size:32px; font-weight:800; line-height:1.3; margin-bottom:8px; }
.hero-product-name { font-size:48px; font-weight:900; letter-spacing:-1px; margin-bottom:12px; }
.hero-sub { font-size:16px; font-weight:300; opacity:0.8; }

/* 문제 공감 */
.dp-problem { background:#fafafa; }
.dp-problem .problem-text-area { padding:48px; text-align:center; }

/* 해결 제안 */
.dp-solution { background:#fff; }
.dp-solution .solution-text-area { padding:48px; text-align:center; }

/* 공통 텍스트 */
.section-headline { font-size:26px; font-weight:800; line-height:1.4; margin-bottom:12px; color:var(--dp-text,#1f2937); }
.section-headline.center { text-align:center; }
.section-body { font-size:15px; line-height:1.8; color:var(--dp-text-light,#6b7280); }
.section-body.center { text-align:center; }

/* 혜택/장점 */
.dp-benefit { display:grid; grid-template-columns:1fr 1fr; min-height:400px; }
.dp-benefit.reverse .benefit-image { order:2; }
.dp-benefit.reverse .benefit-text { order:1; }
.benefit-image { position:relative; }
.benefit-image .dp-image-placeholder { width:100%; height:100%; min-height:400px; }
.benefit-text { display:flex; flex-direction:column; justify-content:center; padding:48px; background:var(--dp-benefit-bg,#f9fafb); }
.benefit-label { font-size:11px; font-weight:700; letter-spacing:3px; color:var(--dp-accent,#2563eb); margin-bottom:12px; }
.benefit-headline { font-size:26px; font-weight:800; margin-bottom:12px; line-height:1.3; }
.benefit-body { font-size:15px; line-height:1.8; color:var(--dp-text-light,#6b7280); }

/* 추천 대상 */
.dp-target { padding:48px; background:#fff; }
.target-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:32px 0; }
.target-card { background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:24px; display:flex; align-items:flex-start; gap:16px; }
.target-num { font-size:20px; font-weight:800; color:var(--dp-accent,#2563eb); flex-shrink:0; }
.target-text { font-size:14px; line-height:1.6; color:#374151; }

/* 비교 테이블 */
.dp-comparison { padding:48px; background:#fff; }
.comp-table { width:100%; border-collapse:collapse; margin:32px 0; }
.comp-table th,.comp-table td { padding:16px 20px; text-align:center; font-size:14px; border-bottom:1px solid #e5e7eb; }
.comp-table th { background:#f9fafb; font-weight:700; font-size:13px; }
.comp-label { text-align:left!important; font-weight:600; color:#374151; }
.comp-old { color:#9ca3af; }
.comp-old-header { color:#9ca3af; }
.comp-new { font-weight:700; color:var(--dp-accent,#2563eb); }
.comp-new-header { color:var(--dp-accent,#2563eb); font-weight:700; }

/* 제품 디테일 */
.dp-detail { padding:48px; background:#fafafa; }

/* 사용 흐름 */
.dp-usage { padding:48px; background:#fff; }
.flow-steps { display:flex; align-items:center; justify-content:center; gap:8px; margin:32px 0; flex-wrap:wrap; }
.flow-step { background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:20px 16px; text-align:center; flex:1; min-width:140px; }
.flow-step-num { font-size:11px; font-weight:800; letter-spacing:2px; color:var(--dp-accent,#2563eb); margin-bottom:8px; }
.flow-step-text { font-size:13px; color:#374151; }
.flow-arrow { color:#d1d5db; flex-shrink:0; }

/* 신뢰 */
.dp-trust { padding:48px; background:#f9fafb; }
.trust-list { display:flex; flex-direction:column; gap:16px; margin:32px auto; max-width:500px; }
.trust-point { display:flex; align-items:center; gap:12px; font-size:15px; color:#374151; }
.trust-check { color:#10b981; flex-shrink:0; }

/* FAQ */
.dp-faq { padding:48px; background:#fff; }
.faq-list { margin-top:32px; display:flex; flex-direction:column; gap:16px; }
.faq-item { border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; }
.faq-q { display:flex; align-items:center; gap:12px; padding:16px 20px; background:#f9fafb; font-weight:600; font-size:14px; }
.faq-a { display:flex; align-items:flex-start; gap:12px; padding:16px 20px; font-size:14px; color:#6b7280; line-height:1.6; }
.faq-badge { display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:50%; background:var(--dp-accent,#2563eb); color:#fff; font-size:12px; font-weight:800; flex-shrink:0; }
.faq-badge-a { background:#10b981; }

/* 체감 메시지 */
.dp-experience { padding:48px; background:#f9fafb; }
.exp-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; margin-top:32px; }
.exp-quote { background:#fff; border-radius:12px; padding:24px; border:1px solid #e5e7eb; position:relative; }
.exp-quote-icon { position:absolute; top:16px; right:16px; color:var(--dp-accent,#2563eb); }
.exp-quote p { font-size:15px; line-height:1.7; color:#374151; font-style:italic; }

/* CTA */
.dp-cta { background:var(--dp-cta-bg,#f0f9ff); }
.cta-content { padding:48px; text-align:center; }
.cta-headline { font-size:28px; font-weight:800; margin-bottom:12px; }
.cta-body { font-size:15px; color:var(--dp-text-light,#6b7280); margin-bottom:32px; }
.cta-button { display:inline-block; background:var(--dp-accent,#2563eb); color:#fff; padding:16px 48px; border-radius:50px; font-size:16px; font-weight:700; text-decoration:none; box-shadow:0 4px 20px rgba(37,99,235,0.3); }

/* 범용 */
.dp-generic { padding:48px; }
.generic-list { margin:16px 0; padding-left:20px; }
.generic-list li { margin-bottom:8px; font-size:14px; color:#6b7280; line-height:1.6; }
    `;
  }
};
