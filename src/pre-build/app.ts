import { fileURLToPath } from 'url';
import { dirname, join as pathJoin } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import express from "express";

import dotenv from 'dotenv';

import dompurify from "dompurify";
import { marked } from "marked";

// Config
dotenv.config();
const app = express();

app.set('view engine', 'ejs');
app.set('views', pathJoin(__dirname,"../assets/views"));

// Paths
app.get("/",(req,res)=>{
    res.render("index.ejs")
})

var port = <string>process.env.PORT;
app.listen(port,e=>{
    if (e){
        return console.error("Failed to launch! Error:\n",e)
    }
    console.log(`Hosting on port ${port}! http://127.0.0.1:${port}`)
})