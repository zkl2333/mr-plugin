import logging
from flask import Blueprint
import subprocess
import platform
import sys


_LOGGER = logging.getLogger(__name__)


def is_package_installed(package_name):
    try:
        __import__(package_name)
        return True
    except ImportError:
        return False


def install_package(package):
    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", package])
        globals()[package] = __import__(package)
    except Exception as e:
        _LOGGER.info(f"An error occurred while installing {package}: {str(e)}")


# 初始化
def init():
    _LOGGER.info("正在检查依赖包...")
    if platform.system() == "Windows":
        packages = ['pywinpty', 'websockets', 'asyncio']
    else:
        packages = ['ptyprocess', 'websockets', 'asyncio']
    for package in packages:
        _LOGGER.info(f"检查 {package} 是否已安装...")
        if is_package_installed(package):
            _LOGGER.info(f"{package} 已安装。")
        else:
            _LOGGER.info(f"{package} 未安装，正在安装...")
            try:
                install_package(package)
                _LOGGER.info(f"{package} 安装成功。")
            except Exception as e:
                _LOGGER.info(f"{package} 安装失败。")
                _LOGGER.error(e)
    from .websocket import start_ws_thread
    start_ws_thread()


_LOGGER.info("web_terminal插件已启动")
init()


app = Blueprint('web_terminal', __name__,
                static_folder='../frontend', static_url_path='/frontend')
