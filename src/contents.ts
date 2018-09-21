import {
    Signal, ISignal
} from '@phosphor/signaling';

import {
    Contents, ServerConnection,
} from '@jupyterlab/services';

import {
    URLExt
} from '@jupyterlab/coreutils';


import {
    DocumentRegistry
} from '@jupyterlab/docregistry';

/**
* Make a request to the notebook server proxy for the
* Irods API.
*
* @param url - the api path for the Irods 
*   (not including the base url)
*
* @param settings - the settings for the current notebook server.
*
* @returns a Promise resolved with the JSON response.
*/

export class IrodsDrive implements Contents.IDrive {
    private _serverSettings: ServerConnection.ISettings;
    //private _fileTypeForPath: (path: string) => DocumentRegistry.IFileType;

    private _validUser = true;
    private _isDisposed = false;
    // private _serverSettings: ServerConnection.ISettings;
    // private _fileTypeForPath: (path: string) => DocumentRegistry.IFileType;

    constructor(registry: DocumentRegistry) {
        this._serverSettings = ServerConnection.makeSettings();
        this._fileTypeForPath = (path: string) => {
            const types = registry.getFileTypesForPath(path);
            return types.length === 0 ?
                registry.getFileType('text')! :
                types[0];
        };
    }

    /**
     * The name of the drive.
     */
    get name(): 'Irods' {
        return 'Irods';
    }

    /**
   * State for whether the user is valid.
   */
    get validUser(): boolean {
        return this._validUser;
    }

    /**
     * Settings for the notebook server.
     */
    readonly serverSettings: ServerConnection.ISettings;


    /**
     * A signal emitted when a file operation takes place.
     */
    get fileChanged(): ISignal<this, Contents.IChangedArgs> {
        return this._fileChanged;
    }

    /**
     * Test whether the manager has been disposed.
     */
    get isDisposed(): boolean {
        return this._isDisposed;
    }

    /**h
     * Dispose of the resources held by the manager.
     */
    dispose(): void {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        Signal.clearData(this);
    }

    /**
     * Get the base url of the manager.
     */
    get baseURL(): string {
        return 'https://api.github.com';
    }

    get(localPath: string, options?: Contents.IFetchOptions): Promise<Contents.IModel> {

        if (options.type == "file" || options.type == "notebook") {
            return this.IrodsRequest<Contents.IModel>(localPath, "GET", null, true).then(contents => {
                if (contents.mimetype == "too_large") {
                    alert("File size too large, JupyterLab Irods only supports 100mb");
                    return null;
                } else if (contents.mimetype == "error") {
                    alert("There was an error with the application. Please reload the page before continuing");
                    return null;
                }
                return contentsToJupyterContents(localPath, contents, this._fileTypeForPath);
            });
        }

        return this.IrodsRequest<Contents.IModel>(localPath, "GET", null).then(contents => {
            return contentsToJupyterContents(localPath, contents, this._fileTypeForPath);
        });
    }

