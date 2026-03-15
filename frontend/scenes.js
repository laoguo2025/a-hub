// a-hub 场景配置文件
const SCENES = {
    lobby: {
        id: 'lobby',
        name: '项目大厅',
        bgImage: '/static/office_bg.webp',
        spawnPoint: { x: 320, y: 240 },
        areas: {
            bulletin: { x: 100, y: 100, width: 80, height: 120, name: '公告板' },
            workstations: { x: 400, y: 200, width: 200, height: 150, name: '工位区' },
            meeting: { x: 150, y: 350, width: 120, height: 80, name: '会议室' },
            rest: { x: 600, y: 350, width: 100, height: 80, name: '休息区' }
        },
        music: 'lobby.mp3'
    },
    tavern: {
        id: 'tavern',
        name: '交友酒馆',
        bgImage: '/static/tavern_bg.webp',
        spawnPoint: { x: 400, y: 300 },
        areas: {
            bar: { x: 100, y: 150, width: 150, height: 80, name: '吧台' },
            tables: { x: 350, y: 180, width: 200, height: 120, name: '散座区' },
            stage: { x: 600, y: 120, width: 100, height: 80, name: '舞台' },
            bottles: { x: 650, y: 350, width: 80, height: 100, name: '漂流瓶墙' }
        },
        music: 'tavern.mp3'
    },
    shop: {
        id: 'shop',
        name: 'Skill商店',
        bgImage: '/static/shop_bg.webp',
        spawnPoint: { x: 320, y: 200 },
        areas: {
            office: { x: 100, y: 150, width: 120, height: 100, name: '办公技能店' },
            dev: { x: 280, y: 150, width: 120, height: 100, name: '开发工具店' },
            design: { x: 460, y: 150, width: 120, height: 100, name: '设计素材店' },
            market: { x: 320, y: 350, width: 200, height: 100, name: '摆摊区' }
        },
        music: 'shop.mp3'
    }
};

let currentScene = 'lobby';

function switchScene(sceneId) {
    if (!SCENES[sceneId]) return;
    
    currentScene = sceneId;
    const scene = SCENES[sceneId];
    
    // 切换背景
    document.getElementById('game-container').style.backgroundImage = `url(${scene.bgImage})`;
    
    // 移动角色到出生点
    if (window.player) {
        window.player.setPosition(scene.spawnPoint.x, scene.spawnPoint.y);
    }
    
    // 更新UI
    document.getElementById('scene-name').textContent = scene.name;
    
    // 显示场景切换提示
    showToast(`进入${scene.name}`);
    
    console.log(`切换到场景: ${scene.name}`);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: #00ff88;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        z-index: 1000;
        animation: slideDown 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
}

// 添加导航栏样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -100%); opacity: 0; }
    }
    .scene-nav {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(22, 33, 62, 0.95);
        border: 2px solid #0f3460;
        border-radius: 12px;
        padding: 8px;
        display: flex;
        gap: 8px;
        z-index: 999;
    }
    .scene-btn {
        background: #16213e;
        border: 2px solid #0f3460;
        color: #a8b2d1;
        padding: 10px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .scene-btn:hover {
        border-color: #00ff88;
        color: #00ff88;
        transform: translateY(-2px);
    }
    .scene-btn.active {
        background: #0f3460;
        border-color: #00ff88;
        color: #00ff88;
    }
    .scene-info {
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(22, 33, 62, 0.95);
        border: 2px solid #0f3460;
        border-radius: 8px;
        padding: 10px 16px;
        color: #fff;
        font-weight: bold;
        z-index: 999;
    }
`;
document.head.appendChild(style);

// 创建场景导航栏
function createSceneNav() {
    const nav = document.createElement('div');
    nav.className = 'scene-nav';
    
    const scenes = [
        { id: 'lobby', icon: '🏛️', name: '项目大厅' },
        { id: 'tavern', icon: '🍻', name: '交友酒馆' },
        { id: 'shop', icon: '🛒', name: 'Skill商店' }
    ];
    
    scenes.forEach(scene => {
        const btn = document.createElement('button');
        btn.className = 'scene-btn';
        btn.id = `btn-${scene.id}`;
        btn.innerHTML = `${scene.icon} ${scene.name}`;
        btn.onclick = () => {
            document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchScene(scene.id);
        };
        nav.appendChild(btn);
    });
    
    // 创建场景信息显示
    const info = document.createElement('div');
    info.className = 'scene-info';
    info.id = 'scene-name';
    info.textContent = '🏛️ 项目大厅';
    
    document.body.appendChild(nav);
    document.body.appendChild(info);
    
    // 默认选中大厅
    document.getElementById('btn-lobby').classList.add('active');
}

// 页面加载完成后创建导航
window.addEventListener('load', () => {
    createSceneNav();
});
