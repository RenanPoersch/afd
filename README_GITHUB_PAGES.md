# GitHub Pages Setup para AFD Validator

Este projeto está configurado para ser publicado automaticamente no GitHub Pages.

## 📋 Configuração Necessária

### 1. **Habilitar GitHub Pages no repositório**

1. Vá para **Settings** do seu repositório
2. Selecione **Pages** no menu esquerdo
3. Em **Source**, selecione:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Clique em **Save**

### 2. **Como funciona o deploy automático**

O arquivo `.github/workflows/deploy.yml` executa automaticamente:

- ✅ **Quando?** Cada push na branch `main`
- ✅ **O quê?** Faz build do Angular e publica no GitHub Pages
- ✅ **Onde?** Na URL: `https://seu-usuario.github.io/afd/`

### 3. **Primeiro Deploy (Manual)**

Se preferir fazer deploy manual:

```bash
# 1. Build para produção
npm run build

# 2. A saída está em: dist/afd-temp/browser

# 3. Push com branch gh-pages (use gh-pages CLI ou outra ferramenta)
# Recomendamos usar: https://github.com/peaceiris/actions-gh-pages
```

## 📁 Estrutura de Arquivos Adicionados

```
.nojekyll                    # Desabilita Jekyll (necessário para Angular)
.github/
  workflows/
    deploy.yml              # GitHub Actions para deploy automático
```

## 🚀 Dicas de Produção

1. **Base URL**: Se o repositório não for `seu-usuario.github.io`, edite `angular.json`:
   ```json
   "outputPath": "dist/afd",
   "baseHref": "/afd/"
   ```

2. **Ver Logs de Deploy**:
   - Vá em **Actions** no GitHub
   - Clique no workflow mais recente
   - Verifique se passou (green checkmark) ou falhou

3. **Atualizar Domínio Customizado**:
   - Crie um arquivo `CNAME` na raiz com seu domínio:
     ```
     seu-dominio.com
     ```
   - Commits e pushes automáticos o publicam também

## 📞 Troubleshooting

**Problema**: Site não aparece após push  
**Solução**: Aguarde 2-3 minutos, verifique se o workflow passou em **Actions**

**Problema**: Páginas em 404  
**Solução**: Confirme o `baseHref` em `angular.json` corresponde à URL correta

---

✨ Pronto! Seu projeto está configurado para GitHub Pages.
