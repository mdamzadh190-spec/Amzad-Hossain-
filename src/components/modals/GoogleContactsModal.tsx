import React, { useEffect, useState } from 'react';
import {
  IdCard,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Type,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { GoogleContact, fetchGoogleContacts } from '../../services/googleContacts';

interface GoogleContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  onRequireAuth: () => void;
  onInsertContactText: (name: string, details?: string) => void;
  onInsertContactBadge: (contact: GoogleContact) => void;
}

export const GoogleContactsModal: React.FC<GoogleContactsModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  onRequireAuth,
  onInsertContactText,
  onInsertContactBadge,
}) => {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadContacts = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const items = await fetchGoogleContacts(accessToken);
      setContacts(items);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to fetch contacts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!accessToken) {
        onRequireAuth();
      } else {
        loadContacts();
      }
    }
  }, [isOpen, accessToken]);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phoneNumber && c.phoneNumber.includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Google Contacts</h3>
              <p className="text-[11px] text-neutral-400">
                Insert contact names, custom badges, and typography cards into your design
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-3 border-b border-neutral-800/80 bg-neutral-950/60 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contacts by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            onClick={loadContacts}
            disabled={isLoading}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
            title="Refresh Contacts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-5 mt-3 p-2.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-lg text-xs">
            {errorMsg}
          </div>
        )}

        {/* Contacts List */}
        <div className="p-5 flex-1 overflow-y-auto">
          {isLoading && contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400 text-xs">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
              <span>Loading contacts from Google People API...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-500 text-xs text-center">
              <UserCheck className="w-10 h-10 mb-2 text-neutral-600 stroke-[1.5]" />
              <p className="font-semibold text-neutral-300 mb-1">No contacts found</p>
              <p className="max-w-xs text-neutral-500">
                Add contacts to your Google Account or try a different search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredContacts.map((contact, idx) => (
                <div
                  key={contact.resourceName || idx}
                  className="p-3.5 rounded-lg bg-neutral-950/70 hover:bg-neutral-800/80 border border-neutral-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {/* Contact Avatar */}
                    {contact.photoUrl ? (
                      <img
                        src={contact.photoUrl}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-sm shrink-0">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{contact.name}</h4>
                      {contact.jobTitle && (
                        <p className="text-[10px] text-neutral-400 truncate">
                          {contact.jobTitle} {contact.company ? `at ${contact.company}` : ''}
                        </p>
                      )}
                      {contact.email && (
                        <p className="text-[10px] text-neutral-500 flex items-center gap-1 truncate mt-0.5">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </p>
                      )}
                      {contact.phoneNumber && (
                        <p className="text-[10px] text-neutral-500 flex items-center gap-1 truncate mt-0.5">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{contact.phoneNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center gap-2">
                    <button
                      onClick={() => {
                        onInsertContactText(contact.name, contact.email || contact.phoneNumber);
                        onClose();
                      }}
                      className="flex-1 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-colors"
                    >
                      <Type className="w-3 h-3" />
                      <span>Insert Name</span>
                    </button>
                    <button
                      onClick={() => {
                        onInsertContactBadge(contact);
                        onClose();
                      }}
                      className="flex-1 py-1.5 px-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-colors shadow-sm"
                    >
                      <IdCard className="w-3 h-3" />
                      <span>Card Badge</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
