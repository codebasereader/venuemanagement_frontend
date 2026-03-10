import React, { useCallback, useMemo, useState } from "react";
import { Modal, message } from "antd";
import SectionCard, { SectionLabel } from "./SectionCard";
import ContactCard from "./ContactCard";
import AddContactModal from "./AddContactModal";

const addBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#1a1917",
  color: "white",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.15s",
};

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function ContactsSection({ contacts = [], onSaveContact, onDeleteContact, saving = false }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [msgApi, contextHolder] = message.useMessage();

  const handleAdd = () => {
    setEditingContact(null);
    setModalOpen(true);
  };

  const handleSave = useCallback(
    async (payload) => {
      try {
        await onSaveContact?.(payload);
        setModalOpen(false);
        setEditingContact(null);
        msgApi.success(payload?._id ? "Contact updated" : "Contact added");
      } catch (err) {
        msgApi.error(err?.message ?? "Failed to save contact");
      }
    },
    [msgApi, onSaveContact],
  );

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setModalOpen(true);
  };

  const confirmDelete = useCallback(
    (contact) => {
      Modal.confirm({
        centered: true,
        title: "Delete contact?",
        content: `This will delete ${contact?.name || "this contact"}.`,
        okText: "Delete",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await onDeleteContact?.(contact);
            msgApi.success("Contact deleted");
          } catch (err) {
            msgApi.error(err?.message ?? "Failed to delete contact");
          }
        },
      });
    },
    [msgApi, onDeleteContact],
  );

  const orderedContacts = useMemo(() => {
    return [...contacts].filter(Boolean);
  }, [contacts]);

  return (
    <>
      {contextHolder}
      <div style={{ marginBottom: "10px" }}>
        <SectionLabel>Contacts</SectionLabel>
      </div>
      <SectionCard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: 600,
              color: "#1a1917",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Contact persons
          </p>
          <button
            type="button"
            onClick={handleAdd}
            style={addBtnStyle}
            disabled={saving}
            aria-disabled={saving}
            aria-busy={saving}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3d3b38")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1917")}
          >
            <PlusIcon /> Add
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {orderedContacts.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#9a9896",
                fontFamily: "'DM Sans', sans-serif",
                padding: "20px 0",
              }}
            >
              No contacts yet. Click Add to add one.
            </p>
          ) : (
            orderedContacts.map((contact) => (
              <ContactCard
                key={contact._id ?? `${contact?.name}-${contact?.contactNumber}`}
                contact={contact}
                onEdit={handleEdit}
                onDelete={confirmDelete}
              />
            ))
          )}
        </div>
      </SectionCard>

      <AddContactModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSave}
        editContact={editingContact}
      />
    </>
  );
}
