import { Selector, t } from 'testcafe';

export class SlackAuthPage {
    constructor() {
        this.form = {
            cancelButton: Selector('#oauth_deny'),
            authorizeButton: Selector('#oauth_authorizify'),
        };
    }

    async authorize () {
        await t
            .takeScreenshot()
            .click(this.form.authorizeButton);
    }

    async cancel () {
        await t.click(this.form.cancelButton);
    }
}
