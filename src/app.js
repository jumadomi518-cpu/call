const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (data) => {
    let msg;

    try {
      msg = JSON.parse(data);
    } catch {
      console.log("Invalid JSON");
      return;
    }

    // REGISTER
    if (msg.type === "id") {
      clients.set(msg.id, ws);
      ws.userId = msg.id;
      console.log("Registered:", msg.id);
      return;
    }

    const target = clients.get(msg.to);

    if (!target) {
      console.log("User not found:", msg.to);
      return;
    }

    if (target.readyState !== WebSocket.OPEN) {
      console.log("Socket not open:", msg.to);
      return;
    }

    console.log(`Forwarding ${msg.type} from ${msg.from} → ${msg.to}`);

    target.send(JSON.stringify(msg));
  });

  ws.on("close", () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log("Disconnected:", ws.userId);
    }
  });
});

server.listen(4000, () => {
  console.log("Server running on port 4000");
});
