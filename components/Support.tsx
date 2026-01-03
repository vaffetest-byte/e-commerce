import React, { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Clock, Filter, 
  ChevronRight, ArrowLeft, Send, User, 
  ShieldAlert, MoreVertical, Loader2,
  AlertCircle, CheckCircle2, Star, Trash2,
  Mail, Package, FileText, Smartphone, Lock
} from 'lucide-react';
import { SupportTicket, TicketStatus, TicketPriority, TicketReply } from '../types';
import { inventoryService } from '../services/inventoryService';

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'All'>('All');
  const [replyText, setReplyText] = useState("");
  const [internalNote, setInternalNote] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    const data = await inventoryService.getTickets();
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (ticketId: string, status: TicketStatus) => {
    await inventoryService.updateTicket(ticketId, { status });
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status });
    }
    fetchTickets();
  };

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    await inventoryService.addTicketReply(selectedTicket.id, replyText, "Seoul Muse Support", true);
    const updated = await inventoryService.getTickets();
    setSelectedTicket(updated.find(t => t.id === selectedTicket.id) || null);
    setReplyText("");
    fetchTickets();
  };

  const handleAddNote = async () => {
    if (!selectedTicket || !internalNote.trim()) return;
    await inventoryService.addTicketNote(selectedTicket.id, internalNote);
    const updated = await inventoryService.getTickets();
    setSelectedTicket(updated.find(t => t.id === selectedTicket.id) || null);
    setInternalNote("");
  };

  const filteredTickets = tickets.filter(t => 
    (statusFilter === 'All' || t.status === statusFilter) &&
    (t.customerName.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search))
  );

  const getPriorityStyle = (p: TicketPriority) => {
    switch (p) {
      case TicketPriority.CRITICAL: return 'bg-rose-500 text-white shadow-rose-100';
      case TicketPriority.HIGH: return 'bg-rose-50 text-rose-600 border-rose-100';
      case TicketPriority.MEDIUM: return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-40">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12 px-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-6 italic">Support Command // Experience Core</span>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 serif italic">Ticket <span className="not-italic font-black text-rose-600">Archive</span></h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group w-full sm:w-80">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500" />
                <input 
                    type="text" 
                    placeholder="TICKET ID / MUSE..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[30px] text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 focus:ring-rose-500/5"
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Ticket List Section */}
        <div className={`${selectedTicket ? 'hidden lg:block lg:col-span-4' : 'lg:col-span-12'} bg-white rounded-[60px] border border-slate-100 overflow-hidden shadow-2xl transition-all`}>
           <div className="flex gap-6 px-10 py-6 border-b border-slate-50 overflow-x-auto no-scrollbar">
              {['All', ...Object.values(TicketStatus)].map(s => (
                <button 
                  key={s}
                  onClick={() => setStatusFilter(s as any)}
                  className={`text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-full border transition-all whitespace-nowrap ${statusFilter === s ? 'bg-black text-white border-black' : 'text-slate-300 border-transparent hover:bg-slate-50'}`}
                >
                  {s}
                </button>
              ))}
           </div>

           <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-rose-500" /></div>
              ) : filteredTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-10 cursor-pointer group hover:bg-slate-50 transition-all ${selectedTicket?.id === ticket.id ? 'bg-slate-50' : ''}`}
                >
                   <div className="flex justify-between items-start mb-6">
                      <span className="text-[11px] font-black text-slate-900 tracking-widest">{ticket.id}</span>
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getPriorityStyle(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                   </div>
                   <h3 className="serif text-2xl font-bold italic tracking-tighter mb-4 truncate text-slate-800">{ticket.subject}</h3>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-all">
                            <User size={14} />
                         </div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.customerName}</p>
                      </div>
                      <span className="text-[9px] font-bold text-slate-200 uppercase tracking-widest">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                   </div>
                </div>
              ))}
              {filteredTickets.length === 0 && (
                <div className="py-40 text-center opacity-10 italic serif text-4xl">No inquiries found.</div>
              )}
           </div>
        </div>

        {/* Detailed View / Chat Section */}
        {selectedTicket && (
          <div className="lg:col-span-8 space-y-10 animate-in slide-in-from-right-10 duration-500">
            {/* Ticket Header Card */}
            <div className="bg-white rounded-[60px] p-12 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start gap-10">
               <div>
                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setSelectedTicket(null)} className="lg:hidden p-3 bg-slate-50 rounded-full hover:bg-rose-500 hover:text-white transition-all">
                       <ArrowLeft size={16} />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 italic uppercase">Operational Support</span>
                  </div>
                  <h2 className="serif text-5xl md:text-7xl font-bold italic tracking-tighter mb-6">{selectedTicket.subject}</h2>
                  <div className="flex flex-wrap gap-4">
                     <span className="px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {selectedTicket.id}
                     </span>
                     <div className="relative">
                        <select 
                          value={selectedTicket.status} 
                          onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as TicketStatus)}
                          className="px-6 py-3 rounded-2xl bg-white border border-rose-100 text-[9px] font-black uppercase tracking-widest text-rose-600 outline-none appearance-none cursor-pointer pr-10"
                        >
                           {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-300 pointer-events-none rotate-90" size={12} />
                     </div>
                     {selectedTicket.orderId && (
                       <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-[9px] font-black uppercase tracking-widest text-indigo-600">
                         <Package size={12} /> {selectedTicket.orderId}
                       </div>
                     )}
                  </div>
               </div>
               <div className="flex gap-4">
                  <button className="p-5 bg-slate-50 hover:bg-rose-600 hover:text-white rounded-[24px] border border-black/5 transition-all text-slate-300">
                    <Trash2 size={20} />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              {/* Chat Thread */}
              <div className="xl:col-span-8 flex flex-col h-[700px] bg-white rounded-[60px] border border-slate-100 shadow-xl overflow-hidden">
                <div className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar">
                   {/* Initial Message */}
                   <div className="flex gap-8 max-w-[90%] group">
                      <div className="w-12 h-12 rounded-[18px] bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                         <User size={20} />
                      </div>
                      <div className="space-y-3">
                         <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{selectedTicket.customerName}</span>
                            <span className="text-[8px] font-bold text-slate-200 uppercase tracking-widest">Initial Report</span>
                         </div>
                         <div className="p-8 bg-slate-50 rounded-[32px] rounded-tl-none border border-slate-100">
                            <p className="text-base text-slate-700 leading-relaxed italic serif">{selectedTicket.message}</p>
                         </div>
                      </div>
                   </div>

                   {/* Replies */}
                   {selectedTicket.replies.map(reply => (
                     <div key={reply.id} className={`flex gap-8 max-w-[90%] ${reply.isAdmin ? 'ml-auto flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 shadow-lg ${reply.isAdmin ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                           {reply.isAdmin ? <ShieldAlert size={20} /> : <User size={20} />}
                        </div>
                        <div className={`space-y-3 ${reply.isAdmin ? 'text-right' : ''}`}>
                           <div className="flex items-center gap-4 justify-end">
                              {!reply.isAdmin && <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{reply.sender}</span>}
                              <span className="text-[8px] font-bold text-slate-200 uppercase tracking-widest">{new Date(reply.timestamp).toLocaleTimeString()}</span>
                              {reply.isAdmin && <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Support Protocol</span>}
                           </div>
                           <div className={`p-8 rounded-[32px] border ${reply.isAdmin ? 'bg-rose-600 text-white border-rose-600 rounded-tr-none' : 'bg-slate-50 text-slate-700 border-slate-100 rounded-tl-none'}`}>
                              <p className={`text-base leading-relaxed ${reply.isAdmin ? 'font-medium' : 'italic serif'}`}>{reply.message}</p>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                <form onSubmit={handleAddReply} className="p-10 border-t border-slate-50 bg-white">
                   <div className="relative group">
                      <input 
                        type="text" 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="ENTER RESPONSE PROTOCOL..."
                        className="w-full pl-8 pr-20 py-6 bg-slate-50 rounded-full text-[11px] font-black uppercase tracking-widest outline-none transition-all focus:ring-4 focus:ring-rose-500/5 focus:bg-white"
                      />
                      <button 
                        type="submit"
                        disabled={!replyText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-all disabled:opacity-20"
                      >
                         <Send size={20} />
                      </button>
                   </div>
                </form>
              </div>

              {/* Sidebar: Metadata & Internal Notes */}
              <div className="xl:col-span-4 space-y-10">
                 <div className="bg-slate-950 p-12 rounded-[60px] text-white space-y-12">
                    <div>
                       <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 italic">Registry Intelligence</h4>
                       <div className="space-y-8">
                          <div className="flex items-center gap-6">
                             <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-rose-500">
                                <Mail size={16} />
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Resident Handle</p>
                                <p className="text-xs font-mono">{selectedTicket.customerId}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-rose-500">
                                <Clock size={16} />
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Operational Latency</p>
                                <p className="text-xs font-bold uppercase tracking-tight">Opened {new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-10 border-t border-white/5 space-y-8">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Internal Command Notes</h4>
                       <div className="space-y-4 max-h-[200px] overflow-y-auto no-scrollbar">
                          {selectedTicket.internalNotes.map((note, i) => (
                            <div key={i} className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl text-[9px] text-white/50 leading-relaxed font-mono">
                               {note}
                            </div>
                          ))}
                          {selectedTicket.internalNotes.length === 0 && (
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/10 italic text-center py-4">No audit notes recorded.</p>
                          )}
                       </div>
                       <div className="space-y-4">
                          <textarea 
                            value={internalNote}
                            onChange={(e) => setInternalNote(e.target.value)}
                            placeholder="ADMIN NOTE..."
                            className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-rose-500 min-h-[100px]"
                          />
                          <button 
                            onClick={handleAddNote}
                            disabled={!internalNote.trim()}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-10"
                          >
                             Commit to Audit Log
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
