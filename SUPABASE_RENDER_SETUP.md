# 🔧 Configuração do Supabase no Render

Este guia explica como configurar corretamente a conexão do Supabase com o Render.

## 📋 O Problema

O erro `FATAL: Tenant or user not found` ocorre quando a `DATABASE_URL` está incorreta ou mal formatada.

## 🔍 Como Obter a String de Conexão Correta do Supabase

### Passo 1: Acesse o Painel do Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto que você quer usar

### Passo 2: Obtenha as Credenciais de Conexão

**Opção A: Se você encontrar a seção Connection string**

1. No painel do Supabase, vá em **Settings** (Configurações)
2. Clique em **Database** no menu lateral
3. Role até a seção **Connection string** ou **Connection info**
4. Você verá diferentes opções de conexão

**Opção B: Se NÃO encontrar a Connection string (construir manualmente)**

Se você não encontrar a seção de Connection String, você pode construir manualmente usando as informações do seu projeto:

1. **Project ID**: Você encontra em **Settings → General → Project ID**
   - No seu caso: `wefmkatlfwgaqfapzutd`

2. **Database Password**: Em **Settings → Database → Database password**
   - Se você não souber, clique em **Reset database password** para criar uma nova

3. **Região**: Geralmente está em **Settings → General** ou você pode verificar na URL do seu projeto
   - Exemplos: `sa-east-1` (Brasil), `us-east-1` (EUA), etc.

### Passo 3: Escolha o Tipo de Conexão

O Supabase oferece dois tipos de conexão:

#### **Opção 1: Connection Pooling (Recomendado para Render)**

Use a porta **6543** (pooler) - melhor para aplicações serverless e Render:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Exemplo:**
```
postgresql://postgres.abcdefghijklmnop:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### **Opção 2: Direct Connection (Conexão Direta)**

Use a porta **5432** (direta) - use apenas se a pooler não funcionar:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Exemplo:**
```
postgresql://postgres:[SUA-SENHA]@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### Passo 4: Construa ou Copie a String Completa

**Se você encontrou a Connection String:**
1. Clique no botão **Copy** ao lado da string de conexão
2. **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha real do seu banco
3. A senha do banco está na mesma página, na seção **Database password**

**Se você NÃO encontrou a Connection String (construir manualmente):**

Use este formato substituindo os valores:

**Para Connection Pooling (Recomendado - Porta 6543):**
```
postgresql://postgres.[PROJECT-ID]:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Exemplo com seus dados:**
```
postgresql://postgres.wefmkatlfwgaqfapzutd:SUA_SENHA_AQUI@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Para Conexão Direta (Porta 5432):**
```
postgresql://postgres:[SENHA]@db.[PROJECT-ID].supabase.co:5432/postgres
```

**Exemplo com seus dados:**
```
postgresql://postgres:SUA_SENHA_AQUI@db.wefmkatlfwgaqfapzutd.supabase.co:5432/postgres
```

**Onde encontrar cada informação:**
- `[PROJECT-ID]`: Settings → General → Project ID (seu: `wefmkatlfwgaqfapzutd`)
- `[SENHA]`: Settings → Database → Database password (ou reset se não souber)
- `[REGIAO]`: Geralmente `sa-east-1` para Brasil, ou verifique na URL do projeto

## ⚙️ Configurando no Render

### Passo 1: Acesse as Variáveis de Ambiente

1. No painel do Render, vá para o seu serviço (Web Service)
2. Clique em **Environment** no menu lateral
3. Procure pela variável `DATABASE_URL`

### Passo 2: Configure a DATABASE_URL

1. Se a variável não existir, clique em **Add Environment Variable**
2. **Key**: `DATABASE_URL`
3. **Value**: Cole a string de conexão completa do Supabase (com a senha substituída)

**Formato correto:**
```
postgresql://postgres.abcdefghijklmnop:SUA_SENHA_AQUI@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Passo 3: Verifique Outras Variáveis Necessárias

Certifique-se de que estas variáveis também estão configuradas:

- `NODE_ENV=production`
- `JWT_SECRET` (uma chave secreta forte)
- `FRONTEND_URL` (URL do seu frontend no Netlify)
- `PORT` (geralmente o Render define automaticamente)

### Passo 4: Salve e Faça Deploy

1. Clique em **Save Changes**
2. O Render vai automaticamente fazer um novo deploy
3. Aguarde o build completar

## 🔐 Segurança da Senha

**IMPORTANTE**: A senha do banco de dados é sensível. Certifique-se de:

1. ✅ Nunca commitar a senha no Git
2. ✅ Usar apenas variáveis de ambiente no Render
3. ✅ Não compartilhar a senha publicamente
4. ✅ Usar uma senha forte (mínimo 16 caracteres)

## 🧪 Testando a Conexão

Após configurar, você pode testar a conexão localmente:

```bash
# Instale o psql (se não tiver)
# No Windows: baixe o PostgreSQL

