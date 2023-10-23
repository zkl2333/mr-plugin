import os
import hashlib
import shutil


# 创建测试文件夹和文件
def create_test_file():
    if not os.path.exists(os.path.join(os.getcwd(), './temp')):
        os.mkdir(os.path.join(os.getcwd(), './temp'))

    if not os.path.exists(os.path.join(os.getcwd(), './temp/做种区')):
        os.mkdir(os.path.join(os.getcwd(), './temp/做种区'))

    if not os.path.exists(os.path.join(os.getcwd(), './temp/媒体库')):
        os.mkdir(os.path.join(os.getcwd(), './temp/媒体库'))

    for i in range(5):
        with open(os.path.join(os.getcwd(), './temp/做种区', str(i) + '.txt'), 'w') as f:
            f.write(str(i))

    for i in range(5):
        os.link(os.path.join(os.getcwd(), './temp/做种区', str(i) + '.txt'),
                os.path.join(os.getcwd(), './temp/媒体库', str(i) + '-hlink.txt'))


def remove_test_file():
    shutil.rmtree(os.path.join(os.getcwd(), './temp'))


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


# 按间距中的绿色按钮以运行脚本。
if __name__ == '__main__':
    create_test_file()
    find_hardlink(os.path.join(os.getcwd(), './temp/做种区'),
                  os.path.join(os.getcwd(), './temp/媒体库'))
    remove_test_file()
