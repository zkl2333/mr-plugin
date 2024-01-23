import logging
import platform
from flask import Blueprint
from plugins.web_terminal.utils import import_package


_LOGGER = logging.getLogger(__name__)


# 初始化
def init_web_terminal():
    _LOGGER.info("正在检查依赖包...")
    if platform.system() == "Windows":
        import_package('pywinpty', 'winpty')
        import_package('websockets')
        import_package('asyncio')

    else:
        import_package('ptyprocess')
        import_package('websockets')
        import_package('asyncio')

    from .websocket import start_ws_thread
    start_ws_thread()


webTermBlueprint = Blueprint('web_terminal', __name__,
                             static_folder='./frontend', static_url_path='/frontend')
