const express = require("express");
const mongoose = require("mongoose");
const Article = require("./models/article");
const articleRouter = require("./routes/articles");
const methodOverride = require("method-override");
const app = express();

mongoose.connect("mongodb://localhost/blog", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

app.get("/", async (req, res) => {
  try {
    const articles = await Article.find()
      .sort({ createdAt: "desc" })
      .maxTimeMS(30000);
    res.render("articles/index", { articles });
  } catch (error) {
    console.error(
      "Error fetching articles:",
      error
    );
    res
      .status(500)
      .send("Error fetching articles");
  }
});

app.use("/articles", articleRouter);

app.delete("/:id", async (req, res) => {
  try {
    await Article.findByIdAndDelete(
      req.params.id
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.listen(5000, () => {
  console.log(
    "Server is running on http://localhost:5000/"
  );
});
