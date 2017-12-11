import { Selector, t } from 'testcafe';

export class SlackSignInPage {
    constructor() {
        this.domain = Selector('#signin_header span');
        this.form = {
            emailInput: Selector('#email'),
            passwordInput: Selector('#password'),
            signInButton: Selector('#signin_btn'),
        };
    }

    async login (email, password) {
        await t
            .typeText(this.form.emailInput, email)
            .typeText(this.form.passwordInput, password)
            .takeScreenshot()
            .click(this.form.signInButton)
            .takeScreenshot();
    }
}
