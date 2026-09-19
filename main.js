// 광고·게시물 링크에 붙은 꼬리표(utm_*)를 문의 폼에 실어 보낸다 — 어느 채널에서 와서 문의했는지 알기 위해서다
(function () {
  const q = new URLSearchParams(location.search);
  const form = document.getElementById('inquiry');
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
    const v = q.get(k) || sessionStorage.getItem(k);
    if (v) { sessionStorage.setItem(k, v); form.elements[k].value = v; }
  });

  // 문의는 구글 앱스 스크립트 웹 앱(「potrin.net 문의 폼」)이 받아 「potrin.net 문의함」 시트에 쌓고 메일로 알린다
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwXNIfXQgS3xAs-zdojAqDPqjii4X35rn30T5cnvk7U8VCmYvQqPG5ZCCUTr7rkYnby8g/exec';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const msg = document.getElementById('formMsg');
    if (!form.checkValidity()) {
      msg.hidden = false;
      msg.textContent = '성함·연락처·사업·문의 내용과 개인정보 동의를 확인해 주세요.';
      return;
    }
    if (!ENDPOINT) {
      msg.hidden = false;
      msg.textContent = '시안입니다 — 아직 문의가 전송되지 않습니다.';
      return;
    }
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    // 앱스 스크립트는 다른 주소라 응답을 읽을 수 없다(no-cors) — 보내기만 하고 실패는 네트워크 오류로만 판단한다
    fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(new FormData(form)) })
      .then(function () {
        btn.disabled = false;
        // 애널리틱스에 「문의 1건」만 알린다 — 성함·연락처 같은 개인정보는 보내지 않는다
        if (window.gtag) gtag('event', 'generate_lead', { business_type: form.elements.business.value || '미선택' });
        form.reset();
        msg.hidden = false;
        msg.textContent = '보내 주셔서 감사합니다. 이틀 안에 연락드리겠습니다.';
      })
      .catch(function () {
        btn.disabled = false;
        msg.hidden = false;
        msg.textContent = '전송에 실패했습니다. 잠시 뒤 다시 보내 주세요.';
      });
  });
})();
