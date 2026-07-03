**PRD - KyberGo SaaS**

Produto SaaS de IA para geração de orçamentos, documentos comerciais, CRM e automações via WhatsApp

Versão 1.0 \| 03/07/2026

| **Base de elaboração:** Documento consolidado a partir da transcrição de reunião enviada em DOCX e da transcrição complementar informada no chat. O produto foi estruturado como SaaS desde o início, com multiempresa, assinatura, painel web responsivo, integração WhatsApp e geração de PDF. |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

| **Campo**           | **Definição**                                                                                                                                                               |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Nome do produto     | KyberGo / Kyber Go                                                                                                                                                          |
| Tipo de produto     | SaaS B2B para prestadores de serviços que geram orçamentos sob medida                                                                                                       |
| Canal principal     | WhatsApp integrado por API, com painel web responsivo como retaguarda                                                                                                       |
| Diferencial central | Transformar o conhecimento do proprietário em regras e instruções de IA, gerando orçamentos e documentos personalizados sem depender do computador nem da presença do dono. |
| Status              | Especificação inicial para iniciar desenvolvimento do MVP                                                                                                                   |

# 1. Controle do documento

| **Item**             | **Conteúdo**                                                                                    |
|----------------------|-------------------------------------------------------------------------------------------------|
| Versão               | 1.0                                                                                             |
| Data                 | 03/07/2026                                                                                      |
| Responsável pelo PRD | Equipe KyberGo                                                                                  |
| Origem               | Reunião de descoberta do produto + complemento sobre modalidade simples de geração de documento |
| Decisão principal    | O produto será tratado como SaaS, não como sistema isolado sob encomenda.                       |

# 2. Sumário

- 1\. Controle do documento

- 2\. Sumário

- 3\. Visão geral do produto

- 4\. Problema, oportunidade e objetivos

- 5\. Público-alvo, personas e perfis de usuário

- 6\. Escopo do SaaS

- 7\. Modalidades de geração: inteligente/calculada e simples/manual

- 8\. Jornadas e fluxos principais

- 9\. Requisitos funcionais por módulo

- 10\. Regras de negócio

- 11\. Modelo de dados inicial

- 12\. Requisitos não funcionais

- 13\. Integrações externas

- 14\. IA: comportamento, limites e critérios de segurança

- 15\. MVP, fases e roadmap

- 16\. Critérios de aceite

- 17\. Métricas, riscos e pendências

- 18\. Backlog inicial priorizado

# 3. Visão geral do produto

KyberGo é um SaaS B2B mobile-first que permite a empresas prestadoras de serviço criarem orçamentos e documentos comerciais por meio de IA, principalmente pelo WhatsApp. O sistema deve capturar informações em linguagem natural, texto ou áudio, organizar os dados, solicitar informações faltantes quando necessário e gerar um PDF profissional com identidade visual da empresa contratante.

A solução atende empresas em que o orçamento depende do conhecimento do proprietário, como calheiros, gesseiros, instaladores de ar-condicionado, marceneiros, empresas de manutenção e outros serviços sob medida. O objetivo é transformar critérios informais de precificação, que hoje ficam “na cabeça do dono”, em configurações reutilizáveis dentro do sistema.

| **Premissa obrigatória:** O produto deve nascer como SaaS multiempresa: cada empresa contratante terá assinatura, dados isolados, usuários, configurações, clientes, orçamentos, PDFs, mensagens e instância de WhatsApp própria. |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

## 3.1 Proposta de valor

- **Velocidade comercial:** gerar orçamentos profissionais em poucos minutos pelo WhatsApp, sem abrir computador.

- **Padronização:** fazer vendedores e funcionários gerarem orçamentos consistentes com os critérios do proprietário.

- **Escala:** permitir que o dono viaje, esteja ocupado ou delegue vendas sem travar a operação.

- **Faturamento recorrente:** usar CRM, agenda e mensagens automáticas para recuperar clientes, oferecer manutenções e aumentar vendas futuras.

- **Personalização:** PDFs com logo, cores, dados da empresa, validade, observações e linguagem adequada ao negócio.

- **Simplicidade:** além do modo avançado com cálculo, oferecer modo simples que apenas transforma uma descrição e valores informados em documento profissional.

## 3.2 Definição resumida do produto

| **Dimensão**      | **Definição**                                                                                               |
|-------------------|-------------------------------------------------------------------------------------------------------------|
| Produto           | SaaS web responsivo integrado ao WhatsApp para gerar orçamentos, documentos e automações de relacionamento. |
| Usuário pagante   | Empresa prestadora de serviço.                                                                              |
| Usuários internos | Proprietário, administrador, vendedor, atendente, funcionário operacional.                                  |
| Usuário externo   | Cliente final ou lead que conversa pelo WhatsApp e recebe orçamento/documento.                              |
| Canal de entrada  | WhatsApp e painel web.                                                                                      |
| Saída principal   | PDF personalizado, lead no CRM, oportunidade no Kanban e possível agenda de follow-up/manutenção.           |
| Modelo comercial  | Assinatura SaaS com planos, limites, cobrança recorrente e bloqueio/desbloqueio conforme status.            |

# 4. Problema, oportunidade e objetivos

## 4.1 Problema principal

Em muitos prestadores de serviço, o orçamento depende de critérios que apenas o dono domina: metragem, dificuldade, materiais, tipo de serviço, deslocamento, prazo, margem, histórico do cliente e regras práticas do dia a dia. Isso cria gargalo comercial, inconsistência entre vendedores, demora no atendimento e perda de oportunidades.

## 4.2 Oportunidade

O WhatsApp já é o canal natural de comunicação desses negócios. Ao colocar uma IA no WhatsApp, conectada às regras da empresa e a um gerador de PDF, o KyberGo pode reduzir tempo operacional, padronizar propostas e ainda criar uma base de CRM para vendas futuras, manutenção e reativação de clientes.

## 4.3 Objetivos de produto

