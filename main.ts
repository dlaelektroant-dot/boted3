/**
 * Addon Robo Eyes dla projektu boted2
 * Wykorzystuje bibliotekę Tinkertanker SSD1306
 */

//% color="#00d2ff" icon="\uf06e" block="Robo Eyes"
namespace roboeyes {

    //% block="zainicjalizuj oczy Robo"
    //% weight=100
    export function init() {
        // Inicjalizacja z addona Tinkertanker (adres 0x3C)
        OLED.init(128, 64)
    }

    //% block="wyczyść ekran"
    //% weight=90
    export function clear() {
        OLED.clear()
    }

    //% block="pokaż oczy: %mood"
    //% weight=80
    export function showEyes(mood: EyesMood) {
        OLED.clear()
        
        if (mood == EyesMood.Normal) {
            // Rysujemy zaokrąglone oczy (jako bardzo grube linie)
            // drawLineWidth(x1, y1, x2, y2, grubość)
            OLED.drawLineWidth(35, 20, 35, 45, 22) // Lewe
            OLED.drawLineWidth(85, 20, 85, 45, 22) // Prawe
            
        } else if (mood == EyesMood.Blink) {
            // Mrugnięcie (cienkie poziome kreski)
            OLED.drawLineWidth(25, 32, 45, 32, 4)
            OLED.drawLineWidth(75, 32, 95, 32, 4)
            
        } else if (mood == EyesMood.Angry) {
            // Złe oczy (używamy rysowania linii, żeby zrobić skosy)
            // Rysujemy bazę oka
            OLED.drawLineWidth(35, 25, 35, 45, 22)
            OLED.drawLineWidth(85, 25, 85, 45, 22)
            // "Zamazujemy" czarną linią górę, żeby zrobić skos
            // (Jeśli biblioteka na to pozwala, inaczej robimy mniejsze prostokąty)
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
