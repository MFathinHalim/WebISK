const path = require('path');
const express = require('express')
const bodyParser = require('body-parser')
const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Fetch HTML content from the URL
axios.get("https://lurkr.gg/levels/1054414599945998416")
  .then(response => {
    const htmlContent = response.data;
    
    // Create JSDOM instance with fetched HTML content
    const dom = new JSDOM(htmlContent, {
      url: "https://lurkr.gg/levels/1054414599945998416",
      contentType: "text/html",
      includeNodeLocations: true,
      storageQuota: 10000000
    });
    
    // Query and print <span> elements
    dom.window.document.querySelectorAll('span').forEach(element => console.log(element.textContent));
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