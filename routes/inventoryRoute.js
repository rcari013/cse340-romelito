const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invRules = require("../utilities/inventory-validation");


/* ****************************************
 *  Inventory Management (ADMIN/EMPLOYEE ONLY)
 **************************************** */
router.get(
  "/",
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagement)
);


/* ****************************************
 *  Add Classification
 **************************************** */
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
);

router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  invRules.classificationRules(),
  invRules.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);


/* ****************************************
 *  Add Vehicle
 **************************************** */
router.get(
  "/add-vehicle",
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddVehicle)
);

router.post(
  "/add-vehicle",
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  invRules.addVehicleRules(),
  invRules.checkVehicleData,
  utilities.handleErrors(invController.addVehicle)
);


/* ****************************************
 *  PUBLIC ROUTES — NO LOGIN REQUIRED
 **************************************** */
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
);


/* ****************************************
 *  Get Inventory for AJAX (Admin Only)
 **************************************** */
router.get(
  "/getInventory/:classification_id",
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.getInventoryJSON)
);


/* ****************************************
 *  Edit Inventory View
 **************************************** */
router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildEditInventory)
);


/* ****************************************
 *  Update Inventory (POST)
 **************************************** */
router.post(
  "/update",
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  invRules.addVehicleRules(),
  invRules.checkVehicleData,
  utilities.handleErrors(invController.updateInventory)
);


/* ****************************************
 *  Delete Inventory Confirmation View
 **************************************** */
router.get(
  "/delete/:inv_id",
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteInventory)
);


/* ****************************************
 *  Process Inventory Deletion (POST)
 **************************************** */
router.post(
  "/delete",
  utilities.checkLogin,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventory)
);


/* ****************************************
 *  Intentional Error Route (for testing)
 **************************************** */
router.get("/cause-error", utilities.handleErrors((req, res, next) => {
  throw new Error("Intentional server error for testing 500.");
}));


module.exports = router;
