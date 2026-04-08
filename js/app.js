/* ========================================
   상세페이지 자동 생성기 - 앱 로직
   ======================================== */

/* ---------- 동적 폼 항목 추가/삭제 ---------- */

function addSellingPoint() {
  const container = document.getElementById('sellingPoints');
  const item = document.createElement('div');
  item.className = 'dynamic-item';
  item.innerHTML = `
    <div class="form-grid">
      <div class="form-group">
        <label>포인트 제목</label>
        <input type="text" class="sp-title" placeholder="예: 48시간 연속 재생">
      </div>
      <div class="form-group">
        <label>설명</label>
        <input type="text" class="sp-desc" placeholder="예: 한번 충전으로 이틀간 사용 가능">
      </div>
      <div class="form-group">
        <label>아이콘 키워드</label>
        <input type="text" class="sp-icon" placeholder="예: 배터리, 시간, 충전">
      </div>
    </div>
    <button type="button" class="btn-remove" onclick="removeItem(this)">삭제</button>`;
  container.appendChild(item);
}

function addFeature() {
  const container = document.getElementById('features');
  const item = document.createElement('div');
  item.className = 'dynamic-item feature-item';
  item.innerHTML = `
    <div class="form-grid">
      <div class="form-group full">
        <label>섹션 제목</label>
        <input type="text" class="feat-title" placeholder="예: 프리미엄 노이즈 캔슬링">
      </div>
      <div class="form-group full">
        <label>섹션 설명</label>
        <textarea class="feat-desc" rows="2" placeholder="예: ANC 3.0 기술로 외부 소음을 99% 차단합니다."></textarea>
      </div>
      <div class="form-group">
        <label>이미지 가이드</label>
        <input type="text" class="feat-img" placeholder="예: 이어폰 착용 후 지하철에서 음악 듣는 모습">
      </div>
      <div class="form-group">
        <label>배경 스타일</label>
        <select class="feat-bg">
          <option value="light">밝은 배경</option>
          <option value="dark">어두운 배경</option>
          <option value="gradient">그라데이션</option>
          <option value="color">컬러 배경</option>
        </select>
      </div>
    </div>
    <button type="button" class="btn-remove" onclick="removeItem(this)">삭제</button>`;
  container.appendChild(item);
}

function addSpec() {
  const container = document.getElementById('specs');
  const item = document.createElement('div');
  item.className = 'dynamic-item spec-item';
  item.innerHTML = `
    <div class="form-grid two-col">
      <div class="form-group">
        <label>항목</label>
        <input type="text" class="spec-key" placeholder="예: 무게">
      </div>
      <div class="form-group">
        <label>내용</label>
        <input type="text" class="spec-value" placeholder="예: 5.4g">
      </div>
    </div>
    <button type="button" class="btn-remove" onclick="removeItem(this)">삭제</button>`;
  container.appendChild(item);
}

function addReview() {
  const container = document.getElementById('reviews');
  const item = document.createElement('div');
  item.className = 'dynamic-item review-item';
  item.innerHTML = `
    <div class="form-grid">
      <div class="form-group">
        <label>작성자</label>
        <input type="text" class="rev-author" placeholder="예: 김**">
      </div>
      <div class="form-group">
        <label>별점 (1~5)</label>
        <input type="number" class="rev-rating" min="1" max="5" value="5">
      </div>
      <div class="form-group full">
        <label>리뷰 내용</label>
        <textarea class="rev-content" rows="2" placeholder="예: 음질이 정말 좋고 배터리가 오래가서 매일 사용합니다!"></textarea>
      </div>
    </div>
    <button type="button" class="btn-remove" onclick="removeItem(this)">삭제</button>`;
  container.appendChild(item);
}

function removeItem(btn) {
  btn.closest('.dynamic-item').remove();
}

/* ---------- 폼 데이터 수집 ---------- */

