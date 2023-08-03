import "core-js/stable";
import "regenerator-runtime/runtime";
import { MODAL_CLOSE_SEC } from "./config.js";
import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarkView.js";
import addRecipeView from "./views/addRecipeView.js";

///////////////////////////////////////

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    //Guard clase to prevent loading for non id
    if (!id) return;

    // update result view active state
    resultsView.update(model.getSearchResultPage());

    //adding spinner
    recipeView.renderSpinner();

    // 1> Loading Recipe List
    await model.loadRecipe(id);

    // 2> Rendering Recipe
    recipeView.render(model.state.recipe);

    // 3> Rendering Bookmarks
    bookmarksView.update(model.state.bookmarks);

    /////////////
  } catch (err) {
    // catching error
    recipeView.renderError(
      `We could not find that recipe. Please try another one!`
    );
    console.error(err);
  }
};

const controlSearchResult = async function () {
  try {
    // render spinner
    resultsView.renderSpinner();

    // 1> getting search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2> Load search results
    await model.loadSearchResult(query);

    // 3> Rendering Search Results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultPage());

    // 4> Rendering Pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  //Rendering new Results
  resultsView.render(model.getSearchResultPage(goToPage));

  //  Rendering new Pagination
  paginationView.render(model.state.search);
};

const controlService = function (newServings) {
  // update the recipe servings (in state)
  model.updateServings(newServings);
  // console.log(state.recipe.servings);

  // update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1 add bookmark or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2 update recipe view
  recipeView.update(model.state.recipe);

  // 3 render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // render spinner
    addRecipeView.renderSpinner();

    // upload new recipe data
    await model.uploadRecipe(newRecipe);
    // console.log(model.state.recipe);

    // render new recipe
    recipeView.render(model.state.recipe);

    // render success message
    addRecipeView.renderMessage();

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change id in url
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // close form window
    setTimeout(function () {
      addRecipeView.toogleWindow();
    }, MODAL_CLOSE_SEC * 1000);

    //
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlService);
  recipeView.addBookmarkHandler(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
