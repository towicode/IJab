import {
    ServerConnection,
} from '@jupyterlab/services';

import {
   URLExt
} from '@jupyterlab/coreutils';

import { IrodBrowser } from '../browser'

import MaterialField from './materialField';

export 
class ConnectButton {

    public submit: HTMLElement;

    constructor(private host: MaterialField,
                private zone: MaterialField,
                private port: MaterialField,
                private password: MaterialField,
                private user: MaterialField,
                _browser: IrodBrowser){
        this.submit = document.createElement('button'); 
        this.submit.classList.add('btn--raised');
        this.submit.classList.add('btn--primary');
        let submit = this.submit;
        submit.setAttribute('style', "width:100%");
        submit.innerHTML = "Submit";
        submit.onclick = () => {
            let server_con = ServerConnection.makeSettings();
            let setupUrl = URLExt.join(server_con.baseUrl, 'irsetup', "a");

            let myStorage = window.localStorage;
            myStorage.setItem("irhost", String(this.host.inputNode.value));
            myStorage.setItem("irzone", String(this.zone.inputNode.value));
            myStorage.setItem("irport", String(this.port.inputNode.value));
            myStorage.setItem("irpassword", String(this.password.inputNode.value));
            myStorage.setItem("iruser", String(this.user.inputNode.value));

            let my_promise = ServerConnection.makeRequest(setupUrl, {
                method: "POST",
                body: JSON.stringify({
                    host: String(this.host.inputNode.value),
                    zone: String(this.zone.inputNode.value),
                    port: String(this.port.inputNode.value),
                    password: String(this.password.inputNode.value),
                    user: String(this.user.inputNode.value),
                })
            }, server_con).then(response => {
                if (response.status !== 200) {
                    return response.json().then(data => {
                        throw new ServerConnection.ResponseError(response, data.message);
                    });
                }
                _browser.cdHome();
                //return response.json();
            });
            
            return my_promise;
    
        }
    }
}