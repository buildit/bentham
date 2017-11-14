import { Selector, t } from 'testcafe';

export class IntegrationsPage {
    constructor() {
        this.loginButton = Selector('button')
            .withText('Login / Sign in with Slack');
        this.linkDropboxButton = Selector('button')
            .withText('Link Dropbox account');
        this.linkedDropboxHeader = Selector('.panel-success > .panel-heading')
            .withText('Icarus is monitoring your Dropbox activity');    
        this.linkGitHubButton = Selector('button')
            .withText('Link Github account');
        this.linkedGitHubHeader = Selector('.panel-success > .panel-heading')
            .withText('Icarus is monitoring your Github activity');
        this.forgetMeButton = Selector('button')
            .withText('Forget Me');
        this.logoutButton = Selector('button')
            .withText('Logout');
    }

    async login () {
        await t.click(this.loginButton);
    }

    async logout () {
        await t.click(this.logoutButton);
    }

    async linkGitHub () {
        await t.click(this.linkGitHubButton);
    }

    async linkDropbox () {
        await t.click(this.linkDropboxButton);
    }

    async forgetMe() {
        await t.click(this.forgetMeButton);
    }
}
