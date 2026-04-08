/* ========================================
   DetailGen v2.1 - 생성 엔진
   designTokens + componentTemplates 지원
   ======================================== */

const Generator = {

  sectionMap: {
    'hero_cover': 'hero_cover',
    'problem_section': 'problem_section',
    'solution_section': 'solution_section',
    'benefit_storage': 'benefit',
    'benefit_portable': 'benefit',
    'benefit_fast': 'benefit',
    'benefit_field': 'benefit',
    'benefit_highlight': 'benefit',
    'target_users': 'target_users',
    'comparison_table': 'comparison_table',
    'product_detail': 'product_detail',
    'usage_flow': 'usage_flow',
    'trust_section': 'trust_section',
    'faq': 'faq',
    'experience_message': 'experience_message',
    'final_cta': 'final_cta'
  },

  /* ========================================
     designTokens → CSS 커스텀 프로퍼티
     ======================================== */

  generateTokenCSS(tokens) {
    if (!tokens) return '';
    let css = '';

    // Colors
    const c = tokens.colors || {};
    for (const [k, v] of Object.entries(c)) {
      css += `--dt-${k}:${v};`;
    }

    // Typography - font family
    const fontFamily = tokens.typography?.headline?.fontFamily;
    if (fontFamily) {
      css += `--dt-font:'${fontFamily}','Noto Sans KR',sans-serif;`;
      css += `font-family:var(--dt-font);`;
    }

    // Spacing
    const sp = tokens.spacing || {};
    for (const [k, v] of Object.entries(sp)) {
      css += `--dt-${k}:${v}px;`;
    }

    // Radius
    const r = tokens.radius || {};
    for (const [k, v] of Object.entries(r)) {
      css += `--dt-radius-${k}:${v};`;
    }

    // Shadow
    const sh = tokens.shadow || {};
    for (const [k, v] of Object.entries(sh)) {
      css += `--dt-shadow-${k}:${v};`;
    }

    return css;
  },

  /* ========================================
     토큰 경로 해석: "colors.background" → 실제 값
     ======================================== */

  resolveTokenPath(tokens, path) {
    if (!tokens || !path) return null;
    const parts = path.split('.');
    let val = tokens;
    for (const p of parts) {
      if (val == null) return null;
      val = val[p];
    }
    return val;
  },

  /* ========================================
     componentTemplates + templateRef + overrides 해석
     섹션에 _resolved 객체를 붙여서 반환
     ======================================== */

  resolveSection(section, planData) {
    const templates = planData.componentTemplates || {};
    const tokens = planData.designTokens || {};
    const ref = section.templateRef;

    if (!ref || !templates[ref]) return section;

    const template = templates[ref];
    const overrides = section.overrides || {};

    // 1. 컬러 resolve
    const colorRef = { ...(template.colorRef || {}), ...(overrides.colorRef || {}) };
    const resolvedColors = {};
    for (const [key, tokenPath] of Object.entries(colorRef)) {
      resolvedColors[key] = this.resolveTokenPath(tokens, tokenPath);
    }

    // 2. 타이포 resolve
    const typoRef = { ...(template.typographyRef || {}), ...(overrides.typographyRef || {}) };
    const resolvedTypo = {};
    for (const [key, tokenPath] of Object.entries(typoRef)) {
      const val = this.resolveTokenPath(tokens, tokenPath);
      if (val && typeof val === 'object') {
        resolvedTypo[key] = val;
      }
    }

    // 3. 패딩 resolve
    const paddingRef = overrides.paddingRef || template.paddingRef;
    const resolvedPadding = paddingRef ? this.resolveTokenPath(tokens, paddingRef) : null;

    // 4. 높이, 레이아웃 (override > section > template)
    const heightGuide = overrides.heightGuide || section.heightGuide || template.heightGuide;
    const layout = overrides.layout || section.layout || template.layout;

    return {
      ...section,
      heightGuide,
      layout,
      _resolved: {
        colors: resolvedColors,
        typography: resolvedTypo,
        padding: resolvedPadding,
        templateName: ref
      }
    };
  },

  /* ========================================
     밝기 판별 (인라인 스타일에서 텍스트 색 결정)
     ======================================== */

  isColorDark(hex) {
    if (!hex) return false;
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  },

  /* ========================================
     메인 생성
     ======================================== */

  generate(planData, options) {
    let sections = [...(planData.sections || [])];
    const ctx = this.buildContext(planData, options);

    // 모바일 모드 정렬
    if (options?.viewMode === 'mobile' && planData.smartstore_mobile_flow) {
      sections = this.reorderForMobile(sections, planData.smartstore_mobile_flow);
    }

    // 각 섹션에 templateRef resolve 적용
    sections = sections.map(s => this.resolveSection(s, planData));

    let html = '';
    if (options?.viewMode === 'mobile') {
      html += '<div class="mobile-notch"></div>';
    }

    let benefitIndex = 0;
    html += sections.map(section => {
      const templateName = this.sectionMap[section.name];
      if (!templateName) return Templates.generic(section, ctx);
      if (templateName === 'benefit') return Templates.benefit(section, ctx, benefitIndex++);
      if (typeof Templates[templateName] === 'function') return Templates[templateName](section, ctx);
      return Templates.generic(section, ctx);
    }).join('\n');

    return html;
  },

  buildContext(planData, options) {
    return {
      productName: planData.product?.name || '',
      brandName: planData.product?.brand || '',
      productType: planData.product?.type || '',
      concept: planData.product?.concept || '',
      visualDirection: planData.visualDirection || {},
      brandSystem: planData.brandSystem || {},
      pageGoal: planData.pageGoal || {},
      designTokens: planData.designTokens || {},
      componentTemplates: planData.componentTemplates || {},
      fileNames: planData.fileNamingGuide || [],
      flowOrder: planData.smartstore_mobile_flow || [],
      guideLevel: options?.imageGuideLevel || 'full',
      pageWidth: options?.pageWidth || 780,
      viewMode: options?.viewMode || 'preview'
    };
  },

  reorderForMobile(sections, flow) {
    const flowLabels = {
      '메인 비주얼': 'hero_cover', '문제 공감': 'problem_section',
      '해결 제안': 'solution_section', '핵심 장점 1': 'benefit_storage',
      '핵심 장점 2': 'benefit_portable', '핵심 장점 3': 'benefit_fast',
      '핵심 장점 4': 'benefit_field', '추천 대상': 'target_users',
      '비교 섹션': 'comparison_table', '실사용 장면': 'product_detail',
      '제품 디테일': 'product_detail', '사용 가이드': 'usage_flow',
      '신뢰 포인트': 'trust_section', 'FAQ': 'faq',
      '체감 메시지': 'experience_message', '최종 CTA': 'final_cta'
    };
    const nameToFlow = {};
    flow.forEach((label, i) => {
      const name = flowLabels[label];
      if (name) nameToFlow[name] = i;
    });
    return [...sections].sort((a, b) => (nameToFlow[a.name] ?? 999) - (nameToFlow[b.name] ?? 999));
  },

  /* ========================================
     카피 검증
     ======================================== */

  validateCopy(planData) {
    const rules = planData.copyRules || {};
    const sections = planData.sections || [];
    const results = [];
    const headlineMax = parseInt((rules.headlineRule || '').match(/(\d+)/)?.[1]) || 20;
    const bodyMaxSentences = parseInt((rules.bodyRule || '').match(/(\d+)/)?.[1]) || 3;
    const forbidden = rules.forbiddenExpressions || [];

    sections.forEach(section => {
      const mid = section.moduleId || '';
      const headline = section.headline || section.textOnImage?.headline || '';
      if (headline) {
        const len = headline.replace(/\s/g, '').length;
        if (len > headlineMax) {
          results.push({ type: 'warn', module: mid, msg: `헤드라인 ${len}자 (권장 ${headlineMax}자 이내): "${headline}"` });
        } else {
          results.push({ type: 'pass', module: mid, msg: `헤드라인 ${len}자 — OK` });
        }
      }
      const body = section.body || section.textOnImage?.body || '';
      if (body) {
        const sentences = body.split(/[.!?。]+/).filter(s => s.trim());
        if (sentences.length > bodyMaxSentences) {
          results.push({ type: 'warn', module: mid, msg: `본문 ${sentences.length}문장 (권장 ${bodyMaxSentences}문장 이내)` });
        }
      }
      const allText = [headline, body, section.subheadline || '', ...(section.overlayText || []),
        section.textOnImage?.subheadline || '', section.textOnImage?.body || '',
        ...(section.textOnImage?.bullets || []), section.cta || ''].join(' ');
      forbidden.forEach(expr => {
        if (allText.includes(expr)) {
          results.push({ type: 'fail', module: mid, msg: `금지 표현 발견: <strong>"${expr}"</strong>` });
        }
      });
    });
    return results;
  },

  /* ========================================
     내보내기: HTML
     ======================================== */

  generateStandaloneHTML(planData, options) {
    const mobileOpts = { ...options, viewMode: 'mobile' };
    const content = this.generate(planData, mobileOpts);
    const pageWidth = options?.pageWidth || 780;
    const name = planData.product?.name || '상세페이지';
    const tokenCSS = this.generateTokenCSS(planData.designTokens);

    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${name} 상세페이지</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Pretendard','Noto Sans KR',-apple-system,sans-serif;color:#1f2937;line-height:1.6;background:#fff;-webkit-font-smoothing:antialiased}
.page{max-width:${pageWidth}px;margin:0 auto;overflow:hidden;${tokenCSS}}
.cut-card{border-radius:0;box-shadow:none}
.cut-header,.cut-meta,.mobile-notch{display:none}
.cut-preview{position:relative;overflow:hidden;background:var(--dt-background,#e8e8ed)}
.cut-preview::before{content:'';position:absolute;inset:0;background:linear-gradient(45deg,transparent 48.5%,rgba(128,128,128,.15) 48.5%,rgba(128,128,128,.15) 51.5%,transparent 51.5%),linear-gradient(-45deg,transparent 48.5%,rgba(128,128,128,.15) 48.5%,rgba(128,128,128,.15) 51.5%,transparent 51.5%);background-size:24px 24px;opacity:0.3}
.toi-overlay{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:center;padding:var(--dt-innerPaddingPx,48px) 40px;min-height:400px;color:var(--dt-textPrimary,#1f2937)}
.toi-overlay.toi-hero{min-height:560px;justify-content:flex-end;padding-bottom:56px;background:linear-gradient(transparent 30%,rgba(0,0,0,.75));color:#fff}
.toi-overlay.toi-problem,.toi-overlay.toi-center{text-align:center;align-items:center}
.toi-headline{font-size:28px;font-weight:800;line-height:1.35;margin-bottom:10px}
.toi-hero .toi-headline{font-size:22px;font-weight:600;opacity:.9}
.toi-product-name{font-size:52px;font-weight:900;letter-spacing:-1.5px;line-height:1.15;margin-bottom:12px}
.toi-subheadline{font-size:16px;font-weight:300;opacity:.75}
.toi-body{font-size:15px;line-height:1.8;opacity:.7;margin-top:8px}
.toi-badges{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
.toi-badge{padding:5px 14px;background:var(--dt-badge,var(--dt-accent,#2563eb));color:#fff;border-radius:var(--dt-radius-badge,20px);font-size:12px;font-weight:600}
.toi-bullets{list-style:none;display:flex;flex-direction:column;gap:8px;margin:16px 0}
.toi-bullet{display:flex;align-items:center;gap:10px;font-size:14px}
.toi-bullet::before{content:'';width:6px;height:6px;background:var(--dt-accent,#2563eb);border-radius:50%;flex-shrink:0}
.toi-steps{display:flex;gap:12px;margin:20px 0;flex-wrap:wrap}
.toi-step{flex:1;min-width:120px;background:rgba(255,255,255,.08);border:1px solid var(--dt-border,rgba(0,0,0,.08));border-radius:var(--dt-radius-card,10px);padding:16px 12px;text-align:center}
.toi-step-num{font-size:10px;font-weight:800;letter-spacing:2px;color:var(--dt-accent,#2563eb);margin-bottom:6px}
.toi-step-text{font-size:13px}
.toi-points{display:flex;flex-direction:column;gap:12px;margin:16px 0}
.toi-point{display:flex;align-items:center;gap:10px;font-size:15px}
.toi-point-check{width:20px;height:20px;flex-shrink:0;color:#10b981}
.toi-table{width:100%;border-collapse:collapse;margin:20px 0;border-radius:var(--dt-radius-card,10px);overflow:hidden}
.toi-table th,.toi-table td{padding:14px 16px;font-size:13px;text-align:center;border-bottom:1px solid var(--dt-border,rgba(0,0,0,.06))}
.toi-table th{background:rgba(0,0,0,.03);font-weight:700;font-size:12px}
.comp-label{text-align:left;font-weight:600}.comp-old{opacity:.5}.comp-new{font-weight:700;color:var(--dt-accent,#2563eb)}
.toi-faq{display:flex;flex-direction:column;gap:12px;margin:20px 0;width:100%}
.toi-faq-item{border:1px solid var(--dt-border,rgba(0,0,0,.08));border-radius:var(--dt-radius-card,10px);overflow:hidden}
.toi-faq-q{display:flex;align-items:center;gap:10px;padding:14px 16px;background:rgba(0,0,0,.02);font-size:14px;font-weight:600}
.toi-faq-a{padding:14px 16px;font-size:13px;opacity:.7;line-height:1.6;display:flex;align-items:flex-start;gap:10px}
.toi-faq-badge{width:22px;height:22px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font-size:11px;font-weight:800;color:#fff}
.toi-faq-badge.q{background:var(--dt-accent,#2563eb)}.toi-faq-badge.a{background:#10b981}
.toi-quotes{display:flex;gap:16px;margin:20px 0;flex-wrap:wrap}
.toi-quote{flex:1;min-width:180px;background:rgba(255,255,255,.1);border:1px solid var(--dt-border,rgba(0,0,0,.06));border-radius:var(--dt-radius-card,10px);padding:20px;font-size:14px;font-style:italic;line-height:1.7;position:relative}
.toi-quote::before{content:'\\201C';font-size:40px;color:var(--dt-accent,#2563eb);opacity:.2;position:absolute;top:8px;left:12px;line-height:1}
.toi-cta{display:inline-block;margin-top:24px;padding:14px 40px;background:var(--dt-accent,#2563eb);color:#fff;border-radius:var(--dt-radius-button,50px);font-size:15px;font-weight:700;text-decoration:none;box-shadow:var(--dt-shadow-button,0 4px 16px rgba(37,99,235,.3))}
.toi-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0;width:100%}
.toi-card{background:rgba(255,255,255,.1);border:1px solid var(--dt-border,rgba(0,0,0,.06));border-radius:var(--dt-radius-card,10px);padding:var(--dt-cardPaddingPx,20px);display:flex;align-items:flex-start;gap:12px;box-shadow:var(--dt-shadow-card,none)}
.toi-card-num{font-size:18px;font-weight:800;color:var(--dt-accent,#2563eb);flex-shrink:0}
.toi-card-text{font-size:13px;line-height:1.5}
.cut-img-guide{position:absolute;top:12px;right:12px;z-index:3;background:rgba(0,0,0,.5);color:rgba(255,255,255,.7);padding:4px 10px;border-radius:6px;font-size:10px;font-weight:600;backdrop-filter:blur(4px)}
.cut-file-hint{position:absolute;bottom:8px;left:12px;z-index:3;background:rgba(99,102,241,.15);color:#818cf8;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600}
</style>
</head>
<body>
<div class="page">${content}</div>
</body>
</html>`;
  },

  /* ========================================
     내보내기: 디자이너 전달용
     ======================================== */

  generateDesignerDoc(planData) {
    const p = planData.product || {};
    const vd = planData.visualDirection || {};
    let doc = `# ${p.name || '상품'} 상세페이지 디자인 가이드\n\n`;

    doc += `## 제품 정보\n- 브랜드: ${p.brand || '-'}\n- 제품명: ${p.name || '-'}\n- 유형: ${p.type || '-'}\n- 컨셉: ${p.concept || '-'}\n\n`;

    // designTokens 섹션
    const dt = planData.designTokens;
    if (dt) {
      doc += `## 디자인 토큰\n\n`;
      if (dt.colors) {
        doc += `### 컬러\n`;
        for (const [k, v] of Object.entries(dt.colors)) {
          doc += `- ${k}: \`${v}\`\n`;
        }
        doc += '\n';
      }
      if (dt.typography) {
        doc += `### 타이포그래피\n`;
        for (const [k, v] of Object.entries(dt.typography)) {
          doc += `- ${k}: ${v.fontFamily} ${v.weight} ${v.sizePx}px${v.lineHeight ? ` / lh ${v.lineHeight}` : ''}\n`;
        }
        doc += '\n';
      }
      if (dt.spacing) {
        doc += `### 간격\n`;
        for (const [k, v] of Object.entries(dt.spacing)) { doc += `- ${k}: ${v}px\n`; }
        doc += '\n';
      }
      if (dt.radius) {
        doc += `### 라운딩\n`;
        for (const [k, v] of Object.entries(dt.radius)) { doc += `- ${k}: ${v}\n`; }
        doc += '\n';
      }
    }

    // componentTemplates
    const ct = planData.componentTemplates;
    if (ct) {
      doc += `## 컴포넌트 템플릿\n\n`;
      for (const [name, tmpl] of Object.entries(ct)) {
        doc += `### ${name}\n`;
        doc += `- 레이아웃: ${tmpl.layout || '-'}\n`;
        doc += `- 높이: ${tmpl.heightGuide || '-'}\n`;
        if (tmpl.colorRef) doc += `- 컬러: ${JSON.stringify(tmpl.colorRef)}\n`;
        if (tmpl.typographyRef) doc += `- 서체: ${JSON.stringify(tmpl.typographyRef)}\n`;
        doc += '\n';
      }
    }

    doc += `## 비주얼 디렉션\n`;
    doc += `- 무드: ${vd.overallMood || '-'}\n`;
    doc += `- 촬영: ${(vd.photoStyle || []).join(', ')}\n`;
    doc += `- 라이팅: ${(vd.lighting || []).join(' / ')}\n\n`;

    doc += `## 컷별 디자인 지시\n\n`;
    (planData.sections || []).forEach((s, i) => {
      doc += `### ${s.moduleId} — ${s.name}`;
      if (s.templateRef) doc += ` (템플릿: ${s.templateRef})`;
      doc += '\n';
      doc += `**헤드라인**: ${s.headline || '-'}\n`;
      if (s.body) doc += `**본문**: ${s.body}\n`;
      if (s.layout) doc += `**레이아웃**: ${s.layout}\n`;
      if (s.heightGuide) doc += `**높이**: ${s.heightGuide}\n`;
      if (s._resolved) doc += `**적용 토큰**: bg=${s._resolved.colors?.background || '-'} / text=${s._resolved.colors?.text || '-'} / accent=${s._resolved.colors?.accent || '-'}\n`;
      const ic = s.imageConcept;
      if (ic) { doc += `**이미지**: ${ic.summary}\n**촬영 가이드**: ${ic.detailedDescription}\n`; }
      const fn = planData.fileNamingGuide?.[i];
      if (fn) doc += `**파일명**: ${fn}\n`;
      doc += '\n---\n\n';
    });

    const checklist = planData.image_asset_checklist || [];
    if (checklist.length) {
      doc += `## 필수 촬영 에셋\n`;
      checklist.forEach(c => { doc += `- [ ] ${c}\n`; });
    }
    return doc;
  },

  generatePhotoGuide(planData) {
    const vd = planData.visualDirection || {};
    let doc = `# ${planData.product?.name || '상품'} 촬영 가이드\n\n`;
    doc += `## 촬영 방향\n- 무드: ${vd.overallMood || '-'}\n- 스타일: ${(vd.photoStyle || []).join(', ')}\n- 라이팅: ${(vd.lighting || []).join(' / ')}\n\n`;
    doc += `## 컷별 촬영 지시\n\n`;
    (planData.sections || []).forEach((s, i) => {
      const ic = s.imageConcept;
      if (!ic) return;
      doc += `### ${s.moduleId} | ${ic.summary}\n**파일명**: ${planData.fileNamingGuide?.[i] || '-'}\n**상세**: ${ic.detailedDescription}\n`;
      const cut = s.cuts?.[0];
      if (cut?.layout) doc += `**앵글**: ${cut.layout.cameraAngle || '-'} / **구도**: ${cut.layout.composition || '-'}\n`;
      doc += '\n';
    });
    const cl = planData.image_asset_checklist || [];
    if (cl.length) { doc += `## 에셋 체크리스트\n`; cl.forEach(c => { doc += `- [ ] ${c}\n`; }); }
    return doc;
  },

  generateAIPromptSheet(planData) {
    let doc = `# ${planData.product?.name || '상품'} AI 이미지 생성 프롬프트\n\n`;
    const ex = planData.image_generation_prompt_examples || [];
    if (ex.length) { doc += `## 프롬프트 예시\n\n`; ex.forEach((p, i) => { doc += `### ${i+1}번\n\`\`\`\n${p}\n\`\`\`\n\n`; }); }
    doc += `## 컷별 프롬프트\n\n`;
    (planData.sections || []).forEach(s => {
      const cut = s.cuts?.[0];
      if (cut?.aiPrompt?.positive) { doc += `### ${s.moduleId}\n\`\`\`\n${cut.aiPrompt.positive}\n\`\`\`\n`; if (cut.aiPrompt.negative?.length) doc += `Negative: ${cut.aiPrompt.negative.join(', ')}\n`; doc += '\n'; }
    });
    doc += `## imageConcept 기반 자동 프롬프트\n\n`;
    (planData.sections || []).forEach(s => {
      const ic = s.imageConcept;
      if (ic?.detailedDescription) doc += `### ${s.moduleId} — ${ic.summary}\n\`\`\`\n${ic.detailedDescription}, 상세페이지용 세로 비율, 한국 이커머스 스타일\n\`\`\`\n\n`;
    });
    return doc;
  }
};
