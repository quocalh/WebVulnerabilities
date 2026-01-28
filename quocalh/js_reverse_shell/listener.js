const net = require("net");
const readline = require("readline");

const PORT = 1234;
const HOST = "0.0.0.0";

// Create TCP server
const server = net.createServer((socket) => {
  console.log(`[*] Connected by ${socket.remoteAddress}:${socket.remotePort}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "Shell> "
  });

  rl.prompt();

  rl.on("line", (line) => {
    const command = line.trim();

    if (command.toLowerCase() === "exit") {
      socket.end();
      rl.close();
      server.close();
      return;
    }

    socket.write(command + "\n");
  });

  socket.on("data", (data) => {
    console.log(data.toString("utf8"));
    rl.prompt();
  });

  socket.on("close", () => {
    console.log("[*] Connection closed");
    rl.close();
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });
});

// Start listening
server.listen(PORT, HOST, () => {
  console.log(`[*] Listening on port ${PORT}...`);
});
