import asyncio
import logging
import signal
import sys
import threading
import websockets
from plugins.web_terminal.WindowsTerminal import WindowsTerminal

_LOGGER = logging.getLogger(__name__)


class WebSocketTerminalServer:
    def __init__(self, host, port, password):
        self.host = host
        self.port = port
        self.password = password
        self.term_map = {}
        self.server = None
        self.shutdown_event = asyncio.Event()

    async def handle_message(self, websocket):
        _LOGGER.info("新连接建立")
        authenticated = False
        message_buffer = ""  # 用于缓存输入的消息
        await websocket.send("请输入密码：")

        if sys.platform == "win32":
            terminal = WindowsTerminal()
        else:
            terminal = LinuxTerminal()

        self.term_map[websocket] = terminal

        try:
            while True:
                message = await websocket.recv()
                if message.startswith("__cmd__"):
                    if authenticated:
                        await self.term_map[websocket].handle_special_command(message[7:])
                    else:
                        self.term_map[websocket].command_buffer.append(
                            message[7:])
                    continue
                if not authenticated:
                    message_buffer += message
                    if "\r" in message_buffer or "\n" in message_buffer:
                        authenticated = await self.authenticate(message_buffer.strip(), websocket)
                        message_buffer = ""
                        if authenticated:
                            await terminal.start_terminal(websocket)
                else:
                    await self.term_map[websocket].write_to_terminal(message)

        except asyncio.CancelledError:
            _LOGGER.info("连接被取消")
        except websockets.exceptions.ConnectionClosedError:
            _LOGGER.info("连接被关闭")
        except websockets.exceptions.ConnectionClosedOK:
            _LOGGER.info("连接被正常关闭")
        except Exception as e:
            _LOGGER.error(f"处理连接时出错: {e}")
        finally:
            await self.cleanup(websocket)

    async def authenticate(self, message, websocket):
        if message == self.password:
            await websocket.send("\033c密码验证成功，欢迎进入终端。\n")
            return True
        else:
            await websocket.send("\033c密码错误，请重试：")
            return False

    async def cleanup(self, websocket):
        if websocket in self.term_map:
            await self.term_map[websocket].cleanup()
            del self.term_map[websocket]

    def run(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        self.loop = loop
        _LOGGER.info("web_terminal 线程正在启动...")

        try:
            self.loop.run_until_complete(self.start_ws())
            self.loop.run_until_complete(self.shutdown_event.wait())
        finally:
            self.loop.run_until_complete(self.close_all_connections())
            self.loop.close()
            _LOGGER.info("web_terminal 线程已停止。")

    async def start_ws(self):
        _LOGGER.info("正在启动 WebSocket 服务器...")
        try:
            self.server = await websockets.serve(
                self.handle_message,
                self.host,
                self.port,
                logger=logging.getLogger(
                    "websockets.server").setLevel(logging.INFO)
            )
            _LOGGER.info(f"WebSocket 服务器正在监听 {self.host}:{self.port}")
            await self.server.wait_closed()  # 等待服务器关闭
        except Exception as e:
            _LOGGER.error(f"start_ws 中出现异常: {e}")
        finally:
            _LOGGER.info("WebSocket 服务器已停止.")

    async def close_all_connections(self):
        if self.term_map:
            await asyncio.gather(*(self.cleanup(ws) for ws in list(self.term_map.keys())))
            _LOGGER.info("所有WebSocket连接已关闭.")

    def start_in_thread(self):
        self.thread = threading.Thread(target=self.run)
        self.thread.start()

    def stop_server(self):
        if not self.server or not self.server.is_serving():
            _LOGGER.info("WebSocket服务器已经停止或未启动。")
            return

        _LOGGER.info("正在关闭WebSocket服务器...")
        self.server.close()
        asyncio.run_coroutine_threadsafe(self.server.wait_closed(), self.loop)
        asyncio.run_coroutine_threadsafe(
            self.close_all_connections(), self.loop)
        self.shutdown_event.set()


def signal_handler(server, signum, frame):
    _LOGGER.info("收到停止信号，准备退出...")
    server.stop_server()  # 停止 WebSocket 服务器
    server.thread.join()  # 等待子线程结束
    sys.exit(0)  # 退出主进程


def start_ws_thread():
    server = WebSocketTerminalServer("127.0.0.1", 8765, "duochidian")

    if sys.platform == 'win32':
        signal.signal(signal.SIGINT, lambda s, f: signal_handler(server, s, f))
    else:
        signal.signal(signal.SIGINT, lambda s, f: signal_handler(server, s, f))
        signal.signal(signal.SIGTERM, lambda s,
                      f: signal_handler(server, s, f))

    server.start_in_thread()
