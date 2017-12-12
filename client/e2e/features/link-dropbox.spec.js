import { testEnvironmentUrl } from '../config/config';
import {
    DropboxAuthPage,
    DropboxSignInPage,
    IntegrationsPage,
    SlackAuthPage,
    SlackSignInPage,
} from '../pages';
import {
    getBaseUrl,
    getQueryString,
} from '../utils/helpers';

const dropboxAuthPage = new DropboxAuthPage();
const dropboxSignInPage = new DropboxSignInPage();
const integrationsPage = new IntegrationsPage();
const slackAuthPage = new SlackAuthPage();
const slackSignInPage = new SlackSignInPage();

fixture `Dropbox`
    .page(testEnvironmentUrl);

test.only
    .before(async (t) => {
        integrationsPage.login();
        
        await t.expect(slackSignInPage.domain.innerText).eql('icarus-ai');

        await slackSignInPage.login(process.env.SLACK_TEST_USER_ID, process.env.SLACK_TEST_USER_PASSWORD);

        await t.expect(slackAuthPage.form.authorizeButton.exists).ok('Continue (authorize) button missing on Slack auth page');
        
        await slackAuthPage.authorize();

        await t.expect(integrationsPage.linkDropboxButton.exists).ok();
    })
    ('Linking Dropbox account should navigate to the Dropbox Sign In page if the given user is not logged into Dropbox', async (t) => {
        integrationsPage.linkDropbox();

        await t.expect(dropboxSignInPage.form.header.innerText).eql(`Sign in to Dropbox to link to icarus-${process.env.ICARUS_STAGE}`);

        const baseUrl = await getBaseUrl();
        const redirectUri = await getQueryString('redirect_uri');
    
        await t
            .expect(baseUrl).eql('https://www.dropbox.com/oauth2/authorize')
            .expect(decodeURIComponent(redirectUri)).eql(`${testEnvironmentUrl}/dropbox-post-login`);
    });

test
    .skip
    .before(async (t) => {
        integrationsPage.login();
        
        await t.expect(slackSignInPage.domain.innerText).eql('icarus-ai');

        slackSignInPage.login(process.env.SLACK_TEST_USER_ID, process.env.SLACK_TEST_USER_PASSWORD);

        await t.expect(slackAuthPage.form.authorizeButton.exists).ok();
        
        slackAuthPage.authorize();

        await t.expect(integrationsPage.linkDropboxButton.exists).ok();

        integrationsPage.linkDropbox();
        
        await t.expect(dropboxSignInPage.form.signInButton.exists).ok();
    })
    ('Linking Dropbox account should navigate to the Dropbox auth page when signed in with Dropbox but Icarus has no permissions', async (t) => {
        dropboxSignInPage.login(process.env.DROPBOX_TEST_USER_ID, process.env.DROPBOX_TEST_USER_PASSWORD);

        await t.expect(dropboxAuthPage.appName.innerText).eql(`icarus-${process.env.ICARUS_STAGE}`);

        const redirectUri = await getQueryString('redirect_uri');
    
        await t.expect(decodeURIComponent(redirectUri)).eql(`${testEnvironmentUrl}/dropbox-post-login`);
    });

test
    .skip
    .before(async (t) => {
        integrationsPage.login();
        
        await t.expect(slackSignInPage.domain.innerText).eql('icarus-ai');

        slackSignInPage.login(process.env.SLACK_TEST_USER_ID, process.env.SLACK_TEST_USER_PASSWORD);

        await t.expect(slackAuthPage.form.authorizeButton.exists).ok();
        
        slackAuthPage.authorize();

        await t.expect(integrationsPage.linkDropboxButton.exists).ok();

        integrationsPage.linkDropbox();
        
        await t.expect(dropboxSignInPage.form.signInButton.exists).ok();

        dropboxSignInPage.login(process.env.DROPBOX_TEST_USER_ID, process.env.DROPBOX_TEST_USER_PASSWORD);
            
        await t.expect(dropboxAuthPage.form.authorizeButton.exists).ok();
    })
    ('When authorizing Icarus through Dropbox then it should link the accounts', async (t) => {
        dropboxAuthPage.authorize();

        await t
            .expect(integrationsPage.linkDropboxButton.exists).notOk()
            .expect(integrationsPage.linkedDropboxHeader.exists).ok();
    });    

test
    .before(async (t) => {
        integrationsPage.login();
        
        await t.expect(slackSignInPage.domain.innerText).eql('icarus-ai');

        slackSignInPage.login(process.env.SLACK_TEST_USER_ID, process.env.SLACK_TEST_USER_PASSWORD);

        await t.expect(slackAuthPage.form.authorizeButton.exists).ok();
        
        slackAuthPage.authorize();

        await t.expect(integrationsPage.linkDropboxButton.exists).ok();
    })
    ('Linking Dropbox account should link the accounts when Icarus is authorized through Dropbox', async (t) => {
        integrationsPage.linkDropbox();

        await t.expect(dropboxSignInPage.form.signInButton.exists).ok();

        dropboxSignInPage.login(process.env.DROPBOX_TEST_USER_ID, process.env.DROPBOX_TEST_USER_PASSWORD);

        await t
            .expect(integrationsPage.linkDropboxButton.exists).notOk()
            .expect(integrationsPage.linkedDropboxHeader.exists).ok()
            .expect(integrationsPage.forgetMeButton.exists).ok();
    });    

test
    .before(async (t) => {
        integrationsPage.login();
        
        await t.expect(slackSignInPage.domain.innerText).eql('icarus-ai');

        slackSignInPage.login(process.env.SLACK_TEST_USER_ID, process.env.SLACK_TEST_USER_PASSWORD);

        await t.expect(slackAuthPage.form.authorizeButton.exists).ok();
        
        slackAuthPage.authorize();

        await t.expect(integrationsPage.forgetMeButton.exists).ok();
    })
    ('Forget Me should unlink the Dropbox account and log the user out from Icarus', async (t) => {
        integrationsPage.forgetMe();

        await t.expect(integrationsPage.loginButton.exists).ok();
    }); 