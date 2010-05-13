#!/bin/sh
 
# variables definitions
ENV="env"


# create the virtualenv if it doesn't exist
if [ ! -d ${ENV} ]; then
   virtualenv=$(which virtualenv)
   
   if [ -z ${virtualenv} ]; then
       echo "error: the virtualenv command must be in your PATH."
       exit 1
   fi
   
   # create virtual env
   ${virtualenv} --no-site-packages ${ENV}
   
   if [ $? -ne 0 ]; then
       echo "error: failed to create the Python virtual environment."
       exit 1
   fi
fi

# activate the virtual env

source ${ENV}/bin/activate

### 
### # install Sphinx in the virtualenv
### easy_install "Sphinx==0.4.2"
### 
# check out Studio trunk
rm -rf Studio
svn co http://www.mapfish.org/svn/mapfish/sandbox/camptocamp/Studio

# install Studio in the virtualenv
(cd Studio && python setup.py develop)

# build the doc
(cd Studio/docs && make html)

# publish doc
if [ -n $1 ]; then
    rm -rf $1
    cp -a Studio/docs/.build $1
fi

exit 0
