# PRD — KyberGo

**Product Requirements Document**
Sistema de geração automática de orçamentos via Inteligência Artificial e WhatsApp para empresas de serviços.

| | |
|---|---|
| **Produto** | KyberGo |
| **Versão do documento** | 1.0 (rascunho) |
| **Data** | 02/07/2026 |
| **Origem** | Reunião com Pedro sobre o KyberGo (transcrição de áudio) |
| **Status** | Em planejamento |

> **Nota sobre a fonte:** este PRD foi elaborado a partir da transcrição da reunião de alinhamento. A primeira parte da reunião — uma recapitulação completa da visão do produto — foi transcrita com clareza e é a base deste documento. Alguns pontos de detalhe estão registrados na seção *Questões em Aberto* para validação com o time antes do desenvolvimento.

---

## 1. Visão Geral

O **KyberGo** é uma plataforma **SaaS multiempresa (multi-tenant)** que automatiza a **geração de orçamentos** para prestadores de serviço (ex.: gesso, telhado/telhadista, ar-condicionado, calheiro, manutenção predial, entre outros).

Hoje, o orçamento desses serviços costuma depender inteiramente do **dono do negócio** — os critérios de precificação "estão na cabeça dele". O KyberGo tem como missão **extrair esse conhecimento e colocá-lo dentro de uma Inteligência Artificial**, de modo que a empresa consiga gerar orçamentos **do mesmo jeito que o dono geraria**, mesmo quando ele está indisponível ou viajando.

O cliente final conversa com a IA pelo **WhatsApp**. A IA coleta as informações necessárias, aplica os **critérios de precificação previamente configurados** e devolve um **orçamento pronto em PDF**, personalizado com a logo e os dados da empresa.

### Proposta de valor
- **Autonomia:** gera orçamentos sem depender da presença do dono.
- **Padronização:** aplica os mesmos critérios de forma consistente.
- **Velocidade:** resposta imediata ao cliente pelo WhatsApp.
- **Relacionamento:** cadastro de clientes, funil de vendas e follow-up automático de manutenção que geram receita recorrente.

---

## 2. Objetivos

### Objetivos de negócio
1. Permitir que prestadores de serviço automatizem a emissão de orçamentos.
2. Reduzir a dependência do dono para operar o funil comercial.
3. Criar uma base de dados de clientes e serviços que evolua para um **CRM**.
4. Gerar receita recorrente por meio de **follow-ups de manutenção** automatizados.
5. Oferecer o produto como serviço para **múltiplos profissionais/empresas** (modelo SaaS).

### Objetivos do produto (MVP)
- Atendimento e coleta de dados via WhatsApp com IA.
- Configuração de critérios de precificação por empresa.
- Geração de orçamento em PDF personalizado.
- Painel administrativo e painel da empresa.
- Cadastro de clientes e registro de orçamentos/leads.

### Não-objetivos (fora do escopo inicial)
- Integração com sistemas **ERP** (previsto como ferramenta autônoma no início).
- Emissão fiscal / nota fiscal.
- Gateway de pagamento / cobrança online.

---

## 3. Personas

| Persona | Descrição | Necessidades |
|---|---|---|
| **Super Admin (KyberGo)** | Operador da plataforma. | Cadastrar e gerenciar as empresas clientes, dar acesso, acompanhar uso. |
| **Dono / Gestor da empresa de serviço** | Cliente pagante do KyberGo (ex.: dono da empresa de ar-condicionado). | Configurar critérios de preço, dados da empresa e logo, acompanhar orçamentos, clientes e vendas. |
| **Operador / Vendedor da empresa** | Colaborador que acompanha leads e fechamentos. | Visualizar orçamentos gerados, atualizar status de venda, gerenciar clientes. |
| **Cliente final** | Quem solicita o serviço. | Pedir e receber um orçamento rápido pelo WhatsApp. |
| **IA (agente automatizado)** | Atendente virtual. | Conversar, coletar dados, calcular preço e devolver o PDF. |

---

## 4. Escopo Funcional

### 4.1 Atendimento com IA via WhatsApp
- A IA atende no WhatsApp da empresa (número/API configurados por empresa).
- Conduz a conversa para **coletar as informações necessárias** ao orçamento (ex.: metragem, tipo de serviço, condições).
- Se faltarem dados, a IA **pergunta**; só calcula quando tiver todas as informações.
- Aplica os **critérios de precificação** cadastrados pela empresa.
- Devolve o **valor do orçamento** e o **PDF pronto** na própria conversa.
- O atendimento pode ser iniciado tanto pelo **cliente final** quanto por um **vendedor** da empresa.