function collectFormData() {
  // 기본 정보
  const data = {
    productName: document.getElementById('productName').value.trim(),
    category: document.getElementById('productCategory').value,
    priceInfo: document.getElementById('priceInfo').value.trim(),
    shortDesc: document.getElementById('shortDesc').value.trim(),
    productDesc: document.getElementById('productDesc').value.trim(),
    targetAudience: document.getElementById('targetAudience').value.trim(),
    brandName: document.getElementById('brandName').value.trim(),
    brandStory: document.getElementById('brandStory').value.trim(),
    sellingPoints: [],
    features: [],
    specs: [],
    reviews: []
  };

  // 셀링포인트
  document.querySelectorAll('#sellingPoints .dynamic-item').forEach(item => {
    const title = item.querySelector('.sp-title').value.trim();
    const desc = item.querySelector('.sp-desc').value.trim();
    if (title) {
      data.sellingPoints.push({ title, desc, icon: item.querySelector('.sp-icon').value.trim() });
    }
  });

  // 특징
  document.querySelectorAll('#features .dynamic-item').forEach(item => {
    const title = item.querySelector('.feat-title').value.trim();
    const desc = item.querySelector('.feat-desc').value.trim();
    if (title) {
      data.features.push({
        title,
        desc,
        imgGuide: item.querySelector('.feat-img').value.trim(),
        bg: item.querySelector('.feat-bg').value
      });
    }
  });

  // 스펙
  document.querySelectorAll('#specs .dynamic-item').forEach(item => {
    const key = item.querySelector('.spec-key').value.trim();
    const value = item.querySelector('.spec-value').value.trim();
    if (key) {
      data.specs.push({ key, value });
    }
  });

  // 리뷰
  document.querySelectorAll('#reviews .dynamic-item').forEach(item => {
    const author = item.querySelector('.rev-author').value.trim();
    const content = item.querySelector('.rev-content').value.trim();
    if (content) {
      data.reviews.push({
        author: author || '익명',
        rating: parseInt(item.querySelector('.rev-rating').value) || 5,
        content
      });
    }
  });

  return data;
}

function collectOptions() {
  return {
    colorTheme: document.getElementById('colorTheme').value,
    layoutStyle: document.getElementById('layoutStyle').value,
    pageWidth: document.getElementById('pageWidth').value,
    incHero: document.getElementById('incHero').checked,
    incSelling: document.getElementById('incSelling').checked,
    incFeatures: document.getElementById('incFeatures').checked,
    incSpecs: document.getElementById('incSpecs').checked,
    incReviews: document.getElementById('incReviews').checked,
    incBrand: document.getElementById('incBrand').checked,
    incCta: document.getElementById('incCta').checked
  };
}

/* ---------- 페이지 생성 ---------- */

let currentData = null;
let currentOptions = null;

function generatePage() {
  const data = collectFormData();

  if (!data.productName) {
    alert('상품명을 입력해주세요.');
    document.getElementById('productName').focus();
    return;
  }
  if (!data.shortDesc) {
    alert('한줄 소개를 입력해주세요.');
    document.getElementById('shortDesc').focus();
    return;
  }

  const options = collectOptions();
  currentData = data;
  currentOptions = options;

  const themeClass = `theme-${options.colorTheme}`;
  const layoutClass = `layout-${options.layoutStyle}`;
  const pageWidth = options.pageWidth + 'px';

  const pageEl = document.getElementById('generated-page');
  pageEl.className = `generated-page ${themeClass} ${layoutClass}`;
  pageEl.style.maxWidth = pageWidth;
  pageEl.innerHTML = Generator.generate(data, options);

  // 화면 전환
  document.getElementById('app-input').style.display = 'none';
  document.getElementById('app-result').style.display = 'block';
  window.scrollTo(0, 0);
}

/* ---------- 화면 전환 ---------- */

function goBack() {
  document.getElementById('app-result').style.display = 'none';
  document.getElementById('app-input').style.display = 'block';
}

/* ---------- HTML 내보내기 ---------- */

function exportHTML() {
  if (!currentData || !currentOptions) return;

  const html = Generator.generateStandalone(currentData, currentOptions);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentData.productName}_상세페이지.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- 데모 데이터 ---------- */

