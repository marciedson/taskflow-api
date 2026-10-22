import styles from './TarefaItem.module.css';

function TarefaItem({
  texto,
  concluida = false,
  prioridade = 'media',
  status = 'pending',
  usuarioNome,
  projetoNome,
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
      draggable={!deletando}
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
          {endereco && <span className={styles.cepDados}>{endereco}</span>}
        </div>
        <span className={classePrioridade}>{prioridade}</span>
      </div>
      <div className={styles.taskActions}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => onEditar && onEditar()}
        >
          Editar
        </button>
        {status !== 'pending' && (
          <button
            type='button'
            className={styles.actionButton}
            onClick={() => onStatusChange('pending')}
          >
            Pendentes
          </button>
        )}
        {status !== 'inprogress' && (
          <button
            type='button'
            className={styles.actionButton}
            onClick={() => onStatusChange('inprogress')}
          >
            Em Andamento
          </button>
        )}
        {status !== 'done' && (
          <button
            type='button'
            className={styles.actionButton}
            onClick={() => onStatusChange('done')}
          >
            Concluídas
          </button>
        )}
        <button className={styles.btnDeletar} onClick={onDeletar}>
          Excluir
        </button>
      </div>
    </li>
  );
}

export default TarefaItem;
