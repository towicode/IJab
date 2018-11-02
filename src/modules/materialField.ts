import {
    Widget
} from '@phosphor/widgets';

import {
   ObservableValue
} from '@jupyterlab/observables';


export default
   class MaterialField extends Widget {
   constructor( placeholder?: string, initialName: string = '',) {
       super();
       this.addClass('mui-textfield');
       this.inputNode = document.createElement('input');
       this.inputNode.type = 'text';
       this.inputNode.required=true;
       this.inputNode.placeholder=placeholder;
       this.inputNode.value = initialName;

       this.node.appendChild(this.inputNode);


   }

   /**
    * The current name of the field.
    */
   readonly name: ObservableValue;
   public inputNode: HTMLInputElement;
}
