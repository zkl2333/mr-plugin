import asyncio
import logging
import json
from abc import ABC, abstractmethod

_LOGGER = logging.getLogger(__name__)


class BaseTerminal(ABC):
    def __init__(self):
        self.command_buffer = []  # 特殊命令缓存
        self.pty_process = None  # 伪终端进程
        self.websocket = None  # 绑定的WebSocket连接
        self.task = None  # 读取伪终端输出的任务

    async def start_terminal(self, websocket):
        self.websocket = websocket
        self.create_pty_process()
        self.task = asyncio.create_task(self.read_output())
        await self.process_buffered_commands()

    @abstractmethod
    def create_pty_process(self):
        """
        创建伪终端进程的方法，具体实现将由子类提供。
        """
        pass

    @abstractmethod
    async def read_output(self):
        """
        不断读取伪终端的输出，并发送到WebSocket。具体实现将由子类提供。
        """
        pass

    async def process_buffered_commands(self):
        """
        处理缓存的特殊命令。
        """
        while self.command_buffer:
            command = self.command_buffer.pop(0)
            await self.handle_special_command(command)

    @abstractmethod
    async def write_to_terminal(self, message):
        """
        将消息写入伪终端。具体实现将在子类中定义。
        """
        pass

    async def handle_special_command(self, command):
        """
        处理特殊命令，例如改变伪终端大小等。
        """
        if self.pty_process is None:
            self.command_buffer.append(command)
            return
        try:
            cmd_obj = json.loads(command)
            cmd_type = cmd_obj.get("type")
            data = cmd_obj.get("data")
            if cmd_type == "resize":
                cols = data.get("cols")
                rows = data.get("rows")
                self.resize_pty(cols, rows)
        except json.JSONDecodeError:
            _LOGGER.error("命令格式错误")

    @abstractmethod
    def resize_pty(self, cols, rows):
        """
        改变伪终端的大小。具体实现将在子类中定义。
        """
        pass

    @abstractmethod
    async def destroy_pty(self):
        """
        销毁伪终端。具体实现将在子类中定义。
        """
        pass

    async def cleanup(self):
        self.command_buffer = []
        if self.task is not None and not self.task.done():
            self.task.cancel()
        if self.pty_process is not None:
            await self.destroy_pty()
        if self.websocket is not None and self.websocket.open:
            await self.websocket.send("终端进程已终止")
            self.websocket.close()
        _LOGGER.info("终端进程已终止")
