from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

# 创建引擎连接到数据库（这里使用 SQLite）
engine = create_engine('sqlite:///data/db/file_info.db', connect_args={
    'check_same_thread': False, 'isolation_level': None})

# 创建一个基类
Base = declarative_base()


class DB:
    engine: None

    def __init__(self):
        self.engine = engine
        Base.metadata.create_all(self.engine, checkfirst=True)

    def get_session(self):
        return sessionmaker(bind=self.engine)()


# 定义 File 表模型 储存 stat 信息
class File(Base):
    __tablename__ = 'files'
    path = Column(String, primary_key=True)
    st_mode = Column(Integer)
    st_ino = Column(Integer)
    st_dev = Column(Integer)
    st_nlink = Column(Integer)
    st_uid = Column(Integer)
    st_gid = Column(Integer)
    st_size = Column(Integer)
    st_atime = Column(DateTime)
    st_mtime = Column(DateTime)
    st_ctime = Column(DateTime)
    filename = Column(String)
    hash_value = Column(String)


db = DB()


def get_file_session():
    return db.get_session()
