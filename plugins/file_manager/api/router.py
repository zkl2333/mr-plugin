from flask import Blueprint, request
from mbot.register.controller_register import login_required
from plugins.file_manager.file import ls
from mbot.common.flaskutils import api_result

app = Blueprint('file_manager', __name__,
                static_folder='../frontend/dist', static_url_path='/')


def request_parse(req_data):
    '''解析请求数据并以json形式返回'''
    if req_data.method == 'GET':
        return req_data.args
    elif req_data.method == 'POST':
        return req_data.get_json(force=True)


@app.route('/ls', methods=['GET', 'POST'])
@login_required()
def listFile():
    data = request_parse(request)
    path = data.get('path', '/')
    return ls(path)
    # return api_result(0, 'ok', ls(path))
