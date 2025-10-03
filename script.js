class TodoApp {
    constructor() {
        this.todos = this.loadFromLocalStorage();
        this.currentFilter = 'all';
        this.taskToDelete = null;
        
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    // LOCAL STORAGE
    loadFromLocalStorage() {
        const saved = localStorage.getItem('infinity-todos');
        return saved ? JSON.parse(saved) : [];
    }

    saveToLocalStorage() {
        localStorage.setItem('infinity-todos', JSON.stringify(this.todos));
    }

    // FUNCIONALIDADES PRINCIPAIS
    addTask() {
        const taskInput = document.getElementById("taskInput");
        const taskText = taskInput.value.trim();

        if (taskText === "") {
            this.showToast("Digite uma tarefa!", "warning");
            return;
        }

        const newTodo = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(newTodo);
        this.saveToLocalStorage();
        this.render();
        
        taskInput.value = "";
        taskInput.focus();
        
        this.showToast('Tarefa adicionada!', 'success');
    }

    toggleTask(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveToLocalStorage();
        this.render();
    }

    // EDIÇÃO INLINE - NOVA IMPLEMENTAÇÃO
    startEdit(id) {
        this.cancelEdit();
        
        const todo = this.todos.find(t => t.id === id);
        const taskItem = document.querySelector(`[data-id="${id}"]`);
        
        if (!taskItem || !todo) return;

        taskItem.classList.add('editing');
        taskItem.innerHTML = `
            <input type="text" class="edit-input" value="${this.escapeHtml(todo.text)}" autofocus>
            <div class="edit-actions">
                <button class="save-btn" onclick="app.saveEdit(${id})">
                    <i class="fas fa-check"></i> Salvar
                </button>
                <button class="cancel-edit-btn" onclick="app.cancelEdit()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        `;

        // Focar no input e selecionar todo o texto
        const input = taskItem.querySelector('.edit-input');
        input.focus();
        input.select();

        // Enter para salvar, Escape para cancelar
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveEdit(id);
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelEdit();
            }
        });
    }

    saveEdit(id) {
        const taskItem = document.querySelector(`[data-id="${id}"]`);
        const input = taskItem?.querySelector('.edit-input');
        
        if (!input) return;

        const newText = input.value.trim();
        
        if (newText === "") {
            this.showToast("O texto não pode estar vazio!", "warning");
            input.focus();
            return;
        }

        this.todos = this.todos.map(t =>
            t.id === id ? { ...t, text: newText } : t
        );
        
        this.saveToLocalStorage();
        this.render();
        this.showToast('Tarefa editada!', 'success');
    }

    cancelEdit() {
        const editingItem = document.querySelector('.task-item.editing');
        if (editingItem) {
            this.render(); 
        }
    }

    // EXCLUSÃO COM MODAL - NOVA IMPLEMENTAÇÃO
    showDeleteConfirm(id) {
        this.taskToDelete = id;
        const modal = document.getElementById('confirmModal');
        modal.classList.add('show');
        
        // Focar no botão de cancelar para melhor UX
        setTimeout(() => {
            document.getElementById('confirmCancel').focus();
        }, 100);
    }

    confirmDelete() {
        if (this.taskToDelete) {
            this.todos = this.todos.filter(todo => todo.id !== this.taskToDelete);
            this.saveToLocalStorage();
            this.render();
            this.showToast('Tarefa excluída!', 'error');
            this.taskToDelete = null;
        }
        this.hideDeleteConfirm();
    }

    hideDeleteConfirm() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('show');
        this.taskToDelete = null;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
        });
    }

    // ESTATÍSTICAS
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const pending = total - completed;

        const totalEl = document.getElementById('total-tasks');
        const completedEl = document.getElementById('completed-tasks');
        const pendingEl = document.getElementById('pending-tasks');

        if (totalEl) totalEl.textContent = total;
        if (completedEl) completedEl.textContent = completed;
        if (pendingEl) pendingEl.textContent = pending;
    }

    // RENDERIZAÇÃO ATUALIZADA
    render() {
        const taskList = document.getElementById("taskList");
        if (!taskList) return;

        const filteredTodos = this.todos.filter(todo => {
            switch (this.currentFilter) {
                case 'completed': return todo.completed;
                case 'pending': return !todo.completed;
                default: return true;
            }
        });

        if (filteredTodos.length === 0) {
            taskList.innerHTML = this.getEmptyState();
            this.updateStats();
            return;
        }

        taskList.innerHTML = filteredTodos.map(todo => `
            <div class="task-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <span class="task-text">${this.escapeHtml(todo.text)}</span>
                <div class="task-actions">
                    <button class="edit-btn" onclick="app.startEdit(${todo.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                        <span class="btn-text">Editar</span>
                    </button>
                    <button class="done-btn" onclick="app.toggleTask(${todo.id})" title="${todo.completed ? 'Desfazer' : 'Concluir'}">
                        <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'}"></i>
                        <span class="btn-text">${todo.completed ? 'Desfazer' : 'Concluir'}</span>
                    </button>
                    <button class="delete-btn" onclick="app.showDeleteConfirm(${todo.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                        <span class="btn-text">Excluir</span>
                    </button>
                </div>
            </div>
        `).join('');

        this.updateStats();
    }

    getEmptyState() {
        const messages = {
            all: 'Nenhuma tarefa encontrada. Adicione sua primeira tarefa!',
            pending: 'Nenhuma tarefa pendente.',
            completed: 'Nenhuma tarefa concluída ainda.'
        };

        return `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>${messages[this.currentFilter] || messages.all}</h3>
                <p>Clique no botão "Adicionar" para começar</p>
            </div>
        `;
    }

    // TOAST NOTIFICATIONS
    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;

        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getToastColor(type),
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1001',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = { 
            success: 'check-circle', 
            error: 'exclamation-circle', 
            warning: 'exclamation-triangle', 
            info: 'info-circle' 
        };
        return icons[type] || 'info-circle';
    }

    getToastColor(type) {
        const colors = { 
            success: '#48bb78', 
            error: '#f56565', 
            warning: '#ed8936', 
            info: '#4299e1' 
        };
        return colors[type] || '#4299e1';
    }

    // UTILITÁRIOS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // EVENT BINDING ATUALIZADO
    bindEvents() {
        const taskInput = document.getElementById("taskInput");
        const todoForm = document.getElementById("todo-form");
        const filterBtns = document.querySelectorAll(".filter-btn");
        
        // Modal events
        const confirmDeleteBtn = document.getElementById("confirmDelete");
        const confirmCancelBtn = document.getElementById("confirmCancel");
        const modal = document.getElementById("confirmModal");

        // Form submit
        if (todoForm) {
            todoForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.addTask();
            });
        }

        // Enter no input
        if (taskInput) {
            taskInput.addEventListener("keypress", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    this.addTask();
                }
            });
        }

        // Filtros
        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const filter = btn.getAttribute("data-filter");
                this.setFilter(filter);
            });
        });

        // Modal events
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener("click", () => this.confirmDelete());
        }

        if (confirmCancelBtn) {
            confirmCancelBtn.addEventListener("click", () => this.hideDeleteConfirm());
        }

        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    this.hideDeleteConfirm();
                }
            });
        }

        // Escape key para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideDeleteConfirm();
                this.cancelEdit();
            }
        });

        console.log('Todos os eventos vinculados!');
    }
}

// 🚀 INICIALIZAÇÃO
let app;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando TodoApp...');
    app = new TodoApp();
});

// ANIMAÇÕES CSS ADICIONAIS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .btn-text {
        display: inline;
    }
    
    @media (max-width: 480px) {
        .btn-text {
            display: none;
        }
    }
`;
document.head.appendChild(style);