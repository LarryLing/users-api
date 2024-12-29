import express, { Express, Request, Response } from "express";
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import { User } from "./Types/user";

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

app.get(
    "/api", 
    (req : Request, res : Response) => {
    res.json({ "message" : "Hello world!" });
    }
);

app.get(
    "/api/users", 
    async (req : Request, res : Response) => {
        try {
            const result = await pool.query<User>(
                "SELECT * FROM users ORDER BY id ASC"
            );
            res.json(result.rows);
        } catch (error) {
            console.error("Query error: ", error);
            res.status(500).json({ error : "Failed to fetch users" });
        }
    }
);

app.get(
    "/api/users/:id", 
    async (req : Request, res : Response) => {
        try {
            const result = await pool.query<User>(
                "SELECT * FROM users WHERE id = $1",
                [req.params.id]
            );
            
            // if (result.rows.length === 0) {
            //     return res.status(404).json({ error : "User not found" });
            // }

            res.json(result.rows[0]);
        } catch (error) {
            console.error("Query error: ", error);
            res.status(500).json({ error : "Failed to fetch users" });
        }
    }
);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});