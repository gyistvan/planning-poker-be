import { Room } from './room.js';

export class Rooms {
  rooms = new Map();

  constructor() {}

  createRoom(roomName) {
    this.rooms.set(roomName, new Room(roomName));
  }

  hasRoom(roomName) {
    return this.rooms.has(roomName);
  }

  getRoom(roomName) {
    return this.rooms.get(roomName);
  }

  removeRoom(roomName) {
    this.rooms.delete(roomName);
  }
}
