import importlib
import logging
import subprocess
import sys


_LOGGER = logging.getLogger(__name__)


def import_package(package, import_name=None):
    """
    尝试导入一个包，如果未安装则先安装它。
    :param package: 要安装的包名。
    :param import_name: 导入时使用的模块名（如果与包名不同）。
    """
    if import_name is None:
        import_name = package

    try:
        # 尝试导入模块
        return importlib.import_module(import_name)
    except ImportError:
        # 如果导入失败，则尝试安装包
        try:
            subprocess.check_call(
                [sys.executable, '-m', 'pip', 'install', package])
            return importlib.import_module(import_name)
        except subprocess.CalledProcessError as e:
            print(f"安装{package}失败: {e}")
            return None
