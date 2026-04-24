const { pool } = require('./backend/src/core/database/connection');

async function enableHubs() {
    try {
        await pool.query(
            "UPDATE listed_crops SET is_hub_enabled = true, hub_target_kg = 50, hub_discount_percentage = 15 WHERE is_hub_enabled = false OR is_hub_enabled IS NULL;"
        );
        console.log("Successfully enabled hubs for all existing crops.");
    } catch (e) {
        console.error("Error updating crops", e);
    } finally {
        process.exit(0);
    }
}

enableHubs();
