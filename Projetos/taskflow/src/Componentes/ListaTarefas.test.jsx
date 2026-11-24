import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListaTarefas from './ListaTarefas';

function tarefasExemplo() {
  return [
    {
      id: 1,
      texto: 'Modelar o banco',
      prioridade: 'alta',
      usuario: 'Ana Lima',
      projeto: 'TaskFlow',
    },
    {
      id: 2,
      texto: 'Criar a API',
      prioridade: 'media',
      usuario: 'Bruno Melo',
      projeto: 'TaskFlow',
    },
    {
      id: 3,
      texto: 'Testar o front',
      prioridade: 'baixa',
      usuario: null,
      projeto: null,
    },
  ];
}

describe('ListaTarefas', () => {
  test('lista vazia mostra a mensagem', () => {
    render(
      <ListaTarefas tarefas={[]} onDeletar={vi.fn()} onConcluir={vi.fn()} />
    );

    expect(
      screen.getByText('Nenhuma tarefa aqui ainda.')
    ).toBeInTheDocument();
  });

  test('com 3 tarefas, mostra 3 itens', () => {
    render(
      <ListaTarefas
        tarefas={tarefasExemplo()}
        onDeletar={vi.fn()}
        onConcluir={vi.fn()}
      />
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  test('tarefa sem responsável mostra "Sem responsável"', () => {
    render(
      <ListaTarefas
        tarefas={tarefasExemplo()}
        onDeletar={vi.fn()}
        onConcluir={vi.fn()}
      />
    );

    expect(screen.getByText(/Sem responsável/)).toBeInTheDocument();
  });

  test('X da segunda tarefa chama o onDeletar com o id 2', async () => {
    const user = userEvent.setup();
    const onDeletar = vi.fn();
    render(
      <ListaTarefas
        tarefas={tarefasExemplo()}
        onDeletar={onDeletar}
        onConcluir={vi.fn()}
      />
    );

    const botoesX = screen.getAllByRole('button', { name: 'X' });
    await user.click(botoesX[1]);

    expect(onDeletar).toHaveBeenCalledWith(2);
  });
});
