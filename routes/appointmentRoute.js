// routes/appointmentRoute.js
const express = require("express");
const router = new express.Router();
const appointmentController = require("../controllers/appointmentController");
const utilities = require("../utilities");

// ------------------------------
// CLIENT ROUTES
// ------------------------------

// Show booking form
router.get(
  "/book/:invId",
  utilities.checkLogin,
  appointmentController.showForm
);

// Submit booking
router.post(
  "/book/:invId",
  utilities.checkLogin,
  appointmentController.book
);

// View client's own appointments
router.get(
  "/my-appointments",
  utilities.checkLogin,
  appointmentController.clientAppointments
);


router.post(
  "/cancel",
  utilities.checkLogin,
  appointmentController.cancelAppointment
);


// ------------------------------
// EMPLOYEE ROUTES (READ ONLY)
// ------------------------------
router.get(
  "/employee",
  utilities.checkEmployee,
  async (req, res) => {
    const accountType = res.locals.accountData.account_type;

    // If Admin → use admin controller instead
    if (accountType === "Admin") {
      return appointmentController.adminAppointments(req, res);
    }

    // Otherwise → employee view
    return appointmentController.employeeAppointments(req, res);
  }
);


// ------------------------------
// ADMIN ROUTES
// ------------------------------
router.get(
  "/admin",
  utilities.checkAdmin,
  appointmentController.adminAppointments
);

router.post(
  "/status/:id",
  utilities.checkAdmin,
  appointmentController.updateStatus
);

router.get(
  "/success/:invId",
  utilities.checkLogin,
  appointmentController.successPage
);

router.get("/booked-times/:invId", appointmentController.getBookedTimes);


module.exports = router;
