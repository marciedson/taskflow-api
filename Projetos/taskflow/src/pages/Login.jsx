import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();

  function handleLogin(event) {
    event.preventDefault();

    if (usuario === 'marciedson' && senha === '@marciedson26') {
      onLogin(usuario);
      navigate('/dashboard');
      return;
    }

    setErro('Usuário ou senha inválidos');
    setShake(true);
    
    setTimeout(() => {
      setShake(false);
    }, 500);
  }

  return (
    <main className="login-page">
      <form className={`login-form ${shake ? 'shake' : ''}`} onSubmit={handleLogin}>
        <h2>Login</h2>
        <label>
          Usuário 👤
          <input
            type="text"
            value={usuario}
            onChange={(event) => setUsuario(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {erro && <p className="login-error">{erro}</p>}
        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}

export default Login;
