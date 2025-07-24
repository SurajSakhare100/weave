import cron from 'node-cron';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

/**
 * Check and publish scheduled products that are due
 */
const checkAndPublishScheduledProducts = async () => {
  try {
    const now = new Date();
    console.log(`[Scheduler] Checking for scheduled products at ${now.toISOString()}`);

    // Find all scheduled products that are pending
    const scheduledProducts = await Product.find({
      isScheduled: true,
      scheduleStatus: 'pending'
    });

    console.log(`[Scheduler] Found ${scheduledProducts.length} scheduled products to check`);

    const productsToPublish = [];

    // Check each product individually for more accurate time comparison
    for (const product of scheduledProducts) {
      try {
        const scheduledDate = product.scheduledPublishDate;
        const scheduledTime = product.scheduledPublishTime;
        
        if (!scheduledDate || !scheduledTime) {
          console.log(`[Scheduler] Product ${product._id} missing date or time, skipping`);
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
          console.log(`[Scheduler] Product ${product._id} has invalid datetime, skipping`);
          continue;
        }

        console.log(`[Scheduler] Product ${product._id} scheduled for ${scheduledDateTime.toISOString()}, current time: ${now.toISOString()}`);

        // Check if the scheduled time has passed
        if (scheduledDateTime <= now) {
          productsToPublish.push(product);
          console.log(`[Scheduler] Product ${product._id} ready to publish`);
        }
      } catch (error) {
        console.error(`[Scheduler] Error processing product ${product._id}:`, error);
      }
    }

    if (productsToPublish.length > 0) {
      console.log(`[Scheduler] Publishing ${productsToPublish.length} products`);
      
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
      
      console.log(`[Scheduler] Successfully published ${result.modifiedCount} products`);
    } else {
      console.log('[Scheduler] No products ready to publish');
    }
  } catch (error) {
    console.error('[Scheduler] Error in scheduled product publishing:', error);
  }
};

/**
 * Initialize the scheduler
 */
export const initializeScheduler = async () => {
  try {
    console.log('[Scheduler] Initializing scheduler...');
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('[Scheduler] Database not connected, waiting...');
      // Wait for database connection
      mongoose.connection.once('connected', () => {
        console.log('[Scheduler] Database connected, starting scheduler...');
        startScheduler();
      });
      return;
    }
    
    startScheduler();
    
  } catch (error) {
    console.error('[Scheduler] Failed to initialize scheduler:', error);
  }
};

const startScheduler = () => {
  try {
    // Run every minute to check for products to publish
    const task = cron.schedule('* * * * *', async () => {
      console.log('[Scheduler] Running scheduled check at:', new Date().toISOString());
      await checkAndPublishScheduledProducts();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    // Start the task
    task.start();
    console.log('[Scheduler] Cron job started successfully');

    // Run an initial check
    console.log('[Scheduler] Running initial check...');
    checkAndPublishScheduledProducts();
    
  } catch (error) {
    console.error('[Scheduler] Failed to start scheduler:', error);
  }
};

/**
 * Manually trigger the scheduler (for testing)
 */
export const triggerScheduler = async () => {
  await checkAndPublishScheduledProducts();
}; 