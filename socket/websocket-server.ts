import WebSocket, { WebSocketServer } from "ws";
import { parse } from "url";

interface Spaces {
  [spaceId: string]: {
    [userId: string]: WebSocket;
  };
}

const wss = new WebSocketServer({ port: 8080 });

let spaces: Spaces = {};

wss.on("connection", (ws: WebSocket, req) => {
  const parameters = parse(req.url || "", true);
  const spaceId = parameters.query.spaceId as string;
  const userId = parameters.query.userId as string;

  if (!spaceId || !userId) {
    ws.close();
    return;
  }

  // Add user to the space
  if (!spaces[spaceId]) {
    spaces[spaceId] = {};
  }
  spaces[spaceId][userId] = ws;

  ws.on("message", (message: string) => {
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
