import { useState } from 'react';
import TarefaItem from './TarefaItem';
import styles from './TarefaItem.module.css';

export default function Kanban({
  tarefas = [],
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
        <h2>Minhas tarefas</h2>
        <p>Organize suas atividades por etapa.</p>
        <button type="button" className={styles.actionButton} onClick={onAdicionar}>
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
                      status={obterStatus(tarefa)}
                      deletando={tarefa.id === tarefaSendoRemovida}
                      arrastando={tarefa.id === tarefaArrastada}
                      onArrastoIniciado={(event) => iniciarArrasto(event, tarefa)}
                      onArrastoFinalizado={() => {
                        setTarefaArrastada(null);
                        setColunaAlvo(null);
                      }}
                      onEditar={() => onEditar(tarefa)}
                      onDeletar={() => onDeletar(tarefa.id)}
                      onConcluir={() => onConcluir(tarefa.id)}
                      onStatusChange={(status) => onConcluir(tarefa.id, status)}
                      onExclusaoAnimada={() => onExclusaoAnimada(tarefa.id)}
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