| **Objetivo**                               | **Descrição**                                                                                                 | **Prioridade** |
|--------------------------------------------|---------------------------------------------------------------------------------------------------------------|----------------|
| Gerar orçamentos por IA                    | Coletar informações pelo WhatsApp/painel, calcular ou organizar o orçamento e gerar PDF personalizado.        | P0             |
| Ser SaaS multiempresa                      | Permitir várias empresas assinantes com dados isolados, planos, usuários e configurações próprias.            | P0             |
| Configurar critérios por tipo de orçamento | Permitir que cada empresa cadastre critérios e regras que formam preço e conteúdo do orçamento.               | P0             |
| Oferecer modo simples/manual               | Permitir documento gerado só com base na descrição e valores informados pelo usuário, sem cálculo automático. | P0             |
| Integrar WhatsApp                          | Receber texto/áudio, responder dúvidas, enviar PDF e registrar conversas.                                     | P0             |
| Registrar leads e clientes                 | Criar cadastro de cliente e oportunidade a partir dos orçamentos gerados.                                     | P0             |
| Kanban de vendas                           | Acompanhar orçamento gerado, negociação, desconto e venda fechada/perdida.                                    | P1             |
| Mensagens automáticas                      | Agendar e enviar follow-ups e ofertas de manutenção conforme tipo de serviço.                                 | P1             |
| Aumentar faturamento do cliente            | Transformar o sistema em ferramenta ativa de recuperação e recorrência de serviços.                           | P1             |
| Self-service SaaS                          | Permitir marketing, cadastro, teste, assinatura e ativação automática.                                        | P1/P2          |

## 4.4 Não objetivos do MVP

- Não integrar com ERP no primeiro momento. A ferramenta será própria e independente.

- Não criar aplicativo nativo iOS/Android no MVP. O painel deve ser web responsivo e mobile-first.

- Não substituir atendimento humano em todos os casos. A IA deve escalar para revisão humana quando faltar regra, houver ambiguidade ou o usuário pedir.

- Não deixar a IA inventar preços, condições comerciais ou dados do cliente sem confirmação.

- Não apagar automaticamente dados e instâncias de clientes cancelados sem política de retenção definida.

# 5. Público-alvo, personas e perfis de usuário

## 5.1 Segmentos iniciais

| **Segmento**        | **Exemplos de uso**                              | **Critérios comuns**                                                                      |
|---------------------|--------------------------------------------------|-------------------------------------------------------------------------------------------|
| Calheiros           | Calhas, rufos, condutores, manutenção anual.     | Metros lineares, tipo de calha, altura, material, acabamento, complexidade, deslocamento. |
| Gesseiros           | Parede, forro, sancas, drywall, acabamento.      | Metragem, ambiente, material, cor/acabamento, dificuldade, prazo.                         |
| Ar-condicionado     | Instalação, higienização e manutenção periódica. | Modelo, BTUs, distância tubulação, local de instalação, manutenção em 3 meses/6 meses.    |
| Marceneiros         | Móveis sob medida e ajustes.                     | Medidas, tipo de madeira/MDF, acabamento, ferragens, prazo, complexidade.                 |
| Manutenção em geral | Serviços recorrentes e visitas técnicas.         | Tipo de serviço, valor de visita, materiais, periodicidade, urgência.                     |

## 5.2 Perfis de usuário

| **Perfil**           | **Descrição**                                              | **Permissões esperadas**                                                                          |
|----------------------|------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| Super Admin KyberGo  | Equipe interna que gerencia o SaaS.                        | Criar planos, empresas, assinaturas, suporte, instâncias, auditoria e bloqueios.                  |
| Admin da empresa     | Proprietário ou gestor do negócio assinante.               | Configurar empresa, usuários, WhatsApp, PDFs, critérios, preços, mensagens e automações.          |
| Vendedor/Funcionário | Usuário operacional que cria orçamentos e acompanha leads. | Gerar orçamentos, consultar clientes, atualizar oportunidades e solicitar PDF.                    |
| Atendente IA         | Agente automatizado via WhatsApp.                          | Coletar dados, perguntar pendências, gerar orçamento/documento, enviar PDF e registrar histórico. |
| Cliente final/Lead   | Pessoa que pede orçamento pelo WhatsApp.                   | Informar necessidade, responder perguntas, receber documento e mensagens futuras autorizadas.     |

# 6. Escopo do SaaS

O KyberGo deve ser projetado como SaaS desde a primeira versão. Isso significa que todo dado, configuração, orçamento, cliente, PDF, instância de WhatsApp e automação deve pertencer a um tenant/empresa e respeitar isolamento lógico.

## 6.1 Componentes SaaS obrigatórios

| **Componente**          | **Descrição**                                                             | **MVP**     |
|-------------------------|---------------------------------------------------------------------------|-------------|
| Multiempresa / Tenancy  | Cada empresa possui ambiente lógico próprio com dados isolados.           | Sim         |
| Cadastro e login        | Autenticação para admins e funcionários.                                  | Sim         |
| Planos e assinaturas    | Planos com limites e status: trial, ativo, pendente, suspenso, cancelado. | Sim         |
| Controle de acesso      | Permissões por perfil dentro da empresa.                                  | Sim         |
| Configuração da empresa | Logo, nome, dados comerciais, cores e padrão de PDF.                      | Sim         |
| Instância WhatsApp      | Conexão de número por empresa/assinatura.                                 | Sim         |
| Limites por plano       | Usuários, documentos/mês, mensagens, automações, armazenamento.           | Sim         |
| Billing automatizado    | Gateway de cobrança e webhooks de pagamento.                              | Fase 1.5/P1 |
| Onboarding self-service | Cliente entra, assina, conecta WhatsApp e configura sozinho.              | P1          |
| Admin interno           | Equipe KyberGo pode ativar, bloquear e prestar suporte.                   | Sim         |

## 6.2 Estados da assinatura

| **Status**            | **Comportamento no sistema**                                                                                             |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------|
| Trial                 | Permitir uso limitado, exibir dias restantes e incentivar assinatura.                                                    |
| Ativa                 | Permitir acesso completo conforme plano contratado.                                                                      |
| Pendente/Past due     | Exibir aviso de pagamento, manter acesso por período de tolerância configurável.                                         |
| Suspensa              | Bloquear geração de novos documentos, pausar automações e impedir uso do bot; manter acesso restrito para regularização. |
| Cancelada             | Desativar bot e automações. Manter dados por período de retenção configurável antes de exclusão definitiva.              |
| Bloqueada manualmente | Bloqueio administrativo por suporte, inadimplência grave, abuso ou solicitação do cliente.                               |

| **Decisão de arquitetura:** Mesmo que a venda inicial seja direta, o cadastro do cliente deve entrar no fluxo SaaS: criar empresa, assinatura, plano, usuários, instância WhatsApp e configurações. Isso evita retrabalho quando o produto passar a vender por marketing digital/self-service. |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

# 7. Modalidades de geração

O produto terá duas modalidades principais de geração. Ambas usam WhatsApp, IA e PDF personalizado, mas têm comportamentos diferentes quanto a cálculo, regras e autonomia da IA.

## 7.1 Modalidade A - Orçamento inteligente/calculado

