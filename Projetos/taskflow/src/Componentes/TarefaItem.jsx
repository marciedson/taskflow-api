import styles from './TarefaItem.module.css';

function TarefaItem({
  texto,
  concluida = false,
  prioridade = 'media',
  status = 'pending',
  usuarioNome,
  projetoNome,
  somenteLeitura = false,
  cep,
  cepInfo,
  deletando = false,
  arrastando = false,
  reordenacaoDesabilitada = false,
  comoAlvoDeArrasto = false,
  podeReordenar = false,
  podeMoverAcima = false,
  podeMoverAbaixo = false,
  onDeletar,
  onConcluir,
  onStatusChange,
  onEditar,
  onMoverAcima,
  onMoverAbaixo,
  onExclusaoAnimada,
  onArrastoIniciado,
  onArrastoSobre,
  onSoltar,
  onArrastoFinalizado,
}) {
  const classeItem = [
    (concluida ? styles.tarefa + ' ' + styles.concluida : styles.tarefa) +
      ' ' +
      styles[prioridade],
    deletando ? styles.tarefaExcluindo : '',
    arrastando ? styles.tarefaArrastando : '',
    comoAlvoDeArrasto ? styles.tarefaAlvo : '',
  ]
    .filter(Boolean)
    .join(' ');

  const classeTexto =
    concluida
      ? styles.textoTarefa + ' ' + styles['texto-tarefa']
      : styles.textoTarefa;

  const classePrioridade =
    styles['badge-prioridade'] + ' ' + styles['badge-' + prioridade];

  const endereco = cepInfo
    ? `${cepInfo.logradouro || ''}${cepInfo.logradouro ? ', ' : ''}${cepInfo.bairro || ''}${cepInfo.bairro ? ' — ' : ''}${cepInfo.localidade || ''}${cepInfo.uf ? `/${cepInfo.uf}` : ''}`
    : cep
    ? `CEP: ${cep}`
    : null;

  return (
    <li
      className={classeItem}
      draggable={!deletando && !somenteLeitura && !reordenacaoDesabilitada}
      onDragStart={onArrastoIniciado}
      onDragOver={onArrastoSobre}
      onDrop={onSoltar}
      onDragEnd={onArrastoFinalizado}
      onAnimationEnd={deletando ? onExclusaoAnimada : undefined}
    >
      <div className={styles.taskContent}>
        <div>
          <span className={classeTexto} onClick={onConcluir}>
            {texto}
          </span>
          {(projetoNome || usuarioNome) && (
            <span className={styles.cepDados}>
              {projetoNome && `Projeto: ${projetoNome}`}
              {projetoNome && usuarioNome && ' · '}
              {usuarioNome && `Usuário: ${usuarioNome}`}
            </span>
          )}
          {somenteLeitura && <span className={styles.cepDados}>Somente leitura</span>}
          {endereco && <span className={styles.cepDados}>{endereco}</span>}
        </div>
        <span className={classePrioridade}>{prioridade}</span>
      </div>
      <div className={styles.taskActions}>
        {!somenteLeitura && podeReordenar && (
          <div
            className={styles.reorderActions}
            role="group"
            aria-label="Reordenar por prioridade"
          >
            <button
              type="button"
              className={styles.reorderButton}
              aria-label="Mover tarefa para cima"
              title="Mover para cima"
              disabled={!podeMoverAcima || reordenacaoDesabilitada}
              onClick={onMoverAcima}
            >
              ↑
            </button>
            <button
              type="button"
              className={styles.reorderButton}
              aria-label="Mover tarefa para baixo"
              title="Mover para baixo"
              disabled={!podeMoverAbaixo || reordenacaoDesabilitada}
              onClick={onMoverAbaixo}
            >
              ↓
            </button>
          </div>
        )}
        {!somenteLeitura && (
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onEditar && onEditar()}
          >
            Editar
          </button>
        )}
        {!somenteLeitura && status !== 'pending' && (
          <button
            type='button'
            className={styles.actionButton}
            onClick={() => onStatusChange('pending')}
          >
            Pendentes
          </button>
        )}
        {!somenteLeitura && status !== 'inprogress' && (
          <button
            type='button'
            className={styles.actionButton}
            onClick={() => onStatusChange('inprogress')}
          >
            Em Andamento
          </button>
        )}
        {!somenteLeitura && status !== 'done' && (
          <button
            type='button'
            className={styles.actionButton}
            onClick={() => onStatusChange('done')}
          >
            Concluídas
          </button>
        )}
        {!somenteLeitura && (
          <button className={styles.btnDeletar} onClick={onDeletar}>
            Excluir
          </button>
        )}
      </div>
    </li>
  );
}

export default TarefaItem;
