#
# Copyright (C) 2010  Camptocamp
#
# This file is part of Studio
#
# Studio is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Studio is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Studio.  If not, see <http://www.gnu.org/licenses/>.
#

"""The application's model objects"""
import sqlalchemy as sa
from sqlalchemy import orm

from studio.model import meta
from studio.lib.sa_types import JsonString

try:
    from hashlib import sha1
except ImportError:
    from sha import new as sha1

def init_model(engine):
    """Call me before using any of the tables or classes in the model"""
    if meta.Session is None:
        sm = orm.sessionmaker(autoflush=True, autocommit=False, bind=engine)

        meta.engine = engine
        meta.Session = orm.scoped_session(sm)


# Tables definition for auth&auth model

user_table = sa.Table('user', meta.metadata,
        sa.Column('id', sa.types.Integer, sa.Sequence('user_seq', optional=True), primary_key=True),
        sa.Column('name', sa.types.String),
        sa.Column('login', sa.types.String, nullable=False, unique=True),
        sa.Column('password', sa.types.String, nullable=False)
        ) 

group_table = sa.Table('group', meta.metadata,
        sa.Column('id', sa.types.Integer, sa.Sequence('group_seq', optional=True), primary_key=True),
        sa.Column('name', sa.types.String, nullable=False, unique=True)
        )

permission_table = sa.Table('permission', meta.metadata,
        sa.Column('id', sa.types.Integer, sa.Sequence('permission_seq', optional=True), primary_key=True),
        sa.Column('name', sa.types.String, nullable=False, unique=True)
        ) 

usergroup_table = sa.Table('usergroup', meta.metadata,
        sa.Column('user_id', sa.types.Integer, sa.ForeignKey('user.id')),
        sa.Column('group_id', sa.types.Integer, sa.ForeignKey('group.id'))
        )

grouppermission_table = sa.Table('grouppermission', meta.metadata,
        sa.Column('group_id', sa.types.Integer, sa.ForeignKey('group.id')),
        sa.Column('permission_id', sa.types.Integer, sa.ForeignKey('permission.id'))
        )


# Tables definition for Studio model

map_table = sa.Table('map', meta.metadata,
        sa.Column('id', sa.types.Integer, sa.Sequence('map_seq', optional=True), primary_key=True),
        sa.Column('user_id', sa.types.Integer, sa.ForeignKey('user.id'), nullable=False),
        sa.Column('name', sa.types.String, nullable=False),
        sa.Column('filepath', sa.types.String, nullable=False)
        ) 

datastore_table = sa.Table('datastore', meta.metadata,
        sa.Column('id', sa.types.Integer, sa.Sequence('datastore_seq', optional=True), primary_key=True),
        sa.Column('name', sa.types.String, nullable=False),
        sa.Column('type', sa.types.String, nullable=False),
        sa.Column('ogrstring', sa.types.String)
        )

layertemplate_table = sa.Table('layertemplate', meta.metadata,
        sa.Column('id', sa.types.Integer, sa.Sequence('layertemplate_seq', optional=True), primary_key=True),
        sa.Column('user_id', sa.types.Integer, sa.ForeignKey('user.id'), nullable=False),
        sa.Column('name', sa.types.String, nullable=False),
        sa.Column('comment', sa.types.String, nullable=False),
        sa.Column('json', JsonString, nullable=False)
        ) 

class User(object):

    def _set_password(self, password):
        """encrypts password on the fly."""
        self._password = self.__encrypt_password(password)

    def _get_password(self):
        """returns password"""
        return self._password

    def __encrypt_password(self, password):
        """Hash the given password with SHA1."""
        return sha1(password).hexdigest()

    def validate_password(self, passwd):
        """Check the password against existing credentials.
        this method _MUST_ return a boolean.

        @param passwd: the password that was provided by the user to
        try and authenticate. This is the clear text version that we will
        need to match against the (possibly) encrypted one in the database.
        @type password: string
        """
        return self.password == self.__encrypt_password(passwd)

    password = property(_get_password, _set_password)


class Group(object):
    pass

class Permission(object):
    pass


class Map(object):
    
    def __init__(self, name, filepath, user_id=None):
        self.user_id = user_id
        self.name = name
        self.filepath = filepath
        
    def to_json(self):
        return {'id': self.id,
                'user_id': self.user_id,
                'name': self.name,
                'filepath': self.filepath}

class DataStore(object):

    def __init__(self, name, type, ogrstring):
        self.name = name
        self.type = type
        self.ogrstring = ogrstring
        
    def to_json(self):
        return {'id': self.id,
                'name': self.name,
                'type': self.type}

    def __repr__(self):
        return "DataStore(id: %(id)d, 'name: '%(name)s', "%self.__dict__ + \
               "type: '%(type)s', ogrstring: '%(ogrstring)s')"%self.__dict__

class LayerTemplate(object):

    def __init__(self, name, comment, json, user_id=None):
        self.user_id = user_id
        self.name = name
        self.comment = comment
        self.json = json

    def to_json(self):
        return {'id': self.id,
                'user_id': self.user_id,
                'name': self.name,
                'comment': self.comment,
                'json': self.json}

orm.mapper(User, user_table, properties={
    'password': orm.synonym('_password', map_column=True),
    'maps': orm.relation(Map, backref='user'),
    'layertemplates': orm.relation(LayerTemplate, backref='user')
    })

orm.mapper(Group, group_table, properties={
    'users':orm.relation(User, secondary=usergroup_table, backref='groups')
    })

orm.mapper(Permission, permission_table, properties={
    'groups':orm.relation(Group, secondary=grouppermission_table, backref='permissions')
    })

orm.mapper(Map, map_table)

orm.mapper(DataStore, datastore_table)

orm.mapper(LayerTemplate, layertemplate_table)