A modalidade inteligente usa critérios pré-configurados pela empresa para calcular preço, estruturar itens e gerar orçamento. A IA deve atuar como vendedor treinado com base nas regras do proprietário.

| **Aspecto**             | **Funcionamento**                                                                                                  |
|-------------------------|--------------------------------------------------------------------------------------------------------------------|
| Entrada                 | Texto ou áudio pelo WhatsApp, ou formulário no painel.                                                             |
| Configuração necessária | Tipo de orçamento, critérios obrigatórios, perguntas da IA, regras de cálculo, margens, descontos e modelo de PDF. |
| Coleta de dados         | IA pergunta informações faltantes: metragem, medidas, cor, material, prazo, localização, complexidade etc.         |
| Cálculo                 | Sistema calcula preço a partir das regras salvas. A IA não deve inventar fórmula fora da configuração.             |
| Saída                   | PDF personalizado, lead criado no CRM, oportunidade no Kanban e registro de conversa.                              |
| Uso ideal               | Empresas que querem que funcionários/clientes gerem orçamento igual ao dono faria.                                 |

## 7.2 Modalidade B - Documento simples/manual

A modalidade simples/manual atende empresas que não querem configurar critérios ou cálculo. Nela, o usuário informa uma descrição livre e os valores no momento da conversa; a IA apenas organiza, formata, pergunta pontos básicos se necessário e gera o documento em PDF.

| **Aspecto**             | **Funcionamento**                                                                                                |
|-------------------------|------------------------------------------------------------------------------------------------------------------|
| Entrada                 | Descrição livre no WhatsApp, por exemplo: “10 metros de calha lisa, mais X, mais Y, valor tal”.                  |
| Configuração necessária | Personalização do PDF, logo, cores, dados da empresa, tipos básicos de documento e campos opcionais.             |
| Coleta de dados         | IA pode fazer perguntas pontuais sobre cliente, validade, prazo, endereço ou item ambíguo.                       |
| Cálculo                 | Não calcula preço automaticamente. O preço deve ser informado pelo usuário na hora ou confirmado explicitamente. |
| Regra crítica           | Se o preço não for informado, a IA deve perguntar. Ela não pode definir preço por conta própria.                 |
| Saída                   | PDF profissional criado rapidamente, sem o usuário parar o serviço para montar documento no computador.          |
| Uso ideal               | Prestadores que já sabem o preço e só precisam transformar a conversa em orçamento/documento bonito.             |

## 7.3 Comparativo entre modalidades

| **Critério**                 | **Inteligente/calculada**                           | **Simples/manual**                                                      |
|------------------------------|-----------------------------------------------------|-------------------------------------------------------------------------|
| Precisa cadastrar critérios? | Sim, critérios e regras de cálculo.                 | Não obrigatoriamente. Pode ter apenas tipos de documento e layout.      |
| A IA define valor?           | Não define livremente; calcula conforme regras.     | Não. Apenas usa valores informados pelo usuário.                        |
| Perguntas automáticas        | Pergunta todos os critérios obrigatórios faltantes. | Pergunta apenas dados essenciais/ambíguos.                              |
| Complexidade de implantação  | Maior.                                              | Menor. Ideal para entrada rápida no SaaS.                               |
| Valor percebido              | Automação de cálculo e padronização comercial.      | Agilidade na geração de PDF pelo WhatsApp.                              |
| Prioridade no MVP            | P0.                                                 | P0, pois reduz barreira de adoção e atende clientes sem regras maduras. |

# 8. Jornadas e fluxos principais

## 8.1 Jornada de onboarding SaaS

| **Etapa** | **Ação**                                                               | **Resultado esperado**                            |
|-----------|------------------------------------------------------------------------|---------------------------------------------------|
| 1         | Empresa cria conta ou é cadastrada pelo Super Admin.                   | Tenant criado com status trial/ativo.             |
| 2         | Empresa escolhe plano ou recebe plano atribuído pela equipe.           | Assinatura vinculada ao tenant.                   |
| 3         | Admin cadastra dados da empresa, logo, cores e informações comerciais. | PDF e IA passam a usar identidade da empresa.     |
| 4         | Admin conecta WhatsApp via instância da API.                           | Número fica pronto para receber/enviar mensagens. |
| 5         | Admin escolhe modalidade: simples, inteligente ou ambas.               | Sistema habilita fluxos correspondentes.          |
| 6         | Admin configura tipos de orçamento/documento.                          | IA sabe quais campos coletar e qual modelo usar.  |
| 7         | Admin faz teste pelo WhatsApp.                                         | Geração validada antes de uso comercial real.     |

## 8.2 Fluxo de orçamento inteligente via WhatsApp

- Usuário, funcionário ou cliente envia mensagem/áudio pedindo orçamento.

- Sistema identifica empresa pela instância do WhatsApp e abre/continua conversa.

- IA classifica intenção: novo orçamento, consulta, ajuste, aprovação, suporte ou outro.

- IA identifica tipo de orçamento configurado. Se houver dúvida, pergunta qual serviço/documento deseja.

- IA extrai dados informados: cliente, medidas, materiais, local, prazo, observações e outros critérios.

- Sistema verifica critérios obrigatórios faltantes e faz perguntas objetivas.

- Quando todos os dados estiverem completos, motor de cálculo aplica regras configuradas.

- Sistema gera prévia/registro do orçamento, PDF personalizado e envia pelo WhatsApp.

- Sistema cria ou atualiza cliente, lead/oportunidade e histórico no CRM.

- Se configurado, agenda follow-up ou manutenção futura conforme tipo de serviço.

## 8.3 Fluxo de documento simples/manual via WhatsApp

- Usuário envia descrição livre com itens, quantidades e valores.

- IA estrutura a descrição em seções de documento: cliente, itens, valores, observações, prazo, validade e condições.

- Se dados essenciais estiverem ausentes, IA pergunta somente o necessário.

- Se valores não estiverem claros, IA solicita confirmação e não calcula preço por conta própria.

- Sistema gera PDF com layout personalizado e envia pelo WhatsApp.

- Sistema registra documento, cliente e oportunidade, mesmo sem cálculo automático.

## 8.4 Fluxo de Kanban e fechamento

- Todo orçamento/documento gerado cria uma oportunidade em “Novo orçamento/Lead”.

- Usuário pode mover entre colunas: Novo, Em negociação, Aguardando cliente, Fechado, Perdido, Manutenção futura.

- Usuário pode editar orçamento, aplicar desconto, alterar combinado e gerar nova versão do PDF.

- Ao marcar como Fechado, o sistema transforma oportunidade em venda/serviço e registra data para follow-up/manutenção.

