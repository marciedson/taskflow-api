import "../App.css";
import Header from "../Componentes/Header";
import Kanban from "../Componentes/kanban";
import ModalTarefa from "../Componentes/ModalTarefa";
import modalStyles from "../Componentes/ModalTarefa.module.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Componentes/contexts/AuthContext";
import api from "../api";
import styles from "./Dashboard.module.css";

const STATUS_PARA_COLUNA = {
  pending: "afazer",
  inprogress: "andamento",
  done: "concluido",
};

const COLUNA_PARA_STATUS = {
  afazer: "pending",
  andamento: "inprogress",
  concluido: "done",
};

function converterTarefa(tarefa) {
  const status = COLUNA_PARA_STATUS[tarefa.coluna] || "pending";

  return {
    ...tarefa,
    texto: tarefa.titulo,
    status,
    concluida: status === "done",
    projetoNome: tarefa.projeto,
    usuarioNome: tarefa.usuario,
  };
}

function obterMensagemErro(error, mensagemPadrao) {
  const erros = error.response?.data?.erros;
  if (Array.isArray(erros)) return erros.join(". ");
  return error.response?.data?.erro ||
    error.response?.data?.mensagem ||
    error.message ||
    mensagemPadrao;
}

export default function Home() {
  const { token, usuario } = useContext(AuthContext);
  const [tarefas, setTarefas] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [nomeNovoProjeto, setNomeNovoProjeto] = useState("");
  const [criandoProjeto, setCriandoProjeto] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState(null);
  const [excluindoTarefa, setExcluindoTarefa] = useState(false);
  const [tarefaSendoRemovida, setTarefaSendoRemovida] = useState(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([api.get("/projetos"), api.get("/tarefas"), api.get("/usuarios")])
      .then(([{ data: projetosCarregados }, { data: tarefasCarregadas }, { data: usuariosCarregados }]) => {
        if (!ativo) return;
        if (
          !Array.isArray(projetosCarregados) ||
          !Array.isArray(tarefasCarregadas) ||
          !Array.isArray(usuariosCarregados)
        ) {
          throw new Error("A API retornou um formato inesperado para os dados compartilhados.");
        }

        setErro("");
        setProjetos(projetosCarregados);
        setProjetoSelecionadoId("todos");
        setTarefas(tarefasCarregadas.map(converterTarefa));
        setUsuarios(usuariosCarregados);
      })
      .catch((error) => {
        if (ativo) {
          setErro(obterMensagemErro(
            error,
            "Não foi possível carregar seus projetos e tarefas."
          ));
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [token, usuario?.id]);

  const abrirCriar = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const abrirEditar = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const criarProjeto = async (event) => {
    event.preventDefault();
    const nome = nomeNovoProjeto.trim();
    if (!nome || criandoProjeto) return;

    setErro("");
    setCriandoProjeto(true);
    try {
      const { data } = await api.post("/projetos", { nome });
      const projeto = data.projeto;
      setProjetos((current) => [...current, projeto]);
      setProjetoSelecionadoId(String(projeto.id));
      setNomeNovoProjeto("");
    } catch (error) {
      setErro(obterMensagemErro(error, "Não foi possível criar o projeto."));
    } finally {
      setCriandoProjeto(false);
    }
  };

  const handleSave = async (taskData) => {
    setErro("");
    const coluna = STATUS_PARA_COLUNA[taskData.status] ||
      (taskData.concluida ? "concluido" : "afazer");
    const payload = {
      titulo: taskData.texto,
      prioridade: taskData.prioridade,
      coluna,
    };

    try {
      if (taskData.id) {
        const { data } = await api.put(`/tarefas/${taskData.id}`, {
          ...payload,
          projetoId: taskData.projetoId,
          ordem: taskData.ordem,
        });
        const tarefaAtualizada = converterTarefa(data.tarefa);
        setTarefas((current) =>
          current.map((tarefa) => tarefa.id === tarefaAtualizada.id ? tarefaAtualizada : tarefa)
        );
      } else {
        if (!projetoSelecionadoId || projetoSelecionadoId === "todos" || !podeAdicionarTarefa) {
          setErro("Selecione um projeto seu antes de adicionar tarefas.");
          return;
        }

        const ordem = tarefas
          .filter((tarefa) => String(tarefa.projetoId) === projetoSelecionadoId)
          .reduce((maiorOrdem, tarefa) => Math.max(maiorOrdem, Number(tarefa.ordem) || 0), 0) + 1;
        const { data } = await api.post("/tarefas", {
          ...payload,
          projetoId: Number(projetoSelecionadoId),
          ordem,
        });
        setTarefas((current) => [...current, converterTarefa(data.tarefa)]);
      }
      fecharModal();
    } catch (error) {
      setErro(obterMensagemErro(error, "Não foi possível salvar a tarefa."));
    }
  };

  const deletarTarefa = (id) => {
    if (tarefaSendoRemovida !== null) return;
    setErro("");
    setTarefaParaExcluir(id);
  };

  const confirmarExclusao = async () => {
    const id = tarefaParaExcluir;
    if (id === null || excluindoTarefa) return;
    setExcluindoTarefa(true);
    setErro("");
    try {
      await api.delete(`/tarefas/${id}`);
      setTarefaParaExcluir(null);
      fecharModal();
      setTarefaSendoRemovida(id);
    } catch (error) {
      setErro(obterMensagemErro(error, "Não foi possível excluir a tarefa."));
    } finally {
      setExcluindoTarefa(false);
    }
  };

  const finalizarAnimacaoExclusao = (id) => {
    if (tarefaSendoRemovida !== id) return;
    setTarefas((current) => current.filter((tarefa) => tarefa.id !== id));
    setTarefaSendoRemovida(null);
  };

  const alternarConcluida = async (id, novoStatus) => {
    const tarefa = tarefas.find((item) => item.id === id);
    if (!tarefa) return;

    const status = novoStatus || (tarefa.concluida ? "pending" : "done");
    setErro("");
    try {
      const { data } = await api.put(`/tarefas/${id}`, {
        titulo: tarefa.texto,
        prioridade: tarefa.prioridade,
        coluna: STATUS_PARA_COLUNA[status],
        projetoId: tarefa.projetoId,
        ordem: tarefa.ordem,
      });
      const tarefaAtualizada = converterTarefa(data.tarefa);
      setTarefas((current) =>
        current.map((item) => item.id === tarefaAtualizada.id ? tarefaAtualizada : item)
      );
    } catch (error) {
      setErro(obterMensagemErro(error, "Não foi possível atualizar o status da tarefa."));
    }
  };

  const tarefasDoProjeto = projetoSelecionadoId === "todos"
    ? tarefas
    : tarefas.filter((tarefa) => String(tarefa.projetoId) === projetoSelecionadoId);
  const projetoSelecionado = projetos.find(
    (projeto) => String(projeto.id) === projetoSelecionadoId
  );
  const podeAdicionarTarefa =
    Number(projetoSelecionado?.usuarioId) === Number(usuario?.id);

  return (
    <>
      <Header titulo=" TaskFlow " subtitulo="Gerencie suas tarefas" />
      <main className="container">
        {carregando && <p role="status">Carregando tarefas...</p>}
        {erro && tarefaParaExcluir === null && <p role="alert">{erro}</p>}
        <section className={styles.workspace} aria-label="Projetos e conta">
          <div className={styles.account}>
            <span className={styles.accountLabel}>Conta conectada</span>
            <strong>{usuario?.nome || "Usuário"}</strong>
            {usuario?.email && <span>{usuario.email}</span>}
          </div>
          <div className={styles.projectControls}>
            <label className={styles.projectField}>
              <span>Projeto ativo</span>
              <select
                value={projetoSelecionadoId}
                onChange={(event) => setProjetoSelecionadoId(event.target.value)}
                disabled={carregando || projetos.length === 0}
              >
                {projetos.length === 0 && (
                  <option value="">Nenhum projeto cadastrado</option>
                )}
                {projetos.length > 0 && (
                  <option value="todos">Todos os projetos</option>
                )}
                {projetos.map((projeto) => (
                  <option key={projeto.id} value={String(projeto.id)}>
                    {projeto.nome} — {projeto.usuarioNome}
                  </option>
                ))}
              </select>
            </label>
            <form className={styles.newProjectForm} onSubmit={criarProjeto}>
              <label className={styles.projectField} htmlFor="novo-projeto">
                <span>Novo projeto</span>
                <input
                  id="novo-projeto"
                  value={nomeNovoProjeto}
                  onChange={(event) => setNomeNovoProjeto(event.target.value)}
                  placeholder="Nome do projeto"
                  maxLength={100}
                />
              </label>
              <button
                type="submit"
                disabled={!nomeNovoProjeto.trim() || criandoProjeto}
              >
                {criandoProjeto ? "Criando..." : "Criar projeto"}
              </button>
            </form>
          </div>
          <div className={styles.sharedUsers}>
            <h2>Usuários</h2>
            {usuarios.length === 0 ? (
              <p>Nenhuma conta cadastrada.</p>
            ) : (
              <ul>
                {usuarios.map((conta) => (
                  <li key={conta.id}>
                    <strong>{conta.nome}</strong>
                    <span>{conta.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {projetoSelecionado && !podeAdicionarTarefa && (
            <p className={styles.readOnlyNotice}>
              Projeto compartilhado de {projetoSelecionado.usuarioNome}; apenas o dono
              pode adicionar tarefas nele.
            </p>
          )}
          {projetoSelecionadoId === "todos" && projetos.length > 0 && (
            <p className={styles.readOnlyNotice}>
              Todos os projetos e tarefas estão visíveis. Selecione um projeto seu para
              adicionar tarefas.
            </p>
          )}
          {projetos.length === 0 && !carregando && (
            <p className={styles.emptyProjects}>
              Crie um projeto para começar a salvar suas tarefas no banco de dados.
            </p>
          )}
        </section>
        <Kanban
          tarefas={tarefasDoProjeto}
          adicionarDesabilitado={!projetoSelecionadoId || carregando || !podeAdicionarTarefa}
          usuarioId={usuario?.id}
          onAdicionar={abrirCriar}
          onDeletar={deletarTarefa}
          onConcluir={alternarConcluida}
          onEditar={abrirEditar}
          tarefaSendoRemovida={tarefaSendoRemovida}
          onExclusaoAnimada={finalizarAnimacaoExclusao}
        />

        <ModalTarefa
          isOpen={modalOpen}
          onClose={fecharModal}
          onSave={handleSave}
          onDelete={deletarTarefa}
          task={editingTask}
        />
        {tarefaParaExcluir !== null && (
          <div
            className={modalStyles.confirmOverlay}
            onMouseDown={() => {
              if (!excluindoTarefa) setTarefaParaExcluir(null);
            }}
          >
            <div
              className={modalStyles.confirmModal}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-delete-title"
              aria-describedby="confirm-delete-description"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <h2 id="confirm-delete-title" className={modalStyles.confirmTitle}>
                Atenção!
              </h2>
              <p id="confirm-delete-description" className={modalStyles.confirmText}>
                Tem certeza que deseja apagar essa tarefa?
              </p>
              {erro && (
                <p className={modalStyles.confirmError} role="alert">
                  {erro}
                </p>
              )}
              <div className={modalStyles.confirmActions}>
                <button
                  type="button"
                  className={modalStyles.cancelBtn}
                  disabled={excluindoTarefa}
                  onClick={() => setTarefaParaExcluir(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={modalStyles.confirmDeleteBtn}
                  disabled={excluindoTarefa}
                  onClick={confirmarExclusao}
                >
                  {excluindoTarefa ? "Apagando..." : "Apagar tarefa"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer>
        <p>
          TaskFlow &copy; 2026 &mdash; Marciedson Bernardo &mdash; Todos os direitos reservados.
        </p>
      </footer>
    </>
  );
}
