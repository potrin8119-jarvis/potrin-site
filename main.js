// 광고·게시물 링크에 붙은 꼬리표(utm_*)를 문의 폼에 실어 보낸다 — 어느 채널에서 와서 문의했는지 알기 위해서다
(function () {
  const q = new URLSearchParams(location.search);
  const form = document.getElementById('inquiry');
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
    const v = q.get(k) || sessionStorage.getItem(k);
    if (v) { sessionStorage.setItem(k, v); form.elements[k].value = v; }
  });

  // 문의를 받을 주소(구글 시트 연결)는 아직 없다 — 시안 단계에서는 보내지 않고 안내만 한다
  const ENDPOINT = '';

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
    fetch(ENDPOINT, { method: 'POST', body: new FormData(form) })
      .then(function () {
        form.reset();
        msg.hidden = false;
        msg.textContent = '보내 주셔서 감사합니다. 이틀 안에 연락드리겠습니다.';
      })
      .catch(function () {
        msg.hidden = false;
        msg.textContent = '전송에 실패했습니다. 잠시 뒤 다시 보내 주세요.';
      });
  });
})();
