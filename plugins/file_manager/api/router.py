from flask import Blueprint, request
from mbot.register.controller_register import login_required
from plugins.file_manager.api.controller import find_files_by_inodes, get_file_details, get_torrents, get_download_client, delete_torrents
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
    return api_result(0, 'ok', get_file_details(path))


@app.route('/find_files_by_inodes', methods=['POST'])
@login_required()
def findFileByInode():
    data = request_parse(request)
    start_paths = data.get('start_paths')
    target_inodes = data.get('target_inodes')
    if not start_paths:
        return api_result(1, 'start_paths is required')
    if not target_inodes:
        return api_result(1, 'target_inodes is required')
    return api_result(0, 'ok', find_files_by_inodes(start_paths, target_inodes))


@app.route('/get_torrents', methods=['GET'])
@login_required()
def getTorrents():
    data = request_parse(request)
    downloder = data.get('downloder')
    hardlink = data.get('hardlink')
    return api_result(0, 'ok', get_torrents(downloder, hardlink))


@app.route('/get_download_client', methods=['GET'])
@login_required()
def getDownloadClient():
    return api_result(0, 'ok', get_download_client())


@app.route('/delete_torrents', methods=['POST'])
@login_required()
def deleteTorrents():
    data = request_parse(request)
    hashes = data.get('hashes')
    return api_result(0, 'ok', delete_torrents(hashes))
