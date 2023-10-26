from typing import Callable


def login_required():
    def decorator(func: Callable):
        return func

    return decorator
