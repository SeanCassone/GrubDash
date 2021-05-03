const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res, next) {
  res.json({ data: dishes });
}

function isValidDish(req, res, next) {
  const requiredFields = ["name", "description", "price", "image_url"];
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      next({
        status: 400,
        message: `Dish must include a ${field}`,
      });
      return;
    }
  }
  if (req.body.data.price < 0) {
    return next({
      status: 400,
      message: `Field price must be above zero`,
    });
  }

  next();
}

function create(req, res, next) {
  const { data: { name, price, description, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    price,
    description,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).send({ data: newDish });
}

function read(req, res, next) {
  let { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (!foundDish) {
    return next({
      status: 404,
      message: "No matching dish is found",
    });
  }
  res.json({ data: foundDish });
}
function validateDishId(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id does not exist: ${dishId}`,
  });
}

function validateDishBody(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  let message;
  if (!name || name === "") message = "Dish must include a name";
  else if (!description || description === "")
    message = "Dish must include a description";
  else if (!price) message = "Dish must include a price";
  else if (price <= 0 || !Number.isInteger(price))
    message = "Dish must have a price that is an integer greater than 0";
  else if (!image_url || image_url === "")
    message = "Dish must include a image_url";
  if (message) {
    return next({
      status: 400,
      message: message,
    });
  }
  next();
}

function validateDishBodyId(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if (!id || id === dishId) {
    res.locals.dishId = dishId;
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}
function update(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  res.locals.dish = {
    id: res.locals.dishId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  res.json({ data: res.locals.dish });
}

module.exports = {
  list,
  create: [isValidDish, create],
  read: [validateDishId, read],
  update: [validateDishId, validateDishBody, validateDishBodyId, update],
};
