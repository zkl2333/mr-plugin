import asyncio
import logging
from plugins.web_terminal.BaseTerminal import BaseTerminal


_LOGGER = logging.getLogger(__name__)


class LinuxTerminal(BaseTerminal):
    def create_pty_process(self):
        """
        在Linux平台上创建伪终端进程。
        """
        try:
            from ptyprocess import PtyProcess
            self.pty_process = PtyProcess.spawn(
                ["/bin/bash"], dimensions=(100, 100))
        except Exception as e:
            _LOGGER.error(f"创建Linux伪终端进程时出错: {e}")

    def resize_pty(self, cols, rows):
        """
        改变伪终端的大小。
        """
        if self.pty_process is not None:
            try:
                self.pty_process.setwinsize(rows, cols)
            except Exception as e:
                _LOGGER.error(f"调整Linux伪终端大小时出错: {e}")

    async def read_output(self):
        """
        不断读取伪终端的输出，并发送到WebSocket。
        """
        if self.pty_process is None:
            _LOGGER.error("伪终端进程未初始化")
            return

        while True:
            try:
                output = await asyncio.to_thread(self.pty_process.read)
                if output:
                    await self.websocket.send(output)
            except Exception as e:
                _LOGGER.error(f"读取Linux伪终端输出时出错: {e}")
                break

    async def write_to_terminal(self, message):
        """
        将消息写入伪终端。
        """
        if self.pty_process is None:
            _LOGGER.error("伪终端进程未初始化")
            return

        if isinstance(message, str):
            message = message.encode("utf-8")

        try:
            self.pty_process.write(message)
        except Exception as e:
            _LOGGER.error(f"写入Linux伪终端时出错: {e}")

    async def destroy_pty(self):
        """
        清理资源，关闭伪终端。
        """
        if self.pty_process is not None:
            try:
                self.pty_process.terminate()
            except Exception as e:
                _LOGGER.error(f"关闭Linux伪终端时出错: {e}")
