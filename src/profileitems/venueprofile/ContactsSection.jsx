import React, { useState } from "react";
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

const initialContacts = [
  { id: "1", name: "Alex Johnson", designation: "Sales Manager", number: "+91 98765 43210" },
];

export default function ContactsSection() {
  const [contacts, setContacts] = useState(initialContacts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const handleAdd = () => {
    setEditingContact(null);
    setModalOpen(true);
  };

  const handleSave = (payload) => {
    if (payload.id) {
      setContacts((prev) =>
        prev.map((c) => (c.id === payload.id ? { ...c, ...payload } : c))
      );
    } else {
      setContacts((prev) => [
        ...prev,
        { ...payload, id: String(Date.now()) },
      ]);
    }
    setModalOpen(false);
    setEditingContact(null);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setModalOpen(true);
  };

  const handleDelete = (contact) => {
    setContacts((prev) => prev.filter((c) => c.id !== contact.id));
  };

  return (
    <>
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
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3d3b38")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1917")}
          >
            <PlusIcon /> Add
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {contacts.length === 0 ? (
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
            contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleEdit}
                onDelete={handleDelete}
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