### 4.2 Painel Administrativo (Super Admin)
- Login com credenciais.
- Cadastro e gestão das **empresas** clientes da plataforma.
- Concessão de acesso a cada empresa.
- (Futuro) Acompanhamento de uso por empresa.

### 4.3 Painel da Empresa (multi-tenant)
Aplicativo **web responsivo** (desktop e mobile), acesso por login/credenciais. Cada empresa enxerga apenas os seus dados. Contém:

**a) Dados da empresa**
- Nome da empresa, **logo**, informações de contato — usados na personalização do PDF.

**b) Configuração de critérios de precificação**
- Núcleo do sistema. Permite cadastrar **as regras que o dono usa para decidir o preço** de cada serviço (ex.: "quanto o calheiro cobra para fazer a calha de X metros").
- Esses critérios alimentam o cálculo feito pela IA.

**c) Configuração da integração de WhatsApp / IA**
- Cada empresa configura a **API do WhatsApp** e as credenciais necessárias para conectar o agente de IA ao seu número.

**d) Cadastro de serviços**
- Cadastro dos serviços oferecidos pela empresa (base para os critérios e para o registro dos orçamentos).

**e) Cadastro / gestão de clientes (base de CRM)**
- Cada orçamento vincula um **cliente**.
- Visualização e histórico dos clientes; evolução futura para CRM completo.

**f) Orçamentos**
- Registro de todo orçamento gerado (vinculado a cliente e serviço).
- Um orçamento gerado representa um **lead** — ainda **não** é uma venda.

**g) Funil de vendas / Vendas**
- Tela de acompanhamento do funil: **orçamentos gerados × orçamentos fechados**.
- Ao avançar o lead ("passar para frente"), registra-se o **fechamento**, o valor combinado e eventuais **descontos**.
- Um mesmo cliente pode aparecer em múltiplos orçamentos ao longo do tempo.
- Relatórios: quantos orçamentos foram gerados, quais foram fechados, com quais descontos.

**h) Follow-up automático de manutenção**
- Mensagens automáticas de acompanhamento pós-serviço, **configuráveis por tipo de serviço**.
- Exemplos de regra: **ar-condicionado → contato a cada ~3 meses**; **telhado → contato após ~1 ano**.
- A IA pode iniciar o contato automaticamente com base no CRM para **oferecer manutenção** e gerar novas vendas.

### 4.4 Geração de PDF do orçamento
- PDF **personalizado por empresa**: logo, nome da empresa, dados do cliente e detalhamento do orçamento.
- Enviado ao cliente pela conversa do WhatsApp.

---

## 5. Requisitos Funcionais (resumo rastreável)

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Atendimento automatizado por IA no WhatsApp | Alta (MVP) |
| RF-02 | Coleta guiada de informações pela IA, com perguntas quando faltar dado | Alta (MVP) |
| RF-03 | Motor de precificação baseado em critérios configuráveis por empresa | Alta (MVP) |
| RF-04 | Geração de orçamento em PDF personalizado (logo + dados) | Alta (MVP) |
| RF-05 | Envio do PDF ao cliente pelo WhatsApp | Alta (MVP) |
| RF-06 | Painel Super Admin para cadastro de empresas | Alta (MVP) |
| RF-07 | Painel da empresa responsivo (desktop/mobile) com login | Alta (MVP) |
| RF-08 | Cadastro de dados/logo da empresa | Alta (MVP) |
| RF-09 | Configuração da API do WhatsApp por empresa | Alta (MVP) |
| RF-10 | Cadastro de serviços | Média |
| RF-11 | Cadastro e histórico de clientes (base CRM) | Média |
| RF-12 | Registro de orçamentos como leads | Alta (MVP) |
| RF-13 | Funil de vendas com status, valor fechado e descontos | Média |
| RF-14 | Relatórios de orçamentos gerados × fechados | Média |
| RF-15 | Mensagens automáticas de manutenção configuráveis por tipo de serviço | Baixa (pós-MVP) |
| RF-16 | Disparo automático de follow-up pela IA baseado no CRM | Baixa (pós-MVP) |

---

## 6. Requisitos Não Funcionais

- **Multi-tenant:** isolamento de dados entre empresas; cada empresa acessa apenas o próprio conteúdo.
- **Responsivido:** interface adaptada para desktop e mobile.
- **Segurança:** autenticação por credenciais; armazenamento seguro de tokens/credenciais da API do WhatsApp por empresa.
- **Disponibilidade:** atendimento via WhatsApp deve estar disponível 24/7 (independe da presença do dono).
- **Escalabilidade:** arquitetura preparada para atender múltiplas empresas simultaneamente.
- **Rastreabilidade:** histórico de orçamentos, leads e interações preservado para relatórios e CRM.
- **Personalização:** documentos (PDF) e mensagens personalizáveis por empresa.

---

