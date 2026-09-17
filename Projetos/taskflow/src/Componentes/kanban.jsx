import { useState, useEffect } from 'react';
import api from '../api';
import TarefaItem from './TarefaItem';
import styles from './TarefaItem.module.css';

export default function Kanban() {
  const [tarefas, setTarefas] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarTarefas() {
      try {
        const resposta = await api.get('/tarefas');
        setTarefas(resposta.data);
      } catch (err) {
        setErro('Erro ao carregar as tarefas.');
      }
    }
    carregarTarefas();
  }, []);

  async function salvarTarefa(dados) {
    if (dados.id === undefined) {
  
      try {
        const resposta = await api.post('/tarefas', dados);
        setTarefas([...tarefas, resposta.data]);
      } catch (err) {
        setErro('Erro ao criar tarefa. Tente novamente.');
      }
    } else {
   
      try {
        const resposta = await api.put(`/tarefas/${dados.id}`, dados);
        setTarefas(
          tarefas.map(t => (t.id === dados.id ? resposta.data : t))
        );
      } catch (err) {
        setErro('Erro ao editar tarefa. Tente novamente.');
      }
    }
  }

  async function deletarTarefa(id) {
    try {
      await api.delete(`/tarefas/${id}`);
      setTarefas(tarefas.filter(t => t.id !== id));
    } catch (err) {
      setErro('Erro ao deletar.');
    }
  }

  async function moverTarefa(id, novaColuna) {
    try {
      const resposta = await api.put(`/tarefas/${id}`, { coluna: novaColuna });
      setTarefas(
        tarefas.map(t => (t.id === id ? resposta.data : t))
      );
    } catch (err) {
      setErro('Erro ao mover tarefa.');
    }
  }

  return (
    <div className="kanban-container">
      {erro && <p className="erro">{erro}</p>}

    </div>
  );
}