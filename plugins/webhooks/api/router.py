from flask import Blueprint, request
from mbot.register.controller_register import login_required
from mbot.common.flaskutils import api_result


app = Blueprint('webhooks', __name__,
                static_folder='../frontend/dist', static_url_path='/frontend')


def request_parse(req_data):
    '''解析请求数据并以json形式返回'''
    if req_data.method == 'GET':
        return req_data.args
    elif req_data.method == 'POST':
        return req_data.get_json(force=True)


@app.route('/update_webhook', methods=['POST'])
@login_required()
def addWebhook():
    return api_result(0, 'ok')
