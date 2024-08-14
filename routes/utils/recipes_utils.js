const axios = require("axios");
require("dotenv").config();

const api_domain = "https://api.spoonacular.com/recipes";

/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info
 */

async function getRecipeInformation(recipe_id) {
  return await axios.get(`${api_domain}/${recipe_id}/information`, {
    params: {
      apiKey: process.env.spooncular_apiKey,
    },
  });
}
// (async () => {
//   console.log(await getRecipeInformation(43565));
// })();
const getRecipesPreview = async (recipes_id_array, username) => {
  let promises = recipes_id_array.map((recipe_id) =>
    getRecipeDetails(recipe_id)
  );

  let recipes_info = await Promise.all(promises);
  let recipes_preview = recipes_info.map((recipe_info) => ({
    id: recipe_info.id,
    title: recipe_info.title,
    readyInMinutes: recipe_info.readyInMinutes,
    image: recipe_info.image,
    popularity: recipe_info.popularity,
    vegan: recipe_info.vegan,
    vegetarian: recipe_info.vegetarian,
    glutenFree: recipe_info.glutenFree,
  }));

  return recipes_preview;
};
async function getRecipeDetails(recipe_id) {
  let recipe_info = await getRecipeInformation(recipe_id);
  console.log(recipe_info);
  let {
    id,
    title,
    readyInMinutes,
    image,
    aggregateLikes,
    vegan,
    vegetarian,
    glutenFree,
    instructions,
    extendedIngredients,
    servings,
    analyzedInstructions,
  } = recipe_info.data;

  return {
    id,
    title,
    readyInMinutes,
    image,
    aggregateLikes,
    vegan,
    vegetarian,
    glutenFree,
    instructions,
    extendedIngredients,
    servings,
    analyzedInstructions,
  };
}

async function searchRecipe(request) {
  const {
    recipeName,
    cuisine,
    diet,
    intolerance,
    number = 100,
    username,
    offset = 0,
  } = request;
  const response = await axios.get(`${api_domain}/complexSearch`, {
    params: {
      query: recipeName,
      cuisine: cuisine,
      diet: diet,
      intolerances: intolerance,
      number: number,
      offset,
      apiKey: process.env.spooncular_apiKey,
    },
  });

  // Get the total number of results from the API response
  const totalResults = response.data.totalResults;

  // Get recipe previews
  const recipes_preview = await getRecipesPreview(
    response.data.results.map((element) => element.id)
  );

  // Return both recipes_preview and totalResults
  return { recipes: recipes_preview, total: totalResults };
}

exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipe = searchRecipe;
exports.getRecipeInformation = getRecipeInformation;
