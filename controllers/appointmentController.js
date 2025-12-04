const appointmentModel = require("../models/appointment-model");
const invModel = require("../models/inventory-model");

module.exports = {
  // API: Return booked times for a specific date + vehicle
async getBookedTimes(req, res) {
  const { invId } = req.params;
  const { date } = req.query;

  if (!date) return res.json([]);

  const result = await appointmentModel.getBookedTimes(invId, date);

  // Return ["08:00:00", "16:00:00"]
  res.json(result.rows.map(r => r.appointment_time));
},


  // Show booking form
  async showForm(req, res) {
    const invId = req.params.invId;
    const vehicleData = await invModel.getInventoryByInvId(invId);

    if (!vehicleData.length) {
      req.flash("notice", "Vehicle not found.");
      return res.redirect("/inv");
    }

    const nav = await req.app.locals.utilities.getNav();

    res.render("appointment/form", {
      title: "Schedule a Test Drive",
      nav,
      vehicle: vehicleData[0],
      errors: null,
      message: req.flash("notice")
    });
  },

  // Submit booking
  async book(req, res) {
    const account_id = res.locals.accountData.account_id;
    const inv_id = req.params.invId;
    const { date, time, message } = req.body;

    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      req.flash("notice", "You cannot select a past date.");
      return res.redirect(`/appointment/book/${inv_id}`);
    }

    const duplicateCheck = await appointmentModel.checkExistingAppointment(
      inv_id,
      date,
      time
    );

    if (duplicateCheck.rows.length > 0) {
      req.flash("notice", "This time slot has already been booked.");
      return res.redirect(`/appointment/book/${inv_id}`);
    }

    await appointmentModel.createAppointment(account_id, inv_id, date, time, message);

    req.flash("notice", "Your test drive has been scheduled!");
    res.redirect(`/appointment/success/${inv_id}`);
  },

  // Success page after booking
  async successPage(req, res) {
    const { invId } = req.params;
    const nav = await req.app.locals.utilities.getNav();

    res.render("appointment/success", {
      title: "Appointment Scheduled",
      nav,
      inv_id: invId,
      message: req.flash("notice")
    });
  },

// Client view
async clientAppointments(req, res) {
  const notice = req.flash("notice");  // <-- MUST be here

  const account_id = res.locals.accountData.account_id;
  const appointments = await appointmentModel.getAppointmentsByUser(account_id);

  const nav = await req.app.locals.utilities.getNav();

  res.render("appointment/client", {
    title: "My Test Drives",
    nav,
    appointments: appointments.rows,
    message: notice   // <-- SEND TO VIEW
  });
},



  // Employee view
  async employeeAppointments(req, res) {
    const all = await appointmentModel.getAllAppointments();
    const nav = await req.app.locals.utilities.getNav();

    res.render("appointment/employee", {
      title: "All Test Drives",
      nav,
      appointments: all.rows
    });
  },

  // Admin dashboard
  async adminAppointments(req, res) {
    const all = await appointmentModel.getAllAppointments();
    const nav = await req.app.locals.utilities.getNav();

    res.render("appointment/admin", {
      title: "Manage Test Drives",
      nav,
      appointments: all.rows,
      message: req.flash("notice")
    });
  },

  // Admin updates status
  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    await appointmentModel.updateStatus(id, status);

    req.flash("notice", "Appointment updated.");
    res.redirect("/appointment/admin");
  },

  // ⭐ Client cancels appointment
  async cancelAppointment(req, res) {
    const { appointment_id } = req.body;
    const userId = res.locals.accountData.account_id;

    try {
      // First: check if the appointment exists AND belongs to user
      const appt = await appointmentModel.getAppointmentById(appointment_id);

      if (appt.rowCount === 0) {
        req.flash("notice", "Appointment not found.");
        return res.redirect("/appointment/my-appointments");
      }

      if (appt.rows[0].account_id !== userId) {
        req.flash("notice", "Unauthorized action.");
        return res.redirect("/appointment/my-appointments");
      }

      // Update to cancelled instead of deleting
      const result = await appointmentModel.cancelAppointment(appointment_id);

      if (result.rowCount > 0) {
        req.flash("notice", "Your appointment has been cancelled.");
      } else {
        req.flash("notice", "Unable to cancel appointment.");
      }

      return res.redirect("/appointment/my-appointments");

    } catch (err) {
      console.error("Cancel error:", err);
      req.flash("notice", "Error cancelling appointment.");
      return res.redirect("/appointment/my-appointments");
    }
  }


};
