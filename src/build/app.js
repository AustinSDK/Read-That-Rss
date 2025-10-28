import { fileURLToPath } from 'url';
import { dirname, join as pathJoin, resolve as pathResolve } from 'path';
import { existsSync } from 'fs';
import express from "express";
import dotenv from 'dotenv';
import dompurify from "dompurify";
import { marked } from "marked";
import Parser from "rss-parser";
// Config
let parser = new Parser();
dotenv.config();
const app = express();
// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __assets = pathJoin(__dirname, "../assets");
app.set('view engine', 'ejs');
app.set('views', pathJoin(__assets, "views"));
// Paths
app.get("/", (req, res) => {
    res.render("index.ejs");
});
app.get("/feed", async (req, res) => {
    if (!req.query || !req.query.url) {
        return res.redirect("/");
    }
    try {
        let _fetch = await fetch(req.query.url);
        let _text = await _fetch.text();
        var feed = await parser.parseString(_text);
        res.render("feed.ejs", { feed: feed });
    }
    catch (e) {
        console.error(e);
        return res.redirect("/");
    }
});
app.get("/test.xml", async (req, res) => {
    return res.sendFile(pathJoin(__assets, "test.xml"));
});
app.get("/css/:stylesheet", (req, res) => {
    let cssPath = pathJoin(__assets, "css");
    let newPath = pathResolve(pathJoin(cssPath, req.params.stylesheet));
    if (!newPath.startsWith(cssPath)) {
        return res.status(400).json({ "Error": "Please we are just a blog. dont hack meeeeeeeeeeeeee" });
    }
    if (!existsSync(newPath)) {
        return res.status(404).json({ "Error": "Could not find the file." });
    }
    res.sendFile(newPath);
});
var port = process.env.PORT;
app.listen(port, e => {
    if (e) {
        return console.error("Failed to launch! Error:\n", e);
    }
    console.log(`Hosting on port ${port}! http://127.0.0.1:${port}`);
});
//# sourceMappingURL=app.js.map