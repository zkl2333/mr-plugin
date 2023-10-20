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
           source_path: ArgSchema(
               arg_type=ArgType.String,
               label='源文件地址',
               helper='如果是文件夹, 则递归创建',
               required=True
           ),
           target_path: ArgSchema(
               arg_type=ArgType.String,
               label='目标地址',
               helper='如果目标文件已存在则删除',
               required=True
           )):

    create_hard_link(source_path, target_path)
    return PluginCommandResponse(True, "创建硬链接成功")
