//% color="#00d2ff" icon="\uf06e" block="Robo Eyes Pro"
namespace roboeyes {
    const OLED_ADDR = 0x3C;

    // Odpowiedniki stanów humoru z kodu źródłowego Pythona
    export enum Mood {
        //% block="Zwykłe"
        DEFAULT = 0,
        //% block="Zmęczone"
        TIRED = 1,
        //% block="Złe"
        ANGRY = 2,
        //% block="Wesołe"
        HAPPY = 3,
        //% block="Zamarznięte"
        FROZEN = 4,
        //% block="Przerażające"
        SCARY = 5
    }

    // Odpowiedniki pozycji (kierunków) z kodu Pythona
    export enum Position {
        //% block="Środek"
        CENTER = 0, 
        //% block="Północ (Góra)"
        N = 1, 
        //% block="Północny-Wschód"
        NE = 2, 
        //% block="Wschód (Prawo)"
        E = 3, 
        //% block="Południowy-Wschód"
        SE = 4, 
        //% block="Południe (Dół)"
        S = 5, 
        //% block="Południowy-Zachód"
        SW = 6, 
        //% block="Zachód (Lewo)"
        W = 7, 
        //% block="Północny-Zachód"
        NW = 8
    }

    // Zmienne geometrii ekranu i oczu (wartości domyślne z Pythona)
    let screenWidth = 128;
    let screenHeight = 64;
    let _mood = Mood.DEFAULT;

    let eyeLwidthDefault = 36;
    let eyeLheightDefault = 36;
    let eyeRwidthDefault = 36;
    let eyeRheightDefault = 36;
    let spaceBetweenDefault = 10;
    let borderRadiusDefault = 8;

    // Parametry dynamiczne (Current do płynnych przejść i Next jako cele)
    let eyeLwidthCurrent = eyeLwidthDefault;
    let eyeLheightCurrent = 1; // Start z zamkniętymi oczami zgodnie z kodem źródłowym
    let eyeLwidthNext = eyeLwidthDefault;
    let eyeLheightNext = eyeLheightDefault;

    let eyeRwidthCurrent = eyeRwidthDefault;
    let eyeRheightCurrent = 1;
    let eyeRwidthNext = eyeRwidthDefault;
    let eyeRheightNext = eyeRheightDefault;

    let eyeLx = 18; let eyeLxNext = 18;
    let eyeLy = 14; let eyeLyNext = 14;
    let eyeRx = 64; let eyeRxNext = 64;
    let eyeRy = 14; let eyeRyNext = 14;

    let spaceBetweenCurrent = spaceBetweenDefault;
    let spaceBetweenNext = spaceBetweenDefault;

    // Zmienne pomocnicze dla nastrojów (powieki)
    let eyelidsAngryHeight = 0;
    let eyelidsTiredHeight = 0;
    let eyelidsHappyBottomOffset = 0;

    // Bufor graficzny ekranu (128x64 pikseli podzielone na 8 stron)
    let screenBuf = pins.createBuffer(1024);

    function command(c: number) {
        pins.i2cWriteNumber(OLED_ADDR, c, NumberFormat.UInt8LE, false);
    }

    //% block="zainicjalizuj silnik Robo Eyes"
    //% weight=100
    export function init() {
        pins.setPull(DigitalPin.P19, PinPullMode.PullUp);
        pins.setPull(DigitalPin.P20, PinPullMode.PullUp);
        basic.pause(100);

        let initCmds = [
            0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40,
            0x8D, 0x14, 0x20, 0x02, 0xA1, 0xC8, 0xDA, 0x12,
            0x81, 0xCF, 0xD9, 0xF1, 0xDB, 0x40, 0xA4, 0xA6, 0xAF
        ];
        for (let i = 0; i < initCmds.length; i++) command(initCmds[i]);
        
        // Wyśrodkowanie startowe oczu
        let startX = Math.idiv(screenWidth - (eyeLwidthDefault + spaceBetweenDefault + eyeRwidthDefault), 2);
        let startY = Math.idiv(screenHeight - eyeLheightDefault, 2);
        eyeLx = startX; eyeLxNext = startX;
        eyeLy = startY; eyeLyNext = startY;

        clear();
        render();
    }

    function clear() {
        screenBuf.fill(0);
    }

    function drawPixel(x: number, y: number, color: number) {
        if (x < 0 || x >= 128 || y < 0 || y >= 64) return;
        let page = Math.idiv(y, 8);
        let bit = y % 8;
        let idx = page * 128 + x;
        if (color == 1) screenBuf[idx] |= (1 << bit);
        else screenBuf[idx] &= ~(1 << bit);
    }

