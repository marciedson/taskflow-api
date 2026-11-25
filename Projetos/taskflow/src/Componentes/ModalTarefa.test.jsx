import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalTarefa from './ModalTarefa';

function abrirModal(props = {}) {
  render(
    <ModalTarefa
      isOpen={true}
      onClose={vi.fn()}
      onSave={vi.fn().mockResolvedValue()}
      onDelete={vi.fn()}
      task={null}
      {...props}
    />
  );
}

describe('ModalTarefa', () => {
  test('fechado não mostra nada', () => {
    abrirModal({ isOpen: false });
    expect(screen.queryByText('Nova tarefa')).not.toBeInTheDocument();
  });

  test('aberto para criar mostra título e valores iniciais', () => {
    abrirModal();
    expect(screen.getByRole('heading', { name: 'Nova tarefa' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tarefa')).toHaveValue('');
    expect(screen.getByLabelText('Prioridade')).toHaveValue('media');
  });

  test('aberto para editar vem preenchido', () => {
    abrirModal({
      task: { id: 7, texto: 'Revisar a API', prioridade: 'alta', cep: '59000000' },
    });
    expect(screen.getByRole('heading', { name: 'Editar tarefa' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tarefa')).toHaveValue('Revisar a API');
    expect(screen.getByLabelText('Prioridade')).toHaveValue('alta');
  });

  test('o que a pessoa digita aparece no campo', async () => {
    const user = userEvent.setup();
    abrirModal();
    const campo = screen.getByLabelText('Tarefa');
    await user.type(campo, 'Estudar mocks');
    expect(campo).toHaveValue('Estudar mocks');
  });

  test('Cancelar e Esc chamam onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    abrirModal({ onClose });
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('Salvar envia os dados preenchidos', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue();
    abrirModal({ onSave });
    await user.type(screen.getByLabelText('Tarefa'), 'Estudar mocks');
    await user.selectOptions(screen.getByLabelText('Prioridade'), 'alta');
    await user.click(screen.getByRole('button', { name: 'Criar' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ texto: 'Estudar mocks', prioridade: 'alta' })
    );
  });

  test('edição envia o id da tarefa', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue();
    abrirModal({
      task: { id: 7, texto: 'Revisar a API', prioridade: 'alta' },
      onSave,
    });
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, texto: 'Revisar a API' })
    );
  });

  test('Salvar pendente desabilita o botão e mostra Salvando', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn(() => new Promise(() => {}));
    abrirModal({ onSave });
    await user.type(screen.getByLabelText('Tarefa'), 'Aguardar API');
    await user.click(screen.getByRole('button', { name: 'Criar' }));
    expect(await screen.findByRole('button', { name: 'Salvando...' })).toBeDisabled();
  });

  test('a API recusa e mostra o erro sem fechar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSave = vi.fn().mockRejectedValue({
      response: { data: { erro: 'texto é obrigatório' } },
    });
    abrirModal({ onClose, onSave });
    await user.type(screen.getByLabelText('Tarefa'), 'Falha esperada');
    await user.click(screen.getByRole('button', { name: 'Criar' }));
    expect(await screen.findByText('texto é obrigatório')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
