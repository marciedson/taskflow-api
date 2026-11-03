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
  onDeletar,
  onConcluir,
  onStatusChange,
  onEditar,
  onExclusaoAnimada,
  onArrastoIniciado,
  onArrastoFinalizado,
}) {
  const classeItem = [
    (concluida ? styles.tarefa + ' ' + styles.concluida : styles.tarefa) +
      ' ' +
      styles[prioridade],
    deletando ? styles.tarefaExcluindo : '',
    arrastando ? styles.tarefaArrastando : '',
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
      draggable={!deletando && !somenteLeitura}
      onDragStart={onArrastoIniciado}
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
