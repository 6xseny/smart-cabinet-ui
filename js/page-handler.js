/**
 * 智能柜系统 - 页面处理器
 * 自动为各页面添加完整的交互功能
 */

// ==================== 登录页处理器 ====================
const LoginPage = {
    init() {
        const form = document.querySelector('.login-form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = form.querySelector('[name="username"]').value;
            const password = form.querySelector('[name="password"]').value;
            
            if (!username || !password) {
                App.toast.error('请输入用户名和密码');
                return;
            }
            
            App.loading.show('登录中...');
            
            // 模拟登录
            setTimeout(() => {
                App.loading.hide();
                App.toast.success('登录成功');
                window.location.href = 'index.html';
            }, 1500);
        });
        
        // 记住密码
        const rememberCheckbox = form.querySelector('[name="remember"]');
        if (rememberCheckbox) {
            rememberCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    App.toast.info('已开启记住密码');
                }
            });
        }
    }
};

// ==================== 工作台处理器 ====================
const DashboardPage = {
    init() {
        // 刷新按钮
        document.querySelectorAll('.btn-refresh').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.add('rotating');
                App.toast.info('正在刷新数据...');
                setTimeout(() => {
                    btn.classList.remove('rotating');
                    App.toast.success('数据已更新');
                }, 1000);
            });
        });
        
        // 查看更多
        document.querySelectorAll('.btn-more').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                if (target) {
                    window.location.href = `pages/${target}.html`;
                }
            });
        });
        
        // 快捷操作
        document.querySelectorAll('.quick-action').forEach(action => {
            action.addEventListener('click', () => {
                const page = action.dataset.page;
                if (page) {
                    window.location.href = `pages/${page}.html`;
                }
            });
        });
        
        // 初始化图表（如果有）
        this.initCharts();
    },
    
    initCharts() {
        // 图表初始化逻辑
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            // 这里可以集成 Chart.js 或其他图表库
        });
    }
};

