import os
import logging
import time
import requests
from typing import Dict, Any

from mbot.core.event.models import EventType
from mbot.core.plugins import PluginContext, plugin, PluginMeta
from mbot.openapi import mbot_api
from moviebotapi.common import MenuItem
from plugins.webhooks.config import getWebhooksByEvent
from .api.router import app

# 初始化变量和配置
server = mbot_api
plugin.register_blueprint('webhooks', app)

# 获取当前文件的绝对路径，然后构建config.yml文件的路径
current_dir = os.path.dirname(os.path.abspath(__file__))
config_file_path = os.path.join(current_dir, 'U:\appdata\mbot\conf')

_LOGGER = logging.getLogger(__name__)


@plugin.on_event(bind_event=[event for event in EventType])
def on_event(ctx: PluginContext, event_type: str, data: Dict):
    _LOGGER.info(f"触发事件：{event_type}")
    webhooks = getWebhooksByEvent(event_type)
    if len(webhooks) == 0:
        return
    for webhook in webhooks:
        _LOGGER.info(f"通知webhook：{webhook.get('name')}")
        requests.post(webhook.get('url'), json={
            "event": event_type,
            "data": data
        })


@plugin.after_setup
def after_setup(plugin_meta: PluginMeta, config: Dict[str, Any]):
    # 定义基础路径
    basePath = '/api/plugins/webhooks'

    # 定义前端的URL和相关的权限
    href = '/common/view?hidePadding=true#'+basePath + \
        '/frontend/index.html?t=' + str(int(round(time.time() * 1000)))
    urls = ['/config', '/test']

    # 为以上的URLs添加权限
    server.auth.add_permission([1], href)
    for url in urls:
        server.auth.add_permission([1], basePath+url)

    # 获取当前的菜单项，如果找到"我的"菜单分组，则添加文件管理项
    menus = server.common.list_menus()
    for item in menus:
        if item.title == '我的':
            page = MenuItem()
            page.title = 'Webhooks'
            page.href = href
            page.icon = 'Webhook'
            item.pages.append(page)
            break
    server.common.save_menus(menus)
