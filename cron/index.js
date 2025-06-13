const { CronJob } = require("cron");
const User = require("./user");

// Export a scheduled Cron job that imports users every 45 minutes
exports.sheduleImportUsers = new CronJob(
  "0 */45 * * * *", // Cron expression: runs at minute 0 of every 45th minute (e.g., 12:00, 12:45, 1:30, etc.)
  async function () {
    try {
      // Attempt to run the user import logic
      await User.import();
    } catch (err) {
      // Log any errors encountered during import
      console.log(err);
    }
  },
  null,   // No onComplete function needed
  false   // The job is not started automatically; must be started manually using .start()
);
