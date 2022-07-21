import express from "express";
import routes from "./src/routes/appRoutes.js";
import cors from "cors";
import { parse } from 'url';
import { rooms } from "./src/controllers/roomController.js";
 

const app = express();
app.use(cors());

export const PORT = process.env.PORT ? process.env.PORT : 4000;
 
routes(app);  

app.get("/", (req, res) => { 
  res.send(`node and express server running on port ${PORT}`);
});

const server = app.listen(PORT, () => {
  console.log(`your server is running on port ${PORT}`);
}); 

server.on('upgrade', (request, socket, head) => {
  const { pathname } = parse(request.url);
  const roomName = pathname.split("/")[1]
  const wss = rooms.getRoom(roomName).getSocket()

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
})

