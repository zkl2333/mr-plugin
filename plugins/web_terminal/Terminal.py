import asyncio
import logging
import json
from winpty import PTY

_LOGGER = logging.getLogger(__name__)


class Terminal:
    def __init__(self):
        self.command_buffer = []  # 特殊命令缓存
        self.pty_process = None  # 伪终端进程
        self.websocket = None  # 绑定的WebSocket连接

    async def start_terminal(self, websocket):
        self.websocket = websocket
        self.pty_process = PTY(120, 120)
        self.pty_process.spawn("cmd.exe")
        asyncio.create_task(self.read_output())
        await self.process_buffered_commands()

    async def read_output(self):
        while True:
            try:
                output = await asyncio.to_thread(self.pty_process.read)
                if output:
                    await self.websocket.send(output)
            except Exception as e:
                _LOGGER.error(f"读取伪终端输出时出错: {e}")
                break

    async def process_buffered_commands(self):
        while self.command_buffer:
            command = self.command_buffer.pop(0)
            await self.handle_special_command(command)

    async def write_to_terminal(self, message):
        self.pty_process.write(message)

    async def handle_special_command(self, command):
        if self.pty_process is None:
            self.command_buffer.append(command)
            return
        try:
            cmd_obj = json.loads(command)
            cmd_type = cmd_obj.get("type")
            data = cmd_obj.get("data")
            if cmd_type == "resize" and self.pty_process is not None:
                cols = data.get("cols")
                rows = data.get("rows")
                self.pty_process.set_size(cols, rows)
        except json.JSONDecodeError:
            _LOGGER.error("命令格式错误")

    async def cleanup(self):
        if self.pty_process is not None:
            self.pty_process.kill()
        self.command_buffer = []
