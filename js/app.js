/**
 * 智能柜系统 - 核心应用框架
 * 提供通用交互功能、组件和工具函数
 */

// ==================== 全局配置 ====================
const AppConfig = {
    version: '1.0.0',
    apiBaseUrl: '/api',
    defaultPageSize: 10,
    animationDuration: 300,
    toastDuration: 3000,
    debug: true
};

// ==================== 工具函数 ====================
const Utils = {
    // 防抖函数
    debounce(fn, delay = 300) {
        let timer = null;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    // 节流函数
    throttle(fn, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 格式化日期
    formatDate(date, format = 'YYYY-MM-DD HH:mm') {
        const d = new Date(date);
        const pad = (n) => n.toString().padStart(2, '0');
        return format
            .replace('YYYY', d.getFullYear())
            .replace('MM', pad(d.getMonth() + 1))
            .replace('DD', pad(d.getDate()))
            .replace('HH', pad(d.getHours()))
            .replace('mm', pad(d.getMinutes()))
            .replace('ss', pad(d.getSeconds()));
    },

    // 生成唯一ID
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // 深拷贝
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // 表单序列化
    serializeForm(form) {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        });
        return data;
    },

    // 验证规则
    validators: {
        required: (value) => value && value.toString().trim() !== '',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        phone: (value) => /^1[3-9]\d{9}$/.test(value),
        number: (value) => !isNaN(value) && value !== '',
        minLength: (value, length) => value.length >= length,
        maxLength: (value, length) => value.length <= length
    }
};