    getDownloadUrl(localPath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            setTimeout(function () {
                resolve("/irdownload/" + localPath);
            }, 1);
        });
    }

    newUntitled(options?: Contents.ICreateOptions): Promise<Contents.IModel> {

        let extension = ''
        let path = options.path || '';
        let contentType = options.type || 'notebook';

        if (contentType === 'notebook') {
            path = path + "/untitled" + (Math.ceil(Date.now() / 1000));
            extension = ".ipynb"
            path = path + extension
        } else if (contentType === 'file') {
            path = path + "/untitled" + (Math.ceil(Date.now() / 1000));
        } else if (contentType === 'directory') {
            path = path + "/newfolder" + (Math.ceil(Date.now() / 1000));
        }

        return this.IrodsRequest<Contents.IModel>(path, 'POST', contentType, true).then(contents => {
            let returnable = {
                path: contents.path,
                type: contents.type,
                name: contents.name,
                writable: contents.writable,
                created: contents.created,
                last_modified: contents.last_modified,
                mimetype: contents.mimetype,
                content: contents.content,
                format: contents.format,
            }

            if (contentType == 'notebook') {
                returnable.type = 'notebook';
            }
            return returnable;
        });
    }
    delete(localPath: string): Promise<void> {
        return this.IrodsRequest<Contents.IModel>(localPath, 'DELETE', localPath, true).then(contents => {
            return null;
        });
    }
    rename(oldLocalPath: string, newLocalPath: string): Promise<Contents.IModel> {
        var rename = {
            mv: true,
            path: newLocalPath
        }
        return this.IrodsRequest<Contents.IModel>(oldLocalPath, 'PATCH', rename, true).then(contents => {
            return contents;
        });
    }
    save(localPath: string, options?: Partial<Contents.IModel>): Promise<Contents.IModel> {

        return this.IrodsRequest<Contents.IModel>(localPath, 'PUT', options, true).then(contents => {
            return contents;
        });
    }
    copy(localPath: string, toLocalDir: string): Promise<Contents.IModel> {

        //  As of 5/23/2018 JupyterLab does not support copying folders
        //  If this changes this function will have to redone to be a bit smarter.

        var filename = localPath.replace(/^.*[\\\/]/, '')
        var full_path = toLocalDir + "/" + filename;

        if (full_path == localPath) {

            var name_wo = filename.substring(0, filename.lastIndexOf('.'));
            var ext = filename.split('.').pop();

            full_path = toLocalDir + "/" + name_wo + (Math.ceil(Date.now() / 1000)) + ext;
        }

        var copy = {
            mv: false,
            path: full_path
        }


        return this.IrodsRequest<Contents.IModel>(localPath, 'PATCH', copy, true).then(contents => {
            return contents;
        });
    }
    createCheckpoint(localPath: string): Promise<Contents.ICheckpointModel> {
        return Promise.reject('Irods is CURRENTLY read only1');
    }
    listCheckpoints(localPath: string): Promise<Contents.ICheckpointModel[]> {
        return Promise.resolve([]);
    }
    restoreCheckpoint(localPath: string, checkpointID: string): Promise<void> {
        return Promise.reject('Irods is CURRENTLY read only2');
    }
    deleteCheckpoint(localPath: string, checkpointID: string): Promise<void> {
        return Promise.reject('Irods is CURRENTLY read only3');
    }

    private IrodsRequest<T>(url: string, type: string, content: any, loading?: boolean): Promise<T> {
        const fullURL = URLExt.join(this._serverSettings.baseUrl, 'irods', url);

        let init = {};

        if (content != null) {
            init = {
                method: type,
                body: JSON.stringify(
                    content,
                ),
            };
        }
        if (loading) {
            var jpshells = document.getElementsByClassName("jp-ApplicationShell") as HTMLCollectionOf<HTMLElement>;

            if (jpshells.length > 0) {

                var jpshell = jpshells[0];

                jpshell.style.filter = "grayscale(100%)"
                jpshell.style.pointerEvents = "none"
            }
        }

        var spinners = document.getElementsByClassName("spinner") as HTMLCollectionOf<HTMLElement>;
        if (spinners.length > 0) {
            var spinner = spinners[0];
            spinner.style.display = "block";
        }

        let my_promise = ServerConnection.makeRequest(fullURL, init, this._serverSettings).then(response => {
            if (response.status !== 200) {
                return response.json().then(data => {
                    throw new ServerConnection.ResponseError(response, data.message);
                });
            }
            if (loading) {
                var jpshells = document.getElementsByClassName("jp-ApplicationShell") as HTMLCollectionOf<HTMLElement>;
                if (jpshells.length > 0) {
                    var jpshell = jpshells[0];
                    jpshell.style.filter = "grayscale(0%)"
                    jpshell.style.pointerEvents = "inherit"
                }
            }

            var spinners = document.getElementsByClassName("spinner") as HTMLCollectionOf<HTMLElement>;
            if (spinners.length > 0) {
                var spinner = spinners[0];
                spinner.style.display = "none";
            }
            return response.json();
        }).catch(rejection => {

            var jpshells = document.getElementsByClassName("jp-ApplicationShell") as HTMLCollectionOf<HTMLElement>;
            if (jpshells.length > 0) {
                var jpshell = jpshells[0];
                jpshell.style.filter = "grayscale(0%)"
                jpshell.style.pointerEvents = "inherit"
            }

            var spinners = document.getElementsByClassName("spinner") as HTMLCollectionOf<HTMLElement>;
            if (spinners.length > 0) {
                var spinner = spinners[0];
                spinner.style.display = "none";
            }

        });
        return my_promise;
    }

    private _fileChanged = new Signal<this, Contents.IChangedArgs>(this);
    private _fileTypeForPath: (path: string) => DocumentRegistry.IFileType;
}


//todo?
export
    function contentsToJupyterContents(path: string, contents: any, fileTypeForPath: (path: string) => DocumentRegistry.IFileType): Contents.IModel {
    return contents
}


