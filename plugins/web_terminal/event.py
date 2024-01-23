import logging
import time
from typing import Dict, Any
from moviebotapi.common import MenuItem
from mbot.core.plugins import plugin, PluginMeta
from mbot.openapi import mbot_api 
from plugins.web_terminal.app import init_web_terminal, webTermBlueprint


# 初始化变量和配置
server = mbot_api
plugin.register_blueprint('web_terminal', webTermBlueprint)
_LOGGER = logging.getLogger(__name__)


@plugin.after_setup
def after_setup(plugin_meta: PluginMeta, config: Dict[str, Any]):
    _LOGGER.info("web_terminal插件已启动")
    basePath = '/api/plugins/web_terminal'

    href = '/common/view?hidePadding=true#'+basePath + \
        '/frontend/index.html?t=' + str(int(round(time.time() * 1000)))

    server.auth.add_permission([1], href)

    menus = server.common.list_menus()
    for item in menus:
        if item.title == '设置':
            page = MenuItem()
            page.title = '终端'
            page.href = href
            page.icon = 'material-symbols:terminal'
            item.pages.append(page)
            break
    server.common.save_menus(menus)
    init_web_terminal()