# Teste a conexão
psql "postgresql://postgres.abcdefghijklmnop:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## 🚨 Troubleshooting

### Erro: "FATAL: Tenant or user not found"

**Causas possíveis:**
1. ❌ Senha incorreta na string de conexão
2. ❌ Formato da string incorreto
3. ❌ Usando porta errada (use 6543 para pooler, 5432 para direta)
4. ❌ Projeto do Supabase foi deletado ou pausado

**Solução:**
1. Verifique se a senha está correta (sem espaços extras)
2. Use a string de conexão exatamente como aparece no Supabase
3. Tente usar a conexão direta (porta 5432) se a pooler não funcionar
4. Verifique se o projeto do Supabase está ativo

### Erro: "Connection timeout"

**Causa**: Firewall ou região incorreta

**Solução:**
1. Verifique se a região na URL está correta (ex: `sa-east-1` para Brasil)
2. No Supabase, vá em **Settings > Database > Connection pooling** e verifique as configurações

### Erro: "password authentication failed"

**Causa**: Senha incorreta

**Solução:**
1. No Supabase, vá em **Settings > Database**
2. Clique em **Reset database password** se necessário
3. Atualize a `DATABASE_URL` no Render com a nova senha

## 📝 Exemplo Completo de Configuração

### No Supabase (com seus dados):
- **Project ID**: `wefmkatlfwgaqfapzutd` (você já tem isso)
- **Region**: Verifique na URL do projeto ou tente `sa-east-1` (Brasil)
- **Password**: A senha que você configurou (ou resete se não souber)

### Como descobrir a Região:

1. **Método 1**: Olhe a URL do seu projeto no Supabase
   - Se a URL contém `sa-east-1`, use `sa-east-1`
   - Se contém `us-east-1`, use `us-east-1`
   - E assim por diante

2. **Método 2**: Tente as regiões mais comuns:
   - `sa-east-1` (Brasil - São Paulo) - mais comum no Brasil
   - `us-east-1` (EUA - Virgínia)
   - `us-west-1` (EUA - Califórnia)
   - `eu-west-1` (Europa - Irlanda)

3. **Método 3**: Teste a conexão - se uma região não funcionar, tente outra

### DATABASE_URL no Render (exemplo com seus dados):

**Opção 1 - Connection Pooling (Recomendado):**
```
postgresql://postgres.wefmkatlfwgaqfapzutd:SUA_SENHA_AQUI@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Opção 2 - Conexão Direta (se pooler não funcionar):**
```
postgresql://postgres:SUA_SENHA_AQUI@db.wefmkatlfwgaqfapzutd.supabase.co:5432/postgres
```

**⚠️ IMPORTANTE**: Substitua `SUA_SENHA_AQUI` pela senha real do banco de dados!

## ✅ Checklist Final

Antes de fazer deploy, verifique:

- [ ] Project ID copiado do Supabase (`wefmkatlfwgaqfapzutd`)
- [ ] Senha do banco obtida ou resetada em Settings → Database
- [ ] Região identificada (tente `sa-east-1` primeiro se estiver no Brasil)
- [ ] String de conexão construída manualmente (se não encontrou no painel)
- [ ] Senha substituída na string (sem `[YOUR-PASSWORD]` ou `SUA_SENHA_AQUI`)
- [ ] Porta correta (6543 para pooler ou 5432 para direta)
- [ ] Variável `DATABASE_URL` configurada no Render
- [ ] Outras variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso

## 🆘 Se Ainda Não Funcionar

Se você ainda tiver problemas, tente esta ordem:

1. **Primeiro, tente Connection Pooling (porta 6543)**:
   ```
   postgresql://postgres.wefmkatlfwgaqfapzutd:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

2. **Se não funcionar, tente outras regiões** (substitua `sa-east-1`):
   - `us-east-1`
   - `us-west-1`
   - `eu-west-1`

3. **Se pooler não funcionar, tente conexão direta (porta 5432)**:
   ```
   postgresql://postgres:SUA_SENHA@db.wefmkatlfwgaqfapzutd.supabase.co:5432/postgres
   ```

4. **Verifique se a senha está correta**:
   - Vá em Settings → Database → Database password
   - Clique em "Reset database password" se necessário
   - Use a nova senha na string de conexão

---

**💡 Dica**: Sempre use a conexão com pooler (porta 6543) no Render, pois ela é otimizada para aplicações serverless e evita problemas de limite de conexões.
