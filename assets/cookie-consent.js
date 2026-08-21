(function(){
  var LANG = document.documentElement.lang || 'sk';
  var T = {
    sk: {
      text: 'Táto stránka používa cookies na zlepšenie tvojho zážitku. Viac info v ',
      link: 'Ochrane osobných údajov',
      accept: 'Prijať',
      reject: 'Odmietnuť',
    },
    en: {
      text: 'This site uses cookies to improve your experience. More in the ',
      link: 'Privacy Policy',
      accept: 'Accept',
      reject: 'Reject',
    },
    de: {
      text: 'Diese Website verwendet Cookies, um dein Erlebnis zu verbessern. Mehr dazu in der ',
      link: 'Datenschutzerklärung',
      accept: 'Akzeptieren',
      reject: 'Ablehnen',
    },
    hu: {
      text: 'Ez az oldal sütiket használ az élmény javítása érdekében. Bővebben az ',
      link: 'Adatvédelmi tájékoztatóban',
      accept: 'Elfogadom',
      reject: 'Elutasítom',
    },
  };
  var t = T[LANG] || T.sk;

  function getConsent(){ try { return localStorage.getItem('cookieConsent'); } catch(e){ return null; } }
  function setConsent(v){ try { localStorage.setItem('cookieConsent', v); } catch(e){} }

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
    document.getElementById('cookie-accept').onclick = function(){ setConsent('accepted'); hideBanner(); };
    document.getElementById('cookie-reject').onclick = function(){ setConsent('rejected'); hideBanner(); };
  }

  function hideBanner(){
    var bar = document.getElementById('cookie-banner');
    if(bar) bar.remove();
  }

  if(!getConsent()){
    showBanner();
  }
})();
