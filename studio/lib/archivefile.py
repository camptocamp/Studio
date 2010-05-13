import os, zipfile, tarfile, shutil

def extractall(archive, filename, dstdir):
    """ extract zip or tar content to dstdir"""
    
    if zipfile.is_zipfile(archive.name):
        z = zipfile.ZipFile(archive.name)
        for name in z.namelist():
            targetname = name
            if targetname.endswith(os.path.sep):
                targetname = targetname[:-1]

            # don't include leading "/" from file name if present
            if targetname.startswith(os.path.sep):
                targetname = os.path.join(dstdir, targetname[1:])
            else:
                targetname = os.path.join(dstdir, targetname)                
            targetname = os.path.normpath(targetname)

            # Create all upper directories if necessary.    
            upperdirs = os.path.dirname(targetname)
            if upperdirs and not os.path.exists(upperdirs):
                os.makedirs(upperdirs)

            if not name.endswith(os.path.sep):
                # copy file
                file(targetname, 'wb').write(z.read(name))

    elif tarfile.is_tarfile(archive.name):
        tar = tarfile.open(archive.name)
        tar.extractall(path=dstdir)
    else:
        # seems to be a single file, save it
        archive.seek(0)
        shutil.copyfileobj(archive,
                           file(os.path.join(dstdir, filename), 'wb'))
