import express from "express";
import routes from "./src/routes/appRoutes.js";
import cors from "cors";
 

const app = express();
app.use(cors());
const PORT = process.env.PORT ? process.env.PORT : 4000;
 
routes(app);  

app.get("/", (req, res) => { 
  res.send(`node and express server running on port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`your server is running on port ${PORT}`);
}); 