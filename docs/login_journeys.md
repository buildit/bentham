# Login journeys

An Icarus instance is bound to one Slack team.

Icarus main user identity is the user's Slack account in the team.

Users from other integrations (Dropbox, GitHub...) are mapped to the Slack user.

## User registration & Login

### Slack login

For details about Slack OAuth flow, see: https://api.slack.com/docs/oauth

This journey happens when the user is not logged in (i.e. the browser LS has no 'icarus-user-token')

1. **index.html**, Browser, User clicks Slack login button
    * Browser goes to `<slack-oauth-initiate-lambda>?returnUri=<post-login-page-url>`
    * `<post-login-page-url>` must match with a Redirect URL set in the Slack App

2. **slack-oauth-initiate-lambda**:
    1. Redirects to `<slack-team-url>/oauth/authorize?scope=identity.basic&client_id=...&redirect_url=<return-uri>`
        * App requires `identity.basic` authorisation scope

3. User: authorises the application to access Slack
4. Browser redirected back to `<post-login-page-url>?code=<slack-authorisation-code>`
5. **post-login.html**, Browser (AJAX) POST, `<slack-oauth-complete-lambda>` (as `application/json`)
    * Body: 
        * `code`: `<slack-authorisation-code>`
        * `returnUri`: `<post-login-page-url>`
        
    * `returnUri` is required for verification, by Slack

6. **slack-oath-complete-lambda**:
    1. Redeems `<slack-authorisation-code>` getting a `<slack-access-token>`
        * GET, `https://slack.com/api/oauth.access?client_id=...&client_secret=...&code=<slack-authorisation-code>&redirect_url=<fe-post-login>`
        * (`redirect_url` is required for verification)

    2. Retrieves User Details
        * GET, `https://slack.com/api/users.identity?client_id=...&secret=...&token=<slack-access-token>`
        * Returns: `<slack-user-id>`, `<slack-username>`, `<slack-team-id>`
        * Requires `identity.basic` auth scope

    3. **IdentityService.grantUsertoken**
      1. Saves Slack Identity (`slack_accounts` table) in DynamoDB
          * slack_id: `<slack-user-id>`, PK: overwrites the same record when a known user log in again, possibly with a different Slack access token
          * user_name: `<slack-username>`
          * team_id: `<slack-team-id>`
          * access_token: `<slack-access-token>`]

      2. Generates and saves a new `<icarus-access-token>` (UUID), related to `<slack-user-id>`

      3. Retrieves user's identities for other integrations, if any (Dropbox, GitHub... ), by `<slack-user-id>`
          * DynamoDB `dropbox_accounts`, `github_accounts` tables. PK is `slack_id`

      4. Constructs `<user-token>`
          * Includes `<slack-access-token>`, Slack Identity and all other available identities

      5. Lambda returns (`<icarus-user-token>`)
        ```
        {
          userName: <slack-username>,
          accessToken: <icarus-access-token>, // Random UUID
          dropboxAccountId: <dropbox-account-id>|undefined,
          githubUsername: <github-username>|undefined,
        }
        ```  

7. **post-login.html**,
    * Stores `<icarus-user-token>` in localStorage
    * Jump to **index.html**
8. **index.html** Shows integrations login buttons (Dropbox, Github...) 


### Dropbox login

This journey happens when the user is logged into Icarus with Slack, but not yet with Dropbox
(i.e. the browser LS has an `<icarus-user-token>` without `dropboxAccountId`).

1. **index.html**, Browser, User clicks Dropbox login button
  * Browser POST to `<dropbox-oauth-initiate-lambda>` (as `application/x-www-form-urlencoded`)
    * Body:
        * `icarusAccessToken`: `<icarus-access-token>`
        * `returnUri`: `<post-dropbox-login-page-url>`

2. **dropbox-oauth-initiate-lambda**:
    * Gets OAuth Authorisation Code from Dropbox authorise endpoint
        * GET, `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=...&redirect_uri=<return-uri-param>&state=<icarus-access-token>`
        * `redirect_uri` is the *returnUri* parameter passed to the lambda, i.e. `<dropbox-post-login-page-url>`
        * `state=<icarus-access-token>` is not actually used by the current frontend-driven implementation

3. User: authorises the application to access Dropbox
4. Browser redirected back to `<dropbox-post-login-page-url>?code=<dropbox-authorisation-code>&state=<icarus-access-token>`
    * `state=<icarus-access-token>` is not used by the current implementation

