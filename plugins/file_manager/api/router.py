from flask import Blueprint, request
from mbot.register.controller_register import login_required
from plugins.file_manager.file import find_file_by_inode, ls
from mbot.common.flaskutils import api_result
from mbot.external.downloadclient.multipledownloadclient import MultipleDownloadClient
import logging

_LOGGER = logging.getLogger(__name__)


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


@app.route('/get_completed_torrents', methods=['GET'])
@login_required()
def get_completed_torrents():
    completed_torrents = MultipleDownloadClient.get_completed_torrents()

    # 将ClientTorrent对象转换为字典
    serialized_torrents = {hash: torrent.to_json()
                           for hash, torrent in completed_torrents.items()}

    return api_result(0, 'ok', serialized_torrents)
