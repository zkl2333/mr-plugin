import asyncio
import logging
import platform
import signal
import sys
import threading
import websockets

if platform.system() == "Windows":
    import subprocess
else:
    from ptyprocess import PtyProcess

_LOGGER = logging.getLogger(__name__)


class WebSocketTerminalServer:
    def __init__(self, host, port, password):
        self.host = host
        self.port = port
        self.password = password
        self.term_map = {}

    async def start_terminal(self):
        if platform.system() == "Windows":
            return subprocess.Popen('cmd.exe', stdin=subprocess.PIPE,
                                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        else:
            pty_proc = PtyProcess.spawn('bash')
            await pty_proc.write(f"while read -s -p '请输入密码: ' input && [[ '$input' != '{self.password}' ]]; do echo 'Not matched'; echo; done; clear; bash\n")
            return pty_proc

    async def handle_terminal(self, websocket, path):
        _LOGGER.info("收到新的连接请求")
        term_proc = await self.start_terminal()
        self.term_map[websocket] = term_proc

        try:
            while True:
                if platform.system() == "Windows":
                    await self._handle_windows_terminal(websocket, term_proc)
                else:
                    await self._handle_unix_terminal(websocket, term_proc)
        except websockets.exceptions.ConnectionClosed:
            if platform.system() == "Windows":
                term_proc.kill()
            else:
                term_proc.terminate()
            del self.term_map[websocket]

    async def _handle_windows_terminal(self, websocket, term_proc):
        # Windows specific handling
        # ... Implement Windows specific logic ...
        pass

    async def _handle_unix_terminal(self, websocket, term_proc):
        # Unix specific handling
        # ... Implement Unix specific logic ...
        pass

    def run(self):
        # 创建并设置一个新的事件循环
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        self.loop = loop
        self.shutdown_event = asyncio.Event()

        _LOGGER.info("WebSocket 服务器线程正在启动，使用新的事件循环...")
        try:
            self.loop.run_until_complete(self.start_ws())
        except Exception as e:
            _LOGGER.error(f"WebSocket 服务器运行循环中出现异常: {e}")
            self.loop.run_until_complete(self.close_all_connections())
            self.loop.close()
            _LOGGER.info("WebSocket 服务器运行循环已关闭.")
        finally:
            pass

    async def start_ws(self):
        _LOGGER.info("正在启动 WebSocket 服务器...")
        try:
            async with websockets.serve(self.handle_terminal, self.host, self.port):
                _LOGGER.info(f"WebSocket 服务器正在监听 {self.host}:{self.port}")
                await self.shutdown_event.wait()
                sys.exit(0)
                _LOGGER.info("已收到关闭事件，正在关闭 WebSocket 服务器...")
        except Exception as e:
            _LOGGER.error(f"start_ws 中出现异常: {e}")
        finally:
            _LOGGER.info("WebSocket 服务器已停止.")

    async def close_all_connections(self):
        if not self.term_map:
            _LOGGER.info("No WebSocket connections to close.")
            return

        close_coroutines = []
        for websocket in list(self.term_map.keys()):
            _LOGGER.info(f"Closing WebSocket connection: {websocket}")
            close_action = websocket.close()
            if asyncio.iscoroutine(close_action):
                close_coroutines.append(close_action)
            else:
                _LOGGER.error(
                    f"Expected coroutine for close action, got: {type(close_action)}")

        if close_coroutines:
            await asyncio.gather(*close_coroutines)
            _LOGGER.info("All WebSocket connections closed.")

    def start_in_thread(self):
        self.thread = threading.Thread(target=self.run)
        self.thread.start()


def signal_handler(server, signum, frame):
    _LOGGER.info("收到停止信号，准备退出...")
    server.shutdown_event.set()


def start_ws_thread():
    server = WebSocketTerminalServer("127.0.0.1", 8765, "duochidian")

    if sys.platform == 'win32':
        signal.signal(signal.SIGINT, lambda s, f: signal_handler(server, s, f))
    else:
        signal.signal(signal.SIGINT, lambda s, f: signal_handler(server, s, f))
        signal.signal(signal.SIGTERM, lambda s,
                      f: signal_handler(server, s, f))

    server.start_in_thread()
