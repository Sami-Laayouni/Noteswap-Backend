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
  const id = socket.handshake.query.id;
  if (id) {
    socket.join(id);
    console.log(`Somebody just joined the ${id} group. `);
  }

  socket.on("joined", (data) => {
    const groupId = data.tutoringSessionId; // Or however you access the tutoring session ID from the data object
    const userId = data.userId; // Similarly, ensure this is how you get the user ID from the data object
    const firstName = data.firstName;
    const lastName = data.lastName;
    const profile = data.profile;

    socket.to(groupId).emit("join", {
      message: "Hello from server!",
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      profile: profile,
    });

    console.log(`User ${userId} joined group ${groupId}`);
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
