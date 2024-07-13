const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";

/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info
 */

async function getRecipeInformation(recipe_id) {
  return await axios.get(`${api_domain}/${recipe_id}/information`, {
    params: {
      includeNutrition: false,
      apiKey: process.env.spooncular_apiKey,
    },
  });
}
const getRecipesPreview = async (recipes_id_array, username) => {
  let promises = [];
  recipes_id_array.map((recipe_id) =>
    promises.push(getRecipeDetails(recipe_id))
  );

  let recipes_info = await Promise.all(promises);
  let recipes_preview = [];
  recipes_info.map((recipe_info) => {
    recipes_preview.push({
      id: recipe_info.id,
      title: recipe_info.title,
      readyInMinutes: recipe_info.readyInMinutes,
      image: recipe_info.image,
      popularity: recipe_info.popularity,
      vegan: recipe_info.vegan,
      vegetarian: recipe_info.vegetarian,
      glutenFree: recipe_info.glutenFree,
    });
  });

  return recipes_preview;
};
async function getRecipeDetails(recipe_id) {
  let recipe_info = await getRecipeInformation(recipe_id);
  let {
    id,
    title,
    readyInMinutes,
    image,
    aggregateLikes,
    vegan,
    vegetarian,
    glutenFree,
  } = recipe_info.data;

  return {
    id: id,
    title: title,
    readyInMinutes: readyInMinutes,
    image: image,
    popularity: aggregateLikes,
    vegan: vegan,
    vegetarian: vegetarian,
    glutenFree: glutenFree,
  };
}

async function searchRecipe(request) {
  const { recipeName, cuisine, diet, intolerance, number, username } = request;
  const response = await axios.get(`${api_domain}/complexSearch`, {
    params: {
      query: recipeName,
      cuisine: cuisine,
      diet: diet,
      intolerances: intolerance,
      number: number,
      apiKey: process.env.spooncular_apiKey,
    },
  });

  return getRecipesPreview(
    response.data.results.map((element) => element.id),
    username
  );
}

exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipe = searchRecipe;
exports.getRecipeInformation = getRecipeInformation;
