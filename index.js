const path = require('path');
const express = require('express')
const bodyParser = require('body-parser')
const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var data = []

axios.get("https://lurkr.gg/levels/1054414599945998416")
  .then(response => {
    const htmlContent = response.data;
    const dom = new JSDOM(htmlContent, {
      url: "https://lurkr.gg/levels/1054414599945998416",
      contentType: "text/html",
      includeNodeLocations: true,
      storageQuota: 10000000
    });

    const dataNamaList = dom.window.document.querySelectorAll('.text-ellipsis');
    const dataLevelList = dom.window.document.querySelectorAll('.absolute');
    const dataLeveling = [];

    const minLength = Math.min(dataNamaList.length, dataLevelList.length);

    let levelIndex = 0;
    for (let i = 0; i < minLength; i++) {
      const nama = dataNamaList[i].textContent;
      let level = dataLevelList[levelIndex].textContent;

      while (isNaN(parseFloat(level))) {
        levelIndex++; // Move to the next level element
        level = dataLevelList[levelIndex].textContent;
      }
      
      dataLeveling.push({ nama, level });
      levelIndex++; // Move to the next level element for the next iteration
    }
    console.log(dataLeveling);
  })
  .catch(error => {
    console.error("Error fetching HTML content:", error);
  });

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

app.listen(8080, (req, res) => {
    Host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    console.log("Server is running on port 8080")
})
