const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const { JSDOM } = require("jsdom");

let levelingData = [];

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

app.use((req, res, next) => {
  req.fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  next()
})

app.get("/", function (req, res) {
  res.render("home", { title: "Home", url: req.fullUrl });
});

app.get("/info", (req, res) => {
  res.render("info", { title: "Information", url: req.fullUrl });
});

app.get("/leaderboard", function (req, res) {
  let filteredData = levelingData.levels || [];

  const pageCount = Math.ceil(filteredData.length / 10);
  let page = parseInt(req.query.p) || 1;
  const usernameToSearch = req.query.username;

  if (usernameToSearch) {
    // If a username is provided in the query, filter the data based on the username
    filteredData = filteredData.filter(
      (user) => user.username && user.username.includes(usernameToSearch)
    );
  }

  if (page > pageCount) {
    page = pageCount;
  }

  const temp = { ...levelingData }; // Use the spread operator to create a shallow copy
  temp.levels = filteredData.slice((page - 1) * 10, page * 10);

  res.render("leaderboard", {
    title: "Leaderboard",
    levelingData: temp,
    page: page,
    pageCount: pageCount,
    searchTerm: usernameToSearch,
  });
});

const port = 8080;

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
