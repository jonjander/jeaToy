function SetSwitchLED(led: number, state: boolean) {
    if (state == true) {
        ledState = ledState | bit(led);
    } else {
        ledState = ledState & ~bit(led);
    }
    ledState &= writeMode
    SendLedState()
}

function GetSwitchLed(led: number): number {
    switch (led) {
        case powerBtn:
            return 0;
        case redBtn:
            return redBtnLed;
        case blueBtn:
            return blueBtnLed;
        case engineBtn:
            return engineBtnLed;
        case greenBtn:
            return greenBtnLed;
        default:
            return led;
        
    }

}


function SendLedState() {
    pins.i2cWriteNumber(
        ledAddress,
        ledState,
        NumberFormat.Int8LE,
        false
    )
}
function ReadButtons() {
    read = pins.i2cReadNumber(
        inputAddress,
        NumberFormat.Int8LE,
        false
    )
    buttonStates = read & readMode
}
function ResetInputs() {
    pins.i2cWriteNumber(
        inputAddress,
        0,
        NumberFormat.Int8LE,
        false
    )
}
// pins.A0.onEvent(PinEvent.Fall, function () { //
// Control pins
// light.showAnimation(light.rainbowAnimation, 2000)
// })
function ResetOutput() {
    pins.i2cWriteNumber(
        ledAddress,
        0,
        NumberFormat.Int8LE,
        false
    )
}
let ledAddress = 0
let inputAddress = 0
let register = 0
let buttonStates = 0
let ledState = 0
let read = 0
let valueResult = 0
let writeMode = 255
let readMode = 255

let powerBtn       = 0b1
let redBtn         = 0b10
let blueBtn        = 0b100
let yellowBtn      = 0b1000
let engineBtn      = 0b10000
let greenBtn       = 0b100000
let blueSwitch     = 0b1000000
let redSwitch      = 0b10000000
  
let engineBtnLed   = 0b1
let greenBtnLed    = 0b100
let yellowBtnLed   = 0b1000
let redBtnLed      = 0b10000
let blueBtnLed     = 0b100000
let blueSwitchLed  = 0b1000000
let redSwitchLed   = 0b10000000

inputAddress = 32
ledAddress = 33
ResetInputs()
ResetOutput()
function bit(pin: number): number {
    return 1 << pin
}
SetSwitchLED(0, true)
forever(function () {
    valueResult = pins.i2cReadNumber(
        32,
        NumberFormat.Int8LE,
        false
    )
    for (let index = 0; index <= 7; index++) {
        let reg = valueResult & bit(index)
        if ((bit(index) && readMode) > 0) {
            if (reg != 0) {
                light.setPixelColor(index, 0xff0000)
                SetSwitchLED(GetSwitchLed(index), false)
            } else {
                light.setPixelColor(index, 0x00ff00)
                SetSwitchLED(GetSwitchLed(index), true)
            }
        }
    }
})
