import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TarefaItem from './TarefaItem';
import ListaTarefas from './ListaTarefas';

function tarefasExemplo() {
  return [
    { id: 1, texto: 'Modelar o banco', prioridade: 'alta', usuario: 'Ana Lima', projeto: 'TaskFlow' },
    { id: 2, texto: 'Criar a API', prioridade: 'media', usuario: 'Bruno Melo', projeto: 'TaskFlow' },
    { id: 3, texto: 'Testar o front', prioridade: 'baixa', usuario: null, projeto: null },
  ];
}

describe('Exercício Dia 7', () => {
  test('na última coluna mostra a ← e não mostra a →', () => {
    render(
      <TarefaItem
        texto="Concluir projeto"
        onMover={vi.fn()}
        colunaAnterior="andamento"
      />
    );

    expect(screen.getByRole('button', { name: '←' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '→' })
    ).not.toBeInTheDocument();
  });

  test('clicar na ← chama o onMover com andamento', async () => {
    const user = userEvent.setup();
    const onMover = vi.fn();
    render(
      <TarefaItem
        texto="Concluir projeto"
        onMover={onMover}
        colunaAnterior="andamento"
      />
    );

    await user.click(screen.getByRole('button', { name: '←' }));

    expect(onMover).toHaveBeenCalledWith('andamento');
  });

  test('projeto TaskFlow aparece 2 vezes', () => {
    render(
      <ListaTarefas
        tarefas={tarefasExemplo()}
        onDeletar={vi.fn()}
        onConcluir={vi.fn()}
      />
    );

    expect(screen.getAllByText(/TaskFlow/)).toHaveLength(2);
  });

  test('tarefa sem projeto mostra Sem projeto', () => {
    render(
      <ListaTarefas
        tarefas={tarefasExemplo()}
        onDeletar={vi.fn()}
        onConcluir={vi.fn()}
      />
    );

    expect(screen.getByText(/Sem projeto/)).toBeInTheDocument();
  });

  test('clicar na → da primeira tarefa chama onMover(1, andamento)', async () => {
    const user = userEvent.setup();
    const onMover = vi.fn();
    render(
      <ListaTarefas
        tarefas={tarefasExemplo()}
        onDeletar={vi.fn()}
        onConcluir={vi.fn()}
        onMover={onMover}
        colunaProxima="andamento"
      />
    );

    const botoesDireita = screen.getAllByRole('button', { name: '→' });
    await user.click(botoesDireita[0]);

    expect(onMover).toHaveBeenCalledWith(1, 'andamento');
  });
});