- Ao marcar como Perdido, o sistema registra motivo para análise futura.

## 8.5 Fluxo de mensagens automáticas e agenda

- Admin configura templates por tipo de serviço: manutenção, follow-up de orçamento, reativação, lembrete e pós-venda.

- Cada tipo de serviço pode ter periodicidade própria: exemplo, ar-condicionado em 3 meses; calheiro em 1 ano.

- Sistema cria eventos de mensagem futura após orçamento fechado ou conforme regra configurada.

- Admin vê calendário/agenda com próximos envios.

- Admin pode cancelar um envio específico, pausar cliente, pausar campanha ou desativar todas as automações.

- Sistema deve evitar mensagens estranhas quando já houve contato recente com o cliente.

# 9. Requisitos funcionais por módulo

Prioridade: P0 = essencial para MVP; P1 = importante logo após MVP; P2 = evolução futura.

## 9.1 Módulo SaaS, autenticação e multiempresa

| **ID**      | **Requisito**                                                                                             | **Prioridade** |
|-------------|-----------------------------------------------------------------------------------------------------------|----------------|
| RF-SaaS-001 | Criar tenant/empresa para cada assinante, com dados isolados.                                             | P0             |
| RF-SaaS-002 | Permitir login com e-mail/senha e recuperação de senha.                                                   | P0             |
| RF-SaaS-003 | Permitir múltiplos usuários por empresa, com papéis e permissões.                                         | P0             |
| RF-SaaS-004 | Permitir Super Admin visualizar e gerenciar empresas, planos e status.                                    | P0             |
| RF-SaaS-005 | Bloquear recursos conforme status da assinatura.                                                          | P0             |
| RF-SaaS-006 | Registrar auditoria de ações críticas: login, alteração de preços, envio de PDF, alteração de assinatura. | P1             |
| RF-SaaS-007 | Permitir limite por plano: usuários, documentos, mensagens, automações e instâncias.                      | P1             |

## 9.2 Módulo de empresa e personalização

| **ID**     | **Requisito**                                                                                   | **Prioridade** |
|------------|-------------------------------------------------------------------------------------------------|----------------|
| RF-EMP-001 | Cadastrar nome fantasia, razão social, CNPJ/CPF, telefone, e-mail, endereço e dados comerciais. | P0             |
| RF-EMP-002 | Upload de logo da empresa.                                                                      | P0             |
| RF-EMP-003 | Configurar cor primária, cor secundária e estilo visual do PDF.                                 | P0             |
| RF-EMP-004 | Configurar rodapé, observações padrão, validade padrão e termos comerciais.                     | P0             |
| RF-EMP-005 | Permitir pré-visualização do PDF antes de ativar modelo.                                        | P1             |
| RF-EMP-006 | Permitir múltiplos modelos de PDF por tipo de documento.                                        | P1             |

## 9.3 Módulo WhatsApp/API

| **ID**     | **Requisito**                                                                | **Prioridade** |
|------------|------------------------------------------------------------------------------|----------------|
| RF-WPP-001 | Criar/vincular instância de WhatsApp por assinatura/empresa.                 | P0             |
| RF-WPP-002 | Receber mensagens de texto via webhook.                                      | P0             |
| RF-WPP-003 | Receber áudio e enviar para transcrição.                                     | P0             |
| RF-WPP-004 | Enviar respostas da IA pelo WhatsApp.                                        | P0             |
| RF-WPP-005 | Enviar PDF gerado pelo WhatsApp.                                             | P0             |
| RF-WPP-006 | Exibir status da conexão: conectado, desconectado, aguardando QR Code, erro. | P0             |
| RF-WPP-007 | Registrar histórico de mensagens por conversa/cliente.                       | P1             |
| RF-WPP-008 | Pausar bot manualmente para atendimento humano.                              | P1             |

## 9.4 Módulo de tipos de orçamento/documento

| **ID**     | **Requisito**                                                                                                | **Prioridade** |
|------------|--------------------------------------------------------------------------------------------------------------|----------------|
| RF-TIP-001 | Permitir cadastrar tipos de orçamento, como “Calha lisa”, “Instalação de ar-condicionado”, “Forro de gesso”. | P0             |
| RF-TIP-002 | Definir se o tipo usa modalidade inteligente/calculada ou simples/manual.                                    | P0             |
| RF-TIP-003 | Definir campos obrigatórios, opcionais e perguntas que a IA deve fazer.                                      | P0             |
| RF-TIP-004 | Definir seção e ordem dos dados no PDF.                                                                      | P0             |
| RF-TIP-005 | Duplicar tipos de orçamento para facilitar criação de novos modelos.                                         | P1             |
| RF-TIP-006 | Ativar/desativar tipo de documento sem excluir histórico.                                                    | P1             |

## 9.5 Módulo de critérios e cálculo

| **ID**      | **Requisito**                                                                                   | **Prioridade** |
|-------------|-------------------------------------------------------------------------------------------------|----------------|
| RF-CALC-001 | Permitir cadastro de critérios com tipo: texto, número, moeda, medida, seleção, sim/não, data.  | P0             |
| RF-CALC-002 | Permitir marcar critério como obrigatório.                                                      | P0             |
| RF-CALC-003 | Permitir regras de preço por unidade, metragem, taxa fixa, adicional, desconto e multiplicador. | P0             |
| RF-CALC-004 | Permitir margem e desconto controlado por permissão.                                            | P1             |
| RF-CALC-005 | Simular cálculo no painel antes de publicar configuração.                                       | P1             |
| RF-CALC-006 | Versionar regras de cálculo para preservar orçamentos antigos.                                  | P1             |

## 9.6 Módulo de documento simples/manual

| **ID**      | **Requisito**                                                                                                               | **Prioridade** |
|-------------|-----------------------------------------------------------------------------------------------------------------------------|----------------|
| RF-SIMP-001 | Permitir gerar PDF a partir de descrição livre enviada pelo WhatsApp.                                                       | P0             |
| RF-SIMP-002 | Permitir informar itens, quantidades e valores diretamente na conversa.                                                     | P0             |
| RF-SIMP-003 | IA deve perguntar preço quando o valor não estiver informado ou estiver ambíguo.                                            | P0             |
| RF-SIMP-004 | IA não deve calcular nem sugerir preço nessa modalidade, salvo se o usuário pedir uma soma explícita de valores informados. | P0             |
| RF-SIMP-005 | Permitir tipos simples de documento: orçamento, proposta, recibo/protocolo e ordem de serviço futura.                       | P1             |
| RF-SIMP-006 | Permitir salvar frases/modelos padrão para acelerar documentos simples.                                                     | P1             |

