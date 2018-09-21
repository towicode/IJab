# jupyterlab_irods

IROD connection filemanager for jupyterlab. Contains both a backend server using python-irods and a frontend for managing content.

Currently supports the following features:

* Add new text file or jupyter notebook file (only python3)
* delete any file
* rename any file or folder
* open any file or jupyter notebook file
* navigate through IRODS collection
* save files
* add new folder
* Copy
* Paste
* Cut
* Move
* Download
* Copy remote path


TODO:


* Delete folder
* Refactor python code a bit
* example script with sessions
* ?multiple irods connections


## Prerequisites

* JupyterLab

## Installation

```bash
pip install jupyterlab_irods
jupyter serverextension enable --py jupyterlab_irods
jupyter labextension install ijab
```
