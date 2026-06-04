//% color="#00d2ff" icon="\uf06e" block="Robo Eyes"
//% dependencies="OLED12864"
namespace roboeyes {

    //% block="zainicjalizuj ekran Robo Eyes"
    //% weight=100
    export function init() {
        // Wywołujemy inicjalizację z tamtego addona (współpraca!)
        OLED.init(128, 64)
        OLED.clear()
    }

    //% block="wyczyść oczy"
    //% weight=90
    export function clear() {
        OLED.clear()
    }

    //% block="pokaż oczy: %mood"
    //% weight=80
    export function showEyes(mood: EyesMood) {
        OLED.clear()
        
        if (mood == EyesMood.Normal) {
            // Rysujemy zaokrąglone oczy (paski ładowania idealnie to udają!)
            OLED.drawLoading(30, 15, 55, 50) // Lewe oko
            OLED.drawLoading(73, 15, 98, 50) // Prawe oko
            
        } else if (mood == EyesMood.Blink) {
            // Mrugnięcie - płaskie kreski
            OLED.drawLoading(30, 31, 55, 34)
            OLED.drawLoading(73, 31, 98, 34)
            
        } else if (mood == EyesMood.Angry) {
            // Złe oczy: najpierw rysujemy normalne
            OLED.drawLoading(30, 15, 55, 50)
            OLED.drawLoading(73, 15, 98, 50)
            // A teraz nakładamy "brwi" za pomocą czarnych prostokątów, 
            // które ścinają rogi (jeśli addon pozwala na zmianę koloru)
            // W standardowym oled12864 rysujemy po prostu niższe, groźne oczy:
            OLED.clear()
            OLED.drawLoading(30, 25, 55, 45)
            OLED.drawLoading(73, 25, 98, 45)
        }
    }
}

enum EyesMood {
    //% block="Zwykłe"
    Normal,
    //% block="Złe"
    Angry,
    //% block="Mrugnięcie"
    Blink
}