## 9.7 Módulo de geração de PDF

| **ID**     | **Requisito**                                                                              | **Prioridade** |
|------------|--------------------------------------------------------------------------------------------|----------------|
| RF-PDF-001 | Gerar PDF com logo, cores, dados da empresa, dados do cliente, itens, valores e condições. | P0             |
| RF-PDF-002 | Gerar número/código único do orçamento/documento.                                          | P0             |
| RF-PDF-003 | Incluir validade do orçamento e data de emissão.                                           | P0             |
| RF-PDF-004 | Permitir reemissão e versionamento quando orçamento for editado.                           | P0             |
| RF-PDF-005 | Armazenar PDF gerado e permitir download pelo painel.                                      | P0             |
| RF-PDF-006 | Enviar PDF pelo WhatsApp automaticamente após confirmação.                                 | P0             |
| RF-PDF-007 | Permitir assinatura/aceite digital do cliente.                                             | P2             |

## 9.8 Módulo de clientes, leads e CRM

| **ID**     | **Requisito**                                              | **Prioridade** |
|------------|------------------------------------------------------------|----------------|
| RF-CRM-001 | Criar/atualizar cliente a partir de orçamento gerado.      | P0             |
| RF-CRM-002 | Guardar nome, telefone, endereço, e-mail e observações.    | P0             |
| RF-CRM-003 | Criar oportunidade/lead para cada orçamento/documento.     | P0             |
| RF-CRM-004 | Exibir Kanban de oportunidades com status configuráveis.   | P1             |
| RF-CRM-005 | Permitir editar valor final, desconto, combinado e status. | P1             |
| RF-CRM-006 | Registrar múltiplas vendas/serviços por cliente.           | P1             |
| RF-CRM-007 | Registrar motivo de perda de oportunidade.                 | P1             |

## 9.9 Módulo de agenda e mensagens automáticas

| **ID**     | **Requisito**                                                                              | **Prioridade** |
|------------|--------------------------------------------------------------------------------------------|----------------|
| RF-AUT-001 | Configurar templates de mensagem por tipo de serviço.                                      | P1             |
| RF-AUT-002 | Configurar periodicidade de follow-up/manutenção por tipo de serviço.                      | P1             |
| RF-AUT-003 | Criar agenda/calendário dos próximos envios automáticos.                                   | P1             |
| RF-AUT-004 | Permitir cancelar envio individual, pausar cliente ou desativar automação.                 | P1             |
| RF-AUT-005 | Evitar envio automático quando houver conversa recente manual com cliente, conforme regra. | P1             |
| RF-AUT-006 | Registrar log de envio, falha, entrega e resposta.                                         | P1             |
| RF-AUT-007 | Permitir campanhas de reativação segmentadas.                                              | P2             |

## 9.10 Módulo de painel web responsivo

| **ID**    | **Requisito**                                                                            | **Prioridade** |
|-----------|------------------------------------------------------------------------------------------|----------------|
| RF-UI-001 | Interface responsiva para desktop e mobile, com prioridade para mobile.                  | P0             |
| RF-UI-002 | Dashboard inicial com orçamentos recentes, leads, mensagens pendentes e status WhatsApp. | P1             |
| RF-UI-003 | Tela de configuração guiada/onboarding.                                                  | P0             |
| RF-UI-004 | Telas de cliente, orçamento, PDF, Kanban, agenda e configurações.                        | P0/P1          |
| RF-UI-005 | Estados vazios claros com orientação do próximo passo.                                   | P0             |
| RF-UI-006 | Experiência rápida para o usuário criar orçamento pelo celular.                          | P0             |

# 10. Regras de negócio

| **ID** | **Regra**                                                                                                                                 |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------|
| RN-001 | Todo dado operacional deve estar vinculado a um tenant/empresa. Nenhum usuário de uma empresa pode acessar dados de outra.                |
| RN-002 | Toda empresa deve ter pelo menos um admin responsável.                                                                                    |
| RN-003 | Uma assinatura ativa deve liberar o uso conforme plano. Assinatura suspensa deve bloquear geração de novos PDFs e automações.             |
| RN-004 | Cada assinatura/empresa deve possuir uma instância de WhatsApp vinculada, salvo planos futuros com múltiplos números.                     |
| RN-005 | A IA só pode calcular preço quando houver regra de cálculo configurada e publicada para o tipo de orçamento.                              |
| RN-006 | No modo simples/manual, a IA deve usar apenas valores fornecidos ou confirmados pelo usuário. Se o valor estiver ausente, deve perguntar. |
| RN-007 | Quando dados obrigatórios estiverem faltando, a IA deve fazer perguntas objetivas antes de gerar o PDF.                                   |
| RN-008 | Orçamentos editados devem gerar nova versão, mantendo histórico da versão anterior.                                                       |
| RN-009 | Descontos acima do limite configurado devem exigir permissão de admin.                                                                    |
| RN-010 | Ao gerar orçamento, o sistema deve criar ou atualizar cliente e criar oportunidade/lead.                                                  |
| RN-011 | Ao fechar venda, o sistema deve registrar data de fechamento e permitir agendamento de manutenção/follow-up conforme regra.               |
| RN-012 | Mensagens automáticas devem respeitar opt-out, pausa manual e janela de contato recente definida pela empresa.                            |
| RN-013 | PDF deve conter identificação da empresa e número único do documento.                                                                     |
| RN-014 | Logs de erro da IA, WhatsApp e PDF devem ficar disponíveis para suporte interno.                                                          |
| RN-015 | Cancelamento de assinatura não deve excluir dados imediatamente; deve haver política de retenção configurável.                            |

# 11. Modelo de dados inicial

O modelo abaixo é conceitual e serve como base para estruturação do banco. Os nomes podem mudar durante a implementação, mas as entidades representam os domínios principais do SaaS.

