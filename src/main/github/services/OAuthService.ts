
import { IdentityService } from "../../common/services/IdentityService";
import { GithubClient } from "../clients/GithubClient";
import { TokenRepository } from "../repositories/TokenRepository";
import { icarusAccessToken, host, uri, lambdaStage, IcarusUserToken } from "../../common/Api";
import { githubAuthorisationCode, githubUsername, githubAccessToken } from "../Api";

export class OAuthService {
  constructor(
    private readonly identity: IdentityService,
    private readonly github: GithubClient,
    private readonly tokenRepository: TokenRepository) {}

  getOAuthAuthoriseUri(icarusAccessToken:icarusAccessToken, returnUri:uri): uri {
    return this.github.getOAuthAuthoriseUri(icarusAccessToken, returnUri);
  }

  /*
  Processes the GitHub OAuth Access Code:
  - exchanges the Access Code for the Acccess Token
  - retrieves the GitHub Username corresponding to the Access Token
  - stores the Github Access Token along with the Username
  - associates the Github Access Token and Username with the Icarus account
  */
  async processCode(icarusAccessToken: icarusAccessToken, githubAuthorisationCode: githubAuthorisationCode, redirectUri: uri): Promise<IcarusUserToken> {
    const accessToken = await this.github.requestAccessToken(githubAuthorisationCode, redirectUri);

    const username = await this.github.getUsername(accessToken);

    return Promise.all([
      this.tokenRepository.saveToken(username, accessToken),
      this.identity.addIdentity(icarusAccessToken, 'github', {
        id: username,
        accessToken: accessToken
      })
    ]).then(res => res[1]); // Returning the IcarusUserToken from IdentityService.addIdentity
  }
}
