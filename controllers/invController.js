const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)

  // Correctly use data.rows
  const grid = await utilities.buildClassificationGrid(data.rows)
  const nav = await utilities.getNav()

  const className =
    data.rows.length > 0
      ? data.rows[0].classification_name
      : "No Vehicles Found"

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

module.exports = invController
