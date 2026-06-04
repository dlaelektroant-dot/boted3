namespace RoboEyes {

    let w = 128
    let h = 64

    // inicjalizacja OLED
    export function init() {
        OLED.init(w, h)
        basic.pause(200)
    }

    // rysowanie dwóch oczu
    export function eyes(pos: number) {
        OLED.clear()
        OLED.drawCircle(40 + pos, 32, 12)
        OLED.drawCircle(88 + pos, 32, 12)
    }

    // animacja przesuwania oczu
    export function animate() {
        for (let p = -6; p <= 6; p++) {
            eyes(p)
            basic.pause(50)
        }
        for (let p = 6; p >= -6; p--) {
            eyes(p)
            basic.pause(50)
        }
    }

    // mrugnięcie
    export function blink() {
        OLED.clear()
        OLED.drawLine(28, 32, 52, 32)
        OLED.drawLine(76, 32, 100, 32)
        basic.pause(120)
        eyes(0)
    }

    // emocje
    export function angry() {
        OLED.clear()
        OLED.drawLine(28, 20, 52, 32)
        OLED.drawLine(76, 32, 100, 20)
    }

    export function sleep() {
        OLED.clear()
        OLED.drawLine(28, 32, 52, 32)
        OLED.drawLine(76, 32, 100, 32)
    }

    export function xd() {
        OLED.clear()
        OLED.drawLine(28, 20, 52, 44)
        OLED.drawLine(28, 44, 52, 20)
        OLED.drawLine(76, 20, 100, 44)
        OLED.drawLine(76, 44, 100, 20)
    }
}roboeyes.ts
