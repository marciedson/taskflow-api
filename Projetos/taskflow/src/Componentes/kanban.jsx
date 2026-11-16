import { useState } from 'react';
import TarefaItem from './TarefaItem';
import styles from './TarefaItem.module.css';

const ORDEM_PRIORIDADE = { alta: 0, media: 1, baixa: 2 };

export default function Kanban({
  tarefas = [],
  adicionarDesabilitado = false,
  usuarioId,
  onAdicionar,
  onDeletar,
  onConcluir,
  onEditar,
  onReordenar,
  reordenacaoDesabilitada = false,
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
  const [tarefaAlvo, setTarefaAlvo] = useState(null);

  const obterStatus = (tarefa) => {
    if (tarefa.status) return tarefa.status;
    return tarefa.concluida ? 'done' : 'pending';
  };

  const mesmaOrdem = (primeira, segunda) =>
    String(primeira.projetoId) === String(segunda.projetoId) &&
    String(primeira.usuarioId) === String(segunda.usuarioId) &&
    (primeira.prioridade || 'media') === (segunda.prioridade || 'media');

  const tarefasOrdenadas = (lista) =>
    [...lista].sort((a, b) => {
      const prioridadeA = ORDEM_PRIORIDADE[a.prioridade] ?? ORDEM_PRIORIDADE.media;
      const prioridadeB = ORDEM_PRIORIDADE[b.prioridade] ?? ORDEM_PRIORIDADE.media;
      return (
        prioridadeA - prioridadeB ||
        (Number(a.ordem) || 0) - (Number(b.ordem) || 0) ||
        Number(a.id) - Number(b.id)
      );
    });

  const moverNaOrdem = (tarefa, direcao, lista) => {
    if (reordenacaoDesabilitada) return;
    const grupo = tarefasOrdenadas(lista.filter((item) => mesmaOrdem(item, tarefa)));
    const indice = grupo.findIndex((item) => item.id === tarefa.id);
    const destino = indice + direcao;
    if (indice < 0 || destino < 0 || destino >= grupo.length) return;

    [grupo[indice], grupo[destino]] = [grupo[destino], grupo[indice]];
    onReordenar(grupo);
  };

  const soltarSobreTarefa = (event, alvo, lista) => {
    const idArrastado =
      event.dataTransfer.getData('text/plain') || String(tarefaArrastada ?? '');
    const arrastada = tarefas.find((item) => String(item.id) === idArrastado);
    if (
      !arrastada ||
      obterStatus(arrastada) !== obterStatus(alvo) ||
      !mesmaOrdem(arrastada, alvo) ||
      reordenacaoDesabilitada
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const grupoOriginal = tarefasOrdenadas(
      lista.filter((item) => mesmaOrdem(item, alvo))
    );
    const grupo = [...grupoOriginal];
    const origem = grupo.findIndex((item) => item.id === arrastada.id);
    const indiceAlvo = grupo.findIndex((item) => item.id === alvo.id);
    if (origem < 0 || indiceAlvo < 0) return;

    const areaAlvo = event.currentTarget.getBoundingClientRect();
    const inserirDepois = event.clientY >= areaAlvo.top + areaAlvo.height / 2;
    let destino = indiceAlvo + (inserirDepois ? 1 : 0);
    const [movida] = grupo.splice(origem, 1);
    if (origem < destino) destino -= 1;
    grupo.splice(destino, 0, movida);

    if (
      grupo.some(
        (item, index) =>
          item.id !== grupoOriginal[index]?.id
      )
    ) {
      onReordenar(grupo);
    }
    setTarefaAlvo(null);
  };

  const iniciarArrasto = (event, tarefa) => {
    if (tarefa.id === tarefaSendoRemovida || reordenacaoDesabilitada) {
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
    setTarefaAlvo(null);
  };

  return (
    <section className={styles.kanbanSection}>
      <div className={styles.kanbanHeader}>
        <h2>Tarefas dos projetos</h2>
        <p>
          Alta, média e baixa prioridade; arraste ou use as setas para ordenar
          tarefas da mesma prioridade. Tarefas de outras contas são somente leitura.
        </p>
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
          const tarefasDaColuna = tarefasOrdenadas(
            tarefas.filter((tarefa) => obterStatus(tarefa) === coluna.id)
          );

          return (
            <div
              className={styles.column}
              key={coluna.id}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setColunaAlvo(coluna.id);
                setTarefaAlvo(null);
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
                  tarefasDaColuna.map((tarefa) => {
                    const grupo = tarefasDaColuna.filter((item) =>
                      mesmaOrdem(item, tarefa)
                    );
                    const indiceNoGrupo = grupo.findIndex(
                      (item) => item.id === tarefa.id
                    );

                    return (
                      <TarefaItem
                        key={tarefa.id}
                        {...tarefa}
                        somenteLeitura={
                          Number(tarefa.usuarioId) !== Number(usuarioId)
                        }
                        status={obterStatus(tarefa)}
                        deletando={tarefa.id === tarefaSendoRemovida}
                        arrastando={tarefa.id === tarefaArrastada}
                        reordenacaoDesabilitada={reordenacaoDesabilitada}
                        comoAlvoDeArrasto={tarefa.id === tarefaAlvo}
                        podeReordenar={
                          Number(tarefa.usuarioId) === Number(usuarioId) &&
                          grupo.length > 1
                        }
                        podeMoverAcima={indiceNoGrupo > 0}
                        podeMoverAbaixo={indiceNoGrupo < grupo.length - 1}
                        onMoverAcima={() =>
                          moverNaOrdem(tarefa, -1, tarefasDaColuna)
                        }
                        onMoverAbaixo={() =>
                          moverNaOrdem(tarefa, 1, tarefasDaColuna)
                        }
                        onArrastoIniciado={(event) =>
                          iniciarArrasto(event, tarefa)
                        }
                        onArrastoSobre={(event) => {
                          const arrastada = tarefas.find(
                            (item) =>
                              String(item.id) ===
                              (event.dataTransfer.getData('text/plain') ||
                                String(tarefaArrastada ?? ''))
                          );
                          if (
                            arrastada &&
                            obterStatus(arrastada) === obterStatus(tarefa) &&
                            mesmaOrdem(arrastada, tarefa) &&
                            !reordenacaoDesabilitada
                          ) {
                            event.preventDefault();
                            event.stopPropagation();
                            event.dataTransfer.dropEffect = 'move';
                            setTarefaAlvo(tarefa.id);
                          }
                        }}
                        onSoltar={(event) =>
                          soltarSobreTarefa(event, tarefa, tarefasDaColuna)
                        }
                        onArrastoFinalizado={() => {
                          setTarefaArrastada(null);
                          setColunaAlvo(null);
                          setTarefaAlvo(null);
                        }}
                        onEditar={() => {
                          if (Number(tarefa.usuarioId) === Number(usuarioId)) {
                            onEditar(tarefa);
                          }
                        }}
                        onDeletar={() => {
                          if (Number(tarefa.usuarioId) === Number(usuarioId)) {
                            onDeletar(tarefa.id);
                          }
                        }}
                        onConcluir={() => {
                          if (Number(tarefa.usuarioId) === Number(usuarioId)) {
                            onConcluir(tarefa.id);
                          }
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
                    );
                  })
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}