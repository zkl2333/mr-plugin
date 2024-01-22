# coding=utf-8
from flask import Flask
from mbot.common.flaskutils import api_result
from plugins.web_terminal import app
import logging


# 配置日志
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
_LOGGER = logging.getLogger(__name__)


_LOGGER.info("Flask server is starting...")

server = Flask(__name__)
server.register_blueprint(app, url_prefix='/api/plugins/web_terminal')


# @server.route('/api/config/get_media_path')
# def get_media_path():
#     return api_result(0, 'ok', {'paths': [{
#         'download_path': "/mnt/user/media/做种区/电影",
#         'file_process_mode': "link",
#         'qbit_cate': "测试数据",
#         'source_dir': "./plugins/file_manager/frontend",
#         'target_dir': "./plugins/file_manager/frontend/dist",
#         'type': "movie",
#         'use_area_folder': 'true'
#     }]})


server.run(host='localhost', port=5000, debug=True, use_reloader=False)
