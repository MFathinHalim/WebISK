const express = require("express")
const router = express.Router()
const { mainModel } = require("../models/saran");

router.get("/", function (req, res) {
  res.render("saran");
});

router.post("/post", async function (req, res) {
  const jenis = req.body.jenis;
  const saran = req.body.saran;

  console.log(jenis);
  console.log(saran);

  await mainModel.create({ jenis, saran });

  res.redirect("/");
});

module.exports = router