function loadDemo() {
  document.getElementById('productName').value = '프리미엄 무선 블루투스 이어폰 AirSound Pro';
  document.getElementById('productCategory').value = 'electronics';
  document.getElementById('priceInfo').value = '139,000원 → 89,000원 (36% 할인)';
  document.getElementById('shortDesc').value = '하루종일 편안한 착용감, 프리미엄 사운드를 경험하세요';
  document.getElementById('productDesc').value = 'AirSound Pro는 최신 블루투스 5.3 기술과 하이브리드 ANC를 탑재한 프리미엄 무선 이어폰입니다. 11mm 커스텀 드라이버가 선사하는 풍부한 사운드와 48시간 배터리로 음악에 몰입하세요.';
  document.getElementById('targetAudience').value = '20-30대 음악을 즐기는 직장인, 통근러';
  document.getElementById('brandName').value = 'AirSound';
  document.getElementById('brandStory').value = 'AirSound는 2019년 설립 이래 "일상에 프리미엄 사운드를"이라는 비전 아래, 합리적인 가격에 최고의 음질을 제공하기 위해 노력하고 있습니다. 100만 고객이 선택한 오디오 브랜드입니다.';

  // 셀링포인트
  const spContainer = document.getElementById('sellingPoints');
  spContainer.innerHTML = '';
  const spData = [
    { title: '48시간 연속 재생', desc: '한번 충전으로 이틀간 음악을 즐기세요', icon: '배터리' },
    { title: '하이브리드 ANC', desc: '외부 소음 99% 차단으로 몰입감 극대화', icon: '노이즈캔슬링' },
    { title: 'IPX5 방수', desc: '운동 중 땀이나 갑작스러운 비에도 안심', icon: '방수' },
    { title: '초경량 5.4g', desc: '하루종일 착용해도 귀가 편안합니다', icon: '깃털' }
  ];
  spData.forEach(sp => {
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.innerHTML = `
      <div class="form-grid">
        <div class="form-group"><label>포인트 제목</label><input type="text" class="sp-title" value="${sp.title}"></div>
        <div class="form-group"><label>설명</label><input type="text" class="sp-desc" value="${sp.desc}"></div>
        <div class="form-group"><label>아이콘 키워드</label><input type="text" class="sp-icon" value="${sp.icon}"></div>
      </div>
      <button type="button" class="btn-remove" onclick="removeItem(this)">삭제</button>`;
    spContainer.appendChild(item);
  });

  // 특징
  const featContainer = document.getElementById('features');
  featContainer.innerHTML = '';
  const featData = [
    { title: '프리미엄 노이즈 캔슬링', desc: 'ANC 3.0 하이브리드 기술로 외부 소음을 99% 차단합니다. 지하철에서도, 카페에서도 오직 음악에만 집중하세요. 주변 소리를 들어야 할 때는 투명 모드로 전환할 수 있습니다.', imgGuide: '이어폰을 착용한 채 지하철에서 편안하게 음악을 듣고 있는 직장인 모습', bg: 'light' },
    { title: '48시간 끊김 없는 음악', desc: '업계 최장 수준의 48시간 배터리 수명. 케이스 포함 시 최대 120시간까지 사용 가능합니다. 10분 급속 충전으로 3시간 재생이 가능하여 급할 때도 걱정 없습니다.', imgGuide: '충전 케이스에서 이어폰을 꺼내는 모습, 배터리 잔량 표시 LED가 보이는 클로즈업', bg: 'dark' },
    { title: '11mm 커스텀 드라이버', desc: '자체 개발한 11mm 다이나믹 드라이버가 깊고 풍부한 저음부터 선명한 고음까지 균형 잡힌 사운드를 전달합니다. Hi-Res Audio 인증으로 원음에 가까운 음질을 경험하세요.', imgGuide: '이어폰 내부 드라이버 단면도 또는 음파가 퍼져나가는 그래픽 이미지', bg: 'gradient' },
    { title: '하루종일 편안한 착용감', desc: '인체공학적으로 설계된 이어팁과 5.4g 초경량 본체로 오랜 시간 착용해도 귀가 아프지 않습니다. S/M/L 3가지 크기의 실리콘 이어팁과 폼팁이 기본 제공됩니다.', imgGuide: '다양한 귀 모양에 맞는 이어팁 구성품이 정렬된 모습, 깔끔한 제품 플랫레이', bg: 'color' }
  ];
  featData.forEach(f => {
    const item = document.createElement('div');
    item.className = 'dynamic-item feature-item';
    item.innerHTML = `
      <div class="form-grid">
        <div class="form-group full"><label>섹션 제목</label><input type="text" class="feat-title" value="${f.title}"></div>
        <div class="form-group full"><label>섹션 설명</label><textarea class="feat-desc" rows="2">${f.desc}</textarea></div>
        <div class="form-group"><label>이미지 가이드</label><input type="text" class="feat-img" value="${f.imgGuide}"></div>
        <div class="form-group"><label>배경 스타일</label><select class="feat-bg">
          <option value="light"${f.bg === 'light' ? ' selected' : ''}>밝은 배경</option>
          <option value="dark"${f.bg === 'dark' ? ' selected' : ''}>어두운 배경</option>
          <option value="gradient"${f.bg === 'gradient' ? ' selected' : ''}>그라데이션</option>
          <option value="color"${f.bg === 'color' ? ' selected' : ''}>컬러 배경</option>
        </select></div>
      </div>
      <button type="button" class="btn-remove" onclick="removeItem(this)">삭제</button>`;
    featContainer.appendChild(item);
  });

  // 스펙
  const specContainer = document.getElementById('specs');
  specContainer.innerHTML = '';
  const specData = [
    { key: '드라이버', value: '11mm 커스텀 다이나믹 드라이버' },
    { key: '블루투스', value: 'Bluetooth 5.3' },
    { key: '코덱', value: 'AAC, SBC, LDAC' },
    { key: '배터리', value: '이어버드 48시간 / 케이스 포함 120시간' },
    { key: '충전', value: 'USB-C 급속충전 (10분 충전 = 3시간 재생)' },
    { key: '방수등급', value: 'IPX5' },
    { key: '무게', value: '5.4g (이어버드 1개 기준)' },
    { key: '노이즈 캔슬링', value: 'ANC 3.0 하이브리드 (최대 -40dB)' }
  ];
  specData.forEach(s => {
    const item = document.createElement('div');
    item.className = 'dynamic-item spec-item';
    item.innerHTML = `
      <div class="form-grid two-col">
        <div class="form-group"><label>항목</label><input type="text" class="spec-key" value="${s.key}"></div>
        <div class="form-group"><label>내용</label><input type="text" class="spec-value" value="${s.value}"></div>
      </div>
      <button type="button" class="btn-remove" onclick="removeItem(this)">삭제</button>`;
    specContainer.appendChild(item);
  });

  // 리뷰
  const revContainer = document.getElementById('reviews');
  revContainer.innerHTML = '';
  const revData = [
    { author: '김**', rating: 5, content: '음질이 정말 좋고 배터리가 오래가서 출퇴근길에 매일 사용하고 있어요! 노이즈 캔슬링도 지하철에서 확실히 효과 있습니다.' },
    { author: '이**', rating: 5, content: '이 가격에 이 정도 퀄리티라니 놀랍습니다. 에어팟 프로 쓰다가 갈아탔는데 전혀 아쉬움이 없어요.' },
    { author: '박**', rating: 4, content: '착용감이 정말 가볍고 편해요. 운동할 때도 안 빠지고 방수도 되니까 안심하고 쓸 수 있습니다. 앱 연동도 잘 돼요.' }
  ];
  revData.forEach(r => {
    const item = document.createElement('div');
    item.className = 'dynamic-item review-item';
    item.innerHTML = `
      <div class="form-grid">
        <div class="form-group"><label>작성자</label><input type="text" class="rev-author" value="${r.author}"></div>
        <div class="form-group"><label>별점 (1~5)</label><input type="number" class="rev-rating" min="1" max="5" value="${r.rating}"></div>
        <div class="form-group full"><label>리뷰 내용</label><textarea class="rev-content" rows="2">${r.content}</textarea></div>
      </div>
      <button type="button" class="btn-remove" onclick="removeItem(this)">삭제</button>`;
    revContainer.appendChild(item);
  });

  // 디자인 옵션
  document.getElementById('colorTheme').value = 'cool';
  document.getElementById('layoutStyle').value = 'modern';
  document.getElementById('pageWidth').value = '780';

  alert('데모 데이터가 로드되었습니다! "상세페이지 생성하기" 버튼을 눌러주세요.');
}
