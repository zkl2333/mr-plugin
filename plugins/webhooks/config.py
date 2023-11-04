import logging
import yaml
import os


class IndentDumper(yaml.Dumper):
    def increase_indent(self, flow=False, indentless=False):
        return super(IndentDumper, self).increase_indent(flow, False)


# 获取当前文件的绝对路径，然后构建config.yml文件的路径
current_dir = os.path.dirname(os.path.abspath(__file__))
config_file_path = os.path.join(current_dir, '../../conf/webhooks.yml')


def getconfig(filename=config_file_path):
    if os.path.exists(filename):
        with open(filename, 'r') as file:
            return yaml.safe_load(file)
    else:
        default_config = []
        saveconfig(default_config)
        return default_config


def saveconfig(config_data, filename=config_file_path):
    with open(filename, 'w') as file:
        yaml.dump(config_data, file, default_flow_style=False,
                  allow_unicode=True, sort_keys=False, Dumper=IndentDumper)


def getWebhooksByEvent(event_name):
    '''根据事件类型获取webhooks'''
    allWebhooks = getconfig()
    webhooks = []
    for webhook in allWebhooks:
        if event_name in webhook.get('bindEvents', []):
            webhooks.append(webhook)
    return webhooks


def getAllWebhookEvents():
    '''获取所有webhook事件'''
    allWebhooks = getconfig()
    events = []
    for webhook in allWebhooks:
        events.extend(webhook.get('bindEvents', []))
    return list(set(events))
