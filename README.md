# TimeContest – Zadání samostatného cvičení

**Předmět:** Algoritmizace (Static TypeScript, Micro:bit, MakeCode)  
**Ročník:** 1. ročník  
**Typ:** Samostatné cvičení – funkční aplikace  
**Míra použití AI:** Nízká (pouze pro inspiraci a hledání funkcí (např. zaokrouhlení čísla), ne pro generování kódu!)

---

## Téma a herní mechanika

Naprogramuj solitér hru **TimeContest**, ve které hráč odhaduje délku časového intervalu.

Při startu hry Micro:bit "přehraje" hráči určitý časový úsek: zazní tón, uplyne náhodný čas (5–15 sekund), zazní druhý tón. Hráč tento interval nevidí jako číslo – pouze ho *prožije* poslechem. Poté musí sám odhadnout, kdy stejný úsek uplynul, a stisknout tlačítko ve správnou chvíli.

---

## Stavy aplikace

Aplikace se nachází vždy v jednom ze tří stavů:

| Stav | Popis |
|------|-------|
| `Passive` | Výchozí stav. Hráč čeká, může zobrazit skóre. |
| `Started` | Probíhá přehrání intervalu (přesýpací hodiny). |
| `Running` | Hráč odhaduje interval (otazník, měří se čas). |

---

## Průběh hry

### Spuštění (Passive → Started)

- Hra se spustí **stiskem tlačítka A+B zároveň** (pokud je stav `Passive`).
- Vygeneruje se náhodné celé číslo v rozsahu **5 až 15** – to je cílový interval (v sekundách).
- Stav se změní na `Started`.
- Zobrazí se ikona **příjmu signálu** (`IconNames.Pitchfork`).
- Okamžitě zazní **první tón** (na pozadí).
- Zároveň se začne počítat čas.
- Po uplynutí cílového intervalu zazní **druhý tón** (na pozadí).

### Odhadování (Started → Running)

- Ihned po doznění druhého tónu se stav změní na `Running`.
- Zobrazí se ikona **otazníku** (`IconNames.Square` nebo `"?"`).
- Aktivuje se tlačítko (**Logo** nebo **Button A**) pro stisk hráčem.
- Začne se měřit čas od tohoto okamžiku.

### Vyhodnocení (Running → Passive)

Hráč stiskne tlačítko. (*Za relevantní se považuje moment stisku, ne uvolnění tlačítka!*) 
Aplikace porovná změřený čas s cílovým intervalem:

**Výhra (ikona 😊 + melodie úspěchu):**
- Hráč stiskl tlačítko **včas nebo dříve**, ale ne o víc než `0,25 s + 10 % cílového času` před cílem.
- Tedy platí: `(cíl − tolerance) ≤ naměřený čas ≤ cíl`
- Kde: `tolerance = 0,25 s + 0,1 × cíl`

**Prohra (ikona 😢 + melodie selhání):**
- Hráč stiskl příliš pozdě (překročil cílový čas), **nebo** příliš brzy (mimo toleranční okno).

Stav se vrátí na `Passive`.

---

## Bodování

- **Prohra:** 0 bodů.
- **Výhra:** 1 až 9 bodů podle přesnosti.
  - Toleranční okno se rozdělí na **9 stejně velkých dílů**.
  - Velikost dílu: `tolerance / 9`
  - **9 bodů** – nejbližší díl k cílovému času.
  - **1 bod** – nejdál od cíle (ale stále ve výherním okně).
  - *Příklad:* cíl = 20 s → tolerance = 2,25 s → díl = 0,25 s → 9 bodů za stisk v intervalu (19,75 s; 20 s)


### Zobrazení skóre

- Ve stavu `Passive`: stiskem Button **B** (jako body) se zobrazí skóre.
- Pokud je skóre 0, zobrazí se `0`.

---

## MakeCode – užitečné části API

### Náhodné celé číslo

```typescript
const interval = randint(5, 15)
```

### Přehrání tónu na pozadí (neblokující)

```typescript
control.runInBackground(() => music.playTone(440, 200)) //440 Hz, 200 ms
```

Tón se přehraje asynchronně – program pokračuje dál bez čekání.  
Pro první a druhý tón použij různé frekvence, aby byly rozlišitelné.

### Měření časového úseku

```typescript
let startTime = control.millis()   // uložení aktuálního času (ms)
// ... nějaký kód ...
let elapsed = control.millis() - startTime  // uplynulý čas v ms
```

`control.millis()` vrací čas od spuštění zařízení v milisekundách.

### Ikony a displej

```typescript
basic.showIcon(IconNames.Pitchfork)   // příjem signálu
basic.showIcon(IconNames.Happy)       // smějící se obličej
basic.showIcon(IconNames.Sad)         // smutný obličej
basic.showString("?")                 // otazník
basic.showNumber(score)               // zobrazení čísla
```

### Čekání po dobu intervalu (blokující)

```typescript
basic.pause(interval * 1000)   // pauza v ms
```

---

## Tipy a náročnější části

### Doporučený postup

1. Navrhni stavový automat (tři stavy) a ujasni si, co se děje v každém stavu.
2. Implementuj přehrání intervalu (tóny + pauza).
3. Implementuj měření hráčova času a vyhodnocení výhry/prohry.
4. Přidej výpočet bodů.
5. Propoj vše dohromady přes obslužné rutiny tlačítek.

### Na co si dát pozor

- **Časování tónů:** Tóny přehráváš na pozadí (`runInBackground`), ale pauzu (`basic.pause`) pro délku intervalu potřebuješ v hlavním vlákně. Zamysli se nad pořadím volání.
- **Přepočet jednotek:** Cílový interval je v sekundách, `control.millis()` vrací milisekundy. Hlídej konzistenci jednotek při všech výpočtech.
- **Výpočet bodů:** Výpočet počtu bodů ze změřeného času vyžaduje správné použití celočíselného dělení nebo zaokrouhlení – otestuj hraniční případy.
- **onButtonPressed vs buttonIsPressed** `onButtonPressed` je událost, která se spustí při **uvolnění** stisku tlačítka, zatímco `buttonIsPressed` kontroluje aktuální stav tlačítka. (Snazší je použít onLogoEvent(TouchButtonEvent.Touched, ...) pro detekci stisku loga.)
- **Blokující vs. neblokující volání:** `basic.pause()` zablokuje vlákno. Rozmysli, kde to chceš a kde ne.




> Open this page at [https://pslib-cz.github.io/_pxt-time-contest/](https://pslib-cz.github.io/_pxt-time-contest/)

## Edit this project

To edit this repository in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **Import** then click on **Import URL**
* paste **https://github.com/pslib-cz/_pxt-time-contest** and click import

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
