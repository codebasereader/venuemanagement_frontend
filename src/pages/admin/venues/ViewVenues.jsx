import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Form, Input, Modal, Space, Tag, message } from "antd";
import AppTable from "../../../components/AppTable";
import { createVenue, deleteVenue, listVenues, updateVenue } from "../../../api/venue";

function asVenuesArray(apiData) {
  if (Array.isArray(apiData)) return apiData;
  if (Array.isArray(apiData?.venues)) return apiData.venues;
  if (Array.isArray(apiData?.data)) return apiData.data;
  return [];
}

function normalizeVenue(v) {
  if (!v || typeof v !== "object") return null;
  return {
    _id: v._id ?? v.id,
    name: v.name ?? "",
    isActive: v.isActive ?? true,
  };
}

export default function ViewVenues() {
  const accessToken = useSelector((state) => state.user.value.access_token);
  const [msgApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [editingVenue, setEditingVenue] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await listVenues(accessToken);
      const arr = asVenuesArray(data).map(normalizeVenue).filter(Boolean);
      setVenues(arr);
    } catch (err) {
      msgApi.error(err?.response?.data?.message ?? "Failed to load venues");
    } finally {
      setLoading(false);
    }
  }, [accessToken, msgApi]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openCreate = useCallback(() => {
    setModalMode("create");
    setEditingVenue(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (v) => {
      setModalMode("edit");
      setEditingVenue(v);
      form.setFieldsValue({ name: v?.name ?? "" });
      setModalOpen(true);
    },
    [form],
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingVenue(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!accessToken) return;
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const payload = { name: values.name?.trim() };

      if (modalMode === "create") {
        await createVenue(payload, accessToken);
        msgApi.success("Venue created");
      } else {
        if (!editingVenue?._id) throw new Error("Missing venue id");
        await updateVenue(editingVenue._id, payload, accessToken);
        msgApi.success("Venue updated");
      }

      closeModal();
      await refresh();
    } catch (err) {
      if (err?.errorFields) return;
      msgApi.error(err?.response?.data?.message ?? err?.message ?? "Save failed");
    } finally {
      setSubmitting(false);
    }
  }, [accessToken, closeModal, editingVenue, form, modalMode, msgApi, refresh]);

  const confirmDelete = useCallback(
    (v) => {
      Modal.confirm({
        centered: true,
        title: "Delete venue?",
        content: `This will permanently delete ${v?.name || "this venue"}.`,
        okText: "Delete",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: async () => {
          if (!v?._id) return;
          try {
            await deleteVenue(v._id, accessToken);
            msgApi.success("Venue deleted");
            await refresh();
          } catch (err) {
            msgApi.error(err?.response?.data?.message ?? "Failed to delete venue");
          }
        },
      });
    },
    [accessToken, msgApi, refresh],
  );

  const columns = useMemo(() => {
    return [
      {
        title: "Venue Name",
        dataIndex: "name",
        key: "name",
        render: (v) => <span className="font-medium text-[#1a1917]">{v || "-"}</span>,
      },
      {
        title: "Status",
        key: "status",
        width: 140,
        render: (_, v) => (v?.isActive ? <Tag color="blue">Active</Tag> : <Tag>Inactive</Tag>),
      },
      {
        title: "Actions",
        key: "actions",
        width: 200,
        render: (_, v) => (
          <Space>
            <Button onClick={() => openEdit(v)}>Edit</Button>
            <Button danger onClick={() => confirmDelete(v)}>
              Delete
            </Button>
          </Space>
        ),
      },
    ];
  }, [confirmDelete, openEdit]);

  return (
    <div className="flex flex-col w-full font-sans">
      {contextHolder}

      <div className="flex items-start justify-between gap-3 mb-3">
        <header>
          <p className="m-0 text-sm text-[#9a9896] font-medium">Admin</p>
          <h1 className="mt-1 m-0 text-2xl sm:text-[28px] font-bold text-[#1a1917] font-serif tracking-tight leading-tight">
            View Venues
          </h1>
        </header>

        <div className="flex items-center gap-2">
          <Button onClick={refresh} type="default">
            Refresh
          </Button>
          <Button onClick={openCreate} type="primary">
            Add Venue
          </Button>
        </div>
      </div>

      <AppTable
        columns={columns}
        dataSource={venues}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Modal
        open={modalOpen}
        onCancel={closeModal}
        centered
        title={modalMode === "create" ? "Add Venue" : "Edit Venue"}
        okText={modalMode === "create" ? "Create" : "Save"}
        confirmLoading={submitting}
        onOk={handleSubmit}
        destroyOnClose={false}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item
            label="Venue Name"
            name="name"
            rules={[{ required: true, message: "Venue name is required" }]}
          >
            <Input placeholder="Eg: Grand Hall" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
