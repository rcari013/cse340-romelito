const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invRules = require("../utilities/inventory-validation"); // REQUIRED for POST validation


router.get(
  "/",
  utilities.handleErrors(invController.buildManagement)
);

router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

router.post(
  "/add-classification",
  invRules.classificationRules(),
  invRules.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

router.get(
  "/add-vehicle",
  utilities.handleErrors(invController.buildAddVehicle)
);

router.post(
  "/add-vehicle",
  invRules.addVehicleRules(),
  invRules.checkVehicleData,
  utilities.handleErrors(invController.addVehicle)
);


router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
);

router.get("/cause-error", utilities.handleErrors((req, res, next) => {
  throw new Error("Intentional server error for testing 500.");
}));

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)


module.exports = router;