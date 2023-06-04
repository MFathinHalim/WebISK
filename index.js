const path = require('path');
const express = require('express')
const bodyParser = require('body-parser')

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let leaderboard = [];

const refreshData = () => {
  leaderboard = []
  JSDOM.fromURL("https://lurkr.gg/levels/1054414599945998416")
    .then(dom => {
      const names = dom.window.document.querySelectorAll("td:nth-child(2) span");
      const levels = dom.window.document.querySelectorAll("td:last-child span");
      const imgs = dom.window.document.querySelectorAll(".gap-4 > img");

      names.forEach((name, i) => {
        leaderboard.push({
          peringkat: i + 1,
          name: name.textContent,
          level: levels[i].textContent,
          pp: imgs[i].getAttribute("src")
        });
      });

      console.log(leaderboard);
      res.render("leaderboard", {
        data: leaderboard
      });
    })
    .catch(error => {
      console.error("Error fetching HTML content:", error);
    });
}

refreshData()

setInterval(refreshData, 60000)

const app = express()

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}))

app.get("/", function (req, res) {
	res.render("home")
})

app.get("/leaderboard", function (req, res) {
  res.render("leaderboard", { data: leaderboard })
});


app.listen(8080, process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0', (req, res) => {
  console.log("Server is running on port 8080")
})
