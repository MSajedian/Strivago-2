import express from "express"
import cors from "cors"
import accommodationRouter from "./services/accommodation/index.js"
import destinationRouter from "./services/destination/index.js"
import usersRouter from "./services/users/index.js"

import { forbiddenHandler, notFoundErrorHandler, badRequestErrorHandler, catchAllErrorHandler, unAuthorizedHandler } from "./errorHandlers.js"


const server = express()

// ******** MIDDLEWARES ************

server.use(express.json())
// server.use(cors())

// ******** ROUTES ************

server.use("/user", usersRouter)
server.use("/accommodation", accommodationRouter)
server.use("/destinations", destinationRouter)
server.get("/test", (req, res) => { res.status(200).send({ message: "Test Success!" }) })

// ******** ERROR MIDDLEWARES ************

server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(unAuthorizedHandler)
server.use(forbiddenHandler)
server.use(catchAllErrorHandler)



export default server
