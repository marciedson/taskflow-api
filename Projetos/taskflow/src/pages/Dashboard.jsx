import "../App.css";
import Header from "../Componentes/Header";
import Kanban from "../Componentes/kanban";
import ModalTarefa from "../Componentes/ModalTarefa";
import modalStyles from "../Componentes/ModalTarefa.module.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Componentes/contexts/AuthContext";
import api from "../api";

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
  };
}

function obterMensagemErro(error, mensagemPadrao) {
  const erros = error.response?.data?.erros;
  if (Array.isArray(erros)) return erros.join(". ");
  return error.response?.data?.erro || error.response?.data?.mensagem || mensagemPadrao;
}

export default function Home() {
  const { token } = useContext(AuthContext);
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState(null);
  const [excluindoTarefa, setExcluindoTarefa] = useState(false);
  const [tarefaSendoRemovida, setTarefaSendoRemovida] = useState(null);

  useEffect(() => {
    let ativo = true;
    Promise.resolve().then(() => {
      if (ativo) {
        setCarregando(true);
        setErro("");
        setTarefas([]);
      }
    });

    api.get("/tarefas")
      .then(({ data }) => {
        if (ativo) {
          setTarefas(data.map(converterTarefa));
        }
      })
      .catch((error) => {
        if (ativo) {
          setErro(obterMensagemErro(error, "Não foi possível carregar suas tarefas."));
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [token]);

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
        const tarefaDoProjeto = tarefas.find((tarefa) => tarefa.projetoId);
        if (!tarefaDoProjeto) {
          setErro("Não há um projeto associado às tarefas para vincular uma nova tarefa.");
          return;
        }

        const ordem = tarefas
          .filter((tarefa) => tarefa.projetoId === tarefaDoProjeto.projetoId)
          .reduce((maiorOrdem, tarefa) => Math.max(maiorOrdem, Number(tarefa.ordem) || 0), 0) + 1;
        const { data } = await api.post("/tarefas", {
          ...payload,
          projetoId: tarefaDoProjeto.projetoId,
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

  return (
    <>
      <Header titulo=" TaskFlow " subtitulo="Gerencie suas tarefas" />
      <main className="container">
        {carregando && <p role="status">Carregando tarefas...</p>}
        {erro && tarefaParaExcluir === null && <p role="alert">{erro}</p>}
        <Kanban
          tarefas={tarefas}
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
