import os
import logging
from mbot.core.event.models import EventType
from mbot.core.plugins import plugin
from mbot.core.plugins import PluginContext
from typing import Dict
from . import config
from .utils import create_hard_link

_LOGGER = logging.getLogger(__name__)


@plugin.on_event(bind_event=[EventType.DownloadCompleted], order=1)
def on_event(ctx: PluginContext, event_type: str, data: Dict):
    """
    触发绑定的事件后调用此函数
    函数接收参数固定。第一个为插件上下文信息，第二个事件类型，第三个事件携带的数据
    """

    save_path = data.get("source_path")
    _LOGGER.info("[无脑硬链接] 下载地址: %s " % save_path)
    if not save_path:
        return

    _LOGGER.info("[无脑硬链接] 监控目录: %s " % config.watch_folder)
    flag = False
    # 检查是否匹配监控目录配置
    for dir in config.watch_folder:
        if save_path.startswith(dir):
            flag = True
            break
    if not flag:
        _LOGGER.info("[无脑硬链接] 下载地址与监控目录不匹配，鱼我无瓜")
        return

    _LOGGER.info("[无脑硬链接] 下载地址与监控目录匹配: %s, 开始硬链接" % save_path)

    # 获取文件名
    file_name = os.path.basename(save_path)
    # 拼接目标路径
    target_path = os.path.join(config.target_folder, file_name)
    # 创建硬链接
    create_hard_link(save_path, target_path)
    _LOGGER.info("[无脑硬链接] 完成")
