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
