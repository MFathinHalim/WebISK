const path = require('path');
const express = require('express')
const bodyParser = require('body-parser')
const { mainModel} = require("./models/post")
const mongoose = require('mongoose');
require('dotenv').config();



const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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
  const leaderboard = [];

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
});

app.get("/saran", function (req, res) {
	res.render("saran")
})

app.post("/postsaran", async function(req, res) {
  const jenis = req.body.jenis;
  const saran = req.body.saran;

  console.log(jenis);
  console.log(saran);

  await mainModel.create({ jenis, saran})

  res.redirect("/")
})


const uri = process.env.MONGODBURI;
const port = 8080;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Increase the server selection timeout
})
  .then(() => {
    console.log('Connected to the database');
    app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });
