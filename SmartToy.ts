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
let InputPinStates = 0
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

let switchMask = bit(redBtn) | bit(blueBtn) | bit(yellowBtn) | bit (greenBtn) 

inputAddress = 32
ledAddress = 33
ResetInputs()
ResetOutput()
function bit(pin: number): number {
    return 1 << pin
}
SetSwitchLED(0, true)



function DisplayInteFace(){
    if((InputPinStates & (bit(blueSwitch) | bit(redSwitch))) == 0) {
        switch (InputPinStates & switchMask) {
            case 0:
                light.setAll(0x000000);
                break;
            case bit(greenBtn):
                light.showAnimation(light.sparkleAnimation, 500);
                break;
            case bit(yellowBtn):
                light.showAnimation(light.runningLightsAnimation, 500);
                break;
            case bit(greenBtn) | bit(yellowBtn):
                light.showAnimation(light.rainbowAnimation, 500);
                break;
            case bit(redBtn):
                light.showAnimation(light.cometAnimation, 500);
                break;
            case bit(redBtn)| bit(greenBtn):
                light.showAnimation(light.colorWipeAnimation, 500);
                break;
            case bit(redBtn) | bit(yellowBtn):
                light.showAnimation(light.theaterChaseAnimation, 500);
                break;
            case bit(redBtn) | bit(yellowBtn):
                light.showAnimation(light.theaterChaseAnimation, 500);
                break;
            break;
            default:

            break;
        }
    } else {
        //bug
        //let speed = ((InputPinStates & bit(blueBtn)) * 5) + ((InputPinStates & bit(redBtn)) * 20) +  ((InputPinStates & bit(yellowBtn)) * 25) + ((InputPinStates & bit(greenBtn)) * 50);
        //light.photonForward(1);
        //pause(100  - speed);
    }
}

function PlayNormalTone(note: Note, state: boolean) {
    let offSet = 23;
    if (newState & bit(blueBtn)) {
        music.playTone(note, music.beat(BeatFraction.Half));
    } else {
        music.playTone(note - offSet, music.beat(BeatFraction.Half));
    }
}

function OnChangeBtn(newState: number, oldState: number){
    if(newState != oldState) {
        let statesChanged = newState ^ oldState;
        if (statesChanged & bit(blueBtn)) {
            PlayNormalTone(Note.C5, newState & bit(blueBtn));
        }
        if (statesChanged & bit(redBtn)) {
            PlayNormalTone(Note.D5, newState & bit(redBtn));
        }
        if (statesChanged & bit(yellowBtn)) {
            PlayNormalTone(Note.F5, newState & bit(yellowBtn));
        }
        if (statesChanged & bit(greenBtn)) {
            PlayNormalTone(Note.G5, newState & bit(greenBtn));
        }
    }
}

function ReadBtnStates(){
    let oldState = InputPinStates;
    let readInput = pins.i2cReadNumber(
        32,
        NumberFormat.Int8LE,
        false
    )
    InputPinStates = readInput; //Save new state

    for (let index = 0; index <= 7; index++) {
        let reg = InputPinStates & bit(index)
        if ((bit(index) && readMode) > 0) {
            if (reg != 0) {
                //light.setPixelColor(index, 0xff0000)
                SetSwitchLED(GetSwitchLed(index), true)
            } else {
                //light.setPixelColor(index, 0x00ff00)
                SetSwitchLED(GetSwitchLed(index), false)
            }
        }
    }
    OnChangeBtn(readInput, oldState);
}

forever(function () {
    ReadBtnStates();
    DisplayInteFace();
})