// ==================== 商品档案处理器 ====================
const ProductPage = {
    init() {
        // 初始化表格
        App.table.init('.data-table');
        
        // 新增按钮
        const addBtn = document.querySelector('.btn-add');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }
        
        // 编辑按钮
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const id = row?.dataset?.id;
                this.showEditModal(id);
            });
        });
        
        // 删除按钮
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const name = row?.querySelector('.product-name')?.textContent;
                App.modal.confirm(
                    `确定要删除商品"${name}"吗？此操作不可恢复。`,
                    () => {
                        App.table.deleteRow(row);
                        App.toast.success('删除成功');
                    }
                );
            });
        });
        
        // 导入按钮
        const importBtn = document.querySelector('.btn-import');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.showImportModal());
        }
        
        // 导出按钮
        const exportBtn = document.querySelector('.btn-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                App.toast.success('商品数据导出成功');
            });
        }
        
        // 搜索
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.handleSearch(searchInput.value);
            }, 500));
        }
        
        // 筛选
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', () => this.handleFilter());
        });
        
        // 批量操作
        const batchDeleteBtn = document.querySelector('.btn-batch-delete');
        if (batchDeleteBtn) {
            batchDeleteBtn.addEventListener('click', () => this.handleBatchDelete());
        }
    },
    
    showAddModal() {
        App.modal.form({
            title: '新增商品',
            width: '600px',
            fields: [
                { label: '商品编码', name: 'code', type: 'text', required: true, placeholder: '系统自动生成或手动输入' },
                { label: '商品名称', name: 'name', type: 'text', required: true, placeholder: '请输入商品名称' },
                { label: '规格型号', name: 'spec', type: 'text', placeholder: '请输入规格型号' },
                { label: '商品分类', name: 'category', type: 'select', options: [
                    { value: '', label: '请选择分类' },
                    { value: 'surgical', label: '手术器械' },
                    { value: 'consumable', label: '耗材' },
                    { value: 'device', label: '设备' }
                ]},
                { label: '供应商', name: 'supplier', type: 'select', options: [
                    { value: '', label: '请选择供应商' },
                    { value: 'mindray', label: '迈瑞医疗' },
                    { value: 'winner', label: '稳健医疗' },
                    { value: 'wego', label: '威高集团' }
                ]},
                { label: '单价', name: 'price', type: 'number', placeholder: '请输入单价' },
                { label: '库存预警值', name: 'warningStock', type: 'number', placeholder: '请输入预警库存数量' }
            ],
            onSubmit: (data) => {
                App.toast.success('商品添加成功');
                console.log('新增商品数据:', data);
            }
        });
    },
    
    showEditModal(id) {
        App.modal.form({
            title: '编辑商品',
            width: '600px',
            fields: [
                { label: '商品编码', name: 'code', type: 'text', value: id || 'P001', readonly: true },
                { label: '商品名称', name: 'name', type: 'text', value: '手术刀片', required: true },
                { label: '规格型号', name: 'spec', type: 'text', value: '10#' },
                { label: '商品分类', name: 'category', type: 'select', value: 'surgical', options: [
                    { value: 'surgical', label: '手术器械' },
                    { value: 'consumable', label: '耗材' },
                    { value: 'device', label: '设备' }
                ]},
                { label: '供应商', name: 'supplier', type: 'select', value: 'mindray', options: [
                    { value: 'mindray', label: '迈瑞医疗' },
                    { value: 'winner', label: '稳健医疗' },
                    { value: 'wego', label: '威高集团' }
                ]},
                { label: '单价', name: 'price', type: 'number', value: '25.00' },
                { label: '库存预警值', name: 'warningStock', type: 'number', value: '100' }
            ],
            onSubmit: (data) => {
                App.toast.success('商品修改成功');
                console.log('编辑商品数据:', data);
            }
        });
    },
    
    showImportModal() {
        App.modal.open({
            title: '批量导入商品',
            width: '500px',
            content: `
                <div class="import-area">
                    <div class="upload-zone" style="border:2px dashed rgba(0,191,255,0.3);border-radius:8px;padding:40px;text-align:center;cursor:pointer;transition:all 0.3s;">
                        <i class="fas fa-cloud-upload-alt" style="font-size:48px;color:#00bfff;margin-bottom:16px;"></i>
                        <p style="color:#e4e9f2;margin-bottom:8px;">点击或拖拽文件到此处上传</p>
                        <p style="color:#8892a0;font-size:12px;">支持 Excel (.xlsx, .xls) 格式</p>
                    </div>
                    <div class="template-download" style="margin-top:16px;text-align:center;">
                        <a href="#" style="color:#00bfff;font-size:13px;">
                            <i class="fas fa-download"></i> 下载导入模板
                        </a>
                    </div>
                </div>
            `,
            onConfirm: () => {
                App.toast.success('文件上传成功，正在处理...');
            }
        });
        
        // 上传区域交互
        setTimeout(() => {
            const uploadZone = document.querySelector('.upload-zone');
            if (uploadZone) {
                uploadZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadZone.style.borderColor = '#00bfff';
                    uploadZone.style.background = 'rgba(0,191,255,0.1)';
                });
                uploadZone.addEventListener('dragleave', () => {
                    uploadZone.style.borderColor = 'rgba(0,191,255,0.3)';
                    uploadZone.style.background = 'transparent';
                });
                uploadZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadZone.style.borderColor = 'rgba(0,191,255,0.3)';
                    uploadZone.style.background = 'transparent';
                    App.toast.success('文件已选择');
                });
            }
        }, 100);
    },
    
    handleSearch(keyword) {
        if (!keyword) return;
        App.toast.info(`正在搜索: ${keyword}`);
        // 实际搜索逻辑
    },
    
    handleFilter() {
        App.toast.info('正在筛选数据...');
        // 实际筛选逻辑
    },
    
    handleBatchDelete() {
        const selected = App.table.getSelected('.data-table');
        if (selected.length === 0) {
            App.toast.warning('请先选择要删除的商品');
            return;
        }
        App.modal.confirm(
            `确定要删除选中的 ${selected.length} 个商品吗？`,
            () => {
                selected.forEach(item => App.table.deleteRow(item.row));
                App.toast.success('批量删除成功');
            }
        );
    }
};

