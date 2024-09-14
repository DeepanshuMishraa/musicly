"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const url_1 = require("url");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let spaces = {};
wss.on("connection", (ws, req) => {
    const parameters = (0, url_1.parse)(req.url || "", true);
    const spaceId = parameters.query.spaceId;
    const userId = parameters.query.userId;
    if (!spaceId || !userId) {
        ws.close();
        return;
    }
    // Add user to the space
    if (!spaces[spaceId]) {
        spaces[spaceId] = {};
    }
    spaces[spaceId][userId] = ws;
    ws.on("message", (message) => {
        const data = JSON.parse(message);
        // Broadcast messages to other users in the same space
        if (data.type && data.payload) {
            Object.keys(spaces[spaceId]).forEach((uid) => {
                if (uid !== userId) {
                    spaces[spaceId][uid].send(JSON.stringify(data));
                }
            });
        }
    });
    ws.on("close", () => {
        // Remove user from space
        if (spaces[spaceId]) {
            delete spaces[spaceId][userId];
            if (Object.keys(spaces[spaceId]).length === 0) {
                delete spaces[spaceId];
            }
        }
    });
});
console.log("WebSocket server started on port 8080");
