var express = require("express");
var router = express.Router();
require("dotenv").config();

const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("timor da queen"));

/**
 * This path is for searching a recipe
 */
router.get("/search", async (req, res, next) => {
  try {
    const recipeName = req.query.recipeName;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerance = req.query.intolerance;
    const number = req.query.number || 3;
    const offset = req.query.offset || 0;
    const { recipes, total } = await recipes_utils.searchRecipe({
      recipeName,
      cuisine,
      diet,
      intolerance,
      number,
      username: req.username,
      offset,
    });
    console.log(recipes);
    res.status(200).send({ recipes, total });
  } catch (error) {
    next(error);
  }

  /**
   * This path returns a full details of a recipe by its id
   */
});
router.get("/:recipeId", async (req, res, next) => {
  try {
    console.log(req?.params?.recipeId);
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    console.log(`Recipe:`, recipe);
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
