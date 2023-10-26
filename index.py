from flask import Flask
from mbot.common.flaskutils import api_result
from plugins.file_manager.api.router import app


server = Flask(__name__)
server.register_blueprint(app, url_prefix='/api/plugins/file_manager')


@server.route('/api/config/get_media_path')
def get_media_path():
    return api_result(0, 'ok', {'paths': [{
        'download_path': "/mnt/user/media/做种区/电影",
        'file_process_mode': "link",
        'qbit_cate': "测试数据",
        'source_dir': "./plugins/file_manager/frontend",
        'target_dir': "./plugins/file_manager/frontend/dist",
        'type': "movie",
        'use_area_folder': 'true'
    }]})


server.run(host='localhost', port=5000, debug=True)
