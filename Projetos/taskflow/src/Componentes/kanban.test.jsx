import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Kanban from './kanban';

const tarefas = [
  {
    id: 1,
    texto: 'Modelar o banco',
    status: 'pending',
    prioridade: 'alta',
    usuarioId: 1,
    projetoId: 10,
  },
  {
    id: 2,
    texto: 'Criar a API',
    status: 'inprogress',
    prioridade: 'media',
    usuarioId: 1,
    projetoId: 10,
  },
];

function desenharKanban(props = {}) {
  return render(
    <Kanban
      tarefas={tarefas}
      usuarioId={1}
      onAdicionar={vi.fn()}
      onDeletar={vi.fn()}
      onConcluir={vi.fn()}
      onEditar={vi.fn()}
      onReordenar={vi.fn()}
      {...props}
    />
  );
}

describe('Kanban com API de mentira', () => {
  beforeEach(() => vi.clearAllMocks());

  test('mostra as tarefas recebidas', () => {
    desenharKanban();
    expect(screen.getByText('Modelar o banco')).toBeInTheDocument();
    expect(screen.getByText('Criar a API')).toBeInTheDocument();
  });

  test('X da primeira tarefa chama a ação de excluir', async () => {
    const user = userEvent.setup();
    const onDeletar = vi.fn();
    desenharKanban({ onDeletar });
    await user.click(screen.getAllByRole('button', { name: 'X' })[0]);
    expect(onDeletar).toHaveBeenCalledWith(1);
  });

  test('Em Andamento da primeira tarefa chama api simulada', async () => {
    const user = userEvent.setup();
    const onConcluir = vi.fn();
    desenharKanban({ onConcluir });
    await user.click(screen.getAllByRole('button', { name: 'Em Andamento' })[0]);
    expect(onConcluir).toHaveBeenCalledWith(1, 'inprogress');
  });

  test('botão adicionar abre a ação de criação', async () => {
    const user = userEvent.setup();
    const onAdicionar = vi.fn();
    desenharKanban({ onAdicionar });
    await user.click(screen.getByRole('button', { name: 'Adicionar tarefa' }));
    expect(onAdicionar).toHaveBeenCalledTimes(1);
  });
});
