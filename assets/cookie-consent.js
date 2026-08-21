(function(){
  var LANG = document.documentElement.lang || 'sk';
  var T = {
    sk: {
      text: 'Táto stránka používa cookies na zlepšenie tvojho zážitku a pre funkcie ako Instagram feed. Viac info v ',
      link: 'Ochrane osobných údajov',
      accept: 'Prijať',
      reject: 'Odmietnuť',
      igPrompt: 'Pre zobrazenie Instagram príspevkov prijmi cookies.',
      igAccept: 'Prijať cookies',
    },
    en: {
      text: 'This site uses cookies to improve your experience and for features like the Instagram feed. More in the ',
      link: 'Privacy Policy',
      accept: 'Accept',
      reject: 'Reject',
      igPrompt: 'Accept cookies to view the Instagram feed.',
      igAccept: 'Accept cookies',
    },
    de: {
      text: 'Diese Website verwendet Cookies, um dein Erlebnis zu verbessern und für Funktionen wie den Instagram-Feed. Mehr dazu in der ',
      link: 'Datenschutzerklärung',
      accept: 'Akzeptieren',
      reject: 'Ablehnen',
      igPrompt: 'Akzeptiere Cookies, um den Instagram-Feed zu sehen.',
      igAccept: 'Cookies akzeptieren',
    },
    hu: {
      text: 'Ez az oldal sütiket használ az élmény javítása és olyan funkciók érdekében, mint az Instagram-hírfolyam. Bővebben az ',
      link: 'Adatvédelmi tájékoztatóban',
      accept: 'Elfogadom',
      reject: 'Elutasítom',
      igPrompt: 'Fogadd el a sütiket az Instagram-hírfolyam megtekintéséhez.',
      igAccept: 'Sütik elfogadása',
    },
  };
  var t = T[LANG] || T.sk;

  function getConsent(){ try { return localStorage.getItem('cookieConsent'); } catch(e){ return null; } }
  function setConsent(v){ try { localStorage.setItem('cookieConsent', v); } catch(e){} }

  function injectElfsight(){
    var el = document.querySelector('[class*="elfsight-app-"]');
    if(!el) return;
    if(document.querySelector('script[src*="elfsightcdn.com"]')) return;
    var s = document.createElement('script');
    s.src = 'https://elfsightcdn.com/platform.js';
    s.async = true;
    document.body.appendChild(s);
    var placeholder = document.getElementById('ig-consent-placeholder');
    if(placeholder) placeholder.remove();
    el.style.display = '';
  }

  function showIgPlaceholder(){
    var el = document.querySelector('[class*="elfsight-app-"]');
    if(!el || document.getElementById('ig-consent-placeholder')) return;
    var div = document.createElement('div');
    div.id = 'ig-consent-placeholder';
    div.style.cssText = 'padding:40px 20px; text-align:center; background:var(--navy-panel); border:1px solid var(--navy-line); border-radius:6px;';
    div.innerHTML = '<p style="color:var(--gray); font-size:14px; margin-bottom:16px;">' + t.igPrompt + '</p><button class="btn btn-primary" id="ig-consent-accept-btn">' + t.igAccept + '</button>';
    el.style.display = 'none';
    el.parentElement.insertBefore(div, el);
    document.getElementById('ig-consent-accept-btn').onclick = function(){
      setConsent('accepted');
      div.remove();
      injectElfsight();
      hideBanner();
    };
  }

  function showBanner(){
    if(document.getElementById('cookie-banner')) return;
    var bar = document.createElement('div');
    bar.id = 'cookie-banner';
    bar.style.cssText = 'position:fixed; left:0; right:0; bottom:0; z-index:200; background:var(--navy-panel); border-top:1px solid var(--navy-line); padding:18px 24px; display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:16px; font-family:Inter,sans-serif;';
    bar.innerHTML =
      '<p style="color:var(--off-white); font-size:13px; line-height:1.5; margin:0; max-width:640px; flex:1; min-width:240px;">' + t.text + '<a href="/ochrana-osobnych-udajov.html" style="color:var(--orange); text-decoration:underline;">' + t.link + '</a></p>' +
      '<div style="display:flex; gap:10px; flex-shrink:0;">' +
        '<button class="btn btn-ghost" id="cookie-reject" style="padding:10px 18px; font-size:12px;">' + t.reject + '</button>' +
        '<button class="btn btn-primary" id="cookie-accept" style="padding:10px 18px; font-size:12px;">' + t.accept + '</button>' +
      '</div>';
    document.body.appendChild(bar);
    document.getElementById('cookie-accept').onclick = function(){
      setConsent('accepted');
      hideBanner();
      injectElfsight();
    };
    document.getElementById('cookie-reject').onclick = function(){
      setConsent('rejected');
      hideBanner();
    };
  }

  function hideBanner(){
    var bar = document.getElementById('cookie-banner');
    if(bar) bar.remove();
  }

  var consent = getConsent();
  if(consent === 'accepted'){
    injectElfsight();
  } else if(consent === 'rejected'){
    showIgPlaceholder();
  } else {
    showIgPlaceholder();
    showBanner();
  }
})();
