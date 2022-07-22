import { WebSocketServer } from 'ws';

class Rooms {
    rooms = new Map()

    constructor(){}

    createRoom(roomName) {
        this.rooms.set(roomName, new Room(roomName))
    }

    hasRoom(roomName){
        return this.rooms.has(roomName)
    }

    getRoom(roomName){
        return this.rooms.get(roomName)
    }

    removeRoom(roomName){
        this.rooms.delete(roomName)
    }
}

class Room {
    roomName
    clients = new Map()
    WSS
    state = {}
    owner
    settings = { isCardsVisible: false }

    constructor(roomName){
        this.roomName = roomName;
        this.WSS = new WebSocketServer({ noServer: true })
        this.init()
    }

    getPort(){
        return this.WSS.options.port
    }

    getSocket(){
        return this.WSS
    }

    addClient(clientId, ws){
        this.clients.set(clientId, ws)
        if (!this.owner){
            this.setOwner(clientId)
        }
    }

    removeClient(clientId){
        this.clients.delete(clientId)
    }

    saveClientName(clientId, clientName){
        this.state[clientId] = {}
        this.state[clientId].clientName = clientName
    }

    setOwner(clientId){
        this.owner = clientId
    }

    populateState(){
        Object.keys(this.state).forEach((id) => {
            if (id !== 'isCardsVisible'){
                this.state[id].owner = this.owner === id
            }
        })
    }

    sendMessageToAll(keys, messages){
        this.populateState();
        let message = {}

        keys.forEach((key, index) => {
            message[key] = messages[index]
        })

        this.getClients().forEach((client) => {
            client.send(JSON.stringify(message))
        });
        console.log(message, "message")
    }

    getClients(){
        return Array.from(this.clients.values())
    }

    clearVotes(){
        Object.keys(this.state).forEach((id) => {
            this.state[id].vote = undefined
        })
    }

    init(){
        this.WSS.on("connection", ws => {
            console.log("connection emitted")
            this.addClient(cId, ws);
            this.saveClientName(cId, cName)
            
            this.sendMessageToAll(["settings", "state"], [this.settings, this.state])
            
            ws.on("message", rawData => {
                let parsedData = JSON.parse(rawData.toString("utf-8"))
                
                if ( parsedData.vote && parsedData.clientId ){
                    let { clientId, vote } = parsedData;
                    this.state[clientId].vote = vote;
                    this.sendMessageToAll(["state"], [this.state])
                }

                if (parsedData.resetRoom && parsedData.isCardsVisible !== undefined){
                    this.clearVotes();
                    this.settings.isCardsVisible = false
                    this.sendMessageToAll(["settings", "state"], [this.settings, this.state])
                    console.log(this.state,"\n\n\n\n" ,this.settings)
                }

                if ( parsedData.isCardsVisible !== undefined){
                    let { isCardsVisible } = parsedData;
                    this.settings.isCardsVisible = isCardsVisible
                    this.sendMessageToAll(["settings"], [this.settings])   
                }

                if ( parsedData.actualCards){
                    let { actualCards } = parsedData;
                    this.settings.actualCards = actualCards;
                    this.sendMessageToAll(["settings"], [this.settings])
                }
                
            });  
             
            ws.on("close", () => {
                let clientCount = Array.from(this.WSS.clients).length
                if (!clientCount){
                    rooms.removeRoom(this.roomName)
                } 
            });
            
            ws.onerror = function () {
                console.log("Some Error occurred")
            }
        });
    }
}

export const rooms = new Rooms();
let cId, cName

export function createRoom(req, res){
    const { roomName, clientId, clientName } = req.params
    cId = clientId;
    cName = clientName;

    if (rooms.hasRoom(roomName)){
        res.status(400).send({
            error: true,
            message: "room already exists"
        })
    }
    else {     
        rooms.createRoom(roomName)
        let port = process.env.PORT ?? 4000
        res.json({ port })
    }
  
}

export function joinRoom(req, res) {
    const {roomName, clientId, clientName } = req.params
    cId = clientId
    cName = clientName;
    
    if (rooms.hasRoom(roomName)){
        let port = 4000
        res.json({ port })
    } 
    else {
       res.json({error: true, message: `There is no room with name: ${roomName}`})
    }
}


