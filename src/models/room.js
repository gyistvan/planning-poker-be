import { WebSocketServer } from "ws";
import { cId, cName } from '../controllers/room-controller.js';

export class Room {
  roomName;
  clients = new Map();
  WSS;
  state = {};
  owner;
  settings = { isCardsVisible: false };

  constructor(roomName) {
    this.roomName = roomName;
    this.WSS = new WebSocketServer({ noServer: true });
    this.init();
  }

  getPort() {
    return this.WSS.options.port;
  }

  getSocket() {
    return this.WSS;
  }

  addClient(clientId, ws) {
    this.clients.set(clientId, ws);
    if (!this.owner) {
      this.setOwner(clientId);
    }
  }

  removeClient(clientId) {
    this.clients.delete(clientId);
  }

  saveClientName(clientId, clientName) {
    this.state[clientId] = {};
    this.state[clientId].clientName = clientName;
  }

  setOwner(clientId) {
    this.owner = clientId;
  }

  populateState() {
    Object.keys(this.state).forEach((id) => {
      if (id !== "isCardsVisible") {
        this.state[id].owner = this.owner === id;
      }
    });
  }

  sendMessageToAll(keys, messages) {
    this.populateState();
    let message = {};

    keys.forEach((key, index) => {
      message[key] = messages[index];
    });

    this.getClients().forEach((client) => {
      client.send(JSON.stringify(message));
    });
  }

  getClients() {
    return Array.from(this.clients.values());
  }

  clearVotes() {
    Object.keys(this.state).forEach((id) => {
      this.state[id].vote = undefined;
    });
  }

  init() {
    this.WSS.on("connection", (ws) => {
      this.addClient(cId, ws);
      this.saveClientName(cId, cName);

      this.sendMessageToAll(
        ["settings", "state", "newClientConnected"],
        [this.settings, this.state, { clientName: cName, clientId: cId }]
      );

      ws.on("message", (rawData) => {
        let parsedData = JSON.parse(rawData.toString("utf-8"));

        if (parsedData.vote && parsedData.clientId) {
          let { clientId, vote } = parsedData;
          this.state[clientId].vote = vote;
          this.sendMessageToAll(["state"], [this.state]);
        }

        if (parsedData.resetRoom && parsedData.isCardsVisible !== undefined) {
          this.clearVotes();
          this.settings.isCardsVisible = false;
          this.sendMessageToAll(
            ["settings", "state"],
            [this.settings, this.state]
          );
        }

        if (parsedData.isCardsVisible !== undefined) {
          let { isCardsVisible } = parsedData;
          this.settings.isCardsVisible = isCardsVisible;
          this.sendMessageToAll(
            ["settings", "cardsRevealed"],
            [this.settings, true]
          );
        }

        if (parsedData.actualCards) {
          let { actualCards } = parsedData;
          this.settings.actualCards = actualCards;
          this.sendMessageToAll(["settings"], [this.settings]);
        }
      });

      ws.on("close", () => {
        let clientCount = Array.from(this.WSS.clients).length;
        if (!clientCount) {
          rooms.removeRoom(this.roomName);
        }
      });

      ws.onerror = function () {
        console.log("Some Error occurred");
      };
    });
  }
}
