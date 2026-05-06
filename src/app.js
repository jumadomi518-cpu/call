const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const WebSocket = require("ws");

const wss = new WebSocket.Server({ server });
const clients = new Map();

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (data) => {
    let msg;

    try {
      msg = JSON.parse(data);
    } catch {
      console.log("Invalid JSON");
      return;
    }

    // REGISTER USER
    if (msg.type === "id") {
      clients.set(msg.id, ws);
      ws.userId = msg.id;
      console.log("User registered:", msg.id);
      return;
    }

    const targetWs = clients.get(msg.to);

    // CHECK TARGET EXISTS
    if (!targetWs) {
      console.log("User not found:", msg.to);
      return;
    }

    // CHECK SOCKET IS OPEN
    if (targetWs.readyState !== WebSocket.OPEN) {
      console.log("Socket not open for:", msg.to);
      return;
    }

    // FORWARD MESSAGES
    if (msg.type === "offer") {
      targetWs.send(JSON.stringify({
        type: "offer",
        offer: msg.offer,
        from: msg.from
      }));
    }

    if (msg.type === "answer") {
      targetWs.send(JSON.stringify({
        type: "answer",
        answer: msg.answer,
        from: msg.from
      }));
    }

    if (msg.type === "candidate") {
      targetWs.send(JSON.stringify({
        type: "candidate",
        candidate: msg.candidate,
        from: msg.from
      }));
    }
  });

  // CLEAN UP ON DISCONNECT
  ws.on("close", () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log("User disconnected:", ws.userId);
    }
  });
});

server.listen(4000, () => {
  console.log("server listening on 4000");
});
