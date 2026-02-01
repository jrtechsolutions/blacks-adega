# 🔧 Solução para Erro de Memória no Build do Render

## 🚨 Problema

O erro "JavaScript heap out of memory" ocorre quando o Node.js fica sem memória durante a compilação do TypeScript.

## ✅ Solução

### Opção 1: Configurar Build Command no Render (Recomendado)

1. No painel do Render, vá para o seu serviço
2. Clique em **Settings**
3. Role até a seção **Build & Deploy**
4. Configure o **Build Command**:
   ```
   cd backend && npm install && npm run build
   ```
5. Configure o **Start Command**:
   ```
   cd backend && npm start
   ```

Dessa forma, o build é feito separadamente e não no `prestart`, evitando problemas de memória.

### Opção 2: Aumentar Limite de Memória (Alternativa)

Se você quiser manter o build no `prestart`, pode aumentar o limite de memória:

1. No Render, vá para **Settings**
2. Adicione uma variável de ambiente:
   - **Key**: `NODE_OPTIONS`
   - **Value**: `--max-old-space-size=4096`

Isso aumenta o limite de memória para 4GB.

### Opção 3: Usar Build Incremental (Mais Eficiente)

Atualize o `tsconfig.json` para usar compilação incremental:

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  }
}
```

## 📝 Configuração Atual

O `prestart` agora executa apenas:
- `npx prisma generate` - Gera o Prisma Client
- `npx prisma migrate deploy` - Aplica migrations
- `npx prisma db seed` - Executa o seed

O build do TypeScript deve ser feito no **Build Command** do Render.

## ✅ Checklist

- [ ] Configurar **Build Command** no Render: `cd backend && npm install && npm run build`
- [ ] Configurar **Start Command** no Render: `cd backend && npm start`
- [ ] Fazer commit e push das alterações
- [ ] Aguardar o deploy completar
- [ ] Verificar se o build foi bem-sucedido

---

**💡 Dica**: A Opção 1 é a mais recomendada, pois separa o build do start e evita problemas de memória.
