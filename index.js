const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const { JSDOM } = require("jsdom");

let levelingData;

const refreshLeaderboardData = () => {
  JSDOM.fromURL("https://lurkr.gg/levels/1054414599945998416")
    .then((dom) => {
      levelingData = dom.window.document.querySelector(
        "script#__NEXT_DATA__"
      ).textContent;
      levelingData = JSON.parse(levelingData);
      levelingData = levelingData.props.pageProps;
    })
    .catch((error) => {
      console.error("Error fetching HTML content:", error);
    });
};

refreshLeaderboardData();

setInterval(refreshLeaderboardData, 60000);

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/node_modules/bootstrap/dist")));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const saranRouter = require("./routes/saran.js");

app.use("/saran", saranRouter);

app.get("/", function (req, res) {
  res.render("home", { title: "Home" });
});

app.get("/rules", (req, res) => {
  res.render("rules", { title: "Rules" });
});

app.get("/info", (req, res) => {
  res.render("info", { title: "Information" });
});

app.get("/leaderboard", function (req, res) {
  res.render("leaderboard", { title: "Leaderboard", levelingData });
});

const port = 8080;

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
