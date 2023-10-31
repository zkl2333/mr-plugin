import logging
import time
from typing import Dict, Any

from mbot.core.plugins import plugin, PluginMeta
from mbot.openapi import mbot_api
from moviebotapi.common import MenuItem
from .api.router import app

# 初始化变量和配置
server = mbot_api
plugin.register_blueprint('file_manager', app)


@plugin.after_setup
def after_setup(plugin_meta: PluginMeta, config: Dict[str, Any]):
    # 定义基础路径
    basePath = '/api/plugins/file_manager'

    # 定义前端的URL和相关的权限
    href = '/common/view?hidePadding=true#'+basePath + \
        '/frontend/index.html?t=' + str(int(round(time.time() * 1000)))
    urls = ['/ls', '/find_files_by_inodes', '/get_download_client',
            '/get_torrents', '/delete_torrents']

    # 为以上的URLs添加权限
    server.auth.add_permission([1], href)
    for url in urls:
        server.auth.add_permission([1], basePath+url)

    # 获取当前的菜单项，如果找到"我的"菜单分组，则添加文件管理项
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
