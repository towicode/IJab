export class
    CopyPath {

    public copyPath : HTMLElement;

    constructor() {
        this.copyPath = document.createElement('li');
        let _newOption = this.copyPath;

        _newOption.classList.add("p-Menu-item");
        _newOption.setAttribute("data-type", "command");
        _newOption.innerHTML = '<div class="p-Menu-itemIcon jp-MaterialIcon jp-CopyIcon"></div><div class="p-Menu-itemLabel">Copy Path</div><div class="p-Menu-itemShortcut"></div><div class="p-Menu-itemSubmenuIcon"></div>';
        _newOption.onmouseover = () => {
            _newOption.classList.add("p-mod-active");
        }
        _newOption.onmouseleave = () => {
            _newOption.classList.remove("p-mod-active");
        }

        _newOption.onclick = () => {

            let irodsBrowser = document.getElementById("irods-file-browser");
            if (irodsBrowser == null) return;
            //  First we need to get the current name of the item we clicked.
            let allSelected = irodsBrowser.getElementsByClassName("jp-DirListing-item jp-mod-selected");
            if (allSelected.length == 0) return;
            let selected = <HTMLElement>allSelected.item(0);
            let subSelected = selected.getElementsByClassName("jp-DirListing-itemText");
            if (subSelected.length == 0) return;
            let itemName = subSelected.item(0).innerHTML;

            //  Next we need to get the current path.

            let crumbs = irodsBrowser.getElementsByClassName("jp-BreadCrumbs-item");
            if (crumbs.length == 0) return;
            let lastCrumb = crumbs.item(crumbs.length - 1);

            //  now we copy to the clipboard
            var dummy = document.createElement("input");
            document.body.appendChild(dummy);
            dummy.value = "/" + lastCrumb.getAttribute("title") + "/" + itemName;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);


            //  close menu
            let menus = document.getElementsByClassName("p-Widget p-Menu");
            if (menus.length == 0) return;
            let menu = <HTMLElement>menus.item(0);
            menu.style.display = "none";


        }
    }
}