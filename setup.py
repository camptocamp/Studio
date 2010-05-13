try:
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages

setup(
    name='Studio',
    version='0.1',
    description='Studio',
    author='Camptocamp',
    author_email='',
    #url='',
    install_requires=[
        "Pylons>=0.9.7,<=0.9.7.99",
        "SQLAlchemy>=0.5,<=0.5.99",
        "Mako>=0.2.3,<=0.2.99",
        "repoze.who>=1.0,<=1.0.99",
        "repoze.who-friendlyform>=1.0b3,<=1.0.99",
        "repoze.what_quickstart>=1.0,<=1.0.99",
        "repoze.what_pylons>=1.0rc4,<=1.0.99",
        "httplib2",
        "Babel",
        "Shapely"
    ],
    setup_requires=["PasteScript==dev,>=1.6.3dev-r7326"],
    packages=find_packages(exclude=['ez_setup']),
    include_package_data=True,
    test_suite='nose.collector',
    package_data={'studio': ['i18n/*/LC_MESSAGES/*.mo']},
    message_extractors = {'studio': [
           ('**.py', 'python', None),
           ('templates/**.html', 'mako', None),
           ('public/**', 'ignore', None)]},
    zip_safe=False,
    paster_plugins=['PasteScript', 'Pylons'],
    entry_points="""
    [paste.app_factory]
    main = studio.config.middleware:make_app

    [paste.app_install]
    main = studio.config.installer:StudioInstaller
    """,
    extras_require = {
        'MySQL':  ["mysql-python>=1.2"],
        'PostgreSQL': ["psycopg2"],
        },
)
