const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()
  const className =
    data.length > 0 ? data[0].classification_name : "No Vehicles Found"

  // ✅ Render the classification view (not index!)
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

module.exports = invController
