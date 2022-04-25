
import * as mongo from 'mongodb';
import * as cron from 'cron';

export const ResetLabor = async (mongoclient: mongo.MongoClient) => {
    // reset worked status every hour
    const resetWorked = new cron.CronJob('0 0 * * * *', async () => {
        console.log("Resetting worked");
        try {
            let closet = await mongoclient.db().collection("closet");
            // reset everyone
            closet.updateMany({}, {
                $set: {
                    worked: false
                }
            })
        } catch (error) {
            console.error("ERROR IN HOURLY WORKER RESET")
            console.error(error);
        }
    }, null, true, 'America/Los_Angeles');
    resetWorked.start();
}

