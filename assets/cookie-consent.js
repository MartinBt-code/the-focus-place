(function(){
  var LANG = document.documentElement.lang || 'sk';
  var T = {
    sk: {
      title: 'Táto stránka používa cookies',
      text: 'Používame cookies na zlepšenie tvojho zážitku na stránke. Viac info nájdeš v ',
      link: 'Ochrane osobných údajov',
      accept: 'Prijať všetko',
      reject: 'Odmietnuť',
    },
    en: {
      title: 'This site uses cookies',
      text: 'We use cookies to improve your experience on the site. More info in the ',
      link: 'Privacy Policy',
      accept: 'Accept all',
      reject: 'Reject',
    },
    de: {
      title: 'Diese Website verwendet Cookies',
      text: 'Wir verwenden Cookies, um dein Erlebnis auf der Website zu verbessern. Mehr dazu in der ',
      link: 'Datenschutzerklärung',
      accept: 'Alle akzeptieren',
      reject: 'Ablehnen',
    },
    hu: {
      title: 'Ez az oldal sütiket használ',
      text: 'Sütiket használunk az oldalon nyújtott élmény javítása érdekében. Bővebben az ',
      link: 'Adatvédelmi tájékoztatóban',
      accept: 'Összes elfogadása',
      reject: 'Elutasítom',
    },
  };
  var t = T[LANG] || T.sk;

  function getConsent(){ try { return localStorage.getItem('cookieConsent'); } catch(e){ return null; } }
  function setConsent(v){ try { localStorage.setItem('cookieConsent', v); } catch(e){} }

  function showModal(){
    if(document.getElementById('cookie-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'cookie-overlay';
    overlay.style.cssText = 'position:fixed; inset:0; z-index:300; background:rgba(17,24,29,0.72); backdrop-filter:blur(2px); display:flex; align-items:center; justify-content:center; padding:20px; font-family:Inter,sans-serif;';

    var modal = document.createElement('div');
    modal.style.cssText = 'background:var(--navy-panel); border:1px solid var(--navy-line); border-radius:8px; max-width:460px; width:100%; padding:32px; box-shadow:0 20px 60px rgba(0,0,0,0.4);';
    modal.innerHTML =
      '<h3 style="font-family:\'Anton\'; text-transform:uppercase; font-size:20px; color:var(--off-white); margin-bottom:14px; letter-spacing:0.5px;">' + t.title + '</h3>' +
      '<p style="color:var(--gray); font-size:14px; line-height:1.6; margin-bottom:24px;">' + t.text + '<a href="/ochrana-osobnych-udajov.html" style="color:var(--orange); text-decoration:underline;">' + t.link + '</a>.</p>' +
      '<div style="display:flex; gap:10px; flex-wrap:wrap;">' +
        '<button class="btn btn-primary" id="cookie-accept" style="flex:1; min-width:140px;">' + t.accept + '</button>' +
        '<button class="btn btn-ghost" id="cookie-reject" style="flex:1; min-width:140px;">' + t.reject + '</button>' +
      '</div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('cookie-accept').onclick = function(){ setConsent('accepted'); overlay.remove(); };
    document.getElementById('cookie-reject').onclick = function(){ setConsent('rejected'); overlay.remove(); };
  }

  if(!getConsent()){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', showModal);
    } else {
      showModal();
    }
  }
})();
