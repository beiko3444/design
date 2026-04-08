/* ========================================
   DetailGen v2 - 앱 UI 로직
   ======================================== */

let currentPlanData = null;
let currentOptions = null;

/* ===== JSON 실시간 검증 ===== */
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('jsonInput');
  const status = document.getElementById('jsonStatus');

  textarea.addEventListener('input', () => {
    const val = textarea.value.trim();
    if (!val) { status.style.display = 'none'; return; }
    try {
      const parsed = JSON.parse(val);
      const sc = parsed.sections?.length || 0;
      const pn = parsed.product?.name || '?';
      const hasCuts = parsed.sections?.some(s => s.cuts?.length) ? ' / cuts[] 포함' : '';
      const hasToi = parsed.sections?.some(s => s.textOnImage) ? ' / textOnImage 포함' : '';
      status.className = 'json-status valid';
      status.textContent = `JSON 유효 — ${pn} / 섹션 ${sc}개${hasCuts}${hasToi}`;
    } catch (e) {
      status.className = 'json-status invalid';
      status.textContent = `JSON 오류: ${e.message}`;
    }
  });
});

/* ===== 메인 생성 ===== */
function generateFromJSON() {
  const textarea = document.getElementById('jsonInput');
  const val = textarea.value.trim();

  if (!val) { alert('기획서 JSON을 붙여넣어 주세요.'); textarea.focus(); return; }

  let planData;
  try { planData = JSON.parse(val); } catch (e) { alert('JSON 형식 오류:\n' + e.message); return; }
  if (!planData.sections?.length) { alert('sections 배열이 비어 있습니다.'); return; }

  const options = {
    pageWidth: document.getElementById('pageWidth').value,
    viewMode: document.getElementById('viewMode').value
  };

  currentPlanData = planData;
  currentOptions = options;

  renderPage(planData, options);

  // 화면 전환
  document.getElementById('app-input').style.display = 'none';
  document.getElementById('app-result').style.display = 'block';
  window.scrollTo(0, 0);

  // 모드 버튼 동기화
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === options.viewMode);
  });
}

/* ===== 페이지 렌더링 ===== */
function renderPage(planData, options) {
  const pageEl = document.getElementById('generated-page');
  const wrapper = document.getElementById('resultWrapper');

  pageEl.style.maxWidth = options.pageWidth + 'px';
  pageEl.innerHTML = Generator.generate(planData, options);

  // 모드별 클래스 토글
  wrapper.className = 'result-wrapper';
  pageEl.className = 'generated-page';

  if (options.viewMode === 'mobile') {
    wrapper.classList.add('mobile-mode');
  }
  if (options.viewMode === 'designer') {
    pageEl.classList.add('designer-mode');
  }

  const title = planData.product?.name || '상세페이지';
  const modeLabel = { preview: '컷 미리보기', designer: '디자이너', mobile: '모바일' };
  document.getElementById('resultTitle').textContent = `${title} — ${modeLabel[options.viewMode] || ''}`;
}

/* ===== 모드 전환 ===== */
function switchMode(mode) {
  if (!currentPlanData) return;
  currentOptions.viewMode = mode;

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  renderPage(currentPlanData, currentOptions);
}

/* ===== 돌아가기 ===== */
function goBack() {
  document.getElementById('app-result').style.display = 'none';
  document.getElementById('app-input').style.display = 'block';
  // 검증 패널 닫기
  document.getElementById('validationPanel').style.display = 'none';
  // 내보내기 메뉴 닫기
  document.getElementById('exportMenu').classList.remove('open');
}

/* ===== 카피 검증 ===== */
function toggleValidation() {
  const panel = document.getElementById('validationPanel');
  if (panel.style.display === 'none') {
    if (!currentPlanData) return;
    const results = Generator.validateCopy(currentPlanData);
    renderValidation(results);
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
}

function renderValidation(results) {
  const body = document.getElementById('validationBody');
  const passCount = results.filter(r => r.type === 'pass').length;
  const warnCount = results.filter(r => r.type === 'warn').length;
  const failCount = results.filter(r => r.type === 'fail').length;

  let html = `
    <div class="val-summary">
      <span class="pass-count">통과 ${passCount}</span>
      <span class="warn-count">주의 ${warnCount}</span>
      <span class="fail-count">실패 ${failCount}</span>
    </div>`;

  // 실패 먼저, 경고, 통과 순
  const sorted = [...results].sort((a, b) => {
    const order = { fail: 0, warn: 1, pass: 2 };
    return (order[a.type] ?? 3) - (order[b.type] ?? 3);
  });

  html += sorted.map(r => `
    <div class="val-item">
      <span class="val-badge ${r.type}">${r.type === 'pass' ? '통과' : r.type === 'warn' ? '주의' : '실패'}</span>
      <span class="val-module">${r.module}</span>
      <span class="val-msg">${r.msg}</span>
    </div>`
  ).join('');

  body.innerHTML = html;
}

/* ===== 내보내기 드롭다운 ===== */
function toggleExportMenu() {
  document.getElementById('exportMenu').classList.toggle('open');
}

// 클릭 밖 닫기
document.addEventListener('click', (e) => {
  const dropdown = document.querySelector('.export-dropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    document.getElementById('exportMenu').classList.remove('open');
  }
});

/* ===== 내보내기 함수들 ===== */
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type: type + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  document.getElementById('exportMenu').classList.remove('open');
}

