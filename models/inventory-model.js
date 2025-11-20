const pool = require("../database/")

/* ***************************
 *  Get all classifications
 * ************************** */
async function getClassifications() {
  try {
    const data = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    )
    return data.rows
  } catch (error) {
    console.error("getClassifications error " + error)
    return []
  }
}

/* ***************************
 *  Get inventory items by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
    return []
  }
}

/* ***************************
 *  Get single inventory item by inv_id
 * ************************** */
async function getInventoryByInvId(invId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [invId]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByInvId error " + error)
    return []
  }
}

/* ***************************
 *  Insert new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO classification (classification_name)
      VALUES ($1)
      RETURNING *;
    `;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("addClassification error:", error);
    return null;
  }
}

/* **********************
 *   Check for existing classification
 * ********************* */
async function checkExistingClassification(name) {
  try {
    const sql = "SELECT * FROM classification WHERE LOWER(classification_name) = LOWER($1)";
    const result = await pool.query(sql, [name]);
    return result.rowCount;  // returns 0 or 1+
  } catch (error) {
    console.error("checkExistingClassification error:", error);
    return null;
  }
}

/* *****************************
 *   Add Vehicle to Inventory
 * **************************** */
async function addVehicle(
  classification_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
      INSERT INTO inventory 
        (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `;

    const result = await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    ]);

    return result.rows[0];
  } catch (error) {
    console.error("addVehicle error:", error);
    return null;
  }
}


/* ***************************
 * EXPORT FUNCTIONS
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByInvId,
  addClassification,
  checkExistingClassification,
  addVehicle
}
