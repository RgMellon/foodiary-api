# AWS CloudFront CDN para Bucket S3 – Documentação

## Introdução: O que é uma CDN?

Uma CDN (Content Delivery Network) é uma rede distribuída de servidores que entrega conteúdo (imagens, vídeos, arquivos estáticos, etc.) aos usuários de forma rápida e eficiente, baseada na localização geográfica do usuário. O objetivo principal de uma CDN é reduzir a latência e melhorar a performance de acesso ao conteúdo, além de aumentar a disponibilidade e a segurança.

## Por que usar CDN com S3?

O Amazon S3 é um serviço de armazenamento de objetos. Quando combinado com o CloudFront (CDN da AWS), os arquivos armazenados no S3 podem ser distribuídos globalmente com baixa latência. Isso é especialmente útil para aplicações web, mobile ou qualquer serviço que precise entregar arquivos estáticos para usuários em diferentes regiões do mundo.

Benefícios:
- **Performance:** Conteúdo entregue a partir de servidores próximos ao usuário.
- **Escalabilidade:** Suporte a grandes volumes de acesso simultâneo.
- **Segurança:** Controle de acesso e proteção contra ataques DDoS.
- **Economia:** Redução de custos de transferência de dados.

## Explicação das Propriedades do YAML

Abaixo estão as principais propriedades do arquivo de configuração de infraestrutura como código (IaC) para provisionar o CloudFront integrado ao S3:

### MealsCDNOAC

- **Type:** `AWS::CloudFront::OriginAccessControl`
  - Cria um controle de acesso para a origem (S3), permitindo que apenas o CloudFront acesse o bucket.
- **OriginAccessControlConfig:**
  - **Name:** Nome do controle de acesso.
  - **Description:** Descrição do recurso.
  - **OriginAccessControlOriginType:** Define o tipo de origem (S3).
  - **SigningBehavior:** Define que todas as requisições serão assinadas.
  - **SigningProtocol:** Protocolo de assinatura (sigv4).

### MealsBucketCDN

- **Type:** `AWS::CloudFront::Distribution`
  - Cria uma distribuição do CloudFront.
- **DistributionConfig:**
  - **Enabled:** Ativa a distribuição.
  - **HttpVersion:** Versões HTTP suportadas (2 e 3).
  - **Origins:** Lista de origens (neste caso, o bucket S3).
    - **Id:** Identificador da origem.
    - **DomainName:** Nome de domínio do bucket S3.
    - **OriginAccessControlId:** Referência ao controle de acesso criado.
  - **DefaultCacheBehavior:**
    - **TargetOriginId:** Origem padrão para o cache.
    - **Compress:** Ativa compressão automática dos arquivos.
    - **ViewerProtocolPolicy:** Redireciona requisições HTTP para HTTPS.
    - **AllowedMethods:** Métodos HTTP permitidos (GET, HEAD).
    - **CachePolicyId:** Política de cache gerenciada pela AWS.
  - **ViewerCertificate:**
    - **CloudFrontDefaultCertificate:** Usa o certificado padrão do CloudFront para HTTPS.

### MealsBucketCDNPolicy

Este recurso define uma política de acesso ao bucket S3, permitindo que apenas o CloudFront acesse os objetos do bucket. Isso é fundamental para garantir que os arquivos do S3 não fiquem públicos, sendo acessíveis apenas via CDN.

- **Type:** `AWS::S3::BucketPolicy`
  - Especifica que o recurso é uma política de acesso para um bucket S3.
- **Properties:**
  - **Bucket:** Referência ao bucket S3 que receberá a política.
  - **PolicyDocument:** Documento que define as regras de acesso.
    - **Version:** Versão do documento de política (2008-10-17 é padrão para S3).
    - **Id:** Identificador da política.
    - **Statement:** Lista de regras de acesso.
      - **Sid:** Identificador da regra.
      - **Effect:** Define se a regra permite (`Allow`) ou nega (`Deny`) acesso.
      - **Principal:** Define quem pode acessar (neste caso, o serviço CloudFront).
      - **Action:** Ação permitida (aqui, `s3:GetObject` para leitura dos objetos).
      - **Resource:** Especifica quais objetos podem ser acessados (todos do bucket).
      - **Condition:** Condição adicional para o acesso.
        - **StringEquals:** Restringe o acesso para requisições originadas da distribuição CloudFront específica, usando o ARN da distribuição.

### Resumo das Propriedades

- **Type:** Tipo do recurso AWS.
- **Properties:** Propriedades do recurso.
- **Bucket:** Bucket S3 alvo da política.
- **PolicyDocument:** Documento de política de acesso.
  - **Version:** Versão da política.
  - **Id:** Identificador único.
  - **Statement:** Regras de acesso.
    - **Sid:** Identificador da regra.
    - **Effect:** Permissão ou negação.
    - **Principal:** Quem pode acessar.
    - **Action:** Ações permitidas.
    - **Resource:** Recursos afetados.
    - **Condition:** Condições para acesso.

## Referências

- [AWS CloudFront Documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
- [AWS S3 Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
- [Origin Access Control](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)

---
