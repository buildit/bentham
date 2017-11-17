# Persistent tables



## DynamoDB Tables

DynamoDB table names are always prefixed with: `icarus-[<developer>]<stage>-`


### `accounts`table

- slack_id: PK, Icarus account ID == Slack ID
- access_token
- { other user info }

GSI:
- `slack_id_by_access_token` index
    - PK access_token 
    - KEYS_ONLY (slack_id)

### `identities` table

- `slack_id`: PK
- `integration_type`: SK (S|D|G...)
- `account_id`: ID of the account in the integration type (e.g. SlackID, DropboxID, GithubUsername)
- `access_token`: integration access token
- { other info: `team_id`, `user_name`, }

GSI:
- `identity_by_account_id_and_type` index
    - PK `account_id`
    - SK `integration_type`
    - KEYS_ONLY (slack_id)



### `github_events` table

- `id`: PK, event ID
- `event_type`: Event type (e.g. `commit`)
- `event_timestamp`: Event timestamp, ISO 8691 date and time with TZ
- `username`: Github username

GSI:
- `events_by_user` Index
    - `username`: PK
    - `event_timestamp`: SK
    - ALL


### `drobpox_cursors` table

- `account_id`: PK, Dropbox user ID
- `cursor`: Dropbox cursor ID

### `dropbox_file_changes` table

- `account_id`: PK, Dropbox user ID
- `user_id`: *Modified by* user ID
- `timestamp`: timestamp **TODO Format?**
- `type`: tag **TODO ??**



## RDS Tables

#### `user_event_counts` table

```
    slack_id VARCHAR(64) NOT NULL,
    integration CHAR(1) NOT NULL,
    dow TINYINT NOT NULL,
    hours TINYINT NOT NULL,
    event_count INTEGER NOT NULL  DEFAULT 0,
    PRIMARY KEY (slack_id, integration, dow, hours),
    INDEX (slack_id),
    INDEX (slack_id, dow),
    INDEX (slack_id, hours),
    INDEX (slack_id, dow, hours)
```