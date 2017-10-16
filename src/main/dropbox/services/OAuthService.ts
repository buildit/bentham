import { IdentityService } from "../../common/services/IdentityService";
import { DropboxClient } from "../clients/DropboxClient";
import { TokenRepository } from "../repositories/TokenRepository";
import { CursorRepository } from "../repositories/CursorRepository";
import { icarusAccessToken, host, uri, lambdaStage, IcarusUserToken } from "../../common/Api";
import { dropboxAuthorisationCode, dropboxAccountId, dropboxAccessToken, cursor } from "../Api";

export class OAuthService {

  constructor(
    private readonly identity: IdentityService,
    private readonly dropbox: DropboxClient,
    private readonly tokenRepository: TokenRepository,
    private readonly cursorRepository: CursorRepository) {}

  getOAuthAuthoriseUri( icarusAccessToken: icarusAccessToken, returnUri:uri): uri {
    return this.dropbox.getOAuthAuthoriseUri(icarusAccessToken, returnUri);
  }

  /**
  This has quite a lot of work to do:
  - it uses the supplied Dropbox access code to obtain an Dropbox API token.
  - it stores the Dropbox API token in the token repository, so it can be used
    when processing future notifications via the Dropbox webhook.
  - it obtains and stores an initial cursor for the account, so that files that
    existed before registration are not scanned for their update timestamps.
  - it associates the Dropbox account id and access token with the Icarus account.
   */
  async processCode(icarusAccessToken: icarusAccessToken, dropboxAuthorisationCode: dropboxAuthorisationCode, accessCodeRequestRedirectUri:uri): Promise<IcarusUserToken> {
    // Redirect uri is passed for verification only
    const dropboxAccessDetails = await this.dropbox.requestAccessDetails(dropboxAuthorisationCode, accessCodeRequestRedirectUri);

    return Promise.all([
      this.tokenRepository.saveToken(dropboxAccessDetails.accountId, dropboxAccessDetails.accessToken),
      this.storeInitialCursor(dropboxAccessDetails.accountId, dropboxAccessDetails.accessToken),
      this.identity.addIdentity(icarusAccessToken, 'dropbox', {
        id: dropboxAccessDetails.accountId,
        accessToken: dropboxAccessDetails.accessToken
      })
    ]).then(res => res[2]); // Returning only the IcarusUserToken from IdentityService.addIdentity
  };

  private async storeInitialCursor(accountId: dropboxAccountId, accessToken: dropboxAccessToken): Promise<cursor> {
    const cursor = await this.dropbox.getLatestCursor(accountId, accessToken);
    await this.cursorRepository.saveCursor(accountId, cursor);
    return cursor;
  }

}