| **Entidade**                | **Campos principais**                                                             | **Observações**                           |
|-----------------------------|-----------------------------------------------------------------------------------|-------------------------------------------|
| Tenant/Empresa              | id, nome, documento, telefone, e-mail, endereço, status, created_at               | Unidade de isolamento do SaaS.            |
| Usuário                     | id, tenant_id, nome, e-mail, senha_hash, papel, ativo                             | Admin, vendedor, funcionário, suporte.    |
| Plano                       | id, nome, preço, limites, recursos                                                | Define limites e recursos disponíveis.    |
| Assinatura                  | id, tenant_id, plano_id, status, início, fim, gateway_customer_id                 | Controla acesso e cobrança.               |
| Instância WhatsApp          | id, tenant_id, provider, instance_id, status, número, token_ref                   | Vinculada à assinatura/empresa.           |
| Perfil da empresa           | tenant_id, logo_url, cores, termos, validade_padrao                               | Usado no PDF e IA.                        |
| Template PDF                | id, tenant_id, nome, layout, cores, seções, ativo                                 | Pode ser único no MVP.                    |
| Tipo de documento/orçamento | id, tenant_id, nome, modalidade, descrição, ativo                                 | Define se é calculado ou simples.         |
| Critério                    | id, tipo_documento_id, nome, tipo_campo, obrigatório, pergunta_ia, ordem          | Campos que a IA deve coletar.             |
| Regra de cálculo            | id, tipo_documento_id, expressão/regra, prioridade, ativo, versão                 | Só usado na modalidade calculada.         |
| Cliente                     | id, tenant_id, nome, telefone, e-mail, endereço, observações, opt_out             | Cliente final/lead.                       |
| Conversa                    | id, tenant_id, cliente_id, canal, status, última_mensagem                         | Histórico de WhatsApp.                    |
| Mensagem                    | id, conversa_id, origem, tipo, conteúdo, mídia_url, status                        | Texto, áudio, PDF, erro.                  |
| Orçamento/Documento         | id, tenant_id, cliente_id, tipo_id, modalidade, status, valor_total, versão_atual | Registro principal gerado pela IA/painel. |
| Item do orçamento           | id, orçamento_id, descrição, quantidade, unidade, valor_unitário, total           | Pode ser extraído pela IA.                |
| PDF gerado                  | id, orçamento_id, versão, arquivo_url, hash, criado_em                            | Histórico de PDFs.                        |
| Oportunidade/Lead           | id, tenant_id, cliente_id, orçamento_id, coluna, valor, motivo_perda              | Kanban comercial.                         |
| Serviço/Venda               | id, tenant_id, cliente_id, oportunidade_id, data_fechamento, valor_final          | Criado ao fechar venda.                   |
| Template de mensagem        | id, tenant_id, tipo_serviço_id, nome, conteúdo, canal, ativo                      | Follow-up, manutenção, pós-venda.         |
| Agendamento de mensagem     | id, tenant_id, cliente_id, template_id, data_envio, status                        | Agenda de automações.                     |
| Log de automação            | id, agendamento_id, evento, erro, timestamp                                       | Rastreio de envios.                       |
| Audit log                   | id, tenant_id, user_id, ação, entidade, antes/depois, timestamp                   | Auditoria e suporte.                      |

## 11.1 Campos recomendados para critérios

| **Campo**      | **Uso**                                                          |
|----------------|------------------------------------------------------------------|
| nome           | Nome interno do critério, por exemplo “metros_lineares”.         |
| rótulo         | Nome exibido ao usuário, por exemplo “Metros lineares”.          |
| tipo           | text, number, money, measure, select, boolean, date, file/photo. |
| obrigatório    | Define se a IA deve perguntar antes de gerar.                    |
| pergunta_ia    | Pergunta sugerida quando o dado faltar.                          |
| opções         | Lista para campos de seleção.                                    |
| valor_padrão   | Valor assumido quando permitido.                                 |
| validação      | Min, max, formato, unidade esperada.                             |
| afeta_preço    | Sim/não; se participa do cálculo.                                |
| aparece_no_pdf | Sim/não; se deve constar no documento final.                     |
| ordem          | Ordem de coleta e exibição.                                      |

# 12. Requisitos não funcionais

| **Categoria**        | **Requisito**                                                                                                             |
|----------------------|---------------------------------------------------------------------------------------------------------------------------|
| Responsividade       | Painel deve funcionar bem em desktop e mobile, com foco em uso pelo celular.                                              |
| Disponibilidade      | Serviços críticos de WhatsApp, IA e geração de PDF devem ter monitoramento e fallback de erro.                            |
| Performance          | Geração de PDF deve ocorrer em tempo aceitável para conversa; meta inicial: até 30 segundos em documentos simples.        |
| Escalabilidade       | Arquitetura deve suportar múltiplas empresas, múltiplas instâncias WhatsApp e filas de mensagens.                         |
| Segurança            | Dados de tenants isolados, credenciais protegidas, tokens criptografados, controle de permissões.                         |
| LGPD                 | Permitir gestão de dados pessoais, opt-out de mensagens, exclusão/anomização mediante solicitação e política de retenção. |
| Auditoria            | Registrar ações críticas e alterações de regras comerciais.                                                               |
| Observabilidade      | Logs estruturados para IA, WhatsApp, PDF, automações, billing e erros de webhook.                                         |
| Confiabilidade da IA | IA deve perguntar quando faltar informação e nunca inventar preço ou dados comerciais.                                    |
| Backup               | Backup periódico do banco e arquivos gerados.                                                                             |
| Armazenamento        | PDFs, logos e anexos devem ser armazenados com vínculo ao tenant e controle de acesso.                                    |
| Manutenibilidade     | Separar módulos de IA, WhatsApp, billing, PDF, CRM e automação para evolução independente.                                |

# 13. Integrações externas

| **Integração**                              | **Uso**                                                                                              | **Prioridade** | **Observação**                                                                             |
|---------------------------------------------|------------------------------------------------------------------------------------------------------|----------------|--------------------------------------------------------------------------------------------|
| WhatsApp API / Z-API ou fornecedor definido | Receber mensagens, áudios, webhooks, criar instância e enviar PDFs.                                  | P0             | A transcrição cita “AZ API/UAZ API”; validar nome/documentação final antes de implementar. |
| IA/LLM                                      | Classificação de intenção, extração de dados, perguntas, estruturação de documento e redação do PDF. | P0             | Usar camada de prompts por tenant e por modalidade.                                        |
| Speech-to-text                              | Transcrever áudios do WhatsApp para a IA processar.                                                  | P0             | Pode ser serviço do próprio provedor de IA ou módulo separado.                             |
| Gerador de PDF                              | Criar documentos com layout personalizado.                                                           | P0             | Pode ser biblioteca backend ou serviço dedicado.                                           |
| Gateway de pagamento                        | Assinatura recorrente, webhooks de pagamento, suspensão e liberação.                                 | P1             | Fornecedor pendente: Stripe, Mercado Pago, Asaas, Pagar.me etc.                            |
| E-mail transacional                         | Recuperação de senha, convite de usuário, alertas administrativos.                                   | P1             | Pode ser substituído parcialmente por WhatsApp no MVP.                                     |
| Armazenamento de arquivos                   | Logos, PDFs, anexos e documentos.                                                                    | P0             | Precisa controle de acesso por tenant.                                                     |

