const pool = require("../database/");

module.exports = {

  // NEW: Get booked appointment times for a specific vehicle + date
  async getBookedTimes(inv_id, date) {
    const sql = `
      SELECT appointment_time 
      FROM appointment
      WHERE inv_id = $1
        AND appointment_date = $2
        AND status != 'cancelled'
    `;
    return pool.query(sql, [inv_id, date]);
  },

  // Insert new appointment
  async createAppointment(account_id, inv_id, date, time, message) {
    const sql = `
      INSERT INTO appointment (account_id, inv_id, appointment_date, appointment_time, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    return pool.query(sql, [account_id, inv_id, date, time, message]);
  },

  // Check for duplicate time slot for SAME vehicle
  async checkExistingAppointment(inv_id, date, time) {
    const sql = `
      SELECT * FROM appointment
      WHERE inv_id = $1
        AND appointment_date = $2
        AND appointment_time = $3
        AND status != 'cancelled';
    `;
    return pool.query(sql, [inv_id, date, time]);
  },

  // Client: Get appointments by account_id
  async getAppointmentsByUser(account_id) {
    const sql = `
      SELECT a.*, i.inv_make, i.inv_model
      FROM appointment a
      JOIN inventory i ON a.inv_id = i.inv_id
      WHERE account_id = $1
      ORDER BY appointment_date ASC, appointment_time ASC;
    `;
    return pool.query(sql, [account_id]);
  },

  // Employee/Admin: Get ALL appointments
  async getAllAppointments() {
    const sql = `
      SELECT a.*, ac.account_firstname, ac.account_lastname,
             i.inv_make, i.inv_model
      FROM appointment a
      JOIN account ac ON a.account_id = ac.account_id
      JOIN inventory i ON a.inv_id = i.inv_id
      ORDER BY appointment_date DESC, appointment_time ASC;
    `;
    return pool.query(sql);
  },

  // Admin updates status
  async updateStatus(id, status) {
    const sql = `
      UPDATE appointment
      SET status = $2
      WHERE appointment_id = $1;
    `;
    return pool.query(sql, [id, status]);
  },

  // Get a single appointment by ID
  async getAppointmentById(id) {
    const sql = `
      SELECT * FROM appointment
      WHERE appointment_id = $1;
    `;
    return pool.query(sql, [id]);
  },

  // Cancel appointment
  async cancelAppointment(id) {
    const sql = `
      UPDATE appointment
      SET status = 'cancelled'
      WHERE appointment_id = $1;
    `;
    return pool.query(sql, [id]);
  }


};