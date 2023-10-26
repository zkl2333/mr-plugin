import os
from mbot.openapi import mbot_api
server = mbot_api


def ls(path):
    '''
    获取文件夹下文件详情列表  
    '''
    file_list = []
    for file in os.scandir(path):
        file_stat = file.stat()
        file_info = {
            'type': file.is_file() and 'file' or 'folder',
            'name': file.name,
            'path': file.path,
            'size': file_stat.st_size,
            'mtime': file_stat.st_mtime,
            'nlink': file_stat.st_nlink,
            'uid': file_stat.st_uid,
            'gid': file_stat.st_gid,
            'mode': file_stat.st_mode,
            'ino': file_stat.st_ino,
            'dev': file_stat.st_dev,
            'atime': file_stat.st_atime,
            'ctime': file_stat.st_ctime,
        }
        file_list.append(file_info)
    return file_list


def find_file_by_inode(start_path, target_inode):
    '''
    通过inode查找文件
    '''
    for root, dirs, files in os.walk(start_path):
        for file_name in files:
            file_path = os.path.join(root, file_name)
            try:
                # 获取文件的inode号码
                inode = os.stat(file_path).st_ino
                # 如果找到匹配的inode号码，返回文件路径
                if inode == target_inode:
                    return file_path
            except OSError:
                pass  # 忽略权限等问题导致的错误
    # 如果没有找到匹配的文件，返回None
    return None
