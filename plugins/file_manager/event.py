from mbot.core.plugins import plugin
from .api.router import app
from typing import Dict, Any
from mbot.core.plugins import PluginMeta
from mbot.openapi import mbot_api
from moviebotapi.common import MenuItem
import logging
import time


server = mbot_api
_LOGGER = logging.getLogger(__name__)
plugin.register_blueprint('file_manager', app)


@plugin.after_setup
def after_setup(plugin_meta: PluginMeta, config: Dict[str, Any]):
    _LOGGER.info('插件【%s】%s 初始化开始', plugin_meta.manifest.title,
                 plugin_meta.manifest.version)
    href = '/common/view?hidePadding=true#/api/plugins/file_manager/frontend/index.html?t=' + \
        int(round(time.time() * 1000))
    # 授权管理员和普通用户可访问
    server.auth.add_permission([1], href)
    server.auth.add_permission([1], '/api/plugins/file_manager/ls')
    server.auth.add_permission(
        [1], '/api/plugins/file_manager/find_file_by_inode')
    # 获取菜单，把文件管理添加到"我的"菜单分组
    menus = server.common.list_menus()
    for item in menus:
        if item.title == '我的':
            page = MenuItem()
            page.title = '文件管理'
            page.href = href
            page.icon = 'Folder'
            item.pages.append(page)
            break
    server.common.save_menus(menus)
    _LOGGER.info('插件【%s】%s 初始化完成', plugin_meta.manifest.title,
                 plugin_meta.manifest.version)
