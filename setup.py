"""
Setup module for the jupyterlab_irods proxy extension
"""
import setuptools

setuptools.setup(
    name='jupyterlab_irods',
    description='A Jupyter Notebook server extension which acts as a backend for IRODS requests.',
    version='2.0.5',
    packages=setuptools.find_packages(),
    author          = 'Todd Wickizer',
    author_email    = 'jupyter@googlegroups.com',
    url             = 'http://jupyter.org',
    license         = 'BSD',
    platforms       = "Linux, Mac OS X, Windows",
    keywords        = ['Jupyter', 'JupyterLab', 'Irods'],
    classifiers     = [
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: BSD License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
    ],
    install_requires=[
        'notebook',
        'python-irodsclient'
    ],
    package_data={'jupyterlab_irods':['*']},
)
