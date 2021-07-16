import mongoose from "mongoose"
import server from "./server.js"
import listEndpoints from "express-list-endpoints"
const port = process.env.PORT || 3001

mongoose
    .connect(process.env.ATLAS_URL + "/strivago2", { useNewUrlParser: true })
    .then(() => {
        console.log("Connected to Atlas!")
        console.table(listEndpoints(server))
        server.listen(port, () => {
            console.log("Server listening on port" , port)
        })
    })
    .catch(error => console.trace(error))