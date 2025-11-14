const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  // the incorrect one, uncomment = const data = await invModel.getInventoryByClassificationId(clasification_id)
  const data = await invModel.getInventoryByClassificationId(classification_id)

  const grid = await utilities.buildClassificationGrid(data) // data is already an array
  const nav = await utilities.getNav()

  const className =
    data.length > 0 ? data[0].classification_name : "No Vehicles Found"

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build specific inventory item detail view
 * ************************** */
invController.buildByInvId = async function (req, res, next) {
  const invId = req.params.invId

  const itemData = await invModel.getInventoryByInvId(invId)
  const nav = await utilities.getNav()

  if (!itemData || itemData.length === 0) {
    return res.status(404).render("errors/error", {
      title: "Vehicle Not Found",
      message: "Sorry, that vehicle does not exist.",
      nav
    })
  }

  const vehicle = itemData[0] // one row

  const detailHtml = await utilities.buildDetailView(vehicle)

  res.render("./inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    detailHtml,
  })
}



module.exports = invController
