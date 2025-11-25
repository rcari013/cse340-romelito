const jwt = require("jsonwebtoken")
require("dotenv").config()

const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (rows) {
  let grid = ""

  if (rows && rows.length > 0) {
    grid = '<ul id="inv-display">'
    rows.forEach((vehicle) => {
      grid += "<li>"

      // IMAGE link
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>'

      grid += '<div class="namePrice">'
      grid += "<hr />"

      // TITLE link
      grid += "<h2>"
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>"
      grid += "</h2>"

      // PRICE
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>"

      grid += "</div>" // close namePrice
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  return grid
}



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
 * Build vehicle detail view HTML
 ************************************** */
Util.buildDetailView = async function (vehicle) {
  let formattedPrice = new Intl.NumberFormat("en-US").format(vehicle.inv_price)
  let formattedMiles = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)

  return `
  <div class="vehicle-page">

    <h1 class="vehicle-title">${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})</h1>

    <section class="vehicle-detail">
      <img class="detail-image"
           src="${vehicle.inv_image}"
           alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">

      <div class="vehicle-info">
        <p><strong>Price:</strong> $${formattedPrice}</p>
        <p><strong>Mileage:</strong> ${formattedMiles} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </section>

  </div>
  `
}

/* ****************************************
 * Build Classification Drop-down <select>
 **************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()

  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`

    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected"
    }

    classificationList += `>${row.classification_name}</option>`
  })

  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* **************************************
 * Require login via JWT
 ************************************** */
Util.checkLogin = (req, res, next) => {
  const token = req.cookies.jwt

  if (!token) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, accountData) => {
      if (err) {
        req.flash("notice", "Session expired. Please log in.")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
      }

      // Save decoded JWT data for views
      res.locals.accountData = accountData
      res.locals.loggedin = true

      next()
    }
  )
}





module.exports = Util