function exportHTML() {
  if (!currentPlanData) return;
  const html = Generator.generateStandaloneHTML(currentPlanData, currentOptions);
  const name = currentPlanData.product?.name || '상세페이지';
  downloadFile(html, `${name}_상세페이지.html`, 'text/html');
}

function exportDesignerDoc() {
  if (!currentPlanData) return;
  const md = Generator.generateDesignerDoc(currentPlanData);
  const name = currentPlanData.product?.name || '상세페이지';
  downloadFile(md, `${name}_디자이너전달용.md`, 'text/markdown');
}

function exportPhotoGuide() {
  if (!currentPlanData) return;
  const md = Generator.generatePhotoGuide(currentPlanData);
  const name = currentPlanData.product?.name || '상세페이지';
  downloadFile(md, `${name}_촬영가이드.md`, 'text/markdown');
}

function exportAIPrompts() {
  if (!currentPlanData) return;
  const md = Generator.generateAIPromptSheet(currentPlanData);
  const name = currentPlanData.product?.name || '상세페이지';
  downloadFile(md, `${name}_AI프롬프트.md`, 'text/markdown');
}

/* ========================================
   퀵베이트 데모 데이터
   ======================================== */

function loadQuickBaitDemo() {
  const demo = {
    "product": {
      "brand": "퀵베이트",
      "name": "퀵베이트",
      "type": "동결건조 갯지렁이 기반 간편 미끼",
      "concept": "출조 준비의 번거로움을 줄이고 빠르게 사용할 수 있는 간편 미끼 솔루션"
    },
    "pageGoal": {
      "primary": "생미끼의 불편함을 대체할 수 있는 간편한 선택지로 인식시키기",
      "secondary": "보관 편의성, 휴대성, 빠른 사용성 중심으로 구매 전환 유도",
      "tone": "실전형, 간결함, 신뢰감, 과장 적음"
    },
    "brandSystem": {
      "brandKeywords": ["간편함", "실전성", "휴대성", "빠른 준비"],
      "brandVoice": {
        "tone": "실전형, 간결함, 신뢰감",
        "style": ["짧은 문장", "과장 없는 장점 설명", "현장 중심 표현", "모바일 친화적 카피"]
      }
    },
    "visualDirection": {
      "overallMood": "실사용 기반의 실사형 상세페이지",
      "photoStyle": ["깔끔한 제품 컷", "현장감 있는 사용 컷", "정보 전달 중심 구성"],
      "lighting": ["제품컷은 선명하고 또렷하게", "현장컷은 자연광 느낌", "비교컷은 대비 강하게"],
      "backgroundUsage": {
        "hero": "딥네이비 또는 블랙",
        "benefit": "화이트 또는 라이트그레이",
        "usage": "실제 현장 배경",
        "cta": "밝은 단색 배경"
      }
    },
    "sections": [
      {
        "moduleId": "M01",
        "name": "hero_cover",
        "headline": "출조 준비를 더 빠르고 간편하게",
        "subheadline": "보관과 휴대의 번거로움을 줄인 간편 미끼 솔루션",
        "productName": "퀵베이트",
        "heightGuide": "1200~1600px",
        "layout": "제품 중심 세로형 커버",
        "imageConcept": {
          "summary": "메인 커버 이미지",
          "detailedDescription": "어두운 네이비 또는 블랙 배경 위 중앙에 퀵베이트 패키지를 배치하고, 패키지 앞쪽에 내용물 일부를 자연스럽게 펼쳐놓는다. 낚시 채비 소품은 은은하게 배치하여 현장감을 더하되 제품을 방해하지 않게 한다."
        },
        "overlayText": ["출조 준비를 더 빠르고 간편하게", "퀵베이트", "보관과 휴대의 번거로움을 줄인 간편 미끼 솔루션"]
      },
      {
        "moduleId": "M02",
        "name": "problem_section",
        "headline": "미끼 준비, 아직도 번거로우신가요?",
        "body": "보관은 어렵고 준비는 번거롭고, 현장에서는 더 바빠집니다.",
        "heightGuide": "900~1200px",
        "layout": "비교형 또는 상하 분할형",
        "imageConcept": {
          "summary": "문제 공감 비교 이미지",
          "detailedDescription": "좌측에는 번거롭고 어수선한 생미끼 준비 상황을 보여주고, 우측에는 깔끔하게 정리된 퀵베이트와 출조 준비 장면을 배치한다."
        }
      },
      {
        "moduleId": "M03",
        "name": "solution_section",
        "headline": "더 간편한 출조 준비의 시작",
        "body": "퀵베이트는 복잡한 준비 부담을 줄이기 위해 기획된 간편 미끼입니다.",
        "imageConcept": {
          "summary": "해결 제안 이미지",
          "detailedDescription": "깨끗한 배경 위에 퀵베이트 제품과 간단한 낚시 준비 장면을 구성한다."
        }
      },
      {
        "moduleId": "M04",
        "name": "benefit_storage",
        "headline": "보관 부담은 줄이고",
        "body": "복잡한 관리 스트레스를 덜고 더 깔끔하게 보관할 수 있습니다.",
        "imageConcept": {
          "summary": "보관 장점 이미지",
          "detailedDescription": "정리된 수납공간이나 가방 안에 퀵베이트가 깔끔하게 놓여 있는 장면."
        }
      },
      {
        "moduleId": "M05",
        "name": "benefit_portable",
        "headline": "휴대는 더 가볍게",
        "body": "출조와 이동, 현장 활용까지 부담 없이 챙길 수 있습니다.",
        "imageConcept": {
          "summary": "휴대성 이미지",
          "detailedDescription": "낚시 가방, 태클박스 안에 퀵베이트가 다른 장비와 함께 정리되어 있는 장면."
        }
      },
      {
        "moduleId": "M06",
        "name": "benefit_fast",
        "headline": "준비 시간은 더 짧게",
        "body": "필요한 순간 빠르게 꺼내 사용할 수 있어 낚시에 더 집중할 수 있습니다.",
        "imageConcept": {
          "summary": "빠른 준비 이미지",
          "detailedDescription": "현장에서 손으로 퀵베이트를 꺼내는 장면, 채비와 함께 곧바로 사용할 수 있는 흐름."
        }
      },
      {
        "moduleId": "M07",
        "name": "benefit_field",
        "headline": "현장 사용은 더 실전적으로",
        "body": "출조 현장에서 간편성과 사용 편의성을 높인 실전형 미끼입니다.",
        "imageConcept": {
          "summary": "현장 사용 이미지",
          "detailedDescription": "실제 낚시터 배경과 채비 주변에서 퀵베이트를 사용하는 장면."
        }
      },
      {
        "moduleId": "M08",
        "name": "target_users",
        "headline": "이런 분께 추천합니다",
        "items": ["생미끼 관리가 번거로운 분", "간편하게 출조 준비하고 싶은 분", "휴대와 보관이 쉬운 미끼를 찾는 분", "현장에서 빠르게 사용하고 싶은 분"],
        "imageConcept": {
          "summary": "추천 대상 이미지",
          "detailedDescription": "4분할 카드형 또는 상황형 이미지로 각각의 사용 상황을 직관적으로 보여준다."
        }
      },
      {
        "moduleId": "M09",
        "name": "comparison_table",
        "headline": "왜 퀵베이트인가?",
        "rows": ["보관 편의성", "휴대성", "준비 시간", "현장 사용성"],
        "imageConcept": {
          "summary": "비교 인포그래픽",
          "detailedDescription": "생미끼와 퀵베이트를 비교하는 인포그래픽 구조."
        }
      },
      {
        "moduleId": "M10",
        "name": "product_detail",
        "headline": "제품 디테일 확인",
        "body": "패키지와 내용물, 형태를 한눈에 확인할 수 있도록 구성합니다.",
        "imageConcept": {
          "summary": "디테일 컷",
          "detailedDescription": "패키지 정면컷, 내용물 확대컷, 질감 디테일컷을 정리된 구성으로 보여준다."
        }
      },
      {
        "moduleId": "M11",
        "name": "usage_flow",
        "headline": "사용도 간단하게",
        "steps": ["제품을 꺼냅니다", "낚시 준비를 합니다", "채비에 맞게 사용합니다", "현장에서 바로 활용합니다"],
        "imageConcept": {
          "summary": "사용 흐름 가이드",
          "detailedDescription": "4단계 사용 흐름을 순서대로 보여주는 가이드형 이미지."
        }
      },
      {
        "moduleId": "M12",
        "name": "trust_section",
        "headline": "보이는 것부터 믿을 수 있게",
        "points": ["깔끔한 패키지 구성", "직관적인 제품 확인", "현장에서 바로 꺼내 쓰기 쉬운 형태"],
        "imageConcept": {
          "summary": "신뢰 이미지",
          "detailedDescription": "정갈한 제품 구성컷과 패키지 컷을 밝은 배경 위에 배치."
        }
      },
      {
        "moduleId": "M13",
        "name": "faq",
        "headline": "자주 묻는 질문",
        "qa": [
          { "q": "퀵베이트는 어떤 제품인가요?", "a": "출조 준비의 번거로움을 줄이기 위해 기획된 간편 미끼입니다." },
          { "q": "보관은 어떻게 하나요?", "a": "직사광선과 습기를 피해 보관하는 것을 권장합니다." },
          { "q": "누가 사용하면 좋나요?", "a": "간편한 보관과 휴대를 원하는 낚시인에게 적합합니다." }
        ]
      },
      {
        "moduleId": "M14",
        "name": "experience_message",
        "headline": "이런 점이 특히 편했습니다",
        "quotes": ["보관 부담이 줄어서 훨씬 편했습니다.", "출조 준비 시간이 짧아졌습니다.", "휴대가 쉬워서 현장에서 부담이 적었습니다."]
      },
      {
        "moduleId": "M15",
        "name": "final_cta",
        "headline": "간편한 준비가 실전의 차이를 만듭니다",
        "productName": "퀵베이트",
        "body": "더 가볍고 더 간편한 출조를 시작해보세요.",
        "cta": "퀵베이트 지금 확인하기",
        "imageConcept": {
          "summary": "최종 CTA 이미지",
          "detailedDescription": "밝고 단정한 배경 위에 퀵베이트 제품을 중앙에 두고 핵심 메시지와 CTA를 정리한 마감 배너형 구성."
        }
      }
    ],
    "smartstore_mobile_flow": [
      "메인 비주얼", "문제 공감", "해결 제안",
      "핵심 장점 1", "핵심 장점 2", "핵심 장점 3", "핵심 장점 4",
      "추천 대상", "비교 섹션", "실사용 장면",
      "제품 디테일", "사용 가이드", "신뢰 포인트",
      "FAQ", "체감 메시지", "최종 CTA"
    ],
    "fileNamingGuide": [
      "01_hero_quickbait.jpg", "02_problem_compare.jpg", "03_solution_quickbait.jpg",
      "04_benefit_storage.jpg", "05_benefit_portable.jpg", "06_benefit_fast.jpg",
      "07_benefit_field.jpg", "08_target_users.jpg", "09_comparison_table.jpg",
      "10_product_detail.jpg", "11_usage_flow.jpg", "12_trust_section.jpg",
      "13_faq.jpg", "14_experience_message.jpg", "15_final_cta.jpg"
    ],
    "image_asset_checklist": [
      "패키지 정면컷", "패키지 45도컷", "내용물 확대컷", "질감 클로즈업컷",
      "손에 들고 있는 컷", "태클박스 또는 가방 수납컷", "채비 근처 배치컷",
      "실제 출조 현장컷", "생미끼 대비 비교 연출컷", "패키지 진열컷"
    ],
    "image_generation_prompt_examples": [
      "어두운 네이비 배경 위에 퀵베이트 패키지가 중앙에 놓여 있고, 앞쪽에는 내용물이 자연스럽게 펼쳐져 있는 고급스러운 실사형 제품 메인 이미지, 모바일 상세페이지 세로 비율",
      "좌측은 번거로운 생미끼 준비 상황, 우측은 깔끔하게 정리된 퀵베이트 제품과 출조 준비 장면이 대비되는 이미지, 모바일 세로형",
      "낚시 가방과 태클박스에 퀵베이트가 자연스럽게 들어가 있는 실사형 상세페이지 이미지",
      "낚시터 현장에서 실제 채비와 함께 퀵베이트를 사용하는 느낌의 실사형 이미지"
    ],
    "copyRules": {
      "headlineRule": "한 문장 18자 내외 우선",
      "bodyRule": "2문장 이내, 한 문장 짧게",
      "ctaRule": "행동 유도 문장으로 마무리",
      "forbiddenExpressions": ["무조건", "100% 효과", "압도적 보장", "검증 없는 최상급 표현"]
    }
  };

  document.getElementById('jsonInput').value = JSON.stringify(demo, null, 2);
  document.getElementById('jsonInput').dispatchEvent(new Event('input'));
}
