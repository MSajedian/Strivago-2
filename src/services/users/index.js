import express from "express"
import UserModel from "./schema.js"
import createError from "http-errors"
import { JWTAuthMiddleware } from '../../auth/middlewares.js'
import { JWTAuthenticate } from "../../auth/tools.js"
import { adminOnly } from '../../auth/adminOnly.js'
import { hostOnly } from '../../auth/hostOnly.js'
import AccommodationModel from "../accommodation/schema.js"

const usersRouter = express.Router()

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body)
    await newUser.save()

    const { email, password } = req.body
    // 1. Verify credentials
    const user = await UserModel.checkCredentials(email, password)
    if (user) {
      // 2. Generate token if credentials are ok
      const accessToken = await JWTAuthenticate(user)
      // 3. Send token as a response
      res.status(201).send({ accessToken })
    }
  } catch (error) {
    console.log(error)
    if (error.name === "ValidationError") {
      next(createError(400, error))
    } else {
      next(createError(500, "An error occurred while saving user"))
    }
  }
})

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body
    // 1. Verify credentials
    const user = await UserModel.checkCredentials(email, password)
    if (user) {
      // 2. Generate token if credentials are ok
      const accessToken = await JWTAuthenticate(user)
      // 3. Send token as a response
      res.send({ accessToken })
    } else {
      next(createError(401))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user)
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await req.user.deleteOne()
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.user._id, req.body, {
      runValidators: true,
      new: true,
    })
    if (user) {
      res.send(user)
    } else {
      next(createError(404, `User ${req.params.id} not found`))
    }
  } catch (error) {
    console.log(error)
    next(createError(500, "An error occurred while modifying user"))
  }
})

// **************************** /me/accommodation ****************************
usersRouter.post("/me/accommodation", JWTAuthMiddleware, hostOnly, async (req, res, next) => {
  try {
    const { name, description, maxGuests, city, available } = req.body

    if (!name || !description || !maxGuests || !city || !available) throw new Error("Invalid data")

    // const user = req.user._id
    const accommodation = new AccommodationModel({ name, description, maxGuests, city, "user": req.user._id, available })
    const { _id } = await accommodation.save()

    res.status(201).send({ _id })
    // res.status(201).send()

  } catch (error) {
    res.status(400).send({ message: error.message })
  }
})

usersRouter.get("/me/accommodation", JWTAuthMiddleware, hostOnly, async (req, res, next) => {
  try {
    const accommodation = await AccommodationModel.find({ user: req.user._id })
    res.status(200).send(accommodation)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/me/available-accommodation", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const accommodation = await AccommodationModel.find({ available: true })
    res.status(200).send(accommodation)
  } catch (error) {
    next(error)
  }
})


// *************************************************************************************

// **************************** For Admin ****************************

usersRouter.get("/", JWTAuthMiddleware, adminOnly, async (req, res, next) => {
  try {
    const users = await UserModel.find()
    res.send(users)
  } catch (error) {
    next(error)
  }
})


usersRouter.get("/:id", JWTAuthMiddleware, adminOnly, async (req, res, next) => {
  try {
    const id = req.params.id
    const user = await UserModel.findById(id)
    if (user) {
      res.send(user)
    } else {
      next(createError(404, `User ${req.params.id} not found`))
    }
  } catch (error) {
    console.log(error)
    next(createError(500, "An error occurred while getting user"))
  }
})



usersRouter.put("/:id", JWTAuthMiddleware, adminOnly, async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    })
    if (user) {
      res.send(user)
    } else {
      next(createError(404, `User ${req.params.id} not found`))
    }
  } catch (error) {
    console.log(error)
    next(createError(500, "An error occurred while modifying user"))
  }
})

usersRouter.delete("/:id", JWTAuthMiddleware, adminOnly, async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id)
    if (user) {
      res.status(204).send()
    } else {
      next(createError(404, `User ${req.params.id} not found`))
    }
  } catch (error) {
    console.log(error)
    next(createError(500, "An error occurred while deleting"))
  }
})

export default usersRouter
