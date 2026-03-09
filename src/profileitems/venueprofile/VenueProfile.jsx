import React from "react";
import VenueProfileHeader from "./VenueProfileHeader";
import VenueLogoUpload from "./VenueLogoUpload";
import BasicInfoCard from "./BasicInfoCard";
import AddressCard from "./AddressCard";
import ContactsSection from "./ContactsSection";
import SocialsCard from "./SocialsCard";
import LegalCard from "./LegalCard";
import { SectionLabel } from "./SectionCard";

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  maxWidth: "600px",
  width: "100%",
  margin: "0 auto",
  fontFamily: "'DM Sans', sans-serif",
  padding: "0 4px",
};

const sectionGap = { marginBottom: "28px" };

export default function VenueProfile() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <div style={pageStyle}>
        <VenueProfileHeader />

        <SectionLabel>Venue Logo</SectionLabel>
        <VenueLogoUpload />
        <div style={sectionGap} />

        <SectionLabel>Basic Information</SectionLabel>
        <BasicInfoCard />
        <div style={sectionGap} />

        <SectionLabel>Address</SectionLabel>
        <AddressCard />
        <div style={sectionGap} />

        <ContactsSection />
        <div style={sectionGap} />

        <SectionLabel>Socials</SectionLabel>
        <SocialsCard />
        <div style={sectionGap} />

        <SectionLabel>Legal</SectionLabel>
        <LegalCard />
      </div>
    </>
  );
}
