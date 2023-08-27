const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const httpServer = require("http").createServer(app);

app.get("*", (req, res) => {
  return res.send("server");
});
const io = require("socket.io")(httpServer, {
  transports: ["websocket", "polling"],
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("joinGroup", (groupId) => {
    // Join the room with the provided group ID
    socket.join(groupId);
    console.log(`Somebody just joined the ${groupId} group. `);
  });
  socket.on("joined", (groupId) => {
    socket.to(groupId).emit("join", "Hello from server!");
    console.log(`Received joined message from ${groupId}`);
  });
  socket.on("ended", (groupId) => {
    socket.to(groupId).emit("end", "Ended");
    console.log(`The meeting has ended ${groupId}`);
  });
  socket.on("started", (groupId) => {
    socket.to(groupId).emit("start", "Hello from server!");
    console.log(`The meeting has started ${groupId}`);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

httpServer.listen(3001);
