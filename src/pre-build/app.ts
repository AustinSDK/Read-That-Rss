import { fileURLToPath } from 'url';
import { dirname, join as pathJoin, resolve as pathResolve } from 'path';

import { existsSync, readFileSync, writeFileSync } from 'fs';

import express from "express";

import dotenv from 'dotenv';

import { marked } from "marked";

import Parser from "rss-parser"

// Config
let parser = new Parser();
dotenv.config();
const app = express();

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __assets = pathJoin(__dirname,"../assets");
const __linksPath = pathJoin(__assets, "db", "links.json");

// Helper functions for links.json
function removeProtocol(url: string): string {
    return url.replace(/^https?:\/\//, '');
}

function loadLinksData(): any[] {
    try {
        if (existsSync(__linksPath)) {
            const data = readFileSync(__linksPath, 'utf8');
            const parsed = JSON.parse(data);
            // Handle both old single object format and new array format
            if (Array.isArray(parsed)) {
                return parsed;
            } else if (parsed.url) {
                // Convert old format to array
                return [parsed];
            }
        }
    } catch (e) {
        console.error('Error loading links.json:', e);
    }
    return []; // Default empty array
}

function saveLinksData(feedData: any, originalUrl: string): void {
    try {
        const cleanUrl = removeProtocol(originalUrl);
        const newFeedData = {
            url: cleanUrl,
            items: feedData.items ? feedData.items.length : 0,
            title: feedData.title || '',
            description: feedData.description || '',
            link: feedData.link ? removeProtocol(feedData.link) : '',
            lastUpdated: new Date().toISOString(),
            feedUrl: cleanUrl
        };
        
        let linksArray = loadLinksData();
        
        // Check if feed already exists (prevent duplicates)
        const existingIndex = linksArray.findIndex(feed => feed.url === cleanUrl || feed.feedUrl === cleanUrl);
        
        if (existingIndex !== -1) {
            // Update existing feed data
            linksArray[existingIndex] = { ...linksArray[existingIndex], ...newFeedData };
            console.log('Updated existing feed metadata in links.json');
        } else {
            // Add new feed data
            linksArray.push(newFeedData);
            console.log('Added new feed metadata to links.json');
        }
        
        writeFileSync(__linksPath, JSON.stringify(linksArray, null, 2));
    } catch (e) {
        console.error('Error saving to links.json:', e);
    }
}

app.set('view engine', 'ejs');
app.set('views', pathJoin(__assets,"views"));

// Paths
app.get("/",(req,res)=>{
    res.render("index.ejs")
})
app.get("/links", (req, res) => {
    const linksData = loadLinksData();
    res.json(linksData);
})
app.get("/feed",async (req,res)=>{
    if (!req.query || !req.query.url){
        return res.redirect("/")
    }
    try{
        let _fetch = await fetch(<string>req.query.url);
        let _text = await _fetch.text();
        var feed = await parser.parseString(_text);
        
        // Save feed metadata to links.json
        saveLinksData(feed, <string>req.query.url);
        
        res.render("feed.ejs",{feed:feed});
    } catch (e){
        console.error(e)
        return res.redirect("/")
    }
})
app.get("/test.xml",async (req,res)=>{
    return res.sendFile(pathJoin(__assets,"test.xml"))
})
app.get("/css/:stylesheet",(req,res)=>{
    let cssPath = pathJoin(__assets,"css");
    let newPath = pathResolve(pathJoin(cssPath,req.params.stylesheet));

    if (!newPath.startsWith(cssPath)){
        return res.status(400).json({"Error":"Please we are just a blog. dont hack meeeeeeeeeeeeee"});
    }
    if (!existsSync(newPath)){
        return res.status(404).json({"Error":"Could not find the file."});
    }
    res.sendFile(newPath);
});
app.get("/images/:image",(req,res)=>{
    let imagesPath = pathJoin(__assets,"images");
    let newPath = pathResolve(pathJoin(imagesPath,req.params.image));

    if (!newPath.startsWith(imagesPath)){
        return res.status(400).json({"Error":"Please we are just a blog. dont hack meeeeeeeeeeeeee"});
    }
    if (!existsSync(newPath)){
        return res.status(404).json({"Error":"Could not find the file."});
    }
    res.sendFile(newPath);
});

app.use((req,res)=>{
    res.redirect("/");
})

var port = <string>process.env.PORT;
app.listen(port,e=>{
    if (e){
        return console.error("Failed to launch! Error:\n",e)
    }
    console.log(`Hosting on port ${port}! http://127.0.0.1:${port}`)
})