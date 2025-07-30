import cron from 'node-cron';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const checkAndPublishScheduledProducts = async () => {
  try {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    

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
          console.log(`[Scheduler] Product ${product._id} missing date or time, skipping`);
          continue;
        }

        // Create scheduled datetime in IST
        let scheduledDateTime;
        
        // Convert scheduledDate to string if it's a Date object
        const dateStr = scheduledDate instanceof Date ? scheduledDate.toISOString().split('T')[0] : String(scheduledDate);
        
        if (dateStr.includes('T')) {
          // ISO format - convert to IST
          const utcDate = new Date(scheduledDate);
          scheduledDateTime = new Date(utcDate.getTime() + istOffset);
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
          
          // Create date in IST
          const [year, month, day] = dateStr.split('-').map(Number);
          const [hour, minute] = timeStr.split(':').map(Number);
          
          // Create date in local timezone (assuming server is in IST or similar)
          scheduledDateTime = new Date(year, month - 1, day, hour, minute, 0);
        }

        if (isNaN(scheduledDateTime.getTime())) {
          continue;
        }


        // Check if the scheduled time has passed (compare in IST)
        if (scheduledDateTime <= istTime) {
          productsToPublish.push(product);
        }
      } catch (error) {
        console.error(`[Scheduler] Error processing product ${product._id}:`, error);
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


export const initializeScheduler = async () => {
  try {
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // Wait for database connection
      mongoose.connection.once('connected', () => {
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
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istTime = new Date(now.getTime() + istOffset);
      await checkAndPublishScheduledProducts();
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata" // Indian Standard Time
    });

    // Start the task
    task.start();

    // Run an initial check
    checkAndPublishScheduledProducts();
    
  } catch (error) {
    console.error('[Scheduler] Failed to start scheduler:', error);
  }
};

export const triggerScheduler = async () => {
  await checkAndPublishScheduledProducts();
}; 