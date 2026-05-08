/**
 * 智能柜系统 - 页面增强脚本
 * 为所有页面提供通用交互功能
 */

(function() {
    'use strict';

    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // 初始化通用功能
        initButtons();
        initForms();
        initTables();
        initSearch();
        initPagination();
        initFilters();
        console.log('页面增强脚本已加载');
    }

    // 初始化按钮交互
    function initButtons() {
        // 新增按钮
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', () => {
                const pageName = getPageName();
                showAddModal(pageName);
            });
        });

        // 编辑按钮 - 跳过已有自定义onclick处理的按钮
        document.querySelectorAll('.btn-edit, .table-actions .btn-icon[title="编辑"]').forEach(btn => {
            // 如果按钮已有自己的onclick属性（各页面自定义编辑逻辑），不添加通用处理
            if (btn.hasAttribute('onclick')) return;

            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const row = this.closest('tr');
                const id = row?.dataset?.id || 'ID001';
                const name = getRowName(row);
                showEditModal(getPageName(), id, name);
            });
        });

        // 删除按钮
        document.querySelectorAll('.btn-delete, .table-actions .btn-icon[title="删除"], .table-actions .btn-icon.danger').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const row = this.closest('tr');
                const name = getRowName(row);
                
                if (typeof App !== 'undefined' && App.modal) {
                    App.modal.confirm(
                        `确定要删除"${name || '该记录'}"吗？此操作不可恢复。`,
                        () => {
                            if (row) {
                                row.style.transition = 'all 0.3s';
                                row.style.opacity = '0';
                                setTimeout(() => row.remove(), 300);
                            }
                            App.toast.success('删除成功');
                        }
                    );
                } else {
                    if (confirm(`确定要删除"${name || '该记录'}"吗？`)) {
                        if (row) row.remove();
                    }
                }
            });
        });

        // 查看按钮
        document.querySelectorAll('.btn-view, .table-actions .btn-icon[title="查看"]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const row = this.closest('tr');
                const name = getRowName(row);
                showDetailModal(getPageName(), row?.dataset?.id, name);
            });
        });

        // 导入按钮
        document.querySelectorAll('.btn-import').forEach(btn => {
            btn.addEventListener('click', () => {
                if (typeof App !== 'undefined' && App.modal) {
                    App.modal.open({
                        title: '批量导入',
                        width: '500px',
                        content: `
                            <div style="border:2px dashed rgba(0,191,255,0.3);border-radius:8px;padding:40px;text-align:center;cursor:pointer;">
                                <i class="fas fa-cloud-upload-alt" style="font-size:48px;color:#00bfff;margin-bottom:16px;"></i>
                                <p style="color:#e4e9f2;margin-bottom:8px;">点击或拖拽文件到此处上传</p>
                                <p style="color:#8892a0;font-size:12px;">支持 Excel (.xlsx, .xls) 和 CSV 格式</p>
                            </div>
                            <div style="margin-top:16px;text-align:center;">
                                <a href="#" style="color:#00bfff;font-size:13px;"><i class="fas fa-download"></i> 下载导入模板</a>
                            </div>
                        `,
                        onConfirm: () => App.toast.success('文件上传成功，正在处理...')
                    });
                }
            });
        });

        // 导出按钮
        document.querySelectorAll('.btn-export').forEach(btn => {
            btn.addEventListener('click', () => {
                if (typeof App !== 'undefined' && App.toast) {
                    App.toast.success('数据导出成功');
                } else {
                    alert('数据导出成功');
                }
            });
        });

        // 刷新按钮
        document.querySelectorAll('.btn-refresh').forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.add('rotating');
                if (typeof App !== 'undefined' && App.toast) {
                    App.toast.info('正在刷新...');
                }
                setTimeout(() => {
                    this.classList.remove('rotating');
                    if (typeof App !== 'undefined' && App.toast) {
                        App.toast.success('刷新完成');
                    }
                }, 1000);
            });
        });

        // 搜索按钮
        document.querySelectorAll('.btn-search').forEach(btn => {
            btn.addEventListener('click', () => {
                const keyword = document.querySelector('.search-input')?.value;
                if (keyword && typeof App !== 'undefined' && App.toast) {
                    App.toast.info(`正在搜索: ${keyword}`);
                }
            });
        });

        // 重置按钮
        document.querySelectorAll('.btn-reset').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('input[type="text"], select').forEach(el => {
                    if (!el.classList.contains('keep-value')) {
                        el.value = '';
                    }
                });
                if (typeof App !== 'undefined' && App.toast) {
                    App.toast.info('查询条件已重置');
                }
            });
        });
    }

    // 初始化表单
    function initForms() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                const submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
                    
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '提交';
                    }, 1500);
                }
            });
        });
    }

    // 初始化表格
    function initTables() {
        // 全选功能
        document.querySelectorAll('.checkbox-all').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const table = this.closest('table');
                if (table) {
                    table.querySelectorAll('.checkbox-item').forEach(cb => {
                        cb.checked = this.checked;
                    });
                }
            });
        });

        // 行选择
        document.querySelectorAll('.checkbox-item').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const table = this.closest('table');
                if (table) {
                    const allChecked = Array.from(table.querySelectorAll('.checkbox-item')).every(cb => cb.checked);
                    const allCheckbox = table.querySelector('.checkbox-all');
                    if (allCheckbox) allCheckbox.checked = allChecked;
                }
            });
        });

        // 行悬停效果
        document.querySelectorAll('table tbody tr').forEach(row => {
            row.addEventListener('click', function(e) {
                if (e.target.tagName !== 'INPUT' && !e.target.closest('button')) {
                    this.classList.toggle('selected');
                }
            });
        });
    }

    // 初始化搜索
    function initSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', function() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    if (this.value && typeof App !== 'undefined' && App.toast) {
                        App.toast.info(`正在搜索: ${this.value}`);
                    }
                }, 500);
            });
        }
    }

    // 初始化分页
    function initPagination() {
        document.querySelectorAll('.pagination-nav .btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!this.disabled && !this.classList.contains('active')) {
                    document.querySelectorAll('.pagination-nav .btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        });

        document.querySelectorAll('.page-size')?.forEach(select => {
            select.addEventListener('change', function() {
                if (typeof App !== 'undefined' && App.toast) {
                    App.toast.info(`每页显示 ${this.value} 条`);
                }
            });
        });
    }

    // 初始化筛选
    function initFilters() {
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', function() {
                if (typeof App !== 'undefined' && App.toast) {
                    App.toast.info('正在筛选数据...');
                }
            });
        });
    }

    // 辅助函数：获取页面名称
    function getPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        const pageNames = {
            'product': '商品',
            'supplier': '供应商',
            'coding-task': '赋码任务',
            'code-contrast': '标签对照',
            'organization': '组织架构',
            'device': '设备',
            'user': '用户',
            'inventory': '库存',
            'warning': '预警',
            'replenish': '补货',
            'stocktaking': '盘点',
            'query': '查询',
            'report': '报表',
            'trace': '追溯',
            'surgery': '手术排程',
            'charge': '收费'
        };
        return pageNames[filename] || '记录';
    }

    // 辅助函数：获取行名称
    function getRowName(row) {
        if (!row) return '';
        const nameCell = row.querySelector('.product-name, .supplier-name, .user-name, .device-name, td:nth-child(3)');
        return nameCell?.textContent?.trim() || '';
    }

    // 显示新增弹窗
    function showAddModal(pageName) {
        if (typeof App !== 'undefined' && App.modal) {
            App.modal.open({
                title: `新增${pageName}`,
                width: '600px',
                content: `<p style="color:#e4e9f2;">请填写${pageName}信息...</p>`,
                onConfirm: () => App.toast.success(`${pageName}添加成功`)
            });
        }
    }

    // 显示编辑弹窗
    function showEditModal(pageName, id, name) {
        if (typeof App !== 'undefined' && App.modal) {
            App.modal.open({
                title: `编辑${pageName}`,
                width: '600px',
                content: `<p style="color:#e4e9f2;">正在编辑: ${name || id}...</p>`,
                onConfirm: () => App.toast.success(`${pageName}修改成功`)
            });
        }
    }

    // 显示详情弹窗
    function showDetailModal(pageName, id, name) {
        if (typeof App !== 'undefined' && App.modal) {
            App.modal.open({
                title: `${pageName}详情`,
                width: '700px',
                content: `
                    <div style="padding:20px;">
                        <div style="margin-bottom:16px;"><label style="color:#8892a0;display:inline-block;width:100px;">名称:</label><span style="color:#e4e9f2;">${name || '-'}</span></div>
                        <div style="margin-bottom:16px;"><label style="color:#8892a0;display:inline-block;width:100px;">编码:</label><span style="color:#e4e9f2;">${id || '-'}</span></div>
                        <div style="margin-bottom:16px;"><label style="color:#8892a0;display:inline-block;width:100px;">状态:</label><span class="badge badge-green">正常</span></div>
                    </div>
                `,
                showCancel: false,
                confirmText: '关闭'
            });
        }
    }
})();
