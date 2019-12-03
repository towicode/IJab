import {
  JupyterFrontEnd, JupyterFrontEndPlugin
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

import {
  IMainMenu
} from '@jupyterlab/mainmenu';


var pjson = require('../package.json');




namespace CommandIDs {
  export const copyIPath = `jupyterlab_irods:copy-i-path`;
  export const IConnect = 'jupyterlab_irods:i-connect';
}


//import { CopyPath } from './modules/copyPath'

/**
 * Initialization data for the jupyterlab_irods extension.
 */
const fileBrowserPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_irods',
  requires: [IDocumentManager, IFileBrowserFactory, ILayoutRestorer, IMainMenu],
  autoStart: true,
  activate: activateFileBrowser
};

function activateFileBrowser(app: JupyterFrontEnd,
  manager: IDocumentManager,
  factory: IFileBrowserFactory,
  restorer: ILayoutRestorer,
  mainMenu: IMainMenu): void {
  const { commands } = app;


  var myBrowser: IrodBrowser = null;



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


  commands.addCommand(CommandIDs.IConnect, {
    execute: () => {

      let server_con = ServerConnection.makeSettings();
      let setupUrl = URLExt.join(server_con.baseUrl, 'iricsetup', "a");

      ServerConnection.makeRequest(setupUrl, {
          method: "POST",
          body: JSON.stringify({
              okay: "200"
          })
      }, server_con).then(response => {
          if (response.status !== 200) {
              return response.json().then(data => {
                  throw new ServerConnection.ResponseError(response, data.message);
              });
          }
          return response.json();
      }).then(ocoysfpos => {
          let myStorage = window.localStorage;
          myStorage.setItem("iruser", String(ocoysfpos.username));
          myStorage.setItem("irzone", String(ocoysfpos.zone));

          // cd home
          if (myBrowser != null){
            myBrowser.cdHome();
          }

          //  if we connect we want to click the label so  we don't have that popup menu
          //  still active
          let area = document.getElementsByClassName("collapsible-1-area");
          if (area.length <= 0){
            return
          }

          let myArea = area[0];

          if (window.getComputedStyle(myArea).height != "0px"){

            let label = document.getElementById("collapseLabel1")

            if (label == null){
              return
            }
  
            label.click()

          }


      });    

    },
    iconClass: 'jp-MaterialIcon jp-FileIcon',
    label: 'Connect using ICommands'
  });

  mainMenu.fileMenu.addGroup([
    {
      command: CommandIDs.IConnect,
    },
  ], 40 /* rank */);

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
  msfix.setItem("irpassword", "deprecated");

  const drive = new IrodsDrive(app.docRegistry);
  manager.services.contents.addDrive(drive);


  const browser = factory.createFileBrowser("irod-fb", {
    //commands,
    driveName: drive.name
  });


  const irodsBrowser = new IrodBrowser(browser, drive);

  myBrowser = irodsBrowser;


  irodsBrowser.title.iconClass = 'irods-logo';

  irodsBrowser.id = 'irods-file-browser';

  // Add the file browser widget to the application restorer.
  restorer.add(irodsBrowser, "irod-fb");
  app.shell.add(irodsBrowser, 'left', { rank: 102 });
  //app.shell.addToLeftArea(irodsBrowser, { rank: 102 });



  Promise.all([app.restored])
    .then(([settings]) => {
      browser.model.restored.then(() => {
        //irodsBrowser.cdHome();
      });
    }).catch((reason: Error) => {
      console.error(reason.message);
    });

  return;

}
export default fileBrowserPlugin;
