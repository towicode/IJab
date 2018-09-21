import {
     Widget
} from '@phosphor/widgets';

import {
    ObservableValue
} from '@jupyterlab/observables';


export default
    class EditableField extends Widget {
    constructor(initialName: string = '', placeholder?: string) {
        super();
        this.addClass('jp-GitHubEditableName');
        this._nameNode = document.createElement('div');
        this._nameNode.className = 'jp-GitHubEditableName-display';
        this._editNode = document.createElement('input');
        this._editNode.className = 'jp-GitHubEditableName-input';

        this._placeholder = placeholder || '<Edit Name>';

        this.node.appendChild(this._nameNode);
        this.name = new ObservableValue(initialName);
        this._nameNode.textContent = initialName || this._placeholder;

        this.node.onclick = () => {
            if (this._pending) {
                return;
            }
            this._pending = true;
            Private.changeField(this._nameNode, this._editNode).then(value => {
                this._pending = false;
                if (this.name.get() !== value) {
                    this.name.set(value);
                }
            });
        };

        this.name.changed.connect((s, args) => {
            if (args.oldValue !== args.newValue) {
                this._nameNode.textContent =
                    args.newValue as string || this._placeholder;
            }
        });
    }

    /**
     * The current name of the field.
     */
    readonly name: ObservableValue;
    private _pending = false;
    private _placeholder: string;
    public _nameNode: HTMLElement;
    public _editNode: HTMLInputElement;
}

/**
 * A module-Private namespace.
 */
namespace Private {
    export
        /**
         * Given a text node and an input element, replace the text
         * node wiht the input element, allowing the user to reset the
         * value of the text node.
         *
         * @param text - The node to make editable.
         *
         * @param edit - The input element to replace it with.
         *
         * @returns a Promise that resolves when the editing is complete,
         *   or has been canceled.
         */
        function changeField(text: HTMLElement, edit: HTMLInputElement): Promise<string> {
        // Replace the text node with an the input element.
        let parent = text.parentElement as HTMLElement;
        let initialValue = text.textContent || '';
        edit.value = initialValue;
        parent.replaceChild(edit, text);
        edit.focus();

        // Highlight the input element
        let index = edit.value.lastIndexOf('.');
        if (index === -1) {
            edit.setSelectionRange(0, edit.value.length);
        } else {
            edit.setSelectionRange(0, index);
        }

        return new Promise<string>((resolve, reject) => {
            edit.onblur = () => {
                // Set the text content of the original node, then
                // replace the node.
                parent.replaceChild(text, edit);
                text.textContent = edit.value || initialValue;
                resolve(edit.value);
            };
            edit.onkeydown = (event: KeyboardEvent) => {
                switch (event.keyCode) {
                    case 13:  // Enter
                        event.stopPropagation();
                        event.preventDefault();
                        edit.blur();
                        break;
                    case 27:  // Escape
                        event.stopPropagation();
                        event.preventDefault();
                        edit.value = initialValue;
                        edit.blur();
                        break;
                    default:
                        break;
                }
            };
        });
    }
}