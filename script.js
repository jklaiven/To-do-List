const taskInput = document.getElementById("taskInput"); // Campo de texto para digitar a tarefa
const addTaskBtn = document.getElementById("addTaskBtn"); // Botão para adicionar tarefa
const taskList = document.getElementById("taskList"); // Lista (ul) onde as tarefas ficam
const filterBtns = document.querySelectorAll(".filter-btn"); // Botões de filtro (todas, pendentes, concluídas)

/**
 * Evento: Clicar no botão "Adicionar"
 */
addTaskBtn.addEventListener("click", addTask);

/**
 * Evento: Pressionar "Enter" no campo de texto
 */
taskInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

/***********************************************************
 * Função: Adicionar nova tarefa
 ***********************************************************/
function addTask() {
  const taskText = taskInput.value.trim(); // Remove espaços extras

  // Verifica se o campo está vazio
  if (taskText === "") {
    alert("Digite uma tarefa!");
    return;
  }

  // Cria o elemento <li> para a tarefa
  const li = document.createElement("li");
  li.className = "task-item";
  li.setAttribute("data-status", "pending"); // por padrão, a tarefa é "pendente"

  // Conteúdo da tarefa
  li.innerHTML = `
    <span class="task-text">${taskText}</span>
    <div class="task-actions">
      <button class="done-btn">✔</button>
      <button class="delete-btn">✖</button>
    </div>
  `;

  // Evento: marcar como concluída
  li.querySelector(".done-btn").addEventListener("click", function () {
    li.classList.toggle("completed");

    // Atualiza o status no atributo "data-status"
    if (li.classList.contains("completed")) {
      li.setAttribute("data-status", "completed");
    } else {
      li.setAttribute("data-status", "pending");
    }
  });

  // Evento: deletar tarefa
  li.querySelector(".delete-btn").addEventListener("click", function () {
    li.remove();
  });

  // Adiciona a tarefa à lista
  taskList.appendChild(li);

  // Limpa o campo de input
  taskInput.value = "";
}

/***********************************************************
 * Função: Filtrar tarefas
 * -----------------------------------
 * @param {string} filter - "all" | "pending" | "completed"
 * 
 * Essa função percorre todas as tarefas e:
 * - Exibe todas, se filtro = "all"
 * - Exibe apenas pendentes, se filtro = "pending"
 * - Exibe apenas concluídas, se filtro = "completed"
 ***********************************************************/
function filterTasks(filter) {
  const tasks = document.querySelectorAll(".task-item");

  tasks.forEach((task) => {
    const status = task.getAttribute("data-status");

    if (filter === "all") {
      task.style.display = "flex";
    } else if (filter === status) {
      task.style.display = "flex";
    } else {
      task.style.display = "none";
    }
  });
}

/**
 * Eventos: Clique nos botões de filtro
 */
filterBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    const filter = btn.getAttribute("data-filter"); // pega o filtro do botão
    filterTasks(filter);
  });
});
