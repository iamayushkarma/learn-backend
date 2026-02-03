import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

const PORT = 7000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.resolve("./public")));
app.get("/", (req, res) => {
  res.render("home");
});

// socket.io
io.on("connection", (socket) => {
  console.log("user connected...");
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
    console.log("Message from user", msg);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
