const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let leaderboard = [];
// Fetch HTML content from the URL
const refreshData = () => {
  leaderboard = [];
  JSDOM.fromURL("https://lurkr.gg/levels/1054414599945998416")
    .then((dom) => {
      const names = dom.window.document.querySelectorAll(
        "td:nth-child(2) span"
      );
      const levels = dom.window.document.querySelectorAll("td:last-child span");
      names.forEach((name, i) =>
        leaderboard.push({
          name: name.textContent,
          level: levels[i].textContent,
        })
      );
      console.log(leaderboard);
    })
    .catch((error) => {
      console.error("Error fetching HTML content:", error);
    });
};

refreshData();

setInterval(refreshData, 60000);

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("home");
});

app.listen(
  8080,
  process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0",
  (req, res) => {
    console.log("Server is running on port 8080");
  }
);
