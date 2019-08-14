FROM sh4d1/jupyterlab

ENTRYPOINT [ "/bin/sh" ]

COPY . /home
WORKDIR /home

USER root

RUN pip install -e .
RUN jupyter serverextension enable --py jupyterlab_irods
RUN jupyter labextension install .

