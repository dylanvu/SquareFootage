
import * as mongo from 'mongodb';
import * as cron from 'cron';

export const resetWorked = async (mongoclient: mongo.MongoClient): Promise<void> => {
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
}

export const ResetLabor = async (mongoclient: mongo.MongoClient) => {
    // reset worked status every hour
    const resetJob = new cron.CronJob('0 0 * * * *', async () => {
        console.log("Cron job")
        resetWorked(mongoclient);
    }, null, true, 'America/Los_Angeles');
    resetJob.start();
}

