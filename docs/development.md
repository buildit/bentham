# Development

## Develop machine prerequisites

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

### ACM Certificate ARN

Before deploying, you need to setup the `CERTIFICARTE_ARN` environment variable, containing the ARN of the 
certificate used for frontend domains. See [Custom Domain and Certificates]( ./custom_domain.md)

You may either look at the AWS Console or use the provided `getCertificateArnByDomain.sh` script:
```bash
export CERTIFICATE_ARN=`scripts/getCertificateArnByDomain.sh <base-domain> us-east-1`
```
Note that `us-east-1` [cannot be changed at the moment](./aws.md#AWS-Region) 

## Development lifecycle

* `yarn test` runs backend unit tests.
* From `./client` subdirectory
    * `yarn run dev` runs a localhost Node server to test the frontend
    * `yarn run build` build and package the frontend, but does not deploy it

* `sls deploy -v` provision infrastructure, deploys backend and frontend (frontend must have been build before deploying).
* From `./client` subdirectory, `yarn e2e` runs frontend end to end tests against a deployed environment (see below)

Notes
* The first deployment may take several minutes (up to 45) as the creation of the RDS instance and especially the CloudFront Distribution take long.
    Subsequent deployment should be faster: CloudFormation, used by Serverless toolkit, should be smart enough to touch only the changes.
* All the environment variables must be set up before building or deploying, including `CERTIFICATE_ARN`
* [Slack](,/slack_integration.md), [Dropbox](./dropbox_integration.md) and [Github](./github_integration.md) must be set up before deploying. 
* Localhost dev frontend uses a deployed api: `https://icarus-api.<ICARUS_API_DOMAIN>/<ICARUS_STAGE>/`
* DO NOT specify stage using `--stage ...` when running `sls deploy` 
* End-to-end tests runs by default against `http://icarus-<ICARUS_STAGE>.<ICARUS_SITE_BASE_DOMAIN>`. This may be overridden setting `ICARUS_E2E_TARGET` to the frontend URL
* End-to-end tests use test users that must be set up in Slack, Drobox and Github. Their credentials must be defined in `*_TEST_USER_ID` and `*_TEST_USER_PWD` variables



## Cleanup

To entirely remove the stage defined by `ICARUS_STAGE` run:
```bash
sls remove -v
```

There is a [known issue](../README.md#Known-Issues-and-Limitations) potentially preventing a complete cleanup of the infrsatructure.

If deletion fails, you need to use the AWS Console: 
look for orphan network interfaces (ENI) linked to the VPC, detach and drop than manually and try deleting the  stack again, either by `sls` or from the CloudFormation console.


### Database retention

By default, databases (DynamoDB tables and Aurora instances) are deployed with a `'Delete'` *DeletionPolicy*.
It means they will be deleted when you remove the stack, losing all data.

You may optionally specify `--dbDeletion Retain` when **deploying** the stack to prevent deletion on terminartion.

Note that the *DeletionPolicy* has to be specified when the infrastructure is created, to make it work when you will later delete it.

