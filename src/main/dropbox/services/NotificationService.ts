import { dropboxAccountId } from "../Api";
import { DropboxClient } from "../clients/DropboxClient";
import { CursorRepository } from "../repositories/CursorRepository";
import { FileChangeRepository } from "../repositories/FileChangeRepository";
import { IdentityRepository } from "../../identity/repositories/IdentityRepository"

export interface ListFolder {
  accounts: Array<string>
}

export interface Delta {
  users: Array<number>
}

export interface Notification {
  list_folder: ListFolder,
  delta: Delta
}

export class NotificationService {

  constructor(private readonly fileUpdateRecorder: FileUpdateRecorder) {}

  async processNotification(notification: Notification): Promise<void> {
    console.log("Recording file updates for accounts: " + notification.list_folder.accounts);
    await Promise.all(notification.list_folder.accounts.map(account => this.fileUpdateRecorder.recordUpdates(account)));
  }
}

export class FileUpdateRecorder {

  constructor(
    private readonly identityRepository: IdentityRepository,
    private readonly cursorRepository: CursorRepository,
    private readonly dropbox: DropboxClient,
    private readonly fileChangeRepository: FileChangeRepository
  ) {}

  
  private async lookupDropboxToken(accountId: dropboxAccountId): Promise<string|null> {
    return this.identityRepository.getDropboxIdentityByDropboxId(accountId)
      .then( dropboxIdentity => dropboxIdentity.accessToken )
      .catch(err => {
        console.error(err)
        return null
      } )
  }

   async recordUpdates(accountId: dropboxAccountId): Promise<void> {
    console.log(`Fetching updates for account ${accountId}`);
    const [token, cursor] = await Promise.all([
      this.lookupDropboxToken(accountId),
      this.cursorRepository.fetchCursor(accountId)
    ]);

    if (!token) {
      console.log(`No token for account ${accountId}`);
      return; // bomb out early
    }

    const {files, newCursor} = await this.dropbox.fetchFiles(accountId, token, cursor);
    const promises: Promise<any>[] = [];
    if (newCursor) {
      promises.push(this.cursorRepository.saveCursor(accountId, newCursor));
    }

    const fileList = files.filter(entry => entry.client_modified).map(entry => ({
      modifiedAt: entry.server_modified,
      modifiedBy: entry["sharing_info"] && entry["sharing_info"]["modified_by"] || accountId,
      tag: entry[".tag"]
    }));

    if (fileList.length > 0) {
      promises.push(this.fileChangeRepository.saveFileChanges(accountId, fileList));
    }

    await Promise.all(promises);
    console.log("Done");
  }
}