    // Generator zaokrąglonych prostokątów (oczu) z zachowaniem promienia z kodu źródłowego
    function drawRoundRect(x: number, y: number, w: number, h: number, r: number, isLeft: boolean) {
        if (w <= 0 || h <= 0) return;
        if (r * 2 > w) r = Math.idiv(w, 2);
        if (r * 2 > h) r = Math.idiv(h, 2);

        let currentY = y;
        let currentH = h;

        // Implementacja nakładek nastrojów (powieki) bezpośrednio modyfikująca wysokość rysowania
        if (_mood == Mood.ANGRY) {
            currentH = Math.idiv(h * 3, 4);
        } else if (_mood == Mood.TIRED) {
            currentY += Math.idiv(h, 4);
            currentH = Math.idiv(h * 3, 4);
        } else if (_mood == Mood.HAPPY) {
            currentH = Math.idiv(h * 3, 4);
        }

        // Rysowanie rdzenia prostokąta
        for (let i = x + r; i < x + w - r; i++) {
            for (let j = currentY; j < currentY + currentH; j++) drawPixel(i, j, 1);
        }
        for (let i = currentY + r; i < currentY + currentH - r; i++) {
            for (let j = x; j < x + r; j++) drawPixel(j, i, 1);
            for (let j = x + w - r; j < x + w; j++) drawPixel(j, i, 1);
        }

        // Rysowanie czterech zaokrąglonych rogów
        drawCorner(x + r, currentY + r, r, 0); 
        drawCorner(x + w - r - 1, currentY + r, r, 1); 
        drawCorner(x + r, currentY + currentH - r - 1, r, 2); 
        drawCorner(x + w - r - 1, currentY + currentH - r - 1, r, 3);

        // Wycinanie specyficznych nastrojów (efekt groźnych oczu ściętych pod skosem)
        if (_mood == Mood.ANGRY) {
            if (isLeft) {
                for (let i = 0; i < w; i++) {
                    for (let j = 0; j < Math.idiv(i, 2); j++) drawPixel(x + i, currentY + j, 0);
                }
            } else {
                for (let i = 0; i < w; i++) {
                    for (let j = 0; j < Math.idiv(w - i, 2); j++) drawPixel(x + i, currentY + j, 0);
                }
            }
        }
    }

    function drawCorner(cx: number, cy: number, r: number, corner: number) {
        for (let x = 0; x <= r; x++) {
            let h = Math.sqrt(r * r - x * x);
            for (let y = 0; y <= h; y++) {
                if (corner == 0) drawPixel(cx - x, cy - y, 1);
                else if (corner == 1) drawPixel(cx + x, cy - y, 1);
                else if (corner == 2) drawPixel(cx - x, cy + y, 1);
                else if (corner == 3) drawPixel(cx + x, cy + y, 1);
            }
        }
    }

    //% block="ustaw nastrój oczu na %mood"
    //% weight=85
    export function setMood(mood: Mood) {
        _mood = mood;
    }

    //% block="spójrz w kierunku %pos"
    //% weight=80
    export function setPosition(pos: Position) {
        let max_x = screenWidth - (eyeLwidthDefault + spaceBetweenDefault + eyeRwidthDefault);
        let max_y = screenHeight - eyeLheightDefault;

        if (pos == Position.N) { eyeLxNext = Math.idiv(max_x, 2); eyeLyNext = 0; }
        else if (pos == Position.NE) { eyeLxNext = max_x; eyeLyNext = 0; }
        else if (pos == Position.E) { eyeLxNext = max_x; eyeLyNext = Math.idiv(max_y, 2); }
        else if (pos == Position.SE) { eyeLxNext = max_x; eyeLyNext = max_y; }
        else if (pos == Position.S) { eyeLxNext = Math.idiv(max_x, 2); eyeLyNext = max_y; }
        else if (pos == Position.SW) { eyeLxNext = 0; eyeLyNext = max_y; }
        else if (pos == Position.W) { eyeLxNext = 0; eyeLyNext = Math.idiv(max_y, 2); }
        else if (pos == Position.NW) { eyeLxNext = 0; eyeLyNext = 0; }
        else { eyeLxNext = Math.idiv(max_x, 2); eyeLyNext = Math.idiv(max_y, 2); }
    }

    //% block="zamknij oczy"
    //% weight=75
    export function closeEyes() {
        eyeLheightNext = 1;
        eyeRheightNext = 1;
        eyeL_open = false;
        eyeR_open = false;
    }

    //% block="otwórz oczy"
    //% weight=70
    export function openEyes() {
        eyeL_open = true;
        eyeR_open = true;
        eyeLheightNext = eyeLheightDefault;
        eyeRheightNext = eyeRheightDefault;
    }

    //% block="mrugnij oczami"
    //% weight=76
    export function blink() {
        eyeLheightCurrent = 1;
        eyeRheightCurrent = 1;
    }

    //% block="odśwież i przelicz klatkę animacji"
    //% weight=90
    export function update() {
        // Obliczanie algorytmu Tweening (płynna animacja przejść współrzędnych krok po kroku)
        eyeLheightCurrent = (eyeLheightCurrent + eyeLheightNext) >> 1;
        let oLy = eyeLy + ((eyeLheightDefault - eyeLheightCurrent) >> 1);

        eyeRheightCurrent = (eyeRheightCurrent + eyeRheightNext) >> 1;
        let oRy = eyeRy + ((eyeRheightDefault - eyeRheightCurrent) >> 1);

        eyeLx = (eyeLx + eyeLxNext) >> 1;
        eyeLy = (eyeLy + eyeLyNext) >> 1;
        
        spaceBetweenCurrent = (spaceBetweenCurrent + spaceBetweenNext) >> 1;
        eyeRxNext = eyeLx + eyeLwidthCurrent + spaceBetweenCurrent;
        eyeRx = (eyeRx + eyeRxNext) >> 1;
        eyeRy = eyeLy;

        clear();
        
        // Generowanie oczu do bufora
        drawRoundRect(eyeLx, oLy, eyeLwidthCurrent, eyeLheightCurrent, borderRadiusDefault, true);
        drawRoundRect(eyeRx, oRy, eyeRwidthCurrent, eyeRheightCurrent, borderRadiusDefault, false);

        render();
    }

    function render() {
        for (let page = 0; page < 8; page++) {
            command(0xB0 + page);
            command(0x00);
            command(0x10);
            
            let tmp = pins.createBuffer(129);
            tmp[0] = 0x40;
            for (let i = 0; i < 128; i++) {
                tmp[i + 1] = screenBuf[page * 128 + i];
            }
            pins.i2cWriteBuffer(OLED_ADDR, tmp);
        }
    }
}
