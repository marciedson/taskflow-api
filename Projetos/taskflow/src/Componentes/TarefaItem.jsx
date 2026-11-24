import styles from './TarefaItem.module.css';

function TarefaItem({
  texto,
  concluida = false,
  prioridade,
  rotuloPrioridade,
  status = 'pending',
  usuarioNome,
  projetoNome,
  onMover,
  colunaAnterior,
  colunaProxima,
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
  const prioridadeEfetiva = prioridade || 'media';
  const classeItem = [
    (concluida ? styles.tarefa + ' ' + styles.concluida : styles.tarefa) +
      ' ' +
      styles[prioridadeEfetiva],
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
    styles['badge-prioridade'] + ' ' + styles['badge-' + prioridadeEfetiva];
  const textoPrioridade =
    rotuloPrioridade || (prioridade ? prioridade : 'Sem prioridade');
  const textoProjeto =
    projetoNome || 'Sem projeto';
  const textoUsuario =
    usuarioNome || 'Sem responsável';

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
          <span
            className={classeTexto}
            onClick={onConcluir}
            onDoubleClick={() => onEditar && onEditar()}
          >
            {texto}
          </span>
          {(projetoNome || usuarioNome || onMover) && (
            <span className={styles.cepDados}>
              {`Projeto: ${textoProjeto}`}
              {' · '}
              {`Usuário: ${textoUsuario}`}
            </span>
          )}
          {somenteLeitura && <span className={styles.cepDados}>Somente leitura</span>}
          {endereco && <span className={styles.cepDados}>{endereco}</span>}
        </div>
        <span className={classePrioridade}>{textoPrioridade}</span>
      </div>
      <div className={styles.taskActions}>
        {onMover && colunaAnterior && (
          <button
            type="button"
            className={styles.actionButton}
            aria-label="←"
            onClick={() => onMover(colunaAnterior)}
          >
            ←
          </button>
        )}
        {onMover && colunaProxima && (
          <button
            type="button"
            className={styles.actionButton}
            aria-label="→"
            onClick={() => onMover(colunaProxima)}
          >
            →
          </button>
        )}
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
          <button
            className={styles.btnDeletar}
            onClick={onDeletar}
            aria-label="X"
            title="Excluir tarefa"
          >
            X
          </button>
        )}
      </div>
    </li>
  );
}

export default TarefaItem;
