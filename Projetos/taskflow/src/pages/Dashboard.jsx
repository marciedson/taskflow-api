import "../App.css";
import Header from "../Componentes/Header";
import ListaTarefas from "../Componentes/ListaTarefas";
import Contador from "../Componentes/Contador";
import ModalTarefa from "../Componentes/ModalTarefa";
import { useState } from "react";
import Login from "./Login";

export default function Home() {
  const [tarefas, setTarefas] = useState([]);
  const [proximaId, setProximaId] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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

  const handleSave = (taskData) => {
    if (taskData.id) {
      // editar
      setTarefas((current) => current.map((t) => (t.id === taskData.id ? { ...t, ...taskData } : t)));
    } else {
      // criar
      const nova = { ...taskData, id: proximaId, concluida: taskData.concluida || false };
      setTarefas((current) => [...current, nova]);
      setProximaId((id) => id + 1);
    }
    fecharModal();
  };

  const deletarTarefa = (id) => {
    const tarefasAtualizadas = tarefas.filter((tarefa) => tarefa.id !== id);
    setTarefas(tarefasAtualizadas);
    fecharModal();
  };

  const alternarConcluida = (id) => {
    const tarefasAtualizadas = tarefas.map((tarefa) => {
      if (tarefa.id === id) {
        return { ...tarefa, concluida: !tarefa.concluida };
      }
      return tarefa;
    });
    setTarefas(tarefasAtualizadas);
  };

  return (
    <>
      <Header titulo=" TaskFlow " subtitulo="Gerencie suas tarefas" />
      <main className="container">
        <section id="formulario">
          <div className="campo-linha">
            <button id="btn-adicionar" type="button" onClick={abrirCriar}>
              Nova tarefa
            </button>
          </div>
        </section>

        <ListaTarefas tarefas={tarefas} onDeletar={deletarTarefa} onConcluir={alternarConcluida} onEditar={abrirEditar} />

        <ModalTarefa
          isOpen={modalOpen}
          onClose={fecharModal}
          onSave={handleSave}
          onDelete={deletarTarefa}
          task={editingTask}
        />
      </main>
      <footer>
        <p>
          TaskFlow &copy; 2026 &mdash; Marciedson Bernardo &mdash; Todos os direitos reservados.
        </p>
      </footer>
    </>
  );
}
