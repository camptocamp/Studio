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

"""
This script is used to generate a JavaScript file which is a concatenation
and minification of all the files which are found between two lines of a html
file.

These two lines are delimited by the strings START_MERGE and END_MERGE for
starting and end lines respectively.
"""

import re
import os
import os.path
import urllib2
from jsmin import jsmin

# Minify the javascript?
MINIFY = True

def main(input_file, input_dir, output_file):
    extract_js_url = False
    urls = []

    for l in open(input_file):
        if "START_MERGE" in l:
            extract_js_url = True
            continue
        if "END_MERGE" in l:
            extract_js_url = False
            continue
        if not extract_js_url:
            continue
        # Skip comments
        if "<!--" in l:
            continue
        m = re.search("""url_for\(["']([^"']+)["']""", l)
        if not m:
            continue
        urls.append(m.group(1))

    merged_js = ""
    for u in urls:
        if not MINIFY:
            merged_js += "\n// Including file %s\n\n" % u
        if u.startswith("http://"):
            f = urllib2.urlopen(u)
        else:
            u = u.lstrip(os.sep)
            f = open(os.path.join(input_dir, *u.split('/')))
        merged_js += f.read()

    output = "// This file is generated, do not edit!\n\n"
    if MINIFY:
        output += jsmin(merged_js)
    else:
        output += merged_js
    open(output_file, "w").write(output)

if __name__ == "__main__":
    import sys

    if len(sys.argv) != 3:
        print "Usage: %s PATH_TO/<FILE>html PATH_TO/<OUTPUT_MERGED>.js" % sys.argv[0]
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    main(input_file, output_file)

    print "%s: End of merge" % sys.argv[0]

