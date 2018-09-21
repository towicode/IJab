import {
    ServerConnection,
} from '@jupyterlab/services';

import {
   URLExt
} from '@jupyterlab/coreutils';

import {
    FileBrowser
} from '@jupyterlab/filebrowser';

import EditableField from './editableField';

export 
class ConnectButton {

    public submit: HTMLElement;

    constructor(private host: EditableField,
                private zone: EditableField,
                private port: EditableField,
                private password: EditableField,
                private user: EditableField,
                _browser: FileBrowser){
        this.submit = document.createElement('button'); 
        let submit = this.submit;
        submit.setAttribute('style', "width:100%");
        submit.innerHTML = "Submit";
        submit.onclick = () => {
            let server_con = ServerConnection.makeSettings();
            let setupUrl = URLExt.join(server_con.baseUrl, 'irsetup', "a");

            let my_promise = ServerConnection.makeRequest(setupUrl, {
                method: "POST",
                body: JSON.stringify({
                    host: String(this.host._nameNode.textContent),
                    zone: String(this.zone._nameNode.textContent),
                    port: String(this.port._nameNode.textContent),
                    password: String(this.password._nameNode.textContent),
                    user: String(this.user._nameNode.textContent),
                })
            }, server_con).then(response => {
                if (response.status !== 200) {
                    return response.json().then(data => {
                        throw new ServerConnection.ResponseError(response, data.message);
                    });
                }
    
                var spinners = document.getElementsByClassName("spinner") as HTMLCollectionOf<HTMLElement>;
                _browser.model.cd("/iplant/home/" + this.user._nameNode.textContent);
                _browser.model.refresh();
                
                if (spinners.length > 0) {
                    var spinner = spinners[0];
                    spinner.style.display = "none";
                }
                return response.json();
            });
            return my_promise;
    
        }
    }
}