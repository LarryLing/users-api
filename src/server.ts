import express, { Express, Request, Response } from "express";
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import { User } from "./Types/User";
import { error } from "console";

dotenv.config();

const app : Express = express()
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

app.get("/api", (request : Request, response : Response) => {
    response.json({ "message" : "Hello world!" });
});

app.get("/api/users", async (request : Request, response : Response) => {
    try {
        const result = await pool.query<User>("SELECT * FROM users ORDER BY id ASC");
        response.status(200).json(result.rows);
    } 
    catch (error) {
        console.error("Query error: ", error);
        response.status(500).json({ error : "An internal server error occured!" });
    }
});

app.get("/api/users/:id", async (request : Request, response : Response) => {
    const parsedId = parseInt(request.params.id);
    if (isNaN(parsedId)) response.status(400).json({ error : "Requested with an invalid ID!"});

    try {
        const users = await pool.query<User>("SELECT * FROM users WHERE id = $1", [request.params.id]);
        if (users.rows.length === 0) {
            response.status(404).json({ error : "User not found!" });
        }
        response.status(200).json(users.rows[0]);
    } 
    catch (error) {
        console.error("Query error: ", error);
        response.status(500).json({ error : "An internal server error occured!" });
    }
});

app.post("/api/users", async (request : Request, response : Response) => {
    const { id, first_name, last_name, email, phone_number, hometown } : User = request.body;

    try {
        await pool.query<User>(
            "INSERT INTO users (id, first_name, last_name, email, phone_number, hometown) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [id, first_name, last_name, email, phone_number, hometown]
        );
        response.status(201).send(`User added with ID: ${ id }`);
    }
    catch (error) {
        console.error("Query error: ", error);
        response.status(500).json({ error : "An internal server error occured!" });
    }
});

app.put("/api/users/:id", async (request : Request, response : Response) => {
    const parsedId = parseInt(request.params.id);
    if (isNaN(parsedId)) response.status(400).json({ error : "Requested with an invalid ID!"});

    const { id, first_name, last_name, email, phone_number, hometown } : User = request.body;

    try {
        await pool.query<User>(
            "UPDATE users SET first_name=$1, last_name=$2, email=$3, phone_number=$4, hometown=$5 WHERE id=$6",
            [first_name, last_name, email, phone_number, hometown, parsedId]
        );
        response.status(200).send(`User modified with ID: ${ id }`);
    }
    catch (error) {
        console.error("Query error: ", error);
        response.status(500).json({ error : "An internal server error occured!" });
    }
});

app.delete("/api/users/:id", async (request : Request, response : Response) => {
    const parsedId = parseInt(request.params.id);
    if (isNaN(parsedId)) response.status(400).json({ error : "Requested with an invalid ID!"});

    try {
        await pool.query<User>("DELETE FROM users WHERE id=$1", [parsedId]);
    
        response.status(200).send(`User deleted with ID: ${ parsedId }`);
    }
    catch (error) {
        console.error("Query error: ", error);
        response.status(500).json({ error : "An internal server error occured!" });
    }
})

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});