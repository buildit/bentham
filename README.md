# Icarus

This project is mostly a technology demonstrator, using AWS Lambda to collect data about user activity
for later processing.
The ultimate goal should be collecting enough data to feed a ML process. At the moment only a simple aggregate data read-model is created.

The current implementation uses Slack as primary user identification, and connects to Github and Dropbox to receive events about user activities.
Users must log in using a connected Slack Team id and authorise Dropbox and Github to have their activity analysed.

More tools may be easily integrated, as long as they support OAuth2 and some form of webhook to notify events.

No sensitive information is gathered from Dropbox (filename, content).
Only information avaiable to any Github Organisation or Repository user (depending were webhooks are connected) are collected

A simple frontend SPA is provided, to let the user authenticate with Slack, Dropbox and Github

## Technology stack

The project runs entirely on AWS and uses the following services:
- AWS Lambda
- API Gateway
- DynamoDB
- VPC
- RDS Aurora
- S3
- CloudFront
- Route53
- Certificate Manager
- CloudFront

The runtime is Node.js using TypeScript code for the Lambda and JavaScript for the simple frontend.

The project uses [Serverless](https://serverless.com/) toolkit.

A [Travis CI](https://travis-ci.org/) manifest is provided.


## AWS setup

See [detailed info about AWS requirements and setup](./docs/aws.md)

Attention: no expensive resource is used by this project, but many of them are not in any free tier. 
Also, it costs money if you keep the database instance running.

## Development lifecycle

See [detailed info about development lifecycle, deployment and cleanup](./docs/development.md)

## CI/CD

Build manifest and build scripts are available for setting up Travis CI.
See [detailed docs for setting up Travis](./docs/travis_ci.md).


## Public URLs

* Frontend: `https://icarus-<stage>.<site-base-domain>`
* Lambda service base URI: `https://<icarus-api-domain>/<stage>/`

See alsop [DNS domains](./docs/aws.md#DNS-Domains)

## More documentation


* [Custom DNS domain](./docs/custom_domain.md)
* [Slack integration](./docs/slack_integration.md)
* [GitHub integration](./docs/github_integration.md)
* [Dropbox integration](./docs/dropbox_integration.md)
* [DynamoDB and RDS tables](./docs/tables.md)


## Known Issues and Limitations

* SSL Certificate generation and import in ACM is manual.
* API Gateway Custom Domains are only available in `us-east-1` Region (10/2017) so we must use that Region.
* There is some issue deploying RDS Aurora on `us-east-1a` and `-1b`. I can't find any documentation, but other people had the same issue. CF complaining about "Your subnet group doesn't have enough availability zones..." when using `us-east-1a` and `-1b`, while it works on `-1c` and `-1d`. For example, see [this answer](https://stackoverflow.com/questions/44924723/creation-rds-aurora-cluster-via-cloudformation#answer-45340611)
* There is a known AWS issue potentially preventing from deleting the whole stack: https://stackoverflow.com/questions/41299662/aws-lambda-created-eni-not-deleting-while-deletion-of-stack#answer-41310289 If the deletion get stuck, using the Console manually detach and delete all Network Interfaces named after your namespace (`<service>-<stage>`) and attached to Lambdas.
* The user journey authenticating with Slack, Dropbox and Github depends on whether the test user has already authorised the Icarus application instance. The current end-2-end tests assumes the user has authorised the app (otherwise the journey would not be repeatable). **You have to run a MANUAL login an link integrations journey using test users before running the end-2-end tests**


## Disclaimer
> This project is meant to be an experiment, not a reference implementation for Lambdas nor an example of how to write idiomatic Typescript.
