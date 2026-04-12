import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Select, Spin, message } from "antd";
import VenueProfileHeader from "./VenueProfileHeader";
import VenueLogoUpload from "./VenueLogoUpload";
import BasicInfoCard from "./BasicInfoCard";
import AddressCard from "./AddressCard";
import ContactsSection from "./ContactsSection";
import SocialsCard from "./SocialsCard";
import LegalCard from "./LegalCard";
import { SectionLabel } from "./SectionCard";
import { listVenues } from "../../api/venue";
import {
  getCurrentVenueProfile,
  upsertVenueProfile,
} from "../../api/venueprofile";
import { ROLES } from "../../../config";
import {
  createContactPerson,
  deleteContactPerson,
  updateContactPerson,
} from "../../api/contactperson";
import { getPresignUrl } from "../../api/images";

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

function normalizeProfile(p) {
  const profile = p?.profile ?? p;
  return {
    logo: profile?.logo ?? "",
    venueId: profile?.venueId ?? null,
    venueName: profile?.venueName ?? profile?.venue?.name ?? "",
    tagline: profile?.tagline ?? "",
    description: profile?.description ?? "",
    address: {
      line1: profile?.address?.line1 ?? "",
      line2: profile?.address?.line2 ?? "",
      city: profile?.address?.city ?? "",
      state: profile?.address?.state ?? "",
      pincode: profile?.address?.pincode ?? "",
      country: profile?.address?.country ?? "",
    },
    googleMapUrl: profile?.googleMapUrl ?? "",
    email: profile?.email ?? "",
    instagram: profile?.instagram ?? "",
    facebook: profile?.facebook ?? "",
    website: profile?.website ?? "",
    contactPersons: Array.isArray(profile?.contactPersons)
      ? profile.contactPersons.map((c) => ({
          _id: c?._id,
          name: c?.name ?? "",
          designation: c?.designation ?? "",
          contactNumber: c?.contactNumber ?? c?.contact_number ?? "",
        }))
      : [],
    legal: {
      businessName: profile?.legal?.businessName ?? profile?.legal?.business_name ?? "",
      gst: profile?.legal?.gst ?? "",
    },
  };
}

function buildUpsertPayload(profile, { venueIdForAdmin } = {}) {
  const payload = {
    logo: profile.logo || "",
    venueName: profile.venueName || "",
    tagline: profile.tagline || "",
    description: profile.description || "",
    address: {
      line1: profile.address?.line1 || "",
      line2: profile.address?.line2 || "",
      city: profile.address?.city || "",
      state: profile.address?.state || "",
      pincode: profile.address?.pincode || "",
      country: profile.address?.country || "",
    },
    googleMapUrl: profile.googleMapUrl || "",
    email: profile.email || "",
    instagram: profile.instagram || "",
    facebook: profile.facebook || "",
    website: profile.website || "",
    contactPersons: (profile.contactPersons || []).map((c) => ({
      ...(c?._id ? { _id: c._id } : {}),
      name: c?.name || "",
      designation: c?.designation || "",
      contactNumber: c?.contactNumber || "",
    })),
    legal: {
      businessName: profile.legal?.businessName || "",
      gst: profile.legal?.gst || "",
    },
  };

  if (venueIdForAdmin) payload.venueId = venueIdForAdmin;
  return payload;
}

/** Canonical snapshot for dirty check (stable key order). */
function profileSnapshot(p) {
  return JSON.stringify({
    logo: p?.logo ?? "",
    venueName: p?.venueName ?? "",
    tagline: p?.tagline ?? "",
    description: p?.description ?? "",
    address: p?.address ?? {},
    googleMapUrl: p?.googleMapUrl ?? "",
    email: p?.email ?? "",
    instagram: p?.instagram ?? "",
    facebook: p?.facebook ?? "",
    website: p?.website ?? "",
    legal: p?.legal ?? {},
    contactPersons: p?.contactPersons ?? [],
  });
}

