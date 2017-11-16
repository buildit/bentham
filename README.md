# Icarus

Serverless project for monitoring various repositories and productivity tools

## Prerequisites

Node & Yarn:

```bash
brew install node
brew install yarn
yarn global add serverless
yarn
```

AWS CLI: 

```bash
pip install awscli --upgrade --user
```


## Domain setup

This application uses custom DNS names for lambdas.

The base domain must be hosted by Route53.

The domain name to use by the API is defined by the `ICARUS_API_DOMAIN` environment variable.
All Lambda stages uses the same domain.

DNS and certificate setup requires [manual setup](./custom_domain.md) to be executed, one-off, before deploying.

Frontend site use custom domains as well.
Every stage uses a separate sub-domain, following the pattern:
`icarus-<stage>.<site-base-domain>`


## Environment

The following environment variables are expected, to deploy the project:

* `ICARUS_API_DOMAIN`: DNS name of the domain used by API
* `ICARUS_STAGE`: Lambda stage you are deploying. **NOT required when buinding in CI**: the `build.sh` script takes care of it.
* `ICARUS_SITE_BASE_DOMAIN`: Base domain for front-end site. May be the base domain of API domain, but this is not required.
* `SLACK_TEAM_URL`: URL of Slack team
* `CERTIFICARTE_ARN`: ARN of the ACM certificate (see below)

Secrets:
* `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET`: Slack integration credentials
* `DROPBOX_CLIENT_ID` and `DROPBOX_CLIENT_SECRET`: Dropbox integration credentials
* `GITHUB_WEBHOOK_SECRET`: GitHub webhook application secret
* `GITHB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`: GitHub API integration credentials
* `RDS_USER` and `RDS_PWD`: RDS master user and pwd (master username default: `master`; no default pwd!)
* `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: AWS credentials of the user with enough power to execute the deployment.

End-to-end test users:
* `SLACK_TEST_USER_ID` and `SLACK_TEST_USER_PASSWORD`: Slack user for tests
* `GITHUB_TEST_USER_ID` and `GITHUB_TEST_USER_PASSWORD`: Github user for tests
* `DROPBOX_TEST_USER_ID` and `DROPBOX_TEST_USER_PASSWORD`: Dropbox user for tests

### AWS Region

At the moment the region is hardwired to `us-east-1`, due to a limit of Amazon Certificate Manager,
used for assigning public DNS names to lambda endpoints
(see: https://github.com/amplify-education/serverless-domain-manager#user-content-known-issues)

### AWS user permission

For deployment, a user with total admin powers works for sure. 
It is possible to set up a user with less, but still great power.. and great responsibility ;)

**TBD Document required permissions**

## Dev deployment

All environment variables above must be set, including `ICARUS_STAGE`.

**Attention: specifying the stage with `--stage ...` would work for the backend but not for the frontend.**


### ACM Certificate ARN

Before deploying, you need to setup the `CERTIFICARTE_ARN` environment variable, containing the ARN of the 
certificate used for frontend domains. See [Custom Domain and Certificates]( ./docs/custom_domain.md)

You may either look at the AWS Console or use the provided `getCertificateArnByDomain.sh` script:
```bash
export CERTIFICATE_ARN=`scripts/getCertificateArnByDomain.sh <base-domain> us-east-1`
```

The second parameter is obviously the AWS Region, but at the moment only `us-east-1` is supported.

### Application registration and integration setup

The Icarus application must registered in Slack, Dropbox and Github.

Dropobox and Github webhook must be setup for Icarus to receive events.

See:
* [Slack integration setup](./docs/slack_integration.md)
* [Dropbox integration setup](./docs/dropbox_integration.md)
* [Github integration setup](./docs/github_integration.md)


### Build Frontend

From `./client` directory:

```bash
yarn build
```

Frontend build expects the `ICARUS_STAGE` environment variable to decise which lambda stage to use (no `--stage` command line parameter) there.
The default lambda stage is `dev`.

### Deploy Backend & Frontend

From main project directory: 

```bash
sls deploy -v
```

This provision infrastructure, deploys lambda and the content of the frontend target directory  (`./client/dist`).
The frontend must be build before running deploy.

When you deploy a Stage for the first time, a CloudFront Distribution got created. It may take quite a while to complete (up to 54 mins).

### Frontend localhost development

From `./client` subdir: 

```bash
yarn run dev
```

Runs a Node instance on localhost serving the application and reloading dynamically.

Localhost frontend still uses deployed Lambdas, so don't forget specifying `ICARUS_STAGE` (or using the default `dev` stage).

### Frontend end-to-end tests

From `./client` subdir: 

```bash
yarn e2e
```

Tests use a deployed frontend. 
By default the stage defined by `ICARUS_STAGE` is used, but may be overridden setting `ICARUS_E2E_TARGET`.

E2e test uses Slack, Dropbox and Github actual users. Their credentials must be set up in `*_TEST_USER_ID` and `*_TEST_USER_PWD` variables.


### Database retention

By default, databases (DynamoDB tables and Aurora instances) are deployed with a `'Delete'` *DeletionPolicy*.
It means they will be deleted when you remove the stack, losing all data.

You may optionally specify `--dbDeletion Retain` when **deploying** the stack to prevent deletion on terminartion.

Note that the *DeletionPolicy* has to be specified when the infrastructure is created, to make it work when you will later delete it.


### Cleanup

```bash
sls remove -v
```

Removes lambdas, DynamoDB tables, RDS Cluster, frontend S3 bucket and CloudFront Distribution

**There is a known AWS issue potentially preventing complete deletion. See below.**
If deletion fails, look for orphan network interfaces (ENI) linked to the VPC, detach and drop than manually and try deleting the 
stack again, either by `sls` or from the CloudFormation console.


### Custom API Gateway domaim removal

`sls delete_domain` removes the custom domain (used by all stages).

This operation removes the domain used by all API stages.
It is required only if you are completely dropping the project.


## CI/CD

Build manifest and build scripts are available for setting up Travis CI.
See [detailed docs for setting up Travis](./docs/travis_ci.md).


## Public URLs

* Frontend: `https://icarus-<stage>.<site-base-domain>`
* Lambda service base URI: `https://<icarus-api-domain>/<stage>/`

