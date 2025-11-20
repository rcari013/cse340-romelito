const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const utilities = require("./");

/* **********************************
 *  Classification Validation Rules
 * ********************************* */
const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z]+$/)
      .withMessage("Classification name must contain only letters, no spaces or special characters.")
      .custom(async (classification_name) => {
        const exists = await invModel.checkExistingClassification(classification_name);
        if (exists > 0) {
          throw new Error("Classification already exists. Please enter a different name.");
        }
      })
  ];
};

/* *******************************************
 * Check data and return errors or continue
 ******************************************** */
const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      message: null,
      classification_name: req.body.classification_name
    });
  }
  next();
};

/* ****************************************
 *  Add Vehicle Validation Rules
 * *************************************** */
const addVehicleRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification."),

    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Make is required."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Model is required."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    body("inv_price")
      .isFloat({ min: 1 })
      .withMessage("Price must be a valid number."),

    body("inv_year")
      .isInt({ min: 1900, max: 9999 })
      .withMessage("Year must be a 4-digit number."),

    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be digits only."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Color is required.")
  ];
};

/* ****************************************
 *  Check Vehicle Data
 * *************************************** */
const checkVehicleData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(req.body.classification_id);

    return res.render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      errors: errors.array(),
      message: null,
      classificationList,

      // sticky fields
      ...req.body
    });
  }
  next();
};



module.exports = { classificationRules, checkClassificationData, addVehicleRules, checkVehicleData };
