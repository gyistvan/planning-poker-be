
import { Rooms } from '../models/rooms.js';

export const rooms = new Rooms();
export let cId
export let cName;

export function createRoom(req, res) {
  const { roomName, clientId, clientName } = req.params;
  cId = clientId;
  cName = clientName;

  if (rooms.hasRoom(roomName)) {
    res.status(400).send({
      error: true,
      message: "Room already exists",
    });
  } else {
    rooms.createRoom(roomName);
    let port = process.env.PORT ?? 4000;
    res.json({ port });
  }
}

export function joinRoom(req, res) {
  const { roomName, clientId, clientName } = req.params;
  cId = clientId;
  cName = clientName;

  if (rooms.hasRoom(roomName)) {
    let port = 4000;
    res.json({ port });
  } else {
    res
      .status(400)
      .send({
        error: true,
        message: `There is no room with name: ${roomName}`,
      });
  }
}