// ==================== 消息提示系统 ====================
const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.innerHTML = `
                <style>
                    .toast-container {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 9999;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    .toast {
                        padding: 12px 20px;
                        border-radius: 8px;
                        color: #fff;
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        min-width: 200px;
                        animation: slideIn 0.3s ease;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255,255,255,0.1);
                    }
                    .toast.success { background: linear-gradient(135deg, rgba(0,255,136,0.9), rgba(0,200,100,0.9)); }
                    .toast.error { background: linear-gradient(135deg, rgba(255,68,68,0.9), rgba(200,50,50,0.9)); }
                    .toast.warning { background: linear-gradient(135deg, rgba(255,170,0,0.9), rgba(200,140,0,0.9)); }
                    .toast.info { background: linear-gradient(135deg, rgba(0,191,255,0.9), rgba(0,150,200,0.9)); }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                </style>
            `;
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = AppConfig.toastDuration) {
        this.init();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        toast.innerHTML = `
            <span style="font-size:16px;font-weight:bold;">${icons[type]}</span>
            <span>${message}</span>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error'); },
    warning(message) { this.show(message, 'warning'); },
    info(message) { this.show(message, 'info'); }
};

// ==================== 模态框系统 ====================
const Modal = {
    activeModal: null,

    open(options) {
        const { title, content, width = '500px', onConfirm, onCancel, onOpen, showCancel = true, confirmText = '确定', cancelText = '取消' } = options;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <style>
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                .modal-container {
                    background: linear-gradient(135deg, #1a1f3a, #0d1220);
                    border: 1px solid rgba(0,191,255,0.3);
                    border-radius: 12px;
                    width: ${width};
                    max-width: 90vw;
                    max-height: 90vh;
                    overflow: hidden;
                    animation: scaleIn 0.3s ease;
                    box-shadow: 0 0 40px rgba(0,191,255,0.2);
                }
                .modal-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(0,191,255,0.2);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #00bfff;
                }
                .modal-close {
                    background: none;
                    border: none;
                    color: #8892a0;
                    font-size: 24px;
                    cursor: pointer;
                    transition: color 0.3s;
                }
                .modal-close:hover { color: #fff; }
                .modal-body {
                    padding: 20px;
                    max-height: calc(90vh - 140px);
                    overflow-y: auto;
                }
                .modal-footer {
                    padding: 16px 20px;
                    border-top: 1px solid rgba(0,191,255,0.2);
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>
            <div class="modal-container">
                <div class="modal-header">
                    <span class="modal-title">${title}</span>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
                <div class="modal-footer">
                    ${showCancel ? `<button class="btn btn-secondary modal-btn-cancel">${cancelText}</button>` : ''}
                    <button class="btn btn-primary modal-btn-confirm">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.activeModal = modal;
        
        // 事件绑定
        modal.querySelector('.modal-close').onclick = () => this.close();
        if (showCancel) {
            modal.querySelector('.modal-btn-cancel').onclick = () => {
                if (onCancel) onCancel();
                this.close();
            };
        }
        modal.querySelector('.modal-btn-confirm').onclick = () => {
            if (onConfirm) {
                const result = onConfirm();
                // 如果 onConfirm 返回 false，则不关闭弹窗
                if (result !== false) {
                    this.close();
                }
            } else {
                this.close();
            }
        };
        modal.onclick = (e) => {
            if (e.target === modal) this.close();
        };
        
        // ESC关闭
        document.addEventListener('keydown', this.handleEsc);
        
        // 弹窗打开后的回调
        if (onOpen) {
            onOpen();
        }
    },

    close() {
        if (this.activeModal) {
            this.activeModal.remove();
            this.activeModal = null;
            document.removeEventListener('keydown', this.handleEsc);
        }
    },

    handleEsc(e) {
        if (e.key === 'Escape') Modal.close();
    },

    // 确认对话框
    confirm(message, onConfirm, onCancel) {
        this.open({
            title: '<i class="fas fa-question-circle" style="margin-right:8px;color:#00bfff;"></i>确认操作',
            content: `
                <div style="display:flex;align-items:center;gap:16px;padding:10px 0;">
                    <div style="width:48px;height:48px;border-radius:50%;background:rgba(0,191,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="fas fa-sign-out-alt" style="font-size:22px;color:#00bfff;"></i>
                    </div>
                    <p style="color:#e4e9f2;font-size:15px;line-height:1.6;margin:0;">${message}</p>
                </div>
            `,
            width: '420px',
            onConfirm,
            onCancel,
            confirmText: '确定退出',
            cancelText: '取消'
        });
    },

    // 表单对话框
    form(options) {
        const { title, fields, onSubmit, width = '500px' } = options;
        
        let formHtml = '<form class="modal-form">';
        fields.forEach(field => {
            formHtml += `
                <div class="form-group">
                    <label class="form-label">${field.label}${field.required ? '<span style="color:#ff4444;">*</span>' : ''}</label>
                    ${this.renderField(field)}
                </div>
            `;
        });
        formHtml += '</form>';
        
        this.open({
            title,
            content: formHtml,
            width,
            onConfirm: () => {
                const form = this.activeModal.querySelector('form');
                const data = Utils.serializeForm(form);
                if (onSubmit) onSubmit(data);
            }
        });
    },

    renderField(field) {
        const { type, name, value = '', placeholder = '', options = [] } = field;
        
        switch(type) {
            case 'textarea':
                return `<textarea name="${name}" class="form-textarea" placeholder="${placeholder}">${value}</textarea>`;
            case 'select':
                return `
                    <select name="${name}" class="form-select">
                        ${options.map(opt => `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                    </select>
                `;
            default:
                return `<input type="${type}" name="${name}" class="form-input" value="${value}" placeholder="${placeholder}">`;
        }
    },

    // 新增供应商弹窗
    addSupplier() {
        const content = `
            <div class="supplier-form-modal">
                <style>
                    .supplier-form-modal { padding: 0; }
                    .supplier-form-modal .form-section { margin-bottom: 20px; }
                    .supplier-form-modal .section-title { 
                        font-size: 14px; 
                        font-weight: 600; 
                        color: #00bfff; 
                        margin-bottom: 16px; 
                        padding-left: 12px; 
                        border-left: 3px solid #00bfff;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .supplier-form-modal .form-row { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 16px; 
                        margin-bottom: 16px; 
                    }
                    .supplier-form-modal .form-group { margin-bottom: 0; }
                    .supplier-form-modal .form-group label { 
                        display: block; 
                        font-size: 13px; 
                        color: #8892a0; 
                        margin-bottom: 6px; 
                    }
                    .supplier-form-modal .form-group label .required { color: #ff4444; margin-left: 4px; }
                    .supplier-form-modal .form-group input,
                    .supplier-form-modal .form-group select { 
                        width: 100%; 
                        height: 40px;
                        padding: 10px 12px; 
                        background: rgba(0,0,0,0.3); 
                        border: 1px solid rgba(0,191,255,0.2); 
                        border-radius: 6px; 
                        color: #e4e9f2; 
                        font-size: 14px;
                        box-sizing: border-box;
                        transition: all 0.3s;
                    }
                    .supplier-form-modal .form-group input:focus,
                    .supplier-form-modal .form-group select:focus { 
                        outline: none; 
                        border-color: #00bfff; 
                        box-shadow: 0 0 15px rgba(0,191,255,0.3);
                    }
                    .supplier-form-modal .form-group input::placeholder { color: #5a6270; }
                    .supplier-form-modal .form-group select {
                        appearance: none;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2300bfff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
                        background-position: right 0.5rem center;
                        background-repeat: no-repeat;
                        background-size: 1.5em 1.5em;
                        padding-right: 2.5rem;
                        cursor: pointer;
                    }
                    .supplier-form-modal .form-group select option {
                        background: #1a1f3a;
                        color: #e4e9f2;
                    }
                    .supplier-form-modal .form-group.full-width { grid-column: span 2; }
                    .supplier-form-modal .form-group.full-width input { width: 100%; }
                    .supplier-form-modal .upload-area {
                        border: 2px dashed rgba(0,191,255,0.3);
                        border-radius: 8px;
                        padding: 24px;
                        text-align: center;
                        background: rgba(0,191,255,0.05);
                        transition: all 0.3s;
                        cursor: pointer;
                    }
                    .supplier-form-modal .upload-area:hover {
                        border-color: #00bfff;
                        background: rgba(0,191,255,0.1);
                    }
                    .supplier-form-modal .upload-area i {
                        font-size: 32px;
                        color: #00bfff;
                        margin-bottom: 8px;
                    }
                    .supplier-form-modal .upload-area p {
                        color: #8892a0;
                        font-size: 13px;
                        margin: 0;
                    }
                    .supplier-form-modal .upload-area .upload-hint {
                        color: #5a6270;
                        font-size: 12px;
                        margin-top: 4px;
                    }
                </style>
                
                <!-- 基本信息 -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="fas fa-info-circle"></i> 基本信息
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>供应商名称 <span class="required">*</span></label>
                            <input type="text" id="supplier-name" placeholder="请输入供应商名称">
                        </div>
                        <div class="form-group">
                            <label>供应商编码 <span class="required">*</span></label>
                            <input type="text" id="supplier-code" placeholder="系统自动生成" disabled style="background: rgba(255,255,255,0.05); color: #5a6270;">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>供应商类型 <span class="required">*</span></label>
                            <select id="supplier-type">
                                <option value="">请选择类型</option>
                                <option value="manufacturer">生产厂家</option>
                                <option value="distributor">经销商</option>
                                <option value="agent">代理商</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>合作状态 <span class="required">*</span></label>
                            <select id="supplier-status">
                                <option value="active">合作中</option>
                                <option value="pending">待审核</option>
                                <option value="suspended">已暂停</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- 联系信息 -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="fas fa-address-card"></i> 联系信息
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>联系人 <span class="required">*</span></label>
                            <input type="text" id="contact-name" placeholder="请输入联系人姓名">
                        </div>
                        <div class="form-group">
                            <label>联系电话 <span class="required">*</span></label>
                            <input type="tel" id="contact-phone" placeholder="请输入联系电话">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>电子邮箱</label>
                            <input type="email" id="contact-email" placeholder="请输入电子邮箱">
                        </div>
                        <div class="form-group">
                            <label>传真号码</label>
                            <input type="tel" id="contact-fax" placeholder="请输入传真号码">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label>详细地址</label>
                            <input type="text" id="contact-address" placeholder="请输入详细地址">
                        </div>
                    </div>
                </div>
                
                <!-- 资质信息 -->
                <div class="form-section" style="margin-bottom: 0;">
                    <div class="section-title">
                        <i class="fas fa-certificate"></i> 资质信息
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>营业执照编号</label>
                            <input type="text" id="license-no" placeholder="请输入营业执照编号">
                        </div>
                        <div class="form-group">
                            <label>医疗器械经营许可证</label>
                            <input type="text" id="medical-license" placeholder="请输入许可证编号">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label>资质文件上传</label>
                            <div class="upload-area" onclick="document.getElementById('qualification-file').click()">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>点击或拖拽文件到此处上传</p>
                                <p class="upload-hint">支持 PDF、JPG、PNG 格式，单个文件不超过 10MB</p>
                            </div>
                            <input type="file" id="qualification-file" style="display: none;" accept=".pdf,.jpg,.jpeg,.png">
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-plus-circle" style="margin-right:8px;color:#00bfff;"></i>新增供应商',
            content: content,
            width: '650px',
            onConfirm: () => {
                // 表单验证
                const name = document.getElementById('supplier-name').value.trim();
                const type = document.getElementById('supplier-type').value;
                const contactName = document.getElementById('contact-name').value.trim();
                const contactPhone = document.getElementById('contact-phone').value.trim();
                
                if (!name) {
                    Toast.error('请输入供应商名称');
                    return false;
                }
                if (!type) {
                    Toast.error('请选择供应商类型');
                    return false;
                }
                if (!contactName) {
                    Toast.error('请输入联系人姓名');
                    return false;
                }
                if (!contactPhone) {
                    Toast.error('请输入联系电话');
                    return false;
                }
                
                // 生成供应商编码
                const code = 'SUP' + String(Date.now()).slice(-6);
                
                // 模拟保存成功
                Toast.success('供应商新增成功！编码：' + code);
                
                // 这里可以添加实际的保存逻辑，如 AJAX 请求
                console.log('新增供应商:', {
                    code,
                    name,
                    type,
                    contactName,
                    contactPhone
                });
            },
            onCancel: () => {},
            confirmText: '保存',
            cancelText: '取消'
        });
    },

    // 个人设置弹窗
    personalSettings() {
        const content = `
            <div class="personal-settings-modal" id="personal-settings-modal">
                <style>
                    .personal-settings-modal { padding: 0; }
                    .settings-tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid rgba(0,191,255,0.2); padding-bottom: 12px; }
                    .settings-tab { 
                        padding: 8px 16px; 
                        background: transparent; 
                        border: none; 
                        border-radius: 6px; 
                        color: #8892a0; 
                        font-size: 14px; 
                        cursor: pointer; 
                        transition: all 0.3s;
                    }
                    .settings-tab:hover { background: rgba(0,191,255,0.1); color: #e4e9f2; }
                    .settings-tab.active { background: #00bfff; color: #fff; }
                    .settings-panel { display: none; }
                    .settings-panel.active { display: block; }
                    .profile-section { display: flex; gap: 24px; margin-bottom: 20px; }
                    .profile-avatar { text-align: center; }
                    .profile-avatar img { width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(0,191,255,0.3); margin-bottom: 12px; }
                    .profile-avatar .btn-sm { padding: 6px 12px; font-size: 12px; }
                    .profile-form { flex: 1; }
                    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                    .form-group label { display: block; font-size: 13px; color: #8892a0; margin-bottom: 6px; }
                    .form-group input { 
                        width: 100%; 
                        height: 40px;
                        padding: 10px 12px; 
                        background: rgba(0,0,0,0.3); 
                        border: 1px solid rgba(0,191,255,0.2); 
                        border-radius: 6px; 
                        color: #e4e9f2; 
                        font-size: 14px;
                        box-sizing: border-box;
                    }
                    .form-group input:focus { outline: none; border-color: #00bfff; }
                    .form-group input:disabled { background: rgba(255,255,255,0.05); color: #8892a0; }
                    .password-form { max-width: 100%; padding: 10px 0; }
                    .password-form .form-group { margin-bottom: 20px; }
                    .password-form .form-group:last-child { margin-bottom: 0; }
                    .input-with-icon { position: relative; }
                    .input-with-icon input { padding-right: 40px; }
                    .toggle-password { 
                        position: absolute; 
                        right: 10px; 
                        top: 50%; 
                        transform: translateY(-50%); 
                        background: none; 
                        border: none; 
                        color: #8892a0; 
                        cursor: pointer;
                        padding: 5px;
                        font-size: 14px;
                        transition: all 0.3s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 28px;
                        height: 28px;
                        border-radius: 4px;
                    }
                    .toggle-password:hover { 
                        color: #00bfff; 
                        background: rgba(0,191,255,0.1);
                    }
                    .password-strength { margin-top: 8px; }
                    .strength-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
                    .strength-fill { height: 100%; width: 0; transition: all 0.3s; }
                    .strength-fill.weak { width: 33%; background: linear-gradient(90deg, #ff4444, #ff6666); box-shadow: 0 0 8px rgba(255,68,68,0.5); }
                    .strength-fill.medium { width: 66%; background: linear-gradient(90deg, #ffaa00, #ffcc00); box-shadow: 0 0 8px rgba(255,170,0,0.5); }
                    .strength-fill.strong { width: 100%; background: linear-gradient(90deg, #00cc66, #00ff88); box-shadow: 0 0 8px rgba(0,204,102,0.5); }
                    .strength-text { font-size: 12px; color: #8892a0; margin-top: 6px; display: block; }
                    .strength-text.weak { color: #ff4444; }
                    .strength-text.medium { color: #ffaa00; }
                    .strength-text.strong { color: #00cc66; }
                    .password-match { font-size: 12px; margin-top: 6px; min-height: 18px; display: flex; align-items: center; gap: 4px; }
                    .password-match.match { color: #00cc66; }
                    .password-match.mismatch { color: #ff4444; }
                    .required { color: #ff4444; }
                    .password-tips {
                        background: rgba(0,191,255,0.05);
                        border: 1px solid rgba(0,191,255,0.15);
                        border-radius: 6px;
                        padding: 12px 16px;
                        margin-bottom: 20px;
                    }
                    .password-tips-title {
                        font-size: 12px;
                        color: #00bfff;
                        margin-bottom: 8px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .password-tips-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        font-size: 11px;
                        color: #8892a0;
                    }
                    .password-tips-list li {
                        padding: 3px 0;
                        padding-left: 16px;
                        position: relative;
                    }
                    .password-tips-list li::before {
                        content: '•';
                        position: absolute;
                        left: 6px;
                        color: #00bfff;
                    }
                </style>
                
                <div class="settings-tabs">
                    <button class="settings-tab active" data-tab="profile">
                        <i class="fas fa-user"></i> 基本信息
                    </button>
                    <button class="settings-tab" data-tab="password">
                        <i class="fas fa-lock"></i> 修改密码
                    </button>
                </div>
                
                <!-- 基本信息面板 -->
                <div class="settings-panel active" id="profile-panel">
                    <div class="profile-section">
                        <div class="profile-avatar">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff&size=128" alt="头像">
                            <button class="btn btn-secondary btn-sm">
                                <i class="fas fa-camera"></i> 更换头像
                            </button>
                        </div>
                        <div class="profile-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>用户账号</label>
                                    <input type="text" value="admin" disabled>
                                </div>
                                <div class="form-group">
                                    <label>姓名</label>
                                    <input type="text" value="系统管理员" id="profile-name">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>所属科室</label>
                                    <input type="text" value="信息科" id="profile-dept">
                                </div>
                                <div class="form-group">
                                    <label>角色</label>
                                    <input type="text" value="超级管理员" disabled>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>联系电话</label>
                                    <input type="tel" value="13800138000" id="profile-phone">
                                </div>
                                <div class="form-group">
                                    <label>邮箱</label>
                                    <input type="email" value="admin@hospital.com" id="profile-email">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 修改密码面板 -->
                <div class="settings-panel" id="password-panel">
                    <form class="password-form" id="modal-password-form">
                        <!-- 密码要求提示 -->
                        <div class="password-tips">
                            <div class="password-tips-title">
                                <i class="fas fa-shield-alt"></i> 密码安全要求
                            </div>
                            <ul class="password-tips-list">
                                <li>密码长度 6-20 个字符</li>
                                <li>建议包含大小写字母、数字和特殊符号</li>
                                <li>请勿使用与账号相同的密码</li>
                            </ul>
                        </div>
                        
                        <div class="form-group">
                            <label>当前密码 <span class="required">*</span></label>
                            <div class="input-with-icon">
                                <input type="password" id="modal-current-pwd" placeholder="请输入当前密码" required>
                                <button type="button" class="toggle-password" data-target="modal-current-pwd">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>新密码 <span class="required">*</span></label>
                            <div class="input-with-icon">
                                <input type="password" id="modal-new-pwd" placeholder="请输入新密码（6-20位）" required>
                                <button type="button" class="toggle-password" data-target="modal-new-pwd">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="password-strength">
                                <div class="strength-bar">
                                    <div class="strength-fill" id="modal-strength-fill"></div>
                                </div>
                                <span class="strength-text" id="modal-strength-text">密码强度：请输入密码</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>确认新密码 <span class="required">*</span></label>
                            <div class="input-with-icon">
                                <input type="password" id="modal-confirm-pwd" placeholder="请再次输入新密码" required>
                                <button type="button" class="toggle-password" data-target="modal-confirm-pwd">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="password-match" id="modal-pwd-match"></div>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-user-cog" style="margin-right:8px;color:#00bfff;"></i>个人设置',
            content: content,
            width: '600px',
            onOpen: () => {
                // 弹窗打开后绑定事件
                const modal = document.getElementById('personal-settings-modal');
                if (!modal) return;
                
                // 标签切换事件绑定
                modal.querySelectorAll('.settings-tab').forEach(tab => {
                    tab.addEventListener('click', function() {
                        const targetTab = this.dataset.tab;
                        
                        // 切换标签样式
                        modal.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                        this.classList.add('active');
                        
                        // 切换面板
                        modal.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
                        const panel = modal.querySelector('#' + targetTab + '-panel');
                        if (panel) panel.classList.add('active');
                    });
                });
                
                // 密码可见性切换事件绑定
                modal.querySelectorAll('.toggle-password').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const targetId = this.dataset.target;
                        const input = document.getElementById(targetId);
                        const icon = this.querySelector('i');
                        if (input.type === 'password') {
                            input.type = 'text';
                            icon.classList.remove('fa-eye');
                            icon.classList.add('fa-eye-slash');
                        } else {
                            input.type = 'password';
                            icon.classList.remove('fa-eye-slash');
                            icon.classList.add('fa-eye');
                        }
                    });
                });
                
                // 密码强度检测
                const newPwdInput = document.getElementById('modal-new-pwd');
                const confirmPwdInput = document.getElementById('modal-confirm-pwd');
                
                function checkModalPwdMatch() {
                    const newPwd = document.getElementById('modal-new-pwd').value;
                    const confirmPwd = document.getElementById('modal-confirm-pwd').value;
                    const matchDiv = document.getElementById('modal-pwd-match');
                    
                    if (confirmPwd.length === 0) {
                        matchDiv.textContent = '';
                        matchDiv.className = 'password-match';
                    } else if (newPwd === confirmPwd) {
                        matchDiv.textContent = '✓ 密码一致';
                        matchDiv.className = 'password-match match';
                    } else {
                        matchDiv.textContent = '✗ 密码不一致';
                        matchDiv.className = 'password-match mismatch';
                    }
                }
                
                if (newPwdInput) {
                    newPwdInput.addEventListener('input', function() {
                        const pwd = this.value;
                        let strength = 0;
                        if (pwd.length >= 6) strength++;
                        if (pwd.length >= 10) strength++;
                        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
                        if (/\d/.test(pwd)) strength++;
                        if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
                        
                        const fill = document.getElementById('modal-strength-fill');
                        const text = document.getElementById('modal-strength-text');
                        fill.classList.remove('weak', 'medium', 'strong');
                        text.classList.remove('weak', 'medium', 'strong');
                        
                        if (pwd.length === 0) {
                            fill.style.width = '0';
                            text.textContent = '密码强度：请输入密码';
                        } else if (strength <= 2) {
                            fill.classList.add('weak');
                            text.classList.add('weak');
                            text.textContent = '密码强度：弱 - 建议增加复杂度';
                        } else if (strength <= 4) {
                            fill.classList.add('medium');
                            text.classList.add('medium');
                            text.textContent = '密码强度：中 - 还可以更安全';
                        } else {
                            fill.classList.add('strong');
                            text.classList.add('strong');
                            text.textContent = '密码强度：强 - 非常安全';
                        }
                        checkModalPwdMatch();
                    });
                }
                
                if (confirmPwdInput) {
                    confirmPwdInput.addEventListener('input', checkModalPwdMatch);
                }
            },
            onConfirm: () => {
                // 判断当前激活的标签页
                const activePanel = document.querySelector('.settings-panel.active');
                if (!activePanel) {
                    Toast.error('页面加载异常，请重试');
                    return false;
                }
                if (activePanel.id === 'profile-panel') {
                    // 保存基本信息
                    Toast.success('个人信息保存成功！');
                } else {
                    // 修改密码验证
                    const currentPwd = document.getElementById('modal-current-pwd').value;
                    const newPwd = document.getElementById('modal-new-pwd').value;
                    const confirmPwd = document.getElementById('modal-confirm-pwd').value;
                    
                    if (!currentPwd || !newPwd || !confirmPwd) {
                        Toast.error('请填写所有必填项');
                        return false; // 阻止关闭
                    }
                    if (newPwd.length < 6) {
                        Toast.error('新密码长度不能少于6位');
                        return false;
                    }
                    if (newPwd !== confirmPwd) {
                        Toast.error('两次输入的新密码不一致');
                        return false;
                    }
                    Toast.success('密码修改成功！请使用新密码重新登录。');
                }
            },
            onCancel: () => {},
            confirmText: '保存',
            cancelText: '取消'
        });
    },

    // 新增部门弹窗
    addDepartment() {
        const content = `
            <div class="department-form-modal" id="department-form-modal">
                <style>
                    .department-form-modal { padding: 0; }
                    .department-form-modal .form-section { margin-bottom: 20px; }
                    .department-form-modal .section-title { 
                        font-size: 14px; 
                        font-weight: 600; 
                        color: #00bfff; 
                        margin-bottom: 16px; 
                        padding-left: 12px; 
                        border-left: 3px solid #00bfff;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .department-form-modal .form-row { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 16px; 
                        margin-bottom: 16px; 
                    }
                    .department-form-modal .form-group { margin-bottom: 0; }
                    .department-form-modal .form-group label { 
                        display: block; 
                        font-size: 13px; 
                        color: #8892a0; 
                        margin-bottom: 6px; 
                    }
                    .department-form-modal .form-group label .required { color: #ff4444; margin-left: 4px; }
                    .department-form-modal .form-group input,
                    .department-form-modal .form-group select { 
                        width: 100%; 
                        height: 40px;
                        padding: 10px 12px; 
                        background: rgba(0,0,0,0.3); 
                        border: 1px solid rgba(0,191,255,0.2); 
                        border-radius: 6px; 
                        color: #e4e9f2; 
                        font-size: 14px;
                        box-sizing: border-box;
                        transition: all 0.3s;
                    }
                    .department-form-modal .form-group input:focus,
                    .department-form-modal .form-group select:focus { 
                        outline: none; 
                        border-color: #00bfff; 
                        box-shadow: 0 0 15px rgba(0,191,255,0.3);
                    }
                    .department-form-modal .form-group input::placeholder { color: #5a6270; }
                    .department-form-modal .form-group select {
                        appearance: none;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2300bfff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
                        background-position: right 0.5rem center;
                        background-repeat: no-repeat;
                        background-size: 1.5em 1.5em;
                        padding-right: 2.5rem;
                        cursor: pointer;
                    }
                    .department-form-modal .form-group select option {
                        background: #1a1f3a;
                        color: #e4e9f2;
                    }
                    .department-form-modal .form-group.full-width { grid-column: span 2; }
                    .department-form-modal .icon-selector {
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                    }
                    .department-form-modal .icon-option {
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(0,0,0,0.3);
                        border: 2px solid rgba(0,191,255,0.2);
                        border-radius: 8px;
                        color: #8892a0;
                        cursor: pointer;
                        transition: all 0.3s;
                    }
                    .department-form-modal .icon-option:hover {
                        border-color: rgba(0,191,255,0.5);
                        color: #e4e9f2;
                    }
                    .department-form-modal .icon-option.selected {
                        background: rgba(0,191,255,0.2);
                        border-color: #00bfff;
                        color: #00bfff;
                    }
                    .department-form-modal .tips-box {
                        background: rgba(0,191,255,0.05);
                        border: 1px solid rgba(0,191,255,0.15);
                        border-radius: 6px;
                        padding: 12px 16px;
                    }
                    .department-form-modal .tips-title {
                        font-size: 12px;
                        color: #00bfff;
                        margin-bottom: 8px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .department-form-modal .tips-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        font-size: 11px;
                        color: #8892a0;
                    }
                    .department-form-modal .tips-list li {
                        padding: 3px 0;
                        padding-left: 16px;
                        position: relative;
                    }
                    .department-form-modal .tips-list li::before {
                        content: '•';
                        position: absolute;
                        left: 6px;
                        color: #00bfff;
                    }
                </style>
                
                <!-- 基本信息 -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="fas fa-info-circle"></i> 基本信息
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>部门名称 <span class="required">*</span></label>
                            <input type="text" id="dept-name" placeholder="请输入部门名称">
                        </div>
                        <div class="form-group">
                            <label>部门编码 <span class="required">*</span></label>
                            <input type="text" id="dept-code" placeholder="系统自动生成" disabled style="background: rgba(255,255,255,0.05); color: #5a6270;">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>部门类型 <span class="required">*</span></label>
                            <select id="dept-type">
                                <option value="">请选择类型</option>
                                <option value="medical">医疗机构</option>
                                <option value="clinical">临床科室</option>
                                <option value="medical-tech">医技科室</option>
                                <option value="admin">行政科室</option>
                                <option value="pharmacy">药房/药库</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>上级部门 <span class="required">*</span></label>
                            <select id="dept-parent">
                                <option value="">请选择上级部门</option>
                                <option value="hospital">XX医院</option>
                                <option value="surgery">手术室</option>
                                <option value="emergency">急诊科</option>
                                <option value="inpatient">住院部</option>
                                <option value="pharmacy">药库</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label>部门图标</label>
                            <div class="icon-selector" id="dept-icon-selector">
                                <div class="icon-option selected" data-icon="hospital"><i class="fas fa-hospital"></i></div>
                                <div class="icon-option" data-icon="procedures"><i class="fas fa-procedures"></i></div>
                                <div class="icon-option" data-icon="heartbeat"><i class="fas fa-heartbeat"></i></div>
                                <div class="icon-option" data-icon="bed"><i class="fas fa-bed"></i></div>
                                <div class="icon-option" data-icon="warehouse"><i class="fas fa-warehouse"></i></div>
                                <div class="icon-option" data-icon="user-md"><i class="fas fa-user-md"></i></div>
                                <div class="icon-option" data-icon="stethoscope"><i class="fas fa-stethoscope"></i></div>
                                <div class="icon-option" data-icon="pills"><i class="fas fa-pills"></i></div>
                                <div class="icon-option" data-icon="syringe"><i class="fas fa-syringe"></i></div>
                                <div class="icon-option" data-icon="building"><i class="fas fa-building"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 负责人信息 -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="fas fa-user-tie"></i> 负责人信息
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>负责人姓名 <span class="required">*</span></label>
                            <input type="text" id="dept-manager" placeholder="请输入负责人姓名">
                        </div>
                        <div class="form-group">
                            <label>联系电话</label>
                            <input type="tel" id="dept-phone" placeholder="请输入联系电话">
                        </div>
                    </div>
                </div>
                
                <!-- 提示信息 -->
                <div class="tips-box">
                    <div class="tips-title">
                        <i class="fas fa-lightbulb"></i> 操作提示
                    </div>
                    <ul class="tips-list">
                        <li>部门名称、类型、上级部门、负责人为必填项</li>
                        <li>部门编码由系统自动生成，不可修改</li>
                        <li>请根据部门职能选择合适的部门图标</li>
                        <li>新增部门后，可在用户权限管理中为该部门分配用户</li>
                    </ul>
                </div>
            </div>
        `;
        
        let selectedIcon = 'hospital';
        
        this.open({
            title: '<i class="fas fa-plus-circle" style="margin-right:8px;color:#00bfff;"></i>新增部门',
            content: content,
            width: '600px',
            onOpen: () => {
                // 图标选择事件绑定
                const iconSelector = document.getElementById('dept-icon-selector');
                if (iconSelector) {
                    iconSelector.querySelectorAll('.icon-option').forEach(option => {
                        option.addEventListener('click', function() {
                            iconSelector.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
                            this.classList.add('selected');
                            selectedIcon = this.dataset.icon;
                        });
                    });
                }
                
                // 自动生成部门编码
                const deptTypeSelect = document.getElementById('dept-type');
                const deptCodeInput = document.getElementById('dept-code');
                if (deptTypeSelect && deptCodeInput) {
                    deptTypeSelect.addEventListener('change', function() {
                        const typeMap = {
                            'medical': 'MED',
                            'clinical': 'CLI',
                            'medical-tech': 'TEC',
                            'admin': 'ADM',
                            'pharmacy': 'PHA'
                        };
                        const prefix = typeMap[this.value] || 'DEP';
                        const timestamp = Date.now().toString().slice(-6);
                        deptCodeInput.value = prefix + timestamp;
                    });
                }
            },
            onConfirm: () => {
                // 表单验证
                const name = document.getElementById('dept-name').value.trim();
                const type = document.getElementById('dept-type').value;
                const parent = document.getElementById('dept-parent').value;
                const manager = document.getElementById('dept-manager').value.trim();
                const code = document.getElementById('dept-code').value;
                
                if (!name) {
                    Toast.error('请输入部门名称');
                    return false;
                }
                if (!type) {
                    Toast.error('请选择部门类型');
                    return false;
                }
                if (!parent) {
                    Toast.error('请选择上级部门');
                    return false;
                }
                if (!manager) {
                    Toast.error('请输入负责人姓名');
                    return false;
                }
                
                // 模拟保存成功
                Toast.success('部门新增成功！编码：' + (code || '自动生成'));
                
                // 这里可以添加实际的保存逻辑，如 AJAX 请求
                console.log('新增部门:', {
                    name,
                    code,
                    type,
                    parent,
                    manager,
                    phone: document.getElementById('dept-phone').value,
                    icon: selectedIcon
                });
            },
            onCancel: () => {},
            confirmText: '保存',
            cancelText: '取消'
        });
    },

    // 查看全部智能柜弹窗
    viewAllCabinets() {
        const cabinets = [
            { name: '手术室-01号柜', location: '3号楼 2层 手术室A区', status: 'online', stock: 1250, sku: 45, warning: 3, usage: 78 },
            { name: '急诊科-01号柜', location: '1号楼 1层 急诊大厅', status: 'online', stock: 980, sku: 38, warning: 5, usage: 65 },
            { name: 'ICU-01号柜', location: '2号楼 5层 ICU病区', status: 'online', stock: 1580, sku: 52, warning: 0, usage: 82 },
            { name: '药房-02号柜', location: '1号楼 1层 中心药房', status: 'offline', stock: 2150, sku: 68, warning: 8, usage: 91 },
            { name: '手术室-02号柜', location: '3号楼 2层 手术室B区', status: 'online', stock: 890, sku: 32, warning: 2, usage: 58 },
            { name: '急诊科-02号柜', location: '1号楼 2层 急诊留观区', status: 'online', stock: 720, sku: 28, warning: 4, usage: 62 },
            { name: 'ICU-02号柜', location: '2号楼 5层 ICU病区', status: 'online', stock: 1340, sku: 48, warning: 1, usage: 75 },
            { name: '药房-01号柜', location: '1号楼 1层 中心药房', status: 'online', stock: 3200, sku: 85, warning: 12, usage: 88 },
            { name: '住院部-01号柜', location: '2号楼 3层 内科病区', status: 'online', stock: 1680, sku: 55, warning: 6, usage: 71 },
            { name: '住院部-02号柜', location: '2号楼 4层 外科病区', status: 'online', stock: 1450, sku: 42, warning: 3, usage: 68 },
            { name: '门诊-01号柜', location: '1号楼 3层 门诊大厅', status: 'online', stock: 2100, sku: 62, warning: 9, usage: 79 },
            { name: '门诊-02号柜', location: '1号楼 4层 专科门诊', status: 'offline', stock: 1560, sku: 48, warning: 7, usage: 73 }
        ];

        const renderCabinets = (filterStatus = 'all') => {
            const filtered = filterStatus === 'all' ? cabinets : cabinets.filter(c => c.status === filterStatus);
            return filtered.map(cabinet => {
                const statusClass = cabinet.status === 'online' ? 'online' : 'offline';
                const statusText = cabinet.status === 'online' ? '在线' : '离线';
                const warningClass = cabinet.warning > 0 ? 'warning' : '';
                const usageColor = cabinet.usage >= 90 ? '#ff4444' : cabinet.usage >= 70 ? '#ffaa00' : '#00bfff';
                return `
                    <div class="cabinet-item" onclick="Toast.info('查看 ${cabinet.name} 详情')">
                        <div class="cabinet-item-header">
                            <div class="cabinet-item-icon"><i class="fas fa-server"></i></div>
                            <div class="cabinet-item-info">
                                <div class="cabinet-item-name">${cabinet.name}</div>
                                <div class="cabinet-item-location">${cabinet.location}</div>
                            </div>
                            <span class="cabinet-item-status ${statusClass}">${statusText}</span>
                        </div>
                        <div class="cabinet-item-stats">
                            <div class="cabinet-item-stat">
                                <div class="cabinet-item-stat-value">${cabinet.stock.toLocaleString()}</div>
                                <div class="cabinet-item-stat-label">库存量</div>
                            </div>
                            <div class="cabinet-item-stat">
                                <div class="cabinet-item-stat-value">${cabinet.sku}</div>
                                <div class="cabinet-item-stat-label">SKU数</div>
                            </div>
                            <div class="cabinet-item-stat">
                                <div class="cabinet-item-stat-value ${warningClass}">${cabinet.warning}</div>
                                <div class="cabinet-item-stat-label">预警</div>
                            </div>
                        </div>
                        <div class="cabinet-item-progress">
                            <div class="cabinet-item-progress-info">
                                <span>货道使用率</span>
                                <span>${cabinet.usage}%</span>
                            </div>
                            <div class="cabinet-item-progress-bar">
                                <div class="cabinet-item-progress-fill" style="width: ${cabinet.usage}%; background: ${usageColor};"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        };

        const content = `
            <div class="view-all-cabinets-modal" id="view-all-cabinets-modal">
                <style>
                    .view-all-cabinets-modal { padding: 0; }
                    .cabinets-filter { display: flex; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(0,191,255,0.2); }
                    .cabinets-filter select { padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,191,255,0.2); border-radius: 6px; color: #e4e9f2; font-size: 13px; cursor: pointer; min-width: 120px; }
                    .cabinets-filter select:focus { outline: none; border-color: #00bfff; }
                    .cabinets-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-height: 500px; overflow-y: auto; padding-right: 8px; }
                    .cabinets-grid::-webkit-scrollbar { width: 6px; }
                    .cabinets-grid::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 3px; }
                    .cabinets-grid::-webkit-scrollbar-thumb { background: rgba(0,191,255,0.3); border-radius: 3px; }
                    .cabinets-grid::-webkit-scrollbar-thumb:hover { background: rgba(0,191,255,0.5); }
                    .cabinet-item { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,191,255,0.15); border-radius: 10px; padding: 16px; transition: all 0.3s; cursor: pointer; }
                    .cabinet-item:hover { border-color: rgba(0,191,255,0.4); background: rgba(0,191,255,0.05); transform: translateY(-2px); }
                    .cabinet-item-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
                    .cabinet-item-icon { width: 40px; height: 40px; background: linear-gradient(135deg, rgba(0,191,255,0.2), rgba(0,191,255,0.05)); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #00bfff; font-size: 18px; }
                    .cabinet-item-info { flex: 1; }
                    .cabinet-item-name { font-size: 14px; font-weight: 600; color: #e4e9f2; margin-bottom: 4px; }
                    .cabinet-item-location { font-size: 12px; color: #8892a0; }
                    .cabinet-item-status { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
                    .cabinet-item-status.online { background: rgba(0,255,136,0.15); color: #00ff88; }
                    .cabinet-item-status.offline { background: rgba(255,68,68,0.15); color: #ff4444; }
                    .cabinet-item-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
                    .cabinet-item-stat { text-align: center; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 6px; }
                    .cabinet-item-stat-value { font-size: 16px; font-weight: 600; color: #e4e9f2; margin-bottom: 2px; }
                    .cabinet-item-stat-value.warning { color: #ffaa00; }
                    .cabinet-item-stat-label { font-size: 11px; color: #8892a0; }
                    .cabinet-item-progress { margin-top: 8px; }
                    .cabinet-item-progress-info { display: flex; justify-content: space-between; font-size: 12px; color: #8892a0; margin-bottom: 6px; }
                    .cabinet-item-progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
                    .cabinet-item-progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
                    .cabinets-summary { display: flex; gap: 24px; padding: 12px 16px; background: rgba(0,191,255,0.05); border-radius: 8px; margin-bottom: 16px; }
                    .cabinets-summary-item { display: flex; align-items: center; gap: 8px; }
                    .cabinets-summary-item i { color: #00bfff; font-size: 14px; }
                    .cabinets-summary-item span { font-size: 13px; color: #8892a0; }
                    .cabinets-summary-item strong { color: #e4e9f2; margin-left: 4px; }
                </style>
                <div class="cabinets-summary">
                    <div class="cabinets-summary-item"><i class="fas fa-server"></i><span>智能柜总数<strong>${cabinets.length}</strong></span></div>
                    <div class="cabinets-summary-item"><i class="fas fa-check-circle" style="color:#00ff88;"></i><span>在线<strong>${cabinets.filter(c => c.status === 'online').length}</strong></span></div>
                    <div class="cabinets-summary-item"><i class="fas fa-times-circle" style="color:#ff4444;"></i><span>离线<strong>${cabinets.filter(c => c.status === 'offline').length}</strong></span></div>
                    <div class="cabinets-summary-item"><i class="fas fa-exclamation-triangle" style="color:#ffaa00;"></i><span>预警<strong>${cabinets.reduce((sum, c) => sum + c.warning, 0)}</strong></span></div>
                </div>
                <div class="cabinets-filter">
                    <select id="cabinet-filter-status">
                        <option value="all">全部状态</option>
                        <option value="online">在线</option>
                        <option value="offline">离线</option>
                    </select>
                    <select id="cabinet-filter-dept">
                        <option value="all">全部科室</option>
                        <option value="手术室">手术室</option>
                        <option value="急诊科">急诊科</option>
                        <option value="ICU">ICU</option>
                        <option value="药房">药房</option>
                        <option value="住院部">住院部</option>
                        <option value="门诊">门诊</option>
                    </select>
                </div>
                <div class="cabinets-grid" id="cabinets-grid">
                    ${renderCabinets()}
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-server" style="margin-right:8px;color:#00bfff;"></i>全部智能柜',
            content: content,
            width: '800px',
            onOpen: () => {
                const filterStatus = document.getElementById('cabinet-filter-status');
                const grid = document.getElementById('cabinets-grid');
                if (filterStatus && grid) {
                    filterStatus.addEventListener('change', function() {
                        grid.innerHTML = renderCabinets(this.value);
                    });
                }
            },
            onConfirm: () => { Toast.success('刷新智能柜列表'); },
            onCancel: () => {},
            confirmText: '刷新',
            cancelText: '关闭'
        });
    },

    // 新建补货计划弹窗
    addReplenishPlan() {
        const products = [
            { name: '一次性无菌手套', spec: 'M号 100只/盒', current: 120, min: 200, suggest: 300 },
            { name: '医用口罩', spec: '外科口罩 50只/包', current: 85, min: 150, suggest: 250 },
            { name: '75%酒精消毒液', spec: '500ml/瓶', current: 45, min: 80, suggest: 120 },
            { name: '一次性注射器', spec: '5ml 100支/盒', current: 200, min: 300, suggest: 500 },
            { name: '医用纱布', spec: '10x10cm 20片/包', current: 60, min: 100, suggest: 180 },
            { name: '碘伏消毒液', spec: '100ml/瓶', current: 30, min: 50, suggest: 80 }
        ];

        const cabinets = [
            { name: '手术室-01号柜', dept: '手术室' },
            { name: '急诊科-01号柜', dept: '急诊科' },
            { name: 'ICU-01号柜', dept: 'ICU' },
            { name: '药房-01号柜', dept: '药房' },
            { name: '住院部-01号柜', dept: '住院部' }
        ];

        const content = `
            <div class="replenish-plan-modal" id="replenish-plan-modal">
                <style>
                    .replenish-plan-modal { padding: 0; }
                    .plan-form-section { margin-bottom: 20px; }
                    .plan-section-title { 
                        font-size: 14px; 
                        font-weight: 600; 
                        color: #00bfff; 
                        margin-bottom: 16px; 
                        padding-left: 12px; 
                        border-left: 3px solid #00bfff;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .plan-form-row { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 16px; 
                        margin-bottom: 16px; 
                    }
                    .plan-form-group { margin-bottom: 0; }
                    .plan-form-group label { 
                        display: block; 
                        font-size: 13px; 
                        color: #8892a0; 
                        margin-bottom: 6px; 
                    }
                    .plan-form-group label .required {
                        color: #ff4444;
                        margin-left: 2px;
                    }
                    .plan-form-group input,
                    .plan-form-group select,
                    .plan-form-group textarea { 
                        width: 100%; 
                        height: 40px;
                        padding: 10px 12px; 
                        background: rgba(0,0,0,0.3); 
                        border: 1px solid rgba(0,191,255,0.2); 
                        border-radius: 6px; 
                        color: #e4e9f2; 
                        font-size: 14px;
                        box-sizing: border-box;
                    }
                    .plan-form-group select {
                        appearance: none;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2300bfff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
                        background-position: right 0.5rem center;
                        background-repeat: no-repeat;
                        background-size: 20px;
                        padding-right: 2.5rem;
                        cursor: pointer;
                    }
                    .plan-form-group select option {
                        background: #1a1f3a;
                        color: #e4e9f2;
                    }
                    .plan-form-group input:focus,
                    .plan-form-group select:focus,
                    .plan-form-group textarea:focus { 
                        outline: none; 
                        border-color: #00bfff; 
                        box-shadow: 0 0 0 2px rgba(0,191,255,0.1);
                    }
                    .plan-form-group textarea {
                        resize: vertical;
                        min-height: 80px;
                        height: auto;
                    }
                    .plan-products-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 8px;
                    }
                    .plan-products-table th,
                    .plan-products-table td {
                        padding: 10px 8px;
                        text-align: left;
                        font-size: 13px;
                        border-bottom: 1px solid rgba(0,191,255,0.1);
                    }
                    .plan-products-table th {
                        color: #8892a0;
                        font-weight: 500;
                        background: rgba(0,0,0,0.2);
                    }
                    .plan-products-table td {
                        color: #e4e9f2;
                    }
                    .plan-products-table tr:hover td {
                        background: rgba(0,191,255,0.05);
                    }
                    .plan-product-checkbox {
                        width: 18px;
                        height: 18px;
                        accent-color: #00bfff;
                        cursor: pointer;
                    }
                    .plan-product-name {
                        font-weight: 500;
                        color: #e4e9f2;
                    }
                    .plan-product-spec {
                        font-size: 12px;
                        color: #8892a0;
                    }
                    .plan-stock-low {
                        color: #ff4444;
                        font-weight: 500;
                    }
                    .plan-stock-normal {
                        color: #00ff88;
                    }
                    .plan-suggest-input {
                        width: 70px;
                        padding: 6px 8px;
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(0,191,255,0.2);
                        border-radius: 4px;
                        color: #e4e9f2;
                        font-size: 13px;
                        text-align: center;
                    }
                    .plan-suggest-input:focus {
                        outline: none;
                        border-color: #00bfff;
                    }
                    .plan-summary {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 16px;
                        background: rgba(0,191,255,0.05);
                        border-radius: 8px;
                        margin-top: 16px;
                    }
                    .plan-summary-item {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .plan-summary-item span {
                        font-size: 13px;
                        color: #8892a0;
                    }
                    .plan-summary-item strong {
                        color: #00bfff;
                        font-size: 16px;
                        margin-left: 4px;
                    }
                </style>
                
                <div class="plan-form-section">
                    <div class="plan-section-title"><i class="fas fa-info-circle"></i>基本信息</div>
                    <div class="plan-form-row">
                        <div class="plan-form-group">
                            <label>计划名称<span class="required">*</span></label>
                            <input type="text" id="plan-name" placeholder="请输入计划名称" value="">
                        </div>
                        <div class="plan-form-group">
                            <label>补货类型<span class="required">*</span></label>
                            <select id="plan-type">
                                <option value="">请选择类型</option>
                                <option value="routine">日常补货</option>
                                <option value="urgent">紧急补货</option>
                                <option value="seasonal">季节性补货</option>
                                <option value="promotion">促销备货</option>
                            </select>
                        </div>
                    </div>
                    <div class="plan-form-row">
                        <div class="plan-form-group">
                            <label>目标智能柜<span class="required">*</span></label>
                            <select id="plan-cabinet">
                                <option value="">请选择智能柜</option>
                                ${cabinets.map(c => `<option value="${c.name}">${c.name} (${c.dept})</option>`).join('')}
                                <option value="all">全部智能柜</option>
                            </select>
                        </div>
                        <div class="plan-form-group">
                            <label>期望完成日期<span class="required">*</span></label>
                            <input type="date" id="plan-date" value="">
                        </div>
                    </div>
                    <div class="plan-form-row">
                        <div class="plan-form-group" style="grid-column: 1 / -1;">
                            <label>备注说明</label>
                            <textarea id="plan-remark" placeholder="请输入备注说明（可选）"></textarea>
                        </div>
                    </div>
                </div>

                <div class="plan-form-section">
                    <div class="plan-section-title"><i class="fas fa-boxes"></i>补货商品</div>
                    <table class="plan-products-table">
                        <thead>
                            <tr>
                                <th style="width: 40px;"><input type="checkbox" class="plan-product-checkbox" id="select-all-products"></th>
                                <th>商品名称</th>
                                <th style="width: 80px;">当前库存</th>
                                <th style="width: 80px;">安全库存</th>
                                <th style="width: 100px;">建议补货量</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map((p, i) => `
                                <tr>
                                    <td><input type="checkbox" class="plan-product-checkbox" data-index="${i}"></td>
                                    <td>
                                        <div class="plan-product-name">${p.name}</div>
                                        <div class="plan-product-spec">${p.spec}</div>
                                    </td>
                                    <td class="${p.current < p.min ? 'plan-stock-low' : 'plan-stock-normal'}">${p.current}</td>
                                    <td>${p.min}</td>
                                    <td><input type="number" class="plan-suggest-input" value="${p.suggest}" min="0"></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="plan-summary">
                        <div class="plan-summary-item">
                            <i class="fas fa-check-square" style="color: #00bfff;"></i>
                            <span>已选商品<strong id="selected-count">0</strong>项</span>
                        </div>
                        <div class="plan-summary-item">
                            <i class="fas fa-calculator" style="color: #00ff88;"></i>
                            <span>预计补货总量<strong id="total-quantity">0</strong>件</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-plus-circle" style="margin-right:8px;color:#00bfff;"></i>新建补货计划',
            content: content,
            width: '700px',
            onOpen: () => {
                // 设置默认日期为明天
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                document.getElementById('plan-date').value = tomorrow.toISOString().split('T')[0];

                // 全选功能
                const selectAll = document.getElementById('select-all-products');
                const checkboxes = document.querySelectorAll('.plan-products-table tbody .plan-product-checkbox');
                const selectedCountEl = document.getElementById('selected-count');
                const totalQuantityEl = document.getElementById('total-quantity');

                const updateSummary = () => {
                    const checked = document.querySelectorAll('.plan-products-table tbody .plan-product-checkbox:checked');
                    selectedCountEl.textContent = checked.length;
                    let total = 0;
                    checked.forEach(cb => {
                        const row = cb.closest('tr');
                        const input = row.querySelector('.plan-suggest-input');
                        total += parseInt(input.value) || 0;
                    });
                    totalQuantityEl.textContent = total.toLocaleString();
                };

                selectAll.addEventListener('change', function() {
                    checkboxes.forEach(cb => cb.checked = this.checked);
                    updateSummary();
                });

                checkboxes.forEach(cb => {
                    cb.addEventListener('change', updateSummary);
                });

                document.querySelectorAll('.plan-suggest-input').forEach(input => {
                    input.addEventListener('change', updateSummary);
                });
            },
            onConfirm: () => {
                const name = document.getElementById('plan-name').value.trim();
                const type = document.getElementById('plan-type').value;
                const cabinet = document.getElementById('plan-cabinet').value;
                const date = document.getElementById('plan-date').value;
                const remark = document.getElementById('plan-remark').value.trim();

                if (!name) {
                    Toast.error('请输入计划名称');
                    return false;
                }
                if (!type) {
                    Toast.error('请选择补货类型');
                    return false;
                }
                if (!cabinet) {
                    Toast.error('请选择目标智能柜');
                    return false;
                }
                if (!date) {
                    Toast.error('请选择期望完成日期');
                    return false;
                }

                const checkedProducts = document.querySelectorAll('.plan-products-table tbody .plan-product-checkbox:checked');
                if (checkedProducts.length === 0) {
                    Toast.error('请至少选择一种补货商品');
                    return false;
                }

                const selectedItems = [];
                checkedProducts.forEach(cb => {
                    const row = cb.closest('tr');
                    const productName = row.querySelector('.plan-product-name').textContent;
                    const quantity = row.querySelector('.plan-suggest-input').value;
                    selectedItems.push({ name: productName, quantity: parseInt(quantity) });
                });

                Toast.success('补货计划创建成功！');
                console.log('新建补货计划:', {
                    name,
                    type,
                    cabinet,
                    date,
                    remark,
                    products: selectedItems
                });
            },
            onCancel: () => {},
            confirmText: '创建计划',
            cancelText: '取消'
        });
    },

    // 新建盘点任务弹窗
    addStocktakingTask() {
        const cabinets = [
            { name: '手术室-01号柜', dept: '手术室', location: '3号楼 2层' },
            { name: '手术室-02号柜', dept: '手术室', location: '3号楼 2层' },
            { name: '急诊科-01号柜', dept: '急诊科', location: '1号楼 1层' },
            { name: '急诊科-02号柜', dept: '急诊科', location: '1号楼 2层' },
            { name: 'ICU-01号柜', dept: 'ICU', location: '2号楼 5层' },
            { name: 'ICU-02号柜', dept: 'ICU', location: '2号楼 5层' },
            { name: '药房-01号柜', dept: '药房', location: '1号楼 1层' },
            { name: '药房-02号柜', dept: '药房', location: '1号楼 1层' },
            { name: '住院部-01号柜', dept: '住院部', location: '2号楼 3层' },
            { name: '住院部-02号柜', dept: '住院部', location: '2号楼 4层' }
        ];

        const users = [
            { name: '张护士', role: '护士长' },
            { name: '李医生', role: '主治医师' },
            { name: '王药师', role: '药师' },
            { name: '刘护士', role: '护士' },
            { name: '陈医生', role: '副主任医师' }
        ];

        const content = `
            <div class="stocktaking-task-modal" id="stocktaking-task-modal">
                <style>
                    .stocktaking-task-modal { padding: 0; }
                    .task-form-section { margin-bottom: 24px; }
                    .task-section-title { 
                        font-size: 14px; 
                        font-weight: 600; 
                        color: #00bfff; 
                        margin-bottom: 16px; 
                        padding-left: 12px; 
                        border-left: 3px solid #00bfff;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .task-form-row { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 16px; 
                        margin-bottom: 16px; 
                    }
                    .task-form-group { margin-bottom: 0; }
                    .task-form-group label { 
                        display: block; 
                        font-size: 13px; 
                        color: #8892a0; 
                        margin-bottom: 6px; 
                    }
                    .task-form-group label .required {
                        color: #ff4444;
                        margin-left: 2px;
                    }
                    .task-form-group input,
                    .task-form-group select,
                    .task-form-group textarea { 
                        width: 100%; 
                        height: 40px;
                        padding: 10px 12px; 
                        background: rgba(0,0,0,0.3); 
                        border: 1px solid rgba(0,191,255,0.2); 
                        border-radius: 6px; 
                        color: #e4e9f2; 
                        font-size: 14px;
                        box-sizing: border-box;
                    }
                    .task-form-group select {
                        appearance: none;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2300bfff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
                        background-position: right 0.5rem center;
                        background-repeat: no-repeat;
                        background-size: 20px;
                        padding-right: 2.5rem;
                        cursor: pointer;
                    }
                    .task-form-group select option {
                        background: #1a1f3a;
                        color: #e4e9f2;
                    }
                    .task-form-group input:focus,
                    .task-form-group select:focus,
                    .task-form-group textarea:focus { 
                        outline: none; 
                        border-color: #00bfff; 
                        box-shadow: 0 0 0 2px rgba(0,191,255,0.1);
                    }
                    .task-form-group textarea {
                        resize: vertical;
                        min-height: 80px;
                        height: auto;
                    }
                    .task-cabinets-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                        max-height: 200px;
                        overflow-y: auto;
                        padding-right: 4px;
                    }
                    .task-cabinets-grid::-webkit-scrollbar {
                        width: 4px;
                    }
                    .task-cabinets-grid::-webkit-scrollbar-track {
                        background: rgba(0,0,0,0.2);
                        border-radius: 2px;
                    }
                    .task-cabinets-grid::-webkit-scrollbar-thumb {
                        background: rgba(0,191,255,0.3);
                        border-radius: 2px;
                    }
                    .task-cabinet-item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 12px;
                        background: rgba(0,0,0,0.2);
                        border: 1px solid rgba(0,191,255,0.15);
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .task-cabinet-item:hover {
                        border-color: rgba(0,191,255,0.3);
                        background: rgba(0,191,255,0.05);
                    }
                    .task-cabinet-item.selected {
                        border-color: #00bfff;
                        background: rgba(0,191,255,0.1);
                    }
                    .task-cabinet-checkbox {
                        width: 18px;
                        height: 18px;
                        accent-color: #00bfff;
                        cursor: pointer;
                    }
                    .task-cabinet-info {
                        flex: 1;
                    }
                    .task-cabinet-name {
                        font-size: 13px;
                        font-weight: 500;
                        color: #e4e9f2;
                        margin-bottom: 2px;
                    }
                    .task-cabinet-location {
                        font-size: 11px;
                        color: #8892a0;
                    }
                    .task-type-options {
                        display: flex;
                        gap: 12px;
                    }
                    .task-type-option {
                        flex: 1;
                        padding: 12px;
                        background: rgba(0,0,0,0.2);
                        border: 1px solid rgba(0,191,255,0.15);
                        border-radius: 8px;
                        text-align: center;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .task-type-option:hover {
                        border-color: rgba(0,191,255,0.3);
                    }
                    .task-type-option.selected {
                        border-color: #00bfff;
                        background: rgba(0,191,255,0.1);
                    }
                    .task-type-option i {
                        font-size: 20px;
                        color: #00bfff;
                        margin-bottom: 6px;
                        display: block;
                    }
                    .task-type-option span {
                        font-size: 12px;
                        color: #e4e9f2;
                    }
                    .task-summary {
                        display: flex;
                        gap: 20px;
                        padding: 12px 16px;
                        background: rgba(0,191,255,0.05);
                        border-radius: 8px;
                        margin-top: 16px;
                    }
                    .task-summary-item {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .task-summary-item i {
                        color: #00bfff;
                        font-size: 14px;
                    }
                    .task-summary-item span {
                        font-size: 13px;
                        color: #8892a0;
                    }
                    .task-summary-item strong {
                        color: #00bfff;
                        margin-left: 4px;
                    }
                </style>
                
                <div class="task-form-section">
                    <div class="task-section-title"><i class="fas fa-info-circle"></i>基本信息</div>
                    <div class="task-form-row">
                        <div class="task-form-group">
                            <label>任务名称<span class="required">*</span></label>
                            <input type="text" id="task-name" placeholder="请输入任务名称" value="">
                        </div>
                        <div class="task-form-group">
                            <label>盘点类型<span class="required">*</span></label>
                            <select id="task-type">
                                <option value="">请选择类型</option>
                                <option value="monthly">月度盘点</option>
                                <option value="quarterly">季度盘点</option>
                                <option value="yearly">年度盘点</option>
                                <option value="temporary">临时盘点</option>
                                <option value="special">专项盘点</option>
                            </select>
                        </div>
                    </div>
                    <div class="task-form-row">
                        <div class="task-form-group">
                            <label>计划盘点日期<span class="required">*</span></label>
                            <input type="date" id="task-date" value="">
                        </div>
                        <div class="task-form-group">
                            <label>盘点负责人<span class="required">*</span></label>
                            <select id="task-assignee">
                                <option value="">请选择负责人</option>
                                ${users.map(u => `<option value="${u.name}">${u.name} (${u.role})</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="task-form-row">
                        <div class="task-form-group" style="grid-column: 1 / -1;">
                            <label>备注说明</label>
                            <textarea id="task-remark" placeholder="请输入备注说明（可选）"></textarea>
                        </div>
                    </div>
                </div>

                <div class="task-form-section">
                    <div class="task-section-title"><i class="fas fa-server"></i>盘点范围</div>
                    <div class="task-cabinets-grid" id="task-cabinets-grid">
                        ${cabinets.map((c, i) => `
                            <div class="task-cabinet-item" data-index="${i}">
                                <input type="checkbox" class="task-cabinet-checkbox" data-index="${i}">
                                <div class="task-cabinet-info">
                                    <div class="task-cabinet-name">${c.name}</div>
                                    <div class="task-cabinet-location">${c.location} · ${c.dept}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="task-summary">
                        <div class="task-summary-item">
                            <i class="fas fa-server"></i>
                            <span>已选智能柜<strong id="selected-cabinets-count">0</strong>个</span>
                        </div>
                        <div class="task-summary-item">
                            <i class="fas fa-check-circle" style="color: #00ff88;"></i>
                            <span>预计盘点SKU<strong id="estimated-sku">0</strong>个</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-plus-circle" style="margin-right:8px;color:#00bfff;"></i>新建盘点任务',
            content: content,
            width: '650px',
            onOpen: () => {
                // 设置默认日期为明天
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                document.getElementById('task-date').value = tomorrow.toISOString().split('T')[0];

                // 智能柜选择交互
                const cabinetItems = document.querySelectorAll('.task-cabinet-item');
                const selectedCountEl = document.getElementById('selected-cabinets-count');
                const estimatedSkuEl = document.getElementById('estimated-sku');

                const updateSummary = () => {
                    const checked = document.querySelectorAll('.task-cabinet-checkbox:checked');
                    const count = checked.length;
                    selectedCountEl.textContent = count;
                    // 估算SKU数量（每个智能柜约40-60个SKU）
                    const estimatedSku = count * Math.floor(Math.random() * 20 + 40);
                    estimatedSkuEl.textContent = estimatedSku.toLocaleString();
                };

                cabinetItems.forEach(item => {
                    item.addEventListener('click', (e) => {
                        if (e.target.type !== 'checkbox') {
                            const checkbox = item.querySelector('.task-cabinet-checkbox');
                            checkbox.checked = !checkbox.checked;
                        }
                        item.classList.toggle('selected', item.querySelector('.task-cabinet-checkbox').checked);
                        updateSummary();
                    });
                });

                document.querySelectorAll('.task-cabinet-checkbox').forEach(cb => {
                    cb.addEventListener('change', function() {
                        this.closest('.task-cabinet-item').classList.toggle('selected', this.checked);
                        updateSummary();
                    });
                });
            },
            onConfirm: () => {
                const name = document.getElementById('task-name').value.trim();
                const type = document.getElementById('task-type').value;
                const date = document.getElementById('task-date').value;
                const assignee = document.getElementById('task-assignee').value;
                const remark = document.getElementById('task-remark').value.trim();

                if (!name) {
                    Toast.error('请输入任务名称');
                    return false;
                }
                if (!type) {
                    Toast.error('请选择盘点类型');
                    return false;
                }
                if (!date) {
                    Toast.error('请选择计划盘点日期');
                    return false;
                }
                if (!assignee) {
                    Toast.error('请选择盘点负责人');
                    return false;
                }

                const checkedCabinets = document.querySelectorAll('.task-cabinet-checkbox:checked');
                if (checkedCabinets.length === 0) {
                    Toast.error('请至少选择一个智能柜');
                    return false;
                }

                const selectedCabinets = [];
                checkedCabinets.forEach(cb => {
                    const item = cb.closest('.task-cabinet-item');
                    const name = item.querySelector('.task-cabinet-name').textContent;
                    selectedCabinets.push(name);
                });

                Toast.success('盘点任务创建成功！');
                console.log('新建盘点任务:', {
                    name,
                    type,
                    date,
                    assignee,
                    remark,
                    cabinets: selectedCabinets
                });
            },
            onCancel: () => {},
            confirmText: '创建任务',
            cancelText: '取消'
        });
    },

    // 新增标签对照弹窗
    addCodeContrast() {
        const content = `
            <div class="code-contrast-form-modal" id="code-contrast-form-modal">
                <style>
                    .code-contrast-form-modal { padding: 0; }
                    .code-contrast-form-modal .form-section { margin-bottom: 20px; }
                    .code-contrast-form-modal .section-title { 
                        font-size: 14px; 
                        font-weight: 600; 
                        color: #00bfff; 
                        margin-bottom: 16px; 
                        padding-left: 12px; 
                        border-left: 3px solid #00bfff;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .code-contrast-form-modal .form-row { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 16px; 
                        margin-bottom: 16px; 
                    }
                    .code-contrast-form-modal .form-group { margin-bottom: 0; }
                    .code-contrast-form-modal .form-group label { 
                        display: block; 
                        font-size: 13px; 
                        color: #8892a0; 
                        margin-bottom: 6px; 
                    }
                    .code-contrast-form-modal .form-group input,
                    .code-contrast-form-modal .form-group select { 
                        width: 100%; 
                        height: 40px;
                        padding: 10px 12px; 
                        background: rgba(0,0,0,0.3); 
                        border: 1px solid rgba(0,191,255,0.2); 
                        border-radius: 6px; 
                        color: #e4e9f2; 
                        font-size: 14px;
                        box-sizing: border-box;
                    }
                    .code-contrast-form-modal .form-group select {
                        appearance: none;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2300bfff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
                        background-position: right 0.5rem center;
                        background-repeat: no-repeat;
                        background-size: 20px;
                        padding-right: 2.5rem;
                        cursor: pointer;
                    }
                    .code-contrast-form-modal .form-group select option {
                        background: #1a1f3a;
                        color: #e4e9f2;
                    }
                    .code-contrast-form-modal .form-group input:focus,
                    .code-contrast-form-modal .form-group select:focus { 
                        outline: none; 
                        border-color: #00bfff; 
                    }
                    .code-contrast-form-modal .form-group input::placeholder {
                        color: #5a6270;
                    }
                    .code-contrast-form-modal .required { color: #ff4444; }
                    .code-contrast-form-modal .scan-input-group {
                        display: flex;
                        gap: 8px;
                    }
                    .code-contrast-form-modal .scan-input-group input {
                        flex: 1;
                    }
                    .code-contrast-form-modal .scan-btn {
                        padding: 10px 16px;
                        background: rgba(0,191,255,0.15);
                        border: 1px solid rgba(0,191,255,0.3);
                        border-radius: 6px;
                        color: #00bfff;
                        cursor: pointer;
                        transition: all 0.3s;
                        white-space: nowrap;
                    }
                    .code-contrast-form-modal .scan-btn:hover {
                        background: rgba(0,191,255,0.25);
                    }
                    .code-contrast-form-modal .tips-box {
                        background: rgba(0,191,255,0.05);
                        border: 1px solid rgba(0,191,255,0.15);
                        border-radius: 6px;
                        padding: 12px 16px;
                        margin-top: 16px;
                    }
                    .code-contrast-form-modal .tips-title {
                        font-size: 12px;
                        color: #00bfff;
                        margin-bottom: 8px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .code-contrast-form-modal .tips-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        font-size: 11px;
                        color: #8892a0;
                    }
                    .code-contrast-form-modal .tips-list li {
                        padding: 3px 0;
                        padding-left: 16px;
                        position: relative;
                    }
                    .code-contrast-form-modal .tips-list li::before {
                        content: '•';
                        position: absolute;
                        left: 6px;
                        color: #00bfff;
                    }
                </style>
                
                <!-- 商品信息 -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="fas fa-box"></i> 商品信息
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>商品编码 <span class="required">*</span></label>
                            <div class="scan-input-group">
                                <input type="text" id="contrast-product-code" placeholder="请输入或扫描商品编码">
                                <button type="button" class="scan-btn" title="扫码">
                                    <i class="fas fa-qrcode"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>商品名称</label>
                            <input type="text" id="contrast-product-name" placeholder="自动获取商品名称" disabled>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>规格型号</label>
                            <input type="text" id="contrast-product-spec" placeholder="自动获取规格" disabled>
                        </div>
                        <div class="form-group">
                            <label>生产厂家</label>
                            <input type="text" id="contrast-product-factory" placeholder="自动获取厂家" disabled>
                        </div>
                    </div>
                </div>
                
                <!-- 标签信息 -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="fas fa-tags"></i> 标签信息
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>UDI码 <span class="required">*</span></label>
                            <div class="scan-input-group">
                                <input type="text" id="contrast-udi-code" placeholder="请输入或扫描UDI码">
                                <button type="button" class="scan-btn" title="扫码">
                                    <i class="fas fa-qrcode"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>追溯码 <span class="required">*</span></label>
                            <div class="scan-input-group">
                                <input type="text" id="contrast-trace-code" placeholder="请输入或扫描追溯码">
                                <button type="button" class="scan-btn" title="扫码">
                                    <i class="fas fa-qrcode"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>批号</label>
                            <input type="text" id="contrast-batch-no" placeholder="请输入批号">
                        </div>
                        <div class="form-group">
                            <label>有效期至</label>
                            <input type="date" id="contrast-expire-date">
                        </div>
                    </div>
                </div>
                
                <!-- 提示信息 -->
                <div class="tips-box">
                    <div class="tips-title">
                        <i class="fas fa-info-circle"></i> 操作提示
                    </div>
                    <ul class="tips-list">
                        <li>商品编码、UDI码、追溯码为必填项</li>
                        <li>输入商品编码后系统会自动匹配商品信息</li>
                        <li>支持扫码枪扫描条码快速录入</li>
                        <li>对照关系建立后不可修改，请仔细核对</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-plus-circle" style="margin-right:8px;color:#00bfff;"></i>新增标签对照',
            content: content,
            width: '650px',
            onOpen: () => {
                // 模拟扫码功能 - 点击扫码按钮自动填充示例数据
                const scanBtns = document.querySelectorAll('.scan-btn');
                scanBtns.forEach((btn, index) => {
                    btn.addEventListener('click', function() {
                        const input = this.previousElementSibling;
                        if (index === 0) {
                            // 商品编码扫码
                            input.value = 'SP20240003';
                            // 自动填充商品信息
                            document.getElementById('contrast-product-name').value = '医用纱布敷料';
                            document.getElementById('contrast-product-spec').value = '10cm×10cm 10片/包';
                            document.getElementById('contrast-product-factory').value = '江苏恒瑞医药有限公司';
                            Toast.success('商品信息获取成功');
                        } else if (index === 1) {
                            // UDI码扫码
                            input.value = '(01)56789012345678';
                            Toast.success('UDI码扫描成功');
                        } else if (index === 2) {
                            // 追溯码扫码
                            input.value = '8100000567890123';
                            Toast.success('追溯码扫描成功');
                        }
                    });
                });
            },
            onConfirm: () => {
                // 表单验证
                const productCode = document.getElementById('contrast-product-code').value.trim();
                const udiCode = document.getElementById('contrast-udi-code').value.trim();
                const traceCode = document.getElementById('contrast-trace-code').value.trim();
                
                if (!productCode) {
                    Toast.error('请输入商品编码');
                    return false;
                }
                if (!udiCode) {
                    Toast.error('请输入UDI码');
                    return false;
                }
                if (!traceCode) {
                    Toast.error('请输入追溯码');
                    return false;
                }
                
                // 模拟保存成功
                Toast.success('标签对照新增成功！');
                
                // 这里可以添加实际的保存逻辑，如 AJAX 请求
                console.log('新增标签对照:', {
                    productCode,
                    productName: document.getElementById('contrast-product-name').value,
                    udiCode,
                    traceCode,
                    batchNo: document.getElementById('contrast-batch-no').value,
                    expireDate: document.getElementById('contrast-expire-date').value
                });
            },
            onCancel: () => {},
            confirmText: '保存',
            cancelText: '取消'
        });
    },

    // 新增用户
    addUser() {
        const content = `
            <style>
                .add-user-form-modal .form-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .add-user-form-modal .form-group {
                    flex: 1;
                }
                .add-user-form-modal .form-group.full-width {
                    width: 100%;
                }
                .add-user-form-modal label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 13px;
                    color: #a0b4d8;
                }
                .add-user-form-modal label .required {
                    color: #ff6b6b;
                    margin-left: 2px;
                }
                .add-user-form-modal input,
                .add-user-form-modal select {
                    width: 100%;
                    height: 40px;
                    padding: 10px 12px;
                    border: 1px solid rgba(0,191,255,0.2);
                    border-radius: 6px;
                    background: rgba(13,18,32,0.6);
                    color: #e6f7ff;
                    font-size: 14px;
                    box-sizing: border-box;
                    transition: all 0.3s;
                }
                .add-user-form-modal select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2300bfff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 20px;
                    padding-right: 2.5rem;
                    cursor: pointer;
                }
                .add-user-form-modal select option {
                    background: #1a1f3a;
                    color: #e4e9f2;
                }
                .add-user-form-modal input:focus,
                .add-user-form-modal select:focus {
                    outline: none;
                    border-color: #00bfff;
                    box-shadow: 0 0 0 3px rgba(0,191,255,0.1);
                }
                .add-user-form-modal .tips-box {
                    background: rgba(0,191,255,0.05);
                    border: 1px solid rgba(0,191,255,0.15);
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-top: 16px;
                }
                .add-user-form-modal .tips-title {
                    font-size: 12px;
                    color: #00bfff;
                    margin-bottom: 6px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .add-user-form-modal .tips-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    font-size: 11px;
                    color: #8892a0;
                }
                .add-user-form-modal .tips-list li {
                    padding: 3px 0;
                    padding-left: 16px;
                    position: relative;
                }
                .add-user-form-modal .tips-list li::before {
                    content: '•';
                    position: absolute;
                    left: 6px;
                    color: #00bfff;
                }
            </style>
            
            <div class="add-user-form-modal">
                <div class="form-row">
                    <div class="form-group">
                        <label>用户账号 <span class="required">*</span></label>
                        <input type="text" id="user-account" placeholder="请输入用户账号">
                    </div>
                    <div class="form-group">
                        <label>姓名 <span class="required">*</span></label>
                        <input type="text" id="user-name" placeholder="请输入姓名">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>密码 <span class="required">*</span></label>
                        <input type="password" id="user-password" placeholder="请输入密码">
                    </div>
                    <div class="form-group">
                        <label>确认密码 <span class="required">*</span></label>
                        <input type="password" id="user-password-confirm" placeholder="请再次输入密码">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>所属科室 <span class="required">*</span></label>
                        <select id="user-department">
                            <option value="">请选择科室</option>
                            <option value="info">信息科</option>
                            <option value="surgery">手术室</option>
                            <option value="icu">ICU</option>
                            <option value="emergency">急诊科</option>
                            <option value="pharmacy">药房</option>
                            <option value="supply">供应室</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>角色 <span class="required">*</span></label>
                        <select id="user-role">
                            <option value="">请选择角色</option>
                            <option value="admin">系统管理员</option>
                            <option value="head-nurse">护士长</option>
                            <option value="nurse">护士</option>
                            <option value="doctor">医生</option>
                            <option value="warehouse">库管员</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>联系电话 <span class="required">*</span></label>
                        <input type="text" id="user-phone" placeholder="请输入手机号">
                    </div>
                    <div class="form-group">
                        <label>邮箱</label>
                        <input type="email" id="user-email" placeholder="请输入邮箱地址">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group full-width">
                        <label>状态</label>
                        <select id="user-status">
                            <option value="enabled">启用</option>
                            <option value="disabled">禁用</option>
                        </select>
                    </div>
                </div>
                
                <div class="tips-box">
                    <div class="tips-title">
                        <i class="fas fa-info-circle"></i> 操作提示
                    </div>
                    <ul class="tips-list">
                        <li>账号、姓名、密码为必填项</li>
                        <li>密码长度至少6位，建议包含字母和数字</li>
                        <li>联系电话用于接收系统通知</li>
                        <li>新用户创建后将收到短信通知</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-user-plus" style="margin-right:8px;color:#00bfff;"></i>新增用户',
            content: content,
            width: '550px',
            onOpen: () => {
                // 初始化表单交互
            },
            onConfirm: () => {
                // 表单验证
                const account = document.getElementById('user-account').value.trim();
                const name = document.getElementById('user-name').value.trim();
                const password = document.getElementById('user-password').value;
                const passwordConfirm = document.getElementById('user-password-confirm').value;
                const department = document.getElementById('user-department').value;
                const role = document.getElementById('user-role').value;
                const phone = document.getElementById('user-phone').value.trim();
                
                if (!account) {
                    Toast.error('请输入用户账号');
                    return false;
                }
                if (!name) {
                    Toast.error('请输入姓名');
                    return false;
                }
                if (!password) {
                    Toast.error('请输入密码');
                    return false;
                }
                if (password.length < 6) {
                    Toast.error('密码长度至少6位');
                    return false;
                }
                if (password !== passwordConfirm) {
                    Toast.error('两次输入的密码不一致');
                    return false;
                }
                if (!department) {
                    Toast.error('请选择所属科室');
                    return false;
                }
                if (!role) {
                    Toast.error('请选择角色');
                    return false;
                }
                if (!phone) {
                    Toast.error('请输入联系电话');
                    return false;
                }
                if (!/^1[3-9]\d{9}$/.test(phone)) {
                    Toast.error('请输入正确的手机号');
                    return false;
                }
                
                // 模拟保存成功
                Toast.success('用户新增成功！');
                
                // 这里可以添加实际的保存逻辑
                console.log('新增用户:', {
                    account,
                    name,
                    department,
                    role,
                    phone,
                    email: document.getElementById('user-email').value,
                    status: document.getElementById('user-status').value
                });
                
                return true;
            },
            onCancel: () => {},
            confirmText: '保存',
            cancelText: '取消'
        });
    },

    // 库存预警 - 补货
    replenish(productCode, productName, spec, currentStock, minStock) {
        const suggestedQty = minStock * 2 - currentStock;
        const content = `
            <style>
                .replenish-form-modal .product-info {
                    background: rgba(0,191,255,0.05);
                    border: 1px solid rgba(0,191,255,0.15);
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                }
                .replenish-form-modal .product-info-row {
                    display: flex;
                    margin-bottom: 8px;
                }
                .replenish-form-modal .product-info-row:last-child {
                    margin-bottom: 0;
                }
                .replenish-form-modal .product-info-label {
                    width: 80px;
                    color: #8892a0;
                    font-size: 13px;
                }
                .replenish-form-modal .product-info-value {
                    flex: 1;
                    color: #e6f7ff;
                    font-size: 13px;
                }
                .replenish-form-modal .stock-status {
                    display: flex;
                    gap: 24px;
                    margin-bottom: 20px;
                }
                .replenish-form-modal .stock-status-item {
                    flex: 1;
                    text-align: center;
                    padding: 12px;
                    background: rgba(13,18,32,0.6);
                    border-radius: 8px;
                    border: 1px solid rgba(0,191,255,0.1);
                }
                .replenish-form-modal .stock-status-value {
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                .replenish-form-modal .stock-status-value.danger {
                    color: #ff6b6b;
                }
                .replenish-form-modal .stock-status-value.warning {
                    color: #ffa726;
                }
                .replenish-form-modal .stock-status-value.success {
                    color: #66bb6a;
                }
                .replenish-form-modal .stock-status-label {
                    font-size: 12px;
                    color: #8892a0;
                }
                .replenish-form-modal .form-group {
                    margin-bottom: 16px;
                }
                .replenish-form-modal label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 13px;
                    color: #a0b4d8;
                }
                .replenish-form-modal label .required {
                    color: #ff6b6b;
                    margin-left: 2px;
                }
                .replenish-form-modal input,
                .replenish-form-modal select,
                .replenish-form-modal textarea {
                    width: 100%;
                    height: 40px;
                    padding: 10px 12px;
                    border: 1px solid rgba(0,191,255,0.2);
                    border-radius: 6px;
                    background: rgba(13,18,32,0.6);
                    color: #e6f7ff;
                    font-size: 14px;
                    box-sizing: border-box;
                    transition: all 0.3s;
                }
                .replenish-form-modal select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2300bfff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 20px;
                    padding-right: 2.5rem;
                    cursor: pointer;
                }
                .replenish-form-modal select option {
                    background: #1a1f3a;
                    color: #e4e9f2;
                }
                .replenish-form-modal textarea {
                    height: auto;
                    min-height: 80px;
                }
                .replenish-form-modal input:focus,
                .replenish-form-modal select:focus,
                .replenish-form-modal textarea:focus {
                    outline: none;
                    border-color: #00bfff;
                    box-shadow: 0 0 0 3px rgba(0,191,255,0.1);
                }
                .replenish-form-modal .form-row {
                    display: flex;
                    gap: 16px;
                }
                .replenish-form-modal .form-row .form-group {
                    flex: 1;
                }
                .replenish-form-modal .suggested-qty {
                    font-size: 11px;
                    color: #00bfff;
                    margin-top: 4px;
                }
            </style>
            
            <div class="replenish-form-modal">
                <!-- 商品信息 -->
                <div class="product-info">
                    <div class="product-info-row">
                        <span class="product-info-label">商品编码：</span>
                        <span class="product-info-value">${productCode || 'SP20240001'}</span>
                    </div>
                    <div class="product-info-row">
                        <span class="product-info-label">商品名称：</span>
                        <span class="product-info-value">${productName || '一次性使用无菌注射器'}</span>
                    </div>
                    <div class="product-info-row">
                        <span class="product-info-label">规格型号：</span>
                        <span class="product-info-value">${spec || '5ml 带针'}</span>
                    </div>
                </div>
                
                <!-- 库存状态 -->
                <div class="stock-status">
                    <div class="stock-status-item">
                        <div class="stock-status-value danger">${currentStock || 50}</div>
                        <div class="stock-status-label">当前库存</div>
                    </div>
                    <div class="stock-status-item">
                        <div class="stock-status-value warning">${minStock || 200}</div>
                        <div class="stock-status-label">安全库存</div>
                    </div>
                    <div class="stock-status-item">
                        <div class="stock-status-value success">${suggestedQty > 0 ? suggestedQty : 0}</div>
                        <div class="stock-status-label">建议补货量</div>
                    </div>
                </div>
                
                <!-- 补货信息 -->
                <div class="form-row">
                    <div class="form-group">
                        <label>补货数量 <span class="required">*</span></label>
                        <input type="number" id="replenish-qty" value="${suggestedQty > 0 ? suggestedQty : 100}" min="1">
                        <div class="suggested-qty">建议补货至安全库存的2倍</div>
                    </div>
                    <div class="form-group">
                        <label>供应商</label>
                        <select id="replenish-supplier">
                            <option value="">请选择供应商</option>
                            <option value="supplier1" selected>江苏恒瑞医药有限公司</option>
                            <option value="supplier2">上海医疗器械股份有限公司</option>
                            <option value="supplier3">北京迈瑞医疗器械有限公司</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>备注说明</label>
                    <textarea id="replenish-remark" rows="3" placeholder="请输入补货备注信息（选填）"></textarea>
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-cart-plus" style="margin-right:8px;color:#00bfff;"></i>库存补货',
            content: content,
            width: '550px',
            onOpen: () => {
                // 初始化
            },
            onConfirm: () => {
                const qty = document.getElementById('replenish-qty').value;
                const supplier = document.getElementById('replenish-supplier').value;
                const remark = document.getElementById('replenish-remark').value;
                
                if (!qty || qty < 1) {
                    Toast.error('请输入有效的补货数量');
                    return false;
                }
                
                Toast.success('补货申请已提交！');
                
                console.log('补货申请:', {
                    productCode: productCode || 'SP20240001',
                    productName: productName || '一次性使用无菌注射器',
                    qty: parseInt(qty),
                    supplier: supplier,
                    remark: remark
                });
                
                return true;
            },
            onCancel: () => {},
            confirmText: '提交申请',
            cancelText: '取消'
        });
    },

    // 业务查询 - 查看详情
    queryDetail(billNo, billType) {
        // 模拟单据数据
        const billData = {
            'IN2024001': {
                type: '入库',
                status: '已完成',
                warehouse: '药库',
                operator: '张三',
                time: '2024-01-15 10:30',
                supplier: '江苏恒瑞医药有限公司',
                remark: '常规采购入库',
                items: [
                    { code: 'SP20240001', name: '一次性使用无菌注射器', spec: '5ml 带针', qty: 500, unit: '支', batch: '20240115A', expire: '2026-01-15' },
                    { code: 'SP20240002', name: '医用酒精消毒液', spec: '500ml', qty: 200, unit: '瓶', batch: '20240110B', expire: '2025-01-10' }
                ]
            },
            'OUT2024001': {
                type: '出库',
                status: '已完成',
                warehouse: '手术室',
                operator: '李四',
                time: '2024-01-15 09:15',
                supplier: '-',
                remark: '手术领用',
                items: [
                    { code: 'SP20240001', name: '一次性使用无菌注射器', spec: '5ml 带针', qty: 50, unit: '支', batch: '20231201A', expire: '2025-12-01' },
                    { code: 'SP20240005', name: '手术缝合线', spec: '3-0', qty: 20, unit: '包', batch: '20231120C', expire: '2025-11-20' }
                ]
            }
        };
        
        const data = billData[billNo] || billData['IN2024001'];
        const statusColor = data.status === '已完成' ? '#66bb6a' : '#ffa726';
        const typeColor = data.type === '入库' ? '#00bfff' : '#ff6b6b';
        
        const content = `
            <style>
                .query-detail-modal .detail-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(0,191,255,0.15);
                }
                .query-detail-modal .bill-no {
                    font-size: 18px;
                    font-weight: 600;
                    color: #e6f7ff;
                }
                .query-detail-modal .bill-type {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    background: ${typeColor}20;
                    color: ${typeColor};
                    border: 1px solid ${typeColor}40;
                }
                .query-detail-modal .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px 24px;
                    margin-bottom: 20px;
                    padding: 16px;
                    background: rgba(0,191,255,0.05);
                    border-radius: 8px;
                    border: 1px solid rgba(0,191,255,0.1);
                }
                .query-detail-modal .info-item {
                    display: flex;
                }
                .query-detail-modal .info-label {
                    width: 70px;
                    color: #8892a0;
                    font-size: 13px;
                }
                .query-detail-modal .info-value {
                    flex: 1;
                    color: #e6f7ff;
                    font-size: 13px;
                }
                .query-detail-modal .status-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    background: ${statusColor}20;
                    color: ${statusColor};
                    border: 1px solid ${statusColor}40;
                }
                .query-detail-modal .items-section {
                    margin-top: 20px;
                }
                .query-detail-modal .section-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #e6f7ff;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .query-detail-modal .items-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .query-detail-modal .items-table th {
                    background: rgba(0,191,255,0.1);
                    padding: 10px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 500;
                    color: #a0b4d8;
                    border-bottom: 1px solid rgba(0,191,255,0.15);
                }
                .query-detail-modal .items-table td {
                    padding: 10px;
                    font-size: 12px;
                    color: #e6f7ff;
                    border-bottom: 1px solid rgba(0,191,255,0.08);
                }
                .query-detail-modal .items-table tr:hover td {
                    background: rgba(0,191,255,0.05);
                }
                .query-detail-modal .code {
                    font-family: 'Courier New', monospace;
                    color: #00bfff;
                }
                .query-detail-modal .total-row {
                    background: rgba(0,191,255,0.08);
                    font-weight: 500;
                }
            </style>
            
            <div class="query-detail-modal">
                <div class="detail-header">
                    <div>
                        <span class="bill-no">${billNo || 'IN2024001'}</span>
                        <span class="bill-type" style="margin-left: 12px;">${data.type}</span>
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">单据状态：</span>
                        <span class="info-value"><span class="status-badge">${data.status}</span></span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">操作仓库：</span>
                        <span class="info-value">${data.warehouse}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">操作人员：</span>
                        <span class="info-value">${data.operator}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">操作时间：</span>
                        <span class="info-value">${data.time}</span>
                    </div>
                    <div class="info-item" style="grid-column: span 2;">
                        <span class="info-label">供应商：</span>
                        <span class="info-value">${data.supplier}</span>
                    </div>
                    <div class="info-item" style="grid-column: span 2;">
                        <span class="info-label">备注说明：</span>
                        <span class="info-value">${data.remark}</span>
                    </div>
                </div>
                
                <div class="items-section">
                    <div class="section-title">
                        <i class="fas fa-list" style="color: #00bfff;"></i>
                        商品明细
                    </div>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>商品编码</th>
                                <th>商品名称</th>
                                <th>规格</th>
                                <th>数量</th>
                                <th>单位</th>
                                <th>批号</th>
                                <th>有效期</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.items.map(item => `
                                <tr>
                                    <td><span class="code">${item.code}</span></td>
                                    <td>${item.name}</td>
                                    <td>${item.spec}</td>
                                    <td>${item.qty}</td>
                                    <td>${item.unit}</td>
                                    <td>${item.batch}</td>
                                    <td>${item.expire}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">合计：</td>
                                <td>${data.items.reduce((sum, item) => sum + item.qty, 0)}</td>
                                <td colspan="3"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-file-alt" style="margin-right:8px;color:#00bfff;"></i>单据详情',
            content: content,
            width: '750px',
            showCancel: false,
            confirmText: '关闭',
            onConfirm: () => true
        });
    },

    // 设备管理 - 查看详情
    deviceDetail(deviceId) {
        const deviceData = {
            'ZNG-001': {
                name: '智能耗材柜-A1',
                model: 'ZNG-2000',
                location: '手术室-01',
                ip: '192.168.1.101',
                mac: '00:1A:2B:3C:4D:5E',
                status: 'online',
                lastOnline: '2024-01-15 14:32',
                aisleCount: 48,
                usedAisle: 42,
                temperature: '22°C',
                humidity: '45%',
                firmware: 'v2.1.5',
                installDate: '2023-06-15'
            }
        };
        
        const data = deviceData[deviceId] || deviceData['ZNG-001'];
        const statusText = data.status === 'online' ? '在线' : data.status === 'offline' ? '离线' : '告警';
        const statusColor = data.status === 'online' ? '#66bb6a' : data.status === 'offline' ? '#ff6b6b' : '#ffa726';
        
        const content = `
            <style>
                .device-detail-modal .detail-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(0,191,255,0.15);
                }
                .device-detail-modal .device-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, rgba(0,191,255,0.2), rgba(0,191,255,0.05));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: #00bfff;
                    border: 1px solid rgba(0,191,255,0.2);
                }
                .device-detail-modal .device-title {
                    flex: 1;
                }
                .device-detail-modal .device-name {
                    font-size: 18px;
                    font-weight: 600;
                    color: #e6f7ff;
                    margin-bottom: 4px;
                }
                .device-detail-modal .device-id {
                    font-size: 13px;
                    color: #8892a0;
                    font-family: 'Courier New', monospace;
                }
                .device-detail-modal .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    background: ${statusColor}20;
                    color: ${statusColor};
                    border: 1px solid ${statusColor}40;
                }
                .device-detail-modal .info-section {
                    margin-bottom: 20px;
                }
                .device-detail-modal .section-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #e6f7ff;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .device-detail-modal .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px 24px;
                    padding: 16px;
                    background: rgba(0,191,255,0.05);
                    border-radius: 8px;
                    border: 1px solid rgba(0,191,255,0.1);
                }
                .device-detail-modal .info-item {
                    display: flex;
                }
                .device-detail-modal .info-label {
                    width: 80px;
                    color: #8892a0;
                    font-size: 13px;
                }
                .device-detail-modal .info-value {
                    flex: 1;
                    color: #e6f7ff;
                    font-size: 13px;
                }
                .device-detail-modal .metrics-row {
                    display: flex;
                    gap: 16px;
                    margin-top: 16px;
                }
                .device-detail-modal .metric-card {
                    flex: 1;
                    text-align: center;
                    padding: 16px;
                    background: rgba(13,18,32,0.6);
                    border-radius: 8px;
                    border: 1px solid rgba(0,191,255,0.1);
                }
                .device-detail-modal .metric-value {
                    font-size: 24px;
                    font-weight: 600;
                    color: #00bfff;
                    margin-bottom: 4px;
                }
                .device-detail-modal .metric-label {
                    font-size: 12px;
                    color: #8892a0;
                }
            </style>
            
            <div class="device-detail-modal">
                <div class="detail-header">
                    <div class="device-icon">
                        <i class="fas fa-server"></i>
                    </div>
                    <div class="device-title">
                        <div class="device-name">${data.name}</div>
                        <div class="device-id">${deviceId || 'ZNG-001'}</div>
                    </div>
                    <span class="status-badge">${statusText}</span>
                </div>
                
                <div class="info-section">
                    <div class="section-title">
                        <i class="fas fa-info-circle" style="color: #00bfff;"></i>
                        基本信息
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">设备型号：</span>
                            <span class="info-value">${data.model}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">安装位置：</span>
                            <span class="info-value">${data.location}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">IP地址：</span>
                            <span class="info-value">${data.ip}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">MAC地址：</span>
                            <span class="info-value">${data.mac}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">固件版本：</span>
                            <span class="info-value">${data.firmware}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">安装日期：</span>
                            <span class="info-value">${data.installDate}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <div class="section-title">
                        <i class="fas fa-chart-bar" style="color: #00bfff;"></i>
                        运行状态
                    </div>
                    <div class="metrics-row">
                        <div class="metric-card">
                            <div class="metric-value">${data.usedAisle}/${data.aisleCount}</div>
                            <div class="metric-label">货道使用</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${data.temperature}</div>
                            <div class="metric-label">柜内温度</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${data.humidity}</div>
                            <div class="metric-label">柜内湿度</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-server" style="margin-right:8px;color:#00bfff;"></i>设备详情',
            content: content,
            width: '600px',
            showCancel: false,
            confirmText: '关闭',
            onConfirm: () => true
        });
    },

    // 设备管理 - 编辑设备
    editDevice(deviceId) {
        const content = `
            <style>
                .edit-device-form-modal .form-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .edit-device-form-modal .form-group {
                    flex: 1;
                }
                .edit-device-form-modal .form-group.full-width {
                    width: 100%;
                }
                .edit-device-form-modal label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 13px;
                    color: #a0b4d8;
                }
                .edit-device-form-modal label .required {
                    color: #ff6b6b;
                    margin-left: 2px;
                }
                .edit-device-form-modal input,
                .edit-device-form-modal select {
                    width: 100%;
                    height: 40px;
                    padding: 10px 12px;
                    border: 1px solid rgba(0,191,255,0.2);
                    border-radius: 6px;
                    background: rgba(13,18,32,0.6);
                    color: #e6f7ff;
                    font-size: 14px;
                    box-sizing: border-box;
                    transition: all 0.3s;
                }
                .edit-device-form-modal select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2300bfff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 20px;
                    padding-right: 2.5rem;
                    cursor: pointer;
                }
                .edit-device-form-modal select option {
                    background: #1a1f3a;
                    color: #e4e9f2;
                }
                .edit-device-form-modal input:focus,
                .edit-device-form-modal select:focus {
                    outline: none;
                    border-color: #00bfff;
                    box-shadow: 0 0 0 3px rgba(0,191,255,0.1);
                }
                .edit-device-form-modal input:disabled {
                    background: rgba(100,100,100,0.1);
                    color: #8892a0;
                    cursor: not-allowed;
                }
            </style>
            
            <div class="edit-device-form-modal">
                <div class="form-row">
                    <div class="form-group">
                        <label>设备编号</label>
                        <input type="text" value="${deviceId || 'ZNG-001'}" disabled>
                    </div>
                    <div class="form-group">
                        <label>设备名称 <span class="required">*</span></label>
                        <input type="text" id="device-name" value="智能耗材柜-A1">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>设备型号</label>
                        <input type="text" value="ZNG-2000" disabled>
                    </div>
                    <div class="form-group">
                        <label>所属科室 <span class="required">*</span></label>
                        <select id="device-dept">
                            <option value="surgery" selected>手术室</option>
                            <option value="icu">ICU</option>
                            <option value="emergency">急诊科</option>
                            <option value="pharmacy">药房</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>安装位置 <span class="required">*</span></label>
                        <input type="text" id="device-location" value="手术室-01">
                    </div>
                    <div class="form-group">
                        <label>IP地址</label>
                        <input type="text" value="192.168.1.101" disabled>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group full-width">
                        <label>备注说明</label>
                        <input type="text" id="device-remark" value="" placeholder="请输入备注信息（选填）">
                    </div>
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-edit" style="margin-right:8px;color:#00bfff;"></i>编辑设备',
            content: content,
            width: '550px',
            onConfirm: () => {
                const name = document.getElementById('device-name').value.trim();
                const dept = document.getElementById('device-dept').value;
                const location = document.getElementById('device-location').value.trim();
                
                if (!name) {
                    Toast.error('请输入设备名称');
                    return false;
                }
                if (!dept) {
                    Toast.error('请选择所属科室');
                    return false;
                }
                if (!location) {
                    Toast.error('请输入安装位置');
                    return false;
                }
                
                Toast.success('设备信息更新成功！');
                console.log('更新设备:', { deviceId, name, dept, location });
                return true;
            },
            onCancel: () => {},
            confirmText: '保存',
            cancelText: '取消'
        });
    },

    // 设备管理 - 货道管理
    deviceAisle(deviceId) {
        const content = `
            <style>
                .device-aisle-modal .aisle-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .device-aisle-modal .aisle-item {
                    aspect-ratio: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                .device-aisle-modal .aisle-item.empty {
                    background: rgba(100,100,100,0.1);
                    color: #8892a0;
                    border-color: rgba(100,100,100,0.2);
                }
                .device-aisle-modal .aisle-item.used {
                    background: rgba(0,191,255,0.15);
                    color: #00bfff;
                    border-color: rgba(0,191,255,0.3);
                }
                .device-aisle-modal .aisle-item.warning {
                    background: rgba(255,167,38,0.15);
                    color: #ffa726;
                    border-color: rgba(255,167,38,0.3);
                }
                .device-aisle-modal .aisle-item:hover {
                    transform: scale(1.05);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                .device-aisle-modal .aisle-no {
                    font-weight: 600;
                    font-size: 12px;
                }
                .device-aisle-modal .aisle-status {
                    font-size: 10px;
                    opacity: 0.8;
                }
                .device-aisle-modal .legend {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(0,191,255,0.1);
                }
                .device-aisle-modal .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #8892a0;
                }
                .device-aisle-modal .legend-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 2px;
                }
                .device-aisle-modal .legend-dot.empty {
                    background: rgba(100,100,100,0.3);
                }
                .device-aisle-modal .legend-dot.used {
                    background: rgba(0,191,255,0.5);
                }
                .device-aisle-modal .legend-dot.warning {
                    background: rgba(255,167,38,0.5);
                }
            </style>
            
            <div class="device-aisle-modal">
                <div class="aisle-grid">
                    ${Array.from({length: 48}, (_, i) => {
                        const no = i + 1;
                        const status = i < 6 ? 'warning' : i < 42 ? 'used' : 'empty';
                        const statusText = status === 'warning' ? '预警' : status === 'used' ? '使用中' : '空闲';
                        return `
                            <div class="aisle-item ${status}" onclick="Toast.info('货道${no}: ${statusText}')">
                                <span class="aisle-no">${no}</span>
                                <span class="aisle-status">${statusText}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="legend">
                    <div class="legend-item">
                        <div class="legend-dot empty"></div>
                        <span>空闲</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot used"></div>
                        <span>使用中</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot warning"></div>
                        <span>库存预警</span>
                    </div>
                </div>
            </div>
        `;
        
        this.open({
            title: '<i class="fas fa-th" style="margin-right:8px;color:#00bfff;"></i>货道管理',
            content: content,
            width: '600px',
            showCancel: false,
            confirmText: '关闭',
            onConfirm: () => true
        });
    }
};

// ==================== 加载状态 ====================
const Loading = {
    show(message = '加载中...') {
        const loader = document.createElement('div');
        loader.id = 'global-loading';
        loader.innerHTML = `
            <style>
                #global-loading {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(13,18,32,0.9);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                }
                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(0,191,255,0.3);
                    border-top-color: #00bfff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .loading-text {
                    margin-top: 16px;
                    color: #00bfff;
                    font-size: 14px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        document.body.appendChild(loader);
    },

    hide() {
        const loader = document.getElementById('global-loading');
        if (loader) loader.remove();
    }
};

// ==================== 表格操作 ====================
const Table = {
    // 初始化表格功能
    init(tableSelector) {
        const table = document.querySelector(tableSelector);
        if (!table) return;
        
        // 全选功能
        const selectAll = table.querySelector('.select-all');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                table.querySelectorAll('.select-row').forEach(cb => {
                    cb.checked = e.target.checked;
                });
            });
        }
        
        // 行选择
        table.querySelectorAll('.select-row').forEach(cb => {
            cb.addEventListener('change', () => {
                const allChecked = Array.from(table.querySelectorAll('.select-row')).every(c => c.checked);
                if (selectAll) selectAll.checked = allChecked;
            });
        });
    },

    // 获取选中行数据
    getSelected(tableSelector) {
        const table = document.querySelector(tableSelector);
        if (!table) return [];
        
        return Array.from(table.querySelectorAll('.select-row:checked')).map(cb => {
            const row = cb.closest('tr');
            return {
                id: cb.value,
                row: row,
                data: row.dataset
            };
        });
    },

    // 删除行
    deleteRow(row) {
        row.style.transition = 'all 0.3s';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        setTimeout(() => row.remove(), 300);
    }
};

// ==================== 表单验证 ====================
const FormValidator = {
    validate(form) {
        const fields = form.querySelectorAll('[data-validate]');
        let isValid = true;
        
        fields.forEach(field => {
            const rules = field.dataset.validate.split(',');
            const value = field.value.trim();
            let fieldValid = true;
            
            for (let rule of rules) {
                const [ruleName, param] = rule.split(':');
                
                switch(ruleName.trim()) {
                    case 'required':
                        if (!Utils.validators.required(value)) fieldValid = false;
                        break;
                    case 'email':
                        if (value && !Utils.validators.email(value)) fieldValid = false;
                        break;
                    case 'phone':
                        if (value && !Utils.validators.phone(value)) fieldValid = false;
                        break;
                    case 'min':
                        if (value && !Utils.validators.minLength(value, parseInt(param))) fieldValid = false;
                        break;
                }
            }
            
            this.setFieldStatus(field, fieldValid);
            if (!fieldValid) isValid = false;
        });
        
        return isValid;
    },

    setFieldStatus(field, isValid) {
        field.classList.remove('valid', 'invalid');
        field.classList.add(isValid ? 'valid' : 'invalid');
        
        // 移除旧错误提示
        const oldError = field.parentElement.querySelector('.field-error');
        if (oldError) oldError.remove();
        
        if (!isValid) {
            const error = document.createElement('span');
            error.className = 'field-error';
            error.textContent = field.dataset.error || '请输入有效内容';
            field.parentElement.appendChild(error);
        }
    },

    clear(form) {
        form.querySelectorAll('.valid, .invalid').forEach(f => {
            f.classList.remove('valid', 'invalid');
        });
        form.querySelectorAll('.field-error').forEach(e => e.remove());
    }
};

// ==================== 侧边栏切换 ====================
function initSidebarToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        // 移除旧的事件监听器（如果存在）
        const newToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newToggle, menuToggle);
        
        // 添加新的点击事件
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');
            // 触发自定义事件
            window.dispatchEvent(new CustomEvent('sidebarToggle', {
                detail: { collapsed: sidebar.classList.contains('collapsed') }
            }));
        });
    }
}

// ==================== 页面导航 ====================
const Navigation = {
    init() {
        // 侧边栏菜单激活状态
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            if (link.getAttribute('href').includes(currentPage)) {
                link.parentElement.classList.add('active');
            }
        });
        
        // 初始化侧边栏切换
        initSidebarToggle();
    }
};

// ==================== 数据模拟 ====================
const MockData = {
    products: [
        { id: 'P001', name: '手术刀片', spec: '10#', category: '手术器械', supplier: '迈瑞医疗', price: 25.00, stock: 1000, status: 'active' },
        { id: 'P002', name: '医用纱布', spec: '10cm×10cm', category: '耗材', supplier: '稳健医疗', price: 0.50, stock: 5000, status: 'active' },
        { id: 'P003', name: '一次性注射器', spec: '5ml', category: '耗材', supplier: '威高集团', price: 1.20, stock: 2000, status: 'active' }
    ],
    
    generateId(prefix) {
        return `${prefix}${Date.now().toString(36).toUpperCase()}`;
    }
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    
    // 全局按钮点击效果
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // 添加ripple动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to { transform: scale(4); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});

// 导出全局对象
window.App = {
    config: AppConfig,
    utils: Utils,
    toast: Toast,
    modal: Modal,
    loading: Loading,
    table: Table,
    validator: FormValidator,
    mock: MockData
};

// 全局函数：打开个人设置弹窗
window.openPersonalSettingsModal = function() {
    if (typeof Modal !== 'undefined') {
        Modal.personalSettings();
    } else {
        console.error('Modal not loaded');
    }
};

// 全局函数：打开新增供应商弹窗
window.openAddSupplierModal = function() {
    if (typeof Modal !== 'undefined') {
        Modal.addSupplier();
    } else {
        console.error('Modal not loaded');
    }
};

// 全局函数：打开新增标签对照弹窗
window.openAddCodeContrastModal = function() {
    if (typeof Modal !== 'undefined') {
        Modal.addCodeContrast();
    } else {
        console.error('Modal not loaded');
    }
};

// 全局函数：打开新增部门弹窗
window.openAddDepartmentModal = function() {
    if (typeof Modal !== 'undefined') {
        Modal.addDepartment();
    } else {
        console.error('Modal not loaded');
    }
};

// 全局函数：打开查看全部智能柜弹窗
window.openViewAllCabinetsModal = function() {
    if (typeof Modal !== 'undefined') {
        Modal.viewAllCabinets();
    } else {
        console.error('Modal not loaded');
    }
};

// 全局函数：打开新建补货计划弹窗
window.openAddReplenishPlanModal = function() {
    if (typeof Modal !== 'undefined') {
        Modal.addReplenishPlan();
    } else {
        console.error('Modal not loaded');
    }
};

// 全局函数：打开查看补货计划弹窗
window.openViewReplenishPlanModal = function(planId) {
    if (typeof Modal !== 'undefined') {
        Modal.viewReplenishPlan(planId);
    } else {
        console.error('Modal not loaded');
    }
};

// 全局函数：打开执行补货计划弹窗
window.openExecuteReplenishPlanModal = function(planId) {
    if (typeof Modal !== 'undefined') {
        Modal.executeReplenishPlan(planId);
    } else {
        console.error('Modal not loaded');
    }
};

// 全局函数：打开继续补货计划弹窗
window.openContinueReplenishPlanModal = function(planId) {
    if (typeof Modal !== 'undefined') {
        Modal.continueReplenishPlan(planId);
    } else {
        console.error('Modal not loaded');
    }
};

// 全局函数：打开新建盘点任务弹窗
window.openAddStocktakingTaskModal = function() {
    if (typeof Modal !== 'undefined') {
        Modal.addStocktakingTask();
    } else {
        console.error('Modal not loaded');
    }
};

window.openAddUserModal = function() {
    if (typeof Modal !== 'undefined') {
        Modal.addUser();
    } else {
        console.error('Modal not loaded');
    }
};

// 库存预警 - 补货弹窗
window.openReplenishModal = function(productCode, productName, spec, currentStock, minStock) {
    if (typeof Modal !== 'undefined') {
        Modal.replenish(productCode, productName, spec, currentStock, minStock);
    } else {
        console.error('Modal not loaded');
    }
};

// 库存预警 - 忽略预警
window.ignoreWarning = function(productCode) {
    if (confirm('确定要忽略该商品的库存预警吗？')) {
        Toast.success('已忽略该预警');
        // 这里可以添加实际的忽略逻辑
        console.log('忽略预警:', productCode);
    }
};

// 业务查询 - 查看详情
window.openQueryDetailModal = function(billNo, billType) {
    if (typeof Modal !== 'undefined') {
        Modal.queryDetail(billNo, billType);
    } else {
        console.error('Modal not loaded');
    }
};

// 设备管理 - 查看详情
window.openDeviceDetailModal = function(deviceId) {
    if (typeof Modal !== 'undefined') {
        Modal.deviceDetail(deviceId);
    } else {
        console.error('Modal not loaded');
    }
};

// 设备管理 - 编辑设备
window.openEditDeviceModal = function(deviceId) {
    if (typeof Modal !== 'undefined') {
        Modal.editDevice(deviceId);
    } else {
        console.error('Modal not loaded');
    }
};

// 设备管理 - 货道管理
window.openDeviceAisleModal = function(deviceId) {
    if (typeof Modal !== 'undefined') {
        Modal.deviceAisle(deviceId);
    } else {
        console.error('Modal not loaded');
    }
};

// 设备管理 - 重启设备
window.restartDevice = function(deviceId) {
    if (confirm(`确定要重启设备 ${deviceId} 吗？\n\n重启期间设备将暂时无法使用。`)) {
        Toast.success(`设备 ${deviceId} 重启指令已发送`);
        console.log('重启设备:', deviceId);
    }
};
