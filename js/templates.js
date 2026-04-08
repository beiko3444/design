/* ========================================
   상세페이지 템플릿 시스템
   - 각 섹션별 HTML 생성 함수
   ======================================== */

const Templates = {
  /* ---------- 이미지 플레이스홀더 ---------- */
  imagePlaceholder(label, desc, width, height) {
    return `
      <div class="dp-image-placeholder" style="width:${width || '100%'};height:${height || 'auto'};min-height:${height || '300px'};">
        <div class="placeholder-content">
          <svg class="placeholder-icon" viewBox="0 0 48 48" fill="none" stroke="#8888a0" stroke-width="2">
            <rect x="6" y="10" width="36" height="28" rx="3"/>
            <circle cx="18" cy="22" r="4"/>
            <path d="M6 34l10-10 8 8 6-6 12 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="placeholder-label">${label}</div>
          <div class="placeholder-desc">${desc}</div>
          ${width && height ? `<div class="placeholder-size">${width} x ${height}</div>` : ''}
        </div>
      </div>`;
  },

  /* ---------- 히어로 배너 ---------- */
  hero(data) {
    const categoryMap = {
      general: '상품',
      food: '식품',
      beauty: '뷰티',
      fashion: '패션',
      electronics: '전자기기',
      interior: '인테리어',
      health: '건강'
    };
    const categoryLabel = categoryMap[data.category] || '상품';

    return `
      <section class="dp-hero">
        ${this.imagePlaceholder(
          '메인 히어로 이미지',
          `${data.productName}의 대표 이미지. 제품의 핵심 매력을 한눈에 보여주는 고퀄리티 사진`,
          '100%', '500px'
        )}
        <div class="dp-hero-overlay">
          <div class="dp-hero-category">${categoryLabel}</div>
          <h1 class="dp-hero-title">${data.productName}</h1>
          <p class="dp-hero-subtitle">${data.shortDesc}</p>
          ${data.priceInfo ? `<div class="dp-hero-price">${data.priceInfo}</div>` : ''}
        </div>
      </section>`;
  },

  /* ---------- 셀링포인트 ---------- */
  sellingPoints(data) {
    if (!data.sellingPoints || data.sellingPoints.length === 0) return '';

    const iconPool = ['💎', '⚡', '🎯', '🔥', '✨', '🛡️', '🌟', '🚀', '💡', '♻️', '🎨', '⏱️'];

    const items = data.sellingPoints.map((sp, i) => `
      <div class="dp-selling-item">
        <div class="dp-selling-icon">${iconPool[i % iconPool.length]}</div>
        <h3>${sp.title}</h3>
        <p>${sp.desc}</p>
      </div>`
    ).join('');

    return `
      <section class="dp-selling-section">
        <h2 class="dp-section-title">${data.productName}을 선택해야 하는 이유</h2>
        <p class="dp-section-subtitle">${data.shortDesc}</p>
        <div class="dp-selling-grid">
          ${items}
        </div>
      </section>`;
  },

  /* ---------- 특징 섹션 ---------- */
  features(data) {
    if (!data.features || data.features.length === 0) return '';

    const blocks = data.features.map((feat, i) => {
      const isReverse = i % 2 === 1;
      const bgClass = `bg-${feat.bg || 'light'}`;
      const imgDesc = feat.imgGuide || `${feat.title} 관련 이미지`;

      return `
        <div class="dp-feature-block${isReverse ? ' reverse' : ''}">
          <div class="dp-feature-image">
            ${this.imagePlaceholder(
              `특징 이미지 #${i + 1}`,
              imgDesc,
              '100%', '450px'
            )}
          </div>
          <div class="dp-feature-text ${bgClass}">
            <div class="dp-feature-label">FEATURE ${String(i + 1).padStart(2, '0')}</div>
            <h3 class="dp-feature-title">${feat.title}</h3>
            <p class="dp-feature-desc">${feat.desc}</p>
          </div>
        </div>`;
    }).join('<div class="dp-divider"></div>');

    return `<section class="dp-feature-section">${blocks}</section>`;
  },

  /* ---------- 스펙 테이블 ---------- */
  specs(data) {
    if (!data.specs || data.specs.length === 0) return '';

    const rows = data.specs.map(s =>
      `<tr><td>${s.key}</td><td>${s.value}</td></tr>`
    ).join('');

    return `
      <section class="dp-spec-section">
        <h2 class="dp-section-title">제품 사양</h2>
        <p class="dp-section-subtitle">상세 스펙을 확인하세요</p>
        <table class="dp-spec-table">
          ${rows}
        </table>
      </section>`;
  },

  /* ---------- 리뷰 ---------- */
  reviews(data) {
    if (!data.reviews || data.reviews.length === 0) return '';

    const cards = data.reviews.map(r => {
      const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      return `
        <div class="dp-review-card">
          <div class="dp-review-header">
            <span class="dp-review-author">${r.author}</span>
            <span class="dp-review-stars">${stars}</span>
          </div>
          <p class="dp-review-text">${r.content}</p>
        </div>`;
    }).join('');

    return `
      <section class="dp-review-section">
        <h2 class="dp-section-title">실제 고객 후기</h2>
        <p class="dp-section-subtitle">구매 고객들의 생생한 리뷰</p>
        <div class="dp-review-grid">
          ${cards}
        </div>
      </section>`;
  },

  /* ---------- 브랜드 스토리 ---------- */
  brand(data) {
    if (!data.brandName && !data.brandStory) return '';

    return `
      <section class="dp-brand-section">
        ${this.imagePlaceholder(
          '브랜드 로고',
          `${data.brandName || '브랜드'} 로고 이미지`,
          '120px', '120px'
        )}
        <h3 class="dp-brand-name">${data.brandName || ''}</h3>
        <p class="dp-brand-story">${data.brandStory || ''}</p>
      </section>`;
  },

  /* ---------- CTA (구매 유도) ---------- */
  cta(data) {
    return `
      <section class="dp-cta-section">
        <h2 class="dp-cta-title">지금 바로 만나보세요</h2>
        <p class="dp-cta-subtitle">${data.shortDesc}</p>
        ${data.priceInfo ? `<div class="dp-cta-price">${data.priceInfo}</div>` : ''}
        <a href="#" class="dp-cta-button">구매하기</a>
      </section>`;
  }
};
