-- Estados explícitos para a futura automação de pagamento.
-- A loja continua em modo manual: nenhuma cobrança ou webhook é ativado aqui.

alter table public.orders
  add column if not exists payment_transition_state text not null default 'manual_pending'
  check (payment_transition_state in ('manual_pending', 'webhook_pending', 'paid', 'rejected'));

comment on column public.orders.payment_transition_state is
  'manual_pending enquanto Pix/dinheiro é confirmado pelo dono; webhook_pending somente após integração futura autorizada; paid e rejected exigem confirmação validada do provedor.';
