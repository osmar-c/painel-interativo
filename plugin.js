/**
 * Plugin Refatorado para Múltiplas Instâncias
 * Este script utiliza uma abordagem baseada em classes para garantir que 
 * cada instância do plugin funcione de forma independente.
 */

class BlgAppPlugin {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.instanceId = containerId;
        this.options = options;
        this.currentTab = 'screenLogin';
        this.chatInterval = null;
        this.engagementPoints = parseInt(localStorage.getItem(`${this.instanceId}_points`) || '0');

        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.updateStatus('BLOQUEADO');
        this.renderFeed();
        this.updateEngagementUI();
    }

    render() {
        this.container.classList.add('blg-app-instance');
        this.container.innerHTML = `
            <div class="toast-notification">🔔 Ação realizada!</div>
            
            <div class="app-container">
                <div class="app-header">
                    <button class="back-btn">←</button>
                    <button class="menu-hamburger">
                        <span></span><span></span><span></span>
                    </button>
                    <div class="app-title">Autenticação do Sistema</div>
                    <div class="status-badge">BLOQUEADO</div>
                </div>

                <div class="sidebar-menu">
                    <a href="#" class="menu-item" data-tab="tabPostar">📝 Criar Postagem</a>
                    <a href="#" class="menu-item" data-tab="tabFeed">📜 Ver Feed/Mural</a>
                    <a href="#" class="menu-item" data-tab="tabChat">👥 Chat Anônimo</a>
                    <button class="btn btn-block btn-lock">🔒 Bloquear Painel</button>
                </div>

                <div class="app-content">
                    <!-- Login Screen -->
                    <div id="${this.instanceId}_screenLogin" class="screen active-screen">
                        <div style="text-align: center; margin-bottom: 20px; padding-top: 10px;">
                            <div class="fingerprint-icon">🔑</div>
                            <h3 style="margin: 15px 0 5px 0; color: #fff; font-size: 16px;">Segurança do Dispositivo</h3>
                            <p style="font-size: 11px; color: #aaa; margin: 0 15px; line-height: 1.4;">
                                Use o sistema para validar o acesso desta instância.
                            </p>
                        </div>
                        <button class="btn btn-primary btn-unlock">🔓 Desbloquear Acesso</button>
                    </div>

                    <!-- Post Tab -->
                    <div id="${this.instanceId}_tabPostar" class="screen">
                        <div class="retention-banner">
                            ✨ Você tem <span class="points-val">${this.engagementPoints}</span> pontos de engajamento!
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; font-size:12px; color:#aaa; margin-bottom:5px;">O que está pensando?</label>
                            <textarea class="post-input" style="width:100%; height:80px; background:#2a2a2a; border:1px solid #444; border-radius:8px; color:white; padding:10px; resize:none;"></textarea>
                        </div>
                        <button class="btn btn-primary btn-save-post">Publicar Post</button>
                        <div style="margin-top:20px; border-top:1px solid #333; padding-top:10px;">
                            <div class="mini-feed"></div>
                        </div>
                    </div>

                    <!-- Feed Tab -->
                    <div id="${this.instanceId}_tabFeed" class="screen">
                        <div class="full-feed"></div>
                    </div>

                    <!-- Chat Tab -->
                    <div id="${this.instanceId}_tabChat" class="screen">
                        <div class="chat-welcome" style="text-align:center; padding:20px;">
                            <span style="font-size:30px;">🕵️‍♂️</span>
                            <h4>Sala Anônima</h4>
                            <button class="btn btn-primary btn-start-chat">Procurar Membro</button>
                        </div>
                        <div class="chat-room-ui" style="display:none; flex-direction:column; height:300px;">
                            <div class="chat-messages-display"></div>
                            <div style="display:flex; border-top:1px solid #333;">
                                <input type="text" class="chat-input" placeholder="Mensagem..." style="flex:1; background:transparent; border:none; color:white; padding:10px;">
                                <button class="btn-send-chat" style="background:none; border:none; color:#ff4081; padding:10px;">🕊️</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const q = (selector) => this.container.querySelector(selector);

        q('.btn-unlock').onclick = () => this.unlock();
        q('.btn-lock').onclick = () => this.lock();
        q('.menu-hamburger').onclick = () => this.toggleSidebar();
        
        this.container.querySelectorAll('.menu-item').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                this.switchTab(item.getAttribute('data-tab'));
                this.toggleSidebar(false);
            };
        });

        q('.btn-save-post').onclick = () => this.savePost();
        q('.btn-start-chat').onclick = () => this.startChat();
        q('.btn-send-chat').onclick = () => this.sendChatMessage();
        q('.chat-input').onkeypress = (e) => { if(e.key === 'Enter') this.sendChatMessage(); };
    }

    // Lógica de UI
    showToast(msg) {
        const toast = this.container.querySelector('.toast-notification');
        toast.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }

    updateStatus(status) {
        const badge = this.container.querySelector('.status-badge');
        badge.innerText = status;
        badge.style.backgroundColor = status === 'ATIVO' ? '#00e676' : '#ff9800';
        
        const menuBtn = this.container.querySelector('.menu-hamburger');
        menuBtn.style.display = status === 'ATIVO' ? 'flex' : 'none';
    }

    toggleSidebar(show) {
        const sidebar = this.container.querySelector('.sidebar-menu');
        if (show === undefined) sidebar.classList.toggle('open');
        else show ? sidebar.classList.add('open') : sidebar.classList.remove('open');
    }

    switchTab(tabId) {
        this.container.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
        const target = this.container.querySelector(`#${this.instanceId}_${tabId}`);
        if (target) target.classList.add('active-screen');
        
        const titles = {
            'screenLogin': 'Autenticação',
            'tabPostar': 'Criar Publicação',
            'tabFeed': 'Mural de Posts',
            'tabChat': 'Chat Anônimo'
        };
        this.container.querySelector('.app-title').innerText = titles[tabId] || 'App';
        
        if (tabId === 'tabFeed') this.renderFeed();
    }

    // Funcionalidades
    unlock() {
        this.showToast("Acesso concedido!");
        this.updateStatus('ATIVO');
        this.switchTab('tabPostar');
        this.addEngagement(5);
    }

    lock() {
        this.updateStatus('BLOQUEADO');
        this.switchTab('screenLogin');
        this.toggleSidebar(false);
    }

    addEngagement(points) {
        this.engagementPoints += points;
        localStorage.setItem(`${this.instanceId}_points`, this.engagementPoints);
        this.updateEngagementUI();
    }

    updateEngagementUI() {
        const val = this.container.querySelector('.points-val');
        if (val) val.innerText = this.engagementPoints;
    }

    savePost() {
        const input = this.container.querySelector('.post-input');
        const text = input.value.trim();
        if (!text) return;

        const posts = JSON.parse(localStorage.getItem(`${this.instanceId}_posts`) || '[]');
        const newPost = {
            id: Date.now(),
            text: text,
            date: new Date().toLocaleTimeString(),
            author: 'Você'
        };
        posts.unshift(newPost);
        localStorage.setItem(`${this.instanceId}_posts`, JSON.stringify(posts));
        
        input.value = '';
        this.showToast("Postagem publicada!");
        this.addEngagement(10);
        this.renderFeed();
    }

    renderFeed() {
        const posts = JSON.parse(localStorage.getItem(`${this.instanceId}_posts`) || '[]');
        const miniFeed = this.container.querySelector('.mini-feed');
        const fullFeed = this.container.querySelector('.full-feed');
        
        const html = posts.map(p => `
            <div class="post-card">
                <div class="avatar-circle" style="background:#ff4081">V</div>
                <div class="post-main">
                    <div class="post-header">
                        <span class="post-author">${p.author}</span>
                        <span>🕒 ${p.date}</span>
                    </div>
                    <div class="post-body">${p.text}</div>
                </div>
            </div>
        `).join('');

        if (miniFeed) miniFeed.innerHTML = html.slice(0, 500); // Mostra apenas os recentes
        if (fullFeed) fullFeed.innerHTML = html || '<p style="text-align:center;color:#666;margin-top:20px;">Nenhum post ainda.</p>';
    }

    startChat() {
        this.container.querySelector('.chat-welcome').style.display = 'none';
        const room = this.container.querySelector('.chat-room-ui');
        room.style.display = 'flex';
        
        const display = room.querySelector('.chat-messages-display');
        display.innerHTML = '<div class="chat-msg msg-them" style="background:#333; align-self:center; font-size:11px;">🔒 Conectado anonimamente.</div>';
        
        if (this.chatInterval) clearInterval(this.chatInterval);
        this.chatInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                this.receiveChatMessage("Alguém por aí?");
            }
        }, 5000);
    }

    sendChatMessage() {
        const input = this.container.querySelector('.chat-input');
        const text = input.value.trim();
        if (!text) return;

        const display = this.container.querySelector('.chat-messages-display');
        display.innerHTML += `<div class="chat-msg msg-me">${text}</div>`;
        input.value = '';
        display.scrollTop = display.scrollHeight;
        this.addEngagement(2);
    }

    receiveChatMessage(text) {
        const display = this.container.querySelector('.chat-messages-display');
        if (display) {
            display.innerHTML += `<div class="chat-msg msg-them">${text}</div>`;
            display.scrollTop = display.scrollHeight;
        }
    }
}
