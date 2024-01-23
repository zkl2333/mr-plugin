import asyncio
import logging
from plugins.web_terminal.BaseTerminal import BaseTerminal

_LOGGER = logging.getLogger(__name__)


class WindowsTerminal(BaseTerminal):
    def create_pty_process(self):
        """
        在Windows平台上创建伪终端进程。
        """
        from winpty import PTY
        self.pty_process = PTY(120, 120)
        self.pty_process.spawn("cmd.exe")
        _LOGGER.info("终端进程已创建")

    def resize_pty(self, cols, rows):
        """
        改变伪终端的大小。
        """
        if self.pty_process is not None:
            try:
                self.pty_process.set_size(cols, rows)
            except Exception as e:
                _LOGGER.error(f"调整Windows伪终端大小时出错: {e}")

    async def read_output(self):
        """
        不断读取伪终端的输出，并发送到WebSocket。
        """
        while self.pty_process is not None and self.pty_process.isalive():
            try:
                output = await asyncio.to_thread(self.pty_process.read)
                if output:
                    await self.websocket.send(output)
            except Exception as e:
                _LOGGER.error(f"读取伪终端输出时出错: {e}")
                break
        await self.cleanup()

    async def write_to_terminal(self, message):
        if self.pty_process is not None:
            self.pty_process.write(message)

    async def destroy_pty(self):
        process = self.pty_process
        if process.isalive():
            del process
