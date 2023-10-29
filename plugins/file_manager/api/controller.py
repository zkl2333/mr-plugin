import os
import logging
from cacheout import LRUCache
import time
from mbot.openapi import mbot_api
from mbot.external.downloadclient.multipledownloadclient import MultipleDownloadClient

_LOGGER = logging.getLogger(__name__)


class CacheManager:
    def __init__(self):
        # 创建两个缓存实例
        self.walk_cache = LRUCache(maxsize=50000, ttl=3000)  # 用于缓存os.walk结果
        self.stat_cache = LRUCache(maxsize=50000)  # 用于缓存文件状态信息

    # 使用缓存进行目录遍历
    def cached_walk(self, path):
        result = self.walk_cache.get(path, default=None)
        if result is None:
            result = list(os.walk(path))
            self.walk_cache.set(path, result)
        return result

    # 使用缓存获取文件状态信息
    def cached_stat(self, file_path):
        stat_result = self.stat_cache.get(file_path, default=None)
        if stat_result is None:
            stat_result = os.stat(file_path)
            self.stat_cache.set(file_path, stat_result)
        return stat_result


cache_manager = CacheManager()


def get_file_details(path):
    """
    根据指定路径，获取文件夹下的文件详情列表
    """
    file_list = []
    for file in os.scandir(path):
        try:
            file_stat = cache_manager.cached_stat(file.path)
            file_info = {
                'type': 'file' if file.is_file() else 'folder',
                'name': file.name,
                'path': file.path,
                'size': file_stat.st_size,
                'mtime': file_stat.st_mtime,
                'nlink': file_stat.st_nlink,
                'uid': file_stat.st_uid,
                'gid': file_stat.st_gid,
                'mode': file_stat.st_mode,
                'ino': str(file_stat.st_ino),
                'dev': file_stat.st_dev,
                'atime': file_stat.st_atime,
                'ctime': file_stat.st_ctime,
            }
            file_list.append(file_info)
        except OSError:
            _LOGGER.warning(f"无法获取{file.path}的详情")
            continue
    return file_list


def find_files_by_inodes(start_paths: list, target_inodes: list):
    start_time = time.time()
    inoMap = {}
    for start_path in start_paths:
        for root, _, files in cache_manager.cached_walk(start_path):
            for file_name in files:
                file_path = os.path.join(root, file_name)
                try:
                    inode = cache_manager.cached_stat(file_path).st_ino
                    if str(inode) in target_inodes:
                        inoMap.setdefault(str(inode), []).append(file_path)
                except OSError:
                    _LOGGER.warning(f"无法获取{file_path}的索引节点号")
                    continue

    _LOGGER.info(f'请求耗时 {time.time() - start_time} 秒.')
    return inoMap


def get_completed_torrents():
    """
    获取已完成下载的种子列表
    """
    completed_torrents = MultipleDownloadClient.get_completed_torrents()
    content_path_group = {}

    for hash, torrent in completed_torrents.items():
        content_path = torrent.content_path
        content_path_group.setdefault(content_path, {})[
            hash] = torrent.to_json()

    return content_path_group
