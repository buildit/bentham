# AWS Environment prerequisites and setup

## DNS Domains

Both frontend and API uses custom domains. 

Frontend and API subdomain may be in the same or different domains.

More sepecifically: 

* All API stages (environments) use the same hostname:
    ```
    <service>-api.<api-base-domain>/
    ```
    Where `<service>` is `icarus` unless changed in the `serverless.yml` manifest.

* Frontend uses a separate subdomain, per-stage:
    ```
    <service>-<stage>.<site-base-domain>
    ```

`<api-base-domain>` may be the same as `<site-base-domain>`.

All domains must be hosted on Route53 and ACM must contain valid SSL certificate.
This requires a manual, one-off setup.

More details about custom DNS setup and certificates [here](./custom_domain.md)

## AWS Region

At the moment the region is hardwired to `us-east-1`, due to a limit of Amazon Certificate Manager,
used for assigning public DNS names to lambda endpoints
(see: https://github.com/amplify-education/serverless-domain-manager#user-content-known-issues)

## AWS user permission

For deployment, a user with total admin powers works for sure. 
It is possible to set up a user with less, but still great power.. and great responsibility ;)

**TODO:** Document required permission to deploy

## API Custom domain setup

The custom domain used by API must be set up with a [one-off operation](./custom_domain.md#Create-API-custom-domain) before deploying for the first time.

## Custom API Gateway domaim removal

`sls delete_domain` removes the custom domain (used by all stages).

This operation removes the domain used by all API stages.
It is required only if you are completely dropping the project.