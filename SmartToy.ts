function SetSwitchLED(led: number, state: boolean) {
    if (led == 10) {
        return;
    }
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
            return 10;
        case redBtn:
            return redBtnLed;
        case blueBtn:
            return blueBtnLed; 
        case yellowBtn:
            return yellowBtnLed; 
        case engineBtn:
            return engineBtnLed;
        case greenBtn:
            return greenBtnLed;
        case blueSwitch:
            return blueSwitchLed;
        case redSwitch:
            return redSwitchLed;
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

let powerBtn       = 0
let redBtn         = 1
let blueBtn        = 2
let yellowBtn      = 3
let engineBtn      = 4
let greenBtn       = 5
let blueSwitch     = 6
let redSwitch      = 7
  
let engineBtnLed   = 0
let greenBtnLed    = 2
let yellowBtnLed   = 3
let redBtnLed      = 4
let blueBtnLed     = 5
let blueSwitchLed  = 6
let redSwitchLed   = 7

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
