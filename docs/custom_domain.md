# Custom DNS domain

### Backend domain

Icarus uses a custom DNS domain for APIs.

The API Gateway custom domain is managed using [Serverless Domain Manager plugin](https://github.com/amplify-education/serverless-domain-manager).
(Also see https://serverless.com/blog/serverless-api-gateway-domain/)

The domain name is specified by the `ICARUS_DOMAIN` environment variable.

All stages are deployed to the same domain, using different basepaths.

This domain must match with the certificate added to ACM (see below.)

### Frontend domain

The FrontEnd also uses a custom DNS Domain.

The base FE domain is defined by the `ICARUS_SITE_BASE_DOMAIN` variable. 

Different stages uses different FE hostnames, following this pattern: `icarus-<stage>.<ICARUS_SITE_BASE_DOMAIN>`.

Note that `<ICARUS_SITE_BASE_DOMAIN>` may be also the base domain of `<ICARUS_DOMAIN>`.

You also need a valid certificate in ACM for any subdomain of `<ICARUS_SITE_BASE_DOMAIN>` (see below).

## SSL Certificartes

We need a valid, signed SSL certifcate for `<ICARUS_DOMAIN>` and for `*.<ICARUS_SITE_BASE_DOMAIN>`.
Obviously, if `<ICARUS_SITE_BASE_DOMAIN>` is also the base domain of  `<ICARUS_DOMAIN>` we only need the certificate `*.<ICARUS_SITE_BASE_DOMAIN>`.

Unless you have a paid certificate, see [here](./free_ssl_certificates.md) to generate one for free and load it into ACM.

### Create API custom domain

Once the cerfificate is loaded in ACM, you may use it for Lamda API Gateway endpoints.

API domain is handled by Serverless Domain Manager plugin:

```
sls create_domain
```

This creates the record in Route53 and the API Gateway Custom Domain Name.

The certificate, uploaded in ACM, is automatically matched by DNS domain name.

API Gateway Custom Domain uses a CloudFormation distribution under the hood. 
This distribution is not directly visible from CloudFormation interface.

The distribution may take up to 40 mins to come up and the same time to be deleted.

To monitor the deployment status of the Custom domain: *AWS Console: Amazon API Gateway > Custom Domain Names*.
The ACM Certificate status takes a while "Initialising...".
I can't find any AWS CLI equivalent for retrieving that information.

### Create FrontEnd DNS entry

The certificate for  `*.<ICARUS_SITE_BASE_DOMAIN>` must be loaded in ACM and `<ICARUS_SITE_BASE_DOMAIN>` must be hosted on Route53.

The deployment process (`sls deploy`) takes care of creating DNS records for the FrontEnd.

### Certificate renewal

**TBD**
