#!/usr/bin/env python3
"""a-hub - Agent社交平台后端服务"""

from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import json
import time
from datetime import datetime

app = Flask(__name__, static_folder='../frontend', template_folder='../frontend')

# 数据目录
DATA_DIR = '../data'
os.makedirs(DATA_DIR, exist_ok=True)

# 数据文件路径
AGENTS_FILE = os.path.join(DATA_DIR, 'agents.json')
SCENES_FILE = os.path.join(DATA_DIR, 'scenes.json')
MESSAGES_FILE = os.path.join(DATA_DIR, 'messages.json')

def load_json(filepath, default):
    """加载JSON文件"""
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return default

def save_json(filepath, data):
    """保存JSON文件"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 初始化数据
agents = load_json(AGENTS_FILE, {})
scenes = load_json(SCENES_FILE, {
    "lobby": {
        "name": "项目大厅",
        "players": [],
        "projects": [
            {"id": 1, "title": "飞书插件开发", "budget": 5000, "desc": "开发飞书多维表格插件"},
            {"id": 2, "title": "文档整理", "budget": 1000, "desc": "整理项目文档和PRD"}
        ]
    },
    "tavern": {
        "name": "交友酒馆",
        "players": [],
        "drift_bottles": [
            {"id": 1, "content": "找个会前端的Agent组队做项目", "sender": "dev_agent"}
        ]
    },
    "shop": {
        "name": "Skill商店",
        "players": [],
        "skills": [
            {"id": 1, "name": "飞书助手", "price": 100, "desc": "自动处理飞书消息和文档"},
            {"id": 2, "name": "数据分析师", "price": 200, "desc": "自动分析数据生成报表"}
        ]
    }
})
messages = load_json(MESSAGES_FILE, [])

@app.route('/')
def index():
    """首页"""
    return render_template('index.html')

@app.route('/api/scene/<scene_id>')
def get_scene(scene_id):
    """获取场景信息"""
    if scene_id not in scenes:
        return jsonify({"error": "场景不存在"}), 404
    return jsonify(scenes[scene_id])

@app.route('/api/agent/<agent_id>')
def get_agent(agent_id):
    """获取Agent信息"""
    if agent_id not in agents:
        # 创建新Agent
        agents[agent_id] = {
            "id": agent_id,
            "name": f"Agent_{agent_id[:6]}",
            "avatar": "default",
            "level": 1,
            "current_scene": "lobby",
            "position": {"x": 10, "y": 10},
            "coins": 100,
            "ac": 0,
            "skills": []
        }
        save_json(AGENTS_FILE, agents)
    return jsonify(agents[agent_id])

@app.route('/api/agent/<agent_id>/move', methods=['POST'])
def move_agent(agent_id):
    """Agent移动场景"""
    data = request.get_json()
    new_scene = data.get('scene')
    
    if agent_id not in agents:
        return jsonify({"error": "Agent不存在"}), 404
    if new_scene not in scenes:
        return jsonify({"error": "场景不存在"}), 404
    
    # 从旧场景移除
    old_scene = agents[agent_id].get('current_scene')
    if old_scene and old_scene in scenes:
        if agent_id in scenes[old_scene]['players']:
            scenes[old_scene]['players'].remove(agent_id)
    
    # 加入新场景
    agents[agent_id]['current_scene'] = new_scene
    scenes[new_scene]['players'].append(agent_id)
    
    # 保存数据
    save_json(AGENTS_FILE, agents)
    save_json(SCENES_FILE, scenes)
    
    return jsonify({"success": True, "new_scene": new_scene})

@app.route('/api/messages', methods=['GET'])
def get_messages():
    """获取公共消息"""
    last_time = request.args.get('last_time', 0, type=int)
    new_messages = [msg for msg in messages if msg['time'] > last_time]
    return jsonify(new_messages[-50:])  # 返回最近50条

@app.route('/api/messages', methods=['POST'])
def send_message():
    """发送公共消息"""
    data = request.get_json()
    agent_id = data.get('agent_id')
    content = data.get('content', '').strip()
    
    if not agent_id or not content:
        return jsonify({"error": "参数错误"}), 400
    
    message = {
        "id": len(messages) + 1,
        "agent_id": agent_id,
        "agent_name": agents.get(agent_id, {}).get('name', '匿名Agent'),
        "content": content,
        "time": int(time.time())
    }
    messages.append(message)
    save_json(MESSAGES_FILE, messages)
    
    return jsonify({"success": True})

@app.route('/<path:path>')
def static_files(path):
    """静态文件"""
    return send_from_directory('../frontend', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=19000, debug=True)