## 13.1 Eventos mínimos de webhook WhatsApp

- Mensagem recebida: texto, áudio, imagem/anexo e contato.

- Status de instância: conectado, desconectado, aguardando QR Code, erro.

- Status de mensagem enviada: enviada, entregue, lida, falha, se disponível.

- Evento de mídia: arquivo disponível para download/transcrição.

- Evento de reconexão/expiração de sessão.

# 14. IA: comportamento, limites e critérios de segurança

## 14.1 Responsabilidades da IA

- Entender a intenção da conversa: orçamento, alteração, consulta, dúvida, follow-up ou suporte.

- Identificar a empresa/tenant pela instância de WhatsApp.

- Extrair dados estruturados de texto e áudio.

- Perguntar dados obrigatórios faltantes conforme configuração.

- Escolher a modalidade correta: inteligente/calculada ou simples/manual.

- Montar resumo do orçamento/documento antes da geração quando configurado.

- Gerar texto comercial claro para o PDF, respeitando termos e identidade da empresa.

- Não inventar informações comerciais nem assumir preço sem regra/confirmacão.

## 14.2 Guardrails obrigatórios

| **Situação**                  | **Comportamento esperado**                                                               |
|-------------------------------|------------------------------------------------------------------------------------------|
| Falta dado obrigatório        | Perguntar ao usuário de forma objetiva antes de gerar.                                   |
| Preço ausente no modo simples | Perguntar o valor; não sugerir preço.                                                    |
| Regra de cálculo inexistente  | Informar que precisa de revisão/configuração ou encaminhar para humano.                  |
| Dados conflitantes            | Pedir confirmação do ponto conflitante.                                                  |
| Pedido fora do escopo         | Responder que só pode ajudar com orçamentos, documentos, clientes e serviços da empresa. |
| Cliente pede desconto         | Aplicar somente se houver permissão/regra ou encaminhar para responsável.                |
| Assinatura suspensa           | Não gerar documento; informar status ao admin ou apresentar mensagem configurada.        |
| Arquivo/áudio ilegível        | Solicitar reenvio ou confirmação por texto.                                              |

## 14.3 Prompt base conceitual por modalidade

| **Modalidade**        | **Diretriz para a IA**                                                                                                                                                                                    |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Inteligente/calculada | “Colete todos os critérios obrigatórios configurados, peça o que faltar, envie os dados estruturados ao motor de cálculo e gere o documento apenas com base no resultado calculado pelo sistema.”         |
| Simples/manual        | “Transforme a descrição do usuário em um documento profissional. Use somente os valores que o usuário informou ou confirmou. Se valores ou dados essenciais estiverem ausentes, pergunte antes de gerar.” |

# 15. MVP, fases e roadmap

## 15.1 MVP recomendado

O MVP deve provar o ciclo completo: empresa SaaS configurada, WhatsApp conectado, IA coletando dados, orçamento/documento gerado em PDF, cliente/lead registrado e acesso controlado por assinatura.

| **Bloco MVP**           | **Entregas**                                                                 |
|-------------------------|------------------------------------------------------------------------------|
| Base SaaS               | Tenants, usuários, papéis, login, status de assinatura, painel Super Admin.  |
| Configuração da empresa | Dados comerciais, logo, cores, termos, validade do orçamento.                |
| WhatsApp                | Instância por empresa, webhook de mensagem, envio de resposta e PDF.         |
| IA                      | Texto/áudio, extração de dados, perguntas faltantes e seleção de modalidade. |
| Modalidade simples      | Geração por descrição livre com valores informados.                          |
| Modalidade calculada    | Cadastro simples de tipo de orçamento, critérios e regras básicas de preço.  |
| PDF                     | Template único personalizável e envio pelo WhatsApp.                         |
| CRM básico              | Cadastro de cliente, orçamento e status inicial da oportunidade.             |
| Painel mobile-first     | Dashboard simples, configurações, clientes, orçamentos e histórico.          |

## 15.2 Fase 1.5 - SaaS comercial mais robusto

- Gateway de pagamento com assinatura recorrente e webhooks.

- Onboarding self-service com trial e assinatura online.

- Limites de uso por plano e tela de upgrade.

- Kanban completo de vendas.

- Versionamento de regras de cálculo e PDFs.

- Logs administrativos e tela de suporte.

## 15.3 Fase 2 - Retenção e aumento de faturamento

- Agenda visual de mensagens automáticas.

- Templates por tipo de serviço e manutenção recorrente.

- Pausa/cancelamento de mensagens por cliente.

- Campanhas de reativação e pós-venda.

- Relatórios de taxa de fechamento, receita gerada e follow-ups convertidos.

- Múltiplos modelos de PDF e aceite digital.

## 15.4 Fase 3 - Expansão

- Marketplace de templates por segmento: calheiro, gesseiro, ar-condicionado, marceneiro etc.

- Integrações com CRMs/ERPs externos.

- Multi-número por empresa.

- Aplicativo nativo, caso necessário.

- Assistente de configuração de critérios por segmento usando IA.

# 16. Critérios de aceite

| **Área**               | **Critério de aceite**                                                                                            |
|------------------------|-------------------------------------------------------------------------------------------------------------------|
| SaaS                   | Super Admin consegue criar empresa, atribuir plano/status e acessar informações sem misturar dados entre tenants. |
| Login                  | Admin da empresa consegue entrar, cadastrar usuários e configurar empresa.                                        |
| Personalização         | PDF gerado exibe logo, cores, dados da empresa, data, validade, cliente, itens e valor.                           |
| WhatsApp               | Mensagem recebida pelo WhatsApp cria conversa no sistema e resposta é enviada pelo mesmo canal.                   |
| Áudio                  | Áudio enviado é transcrito e processado pela IA.                                                                  |
| Modo simples           | Usuário consegue informar descrição e valores; sistema gera PDF sem cadastrar regra de cálculo.                   |
| Modo simples sem preço | IA pergunta o valor antes de gerar documento.                                                                     |
| Modo calculado         | IA coleta critérios faltantes e gera orçamento com base em regra cadastrada.                                      |
| Não invenção de preço  | IA não cria preço quando regra ou valor informado não existem.                                                    |
| CRM                    | Todo documento gerado cria/atualiza cliente e registra oportunidade.                                              |
| Kanban básico          | Usuário consegue alterar status da oportunidade e registrar fechado/perdido.                                      |
| Assinatura suspensa    | Sistema bloqueia novos PDFs, pausa automações e impede bot de gerar documentos.                                   |
| PDF pelo WhatsApp      | PDF é enviado ao cliente/usuário e fica disponível no painel.                                                     |
| Logs                   | Erros de IA, WhatsApp e geração de PDF ficam rastreáveis para suporte.                                            |

