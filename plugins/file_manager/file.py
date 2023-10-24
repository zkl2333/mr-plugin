import os
import hashlib
import logging
import json
from mbot.openapi import mbot_api
server = mbot_api

_LOGGER = logging.getLogger(__name__)


# 获取文件夹下所有文件和文件夹的路径 一层 返回文件详情列表 可排序
def ls(path):
    _LOGGER.info('获取: %s', path)
    file_list = []
    for file in os.listdir(path):
        if (os.path.isdir(os.path.join(path, file))):
            file_list.append({
                'type': 'folder',
                'name': file,
                'path': os.path.join(path, file),
                'size': os.path.getsize(os.path.join(path, file)),
                'mtime': os.path.getmtime(os.path.join(path, file))
            })
        else:
            file_list.append({
                'type': 'file',
                'name': file,
                'path': os.path.join(path, file),
                'size': os.path.getsize(os.path.join(path, file)),
                'mtime': os.path.getmtime(os.path.join(path, file))
            })
    return json.dumps(file_list)


# 查找两个文件夹中的硬链接文件
def find_hardlink(dir1, dir2):
    def get_file_ino(filename):
        return os.stat(filename).st_ino

    all_files = {}
    for root, dirs, files in os.walk(dir1):
        print(root, dirs, files)
        for file in files:
            filename = os.path.join(root, file)
            ino = get_file_ino(filename)
            if ino in all_files:
                all_files[ino].append(filename)
            else:
                all_files[ino] = [filename]
    for root, dirs, files in os.walk(dir2):
        print(root, dirs, files)
        for file in files:
            filename = os.path.join(root, file)
            ino = get_file_ino(filename)
            if ino in all_files:
                all_files[ino].append(filename)
            else:
                all_files[ino] = [filename]
    for ino, filenames in all_files.items():
        if len(filenames) > 1:
            print('硬链接文件：', filenames)
            print('硬链接inode：', ino)
            print('硬链接文件大小：', os.path.getsize(filenames[0]))
            print('硬链接文件MD5：', hashlib.md5(
                open(filenames[0], 'rb').read()).hexdigest())
            print()
