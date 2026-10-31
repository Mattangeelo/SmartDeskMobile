import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getTicketHistory, TicketHistoryEntry } from '../services/ticketService';
import { colors } from '../theme/colors';

export default function TicketHistoryPanel({ ticketId }: { ticketId: number }) {
  const [items, setItems] = useState<TicketHistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    getTicketHistory(ticketId, page).then(data => {
      if (!active) return;
      setItems(previous => page === 1 ? data.items : [...previous, ...data.items.filter(i => !previous.some(p => p.id === i.id))]);
      setTotal(data.total);
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : 'Não foi possível carregar o histórico.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [ticketId, page, retry]);

  return <View style={{ marginVertical: 16, gap: 10 }}>
    <Text style={{ color: colors.text, fontWeight: '700' }}>Histórico do ticket</Text>
    {items.map(item => <View key={item.id} style={{ borderLeftWidth: 2, borderLeftColor: colors.teal, paddingLeft: 12 }}>
      <Text style={{ color: colors.text }}>{item.operacao === 'criado' ? 'Ticket aberto' : `${item.estado_anterior} → ${item.estado_novo}`}</Text>
      <Text style={{ color: colors.muted }}>{item.autor_papel === 'admin' ? 'Administrador' : 'Usuário'} #{item.autor_id} · {new Date(item.created_at).toLocaleString('pt-BR')}</Text>
    </View>)}
    {loading && <ActivityIndicator color={colors.teal} />}
    {!loading && !error && items.length === 0 && <Text style={{ color: colors.muted }}>Nenhum evento registrado. Tickets anteriores à implantação não possuem histórico retroativo.</Text>}
    {!!error && <View><Text style={{ color: colors.muted }}>{error}</Text><TouchableOpacity onPress={() => setRetry(v => v + 1)}><Text style={{ color: colors.teal }}>Tentar novamente</Text></TouchableOpacity></View>}
    {!loading && !error && items.length < total && <TouchableOpacity onPress={() => setPage(v => v + 1)}><Text style={{ color: colors.teal }}>Carregar mais</Text></TouchableOpacity>}
  </View>;
}
