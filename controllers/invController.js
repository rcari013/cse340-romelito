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
    
    const classificationSelect = await utilities.buildClassificationList()

    return res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      message: req.flash("notice"),
      classificationSelect
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

  const classificationSelect = await utilities.buildClassificationList()

  return res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    message: req.flash("notice"),
    classificationSelect
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

/* ***************************
 *  Build Edit Inventory View
 * ************************** */
invController.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)

  let nav = await utilities.getNav()

  // Get item data from the model
  const itemData = await invModel.getInventoryByInvId(inv_id)

  if (!itemData || itemData.length === 0) {
    req.flash("notice", "Inventory item not found.")
    return res.redirect("/inv")
  }

  const vehicle = itemData[0]

  // Build classification list with selected item pre-selected
  const classificationSelect = await utilities.buildClassificationList(vehicle.classification_id)

  const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`

  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    message: req.flash("notice"),   // <-- ADD THIS

    // Sticky values
    inv_id: vehicle.inv_id,
    inv_make: vehicle.inv_make,
    inv_model: vehicle.inv_model,
    inv_year: vehicle.inv_year,
    inv_description: vehicle.inv_description,
    inv_image: vehicle.inv_image,
    inv_thumbnail: vehicle.inv_thumbnail,
    inv_price: vehicle.inv_price,
    inv_miles: vehicle.inv_miles,
    inv_color: vehicle.inv_color,
    classification_id: vehicle.classification_id
  })

}

/* ***************************
 *  Process Inventory Update
 * ************************** */
invController.updateInventory = async function (req, res, next) {
  const {
    inv_id,
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

  const updateResult = await invModel.updateInventory(
    parseInt(inv_id),
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

  if (updateResult) {
    req.flash("notice", `${inv_make} ${inv_model} was successfully updated.`)
    return res.redirect("/inv")
  } else {
    req.flash("notice", "Update failed.")
    return res.redirect(`/inv/edit/${inv_id}`)
  }
}



/* ***************************
 *  Build Delete Inventory Confirmation View
 * ************************** */
invController.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)

  let nav = await utilities.getNav()

  const itemData = await invModel.getInventoryByInvId(inv_id)

  if (!itemData || itemData.length === 0) {
    req.flash("notice", "Inventory item not found.")
    return res.redirect("/inv")
  }

  const vehicle = itemData[0]
  const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`

  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    message: req.flash("notice"),
    errors: null,

    // data for readonly display
    inv_id: vehicle.inv_id,
    inv_make: vehicle.inv_make,
    inv_model: vehicle.inv_model,
    inv_year: vehicle.inv_year,
    inv_price: vehicle.inv_price
  })
}

/* ***************************
 *  Process Inventory Deletion
 * ************************** */
invController.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)

  let nav = await utilities.getNav()

  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("notice", "The vehicle was successfully deleted.")
    return res.redirect("/inv")
  } else {
    req.flash("notice", "Error: The delete failed.")
    return res.redirect(`/inv/delete/${inv_id}`)
  }
}




module.exports = invController