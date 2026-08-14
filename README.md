# the Focus Place

Web platforma inšpirovaná Human Benchmark — testy reakcie a pamäte, edukatívne videá, e-shop a platené členstvo. Claim: **Focus in motion**.

## Aktuálny stav

`index.html` je jeden samostatný súbor (logá sú vložené priamo v ňom ako base64, takže funguje aj bez priečinka `assets`). Funkčné časti:

- **Reakčný test** — meranie milisekúnd, najlepší čas, priemer
- **Pamäťová sekvencia** — rastúca sekvencia polí, level a najlepší výsledok
- Sekcie **Videá**, **E-shop**, **Premium** — zatiaľ statické UI bez backendu (pripravené na napojenie)

`assets/` obsahuje zmenšené logá použité vo webe. `assets/brand-originals/` obsahuje pôvodné vysoko-rozlíšené súbory značky (na favicon, tlač, sociálne siete a pod.) — vo webe sa nepoužívajú priamo.

## Spustenie lokálne

Stačí otvoriť `index.html` v prehliadači. Žiadna inštalácia nie je potrebná.

## Ďalšie kroky (v poradí)

1. **Doladiť obsah a detaily** — texty, favicon (z `assets/brand-originals/thePlace_icon_color.png`), otestovať na mobile
2. **Kúpiť doménu** — napr. cez Websupport alebo Namecheap
3. **Nasadiť na hosting** — Vercel / Netlify / Cloudflare Pages (stačí statický súbor, netreba build krok)
4. **Firemný e-mail** — Google Workspace alebo Zoho Mail
5. **Databáza a prihlasovanie** — pre históriu výsledkov a členské účty; odporúčaný Supabase
6. **Platby** — Stripe (e-shop + Premium členstvo)
7. **Hosting videí** — YouTube (unlisted) na začiatok, neskôr prípadne Cloudflare Stream
8. **Otestovať a spustiť naostro**

## Poznámka k farbám a fontom

- Farby: čierna `#11181D`, žltá `#FEC62F`, biela `#F2F0EB`
- Fonty: Anton (nadpisy), Space Mono (čísla/labely), Inter (bežný text) — načítavajú sa z Google Fonts
