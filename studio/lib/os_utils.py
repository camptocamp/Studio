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

import os

# http://www.python.org/doc/faq/windows/#how-do-i-emulate-os-kill-in-windows
def stop_subprocess(pid):
    """Stop subprocess whose process id is pid."""
    if hasattr(os, "kill"):
        import signal
        os.kill(pid, signal.SIGTERM)
    else:
        import win32api
        pid = win32api.OpenProcess(1, 0, pid)
        win32api.TerminateProcess(pid, 0)
    os.waitpid(pid, 0)