// ==================== 供应商管理处理器 ====================
const SupplierPage = {
    init() {
        App.table.init('.data-table');
        
        // 新增供应商
        const addBtn = document.querySelector('.btn-add');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }
        
        // 编辑
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                this.showEditModal(row?.dataset?.id);
            });
        });
        
        // 删除
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const name = row?.querySelector('.supplier-name')?.textContent;
                App.modal.confirm(
                    `确定要删除供应商"${name}"吗？`,
                    () => {
                        App.table.deleteRow(row);
                        App.toast.success('删除成功');
                    }
                );
            });
        });
        
        // 查看详情
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                this.showDetailModal(row?.dataset?.id);
            });
        });
    },
    
    showAddModal() {
        App.modal.form({
            title: '新增供应商',
            width: '600px',
            fields: [
                { label: '供应商编码', name: 'code', type: 'text', required: true },
                { label: '供应商名称', name: 'name', type: 'text', required: true },
                { label: '联系人', name: 'contact', type: 'text', required: true },
                { label: '联系电话', name: 'phone', type: 'text', required: true },
                { label: '邮箱', name: 'email', type: 'email' },
                { label: '地址', name: 'address', type: 'textarea' },
                { label: '合作状态', name: 'status', type: 'select', options: [
                    { value: 'active', label: '合作中' },
                    { value: 'inactive', label: '已停用' }
                ]}
            ],
            onSubmit: (data) => {
                App.toast.success('供应商添加成功');
            }
        });
    },
    
    showEditModal(id) {
        App.modal.form({
            title: '编辑供应商',
            width: '600px',
            fields: [
                { label: '供应商编码', name: 'code', type: 'text', value: id },
                { label: '供应商名称', name: 'name', type: 'text', value: '迈瑞医疗' },
                { label: '联系人', name: 'contact', type: 'text', value: '张经理' },
                { label: '联系电话', name: 'phone', type: 'text', value: '13800138000' },
                { label: '邮箱', name: 'email', type: 'email', value: 'contact@mindray.com' },
                { label: '地址', name: 'address', type: 'textarea', value: '深圳市南山区' },
                { label: '合作状态', name: 'status', type: 'select', value: 'active', options: [
                    { value: 'active', label: '合作中' },
                    { value: 'inactive', label: '已停用' }
                ]}
            ],
            onSubmit: (data) => {
                App.toast.success('供应商修改成功');
            }
        });
    },
    
    showDetailModal(id) {
        App.modal.open({
            title: '供应商详情',
            width: '700px',
            content: `
                <div class="supplier-detail">
                    <div class="detail-section">
                        <h4>基本信息</h4>
                        <div class="detail-grid">
                            <div class="detail-item"><label>供应商编码:</label><span>S001</span></div>
                            <div class="detail-item"><label>供应商名称:</label><span>迈瑞医疗</span></div>
                            <div class="detail-item"><label>联系人:</label><span>张经理</span></div>
                            <div class="detail-item"><label>联系电话:</label><span>13800138000</span></div>
                            <div class="detail-item"><label>邮箱:</label><span>contact@mindray.com</span></div>
                            <div class="detail-item"><label>合作状态:</label><span class="status-badge active">合作中</span></div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4>供应商品</h4>
                        <table class="detail-table">
                            <thead><tr><th>商品编码</th><th>商品名称</th><th>规格</th><th>单价</th></tr></thead>
                            <tbody>
                                <tr><td>P001</td><td>手术刀片</td><td>10#</td><td>¥25.00</td></tr>
                                <tr><td>P002</td><td>手术剪刀</td><td>14cm</td><td>¥45.00</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `,
            showCancel: false,
            confirmText: '关闭'
        });
    }
};

