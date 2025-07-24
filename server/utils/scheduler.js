import cron from 'node-cron';
import Product from '../models/Product.js';

/**
 * Check and publish scheduled products that are due
 */
const checkAndPublishScheduledProducts = async () => {
  try {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const currentDate = now.toISOString().split('T')[0];

    // Find all scheduled products that are pending
    const scheduledProducts = await Product.find({
      isScheduled: true,
      scheduleStatus: 'pending'
    });

    const productsToPublish = [];

    // Check each product individually for more accurate time comparison
    for (const product of scheduledProducts) {
      try {
        const scheduledDate = product.scheduledPublishDate;
        const scheduledTime = product.scheduledPublishTime;
        
        if (!scheduledDate || !scheduledTime) {
          continue;
        }

        // Create scheduled datetime
        let scheduledDateTime;
        
        // Convert scheduledDate to string if it's a Date object
        const dateStr = scheduledDate instanceof Date ? scheduledDate.toISOString().split('T')[0] : String(scheduledDate);
        
        if (dateStr.includes('T')) {
          // ISO format
          scheduledDateTime = new Date(scheduledDate);
        } else {
          // YYYY-MM-DD format, need to parse time
          let timeStr = scheduledTime.trim();
          
          // If time is in 12-hour format, convert to 24-hour
          if (timeStr.includes('AM') || timeStr.includes('PM')) {
            const [timePart, ampm] = timeStr.split(' ');
            const [hours, minutes] = timePart.split(':');
            let hour = parseInt(hours);
            const minute = parseInt(minutes);
            
            if (ampm === 'PM' && hour !== 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            
            timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          }
          
          scheduledDateTime = new Date(`${dateStr}T${timeStr}:00`);
        }

        if (isNaN(scheduledDateTime.getTime())) {
          continue;
        }

        // Check if the scheduled time has passed
        if (scheduledDateTime <= now) {
          productsToPublish.push(product);
        }
      } catch (error) {
        // Silent error handling for individual products
      }
    }

    if (productsToPublish.length > 0) {
      // Update products to published status
      const result = await Product.updateMany(
        {
          _id: { $in: productsToPublish.map(p => p._id) }
        },
        {
          isScheduled: false,
          scheduledPublishDate: null,
          scheduledPublishTime: null,
          scheduleStatus: 'published',
          status: 'active',
          available: 'true'
        }
      );
    }
  } catch (error) {
    console.error('[Scheduler] Error in scheduled product publishing:', error);
  }
};

/**
 * Initialize the scheduler
 */
export const initializeScheduler = () => {
  // Run every minute to check for products to publish
  const task = cron.schedule('* * * * *', () => {
    checkAndPublishScheduledProducts();
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  // Start the task
  task.start();

  // Run an initial check
  checkAndPublishScheduledProducts();
};

/**
 * Manually trigger the scheduler (for testing)
 */
export const triggerScheduler = async () => {
  await checkAndPublishScheduledProducts();
}; 