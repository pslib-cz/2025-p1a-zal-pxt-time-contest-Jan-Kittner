/*  TimeContest  */

enum GameState {
    Passive,   // čekání – hráč může zobrazit skóre nebo spustit hru
    Started,   // přehrávání intervalu – zobrazeny přesýpací hodiny
    Running    // hráč odhaduje – zobrazuje se otazník, měří se čas
}

let state: GameState = GameState.Passive
let targetInterval: number = 0   // sekundy (5–15)
let startTime: number = 0        // ms – základ pro měření
let score: number = 0

input.onButtonPressed(Button.AB, function() {
    if (GameState.Passive) {
        Math.randomRange(5,15);
        GameState.Started;
        basic.showIcon(IconNames.Pitchfork);
        control.runInBackground(() => music.playTone(440, 200));
    }
})