
import {
    PanelLayout, Widget
} from '@phosphor/widgets';

import {
    FileBrowser
} from '@jupyterlab/filebrowser';

import { IrodsDrive } from './contents';
//import { IrodsSpinner } from './modules/irodsSpinner';
import EditableField from './modules/editableField'
import { ConnectButton } from './modules/connectButton'

export
    class IrodBrowser extends Widget {

    public createMenu: Boolean;


    constructor(browser: FileBrowser, drive: IrodsDrive) {
        super();
        this.addClass('jp-IrodBrowser');
        this.layout = new PanelLayout();
        (this.layout as PanelLayout).addWidget(browser);
        this._browser = browser;
        this.createMenu = false;

        // Add right click event so we can tell index.ts to add the copy-path command
        this._browser.node.onmousedown = (ev: MouseEvent) => {
            if (ev.which == 3){
                this.createMenu = true;
            }
        }

        let myStorage = window.localStorage;


        var irods_toolbar = document.createElement('div'); 

        // Create an editable name for the user/org name.
        this.host = new EditableField('', localStorage.getItem("irhost") === null ? '<edit host>' : localStorage.getItem("irhost"));
        this.host.addClass('jp-editable');
        this.host.node.title = 'Click to edit host';
        irods_toolbar.appendChild(this.host.node);
        //this._browser.toolbar.addItem('host', this.host);
        this.host.name.changed.connect(() => {
            myStorage.setItem("irhost", String(this.host.name.get()));
        }, this);

        this.port = new EditableField('', localStorage.getItem("irport") === null ? '<edit port>' : localStorage.getItem("irport"));
        this.port.addClass('jp-editable');
        this.port.node.title = 'Click to edit port';
        irods_toolbar.appendChild(this.port.node);
        this.port.name.changed.connect(() => {
            myStorage.setItem("irport", String(this.port.name.get()));
        }, this);

        this.user = new EditableField('', localStorage.getItem("iruser") === null ? '<edit user>' : localStorage.getItem("iruser"));
        this.user.addClass('jp-editable');
        this.user.node.title = 'Click to edit user';
        irods_toolbar.appendChild(this.user.node);
        this.user.name.changed.connect(() => {
            myStorage.setItem("iruser", String(this.user.name.get()));
        }, this);

        this.zone = new EditableField('', localStorage.getItem("irzone") === null ? '<edit zone>' : localStorage.getItem("irzone"));
        this.zone.addClass('jp-editable');
        this.zone.node.title = 'Click to edit zone';
        irods_toolbar.appendChild(this.zone.node);
        this.zone.name.changed.connect(() => {
            myStorage.setItem("irzone", String(this.zone.name.get()));
        }, this);

        this.password = new EditableField('', localStorage.getItem("irpassword") === null ? '<edit password>' : localStorage.getItem("irpassword"));
        this.password.addClass('jp-editable');
        this.password.node.title = 'Click to edit password';
        irods_toolbar.appendChild(this.password.node);
        //this._browser.toolbar.addClass("display_block");
        this.password.name.changed.connect(() => {
            myStorage.setItem("irpassword", String(this.password.name.get()));
        }, this);

        //this._browser.selectedItems

        this.password._editNode.type = "password";
        // this.password._nameNode.style.filter = "Blur(4px)";
        var value = this.password._nameNode.getAttribute('style');
        value += ';-webkit-text-security: disc;';
        this.password._nameNode.setAttribute('style', value);


        let submit = new ConnectButton(this.host, this.zone, this.port, this.password, this.user, this._browser).submit;
        
        var value = this._browser.toolbar.node.getAttribute('style');
        value += ';flex-wrap: wrap;';
        this._browser.toolbar.node.setAttribute('style', value);
        this._browser.toolbar.node.appendChild(irods_toolbar);

        this._browser.toolbar.node.appendChild(submit);

        //  weird bug with resizing this code allows it to scroll
        let resizeScrollWindow = () => {
            let height = window.innerHeight - 300;
            let irodsBrowser = this._browser.node;
            if (irodsBrowser == null) return;
            let contentSelected = irodsBrowser.getElementsByClassName("jp-DirListing-content");
            if (contentSelected.length == 0) return;
            let selected = <HTMLElement>contentSelected.item(0);
            selected.style.height = "" + height + "px"
        }
        this._browser.node.onclick = resizeScrollWindow;
        window.addEventListener('resize', () => {
            resizeScrollWindow();
        });
    }

    cdHome(): any {
        this._browser.model.cd('/iplant/home/' + this.user._nameNode.textContent);
    }

    readonly host: EditableField;
    readonly port: EditableField;
    readonly user: EditableField;
    readonly zone: EditableField;
    readonly password: EditableField;
    //private _irodsSpinner: IrodsSpinner;
    private _browser: FileBrowser;


}
