(function () {
  document.documentElement.classList.add('js');

  // 화면에 들어오는 구획을 한 번만 드러낸다(스크롤 이벤트 대신 IntersectionObserver)
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // 광고·게시물 링크에 붙은 꼬리표(utm_*)를 문의 폼에 실어 보낸다 - 어느 채널에서 와서 문의했는지 알기 위해서다
  const q = new URLSearchParams(location.search);
  const form = document.getElementById('inquiry');
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
    let v = q.get(k);
    try { v = v || sessionStorage.getItem(k); if (v) sessionStorage.setItem(k, v); } catch (e) {}
    if (v) form.elements[k].value = v;
  });

  // 문의는 구글 앱스 스크립트 웹 앱(「potrin.net 문의 폼」)이 받아 「potrin.net 문의함」 시트에 쌓고 메일로 알린다
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwXNIfXQgS3xAs-zdojAqDPqjii4X35rn30T5cnvk7U8VCmYvQqPG5ZCCUTr7rkYnby8g/exec';
  const msg = document.getElementById('formMsg');
  const btn = form.querySelector('button[type=submit]');

  function say(text, isError) {
    msg.hidden = false;
    msg.textContent = text;
    msg.classList.toggle('is-error', !!isError);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      say('성함, 연락처, 하시는 사업, 문의 내용과 개인정보 동의를 확인해 주세요.', true);
      const bad = form.querySelector(':invalid');
      if (bad) bad.focus();
      return;
    }
    btn.disabled = true;
    btn.textContent = '보내는 중…';
    // 앱스 스크립트는 다른 주소라 응답을 읽을 수 없다(no-cors) - 보내기만 하고 실패는 네트워크 오류로만 판단한다
    fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(new FormData(form)) })
      .then(function () {
        // 애널리틱스에 「문의 1건」만 알린다 - 성함·연락처 같은 개인정보는 보내지 않는다
        if (window.gtag) gtag('event', 'generate_lead', { business_type: form.elements.business.value || '미선택' });
        form.reset();
        say('보내 주셔서 감사합니다. 이틀 안에 연락드리겠습니다.');
      })
      .catch(function () {
        say('전송에 실패했습니다. 잠시 뒤 다시 보내 주시거나 potrin@naver.com 으로 보내 주세요.', true);
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = '보내기';
      });
  });
})();
