import os
import logging
from cacheout import LRUCache
import time
from mbot.openapi import mbot_api
from mbot.external.downloadclient.multipledownloadclient import MultipleDownloadClient
from mbot.external.downloadclient import DownloadClientInstance

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


def get_download_client():
    """
    获取下载器列表
    """
    return DownloadClientInstance.client_name_list


def get_torrents(downloder, hardlink):
    """
    筛选种子列表
    """
    client_list = None

    if (downloder):
        downloder = downloder.split(',')
        client_list = []
        for name in downloder:
            client_list.append(DownloadClientInstance.get(name))

    torrents = MultipleDownloadClient.get_torrents(client_list)
    content_path_group = {}
    if hardlink != 'all':
        if hardlink == 'include':
            torrents = list(filter(lambda torrent: has_hardlink(
                torrent.content_path), torrents))
        elif hardlink == 'exclude':
            torrents = list(filter(lambda torrent: not has_hardlink(
                torrent.content_path), torrents))

    _LOGGER.info(f'找到 {len(torrents)} 个种子')
    for torrent in torrents:
        content_path = torrent.content_path
        content_path_group.setdefault(content_path, {})[
            torrent.hash] = torrent.to_json()
    return content_path_group


def has_hardlink(content_path):
    """
    判断路径是否有硬链接
    """
    if os.path.isfile(content_path):
        file_stat = cache_manager.cached_stat(content_path)
        return file_stat.st_nlink > 1
    elif os.path.isdir(content_path):
        for root, dirs, files in cache_manager.cached_walk(content_path):
            if any(has_hardlink(os.path.join(root, d)) for d in dirs):
                return True
            if any(has_hardlink(os.path.join(root, f)) for f in files):
                return True
    return False


def delete_torrents(torrents):
    """
    删除种子
    """
    for hash in torrents:
        MultipleDownloadClient.delete_torrent_by_info_hash(hash)
        _LOGGER.info(f'删除种子 {hash} 成功')
    return True
