import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import '../style/index.css';

import {
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  IDocumentManager
} from '@jupyterlab/docmanager';

import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';

import {
  IrodsDrive
} from './contents';

import {
  IrodBrowser
} from './browser';

import {
  Clipboard
} from '@jupyterlab/apputils';

import {
  ServerConnection,
} from '@jupyterlab/services';

import {
  URLExt
} from '@jupyterlab/coreutils';

var pjson = require('../package.json');




namespace CommandIDs {
  export const copyIPath = `jupyterlab_irods:copy-i-path`;
}


//import { CopyPath } from './modules/copyPath'

/**
 * Initialization data for the jupyterlab_irods extension.
 */
const fileBrowserPlugin: JupyterLabPlugin<void> = {
  id: 'jupyterlab_irods',
  requires: [IDocumentManager, IFileBrowserFactory, ILayoutRestorer],
  autoStart: true,
  activate: activateFileBrowser
};

function activateFileBrowser(app: JupyterLab,
  manager: IDocumentManager,
  factory: IFileBrowserFactory,
  restorer: ILayoutRestorer): void {
  const { commands } = app;



  let server_con = ServerConnection.makeSettings();
  let setupUrl = URLExt.join(server_con.baseUrl, 'irsetup', "a");

  ServerConnection.makeRequest(setupUrl, {
    method: "GET",
  }, server_con).then(async response => {
    if (response.status !== 200) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }

    return response.json();
  }).then(ocoysfpos => {
    console.log("PYTHON VERSION IS: " + ocoysfpos.status)
    console.log("NPM VERSION IS   : " + pjson.version);
    console.log("!!!THESE TWO NUMBERS SHOULD BE EQUAL!!!")

  });





  commands.addCommand(CommandIDs.copyIPath, {
    execute: () => {
      const item = browser.selectedItems().next();
      if (!item) {
        return;
      }
      console.log("Copied path to clipboard")
      Clipboard.copyToSystem("/" + item.path.substr(6));

    },
    iconClass: 'jp-MaterialIcon jp-FileIcon',
    label: 'Copy iRODS Path'
  });

  // matches only non-directory items in the Google Drive browser.
  const selector =
    '#irod-fb .jp-DirListing-item';


  app.contextMenu.addItem({
    command: CommandIDs.copyIPath,
    selector,
    rank: 0
  });

  console.log("Irods Activated  1");
  
  let msfix = window.localStorage;
  myStorage.setItem("irpassword", "deprecated");

  const drive = new IrodsDrive(app.docRegistry);
  manager.services.contents.addDrive(drive);


  const browser = factory.createFileBrowser("irod-fb", {
    commands,
    driveName: drive.name
  });


  const irodsBrowser = new IrodBrowser(browser, drive);


  irodsBrowser.title.iconClass = 'irods-logo';

  irodsBrowser.id = 'irods-file-browser';

  // Add the file browser widget to the application restorer.
  restorer.add(irodsBrowser, "irod-fb");
  app.shell.addToLeftArea(irodsBrowser, { rank: 102 });



  Promise.all([app.restored])
    .then(([settings]) => {
      browser.model.restored.then(() => {
        irodsBrowser.cdHome();
      });
    }).catch((reason: Error) => {
      console.error(reason.message);
    });



  // Add the right click menu modifier

  // var observer = new MutationObserver(function (mutations) {

  //   if (!irodsBrowser.createMenu){

  //     return;
  //   }

  //   for (let bo of mutations) {

  //     if (bo.addedNodes.length == 0) {
  //       continue;
  //     }

  //     var foundElement: HTMLElement;

  //     for (let i = 0; i < bo.addedNodes.length; i++) {
  //       let no = <HTMLElement>bo.addedNodes.item(i);

  //       if (no.className != "p-Widget p-Menu") {
  //         continue;
  //       }
  //       if (no.childElementCount != 1) {
  //         continue;
  //       }
  //       foundElement = <HTMLElement>no.childNodes.item(0);
  //     }

  //     if (foundElement == undefined) {
  //       continue;
  //     }

  //     let el: HTMLElement = new CopyPath().copyPath;
  //     foundElement.appendChild(el);
  //     irodsBrowser.createMenu = false;
  //   }
  // });

  // observer.observe(document.body, { childList: true });

  return;

}
export default fileBrowserPlugin;
