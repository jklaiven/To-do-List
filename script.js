/***
 * Função: carregarTarefas
 * ------------------------
 * Objetivo:
 *   Recuperar as tarefas armazenadas no localStorage e renderizá-las na tela
 *
 * Observação:
 *   O localStorage salva tudo como string, por isso usamos JSON.parse
 */
function carregarTarefas() {
  let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  tarefas.forEach(tarefa => {
    criarItem(tarefa.texto, tarefa.concluida);
  });
}

/***
 * Função: salvarTarefas
 * ----------------------
 * Objetivo:
 *   Pegar todas as tarefas da <ul> e salvar no localStorage
 */
function salvarTarefas() {
  let itens = document.querySelectorAll("#lista li");
  let tarefas = [];

  itens.forEach(li => {
    tarefas.push({
      texto: li.firstChild.textContent, // pega o texto
      concluida: li.classList.contains("concluida") // verifica se está concluída
    });
  });

  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

/***
 * Função: criarItem
 * -----------------
 * Objetivo:
 *   Criar um item <li> com:
 *    - Texto da tarefa
 *    - Botão de concluir ✅
 *    - Botão de excluir ❌
 *
 * Parâmetros:
 *   texto: string → texto da tarefa
 *   concluida: boolean → se a tarefa já está concluída (usado no carregamento inicial)
 */
function criarItem(texto, concluida = false) {
  let li = document.createElement("li");

  // Define o texto da tarefa
  li.innerText = texto;

  // Se já estava concluída, aplica a classe
  if (concluida) {
    li.classList.add("concluida");
  }

  // Botão de concluir ✅
  let botaoConcluir = document.createElement("button");
  botaoConcluir.innerText = "✅";
  botaoConcluir.onclick = function () {
    li.classList.toggle("concluida"); // alterna entre concluída/não concluída
    salvarTarefas(); // atualiza no localStorage
  };

  // Botão de remover ❌
  let botaoRemover = document.createElement("button");
  botaoRemover.innerText = "❌";
  botaoRemover.onclick = function () {
    li.remove();
    salvarTarefas(); // atualiza no localStorage
  };

  // Inserindo os botões dentro do li
  li.appendChild(botaoConcluir);
  li.appendChild(botaoRemover);

  // Adiciona na lista
  document.getElementById("lista").appendChild(li);

  // Salvar no localStorage
  salvarTarefas();
}

/***
 * Função: adicionarTarefa
 * ------------------------
 * Objetivo:
 *   Capturar texto do input, validar e criar um novo item na lista
 */
function adicionarTarefa() {
  let input = document.getElementById("novaTarefa");
  let texto = input.value;

  if (texto === "") {
    alert("Digite uma tarefa!");
    return;
  }

  criarItem(texto); // cria o li na tela
  input.value = ""; // limpa o campo
}

// Quando a página carrega, puxar tarefas do localStorage
window.onload = carregarTarefas;
