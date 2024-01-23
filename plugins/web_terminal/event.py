import logging
from typing import Dict, Any

from mbot.core.event.models import EventType
from mbot.core.plugins import PluginContext, plugin, PluginMeta
from mbot.openapi import mbot_api 
from plugins.web_terminal.app import init_web_terminal, webTermBlueprint


# 初始化变量和配置
server = mbot_api
plugin.register_blueprint('web_terminal', webTermBlueprint)
_LOGGER = logging.getLogger(__name__)


@plugin.after_setup
def after_setup(plugin_meta: PluginMeta, config: Dict[str, Any]):
    _LOGGER.info("web_terminal插件已启动")
    init_web_terminal()