## 7. Fluxos Principais

### 7.1 Geração de orçamento (fluxo feliz)
1. Cliente (ou vendedor) chama o WhatsApp da empresa.
2. IA cumprimenta e coleta as informações do serviço.
3. Se faltar dado, IA pergunta; repete até ter tudo.
4. IA aplica os critérios de precificação da empresa e calcula o valor.
5. IA gera o **PDF personalizado** e envia na conversa.
6. Sistema registra o orçamento como **lead** e vincula/atualiza o **cliente**.

### 7.2 Fechamento de venda
1. Empresa acompanha o lead no **funil de vendas**.
2. Ao fechar, registra valor combinado e desconto aplicado.
3. Sistema atualiza o status para **vendido** e guarda o histórico.

### 7.3 Follow-up de manutenção (pós-MVP)
1. Sistema identifica, pelo tipo de serviço e data, que é hora de manutenção.
2. IA inicia contato automático com o cliente oferecendo manutenção.
3. Novo atendimento pode gerar um novo orçamento/lead.

---

## 8. Sugestão de Arquitetura e Stack (a validar com o time técnico)

> Esta seção é uma **recomendação inicial**, não uma decisão fechada.

- **Frontend:** aplicação web responsiva (ex.: React/Next.js) para os painéis Admin e Empresa.
- **Backend:** API (ex.: Node.js/NestJS ou Python/FastAPI) multi-tenant.
- **Banco de dados:** relacional (ex.: PostgreSQL) com isolamento por empresa (tenant_id).
- **Integração WhatsApp:** WhatsApp Business API (Cloud API) ou provedor equivalente, configurável por empresa.
- **Camada de IA:** modelo de linguagem (LLM) com orquestração de conversa e *function calling* para coleta de dados e cálculo; regras de precificação como dados configuráveis por empresa.
- **Geração de PDF:** serviço de template + renderização (ex.: HTML→PDF) com branding por empresa.
- **Autenticação:** login por credenciais, com papéis (Super Admin, Gestor, Operador).

---

## 9. Modelo de Dados (rascunho)

Entidades principais e relações essenciais:

- **Empresa (Tenant):** nome, logo, dados de contato, credenciais da API de WhatsApp.
- **Usuário:** vínculo com empresa, papel (admin/gestor/operador), credenciais.
- **Serviço:** vínculo com empresa, nome, descrição.
- **Critério de precificação:** vínculo com serviço/empresa, regras/parâmetros de cálculo.
- **Cliente:** vínculo com empresa, dados de contato, histórico.
- **Orçamento (Lead):** vínculo com cliente e serviço, itens, valor calculado, PDF gerado, status (gerado/fechado/perdido).
- **Venda:** vínculo com orçamento, valor fechado, desconto, data.
- **Regra de follow-up:** vínculo com tipo de serviço, periodicidade (ex.: 3 meses, 1 ano), mensagem.

---

## 10. Métricas de Sucesso (sugestão)

- Nº de orçamentos gerados automaticamente por empresa.
- Taxa de conversão (orçamentos fechados / gerados).
- Tempo médio de resposta ao cliente.
- Nº de follow-ups de manutenção que geram novas vendas.
- Nº de empresas ativas na plataforma.

---

## 11. Roadmap por Fases (proposta)

**Fase 1 — MVP: Orçamento automático**
- IA no WhatsApp + coleta de dados.
- Configuração de critérios + motor de precificação.
- Geração de PDF personalizado.
- Painel Super Admin (cadastro de empresas) e painel da empresa (dados, logo, API).
- Registro de orçamentos/leads e clientes.

**Fase 2 — Comercial / CRM**
- Cadastro completo de serviços e clientes.
- Funil de vendas, fechamento, descontos e relatórios.

**Fase 3 — Recorrência**
- Follow-up automático de manutenção por tipo de serviço.
- Disparo proativo pela IA com base no CRM.

**Fase 4 — Evolução**
- CRM avançado, integrações (incl. possíveis ERPs), analytics.

---

## 12. Questões em Aberto (validar com o time)

- Confirmar o **provedor da API de WhatsApp** e o modelo de conexão por empresa.
- Detalhar o **formato dos critérios de precificação** (campos, fórmulas, faixas) por tipo de serviço.
- Definir os **papéis e permissões** exatos (Super Admin, Gestor, Operador).
- Confirmar se haverá **"serviços prestados/histórico de execução"** além do cadastro de serviços.
- Detalhar as **regras e mensagens de follow-up** por tipo de serviço.
- Validar os pontos discutidos na **segunda metade da reunião** (limitação técnica na transcrição do áudio) — recomenda-se revisão com o time.

---

*Documento vivo — sujeito a revisão conforme validação com o time e com o Pedro.*
