/* ========================================
   DetailGen v2 - 컷 기반 템플릿 시스템
   각 섹션 = 하나의 디자인 컷 (이미지 파일)
   textOnImage: 이미지 위에 합성될 텍스트 미리보기
   ======================================== */

const Templates = {

  /* ===== 컷 카드 래퍼 ===== */
  cutCard(section, ctx, innerHTML) {
    const moduleId = section.moduleId || '';
    const name = section.name || '';
    const layout = section.layout || '';
    const flowIdx = ctx.flowOrder?.indexOf(this.getFlowLabel(name));
    const flowNum = flowIdx >= 0 ? flowIdx + 1 : '';
    const fileIdx = parseInt(moduleId.replace('M', '')) - 1;
    const fileHint = ctx.fileNames?.[fileIdx] || '';

    // 디자이너 메타 패널
    const metaHTML = this.cutMeta(section, ctx);

    return `
    <div class="cut-card" data-module="${moduleId}" data-name="${name}">
      <div class="cut-header">
        <span class="cut-module-id">${moduleId}</span>
        <span class="cut-name">${name}</span>
        ${layout ? `<span class="cut-layout-hint">${layout}</span>` : ''}
        ${flowNum ? `<span class="cut-flow-num">모바일 ${flowNum}번째</span>` : ''}
      </div>
      ${innerHTML}
      ${metaHTML}
    </div>`;
  },

  /* ===== 디자이너 메타 패널 ===== */
  cutMeta(section, ctx) {
    const ic = section.imageConcept;
    const cut = section.cuts?.[0]; // cuts 배열이 있으면 첫번째 사용
    const fileIdx = parseInt((section.moduleId || '').replace('M', '')) - 1;
    const fileHint = ctx.fileNames?.[fileIdx] || '';

    let parts = [];

    // 이미지 컨셉 상세
    if (ic?.detailedDescription) {
      parts.push(`
        <div class="meta-section">
          <div class="meta-label">촬영 가이드</div>
          <div class="meta-text">${ic.detailedDescription}</div>
        </div>`);
    }

    // 파일명
    if (fileHint) {
      parts.push(`
        <div class="meta-section">
          <div class="meta-label">파일명</div>
          <div class="meta-text">${fileHint}</div>
        </div>`);
    }

    // cuts[] 상세 정보
    if (cut) {
      if (cut.layout) {
        const layoutInfo = [
          cut.layout.type && `타입: ${cut.layout.type}`,
          cut.layout.composition && `구도: ${cut.layout.composition}`,
          cut.layout.cameraAngle && `앵글: ${cut.layout.cameraAngle}`,
          cut.layout.crop && `크롭: ${cut.layout.crop}`
        ].filter(Boolean).join(' / ');
        if (layoutInfo) {
          parts.push(`
            <div class="meta-section">
              <div class="meta-label">레이아웃 상세</div>
              <div class="meta-text">${layoutInfo}</div>
            </div>`);
        }
      }

      // 디자이너 노트
      if (cut.designerNotes?.length) {
        parts.push(`
          <div class="meta-section">
            <div class="meta-label">디자이너 노트</div>
            <div class="meta-notes">
              ${cut.designerNotes.map(n => `<div class="meta-note">${n}</div>`).join('')}
            </div>
          </div>`);
      }

      // AI 프롬프트
      if (cut.aiPrompt?.positive) {
        parts.push(`
          <div class="meta-section">
            <div class="meta-label">AI 프롬프트 (Positive)</div>
            <div class="meta-prompt">${cut.aiPrompt.positive}</div>
          </div>`);
      }
      if (cut.aiPrompt?.negative?.length) {
        parts.push(`
          <div class="meta-section">
            <div class="meta-label">AI 프롬프트 (Negative)</div>
            <div class="meta-prompt negative">${cut.aiPrompt.negative.join(', ')}</div>
          </div>`);
      }
    }

    if (parts.length === 0) return '';
    return `<div class="cut-meta">${parts.join('')}</div>`;
  },

  /* ===== 배경 클래스 결정 ===== */
  getBgClass(section, ctx) {
    const bgUsage = ctx.visualDirection?.backgroundUsage || {};
    const name = section.name || '';

    if (name === 'hero_cover') {
      const h = (bgUsage.hero || '').toLowerCase();
      if (h.includes('네이비')) return 'bg-navy';
      if (h.includes('블랙')) return 'bg-dark';
      return 'bg-dark';
    }
    if (name.startsWith('benefit') || name === 'trust_section') {
      const b = (bgUsage.benefit || '').toLowerCase();
      if (b.includes('화이트')) return 'bg-white';
      return 'bg-light';
    }
    if (name === 'final_cta') {
      return 'bg-light';
    }
    if (name === 'problem_section') return 'bg-light';
    return 'bg-white';
  },

  /* ===== smartstore_mobile_flow용 라벨 매핑 ===== */
  getFlowLabel(name) {
    const map = {
      'hero_cover': '메인 비주얼',
      'problem_section': '문제 공감',
      'solution_section': '해결 제안',
      'benefit_storage': '핵심 장점 1',
      'benefit_portable': '핵심 장점 2',
      'benefit_fast': '핵심 장점 3',
      'benefit_field': '핵심 장점 4',
      'target_users': '추천 대상',
      'comparison_table': '비교 섹션',
      'product_detail': '제품 디테일',
      'usage_flow': '사용 가이드',
      'trust_section': '신뢰 포인트',
      'faq': 'FAQ',
      'experience_message': '체감 메시지',
      'final_cta': '최종 CTA'
    };
    return map[name] || name;
  },

  /* ===== 이미지 가이드 뱃지 ===== */
  imgGuideBadge(section, ctx) {
    const ic = section.imageConcept;
    if (!ic) return '';
    const fileIdx = parseInt((section.moduleId || '').replace('M', '')) - 1;
    const fileHint = ctx.fileNames?.[fileIdx] || '';
    return `
      <div class="cut-img-guide">${ic.summary || '이미지'}</div>
      ${fileHint ? `<div class="cut-file-hint">${fileHint}</div>` : ''}`;
  },

  /* ========================================
     textOnImage 렌더러 - 핵심 함수
     이미지 위에 배치될 텍스트를 HTML로 시뮬레이션
     ======================================== */

  renderTextOnImage(toi, section, overlayClass) {
    // textOnImage 객체가 있으면 사용, 없으면 섹션 필드에서 조합
    const src = toi || {};
    const headline = src.headline || section.headline || '';
    const subheadline = src.subheadline || section.subheadline || '';
    const body = src.body || section.body || '';
    const productName = src.productName || section.productName || '';
    const badges = src.badges || [];
    const bullets = src.bullets || [];
    const steps = src.steps || section.steps || [];
    const points = src.points || section.points || [];
    const items = src.items || section.items || [];
    const table = src.table || section.rows || [];
    const qa = src.qa || section.qa || [];
    const quotes = src.quotes || section.quotes || [];
    const cta = src.cta || section.cta || '';

    let parts = [];

    if (headline) parts.push(`<div class="toi-headline">${headline}</div>`);
    if (productName) parts.push(`<div class="toi-product-name">${productName}</div>`);
    if (subheadline) parts.push(`<div class="toi-subheadline">${subheadline}</div>`);
    if (body) parts.push(`<div class="toi-body">${body}</div>`);

    if (badges.length) {
      parts.push(`<div class="toi-badges">${badges.map(b => `<span class="toi-badge">${b}</span>`).join('')}</div>`);
    }

    if (bullets.length) {
      parts.push(`<ul class="toi-bullets">${bullets.map(b => `<li class="toi-bullet">${b}</li>`).join('')}</ul>`);
    }

    if (items.length && !table.length) {
      parts.push(`<div class="toi-cards">${items.map((item, i) =>
        `<div class="toi-card"><div class="toi-card-num">${String(i+1).padStart(2,'0')}</div><div class="toi-card-text">${item}</div></div>`
      ).join('')}</div>`);
    }

    if (table.length) {
      const prodName = section.productName || this._ctx?.productName || '본 제품';
      parts.push(`<table class="toi-table">
        <thead><tr><th>항목</th><th class="comp-old">기존</th><th class="comp-new">${prodName}</th></tr></thead>
        <tbody>${table.map(r => {
          if (typeof r === 'string') return `<tr><td class="comp-label">${r}</td><td class="comp-old">-</td><td class="comp-new">-</td></tr>`;
          return `<tr><td class="comp-label">${r.label || ''}</td><td class="comp-old">${r.old || '-'}</td><td class="comp-new">${r.new || '-'}</td></tr>`;
        }).join('')}</tbody>
      </table>`);
    }

    if (steps.length) {
      parts.push(`<div class="toi-steps">${steps.map((s, i) =>
        `<div class="toi-step"><div class="toi-step-num">STEP ${i+1}</div><div class="toi-step-text">${s}</div></div>`
      ).join('')}</div>`);
    }

    if (points.length) {
      parts.push(`<div class="toi-points">${points.map(p =>
        `<div class="toi-point"><svg class="toi-point-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>${p}</span></div>`
      ).join('')}</div>`);
    }

    if (qa.length) {
      parts.push(`<div class="toi-faq">${qa.map(item =>
        `<div class="toi-faq-item">
          <div class="toi-faq-q"><span class="toi-faq-badge q">Q</span><span>${item.q}</span></div>
          <div class="toi-faq-a"><span class="toi-faq-badge a">A</span><span>${item.a}</span></div>
        </div>`
      ).join('')}</div>`);
    }

    if (quotes.length) {
      parts.push(`<div class="toi-quotes">${quotes.map(q =>
        `<div class="toi-quote"><p>${q}</p></div>`
      ).join('')}</div>`);
    }

    if (cta) {
      parts.push(`<span class="toi-cta">${cta}</span>`);
    }

    return `<div class="toi-overlay ${overlayClass || ''}">${parts.join('\n')}</div>`;
  },

  /* ========================================
     섹션별 렌더 함수
     ======================================== */

  hero_cover(section, ctx) {
    const bgClass = this.getBgClass(section, ctx);
    const toi = section.textOnImage || null;
    // 히어로는 overlayText가 있으면 그걸 사용
    let overlayContent;
    if (toi) {
      overlayContent = this.renderTextOnImage(toi, section, 'toi-hero');
    } else if (section.overlayText?.length) {
      const parts = section.overlayText.map((t, i) => {
        if (i === 0) return `<div class="toi-headline">${t}</div>`;
        if (i === 1) return `<div class="toi-product-name">${t}</div>`;
        return `<div class="toi-subheadline">${t}</div>`;
      }).join('');
      overlayContent = `<div class="toi-overlay toi-hero">${parts}</div>`;
    } else {
      overlayContent = this.renderTextOnImage(null, section, 'toi-hero');
    }

    const height = section.heightGuide || '1200~1600px';
    const parsedH = this.parseHeight(height);

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:${parsedH}">
        ${this.imgGuideBadge(section, ctx)}
        ${overlayContent}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  problem_section(section, ctx) {
    const bgClass = this.getBgClass(section, ctx);
    const toi = section.textOnImage || null;
    const parsedH = this.parseHeight(section.heightGuide || '900~1200px');

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:${parsedH}">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-problem')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  solution_section(section, ctx) {
    const bgClass = this.getBgClass(section, ctx);
    const toi = section.textOnImage || null;

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:450px">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-solution toi-center')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  benefit(section, ctx, index) {
    const bgClass = this.getBgClass(section, ctx);
    const toi = section.textOnImage || null;

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:400px">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-benefit')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  target_users(section, ctx) {
    const bgClass = this.getBgClass(section, ctx);
    const toi = section.textOnImage || null;

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:450px">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-center')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  comparison_table(section, ctx) {
    this._ctx = ctx; // 임시 참조 (테이블에서 productName 필요)
    const bgClass = this.getBgClass(section, ctx);
    const toi = section.textOnImage || null;

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:400px">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-center')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  product_detail(section, ctx) {
    const bgClass = this.getBgClass(section, ctx);
    const toi = section.textOnImage || null;

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:500px">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-center')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  usage_flow(section, ctx) {
    const bgClass = this.getBgClass(section, ctx);
    const toi = section.textOnImage || null;

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:400px">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-center')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  trust_section(section, ctx) {
    const bgClass = this.getBgClass(section, ctx);
    const toi = section.textOnImage || null;

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:350px">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-center')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  faq(section, ctx) {
    const bgClass = this.getBgClass(section, ctx);
    const toi = section.textOnImage || null;

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:400px">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-center')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  experience_message(section, ctx) {
    const bgClass = 'bg-light';
    const toi = section.textOnImage || null;

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:300px">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-center')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  final_cta(section, ctx) {
    const bgClass = this.getBgClass(section, ctx);
    const toi = section.textOnImage || null;

    const inner = `
      <div class="cut-preview ${bgClass}" style="min-height:350px">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-center')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  /* 범용 폴백 */
  generic(section, ctx) {
    const toi = section.textOnImage || null;

    const inner = `
      <div class="cut-preview bg-white" style="min-height:350px">
        ${this.imgGuideBadge(section, ctx)}
        ${this.renderTextOnImage(toi, section, 'toi-center')}
      </div>`;
    return this.cutCard(section, ctx, inner);
  },

  /* ===== 유틸 ===== */
  parseHeight(h) {
    if (!h) return '400px';
    const range = h.match(/(\d+)~(\d+)/);
    if (range) return Math.round((parseInt(range[1]) + parseInt(range[2])) / 2) + 'px';
    const single = h.match(/(\d+)/);
    if (single) return single[1] + 'px';
    return '400px';
  }
};
