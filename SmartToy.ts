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
        case ignitionBtn:
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

let ignitionBtn       = 0
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
   
}

function PlayNormalTone(note: string, speed: number = 2) {
    PlayCustomMelody(`${note}:${speed.toString()}`);
}

function OnChangeBtn(newState: number, oldState: number) {
    if (newState != oldState) {
        let statesChanged = newState ^ oldState;

        if (statesChanged & bit(ignitionBtn)) {
            if (ToBool(newState & bit(ignitionBtn))) {
                PlayNormalTone("A4");
            } else {
                PlayNormalTone("A3");
            }
            
        }
        if (statesChanged & bit(blueBtn)) {
            if (ToBool(newState & bit(blueBtn))) {
                PlayNormalTone("C5");
            } else {
                PlayNormalTone("C4");
            }
            
        }
        if (statesChanged & bit(redBtn)) {
            if (ToBool(newState & bit(redBtn))) {
                PlayNormalTone("D5");
            } else {
                PlayNormalTone("D4");
            }
        }
        if (statesChanged & bit(yellowBtn)) {
            if (ToBool(newState & bit(yellowBtn))) {
                PlayNormalTone("F5");
            } else {
                PlayNormalTone("F4");
            }
        }
        if (statesChanged & bit(greenBtn)) {
            if (ToBool(newState & bit(greenBtn))) {
                PlayNormalTone("G5");
            } else {
                PlayNormalTone("G4");
            }
        }
    }
}



let isEngineRunning = false;
let starterPressed = 0;
enum EngineStates {
    Unknown,
    Stopped,
    Starting,
    Running,
    Ignition,
    Started
}
let EngineState = EngineStates.Unknown;

function GetDeltaMs(): number {
    let delta = control.timer1.millis();
    control.timer1.reset();
    return delta;
}

//"A5:1 E5:1 E5 E5:2 F5 F5:1-50 G5 G5"
function PlayCustomMelody(mel: string){
    music.stopAllSounds(); //todo try without
    let currMelody = new music.Melody(mel);
    currMelody.play();
}

function DisplayEngineStatus() {
    switch (EngineState) {
        case EngineStates.Unknown:
            light.setAll(light.colors(Colors.Black));
        break;
        case EngineStates.Stopped:
            light.setAll(light.colors(Colors.Red));
        break;
        case EngineStates.Ignition:
            light.setAll(light.colors(Colors.Yellow));
        break;
        case EngineStates.Running:
            light.showAnimation(light.colorWipeAnimation, 500);
        break;
        case EngineStates.Starting:
            light.clear();
            PlayCustomMelody("C5:1 F:1 A:1 F:1 A:1 G:1 C5:1 A:1");
            light.showAnimation(light.sparkleAnimation, 200);
            
        break;

        default:

        break;
    }
}

function EngineStarter(){
    switch (EngineState) {
        case EngineStates.Unknown:
            if (!BtnState(ignitionBtn) && !BtnState(blueBtn) && !BtnState(redBtn) && !BtnState(yellowBtn) && !BtnState(greenBtn)) {
                EngineState = EngineStates.Stopped;
            }
            break;
        case EngineStates.Stopped:
            //Check ignition
            if (BtnState(ignitionBtn) && BtnState(blueBtn) && BtnState(redBtn) && BtnState(yellowBtn) && BtnState(greenBtn)) {
                EngineState = EngineStates.Ignition;
            }
        break;
        case EngineStates.Starting:
            if (!BtnState(engineBtn)) {
                EngineState = EngineStates.Ignition;
            }
        case EngineStates.Ignition: 
            if (!(BtnState(ignitionBtn) && BtnState(blueBtn) && BtnState(redBtn) && BtnState(yellowBtn) && BtnState(greenBtn))) {
                EngineState = EngineStates.Unknown;
            }
            if (BtnState(engineBtn)) {
                starterPressed += GetDeltaMs();
                EngineState = EngineStates.Starting;
                if (starterPressed > 4000) {
                    EngineState = EngineStates.Started;
                }
            } else {
                starterPressed = 0;
                control.timer1.reset();
            }
            break;
        case EngineStates.Started: 
            PlayCustomMelody("C5:2 F:2 F:2 F:1 F:1 F:2 A:2 A:2");
            light.clear();
            light.showRing(`black black black black red red black black black black`, 100)
            light.showRing(`black black black red red red red black black black`, 100)
            light.showRing(`black black red red red red red red black black`, 100)
            light.showRing(`black red red red red red red red red black`, 100)
            light.showRing(`red red red red red red red red red red`, 100)
            EngineState = EngineStates.Running;
        case EngineStates.Running:
            //Check ignition
            if (!BtnState(ignitionBtn)) {
                EngineState = EngineStates.Unknown;
            }
        break;


        default:

        break;
    }
    DisplayEngineStatus();
}

function ShowButtonState(state: number, inverted: boolean = false){
    for (let index = 0; index <= 7; index++) {
        let reg = state & bit(index)
        if ((bit(index) && readMode) > 0) {
            if (reg != 0) {
                SetSwitchLED(GetSwitchLed(index), !inverted)
            } else {
                SetSwitchLED(GetSwitchLed(index), inverted)
            }
        }
    }
}


function ReadBtnStates(): number{
    let oldState = InputPinStates;
    let readInput = pins.i2cReadNumber(
        32,
        NumberFormat.Int8LE,
        false
    )
    InputPinStates = readInput; //Save new state

    OnChangeBtn(readInput, oldState);
    return InputPinStates;
}


function ToBool(inputNumb: number): Boolean {
    if (inputNumb > 0) {
        return true;
    } else {
        return false;
    }
}

function BtnState(btn: number): Boolean {
    return ToBool((InputPinStates & bit(btn)));
}

forever(function () {
    let btnStates = ReadBtnStates();
    //Color mode
    if(BtnState(redSwitch) && BtnState(blueSwitch)) {
        ShowButtonState(btnStates);
        DisplayInteFace();
    } else if (BtnState(redSwitch) && !BtnState(blueSwitch)) {
        ShowButtonState(btnStates);
        EngineStarter();
    }

    if (!(BtnState(redSwitch) && !BtnState(blueSwitch))) {
        //Not engine reset to unknown
        EngineState = EngineStates.Unknown;
    }

    
    
})
