// 한자 연습장 서비스 워커 — 처음 한 번 접속하면 이후 오프라인에서도 동작합니다.
// 파일을 수정해 다시 올릴 때는 아래 버전 숫자를 올려 주세요.
const V = 'hanja-v3';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  './apple-touch-icon.png', './data.json', './data-grade3.json', './data-idiom.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const isPage = r.mode === 'navigate' || r.url.endsWith('/index.html');
  if (isPage) {   // 화면 파일은 네트워크 우선, 실패하면 저장본
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match('./index.html')));
  } else {        // 데이터·아이콘은 저장본 우선
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
      const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })));
  }
});
