import logging
from mbot.core.plugins import (
    plugin,
    PluginMeta,
)
from typing import Dict, Any
from .config import *
from .event import *

_LOGGER = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@plugin.after_setup
def after_setup(plugin_meta: PluginMeta, config: Dict[str, Any]):
    update_config(config)
    _LOGGER.info("[无脑硬链接] 启动！")
