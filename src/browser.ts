
import {
    PanelLayout, Widget
} from '@phosphor/widgets';

import {
    FileBrowser
} from '@jupyterlab/filebrowser';

import { IrodsDrive } from './contents';
//import { IrodsSpinner } from './modules/irodsSpinner';
import MaterialField from './modules/materialField';
import { ConnectButton } from './modules/connectButton';
import { ConnectICButton } from './modules/connectICButon';
import { LoadBar } from './modules/loadbar'

import 'muicss/react';
export
    class IrodBrowser extends Widget {

    public createMenu: Boolean;
    public static loadbar: LoadBar;

    


    constructor(browser: FileBrowser, drive: IrodsDrive) {
        super();
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



        // let myStorage = window.localStorage;

        var top_collapse = document.createElement("div");
        top_collapse.setAttribute('style', "width:100%");

        top_collapse.classList.add("collapsible-wrap", "no-pad", "xui")
        var input_collapse = document.createElement("input");
        input_collapse.type = "checkbox";
        input_collapse.id = "collapsible-1";
        input_collapse.setAttribute("checked", "true");
        top_collapse.appendChild(input_collapse);
        var label_collapse:HTMLLabelElement = document.createElement("label");
        label_collapse.htmlFor ="collapsible-1";
        label_collapse.innerText="IRODS Setup Config";
        top_collapse.appendChild(label_collapse);
        var body_collapse = document.createElement("div");
        body_collapse.classList.add("collapsible-1-area");
        top_collapse.appendChild(body_collapse);


        var irods_toolbar = document.createElement('div'); 


        // Create an editable name for the user/org name.
        this.host = new MaterialField('Host / IP', localStorage.getItem("irhost") === null ? 'data.cyverse.org' : localStorage.getItem("irhost"));
        irods_toolbar.appendChild(this.host.node);


        this.port = new MaterialField('Port', localStorage.getItem("irport") === null ? '1247' : localStorage.getItem("irport"));
        irods_toolbar.appendChild(this.port.node);


        this.user = new MaterialField('User', localStorage.getItem("iruser") === null ? '' : localStorage.getItem("iruser"));
        irods_toolbar.appendChild(this.user.node);
 

        this.zone = new MaterialField('Zone', localStorage.getItem("irzone") === null ? 'iplant' : localStorage.getItem("irzone"));
        irods_toolbar.appendChild(this.zone.node);


        this.password = new MaterialField('Password', localStorage.getItem("irpassword") === null ? '' : localStorage.getItem("irpassword"));
        irods_toolbar.appendChild(this.password.node);
        this.password.inputNode.type = "password";


        let submit = new ConnectButton(this.host, this.zone, this.port, this.password, this.user, this).submit;
        
        var value = this._browser.toolbar.node.getAttribute('style');
        value += ';flex-wrap: wrap;';
        this._browser.toolbar.node.setAttribute('style', value);
        body_collapse.appendChild(irods_toolbar);
        irods_toolbar.setAttribute('style', "width:100%");

        var ortext = document.createElement("hr");
        ortext.align = "left"
        ortext.setAttribute('style', "max-width: 200px");

 

        let IC_button = new ConnectICButton(this).icommands;    

        body_collapse.appendChild(submit);
        body_collapse.appendChild(ortext);
        body_collapse.appendChild(IC_button);
        this._browser.toolbar.node.appendChild(top_collapse);

        IrodBrowser.loadbar = new LoadBar();
        this._browser.toolbar.node.appendChild(IrodBrowser.loadbar.loadBar);

        var mm : HTMLSpanElement = this._browser.node.querySelector("span.jp-HomeIcon")
        mm.setAttribute('style', "display:none");


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
        console.log('/iplant/home/' + String(localStorage.getItem("iruser") === null ? '' : localStorage.getItem("iruser")));
        this._browser.model.cd('/iplant/home/' + String(localStorage.getItem("iruser") === null ? '' : localStorage.getItem("iruser")));
    }

    readonly host: MaterialField;
    readonly port: MaterialField;
    readonly user: MaterialField;
    readonly zone: MaterialField;
    readonly password: MaterialField;
    //private _irodsSpinner: IrodsSpinner;
    private _browser: FileBrowser;


}

