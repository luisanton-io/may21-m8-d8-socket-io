import supertest from "supertest"
import app from "../app";
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const request = supertest(app)

describe("Testing env", () => {
    it("should test that true is true", () => {
        expect(true).toBeTruthy();
    })

})

describe("Testing endpoints", () => {

    beforeAll(done => {
        if (!process.env.MONGO_URL_TEST) {
            throw new Error("No Mongoo")
        }
        mongoose.connect(process.env.MONGO_URL_TEST).then(() => {
            console.log("Connected to MongoDB")
            done()
        })
    })

    afterAll(done => {
        mongoose.connection.dropDatabase().then(() => {
            mongoose.connection.close()
            done()
        })
    })

    it("should test that the GET /test endpoint is ok", async () => {
        const response = await request.get("/test")

        expect(response.status).toBe(200)
        expect(response.body.message).toBe("Test success")

    })

    // Create an endpoint to POST a new user

    const validUser = {
        username: "Alice",
        email: "alice@example.com"
    }

    it("should test that the POST /users endpoint is creating a new user", async () => {
        const response = await request.post("/users").send(validUser)

        console.log(response.body)

        expect(response.status).toBe(201)
        expect(response.body._id).toBeDefined()
    })

    // Create an endpoint to GET an existing user

    it("should test that the GET /users/{id} is retrieving the correct user", async () => {

        const response = await request.post("/users").send(validUser)
        const { _id } = response.body

        const getResponse = await request.get(`/users/${_id}`)

        expect(getResponse.body.email).toBe(validUser.email)

    })

})