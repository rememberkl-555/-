import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // API routes FIRST
  app.get("/api/pokemon-image/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      // Fetch from a reliable source server-side
      const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${filename}`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(404).send('Not found');
      }
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(Buffer.from(buffer));
    } catch (e) {
      console.error('Error proxying image:', e);
      res.status(500).send('Error fetching image');
    }
  });

  app.get("/api/item-image/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${filename}`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(404).send('Not found');
      }
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(Buffer.from(buffer));
    } catch (e) {
      console.error('Error proxying item image:', e);
      res.status(500).send('Error fetching image');
    }
  });

  // Matchmaking queue
  let queue: { socketId: string; userData: any }[] = [];
  const rooms = new Map<string, Set<string>>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_queue", (userData) => {
      // Remove if already in queue
      queue = queue.filter((q) => q.socketId !== socket.id);
      queue.push({ socketId: socket.id, userData });
      console.log("User joined queue:", socket.id, "Queue size:", queue.length);

      if (queue.length >= 2) {
        const player1 = queue.shift()!;
        const player2 = queue.shift()!;

        const roomId = `room_${player1.socketId}_${player2.socketId}`;
        rooms.set(roomId, new Set([player1.socketId, player2.socketId]));
        
        // Join rooms on server side immediately
        const s1 = io.sockets.sockets.get(player1.socketId);
        const s2 = io.sockets.sockets.get(player2.socketId);
        s1?.join(roomId);
        s2?.join(roomId);

        io.to(player1.socketId).emit("match_found", {
          roomId,
          opponentId: player2.socketId,
          opponentData: player2.userData,
          isFirst: true,
        });

        io.to(player2.socketId).emit("match_found", {
          roomId,
          opponentId: player1.socketId,
          opponentData: player1.userData,
          isFirst: false,
        });

        console.log("Match found! Room:", roomId);
      }
    });

    socket.on("leave_queue", () => {
      queue = queue.filter((q) => q.socketId !== socket.id);
      console.log("User left queue:", socket.id);
    });

    socket.on("game_action", ({ roomId, action }) => {
      socket.to(roomId).emit("opponent_action", action);
    });

    socket.on("disconnect", () => {
      queue = queue.filter((q) => q.socketId !== socket.id);
      
      // Notify rooms
      rooms.forEach((players, roomId) => {
        if (players.has(socket.id)) {
          socket.to(roomId).emit("opponent_disconnected");
          rooms.delete(roomId);
        }
      });
      
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
