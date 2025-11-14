const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")

router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
)

router.get("/cause-error", utilities.handleErrors((req, res, next) => {
  throw new Error("Intentional server error for testing 500.");
}));


module.exports = router