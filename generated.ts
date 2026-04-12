namespace Generated {
    enum GameState {
        Passive,   // čekání – hráč může zobrazit skóre nebo spustit hru
        Started,   // přehrávání intervalu – zobrazeny přesýpací hodiny
        Running    // hráč odhaduje – zobrazuje se otazník, měří se čas
    }

    let state: GameState = GameState.Passive
    let targetInterval: number = 0   // sekundy (5–15)
    let startTime: number = 0        // ms – základ pro měření
    let score: number = 0
    let targetIntervalMs: number = 0

    // Spuštění hry (stisk A+B)
    input.onButtonPressed(Button.AB, function () {
        if (state === GameState.Passive) {
            state = GameState.Started

            targetIntervalMs = randint(5, 15) * 1000

            basic.showIcon(IconNames.Pitchfork)

            // Přehrání prvního tónu (neblokující)
            control.runInBackground(function () {
                music.playTone(440, 200)
            })

            // Blokující čekání přesně po dobu cílového intervalu
            basic.pause(targetIntervalMs)

            control.runInBackground(function () {
                music.playTone(880, 200)
            })

            // Přechod do stavu odhadování
            state = GameState.Running
            basic.showString("?")

            startTime = control.millis()
        }
    })

    // Hráčův odhad (dotyk loga micro:bitu)
    input.onLogoEvent(TouchButtonEvent.Touched, function () {
        if (state === GameState.Running) {
            // Změření uplynulého času od konce druhého tónu
            let elapsed = control.millis() - startTime

            // Výpočet tolerance a spodní hranice pro výhru
            let tolerance = 250 + 0.1 * targetIntervalMs
            let minTime = targetIntervalMs - tolerance

            // Vyhodnocení, zda se hráč trefil do tolerančního okna
            if (elapsed >= minTime && elapsed <= targetIntervalMs) {
                let dil = tolerance / 9
                let points = Math.floor((elapsed - minTime) / dil) + 1
                if (points > 9) {
                    points = 9 // Záchytný bod pro případ, že elapsed == targetIntervalMs
                }
                score += points

                // Reakce na výhru
                basic.showIcon(IconNames.Happy)
                music.playTone(523, 200) // Tón C5
                basic.pause(100)
                music.playTone(659, 200) // Tón E5
                basic.pause(100)
                music.playTone(784, 400) // Tón G5

            } else {
                // Reakce na prohru (mimo toleranci, nebo stisknuto příliš pozdě)
                basic.showIcon(IconNames.Sad)
                music.playTone(196, 300) // Tón G3
                basic.pause(100)
                music.playTone(131, 500) // Tón C3
            }

            // Krátká pauza pro zobrazení obličeje před návratem do klidového stavu
            basic.pause(1500)
            basic.clearScreen()
            state = GameState.Passive
        }
    })

    // Zobrazení skóre (stisk tlačítka B)
    input.onButtonPressed(Button.B, function () {
        if (state === GameState.Passive) {
            basic.showNumber(score)
        }
    })
}
