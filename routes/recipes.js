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
    const number = req.query.number || 2; // Limit the number of results to 2 by default to prevent large responses and reduce api usage
    const results = await recipes_utils.searchRecipe({
      recipeName,
      cuisine,
      diet,
      intolerance,
      number,
      username: req.username,
    });
    res.status(200).send(results);
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
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
