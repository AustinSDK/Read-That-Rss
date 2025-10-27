import express from "express";
import dotenv from 'dotenv';

// config
dotenv.config();
const app = express();

var port = <string>process.env.PORT;
app.listen(port,e=>{
    if (e){
        return console.error("Failed to launch! Error:\n",e)
    }
    console.log(`Hosting on port ${port}! http://127.0.0.1:${port}`)
})