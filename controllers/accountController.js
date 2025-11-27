/* ***************************
 * Account Controller
 * Unit 4, deliver login view activity
 *************************** */

const jwt = require("jsonwebtoken")
require("dotenv").config()


const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ***************************
 * Deliver login view
 * Unit 4, deliver login view activity
 *************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()

  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      )
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          maxAge: 3600 * 1000,
        })
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        })
      }
      return res.redirect("/account/")
    } else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

/* ***************************
 *  Deliver Account Management View
 *************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Deliver Update Account View
 **************************************** */
async function buildUpdate(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()
  const account = await accountModel.getAccountById(account_id)

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    message: null,
    account_id: account.account_id,
    account_firstname: account.account_firstname,
    account_lastname: account.account_lastname,
    account_email: account.account_email,
  })
}

/* ****************************************
 *  Process Account Update
 **************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()

  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email
  } = req.body

  const result = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (result) {
    req.flash("notice", "Account information updated successfully.")
    const updatedAccount = await accountModel.getAccountById(account_id)
    return res.redirect("/account/")
  }

  req.flash("notice", "Update failed.")
  return res.redirect(`/account/update/${account_id}`)
}

/* ****************************************
 *  Process Password Change
 **************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  // Hash new password
  const bcrypt = require("bcryptjs")
  const hashedPassword = await bcrypt.hash(account_password, 10)

  const result = await accountModel.updatePassword(account_id, hashedPassword)

  if (result) {
    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/")
  }

  req.flash("notice", "Password update failed.")
  return res.redirect(`/account/update/${account_id}`)
}




module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdate,
  updateAccount,
  updatePassword
}