# 17. Métricas, riscos e pendências

## 17.1 Métricas de sucesso

| **Métrica**                           | **Objetivo**                                             |
|---------------------------------------|----------------------------------------------------------|
| Tempo médio para gerar orçamento      | Medir redução de tempo operacional.                      |
| Orçamentos gerados por empresa/mês    | Medir adoção e valor recorrente.                         |
| Taxa de conversão orçamento -\> venda | Medir impacto comercial.                                 |
| Follow-ups enviados e convertidos     | Medir aumento de faturamento por automação.              |
| Uso por modalidade                    | Entender se clientes preferem modo simples ou calculado. |
| Intervenções humanas por orçamento    | Medir qualidade da IA e configuração dos critérios.      |
| Falhas de WhatsApp/API                | Monitorar confiabilidade operacional.                    |
| Churn e inadimplência                 | Medir saúde do SaaS.                                     |

## 17.2 Riscos

| **Risco**                                     | **Impacto**                       | **Mitigação**                                                                   |
|-----------------------------------------------|-----------------------------------|---------------------------------------------------------------------------------|
| Regras de preço muito diferentes por segmento | Configuração pode ficar complexa. | Criar motor flexível e começar com segmentos piloto.                            |
| IA inventar ou interpretar mal preço          | Erro comercial grave.             | Guardrails, validação de dados, confirmação e uso de motor de cálculo separado. |
| Instabilidade da API de WhatsApp              | Interrompe canal principal.       | Monitoramento, logs, reconexão e estudo de fornecedor oficial/alternativo.      |
| Onboarding complexo                           | Baixa ativação do SaaS.           | Oferecer modo simples/manual e templates por segmento.                          |
| Mensagens automáticas mal configuradas        | Irritação do cliente final.       | Opt-out, agenda visual, pausa e regras de contato recente.                      |
| LGPD e consentimento                          | Risco jurídico e reputacional.    | Política de privacidade, base legal, opt-out e retenção de dados.               |
| Custo de IA/mensagens                         | Margem do SaaS pode cair.         | Limites por plano e monitoramento de uso.                                       |

## 17.3 Pendências de decisão

| **Pendência**                | **Decisão necessária**                                                                             |
|------------------------------|----------------------------------------------------------------------------------------------------|
| Fornecedor final de WhatsApp | Confirmar se será Z-API, AZ API, API oficial da Meta ou outro provedor.                            |
| Gateway de pagamento         | Definir fornecedor para assinatura recorrente.                                                     |
| Política de retenção         | Definir prazo para manter dados após cancelamento.                                                 |
| Planos comerciais            | Definir limites, preços, trial, documentos/mês, usuários, mensagens e automações.                  |
| Primeiro segmento piloto     | Escolher vertical inicial para validar critérios: calheiro, gesseiro, ar-condicionado etc.         |
| Nível de aprovação humana    | Definir se PDF é enviado automaticamente ou exige confirmação do usuário/admin em alguns cenários. |
| Templates de mensagem        | Definir mensagens padrão e consentimento para follow-ups.                                          |
| Stack técnica                | Definir frontend, backend, banco, storage, IA, filas, PDF e deploy.                                |

# 18. Backlog inicial priorizado

| **Épico**      | **História de usuário**                                                               | **Prioridade** |
|----------------|---------------------------------------------------------------------------------------|----------------|
| SaaS           | Como Super Admin, quero criar uma empresa assinante para liberar um ambiente isolado. | P0             |
| SaaS           | Como Admin, quero acessar minha empresa com login e senha para configurar o sistema.  | P0             |
| Empresa        | Como Admin, quero cadastrar logo, cores e dados comerciais para personalizar PDFs.    | P0             |
| WhatsApp       | Como Admin, quero conectar meu número de WhatsApp para receber pedidos de orçamento.  | P0             |
| IA             | Como cliente ou vendedor, quero enviar áudio/texto para a IA criar um orçamento.      | P0             |
| Modo simples   | Como vendedor, quero descrever itens e valores para gerar PDF sem configurar cálculo. | P0             |
| Modo simples   | Como empresa, quero que a IA pergunte o preço quando eu esquecer de informar.         | P0             |
| Modo calculado | Como Admin, quero cadastrar critérios e regras para a IA calcular orçamento.          | P0             |
| PDF            | Como usuário, quero receber o PDF pelo WhatsApp e baixá-lo no painel.                 | P0             |
| CRM            | Como empresa, quero que cada orçamento vire um lead para eu acompanhar a venda.       | P0             |
| Kanban         | Como vendedor, quero mover orçamento entre etapas até fechar ou perder.               | P1             |
| Automação      | Como Admin, quero configurar mensagens de manutenção para clientes antigos.           | P1             |
| Agenda         | Como Admin, quero ver quais mensagens automáticas serão enviadas nos próximos dias.   | P1             |
| Billing        | Como SaaS, quero cobrar assinatura e bloquear/liberar acesso por pagamento.           | P1             |
| Relatórios     | Como empresa, quero ver quantos orçamentos viraram vendas.                            | P2             |
| Templates      | Como KyberGo, quero oferecer modelos prontos por segmento para acelerar onboarding.   | P2             |

# 19. Anexo - Consolidação das transcrições

A reunião inicial definiu o KyberGo como uma IA via WhatsApp para gerar orçamentos de empresas prestadoras de serviço, usando critérios cadastrados no painel para reproduzir a lógica comercial do proprietário. Também foram definidos: painel administrador, cadastro de empresas, clientes, PDF personalizado, integração WhatsApp, CRM, Kanban, serviços/vendas, mensagens automáticas e modelo SaaS.

A transcrição complementar adicionou uma modalidade mais simples: o usuário não precisa ter critérios nem cálculo configurado. Ele informa a descrição do serviço e os valores durante a conversa; a IA organiza as informações e gera o PDF personalizado. Essa modalidade existe para gerar documentos de forma rápida pelo WhatsApp, evitando que o prestador pare o trabalho para montar PDF no computador.

| **Síntese técnica:** Para o desenvolvimento, a prioridade é construir uma base que aceite as duas modalidades sem duplicar sistemas: o mesmo cadastro de empresa, PDF, WhatsApp, cliente, orçamento e CRM deve servir tanto para documentos simples quanto para orçamentos calculados. |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
