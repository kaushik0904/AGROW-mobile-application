const cron = require('node-cron');
const { pool } = require('../../core/database/connection');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const sendPushNotifications = async (userIds, title, body, data) => {
  // In a real implementation we would fetch push tokens from the users table.
  // For MVP placeholder:
  console.log(`[PUSH] To userIds ${userIds}: ${title} - ${body}`);
};

const initCronJobs = () => {
  // Run every 5 minutes for rapid prototype iteration (could be longer in prod)
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Running Hub Check Cron...');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const expiredHubs = await client.query(`
        SELECT * FROM hubs 
        WHERE status = 'PAYMENT_REQUIRED' AND deadline < NOW()
      `);

      for (const hub of expiredHubs.rows) {
        // Step 1: Penalize users who pledged but didn't pay
        const unPaidMembers = await client.query(`
          SELECT * FROM hub_members 
          WHERE hub_id = $1 AND status = 'PLEDGED' AND is_waitlist = false
        `, [hub.id]);

        for (const member of unPaidMembers.rows) {
           // Increment flake_count, reduce karma. Ban if flake_count >= 3.
           await client.query(`
              UPDATE users 
              SET karma_score = GREATEST(0, karma_score - 10), 
                  flake_count = flake_count + 1,
                  banned_from_hubs_until = CASE WHEN (flake_count + 1) >= 3 THEN NOW() + interval '30 days' ELSE banned_from_hubs_until END
              WHERE id = $1
           `, [member.user_id]);

           // Mark member as flaked
           await client.query(`UPDATE hub_members SET status = 'FLAKED' WHERE id = $1`, [member.id]);
           
           // Reduce current_kg
           await client.query(`UPDATE hubs SET current_kg = current_kg - $1 WHERE id = $2`, [member.pledge_kg, hub.id]);
           
           // Notify user of penalty
           await sendPushNotifications([member.user_id], 'Karma Penalty', 'You failed to pay for your hub pledge. -10 Karma.');
        }

        // Step 2: Attempt to promote waitlisted members
        const waitlistMembers = await client.query(`
          SELECT * FROM hub_members 
          WHERE hub_id = $1 AND is_waitlist = true AND status = 'PLEDGED'
          ORDER BY joined_at ASC
        `, [hub.id]);

        let currentHubKg = Number(hub.current_kg) - unPaidMembers.rows.reduce((sum, m) => sum + Number(m.pledge_kg), 0);

        const promotedUsers = [];
        for (const wlMember of waitlistMembers.rows) {
          if (currentHubKg + Number(wlMember.pledge_kg) <= hub.target_kg) {
            await client.query(`UPDATE hub_members SET is_waitlist = false WHERE id = $1`, [wlMember.id]);
            currentHubKg += Number(wlMember.pledge_kg);
            promotedUsers.push(wlMember.user_id);
          }
        }
        await client.query(`UPDATE hubs SET current_kg = $1 WHERE id = $2`, [currentHubKg, hub.id]);

        if (promotedUsers.length > 0) {
           await sendPushNotifications(promotedUsers, 'Hub Waitlist Promoted', 'Your segment has been promoted to the hub. Please pay!', { hub_id: hub.id });
        }

        // Step 3: Transition Hub
        if (currentHubKg >= hub.target_kg) {
           // Promoted enough waitlist users! Extend deadline.
           await client.query(`UPDATE hubs SET deadline = NOW() + interval '2 hours' WHERE id = $1`, [hub.id]);
           console.log(`[CRON] Hub ${hub.id} survived via waitlist promotion.`);
        } else {
           // Could not meet target. Transition to FAILED.
           await client.query(`UPDATE hubs SET status = 'FAILED' WHERE id = $1`, [hub.id]);
           console.log(`[CRON] Hub ${hub.id} failed due to flakes.`);
           
           // Fetch users who DID pay, to notify them of refund
           const paidMembers = await client.query(`SELECT user_id FROM hub_members WHERE hub_id = $1 AND status = 'PAID'`, [hub.id]);
           if (paidMembers.rows.length > 0) {
              const paidIds = paidMembers.rows.map(m => m.user_id);
              await sendPushNotifications(paidIds, 'Hub Failed', 'Unfortunately the hub failed. You will be refunded within 1-2 days.', { hub_id: hub.id });
           }
        }
      }
      
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[CRON] Error in Hub Cron:', err);
    } finally {
      client.release();
    }
  });
};

module.exports = { initCronJobs };
