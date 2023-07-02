const express = require("express");
const Article = require("./../models/article");
const router = express.Router();
const slugify = require("slugify");

router.get("/new", (req, res) => {
  res.render("articles/new", {
    article: new Article(),
  });
});

router.get(
  "/articles/edit/:id",
  async (req, res) => {
    try {
      const article = await Article.findById(
        req.params.id
      );
      if (!article) {
        return res
          .status(404)
          .send("Article not found");
      }
      res.render("articles/edit", {
        article: article,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

router.get("/:slug", async (req, res) => {
  try {
    const article = await Article.findOne({
      slug: req.params.slug,
    });
    if (!article) {
      return res.redirect("/");
    }
    res.render("articles/show", {
      article: article,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/", async (req, res) => {
  try {
    let article = new Article({
      title: req.body.title,
      description: req.body.description,
      markdown: req.body.markdown,
      slug: slugify(req.body.title, {
        lower: true,
        strict: true,
      }),
    });

    const savedArticle = await article.save();
    res.redirect(
      `/articles/${savedArticle.slug}`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.put("/articles/:id", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .render("articles/edit", {
        article: req.body,
        errors: errors.array(),
      });
  }

  try {
    const article = await Article.findById(
      req.params.id
    );
    if (!article) {
      return res
        .status(404)
        .send("Article not found");
    }

    article.title = req.body.title;
    article.description = req.body.description;
    article.markdown = req.body.markdown;
    article.slug = req.body.title
      .replace(/\s+/g, "-")
      .toLowerCase();

    await article.save();
    res.redirect(`/articles/${article.slug}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article;
    article.title = req.body.title;
    article.description = req.body.description;
    article.markdown = req.body.markdown;
    try {
      article = await article.save();
      res.redirect(`/articles/${article.slug}`);
    } catch (e) {
      res.render(`articles/${path}`, {
        article: article,
      });
    }
  };
}

module.exports = router;