5. **dropbox-post-login.html**,
    * Browser (AJAX) POST, `<dropbox-auth-complete-lambda>` (as `application/json`)
        * Body:
            * `code`: `<dropbox-authorisation-code>`
            * `icarusAccessToken`: `<icarus-access-token>`
            * `initReturnUri`: `<post-dropbox-login-page-url>`, must match the oauth initiate returnUri and is used for verification by Dropbox

6. **dropbox-oauth-complete-lambda**
    1. Redeems `<dropbox-authorisation-code>` getting a `<dropbox-access-token>` and `<dropbox-account-id>`, via Dropbox API
    2. Stores `<dropbox-access-token>` and `<dropbox-account-id>` in the Dropbox Token Repository
    3. Obtains and stores initial cursor
        1. Gets latest cursor from Dropbox API, passing the `<dropbox-access-token>`
        2. Saves the cursor for the Dropbox account Id (overwriting, if exists)

    4. Adds a Dropbox identity to the user, in the Identity Service
        1. Gets the `<slack-account-id>` corresponding to the `<icarus-access-token>`
        2. Saves the Dropbox Identity (Dropbox account), related to the `<slack-account-id>`
        3. Retrieves other identities (Github) for the same `<slack-account-id>`
        4. Generates the `<icarus-user-token>` with all available identities

    5. Lambda returns (`<icarus-user-token>`)
        ```
        {
          userName: <slack-username>,
          accessToken: <slack-access-token>,
          dropboxAccountId: <dropbox-account-id>,
          githubUsername: <github-username>|undefined,
        }
        ```  

7. **post-dropbox-login.html**
    * Updates `<icarus-user-token>` in localStorage
    * Jump back to **index.html**

### Github login

Similarly to Dropbox, the GitHub login journey happens when the user is logged into Icarus with Slack, but not yet with GitHub.

The flow is almost identical to the Dropbox flow.

1. **index.html**, Browser, User clicks GitHub login button
  * Browser POST to `<github-oauth-initiate-lambda>` (as `application/x-www-form-urlencoded`)
        * Body:
            * `icarusAccessToken`: `<icarus-access-token>`
            * `returnUri`: `<github-post-login-page-url>`

2. **github-oauth-initiate-lambda**:
    * Gets OAuth Authorisation Code from Dropbox authorise endpoint
        * GET, `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=<return-uri-param>&state=<icarus-access-token>`
        * `redirect_uri` is the *returnUri* parameter passed to the lambda, i.e. `<github-post-login-page-url>`
        * `state=<icarus-access-token>` is not actually used by the current frontend-driven implementation

3. User: authorises the application to access GitHub
4. Browser redirected back to `<github-post-login-page-url>?code=<github-authorisation-code>&state=<icarus-access-token>`
    * `state=<icarus-access-token>` is not used by the current implementation

5. **github-post-login.html**,
    * Browser (AJAX) POST, `<github-auth-complete-lambda>` (as `application/json`)
        * Body:
            * `code`: `<github-authorisation-code>`
            * `icarusAccessToken`: `<icarus-access-token>`
            * `initReturnUri`: `<github-post-login-page-url>`, must match the oauth initiate returnUri and is used for verification by Github

6. **github-oauth-complete-lambda**
    1. Redeems `<github-authorisation-code>` getting a `<github-access-token>`, via Github OAuth Access Token endpoint
    2. Retrieves user's details via GitHub API, passing the `<github-access-token>`
    3. Stores `<github-access-token>` and `<github-username>` in the GitHub Token Repository
    4. Adds a Dropbox identity to the user, in the Identity Service (identical to Dropbox)
        1. Gets the `<slack-account-id>` corresponding to the `<icarus-access-token>`
        2. Saves the Github Identity (Github account), related to the `<slack-account-id>`
        3. Retrieves other identities (Dropbox) for the same `<slack-account-id>`
        4. Generates the `<icarus-user-token>` with all available identities

    5. Lambda returns (`<icarus-user-token>`)
        ```
        {
          userName: <slack-username>,
          accessToken: <slack-access-token>,
          dropboxAccountId: <dropbox-account-id>|undefined,
          githubUsername: <github-username>,
        }
        ```  

7. **github-post-login.html**
    * Updates `<icarus-user-token>` in localStorage
    * Jump back to **index.html**
