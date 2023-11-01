import os
import shutil
from tqdm import tqdm
import pathspec
import requests


remotePath = 'U:/appdata/mbot/plugins'
localPath = 'D:/workspace/mr-plugin/plugins'
needPushPlugins = ['file_manager', 'stupid_hard_link', 'webhooks']
restartUrl = 'http://192.168.31.198:1329/api/common/restart_app'

failed_files = []

# 设置文件大小阈值
SIZE_THRESHOLD = 1024 * 1024  # 1MB

# 常见的排除和包含文件模式
COMMON_EXCLUDES = ["**/__pycache__", ".gitignore", "**/frontend/"]
COMMON_INCLUDES = ["**/frontend/dist", ]


token = ''
with open('token.txt', 'r') as f:
    token = f.read()


def restartApp():
    """重启应用"""
    headers = {
        'Authorization': "Bearer " + token,
    }
    response = requests.request("GET", restartUrl, headers=headers)
    print(response.text)


def clear_directory(dir_path):
    """删除目录中的所有内容"""
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)  # 删除整个目录及其内容
    os.makedirs(dir_path)  # 重新创建目录


def copy_file_with_progress(src, plugin_dir, dest, total_pbar):
    """复制文件，并显示进度条"""
    total_size = os.path.getsize(src)
    chunk_size = 1024 * 1024
    relative_path = os.path.relpath(src, plugin_dir)
    truncated_path = relative_path[:80].ljust(80)

    if total_size < SIZE_THRESHOLD:
        try:
            shutil.copy2(src, dest)
            total_pbar.update(1)
        except Exception as e:
            failed_files.append((src, str(e)))
    else:
        with tqdm(total=total_size, unit='B', unit_scale=True, desc=truncated_path, leave=False) as file_pbar:
            try:
                with open(src, 'rb') as src_file, open(dest, 'wb') as dest_file:
                    while True:
                        data = src_file.read(chunk_size)
                        if not data:
                            break
                        dest_file.write(data)
                        file_pbar.update(len(data))
                total_pbar.update(1)
            except Exception as e:
                failed_files.append((src, str(e)))


def matches_pattern(patterns, file_path):
    """检查文件路径是否匹配给定的模式"""
    spec = pathspec.PathSpec.from_lines(
        pathspec.patterns.GitWildMatchPattern, patterns)
    return spec.match_file(file_path)


def filter_dirnames_and_filenames(dirpath, dirnames, filenames):
    """基于.gitignore和COMMON规则过滤目录和文件名"""
    gitignore_path = os.path.join(dirpath, '.gitignore')
    gitignore_patterns = []

    if os.path.exists(gitignore_path):
        with open(gitignore_path, 'r') as f:
            gitignore_patterns = f.read().splitlines()

    # 先根据COMMON_INCLUDES规则过滤
    included_dirs = [d for d in dirnames if matches_pattern(
        COMMON_INCLUDES, os.path.join(dirpath, d))]
    included_files = [f for f in filenames if matches_pattern(
        COMMON_INCLUDES, os.path.join(dirpath, f))]

    # 然后根据其他规则过滤
    dirnames[:] = included_dirs + [d for d in dirnames if not matches_pattern(gitignore_patterns, os.path.join(dirpath, d))
                                   and not matches_pattern(COMMON_EXCLUDES, os.path.join(dirpath, d))]
    filenames[:] = included_files + [f for f in filenames if not matches_pattern(gitignore_patterns, os.path.join(dirpath, f))
                                     and not matches_pattern(COMMON_EXCLUDES, os.path.join(dirpath, f))]

    # 移除重复项
    dirnames[:] = list(set(dirnames))
    filenames[:] = list(set(filenames))


def get_total_files(start_path):
    """获取总文件数"""
    total_files = 0
    for dirpath, dirnames, filenames in os.walk(start_path):
        filter_dirnames_and_filenames(dirpath, dirnames, filenames)

        total_files += len(filenames)
    return total_files


def pushPlugin():
    """推送插件"""
    total_files = sum(get_total_files(os.path.join(localPath, plugin))
                      for plugin in needPushPlugins)
    with tqdm(total=total_files, unit='files', desc="发布进度") as pbar:
        for plugin in needPushPlugins:
            src_plugin_dir = os.path.join(localPath, plugin)
            dest_plugin_dir = os.path.join(remotePath, plugin)

            if os.path.exists(dest_plugin_dir):
                clear_directory(dest_plugin_dir)

            os.makedirs(dest_plugin_dir, exist_ok=True)

            for dirpath, dirnames, filenames in os.walk(src_plugin_dir):
                filter_dirnames_and_filenames(dirpath, dirnames, filenames)

                for filename in filenames:
                    src_file_path = os.path.join(dirpath, filename)
                    relative_path = os.path.relpath(
                        src_file_path, src_plugin_dir)
                    dest_file_path = os.path.join(
                        dest_plugin_dir, relative_path)

                    os.makedirs(os.path.dirname(dest_file_path), exist_ok=True)
                    copy_file_with_progress(
                        src_file_path, src_plugin_dir, dest_file_path, pbar)

    if failed_files:
        print("\n以下文件复制失败:")
        for src, error in failed_files:
            print(f"{src}: {error}")
    else:
        print("\n所有文件复制成功!")
        # restartApp()


pushPlugin()
