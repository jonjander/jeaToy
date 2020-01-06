pins.A0.onEvent(PinEvent.Fall, function () {
    // Control pins
    light.showAnimation(light.rainbowAnimation, 2000)
})
function SetSwitchLED(led: number, state: boolean) {
    if (state == true) {
        ledState = ledState | bit(led);
    } else {
        ledState = ledState & ~bit(led);
    }
    ledState &= writeMode //only set write pins
    pins.i2cWriteNumber(
        ledAddress,
        ledState,
        NumberFormat.Int8LE,
        false
    )
}

function ReadButtons() {
    let read = pins.i2cReadNumber(
        inputAddress,
        NumberFormat.Int8LE,
        false
    )
    buttonStates = read & readMode
}

let writeMode = 0b01000000 //0b00000001
let readMode = 0b11111111 //0b11111111
let inputAddress = 0x20 //0x20
let ledAddress = 0x21 //0x21
let register = 0
let buttonStates = 0
let ledState = 0
function bit(pin: number): number {
    return 1 << pin
}
forever(function () {
    let valueResult = pins.i2cReadNumber(
        32,
        NumberFormat.Int8LE,
        false
    )
    for (let index = 0; index <= 7; index++) {
        let reg = valueResult & bit(index)
        if ((reg && readMode) > 0) {
            if (reg != 0) {
                light.setPixelColor(index, 0xff0000)
            } else {
                light.setPixelColor(index, 0x00ff00)
            }
        }
    }
})
