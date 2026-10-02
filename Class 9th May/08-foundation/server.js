import React from "react";
import express from "express";
import ReactDOMServer from "react-dom/server";
import App from "./src/App.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/html", (req, res) => {
  const html = ReactDOMServer.renderToString(React.createElement(App));
  res.setHeader("Content-Type", "text/html");

  res.send(`
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
        </head>
        <body>
            <div id="root">${html}</div>
        </body>
        </html>
    `);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
