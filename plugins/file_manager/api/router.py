from flask import Blueprint
from mbot.register.controller_register import login_required

app = Blueprint('file_manager', __name__,
                static_folder='../frontend/dist', static_url_path='/')


@app.route('/')
@login_required()
def index():
    return app.send_static_file('index.html')


@app.route('/list_files')
@login_required()
def list_files():
    return 'list_files'
