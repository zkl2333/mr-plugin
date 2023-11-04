from flask import Blueprint, request
import requests
from mbot.register.controller_register import login_required
from mbot.common.flaskutils import api_result
from plugins.webhooks.config import getconfig, saveconfig


app = Blueprint('webhooks', __name__,
                static_folder='../frontend/dist', static_url_path='/frontend')


def request_parse(req_data):
    '''解析请求数据并以json形式返回'''
    if req_data.method == 'GET':
        return req_data.args
    elif req_data.method == 'POST':
        return req_data.get_json(force=True)


@app.route('/config', methods=['GET'])
@login_required()
def config():
    '''配置webhooks'''
    try:
        return api_result(0, 'success', getconfig())
    except Exception as e:
        return api_result(1, str(e))


@app.route('/config', methods=['POST'])
@login_required()
def config_post():
    '''保存webhooks配置'''
    data = request_parse(request)
    saveconfig(data)
    return api_result(0, 'success')


@app.route('/test', methods=['POST'])
@login_required()
def test():
    '''测试webhooks'''
    data = request_parse(request)
    url = data.get('url')
    if not url:
        return api_result(1, 'url不能为空')
    try:
        res = requests.post(url, json={
            "event": "test",
            "data": {
                "msg": "这是一条测试消息"
            }
        })
        return api_result(0, 'success', res.text)
    except Exception as e:
        return api_result(1, str(e))
