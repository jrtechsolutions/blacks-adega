# 🔧 Solução para Erro de CORS

## 🚨 Problema

O erro de CORS ocorre porque o backend no Render não está permitindo requisições do frontend no Netlify.

**Erro:**
```
Access to XMLHttpRequest at 'https://adega-flow-digital.onrender.com/api/login' 
from origin 'https://blacks-adega.netlify.app' has been blocked by CORS policy
```

## ✅ Solução: Configurar FRONTEND_URL no Render

### Passo 1: Acesse o Render

1. Vá para [https://dashboard.render.com](https://dashboard.render.com)
2. Selecione o seu serviço (Web Service)
3. Clique em **Environment** no menu lateral

### Passo 2: Configure a Variável FRONTEND_URL

1. Procure pela variável `FRONTEND_URL`
2. Se não existir, clique em **Add Environment Variable**
3. Configure assim:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://blacks-adega.netlify.app`

**⚠️ IMPORTANTE**: 
- Use a URL exata do seu frontend no Netlify
- Não adicione barra no final (`/`)
- Use `https://` (não `http://`)

### Passo 3: Salvar e Fazer Deploy

1. Clique em **Save Changes**
2. O Render vai automaticamente fazer um novo deploy
3. Aguarde o deploy completar (pode levar alguns minutos)

### Passo 4: Testar

Após o deploy, tente fazer login novamente. O erro de CORS deve desaparecer.

## 🔍 Verificar se Está Funcionando

Você pode verificar se o CORS está configurado corretamente:

1. Acesse o backend: `https://adega-flow-digital.onrender.com`
2. Abra o console do navegador (F12)
3. Tente fazer uma requisição do frontend
4. Verifique se não há mais erros de CORS

## 📝 Múltiplos Domínios (Opcional)

Se você tiver múltiplos domínios (ex: desenvolvimento e produção), pode separar por vírgula:

```
https://blacks-adega.netlify.app,https://adega-element.netlify.app
```

## 🆘 Se Ainda Não Funcionar

### Verificar Logs do Render

1. No Render, vá para o seu serviço
2. Clique em **Logs**
3. Procure por mensagens de erro ou avisos sobre CORS

### Verificar Variáveis de Ambiente

Certifique-se de que estas variáveis estão configuradas:

- ✅ `FRONTEND_URL` = `https://blacks-adega.netlify.app`
- ✅ `DATABASE_URL` = (sua string de conexão do Supabase)
- ✅ `JWT_SECRET` = (uma chave secreta)
- ✅ `NODE_ENV` = `production`

### Testar Localmente

Para testar se o problema é apenas no Render:

1. Configure `FRONTEND_URL` no seu `.env` local:
   ```
   FRONTEND_URL=https://blacks-adega.netlify.app
   ```

2. Execute o backend localmente:
   ```bash
   cd backend
   npm run dev
   ```

3. Tente fazer login do frontend no Netlify

Se funcionar localmente mas não no Render, o problema é a configuração da variável de ambiente no Render.

---

**💡 Dica**: Sempre que mudar o domínio do frontend, atualize a variável `FRONTEND_URL` no Render.
