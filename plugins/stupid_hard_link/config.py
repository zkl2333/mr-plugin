import logging
from typing import Dict, Any
from mbot.core.plugins import (
    plugin,
)

watch_folder = []
target_folder = ""


def update_config(web_config: dict):
    global watch_folder, target_folder

    to_watch = web_config.get("watch_folder")
    if to_watch:
        watch_folder = [x.strip() for x in to_watch.split(",")]
        logging.info("[无脑硬链接] 硬链接插件配置更新, 监视文件夹: %s", watch_folder)

    target_folder = web_config.get("target_folder") or ""


@plugin.config_changed
def config_changed(config: Dict[str, Any]):
    update_config(config)
