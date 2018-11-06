

export
class LoadBar { 

    public loadBar: HTMLElement;


    constructor(){
        this.loadBar = document.createElement('div');
        this.loadBar.setAttribute("style", "width: 100%");
        this.loadBar.innerHTML = 
        `
        <div class="load-bar">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
       `
    }

    public show(){
        this.loadBar.innerHTML = 
        `
        <div class="load-bar">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
       `
    }

    public hide(){
        this.loadBar.innerHTML = "";
    }
}

