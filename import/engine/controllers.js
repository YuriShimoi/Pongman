class KeyControl {
    static _keyUpListener = KeyControl.listenerUp.bind(KeyControl);
    static _keyDownListener = KeyControl.listenerDown.bind(KeyControl);
    
    static _keysPressed = [];
    static _key_mapping = {
        '8'  : "backspace",
        '9'  : "tab",
        '13' : "enter",
        '16' : "shift",
        '17' : "control",
        '18' : "alt",
        '20' : "capslock",
        '27' : "esc",
        '32' : "space",
        '37' : "left",
        '38' : "up",
        '39' : "right",
        '40' : "down",
        '144': "numlock",
        '186': "ç"
    };

    static _upPromises   = {};
    static _downPromises = {};
    static _holdPromises = {};

    static start() {
        window.addEventListener('keyup', KeyControl._keyUpListener);
        window.addEventListener('keydown', KeyControl._keyDownListener);
    }

    static isPressed(keycode) {
        return KeyControl._keysPressed.includes(keycode.toUpperCase());
    }

    static whenPressed(keycode, func, keepUntilUp=false) {
        if(Array.isArray(keycode)) {
            for(let k in keycode) {
                KeyControl.whenPressed(keycode[k], func, keepUntilUp);
            }
        }
        else {
            keycode = keycode.toUpperCase();
            if(keepUntilUp) {
                if(keycode in KeyControl._holdPromises)
                    KeyControl._holdPromises[keycode].push(func);
                else
                    KeyControl._holdPromises[keycode] = [func];
            }
            else {
                if(keycode in KeyControl._downPromises)
                    KeyControl._downPromises[keycode].push(func);
                else
                    KeyControl._downPromises[keycode] = [func];
            }
        }
    }

    static whenUnpressed(keycode, func) {
        if(Array.isArray(keycode)) {
            for(let k in keycode) {
                KeyControl.whenUnpressed(keycode[k], func);
            }
        }
        else {
            keycode = keycode.toUpperCase();
            if(keycode in KeyControl._upPromises)
                    KeyControl._upPromises[keycode].push(func);
                else
                    KeyControl._upPromises[keycode] = [func];
        }
    }

    static listenerUp(e) {
        let keycode = e.keyCode || e.which;
        keycode = KeyControl.translateKey(keycode);

        if(KeyControl._keysPressed.includes(keycode)) {
            KeyControl._keysPressed.splice(KeyControl._keysPressed.indexOf(keycode), 1);

            if(keycode in KeyControl._upPromises) {
                for(let i in KeyControl._upPromises[keycode]) {
                    KeyControl._upPromises[keycode][i]();
                }
            }
        }
    }

    static listenerDown(e) {
        let keycode = e.keyCode || e.which;
        keycode = KeyControl.translateKey(keycode);

        if(!KeyControl._keysPressed.includes(keycode)) {
            KeyControl._keysPressed.push(keycode);

            if(keycode in KeyControl._downPromises) {
                for(let i in KeyControl._downPromises[keycode]) {
                    KeyControl._downPromises[keycode][i]();
                }
            }
        }
    }

    static runHolders() {
        for(let keycode in KeyControl._holdPromises) {
            if(KeyControl.isPressed(keycode)) {
                for(let i in KeyControl._holdPromises[keycode]) {
                    KeyControl._holdPromises[keycode][i]();
                }
            }
        }
    }

    static translateKey(keycode) {
        keycode = '' + keycode;
        let translation = keycode in KeyControl._key_mapping?
                            KeyControl._key_mapping[keycode]:
                            String.fromCharCode(keycode);
        return translation.toUpperCase();
    }
}