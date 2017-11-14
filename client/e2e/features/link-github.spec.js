import { testEnvironmentUrl } from '../config/config';
import {
    GitHubAuthPage,
    GitHubSignInPage,
    IntegrationsPage,
    SlackAuthPage,
    SlackSignInPage,
} from '../pages';
import {
    getBaseUrl,
    getQueryString,
} from '../utils/helpers';

const githubAuthPage = new GitHubAuthPage();
const githubSignInPage = new GitHubSignInPage();
const integrationsPage = new IntegrationsPage();
const slackAuthPage = new SlackAuthPage();
const slackSignInPage = new SlackSignInPage();

fixture `GitHub`
    .page(testEnvironmentUrl);

test
    .before(async (t) => {
        integrationsPage.login();
        
        await t.expect(slackSignInPage.domain.innerText).eql('icarus-ai');

        slackSignInPage.login(process.env.SLACK_TEST_USER_ID, process.env.SLACK_TEST_USER_PASSWORD);

        await t.expect(slackAuthPage.form.authorizeButton.exists).ok();
        
        slackAuthPage.authorize();

        await t.expect(integrationsPage.linkGitHubButton.exists).ok();
    })
    ('Linking GitHub account should navigate to the GitHub Sign In page if the given user is not logged into GitHub', async (t) => {        
        integrationsPage.linkGitHub();

        await t.expect(githubSignInPage.form.header.innerText).eql(`Sign in to GitHub \nto continue to icarus-${process.env.ICARUS_STAGE}`);

        const baseUrl = await getBaseUrl();
        const returnTo = await getQueryString('return_to');
        const redirectUri = await getQueryString('redirect_uri', decodeURIComponent(returnTo));
    
        await t
            .expect(baseUrl).eql('https://github.com/login')
            .expect(decodeURIComponent(redirectUri)).eql(`${testEnvironmentUrl}/github-post-login`);
    });

test
    .skip
    .before(async (t) => {
        integrationsPage.login();
        
        await t.expect(slackSignInPage.domain.innerText).eql('icarus-ai');

        slackSignInPage.login(process.env.SLACK_TEST_USER_ID, process.env.SLACK_TEST_USER_PASSWORD);

        await t.expect(slackAuthPage.form.authorizeButton.exists).ok();
        
        slackAuthPage.authorize();

        await t.expect(integrationsPage.linkGitHubButton.exists).ok();

        integrationsPage.linkGitHub();
        
        await t.expect(githubSignInPage.form.signInButton.exists).ok();
    })
    ('Linking GitHub account should navigate to the GitHub auth page when signed in with GitHub but Icarus has no permissions', async (t) => {
        githubSignInPage.login(process.env.GITHUB_TEST_USER_ID, process.env.GITHUB_TEST_USER_PASSWORD);

        await t.expect(githubAuthPage.header.innerText).eql(`Authorize icarus-${process.env.ICARUS_STAGE}`);

        const redirectUri = await getQueryString('redirect_uri');

        await t.expect(decodeURIComponent(redirectUri)).eql(`${testEnvironmentUrl}/github-post-login`);
    });

test
    .skip
    .before(async (t) => {
        integrationsPage.login();
        
        await t.expect(slackSignInPage.domain.innerText).eql('icarus-ai');

        slackSignInPage.login(process.env.SLACK_TEST_USER_ID, process.env.SLACK_TEST_USER_PASSWORD);

        await t.expect(slackAuthPage.form.authorizeButton.exists).ok();
        
        slackAuthPage.authorize();

        await t.expect(integrationsPage.linkGitHubButton.exists).ok();

        integrationsPage.linkGitHub();
        
        await t.expect(githubSignInPage.form.signInButton.exists).ok();

        githubSignInPage.login(process.env.GITHUB_TEST_USER_ID, process.env.GITHUB_TEST_USER_PASSWORD);
            
        await t
            .expect(githubAuthPage.form.authorizeButton.exists).ok()
            .expect(githubAuthPage.form.authorizeButton.hasAttribute('disabled')).notOk();
    })
    ('When authorizing Icarus through GitHub then it should link the accounts', async (t) => {
        githubAuthPage.authorize();

        await t
            .expect(integrationsPage.linkGitHubButton.exists).notOk()
            .expect(integrationsPage.linkedGitHubHeader.exists).ok();
    });    

test
    .before(async (t) => {
        integrationsPage.login();
        
        await t.expect(slackSignInPage.domain.innerText).eql('icarus-ai');

        slackSignInPage.login(process.env.SLACK_TEST_USER_ID, process.env.SLACK_TEST_USER_PASSWORD);

        await t.expect(slackAuthPage.form.authorizeButton.exists).ok();
        
        slackAuthPage.authorize();

        await t.expect(integrationsPage.linkGitHubButton.exists).ok();
    })
    ('Linking GitHub account should link the accounts when Icarus is authorized through GitHub', async (t) => {
        integrationsPage.linkGitHub();

        await t.expect(githubSignInPage.form.signInButton.exists).ok();

        githubSignInPage.login(process.env.GITHUB_TEST_USER_ID, process.env.GITHUB_TEST_USER_PASSWORD);

        await t
            .expect(integrationsPage.linkGitHubButton.exists).notOk()
            .expect(integrationsPage.linkedGitHubHeader.exists).ok();
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
    ('Forget Me should unlink the GitHub account and log the user out from Icarus', async (t) => {
        integrationsPage.forgetMe();

        await t.expect(integrationsPage.loginButton.exists).ok();

        githubSignInPage.login(process.env.GITHUB_TEST_USER_ID, process.env.GITHUB_TEST_USER_PASSWORD);
    }); 
