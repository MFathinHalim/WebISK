const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const { JSDOM } = require("jsdom");

let leaderboard = [];

const refreshData = () => {
  JSDOM.fromURL("https://lurkr.gg/levels/1054414599945998416")
    .then((dom) => {
      leaderboard = [];
      const names = dom.window.document.querySelectorAll("td:nth-child(2) span");
      const levels = dom.window.document.querySelectorAll("td:last-child span");
      const imgs = dom.window.document.querySelectorAll(".gap-4 > img");

      names.forEach((name, i) => {
        leaderboard.push({
          peringkat: i + 1,
          name: name.textContent,
          level: levels[i].textContent,
          pp: imgs[i].getAttribute("src"),
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching HTML content:", error);
    });
};

refreshData();

setInterval(refreshData, 60000);

const app = express();

const saranRouter = require("./routes/saran")

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/node_modules/bootstrap/dist")))
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", function (req, res) {
  res.render("home", { title: "Home", leaderboard });
});

app.get("/leaderboard", function (req, res) {
  res.render("leaderboard", {
    data: leaderboard,
  });
});

const uri = process.env.MONGODBURI;
const port = 8080;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Increase the server selection timeout
  })
  .then(() => {
    console.log("Connected to the database");
    app.use("/saran", saranRouter)
    app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    console.log("Disabled /saran");
    app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
  });
