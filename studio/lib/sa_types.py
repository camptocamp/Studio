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

from sqlalchemy.types import TypeEngine
import simplejson

class JsonString(TypeEngine):
    
    def get_col_spec(self):
        return 'STRING'

    def bind_processor(self, dialect):
        """convert value from python object to json"""
        def convert(value):
            if value is None:
                return None
            else:
                return simplejson.dumps(value)
        return convert

    def result_processor(self, dialect):
        """convert value from json to a python object"""
        def convert(value):
            if value is None:
                return None
            else:
                return simplejson.loads(value)
        return convert
