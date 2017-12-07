import { MySqlClient } from "../../common/clients/MySqlClient"
import { UserActivity } from "../Api"

const createTableDDL = "CREATE TABLE IF NOT EXISTS user_event_counts ( \
    slack_id VARCHAR(64) NOT NULL, \
    integration CHAR(1) NOT NULL, \
    dow TINYINT NOT NULL, \
    hours TINYINT NOT NULL, \
    event_count INTEGER NOT NULL  DEFAULT 0, \
    PRIMARY KEY (slack_id, integration, dow, hours), \
    INDEX (slack_id), \
    INDEX (slack_id, dow), \
    INDEX (slack_id, hours), \
    INDEX (slack_id, dow, hours) \
)"

const insertOrUpdateSQL = "INSERT INTO user_event_counts ( slack_id, integration, dow, hours, event_count) \
VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE event_count = event_count + 1"

const userActivityDistributionSQL = "SELECT dow, hours, sum(event_count) as event_count FROM user_event_counts WHERE slack_id = ? GROUP BY dow, hours"

/**
 * Repository for User Activity counts, stored on RDS
 */
export class UserActivityCountRepository {

    constructor(private readonly mySql:MySqlClient) {}

    async createTableIfNotExists():Promise<void> {
        return this.mySql.execute(createTableDDL)
    }

    async incActivityCount(userActivity:UserActivity):Promise<void> {
        const params = [
            userActivity.slackId,
            userActivity.integration,
            userActivity.dow,
            userActivity.hours
        ]
        return this.mySql.query(insertOrUpdateSQL, params)
    }

    async getUserActivityDistribution(slackId:string):Promise<any[]> { 
        return this.mySql.query(userActivityDistributionSQL, [ slackId ] )
    }
}