## More documentation

* [Custom DNS domain](./docs/custom_domain.md)

* [Slack integration](./docs/slack_integration.md)
* [GitHub integration](./docs/github_integration.md)
* [Dropbox integration](./docs/dropbox_integration.md)


* [Login & authorisation journeys](./docs/login_journeys.md)
* [DynamoDB and RDS tables](./docs/tables.md)


## Known Issues/Limitations

* SSL Certificate generation and import in ACM is manual.
* API Gateway Custom Domains are only available in `us-east-1` Region (10/2017) so we must use that Region.
* There is some issue deploying RDS Aurora on `us-east-1a` and `-1b`. I can't find any documentation, but other people had the same issue. CF complaining about "Your subnet group doesn't have enough availability zones..." when using `us-east-1a` and `-1b`, while it works on `-1c` and `-1d`. For example, see [this answer](https://stackoverflow.com/questions/44924723/creation-rds-aurora-cluster-via-cloudformation#answer-45340611)
* There is a known AWS issue potentially preventing from deleting the whole stack: https://stackoverflow.com/questions/41299662/aws-lambda-created-eni-not-deleting-while-deletion-of-stack#answer-41310289 If the deletion get stuck, using the Console manually detach and delete all Network Interfaces named after your namespace (`<service>-<stage>`) and attached to Lambdas.
* The user journey authenticating with Slack, Dropbox and Github depends on whether the test user has already authorised the Icarus application instance. The current end-2-end tests assumes the user has authorised the app (otherwise the journey would not be repeatable). **You have to run a MANUAL login an link integrations journey using test users before running the end-2-end tests**