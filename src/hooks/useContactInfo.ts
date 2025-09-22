import { useContacts } from '@/context/ContactContext';

export const useContactInfo = () => {
  const { companyInfo, primaryContact, allContacts, isLoading, refreshContacts } = useContacts();

  const getContactByType = (type: 'phone' | 'email' | 'whatsapp' | 'website') => {
    if (!primaryContact) return null;
    return primaryContact[type] || null;
  };

  const getFormattedAddress = () => {
    if (!primaryContact) return null;
    const { address, city, state, zip } = primaryContact;
    if (!address || !city || !state) return null;
    return `${address}, ${city}, ${state} ${zip || ''}`.trim();
  };

  const getWhatsAppLink = () => {
    const whatsapp = getContactByType('whatsapp');
    if (!whatsapp) return null;
    const cleanNumber = whatsapp.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  const getEmailLink = () => {
    const email = getContactByType('email');
    if (!email) return null;
    return `mailto:${email}`;
  };

  const getPhoneLink = () => {
    const phone = getContactByType('phone');
    if (!phone) return null;
    const cleanNumber = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    return `tel:${cleanNumber}`;
  };

  return {
    companyInfo,
    primaryContact,
    allContacts,
    isLoading,
    refreshContacts,
    getContactByType,
    getFormattedAddress,
    getWhatsAppLink,
    getEmailLink,
    getPhoneLink,
  };
}; 