export default function VenueProfile() {
  const { access_token: accessToken, role, venueId: myVenueId, venue: venueFromRedux } = useSelector((s) => s.user.value);
  const [msgApi, contextHolder] = message.useMessage();

  const isAdmin = role === ROLES.ADMIN;
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venueOptions, setVenueOptions] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState(myVenueId ?? null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(() =>
    normalizeProfile({
      venueId: myVenueId ?? null,
    }),
  );

  /** Baseline for dirty check; must not stay null or edits never enable Save. */
  const lastSavedSnapshotRef = useRef(profileSnapshot(profile));

  const isDirty = useMemo(
    () => profileSnapshot(profile) !== lastSavedSnapshotRef.current,
    [profile],
  );

  /** Read-only venue name: from Redux (incharge) or selected option label (admin). */
  const displayVenueName = useMemo(() => {
    if (isAdmin) {
      const opt = venueOptions.find((o) => o.value === selectedVenueId);
      return opt?.label ?? "";
    }
    return venueFromRedux?.name ?? "";
  }, [isAdmin, selectedVenueId, venueOptions, venueFromRedux?.name]);

  useEffect(() => {
    if (!accessToken) return;
    if (!isAdmin) return;
    setVenuesLoading(true);
    listVenues(accessToken)
      .then((data) => {
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.venues)
            ? data.venues
            : Array.isArray(data?.data)
              ? data.data
              : [];
        const opts = arr
          .filter(Boolean)
          .map((v) => ({
            value: v?._id ?? v?.id,
            label: v?.name ?? v?._id ?? v?.id,
          }))
          .filter((o) => o.value);
        setVenueOptions(opts);
        if (!selectedVenueId && opts[0]?.value) setSelectedVenueId(opts[0].value);
      })
      .catch(() => {})
      .finally(() => setVenuesLoading(false));
  }, [accessToken, isAdmin, selectedVenueId]);

  const fetchProfile = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const venueId = isAdmin ? selectedVenueId : undefined;
      const data = await getCurrentVenueProfile(accessToken, { venueId });
      const normalized = normalizeProfile(data);
      const next = {
        ...normalized,
        venueId: normalized.venueId ?? (isAdmin ? selectedVenueId : myVenueId) ?? null,
      };
      setProfile((prev) => ({ ...prev, ...next }));
      lastSavedSnapshotRef.current = profileSnapshot(next);
    } catch (err) {
      msgApi.error(err?.response?.data?.message ?? "Failed to load venue profile");
      setProfile((prev) => {
        const next = { ...prev, venueId: isAdmin ? selectedVenueId : myVenueId };
        lastSavedSnapshotRef.current = profileSnapshot(next);
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAdmin, msgApi, myVenueId, selectedVenueId]);

  useEffect(() => {
    if (!accessToken) return;
    if (isAdmin && !selectedVenueId) return;
    fetchProfile();
  }, [accessToken, fetchProfile, isAdmin, selectedVenueId]);

  const handleProfilePatch = useCallback((patch) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const effectiveVenueId = (isAdmin ? selectedVenueId : myVenueId) ?? profile?.venueId;

  const handleLogoFileSelect = useCallback(
    async (file) => {
      if (!accessToken || !effectiveVenueId) {
        msgApi.error("Venue context required to upload logo");
        return;
      }
      try {
        const { uploadUrl, publicUrl } = await getPresignUrl(accessToken, {
          fileName: file.name || "venue-logo.jpg",
          contentType: file.type || "image/jpeg",
          entityId: effectiveVenueId,
          expiresIn: 900,
        });
        const response = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type || "image/jpeg" },
        });
        if (!response.ok) throw new Error("Upload failed");
        handleProfilePatch({ logo: publicUrl });
        msgApi.success("Logo uploaded");
      } catch (err) {
        msgApi.error(err?.response?.data?.message ?? err?.message ?? "Logo upload failed");
        throw err;
      }
    },
    [accessToken, effectiveVenueId, handleProfilePatch, msgApi],
  );

  const saveAll = useCallback(async () => {
    if (!accessToken) return;
    if (isAdmin && !selectedVenueId) {
      msgApi.error("Select a venue first");
      return;
    }
    setSaving(true);
    try {
      const payload = buildUpsertPayload(profile, {
        venueIdForAdmin: isAdmin ? selectedVenueId : undefined,
      });
      await upsertVenueProfile(accessToken, payload);
      msgApi.success("Profile saved");
      await fetchProfile();
    } catch (err) {
      msgApi.error(err?.response?.data?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }, [accessToken, fetchProfile, isAdmin, msgApi, profile, selectedVenueId]);

  const onSaveContact = useCallback(
    async (contactPayload) => {
      const venueId = (isAdmin ? selectedVenueId : myVenueId) ?? profile?.venueId;
      if (!venueId) throw new Error("Missing venueId");

      const payload = {
        name: contactPayload?.name ?? "",
        designation: contactPayload?.designation ?? "",
        contactNumber: contactPayload?.contactNumber ?? "",
      };

      if (contactPayload?._id) {
        await updateContactPerson(accessToken, venueId, contactPayload._id, payload);
      } else {
        await createContactPerson(accessToken, venueId, payload);
      }
      await fetchProfile();
    },
    [accessToken, fetchProfile, isAdmin, myVenueId, profile?.venueId, selectedVenueId],
  );

  const onDeleteContact = useCallback(
    async (contact) => {
      if (!contact?._id) {
        // If it was never saved, just remove locally
        setProfile((prev) => ({
          ...prev,
          contactPersons: (prev.contactPersons || []).filter((c) => c !== contact),
        }));
        return;
      }

      const venueId = (isAdmin ? selectedVenueId : myVenueId) ?? profile?.venueId;
      if (!venueId) throw new Error("Missing venueId");

      await deleteContactPerson(accessToken, venueId, contact._id);
      await fetchProfile();
    },
    [accessToken, fetchProfile, isAdmin, myVenueId, profile?.venueId, selectedVenueId],
  );

  const headerRightSlot = useMemo(() => {
    const saveBtn = (
      <Button type="primary" onClick={saveAll} loading={saving} disabled={loading || !isDirty}>
        Save
      </Button>
    );

    if (!isAdmin) return saveBtn;
    return (
      <>
        <Select
          value={selectedVenueId}
          onChange={(v) => setSelectedVenueId(v)}
          loading={venuesLoading}
          placeholder="Select venue"
          style={{ minWidth: 220 }}
          options={venueOptions}
          showSearch
          optionFilterProp="label"
        />
        {saveBtn}
      </>
    );
  }, [isAdmin, isDirty, loading, saveAll, saving, selectedVenueId, venueOptions, venuesLoading]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <div style={pageStyle}>
        {contextHolder}
        <VenueProfileHeader rightSlot={headerRightSlot} />

        <SectionLabel>Venue Logo</SectionLabel>
        <VenueLogoUpload
          logo={profile.logo}
          onChange={handleProfilePatch}
          onFileSelect={handleLogoFileSelect}
        />
        <div style={sectionGap} />

        <SectionLabel>Basic Information</SectionLabel>
        <BasicInfoCard
          venueName={displayVenueName}
          tagline={profile.tagline}
          description={profile.description}
          onChange={handleProfilePatch}
        />
        <div style={sectionGap} />

        <SectionLabel>Address</SectionLabel>
        <AddressCard
          address={profile.address}
          googleMapUrl={profile.googleMapUrl}
          onChange={handleProfilePatch}
        />
        <div style={sectionGap} />

        <ContactsSection
          contacts={profile.contactPersons}
          onSaveContact={onSaveContact}
          onDeleteContact={onDeleteContact}
          saving={saving || loading}
        />
        <div style={sectionGap} />

        <SectionLabel>Socials</SectionLabel>
        <SocialsCard
          instagram={profile.instagram}
          facebook={profile.facebook}
          email={profile.email}
          website={profile.website}
          onChange={handleProfilePatch}
        />
        <div style={sectionGap} />

        <SectionLabel>Legal</SectionLabel>
        <LegalCard legal={profile.legal} onChange={handleProfilePatch} />

        {loading ? (
          <div style={{ padding: "18px 0", display: "flex", justifyContent: "center" }}>
            <Spin />
          </div>
        ) : null}
      </div>
    </>
  );
}
