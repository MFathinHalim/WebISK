const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const { JSDOM } = require("jsdom");

const { Client } = require("discord.js");
const client = new Client({ intents: 131071 });

client.config = require("./config.json");

const getChannelSaran = async () => {
  const channelSaran = {
    saranDiscord: await client.channels.fetch(
      client.config.discordChannelId.saranDiscord
    ),
    saranYoutube: await client.channels.fetch(
      client.config.discordChannelId.saranYoutube
    ),
    saranWebsite: await client.channels.fetch(
      client.config.discordChannelId.saranWebsite
    ),
  };
  return channelSaran;
};

let leaderboard = [];

const refreshData = () => {
  JSDOM.fromURL("https://lurkr.gg/levels/1054414599945998416")
    .then((dom) => {
      leaderboard = [];
      const names = dom.window.document.querySelectorAll(
        "td:nth-child(2) span"
      );
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

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/node_modules/bootstrap/dist")));
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

const port = 8080;

client
  .login(process.env.DISCORDBOTTOKEN)
  .then(async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const channelSaran = await getChannelSaran();

    const SaranRouter = require("./routes/Saran.js");

    const saranRouter = new SaranRouter(channelSaran).getRouter();

    app.use("/saran", saranRouter);

    app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Cannot login to discord", err);
    console.log("Disable /saran");

    app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
  });
