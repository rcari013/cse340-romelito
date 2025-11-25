const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {}

/* ***************************
 *  Inventory by Classification
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
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
 *  Vehicle Details
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

  const vehicle = itemData[0]
  const detailHtml = await utilities.buildDetailView(vehicle)

  res.render("./inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    detailHtml,
  })
}

/* ***************************
 *  Management View
 * ************************** */
invController.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()

  // classification select list here
  const classificationSelect = await utilities.buildClassificationList()

  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    message: req.flash("notice"),
    classificationSelect   // <-- YOU FORGOT THIS
  })
}


/* ***************************
 *  Add Classification Form (GET)
 * ************************** */
invController.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()

  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    message: req.flash("notice"),
    classification_name: ""
  })
}

/* ***************************
 *  Process Classification (POST)
 * ************************** */
invController.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classification_name = req.body.classification_name
  classification_name =
    classification_name.charAt(0).toUpperCase() +
    classification_name.slice(1).toLowerCase()

  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("notice", `${classification_name} classification was successfully added.`)
    nav = await utilities.getNav()

    return res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      message: req.flash("notice")
    })
  } else {
    req.flash("notice", "Failed to add classification.")

    return res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      message: req.flash("notice"),
      classification_name
    })
  }
}

/* ***************************
 *  Add Vehicle Form (GET)
 * ************************** */
invController.buildAddVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()

  res.render("inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
    message: req.flash("notice"),
    
    // sticky values
    inv_make: "",
    inv_model: "",
    inv_description: "",
    inv_image: "",
    inv_thumbnail: "",
    inv_price: "",
    inv_year: "",
    inv_miles: "",
    inv_color: "",
    classification_id: ""
  })
}

/* ***************************
 *  Process Add Vehicle (POST)
 * ************************** */
invController.addVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()

  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body

  const addResult = await invModel.addVehicle(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  )

  if (addResult) {
    req.flash("notice", `${inv_make} ${inv_model} was successfully added.`)

    return res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      message: req.flash("notice")
    })
  } else {
    req.flash("notice", "Failed to add vehicle.")

    let classificationList = await utilities.buildClassificationList(classification_id)

    return res.render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      message: req.flash("notice"),

      // sticky values
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    })
  }
}


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invController.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)

  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


module.exports = invController