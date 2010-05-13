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
