//  Connect button for icommands setup

import {
    ServerConnection,
} from '@jupyterlab/services';

import {
   URLExt
} from '@jupyterlab/coreutils';

import { IrodBrowser } from '../browser'

export 
class ConnectICButton {

    public icommands: HTMLElement;

    constructor(_browser: IrodBrowser){
        this.icommands = document.createElement('button'); 
        this.icommands.classList.add('btn--raised', 'top-10');
        this.icommands.classList.add('.btn--secondary');
        this.icommands.setAttribute('style', "width:100%");
        this.icommands.innerText = "ICommands Connect";
        
        this.icommands.onclick = () => {
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
                _browser.cdHome();
            });    
        }
    }
}