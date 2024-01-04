const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

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
// client
//   .login(process.env.DISCORDBOTTOKEN)
//   .then(async () => {
//     console.log(`Logged in as ${client.user.tag}`);

//     const channelSaran = await getChannelSaran();

//     const SaranRouter = require("./routes/Saran.js");

//     const saranRouter = new SaranRouter(channelSaran).getRouter();

//     app.use("/saran", saranRouter);

//     refreshStaffData();

//     setInterval(refreshStaffData, 1000 * 60 * 60 * 24);

//     app.listen(port, () => {
//       console.log(`App is running on port ${port}`);
//     });
//   })
//   .catch((err) => {
//     console.error("Cannot login to discord", err);
//     console.log("Disable /saran");

//     app.listen(port, () => {
//       console.log(`App is running on port ${port}`);
//     });
//   });