// ==================== 赋码任务处理器 ====================
const CodingTaskPage = {
    init() {
        App.table.init('.data-table');
        
        // 新建任务
        const addBtn = document.querySelector('.btn-add');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }
        
        // 启动任务
        document.querySelectorAll('.btn-start').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                App.modal.confirm('确定要启动此任务吗？', () => {
                    App.toast.success('任务已启动');
                    // 更新状态显示
                    const statusCell = row?.querySelector('.task-status');
                    if (statusCell) {
                        statusCell.innerHTML = '<span class="status-badge running">进行中</span>';
                    }
                });
            });
        });
        
        // 暂停任务
        document.querySelectorAll('.btn-pause').forEach(btn => {
            btn.addEventListener('click', () => {
                App.toast.warning('任务已暂停');
            });
        });
        
        // 停止任务
        document.querySelectorAll('.btn-stop').forEach(btn => {
            btn.addEventListener('click', () => {
                App.modal.confirm('确定要停止此任务吗？', () => {
                    App.toast.success('任务已停止');
                });
            });
        });
        
        // 查看进度
        document.querySelectorAll('.btn-progress').forEach(btn => {
            btn.addEventListener('click', () => this.showProgressModal());
        });
        
        // 删除任务
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                App.modal.confirm('确定要删除此任务吗？', () => {
                    App.table.deleteRow(row);
                    App.toast.success('任务已删除');
                });
            });
        });
    },
    
    showAddModal() {
        App.modal.form({
            title: '新建赋码任务',
            width: '600px',
            fields: [
                { label: '任务名称', name: 'name', type: 'text', required: true },
                { label: '商品', name: 'product', type: 'select', required: true, options: [
                    { value: '', label: '请选择商品' },
                    { value: 'P001', label: '手术刀片' },
                    { value: 'P002', label: '医用纱布' }
                ]},
                { label: '赋码数量', name: 'quantity', type: 'number', required: true },
                { label: '码制类型', name: 'codeType', type: 'select', options: [
                    { value: 'qrcode', label: '二维码' },
                    { value: 'barcode', label: '条形码' },
                    { value: 'rfid', label: 'RFID' }
                ]},
                { label: '优先级', name: 'priority', type: 'select', options: [
                    { value: 'high', label: '高' },
                    { value: 'normal', label: '普通' },
                    { value: 'low', label: '低' }
                ]},
                { label: '备注', name: 'remark', type: 'textarea' }
            ],
            onSubmit: (data) => {
                App.toast.success('赋码任务创建成功');
            }
        });
    },
    
    showProgressModal() {
        App.modal.open({
            title: '任务进度',
            width: '500px',
            content: `
                <div class="progress-modal">
                    <div class="progress-info">
                        <div class="progress-item">
                            <span>任务名称:</span><strong>手术刀片批量赋码</strong>
                        </div>
                        <div class="progress-item">
                            <span>总数量:</span><strong>1000</strong>
                        </div>
                        <div class="progress-item">
                            <span>已完成:</span><strong>750</strong>
                        </div>
                        <div class="progress-item">
                            <span>成功率:</span><strong style="color:#00ff88;">99.8%</strong>
                        </div>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width:75%"></div>
                        <span class="progress-text">75%</span>
                    </div>
                    <div class="progress-log">
                        <h4>执行日志</h4>
                        <div class="log-content">
                            <p><span class="time">10:23:45</span> 任务启动成功</p>
                            <p><span class="time">10:23:46</span> 开始赋码...</p>
                            <p><span class="time">10:25:12</span> 已处理 500 个</p>
                            <p><span class="time">10:26:30</span> 已处理 750 个</p>
                        </div>
                    </div>
                </div>
            `,
            showCancel: false,
            confirmText: '关闭'
        });
    }
};

