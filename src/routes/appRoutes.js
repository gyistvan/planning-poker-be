import {createRoom, joinRoom} from "../controllers/roomController.js";

export default function routes(app) {
    app.route("/createRoom/:roomName/:clientId/:clientName")
        .post(createRoom)
    
    app.route("/joinRoom/:roomName/:clientId/:clientName")
        .post(joinRoom)
}
