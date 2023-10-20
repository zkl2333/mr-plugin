import logging
from mbot.core.plugins import (
    plugin,
    PluginCommandContext,
    PluginCommandResponse,
)
from mbot.core.params import ArgSchema, ArgType
from . import config
from .utils import create_hard_link


_LOGGER = logging.getLogger(__name__)


@plugin.command(
    name="hard_link",
    title="创建硬链接",
    desc="创建硬链接, 如果是文件夹, 则递归创建",
    icon="AlarmOn",
    run_in_background=True,
)
def update(ctx: PluginCommandContext,
           source_path: ArgSchema(ArgType.String, '源文件地址', '', '', required=False),
           target_path: ArgSchema(ArgType.String, '目标地址', '', '', required=False)):
 
    if not source_path:
        return PluginCommandResponse(False, "源文件地址不能为空")
    if not target_path:
        return PluginCommandResponse(False, "目标地址不能为空")

    create_hard_link(source_path, target_path)
    return PluginCommandResponse(True, "创建硬链接成功")