// ==================== 库存查询处理器 ====================
const InventoryPage = {
    init() {
        App.table.init('.data-table');
        
        // 查询按钮
        const searchBtn = document.querySelector('.btn-search');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }
        
        // 重置按钮
        const resetBtn = document.querySelector('.btn-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                document.querySelectorAll('.search-form input, .search-form select').forEach(el => {
                    el.value = '';
                });
                App.toast.info('查询条件已重置');
            });
        }
        
        // 导出
        const exportBtn = document.querySelector('.btn-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                App.toast.success('库存数据导出成功');
            });
        }
        
        // 查看详情
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                this.showDetailModal(row?.dataset?.id);
            });
        });
        
        // 库存调整
        document.querySelectorAll('.btn-adjust').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                this.showAdjustModal(row?.dataset?.id);
            });
        });
    },
    
    handleSearch() {
        App.loading.show('正在查询...');
        setTimeout(() => {
            App.loading.hide();
            App.toast.success('查询完成');
        }, 800);
    },
    
    showDetailModal(id) {
        App.modal.open({
            title: '库存详情',
            width: '700px',
            content: `
                <div class="inventory-detail">
                    <div class="detail-header">
                        <div class="product-info">
                            <h3>手术刀片 10#</h3>
                            <p>编码: ${id || 'P001'}</p>
                        </div>
                        <div class="stock-summary">
                            <div class="summary-item">
                                <span class="label">当前库存</span>
                                <span class="value" style="color:#00ff88;font-size:24px;">1,250</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4>库存分布</h4>
                        <table class="detail-table">
                            <thead>
                                <tr><th>库位</th><th>批次</th><th>数量</th><th>入库时间</th><th>有效期</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>A-01-03</td><td>202403001</td><td>500</td><td>2024-03-15</td><td>2026-03-14</td></tr>
                                <tr><td>A-01-04</td><td>202403002</td><td>500</td><td>2024-03-20</td><td>2026-03-19</td></tr>
                                <tr><td>B-02-01</td><td>202402015</td><td>250</td><td>2024-02-28</td><td>2026-02-27</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `,
            showCancel: false,
            confirmText: '关闭'
        });
    },
    
    showAdjustModal(id) {
        App.modal.form({
            title: '库存调整',
            width: '500px',
            fields: [
                { label: '商品编码', name: 'code', type: 'text', value: id || 'P001', readonly: true },
                { label: '商品名称', name: 'name', type: 'text', value: '手术刀片', readonly: true },
                { label: '当前库存', name: 'currentStock', type: 'text', value: '1250', readonly: true },
                { label: '调整类型', name: 'adjustType', type: 'select', required: true, options: [
                    { value: '', label: '请选择' },
                    { value: 'increase', label: '盘盈' },
                    { value: 'decrease', label: '盘亏' },
                    { value: 'correction', label: '纠错' }
                ]},
                { label: '调整数量', name: 'adjustQty', type: 'number', required: true },
                { label: '调整原因', name: 'reason', type: 'textarea', required: true }
            ],
            onSubmit: (data) => {
                App.toast.success('库存调整已提交，等待审核');
            }
        });
    }
};

// ==================== 页面路由 ====================
const PageRouter = {
    init() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop().replace('.html', '') || 'index';
        
        switch(pageName) {
            case 'login':
                LoginPage.init();
                break;
            case 'index':
                DashboardPage.init();
                break;
            case 'product':
                ProductPage.init();
                break;
            case 'supplier':
                SupplierPage.init();
                break;
            case 'coding-task':
                CodingTaskPage.init();
                break;
            case 'inventory':
                InventoryPage.init();
                break;
            // 其他页面可以继续添加
            default:
                console.log(`页面 ${pageName} 的处理器尚未实现`);
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    PageRouter.init();
});
