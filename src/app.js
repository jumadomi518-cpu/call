

  const express = require("express");
  const app = express();
  const http = require("http");
  const server = http.createServer(app);
  const WebSocket = require("ws");
  const wss = new WebSocket.Server({ server });
  const clients = new Map();

  wss.on("connection", (ws) => {
  ws.on("message", (data) => {
   const msg = JSON.parse(data);
   if (msg.type === "id") {
   clients.set(msg.id, ws);
    }

  if (msg.type === "offer") {
  const targeterWs = clients.get(msg.to);
  targeterWs.send(JSON.stringify({
   type: "offer",
   offer: msg.offer,
   from: msg.from
    }))
    }

  if (msg.type === "answer") {
  const targeterWs = clients.get(msg.to);
  targeterWs.send(JSON.stringify({
   type: "answer",
   answer: msg.answer,
   from: msg.from
    }))
    }
  if (msg.type === "candidate") {
  const targeterWs = clients.get(msg.to);
  targeterWs.send(JSON.stringify({
   type: "candidate",
   candidate: msg.candidate,
   from: msg.from
    }))
    }

   })
  })

server.listen(4000, () => {
console.log("server listening");
});
