import { useState } from 'react';
import TarefaItem from './TarefaItem';
import styles from './TarefaItem.module.css';

export default function Kanban({
  tarefas = [],
  adicionarDesabilitado = false,
  usuarioId,
  onAdicionar,
  onDeletar,
  onConcluir,
  onEditar,
  tarefaSendoRemovida,
  onExclusaoAnimada,
}) {
  const colunas = [
    { id: 'pending', titulo: 'Pendentes' },
    { id: 'inprogress', titulo: 'Em andamento' },
    { id: 'done', titulo: 'Concluídas' },
  ];
  const [tarefaArrastada, setTarefaArrastada] = useState(null);
  const [colunaAlvo, setColunaAlvo] = useState(null);

  const obterStatus = (tarefa) => {
    if (tarefa.status) return tarefa.status;
    return tarefa.concluida ? 'done' : 'pending';
  };

  const iniciarArrasto = (event, tarefa) => {
    if (tarefa.id === tarefaSendoRemovida) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(tarefa.id));
    setTarefaArrastada(tarefa.id);
  };

  const soltarNaColuna = (event, coluna) => {
    event.preventDefault();
    const idArrastado =
      event.dataTransfer.getData('text/plain') || String(tarefaArrastada ?? '');
    const tarefa = tarefas.find((item) => String(item.id) === idArrastado);

    if (tarefa && obterStatus(tarefa) !== coluna.id) {
      onConcluir(tarefa.id, coluna.id);
    }

    setTarefaArrastada(null);
    setColunaAlvo(null);
  };

  return (
    <section className={styles.kanbanSection}>
      <div className={styles.kanbanHeader}>
        <h2>Tarefas dos projetos</h2>
        <p>Tarefas de outras contas ficam disponíveis apenas para leitura.</p>
        <button
          type="button"
          className={styles.actionButton}
          onClick={onAdicionar}
          disabled={adicionarDesabilitado}
        >
          Adicionar tarefa
        </button>
      </div>

      <div className={styles.kanbanBoard}>
        {colunas.map((coluna) => {
          const tarefasDaColuna = tarefas.filter(
            (tarefa) => obterStatus(tarefa) === coluna.id
          );

          return (
            <div
              className={styles.column}
              key={coluna.id}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setColunaAlvo(coluna.id);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setColunaAlvo(null);
                }
              }}
              onDrop={(event) => soltarNaColuna(event, coluna)}
            >
              <div className={styles.columnHeader}>
                <span>{coluna.titulo}</span>
                <span className={styles.columnCount}>{tarefasDaColuna.length}</span>
              </div>
              <ul
                className={[
                  styles.columnBody,
                  colunaAlvo === coluna.id ? styles.columnBodyDropTarget : '',
                ].filter(Boolean).join(' ')}
              >
                {tarefasDaColuna.length === 0 ? (
                  <li className={styles.emptyText}>Nenhuma tarefa aqui.</li>
                ) : (
                  tarefasDaColuna.map((tarefa) => (
                    <TarefaItem
                      key={tarefa.id}
                      {...tarefa}
                      somenteLeitura={Number(tarefa.usuarioId) !== Number(usuarioId)}
                      status={obterStatus(tarefa)}
                      deletando={tarefa.id === tarefaSendoRemovida}
                      arrastando={tarefa.id === tarefaArrastada}
                      onArrastoIniciado={(event) => iniciarArrasto(event, tarefa)}
                      onArrastoFinalizado={() => {
                        setTarefaArrastada(null);
                        setColunaAlvo(null);
                      }}
                      onEditar={() => {
                        if (Number(tarefa.usuarioId) === Number(usuarioId)) onEditar(tarefa);
                      }}
                      onDeletar={() => {
                        if (Number(tarefa.usuarioId) === Number(usuarioId)) onDeletar(tarefa.id);
                      }}
                      onConcluir={() => {
                        if (Number(tarefa.usuarioId) === Number(usuarioId)) onConcluir(tarefa.id);
                      }}
                      onStatusChange={(status) => {
                        if (Number(tarefa.usuarioId) === Number(usuarioId)) {
                          onConcluir(tarefa.id, status);
                        }
                      }}
                      onExclusaoAnimada={() => {
                        if (Number(tarefa.usuarioId) === Number(usuarioId)) {
                          onExclusaoAnimada(tarefa.id);
                        }
                      }}
                    />
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}