/* ========================================
   상세페이지 섹션 템플릿 시스템
   JSON 기획서의 각 섹션 타입에 맞는 HTML 생성
   ======================================== */

const Templates = {

  /* ========== 공통: 이미지 플레이스홀더 ========== */
  imagePlaceholder(imageConcept, heightGuide, fileHint, guideLevel) {
    const level = guideLevel || 'full';
    const summary = imageConcept?.summary || '이미지 영역';
    const detail = imageConcept?.detailedDescription || '';
    const height = heightGuide || '400px';

    // 높이 파싱: "1200~1600px" → 중간값, "400px" → 그대로
    let parsedHeight = height;
    const rangeMatch = height.match(/(\d+)~(\d+)/);
    if (rangeMatch) {
      parsedHeight = Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2) + 'px';
    }

    let contentHTML = '';
    if (level === 'full') {
      contentHTML = `
        <div class="ph-icon">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="6" y="10" width="36" height="28" rx="3"/>
            <circle cx="18" cy="22" r="4"/>
            <path d="M6 34l10-10 8 8 6-6 12 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="ph-label">${summary}</div>
        <div class="ph-detail">${detail}</div>
        ${fileHint ? `<div class="ph-file">${fileHint}</div>` : ''}`;
    } else if (level === 'summary') {
      contentHTML = `
        <div class="ph-icon">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="6" y="10" width="36" height="28" rx="3"/>
            <circle cx="18" cy="22" r="4"/>
            <path d="M6 34l10-10 8 8 6-6 12 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="ph-label">${summary}</div>`;
    } else {
      contentHTML = `
        <div class="ph-icon">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="6" y="10" width="36" height="28" rx="3"/>
            <circle cx="18" cy="22" r="4"/>
            <path d="M6 34l10-10 8 8 6-6 12 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>`;
    }

    return `<div class="dp-image-placeholder" style="min-height:${parsedHeight}">
      <div class="ph-content">${contentHTML}</div>
    </div>`;
  },

  /* ========== M01: 히어로 커버 ========== */
  hero_cover(section, ctx) {
    const overlays = (section.overlayText || []).map((t, i) => {
      if (i === 0) return `<h1 class="hero-headline">${t}</h1>`;
      if (i === 1) return `<div class="hero-product-name">${t}</div>`;
      return `<p class="hero-sub">${t}</p>`;
    }).join('');

    return `
    <section class="dp-section dp-hero" data-module="${section.moduleId}">
      ${this.imagePlaceholder(section.imageConcept, section.heightGuide, ctx.fileNames?.[0], ctx.guideLevel)}
      <div class="hero-overlay">
        ${overlays}
      </div>
    </section>`;
  },

  /* ========== M02: 문제 공감 ========== */
  problem_section(section, ctx) {
    return `
    <section class="dp-section dp-problem" data-module="${section.moduleId}">
      <div class="problem-text-area">
        <h2 class="section-headline">${section.headline || ''}</h2>
        <p class="section-body">${section.body || ''}</p>
      </div>
      ${this.imagePlaceholder(section.imageConcept, section.heightGuide, ctx.fileNames?.[1], ctx.guideLevel)}
    </section>`;
  },

  /* ========== M03: 해결 제안 ========== */
  solution_section(section, ctx) {
    return `
    <section class="dp-section dp-solution" data-module="${section.moduleId}">
      ${this.imagePlaceholder(section.imageConcept, '500px', ctx.fileNames?.[2], ctx.guideLevel)}
      <div class="solution-text-area">
        <h2 class="section-headline">${section.headline || ''}</h2>
        <p class="section-body">${section.body || ''}</p>
      </div>
    </section>`;
  },

  /* ========== M04~M07: 혜택/장점 (benefit_*) ========== */
  benefit(section, ctx, index) {
    const isEven = index % 2 === 0;
    const fileIdx = parseInt((section.moduleId || '').replace('M', '')) - 1;
    const fileHint = ctx.fileNames?.[fileIdx] || '';

    return `
    <section class="dp-section dp-benefit ${isEven ? '' : 'reverse'}" data-module="${section.moduleId}">
      <div class="benefit-image">
        ${this.imagePlaceholder(section.imageConcept, '450px', fileHint, ctx.guideLevel)}
      </div>
      <div class="benefit-text">
        <div class="benefit-label">BENEFIT</div>
        <h2 class="benefit-headline">${section.headline || ''}</h2>
        <p class="benefit-body">${section.body || ''}</p>
      </div>
    </section>`;
  },

  /* ========== M08: 추천 대상 ========== */
  target_users(section, ctx) {
    const items = (section.items || []).map((item, i) => `
      <div class="target-card">
        <div class="target-num">${String(i + 1).padStart(2, '0')}</div>
        <p class="target-text">${item}</p>
      </div>`
    ).join('');

    const fileIdx = parseInt((section.moduleId || '').replace('M', '')) - 1;
    return `
    <section class="dp-section dp-target" data-module="${section.moduleId}">
      <h2 class="section-headline center">${section.headline || ''}</h2>
      <div class="target-grid">${items}</div>
      ${this.imagePlaceholder(section.imageConcept, '400px', ctx.fileNames?.[fileIdx], ctx.guideLevel)}
    </section>`;
  },

  /* ========== M09: 비교 테이블 ========== */
  comparison_table(section, ctx) {
    const rows = (section.rows || []).map(row => `
      <tr>
        <td class="comp-label">${row}</td>
        <td class="comp-old">일반 미끼</td>
        <td class="comp-new">${ctx.productName || '본 제품'}</td>
      </tr>`
    ).join('');

    const fileIdx = parseInt((section.moduleId || '').replace('M', '')) - 1;
    return `
    <section class="dp-section dp-comparison" data-module="${section.moduleId}">
      <h2 class="section-headline center">${section.headline || ''}</h2>
      <table class="comp-table">
        <thead>
          <tr>
            <th>항목</th>
            <th class="comp-old-header">기존</th>
            <th class="comp-new-header">${ctx.productName || '본 제품'}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${this.imagePlaceholder(section.imageConcept, '350px', ctx.fileNames?.[fileIdx], ctx.guideLevel)}
    </section>`;
  },

  /* ========== M10: 제품 디테일 ========== */
  product_detail(section, ctx) {
    const fileIdx = parseInt((section.moduleId || '').replace('M', '')) - 1;
    return `
    <section class="dp-section dp-detail" data-module="${section.moduleId}">
      <h2 class="section-headline center">${section.headline || ''}</h2>
      <p class="section-body center">${section.body || ''}</p>
      ${this.imagePlaceholder(section.imageConcept, '600px', ctx.fileNames?.[fileIdx], ctx.guideLevel)}
    </section>`;
  },

  /* ========== M11: 사용 흐름 ========== */
  usage_flow(section, ctx) {
    const steps = (section.steps || []).map((step, i) => `
      <div class="flow-step">
        <div class="flow-step-num">STEP ${i + 1}</div>
        <p class="flow-step-text">${step}</p>
      </div>`
    ).join('<div class="flow-arrow"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>');

    const fileIdx = parseInt((section.moduleId || '').replace('M', '')) - 1;
    return `
    <section class="dp-section dp-usage" data-module="${section.moduleId}">
      <h2 class="section-headline center">${section.headline || ''}</h2>
      <div class="flow-steps">${steps}</div>
      ${this.imagePlaceholder(section.imageConcept, '400px', ctx.fileNames?.[fileIdx], ctx.guideLevel)}
    </section>`;
  },

  /* ========== M12: 신뢰 섹션 ========== */
  trust_section(section, ctx) {
    const points = (section.points || []).map(p => `
      <div class="trust-point">
        <svg class="trust-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        <span>${p}</span>
      </div>`
    ).join('');

    const fileIdx = parseInt((section.moduleId || '').replace('M', '')) - 1;
    return `
    <section class="dp-section dp-trust" data-module="${section.moduleId}">
      <h2 class="section-headline center">${section.headline || ''}</h2>
      <div class="trust-list">${points}</div>
      ${this.imagePlaceholder(section.imageConcept, '400px', ctx.fileNames?.[fileIdx], ctx.guideLevel)}
    </section>`;
  },

  /* ========== M13: FAQ ========== */
  faq(section, ctx) {
    const qas = (section.qa || []).map((item, i) => `
      <div class="faq-item">
        <div class="faq-q">
          <span class="faq-badge">Q</span>
          <span>${item.q}</span>
        </div>
        <div class="faq-a">
          <span class="faq-badge faq-badge-a">A</span>
          <span>${item.a}</span>
        </div>
      </div>`
    ).join('');

    return `
    <section class="dp-section dp-faq" data-module="${section.moduleId}">
      <h2 class="section-headline center">${section.headline || ''}</h2>
      <div class="faq-list">${qas}</div>
    </section>`;
  },

  /* ========== M14: 체감 메시지 / 경험 ========== */
  experience_message(section, ctx) {
    const quotes = (section.quotes || []).map(q => `
      <div class="exp-quote">
        <svg class="exp-quote-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.15"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z"/></svg>
        <p>${q}</p>
      </div>`
    ).join('');

    return `
    <section class="dp-section dp-experience" data-module="${section.moduleId}">
      <h2 class="section-headline center">${section.headline || ''}</h2>
      <div class="exp-grid">${quotes}</div>
    </section>`;
  },

  /* ========== M15: 최종 CTA ========== */
  final_cta(section, ctx) {
    const fileIdx = parseInt((section.moduleId || '').replace('M', '')) - 1;
    return `
    <section class="dp-section dp-cta" data-module="${section.moduleId}">
      ${this.imagePlaceholder(section.imageConcept, '350px', ctx.fileNames?.[fileIdx], ctx.guideLevel)}
      <div class="cta-content">
        <h2 class="cta-headline">${section.headline || ''}</h2>
        <p class="cta-body">${section.body || ''}</p>
        ${section.cta ? `<a href="#" class="cta-button">${section.cta}</a>` : ''}
      </div>
    </section>`;
  },

  /* ========== 범용 폴백 ========== */
  generic(section, ctx) {
    const fileIdx = parseInt((section.moduleId || '').replace('M', '')) - 1;
    let bodyContent = '';
    if (section.body) bodyContent += `<p class="section-body">${section.body}</p>`;
    if (section.items) bodyContent += `<ul class="generic-list">${section.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    if (section.points) bodyContent += `<ul class="generic-list">${section.points.map(p => `<li>${p}</li>`).join('')}</ul>`;
    if (section.steps) bodyContent += `<ol class="generic-list">${section.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;

    return `
    <section class="dp-section dp-generic" data-module="${section.moduleId}">
      <h2 class="section-headline center">${section.headline || ''}</h2>
      ${bodyContent}
      ${section.imageConcept ? this.imagePlaceholder(section.imageConcept, '400px', ctx.fileNames?.[fileIdx], ctx.guideLevel) : ''}
    </section>`;
  }
};
