pins.A0.onEvent(PinEvent.Fall, function() {
    // Control pins
    light.showAnimation(light.rainbowAnimation, 2000)
})

function SetSwitchLED(led: number, state: boolean) {
    register = 0
    if (state == true) {
        writeByteBuffered = writeByteBuffered | bit(led);
    } else {
        writeByteBuffered = writeByteBuffered & ~bit(led);
    }
    pins.i2cWriteNumber(
        33,
        0,
        NumberFormat.Int8LE,
        false
    )
}
let register = 0
let valueResult = 0
let ca = 0
let writeByteBuffered = 0

function bit(pin: number): number {
    return 1 << pin
}
forever(function() {
    valueResult = pins.i2cReadNumber(
        32,
        NumberFormat.Int8LE,
        false
    )
    ca = 1
    for (let index2 = 0; index2 <= 7; index2++) {
        let register2 = valueResult & ca
        if (register2 != 0) {
            light.setPixelColor(index2, 0xff0000)
        } else {
            light.setPixelColor(index2, 0x00ff00)
        }
        ca = ca * 2
    }
})