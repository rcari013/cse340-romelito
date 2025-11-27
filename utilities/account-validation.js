const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

/* **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."),

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    // password must be strong
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 *  Check data and return errors or continue
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* **********************************
 *  Login Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please enter your password."),
  ]
}

/* **********************************
 *  Check login data
 * ********************************* */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

/* ****************************************
 *  Rules for updating account info
 **************************************** */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim().notEmpty().withMessage("First name is required."),

    body("account_lastname")
      .trim().notEmpty().withMessage("Last name is required."),

    body("account_email")
      .trim()
      .isEmail().withMessage("A valid email is required.")
      .custom(async (value, { req }) => {
        const account_id = req.body.account_id
        const existingEmail = await accountModel.checkExistingEmail(value)

        // Allow same email if unchanged
        const current = await accountModel.getAccountById(account_id)

        if (existingEmail && value !== current.account_email) {
          throw new Error("Email already exists. Choose another.")
        }
      })
  ]
}

/* ****************************************
 *  Check update account errors
 **************************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      message: null,
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email
    })
  }
  next()
}

/* ****************************************
 *  Password Rules
 **************************************** */
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements.")
  ]
}

/* ****************************************
 *  Check password errors
 **************************************** */
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const account = await accountModel.getAccountById(req.body.account_id)
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      message: null,
      account_id: account.account_id,
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email
    })
  }
  next()
}

module.exports = validate
