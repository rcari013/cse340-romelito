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
 * EXPORT FUNCTIONS
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByInvId,
}
