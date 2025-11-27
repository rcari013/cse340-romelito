/* ***************************
 * Account routes
 * Unit 4, deliver login view activity
 *************************** */

// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require("../utilities/account-validation")
const accountValidate = require("../utilities/account-validation")


/* ***************************
 * Deliver Login View
 * Unit 4, deliver login view activity
 *************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)


// Default account management view
router.get(
  "/",
  utilities.checkLogin,
  accountController.buildAccountManagement
)

/* ****************************************
 *  Deliver Account Update View
 * **************************************** */
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdate)
)

/* ****************************************
 *  Process Account Information Update
 * **************************************** */
router.post(
  "/update",
  utilities.checkLogin,
  accountValidate.updateAccountRules(),
  accountValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

/* ****************************************
 *  Process Password Change
 * **************************************** */
router.post(
  "/update-password",
  utilities.checkLogin,
  accountValidate.updatePasswordRules(),
  accountValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

/* ****************************************
*  Logout Process
* *************************************** */
router.get(
  "/logout",
  (req, res) => {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    return res.redirect("/")
  }
)


module.exports = router
