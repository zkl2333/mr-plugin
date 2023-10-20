import logging
import os

_LOGGER = logging.getLogger(__name__)


# 创建硬链接
def create_hard_link(source_path, target_path):
    try:
        if os.path.isfile(source_path):
            # 如果目标文件已存在则删除
            if os.path.exists(target_path):
                os.remove(target_path)
            os.link(source_path, target_path)
            _LOGGER.info("[无脑硬链接] 成功: %s -> %s" % (source_path, target_path))
        elif os.path.isdir(source_path):
            if not os.path.exists(target_path):
                os.makedirs(target_path)
            for item in os.listdir(source_path):
                create_hard_link(os.path.join(source_path, item),
                                 os.path.join(target_path, item))
    except Exception as e:
        _LOGGER.error("[无脑硬链接] 失败: %s -> %s, %s" %
                      (source_path, target_path, e))
