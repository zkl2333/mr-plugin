from flask import Blueprint, request
from mbot.register.controller_register import login_required
from plugins.file_manager.file import find_file_by_inode, ls
from mbot.common.flaskutils import api_result

app = Blueprint('file_manager', __name__,
                static_folder='../frontend/dist', static_url_path='/frontend')


def request_parse(req_data):
    '''解析请求数据并以json形式返回'''
    if req_data.method == 'GET':
        return req_data.args
    elif req_data.method == 'POST':
        return req_data.get_json(force=True)


@app.route('/ls', methods=['POST'])
@login_required()
def listFile():
    data = request_parse(request)
    path = data.get('path')
    if not path:
        return api_result(1, 'path is required')
    return api_result(0, 'ok', ls(path))


@app.route('/find_by_inode', methods=['POST'])
@login_required()
def findFileByInode():
    data = request_parse(request)
    start_path = data.get('start_path')
    target_inode = data.get('target_inode')
    if not start_path:
        return api_result(1, 'start_path is required')
    if not target_inode:
        return api_result(1, 'target_inode is required')
    return api_result(0, 'ok', find_file_by_inode(start_path, target_inode))
