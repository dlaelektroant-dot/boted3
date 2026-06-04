namespace RoboEyes {

    //% block="init RoboEyes"
    export function initEyes() {
        OLED.init(128, 64)
        basic.pause(200)
    }

    //% block="eyes animate"
    export function animateEyes() {
        for (let p = -6; p <= 6; p++) {
            drawEyes(p)
            basic.pause(50)
        }
        for (let p = 6; p >= -6; p--) {
            drawEyes(p)
            basic.pause(50)
        }
    }

    //% block="blink"
    export function blinkEyes() {
        OLED.clear()
        OLED.drawLine(28, 32, 52, 32)
        OLED.drawLine(76, 32, 100, 32)
        basic.pause(120)
        drawEyes(0)
    }

    //% block="emotion sleep"
    export function sleepEyes() {
        OLED.clear()
        OLED.drawLine(28, 32, 52, 32)
        OLED.drawLine(76, 32, 100, 32)
    }

    function drawEyes(pos: number) {
        OLED.clear()
        OLED.drawCircle(40 + pos, 32, 12)
        OLED.drawCircle(88 + pos, 32, 12)
    }
}
